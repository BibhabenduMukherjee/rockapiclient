
export interface ApiRequest {
  key: string;
  title: string;
  name?: string; // For duplication functionality
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  protocol?: 'http' | 'websocket'; // Protocol type
  params?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
  collectionKey?: string; // For tracking which collection this request belongs to
  tags?: string[]; // Tags for categorization
  // Body configuration fields
  bodyType?: 'none' | 'raw' | 'form-data' | 'url-encoded';
  rawBodyType?: 'json' | 'text' | 'xml' | 'html';
  formData?: Array<{key: string, value: string, enabled: boolean}>;
  urlEncoded?: Array<{key: string, value: string, enabled: boolean}>;
  // Auth configuration
  auth?: {
    type: 'none' | 'basic' | 'bearer' | 'jwt';
    basic: { username: string; password: string };
    bearer: { token: string };
    jwt: { token: string };
  };
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

export interface WebSocketMessage {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: number;
}
