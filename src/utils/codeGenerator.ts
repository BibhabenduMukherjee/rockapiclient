import { substituteTemplate } from '../hooks/useEnvironments';

// Helper function to safely parse JSON and format it
const safeJsonStringify = (body: string, rawBodyType: string, quoteChar: string = '"'): string => {
  if (rawBodyType === 'json') {
    try {
      return safeJsonStringify(body, rawBodyType);
    } catch (e) {
      // If JSON parsing fails, escape the string and return as string literal
      const escapedBody = body.replace(new RegExp(quoteChar, 'g'), `\\${quoteChar}`);
      return `${quoteChar}${escapedBody}${quoteChar}`;
    }
  } else {
    const escapedBody = body.replace(new RegExp(quoteChar, 'g'), `\\${quoteChar}`);
    return `${quoteChar}${escapedBody}${quoteChar}`;
  }
};

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

export type CodeGenType = 
  // Command Line
  | 'curl' | 'httpie'
  // JavaScript/Web
  | 'fetch' | 'axios' | 'react' | 'vue' | 'angular'
  // Backend Languages
  | 'python' | 'java' | 'csharp' | 'go' | 'php' | 'ruby' | 'rust'
  // Mobile
  | 'swift' | 'kotlin' | 'dart'
  // Data Science
  | 'r'
  // DevOps
  | 'powershell';

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
    // Command Line
    case 'curl':
      return generateCurlCode(method, constructedUrl, substitutedHeaders, substitutedBody);
    case 'httpie':
      return generateHttpieCode(method, constructedUrl, substitutedHeaders, substitutedBody);
    
    // JavaScript/Web
    case 'fetch':
      return generateFetchCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'axios':
      return generateAxiosCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'react':
      return generateReactCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'vue':
      return generateVueCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'angular':
      return generateAngularCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    
    // Backend Languages
    case 'python':
      return generatePythonCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'java':
      return generateJavaCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'csharp':
      return generateCSharpCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'go':
      return generateGoCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'php':
      return generatePhpCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'ruby':
      return generateRubyCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'rust':
      return generateRustCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    
    // Mobile
    case 'swift':
      return generateSwiftCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'kotlin':
      return generateKotlinCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    case 'dart':
      return generateDartCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    
    // Data Science
    case 'r':
      return generateRCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    
    // DevOps
    case 'powershell':
      return generatePowerShellCode(method, constructedUrl, substitutedHeaders, substitutedBody, rawBodyType);
    
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
    ? `body: ${safeJsonStringify(body, rawBodyType)},` 
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
    ? `data: ${safeJsonStringify(body, rawBodyType, "'")},` 
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

// ===== NEW LANGUAGE GENERATORS =====

/**
 * Generates React (hooks) code
 */
const generateReactCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `body: ${safeJsonStringify(body, rawBodyType, "'")},` 
    : '';
  
  return `import { useState, useEffect } from 'react';

const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("${url}", {
        method: "${method}",
        headers: ${JSON.stringify(headers, null, 8)},
        ${bodyParam}
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

export default useApi;`;
};

/**
 * Generates Python (requests) code
 */
const generatePythonCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `data=${safeJsonStringify(body, rawBodyType, "'")},` 
    : '';
  
  return `import requests
import json

url = "${url}"
headers = ${JSON.stringify(headers, null, 4)}

try:
    response = requests.${method.toLowerCase()}(url, headers=headers${bodyParam ? `, ${bodyParam}` : ''})
    response.raise_for_status()
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")`;
};

/**
 * Generates Java (Spring Boot) code
 */
const generateJavaCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `String requestBody = ${safeJsonStringify(body, rawBodyType)};` 
    : '';
  
  return `import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;

@RestController
public class ApiController {
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public ResponseEntity<String> makeRequest() {
        String url = "${url}";
        
        HttpHeaders headers = new HttpHeaders();
        ${Object.entries(headers).map(([k, v]) => `headers.set("${k}", "${v}");`).join('\n        ')}
        
        ${bodyParam ? `${bodyParam}\n        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);` : 'HttpEntity<String> entity = new HttpEntity<>(headers);'}
        
        ResponseEntity<String> response = restTemplate.exchange(
            url, 
            HttpMethod.${method.toUpperCase()}, 
            entity, 
            String.class
        );
        
        return response;
    }
}`;
};

