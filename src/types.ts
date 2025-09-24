// It's good practice to define the shape of your data.

export interface ApiRequest {
  key: string;
  title: string;
  name?: string; // For duplication functionality
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
  bodyType?: 'none' | 'raw' | 'form-data' | 'x-www-form-urlencoded';
  rawBodyType?: 'json' | 'xml' | 'html' | 'text';
  formData?: Array<{key: string, value: string, enabled: boolean}>;
  urlEncoded?: Array<{key: string, value: string, enabled: boolean}>;
  auth?: {
    type: 'none' | 'apiKey' | 'bearer' | 'basic' | 'jwt';
    apiKey?: { key: string; value: string; addTo: 'header' | 'query' };
    bearer?: { token: string };
    basic?: { username: string; password: string };
    jwt?: { token: string };
  };
  collectionKey?: string; // For tracking which collection this request belongs to
}

export interface Collection {
  key: string;
  title: string;
  requests: ApiRequest[];
}

// Type for the node being edited/deleted in the sidebar
export interface TreeNode {
  key: string;
  title: string;
  type: 'collection' | 'request';
  collectionKey?: string; // Only present for requests
}

export interface HistoryItem {
  id: string;
  method: ApiRequest['method'];
  url: string;
  status: number | null;
  durationMs: number;
  timestamp: number;
  request: Pick<ApiRequest, 'params' | 'headers' | 'body'>;
  response: {
    headers: Record<string, string>;
    body: string;
  } | null;
}

export interface EnvironmentItem {
  key: string;
  name: string;
  variables: Record<string, string>;
}

export interface EnvironmentsState {
  activeKey?: string;
  items: EnvironmentItem[];
}
