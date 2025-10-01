import { substituteTemplate } from '../hooks/useEnvironments';
import { HistoryItem } from '../types';

// Interface for request configuration
export interface RequestConfig {
  method: string;
  url: string;
  paramsJson: string;
  headers: Array<{key: string, value: string, enabled: boolean}>;
  auth: {
    type: string;
    apiKey: { key: string; value: string; addTo: string };
    bearer: { token: string };
    basic: { username: string; password: string };
    jwt: { token: string };
  };
  bodyType: string;
  rawBodyType: string;
  rawBody: string;
  formData: Array<{key: string, value: string, enabled: boolean}>;
  urlEncoded: Array<{key: string, value: string, enabled: boolean}>;
  activeEnvVars: Record<string, string>;
}

// Interface for response metadata
export interface ResponseMeta {
  status: number | null;
  durationMs: number;
  headers: Record<string, string>;
  size: number;
}

/**
 * Sends an HTTP request with the given configuration
 * @param config - Request configuration object
 * @param signal - AbortSignal for request cancellation
 * @returns Promise with response data and metadata
 */
export const sendRequest = async (
  config: RequestConfig,
  signal: AbortSignal
): Promise<{
  responseText: string;
  responseMeta: ResponseMeta;
  historyItem: HistoryItem;
}> => {
  const {
    method,
    url,
    paramsJson,
    headers,
    auth,
    bodyType,
    rawBodyType,
    rawBody,
    formData,
    urlEncoded,
    activeEnvVars
  } = config;

  // Build constructed URL with query parameters
  const constructedUrl = buildConstructedUrl(url, paramsJson, activeEnvVars);
  
  // Build headers from the modular system
  const parsedHeaders = buildHeaders(headers, auth, activeEnvVars);
  
  // Build request body
  const bodyToSend = buildRequestBody(method, bodyType, rawBodyType, rawBody, formData, urlEncoded, parsedHeaders, activeEnvVars);

  const started = performance.now();
  
  try {
    const res = await fetch(constructedUrl, {
      method,
      headers: parsedHeaders,
      body: bodyToSend,
      signal,
    });
    
    const durationMs = Math.round(performance.now() - started);
    const resText = await res.text();
    const resHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => { resHeaders[k] = v; });
    
    const responseMeta: ResponseMeta = { 
      status: res.status, 
      durationMs, 
      headers: resHeaders, 
      size: new Blob([resText]).size 
    };

    const historyItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      method: method as any,
      url: constructedUrl,
      status: res.status,
      durationMs,
      timestamp: Date.now(),
      request: {
        params: JSON.parse(paramsJson || '{}') || {},
        headers: parsedHeaders,
        body: rawBody,
      },
      response: { headers: resHeaders, body: resText },
    };

    return {
      responseText: resText,
      responseMeta,
      historyItem
    };
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - started);
    
    if (err?.name === 'AbortError') {
      return {
        responseText: 'Request cancelled',
        responseMeta: { status: null, durationMs, headers: {}, size: 0 },
        historyItem: createErrorHistoryItem(method, constructedUrl, durationMs, paramsJson, parsedHeaders, rawBody)
      };
    } else {
      return {
        responseText: String(err?.message || err),
        responseMeta: { status: null, durationMs, headers: {}, size: 0 },
        historyItem: createErrorHistoryItem(method, constructedUrl, durationMs, paramsJson, parsedHeaders, rawBody)
      };
    }
  }
};

/**
 * Builds the constructed URL with query parameters and variable substitution
 */
const buildConstructedUrl = (url: string, paramsJson: string, activeEnvVars: Record<string, string>): string => {
  try {
    const base = substituteTemplate(url || '', activeEnvVars);
    const parsedParams = JSON.parse(paramsJson || '{}');
    const substitutedParams = Object.fromEntries(
      Object.entries(parsedParams || {}).map(([k, v]) => [k, substituteTemplate(String(v), activeEnvVars)])
    );
    const u = new URL(base, base.startsWith('http') ? undefined : 'http://placeholder');
    Object.entries(substitutedParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) u.searchParams.set(String(k), String(v));
    });
    const result = u.toString();
    return base.startsWith('http') ? result : result.replace('http://placeholder', '');
  } catch {
    return url;
  }
};