/**
 * Generates Go code
 */
const generateGoCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `body := strings.NewReader(\`${body}\`)` 
    : '';
  
  return `package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "strings"
)

func main() {
    url := "${url}"
    
    ${bodyParam ? `${bodyParam}\n    req, err := http.NewRequest("${method.toUpperCase()}", url, body)` : `req, err := http.NewRequest("${method.toUpperCase()}", url, nil)`}
    if err != nil {
        panic(err)
    }
    
    ${Object.entries(headers).map(([k, v]) => `req.Header.Set("${k}", "${v}")`).join('\n    ')}
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        panic(err)
    }
    
    fmt.Printf("Status: %s\\n", resp.Status)
    fmt.Printf("Response: %s\\n", string(body))
}`;
};

/**
 * Generates Swift (iOS) code
 */
const generateSwiftCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `request.httpBody = ${safeJsonStringify(body, rawBodyType)}.data(using: .utf8)` 
    : '';
  
  return `import Foundation

func makeRequest() {
    guard let url = URL(string: "${url}") else { return }
    
    var request = URLRequest(url: url)
    request.httpMethod = "${method.toUpperCase()}"
    
    ${Object.entries(headers).map(([k, v]) => `request.setValue("${v}", forHTTPHeaderField: "${k}")`).join('\n    ')}
    
    ${bodyParam ? `${bodyParam}` : ''}
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("Error: \\(error)")
            return
        }
        
        if let httpResponse = response as? HTTPURLResponse {
            print("Status: \\(httpResponse.statusCode)")
        }
        
        if let data = data {
            let json = try? JSONSerialization.jsonObject(with: data)
            print("Response: \\(json ?? "No data")")
        }
    }.resume()
}`;
};

/**
 * Generates Vue.js code
 */
const generateVueCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `body: ${safeJsonStringify(body, rawBodyType, "'")},` 
    : '';
  
  return `<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>{{ data }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const data = ref(null);
const loading = ref(false);
const error = ref(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await fetch("${url}", {
      method: "${method}",
      headers: ${JSON.stringify(headers, null, 6)},
      ${bodyParam}
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}\`);
    }
    
    data.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>`;
};

/**
 * Generates Angular code
 */
const generateAngularCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `body: ${safeJsonStringify(body, rawBodyType, "'")},` 
    : '';
  
  return `import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  fetchData(): Observable<any> {
    const headers = new HttpHeaders(${JSON.stringify(headers, null, 4)});
    
    return this.http.${method.toLowerCase()}("${url}", {
      headers,
      ${bodyParam}
    });
  }
}`;
};

/**
 * Generates C# (.NET) code
 */
const generateCSharpCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `var content = new StringContent(${safeJsonStringify(body, rawBodyType)}, Encoding.UTF8, "application/json");` 
    : '';
  
  return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

public class ApiClient
{
    private readonly HttpClient _httpClient;
    
    public ApiClient()
    {
        _httpClient = new HttpClient();
    }
    
