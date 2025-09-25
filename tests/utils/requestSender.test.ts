import { sendRequest, RequestConfig } from '../../src/utils/requestSender';

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

describe('requestSender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  const mockRequestConfig: RequestConfig = {
    method: 'GET',
    url: 'https://api.example.com/test',
    paramsJson: '{"param1": "value1"}',
    headers: [
      { key: 'Content-Type', value: 'application/json', enabled: true }
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
    formData: [],
    urlEncoded: [],
    activeEnvVars: {}
  };

  describe('sendRequest', () => {
    it('should send a successful GET request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: () => Promise.resolve('{"message": "success"}'),
        headers: new Map([['content-type', 'application/json']])
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendRequest(mockRequestConfig, new AbortController().signal);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: undefined
        })
      );

      expect(result.responseText).toBe('{"message": "success"}');
      expect(result.responseMeta.status).toBe(200);
      expect(result.responseMeta.durationMs).toBeGreaterThanOrEqual(0);
      expect(result.historyItem.method).toBe('GET');
      expect(result.historyItem.status).toBe(200);
    });

    it('should handle POST request with JSON body', async () => {
      const postConfig: RequestConfig = {
        ...mockRequestConfig,
        method: 'POST',
        bodyType: 'raw',
        rawBodyType: 'json',
        rawBody: '{"test": "data"}'
      };

      const mockResponse = {
        ok: true,
        status: 201,
        text: () => Promise.resolve('{"id": 123}'),
        headers: new Map([['content-type', 'application/json']])
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendRequest(postConfig, new AbortController().signal);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: '{"test": "data"}'
        })
      );

      expect(result.responseMeta.status).toBe(201);
    });

    it('should handle request errors', async () => {
      const errorMessage = 'Network error';
      (global.fetch as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const result = await sendRequest(mockRequestConfig, new AbortController().signal);

      expect(result.responseText).toBe(errorMessage);
      expect(result.responseMeta.status).toBeNull();
      expect(result.historyItem.status).toBeNull();
    });

    it('should handle aborted requests', async () => {
      const abortController = new AbortController();
      (global.fetch as jest.Mock).mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Request cancelled');
            error.name = 'AbortError';
            reject(error);
          }, 100);
        });
      });

      // Abort the request immediately
      abortController.abort();

      const result = await sendRequest(mockRequestConfig, abortController.signal);

      expect(result.responseText).toBe('Request cancelled');
      expect(result.responseMeta.status).toBeNull();
    });

    it('should handle Bearer token authentication', async () => {
      const authConfig: RequestConfig = {
        ...mockRequestConfig,
        auth: {
          type: 'bearer',
          apiKey: { key: '', value: '', addTo: 'header' },
          bearer: { token: 'test-token' },
          basic: { username: '', password: '' },
          jwt: { token: '' }
        }
      };

      const mockResponse = {
        ok: true,
        status: 200,
        text: () => Promise.resolve('{"authenticated": true}'),
        headers: new Map()
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await sendRequest(authConfig, new AbortController().signal);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should handle Basic authentication', async () => {
      const authConfig: RequestConfig = {
        ...mockRequestConfig,
        auth: {
          type: 'basic',
          apiKey: { key: '', value: '', addTo: 'header' },
          bearer: { token: '' },
          basic: { username: 'user', password: 'pass' },
          jwt: { token: '' }
        }
      };

      const mockResponse = {
        ok: true,
        status: 200,
        text: () => Promise.resolve('{"authenticated": true}'),
        headers: new Map()
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await sendRequest(authConfig, new AbortController().signal);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /)
          })
        })
      );
    });
  });
});
