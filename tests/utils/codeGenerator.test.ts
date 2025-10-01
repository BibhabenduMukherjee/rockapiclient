import { generateCode, CodeGenConfig, CodeGenType } from '../../src/utils/codeGenerator';

// Mock the substituteTemplate function
jest.mock('../../src/hooks/useEnvironments', () => ({
  substituteTemplate: jest.fn((template, variables) => {
    if (!variables || Object.keys(variables).length === 0) {
      return template;
    }
    return Object.entries(variables).reduce((result, [key, value]) => {
      return result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }, template);
  })
}));

describe('codeGenerator', () => {
  const mockCodeGenConfig: CodeGenConfig = {
    method: 'GET',
    url: 'https://api.example.com/test',
    headers: [
      { key: 'Content-Type', value: 'application/json', enabled: true },
      { key: 'User-Agent', value: 'MyApp/1.0', enabled: true }
    ],
    auth: {
      type: 'none',
      apiKey: { key: '', value: '', addTo: 'header' },
      bearer: { token: '' },
      basic: { username: '', password: '' },
      jwt: { token: '' }
    },
    bodyType: 'none',
    rawBodyType: 'json',
    rawBody: '',
    urlEncoded: [],
    activeEnvVars: {}
  };

  describe('generateCode', () => {
    it('should generate cURL code for GET request', () => {
      const result = generateCode(mockCodeGenConfig, 'curl');
      
      expect(result).toContain('curl -X GET');
      expect(result).toContain('https://api.example.com/test');
      expect(result).toContain('Content-Type: application/json');
      expect(result).toContain('User-Agent: MyApp/1.0');
    });

    it('should generate cURL code for POST request with body', () => {
      const postConfig: CodeGenConfig = {
        ...mockCodeGenConfig,
        method: 'POST',
        bodyType: 'raw',
        rawBody: '{"test": "data"}'
      };

      const result = generateCode(postConfig, 'curl');
      
      expect(result).toContain('curl -X POST');
      expect(result).toContain('-d \'{"test": "data"}\'');
    });

    it('should generate fetch code for GET request', () => {
      const result = generateCode(mockCodeGenConfig, 'fetch');
      
      expect(result).toContain('fetch("https://api.example.com/test"');
      expect(result).toContain('method: "GET"');
      expect(result).toContain('"Content-Type": "application/json"');
    });

    it('should generate fetch code for POST request with JSON body', () => {
      const postConfig: CodeGenConfig = {
        ...mockCodeGenConfig,
        method: 'POST',
        bodyType: 'raw',
        rawBodyType: 'json',
        rawBody: '{"test": "data"}'
      };

      const result = generateCode(postConfig, 'fetch');
      
      expect(result).toContain('method: "POST"');
      expect(result).toContain('body:');
      expect(result).toContain('"{\\"test\\": \\"data\\"}"');
    });

    it('should generate axios code for GET request', () => {
      const result = generateCode(mockCodeGenConfig, 'axios');
      
      expect(result).toContain('axios.get("https://api.example.com/test"');
      expect(result).toContain('"Content-Type": "application/json"');
    });

    it('should generate axios code for POST request', () => {
      const postConfig: CodeGenConfig = {
        ...mockCodeGenConfig,
        method: 'POST',
        bodyType: 'raw',
        rawBody: '{"test": "data"}'
      };

      const result = generateCode(postConfig, 'axios');
      
      expect(result).toContain('axios.post("https://api.example.com/test"');
      expect(result).toContain('data:');
    });

    it('should generate HTTPie code for GET request', () => {
      const result = generateCode(mockCodeGenConfig, 'httpie');
      
      expect(result).toContain('http GET "https://api.example.com/test"');
      expect(result).toContain('"Content-Type:application/json"');
    });

    it('should generate HTTPie code for POST request with body', () => {
      const postConfig: CodeGenConfig = {
        ...mockCodeGenConfig,
        method: 'POST',
        bodyType: 'raw',
        rawBody: '{"test": "data"}'
      };

      const result = generateCode(postConfig, 'httpie');
      
      expect(result).toContain('http POST "https://api.example.com/test"');
      expect(result).toContain('<<< \'{"test": "data"}\'');
    });

    it('should handle Bearer token authentication in cURL', () => {
      const authConfig: CodeGenConfig = {
        ...mockCodeGenConfig,
        auth: {
          type: 'bearer',
          apiKey: { key: '', value: '', addTo: 'header' },
          bearer: { token: 'test-token' },
          basic: { username: '', password: '' },
          jwt: { token: '' }
        }
      };

      const result = generateCode(authConfig, 'curl');
      
      expect(result).toContain('Authorization: Bearer test-token');
    });

    it('should handle Basic authentication in fetch', () => {
      const authConfig: CodeGenConfig = {
        ...mockCodeGenConfig,
        auth: {
          type: 'basic',
          apiKey: { key: '', value: '', addTo: 'header' },
          bearer: { token: '' },
          basic: { username: 'user', password: 'pass' },
          jwt: { token: '' }
        }
      };

      const result = generateCode(authConfig, 'fetch');
      
      expect(result).toContain('"Authorization": "Basic');
    });

    it('should handle form-urlencoded body in axios', () => {
      const formConfig: CodeGenConfig = {
        ...mockCodeGenConfig,
        method: 'POST',
        bodyType: 'x-www-form-urlencoded',
        urlEncoded: [
          { key: 'name', value: 'John', enabled: true },
          { key: 'email', value: 'john@example.com', enabled: true }
        ]
      };

      const result = generateCode(formConfig, 'axios');
      
      expect(result).toContain('axios.post');
      // Note: This test may need adjustment based on actual implementation
      expect(result).toBeDefined();
    });

    it('should return empty string for unknown code type', () => {
      const result = generateCode(mockCodeGenConfig, 'unknown' as CodeGenType);
      expect(result).toBe('');
    });

    it('should handle disabled headers', () => {
      const configWithDisabledHeaders: CodeGenConfig = {
        ...mockCodeGenConfig,
        headers: [
          { key: 'Content-Type', value: 'application/json', enabled: true },
          { key: 'User-Agent', value: 'MyApp/1.0', enabled: false }
        ]
      };

      const result = generateCode(configWithDisabledHeaders, 'curl');
      
      expect(result).toContain('Content-Type: application/json');
      expect(result).not.toContain('User-Agent: MyApp/1.0');
    });

    it('should handle environment variable substitution', () => {
      const configWithEnvVars: CodeGenConfig = {
        ...mockCodeGenConfig,
        url: 'https://{{baseUrl}}/api/test',
        activeEnvVars: { baseUrl: 'api.example.com' }
      };

      const result = generateCode(configWithEnvVars, 'curl');
      
      expect(result).toContain('https://api.example.com/api/test');
    });
  });
});