    public async Task<string> MakeRequest()
    {
        var url = "${url}";
        
        using var request = new HttpRequestMessage(HttpMethod.${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}, url);
        
        ${Object.entries(headers).map(([k, v]) => `request.Headers.Add("${k}", "${v}");`).join('\n        ')}
        
        ${bodyParam ? `${bodyParam}\n        request.Content = content;` : ''}
        
        try
        {
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            return responseContent;
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }
}`;
};

/**
 * Generates PHP code
 */
const generatePhpCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `'body' => ${safeJsonStringify(body, rawBodyType, "'")},` 
    : '';
  
  return `<?php

$url = "${url}";
$headers = ${JSON.stringify(headers, null, 4)};

$options = [
    'http' => [
        'method' => '${method.toUpperCase()}',
        'header' => implode("\\r\\n", array_map(function($k, $v) { return "$k: $v"; }, array_keys($headers), $headers)),
        ${bodyParam ? `${bodyParam}` : ''}
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "Error: " . error_get_last()['message'];
} else {
    echo "Response: " . $result;
}
?>`;
};

/**
 * Generates Ruby code
 */
const generateRubyCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `body: ${safeJsonStringify(body, rawBodyType, "'")},` 
    : '';
  
  return `require 'net/http'
require 'json'
require 'uri'

url = URI("${url}")
http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true if url.scheme == 'https'

request = Net::HTTP::${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}.new(url)
${Object.entries(headers).map(([k, v]) => `request['${k}'] = '${v}'`).join('\n')}

${bodyParam ? `request.body = ${safeJsonStringify(body, rawBodyType, "'")}` : ''}

begin
  response = http.request(request)
  puts "Status: #{response.code}"
  puts "Response: #{response.body}"
rescue => e
  puts "Error: #{e.message}"
end`;
};

/**
 * Generates Rust code
 */
const generateRustCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `let body = ${safeJsonStringify(body, rawBodyType)}.to_string();` 
    : '';
  
  return `use reqwest;
use serde_json::Value;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let url = "${url}";
    
    ${bodyParam ? `${bodyParam}\n    let response = client.${method.toLowerCase()}(url).body(body)` : `let response = client.${method.toLowerCase()}(url)`}
        ${Object.entries(headers).map(([k, v]) => `.header("${k}", "${v}")`).join('')}
        .send()
        .await?;
    
    let status = response.status();
    let text = response.text().await?;
    
    println!("Status: {}", status);
    println!("Response: {}", text);
    
    Ok(())
}`;
};

/**
 * Generates Kotlin (Android) code
 */
const generateKotlinCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `val requestBody = ${safeJsonStringify(body, rawBodyType)}.toRequestBody("application/json".toMediaType())` 
    : '';
  
  return `import okhttp3.*
import java.io.IOException

class ApiClient {
    private val client = OkHttpClient()
    
    fun makeRequest() {
        val url = "${url}"
        val requestBuilder = Request.Builder().url(url)
        
        ${Object.entries(headers).map(([k, v]) => `requestBuilder.addHeader("${k}", "${v}")`).join('\n        ')}
        
        ${bodyParam ? `${bodyParam}\n        requestBuilder.${method.toLowerCase()}(requestBody)` : `requestBuilder.${method.toLowerCase()}()`}
        
        val request = requestBuilder.build()
        
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                println("Error: \${e.message}")
            }
            
            override fun onResponse(call: Call, response: Response) {
                println("Status: \${response.code}")
                println("Response: \${response.body?.string()}")
            }
        })
    }
}`;
};

/**
 * Generates Dart (Flutter) code
 */
const generateDartCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `'body': ${safeJsonStringify(body, rawBodyType, "'")},` 
    : '';
  
  return `import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static Future<void> makeRequest() async {
    final url = Uri.parse("${url}");
    
    final headers = ${JSON.stringify(headers, null, 4)};
    
    try {
      final response = await http.${method.toLowerCase()}(url, 
        headers: headers,
        ${bodyParam ? `${bodyParam}` : ''}
      );
      
      print('Status: \${response.statusCode}');
      print('Response: \${response.body}');
      
    } catch (e) {
      print('Error: \$e');
    }
  }
}`;
};

/**
 * Generates R code
 */
const generateRCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `body = ${safeJsonStringify(body, rawBodyType, "'")},` 
    : '';
  
  return `library(httr)
library(jsonlite)

url <- "${url}"
headers <- ${JSON.stringify(headers, null, 4)}

tryCatch({
  response <- ${method.toUpperCase()}(url, 
    add_headers(.headers = headers),
    ${bodyParam ? `${bodyParam}` : ''}
  )
  
  print(paste("Status:", status_code(response)))
  print(paste("Response:", content(response, "text")))
  
}, error = function(e) {
  print(paste("Error:", e$message))
})`;
};

/**
 * Generates PowerShell code
 */
const generatePowerShellCode = (
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  rawBodyType: string
): string => {
  const bodyParam = body && method !== 'GET' && method !== 'DELETE' 
    ? `-Body '${body}'` 
    : '';
  
  return `$url = "${url}"
$headers = @{
${Object.entries(headers).map(([k, v]) => `    "${k}" = "${v}"`).join('\n')}
}

try {
    $response = Invoke-RestMethod -Uri $url -Method ${method.toUpperCase()} -Headers $headers ${bodyParam ? `${bodyParam}` : ''}
    Write-Host "Response: $response"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}`;
};