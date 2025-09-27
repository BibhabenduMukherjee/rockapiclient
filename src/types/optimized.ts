// Core API Request interface
export interface ApiRequest {
  key: string;
  title: string;
  name?: string;
  method: HttpMethod;
  url: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
  collectionKey?: string;
  bodyType?: BodyType;
  rawBodyType?: RawBodyType;
  formData?: FormDataItem[];
  urlEncoded?: FormDataItem[];
  auth?: AuthConfig;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// Body Types
export type BodyType = 'none' | 'raw' | 'form-data' | 'url-encoded';
export type RawBodyType = 'json' | 'text' | 'xml' | 'html';

// Form Data Item
export interface FormDataItem {
  key: string;
  value: string;
  enabled: boolean;
}

// Authentication Configuration
export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'jwt' | 'apiKey';
  basic: { username: string; password: string };
  bearer: { token: string };
  jwt: { token: string };
  apiKey: { key: string; value: string; addTo: 'header' | 'query' };
}

// Collection interface
export interface Collection {
  key: string;
  title: string;
  requests: ApiRequest[];
}

// TreeNode for sidebar operations
export interface TreeNode {
  key: string;
  title: string;
  type: 'collection' | 'request';
  collectionKey?: string;
}

// History Item
export interface HistoryItem {
  id: string;
  method: HttpMethod;
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

// Environment Item
export interface EnvironmentItem {
  key: string;
  name: string;
  variables: Record<string, string>;
}

// Environment State
export interface EnvironmentsState {
  activeKey?: string;
  items: EnvironmentItem[];
}

// Response Metadata
export interface ResponseMeta {
  status: number | null;
  durationMs: number;
  headers: Record<string, string>;
  size: number;
}

// Response Time Data
export interface ResponseTimeData {
  timestamp: number;
  duration: number;
  status: number;
  url: string;
}

// Bookmarked Request
export interface BookmarkedRequest extends ApiRequest {
  bookmarkedAt: number;
  tags?: string[];
}

// Theme Settings
export interface ThemeSettings {
  currentTheme: string;
  fontSize: number;
  sidebarWidth: number;
  borderRadius: number;
  spacing: number;
  customTheme?: Theme;
}

// Theme
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fonts: {
    family: string;
  };
}

// Keyboard Shortcut
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
}

// Command for Command Palette
export interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

// Request Template
export interface RequestTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  request: Partial<ApiRequest>;
  tags: string[];
}

// Header Item for HeadersTab
export interface HeaderItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

// Request Panel Props
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

// Vertical Sidebar Props
export interface VerticalSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSelectRequest: (request: ApiRequest) => void;
  history: HistoryItem[];
  onHistorySearch: (filteredHistory: HistoryItem[]) => void;
  filteredHistory: HistoryItem[];
  onClearHistory: () => void;
  bookmarks: BookmarkedRequest[];
}

// Command Palette Props
export interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
  onSendRequest: () => void;
  onSaveCollection?: () => void;
  onFocusUrl?: () => void;
  onFocusParams?: () => void;
  onFocusHeaders?: () => void;
  onFocusBody?: () => void;
  onSwitchToHistory?: () => void;
  onSwitchToCollections?: () => void;
  onSwitchToEnvironments?: () => void;
}

// App Tour Props
export interface AppTourProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mood Selector Props
export interface MoodSelectorProps {
  visible: boolean;
  onSelectMood: (mood: string) => void;
  onClose: () => void;
}

// Request Diff Props
export interface RequestDiffProps {
  currentRequest: ApiRequest;
  history: HistoryItem[];
  disabled?: boolean;
}

// Request Duplication Props
export interface RequestDuplicationProps {
  request: ApiRequest;
  onDuplicate: (request: ApiRequest) => void;
  disabled?: boolean;
}

// Response Analytics Props
export interface ResponseAnalyticsProps {
  responseTimeData: ResponseTimeData[];
  responseMeta: ResponseMeta;
}

// Theme Settings Props
export interface ThemeSettingsProps {
  visible: boolean;
  onClose: () => void;
}

// Request Templates Props
export interface RequestTemplatesProps {
  visible: boolean;
  onClose: () => void;
  onApplyTemplate: (template: RequestTemplate) => void;
}

// Bookmarks Panel Props
export interface BookmarksPanelProps {
  onSelectRequest: (request: ApiRequest) => void;
  className?: string;
}

// History Search Props
export interface HistorySearchProps {
  history: HistoryItem[];
  onSearch: (filteredHistory: HistoryItem[]) => void;
  onClear: () => void;
}

// Enhanced Notifications Props
export interface EnhancedNotificationsProps {
  onRetry?: () => void;
  onDismiss?: () => void;
}

// Code Generation Configuration
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

// Code Generation Type
export type CodeGenType = 'curl' | 'fetch' | 'axios' | 'httpie';

// Request Configuration for sending
export interface RequestConfig {
  method: string;
  url: string;
  paramsJson: string;
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
  formData: Array<{key: string, value: string, enabled: boolean}>;
  urlEncoded: Array<{key: string, value: string, enabled: boolean}>;
  activeEnvVars: Record<string, string>;
}

// Request Result
export interface RequestResult {
  responseText: string;
  responseMeta: ResponseMeta;
  historyItem: HistoryItem;
}
