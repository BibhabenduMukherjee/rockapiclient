import { substituteTemplate } from '../hooks/useEnvironments';

// Interface for code generation configuration
export interface CodeGenConfig {
  method: string;
  url: string;
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
  urlEncoded: Array<{key: string, value: string, enabled: boolean}>;
  activeEnvVars: Record<string, string>;
}

export type CodeGenType = 'curl' | 'fetch' | 'axios' | 'httpie';

/**
 * Generates code for the specified format
 * @param config - Code generation configuration
 * @param type - Code generation type
 * @returns Generated code string
 */
export const generateCode = (config: CodeGenConfig, type: CodeGenType): string => {
  const {
    method,
    url,
    headers,
    auth,
    bodyType,
    rawBodyType,
    rawBody,
    urlEncoded,
    activeEnvVars
  } = config;

  // Build headers from the modular system
  const substitutedHeaders = buildHeadersForCodeGen(headers, auth, activeEnvVars);
  
  // Build body for code generation
  const substitutedBody = buildBodyForCodeGen(bodyType, rawBodyType, rawBody, urlEncoded, activeEnvVars);

  // Build constructed URL
  const constructedUrl = buildConstructedUrlForCodeGen(url, activeEnvVars);

  switch (type) {
    case 'curl':
      return generateCurlCode(method, constructedUrl, substitutedHeaders, substitutedBody);
    
    case 'fetch':
      return generateFetchCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    
    case 'axios':
      return generateAxiosCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    
    case 'httpie':
      return generateHttpieCode(method, constructedUrl, substitutedHeaders, substitutedBody);
    
    default:
      return '';
  }
};

/**
 * Builds headers for code generation
 */
const buildHeadersForCodeGen = (
  headers: Array<{key: string, value: string, enabled: boolean}>,
  auth: CodeGenConfig['auth'],
  activeEnvVars: Record<string, string>
): Record<string, string> => {
  let substitutedHeaders: Record<string, string> = {};
  
  // Add headers from HeadersTab
  headers.forEach(header => {
    if (header.enabled && header.key && header.value) {
      substitutedHeaders[header.key] = substituteTemplate(header.value, activeEnvVars);
    }
  });
  
  // Add authorization headers
  if (auth.type === 'apiKey' && auth.apiKey.key && auth.apiKey.value) {
    if (auth.apiKey.addTo === 'header') {
      substitutedHeaders[auth.apiKey.key] = substituteTemplate(auth.apiKey.value, activeEnvVars);
    }
  } else if (auth.type === 'bearer' && auth.bearer.token) {
    substitutedHeaders['Authorization'] = `Bearer ${substituteTemplate(auth.bearer.token, activeEnvVars)}`;
  } else if (auth.type === 'basic' && auth.basic.username && auth.basic.password) {
    const credentials = btoa(`${auth.basic.username}:${auth.basic.password}`);
    substitutedHeaders['Authorization'] = `Basic ${credentials}`;
  } else if (auth.type === 'jwt' && auth.jwt.token) {
    substitutedHeaders['Authorization'] = `Bearer ${substituteTemplate(auth.jwt.token, activeEnvVars)}`;
  }
  
  return substitutedHeaders;
};

/**
 * Builds body for code generation
 */
const buildBodyForCodeGen = (
  bodyType: string,
  rawBodyType: string,
  rawBody: string,
  urlEncoded: Array<{key: string, value: string, enabled: boolean}>,
  activeEnvVars: Record<string, string>
): string => {
  if (bodyType === 'raw' && rawBody) {
    return substituteTemplate(rawBody, activeEnvVars);
  } else if (bodyType === 'x-www-form-urlencoded' && urlEncoded.length > 0) {
    const params = new URLSearchParams();
    urlEncoded.forEach(item => {
      if (item.enabled && item.key && item.value) {
        params.append(item.key, item.value);
      }
    });
    return params.toString();
  }
  return '';
};

/**
 * Builds constructed URL for code generation
 */
const buildConstructedUrlForCodeGen = (url: string, activeEnvVars: Record<string, string>): string => {
  return substituteTemplate(url || '', activeEnvVars);
};

/**
 * Generates cURL command
 */
const generateCurlCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string => {
  let curlCmd = `curl -X ${method} "${url}"`;
  Object.entries(headers).forEach(([k, v]) => {
    curlCmd += ` \\\n  -H "${k}: ${v}"`;
  });
  if (body && method !== 'GET' && method !== 'DELETE') {
    curlCmd += ` \\\n  -d '${body}'`;
  }
  return curlCmd;
};

/**
 * Generates JavaScript fetch code
 */
const generateFetchCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `body: ${rawBodyType === 'json' ? JSON.stringify(JSON.parse(body), null, 2) : `'${body}'`},` 
    : '';
  
  return `fetch("${url}", {
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 2)},
  ${bodyParam}
});`;
};

/**
 * Generates Axios code
 */
const generateAxiosCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `data: ${rawBodyType === 'json' ? JSON.stringify(JSON.parse(body), null, 2) : `'${body}'`},` 
    : '';
  
  return `axios.${method.toLowerCase()}("${url}", {
  headers: ${JSON.stringify(headers, null, 2)},
  ${bodyParam}
});`;
};

/**
 * Generates HTTPie command
 */
const generateHttpieCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): string => {
  let httpieCmd = `http ${method} "${url}"`;
  Object.entries(headers).forEach(([k, v]) => {
    httpieCmd += ` "${k}:${v}"`;
  });
  if (body && method !== 'GET' && method !== 'DELETE') {
    httpieCmd += ` <<< '${body}'`;
  }
  return httpieCmd;
};
