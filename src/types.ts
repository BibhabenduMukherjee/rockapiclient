// It's good practice to define the shape of your data.

export interface ApiRequest {
  key: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
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
