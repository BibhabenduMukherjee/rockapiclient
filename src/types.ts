// It's good practice to define the shape of your data.

export interface ApiRequest {
  key: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
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
