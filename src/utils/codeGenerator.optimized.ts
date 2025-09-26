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
function buildHeadersForCodeGen(
  headers: Array<{key: string, value: string, enabled: boolean}>,
  auth: CodeGenConfig['auth'],
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
 * Builds body for code generation
 */
function buildBodyForCodeGen(
  bodyType: string,
  rawBodyType: string,
  rawBody: string,
  urlEncoded: Array<{key: string, value: string, enabled: boolean}>,
  activeEnvVars: Record<string, string>
): string | null {
  if (bodyType === 'none') {
    return null;
  }
  
  if (bodyType === 'raw') {
    return substituteTemplate(rawBody, activeEnvVars);
  }
  
  if (bodyType === 'url-encoded') {
    const params = new URLSearchParams();
    urlEncoded.forEach(({ key, value, enabled }) => {
      if (enabled && key.trim()) {
        params.append(key.trim(), substituteTemplate(value, activeEnvVars));
      }
    });
    return params.toString();
  }
  
  return null;
}

/**
 * Builds constructed URL for code generation
 */
function buildConstructedUrlForCodeGen(url: string, activeEnvVars: Record<string, string>): string {
  return substituteTemplate(url, activeEnvVars);
}

/**
 * Generates cURL command
 */
function generateCurlCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | null
): string {
  let curl = `curl -X ${method.toUpperCase()}`;
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += ` \\\n  -H "${key}: ${value}"`;
  });
  
  // Add body
  if (body) {
    curl += ` \\\n  -d '${body}'`;
  }
  
  curl += ` \\\n  "${url}"`;
  
  return curl;
}

/**
 * Generates fetch code
 */
function generateFetchCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | null,
  rawBodyType: string
): string {
  const options: any = {
    method: method.toUpperCase(),
    headers: headers
  };
  
  if (body) {
    options.body = body;
  }
  
  return `fetch('${url}', ${JSON.stringify(options, null, 2)})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
}

/**
 * Generates axios code
 */
function generateAxiosCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | null,
  rawBodyType: string
): string {
  const config: any = {
    method: method.toLowerCase(),
    url: `'${url}'`,
    headers: headers
  };
  
  if (body) {
    config.data = body;
  }
  
  return `axios(${JSON.stringify(config, null, 2)})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));`;
}

/**
 * Generates HTTPie code
 */
function generateHttpieCode(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | null
): string {
  let httpie = `http ${method.toUpperCase()} ${url}`;
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    httpie += ` ${key}:${value}`;
  });
  
  // Add body
  if (body) {
    httpie += ` <<< '${body}'`;
  }
  
  return httpie;
}