/**
 * Builds headers from the modular system including authorization
 */
const buildHeaders = (
  headers: Array<{key: string, value: string, enabled: boolean}>,
  auth: RequestConfig['auth'],
  activeEnvVars: Record<string, string>
): Record<string, string> => {
  let parsedHeaders: Record<string, string> = {};
  
  // Add headers from HeadersTab
  headers.forEach(header => {
    if (header.enabled && header.key && header.value) {
      parsedHeaders[header.key] = substituteTemplate(header.value, activeEnvVars);
    }
  });
  
  // Add authorization headers
  if (auth.type === 'apiKey' && auth.apiKey.key && auth.apiKey.value) {
    if (auth.apiKey.addTo === 'header') {
      parsedHeaders[auth.apiKey.key] = substituteTemplate(auth.apiKey.value, activeEnvVars);
    }
  } else if (auth.type === 'bearer' && auth.bearer.token) {
    parsedHeaders['Authorization'] = `Bearer ${substituteTemplate(auth.bearer.token, activeEnvVars)}`;
  } else if (auth.type === 'basic' && auth.basic.username && auth.basic.password) {
    const credentials = btoa(`${auth.basic.username}:${auth.basic.password}`);
    parsedHeaders['Authorization'] = `Basic ${credentials}`;
  } else if (auth.type === 'jwt' && auth.jwt.token) {
    parsedHeaders['Authorization'] = `Bearer ${substituteTemplate(auth.jwt.token, activeEnvVars)}`;
  }
  
  return parsedHeaders;
};

/**
 * Builds the request body based on body type
 */
const buildRequestBody = (
  method: string,
  bodyType: string,
  rawBodyType: string,
  rawBody: string,
  formData: Array<{key: string, value: string | File, enabled: boolean, type?: 'text' | 'file'}>,
  urlEncoded: Array<{key: string, value: string, enabled: boolean}>,
  parsedHeaders: Record<string, string>,
  activeEnvVars: Record<string, string>
): BodyInit | undefined => {
  if (method === 'GET' || method === 'DELETE') {
    return undefined;
  }

  if (bodyType === 'raw' && rawBody) {
    const substitutedBody = substituteTemplate(rawBody, activeEnvVars);
    if (rawBodyType === 'json' && !parsedHeaders['Content-Type']) {
      parsedHeaders['Content-Type'] = 'application/json';
    } else if (rawBodyType === 'xml' && !parsedHeaders['Content-Type']) {
      parsedHeaders['Content-Type'] = 'application/xml';
    } else if (rawBodyType === 'html' && !parsedHeaders['Content-Type']) {
      parsedHeaders['Content-Type'] = 'text/html';
    }
    return substitutedBody;
  } else if (bodyType === 'form-data' && formData.length > 0) {
    const formDataObj = new FormData();
    formData.forEach(item => {
      if (item.enabled && item.key && item.value) {
        if (item.type === 'file' && item.value instanceof File) {
          formDataObj.append(item.key, item.value);
        } else {
          formDataObj.append(item.key, item.value as string);
        }
      }
    });
    // Don't set Content-Type for FormData, let browser set it with boundary
    delete parsedHeaders['Content-Type'];
    return formDataObj;
  } else if (bodyType === 'x-www-form-urlencoded' && urlEncoded.length > 0) {
    const params = new URLSearchParams();
    urlEncoded.forEach(item => {
      if (item.enabled && item.key && item.value) {
        params.append(item.key, item.value);
      }
    });
    if (!parsedHeaders['Content-Type']) {
      parsedHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    return params.toString();
  }

  return undefined;
};

/**
 * Creates a history item for error cases
 */
const createErrorHistoryItem = (
  method: string,
  url: string,
  durationMs: number,
  paramsJson: string,
  parsedHeaders: Record<string, string>,
  rawBody: string
): HistoryItem => ({
  id: `hist-${Date.now()}`,
  method: method as any,
  url,
  status: null,
  durationMs,
  timestamp: Date.now(),
  request: {
    params: JSON.parse(paramsJson || '{}') || {},
    headers: parsedHeaders,
    body: rawBody,
  },
  response: null,
});
