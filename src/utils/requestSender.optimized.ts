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

// Interface for request result
export interface RequestResult {
  responseText: string;
  responseMeta: ResponseMeta;
  historyItem: HistoryItem;
}

// Constants for better maintainability
const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS'
} as const;

const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  XML: 'application/xml',
  HTML: 'text/html'
} as const;

/**
 * Sends an HTTP request with the given configuration
 * @param config - Request configuration object
 * @param signal - AbortSignal for request cancellation
 * @returns Promise with response data and metadata
 */
export const sendRequest = async (
  config: RequestConfig,
  signal: AbortSignal
): Promise<RequestResult> => {
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

  try {
    // Build constructed URL with query parameters
    const constructedUrl = buildConstructedUrl(url, paramsJson, activeEnvVars);
    
    // Build headers from the modular system
    const parsedHeaders = buildHeaders(headers, auth, activeEnvVars);
    
    // Build request body
    const bodyToSend = buildRequestBody(
      method, 
      bodyType, 
      rawBodyType, 
      rawBody, 
      formData, 
      urlEncoded, 
      parsedHeaders, 
      activeEnvVars
    );

    const started = performance.now();
    
    const response = await fetch(constructedUrl, {
      method,
      headers: parsedHeaders,
      body: bodyToSend,
      signal,
    });
    
    const durationMs = Math.round(performance.now() - started);
    const responseText = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => { 
      responseHeaders[key] = value; 
    });
    
    const responseMeta: ResponseMeta = { 
      status: response.status, 
      durationMs, 
      headers: responseHeaders, 
      size: new Blob([responseText]).size 
    };

    const historyItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      method: method as any,
      url: constructedUrl,
      status: response.status,
      durationMs,
      timestamp: Date.now(),
      request: {
        params: JSON.parse(paramsJson || '{}') || {},
        headers: parsedHeaders,
        body: rawBody,
      },
      response: { headers: responseHeaders, body: responseText },
    };

    return {
      responseText,
      responseMeta,
      historyItem
    };
  } catch (error: any) {
    const durationMs = Math.round(performance.now() - performance.now());
    
    if (error?.name === 'AbortError') {
      return createErrorResult(method, url, durationMs, paramsJson, headers, rawBody, 'Request cancelled');
    } else {
      return createErrorResult(method, url, durationMs, paramsJson, headers, rawBody, String(error?.message || error));
    }
  }
};

/**
 * Builds the constructed URL with query parameters and variable substitution
 */
function buildConstructedUrl(url: string, paramsJson: string, activeEnvVars: Record<string, string>): string {
  const substitutedUrl = substituteTemplate(url, activeEnvVars);
  
  try {
    const params = JSON.parse(paramsJson || '{}');
    const urlObj = new URL(substitutedUrl);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlObj.searchParams.append(key, String(value));
      }
    });
    
    return urlObj.toString();
  } catch {
    return substitutedUrl;
  }
}

/**
 * Builds headers from the modular system
 */
function buildHeaders(
  headers: Array<{key: string, value: string, enabled: boolean}>,
  auth: RequestConfig['auth'],
  activeEnvVars: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};
  
  // Add regular headers
  headers.forEach(({ key, value, enabled }) => {
    if (enabled && key.trim()) {
      result[key.trim()] = substituteTemplate(value, activeEnvVars);
    }
  });
  
  // Add authentication headers
  if (auth.type === 'basic' && auth.basic.username && auth.basic.password) {
    const credentials = btoa(`${auth.basic.username}:${auth.basic.password}`);
    result['Authorization'] = `Basic ${credentials}`;
  } else if (auth.type === 'bearer' && auth.bearer.token) {
    result['Authorization'] = `Bearer ${substituteTemplate(auth.bearer.token, activeEnvVars)}`;
  } else if (auth.type === 'jwt' && auth.jwt.token) {
    result['Authorization'] = `Bearer ${substituteTemplate(auth.jwt.token, activeEnvVars)}`;
  } else if (auth.type === 'apiKey' && auth.apiKey.key && auth.apiKey.value) {
    const headerName = auth.apiKey.key;
    const headerValue = substituteTemplate(auth.apiKey.value, activeEnvVars);
    
    if (auth.apiKey.addTo === 'header') {
      result[headerName] = headerValue;
    }
  }
  
  return result;
}

/**
 * Builds request body based on type
 */
function buildRequestBody(
  method: string,
  bodyType: string,
  rawBodyType: string,
  rawBody: string,
  formData: Array<{key: string, value: string, enabled: boolean}>,
  urlEncoded: Array<{key: string, value: string, enabled: boolean}>,
  headers: Record<string, string>,
  activeEnvVars: Record<string, string>
): string | FormData | URLSearchParams | null {
  if (bodyType === 'none' || method === HTTP_METHODS.GET) {
    return null;
  }
  
  if (bodyType === 'raw') {
    const substitutedBody = substituteTemplate(rawBody, activeEnvVars);
    
    if (rawBodyType === 'json') {
      headers['Content-Type'] = CONTENT_TYPES.JSON;
    } else if (rawBodyType === 'xml') {
      headers['Content-Type'] = CONTENT_TYPES.XML;
    } else if (rawBodyType === 'html') {
      headers['Content-Type'] = CONTENT_TYPES.HTML;
    } else {
      headers['Content-Type'] = CONTENT_TYPES.TEXT;
    }
    
    return substitutedBody;
  }
  
  if (bodyType === 'form-data') {
    const form = new FormData();
    formData.forEach(({ key, value, enabled }) => {
      if (enabled && key.trim()) {
        form.append(key.trim(), substituteTemplate(value, activeEnvVars));
      }
    });
    return form;
  }
  
  if (bodyType === 'url-encoded') {
    const params = new URLSearchParams();
    urlEncoded.forEach(({ key, value, enabled }) => {
      if (enabled && key.trim()) {
        params.append(key.trim(), substituteTemplate(value, activeEnvVars));
      }
    });
    headers['Content-Type'] = CONTENT_TYPES.URL_ENCODED;
    return params;
  }
  
  return null;
}

/**
 * Creates error result for failed requests
 */
function createErrorResult(
  method: string,
  url: string,
  durationMs: number,
  paramsJson: string,
  headers: Record<string, string>,
  rawBody: string,
  errorMessage: string
): RequestResult {
  const historyItem: HistoryItem = {
    id: `hist-${Date.now()}`,
    method: method as any,
    url,
    status: null,
    durationMs,
    timestamp: Date.now(),
    request: {
      params: JSON.parse(paramsJson || '{}') || {},
      headers,
      body: rawBody,
    },
    response: null,
  };

  return {
    responseText: errorMessage,
    responseMeta: { status: null, durationMs, headers: {}, size: 0 },
    historyItem
  };
}
