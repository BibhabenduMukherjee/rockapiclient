import { ApiRequest, HistoryItem } from '../types';

export interface ResponseMeta {
  status: number | null;
  durationMs: number;
  headers: Record<string, string>;
  size: number;
}

export interface ResponseTimeData {
  timestamp: number;
  duration: number;
  status: number;
  url: string;
}

export interface RequestPanelProps {
  request: ApiRequest;
  onRequestChange: (request: ApiRequest) => void;
  onSendRequest: () => void;
  onDuplicateRequest: (request: ApiRequest) => void;
  history: HistoryItem[];
  isSending: boolean;
  hasValidationError: boolean;
  responseText: string;
  responseMeta: ResponseMeta;
  activeContentTab: string;
  onContentTabChange: (tab: string) => void;
  responseTimeData: ResponseTimeData[];
}
