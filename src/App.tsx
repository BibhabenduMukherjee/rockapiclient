import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Layout, Modal, message, Select, Typography, Button } from 'antd';
import { SettingOutlined, ThunderboltOutlined, StarFilled, StarOutlined, BarChartOutlined } from '@ant-design/icons';

import { useCollections } from './hooks/useCollections';
import { useEnvironments, substituteTemplate } from './hooks/useEnvironments';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { useBookmarks } from './hooks/useBookmarks';
import { useFirstLaunch } from './hooks/useFirstLaunch';
import { useAppState, useRequestManagement } from './hooks/useAppState';
import { useModals } from './hooks/useModals';
import { useFocusManagement } from './hooks/useFocusManagement';
import VerticalSidebar from './components/VerticalSidebar';
import RequestTabs from './components/RequestTabs';
import RequestPanel from './components/RequestPanel';
import CommandPalette from './components/CommandPalette';
import RequestTemplates from './components/RequestTemplates';
import ThemeSettings from './components/ThemeSettings';
import AppTour, { TourButton } from './components/AppTour';
import BookmarksPanel from './components/BookmarksPanel';
import MoodSelector from './components/MoodSelector';
import { showRequestSuccess, showRequestError, showCollectionSaved } from './components/EnhancedNotifications';
import { sendRequest, RequestConfig } from './utils/requestSender';
import { generateCode, CodeGenConfig, CodeGenType } from './utils/codeGenerator';
import EnhancedCodeGenerator from './components/EnhancedCodeGenerator';
import { ApiRequest, HistoryItem } from './types';

const { Header } = Layout;
const { Option } = Select;
const { Text } = Typography;

function App() {
  // Use optimized state management hooks
  const appState = useAppState();
  const {
    activeTab,
    setActiveTab,
    requests,
    setRequests,
    activeRequestKey,
    setActiveRequestKey,
    activeContentTab,
    setActiveContentTab,
    responseText,
    setResponseText,
    responseMeta,
    setResponseMeta,
    history,
    setHistory,
    filteredHistory,
    setFilteredHistory,
    isSending,
    setIsSending,
    abortControllerRef,
    responseTimeData,
    setResponseTimeData
  } = appState;

  // Use optimized request management
  const requestManagement = useRequestManagement(requests, setRequests, activeRequestKey, setActiveRequestKey);
  const {
    handleNewRequest,
    handleCloseTab,
    handleRequestChange,
    handleRequestSelect,
    handleDuplicateRequest
  } = requestManagement;

  // Use optimized modal management
  const modals = useModals();
  const {
    isEnhancedCodeGenVisible,
    setIsEnhancedCodeGenVisible,
    isCodeGenModalVisible,
    setIsCodeGenModalVisible,
    codeGenType,
    setCodeGenType,
    isCommandPaletteVisible,
    setIsCommandPaletteVisible,
    isTemplatesModalVisible,
    setIsTemplatesModalVisible,
    isThemeSettingsVisible,
    setIsThemeSettingsVisible,
    isTourVisible,
    setIsTourVisible,
    showMoodSelector,
    setShowMoodSelector
  } = modals;

  // Use optimized focus management
  const focusManagement = useFocusManagement();
  const {
    urlInputRef,
    paramsTextAreaRef,
    handleFocusUrl,
    handleFocusParams: handleFocusParamsBase,
    handleFocusHeaders: handleFocusHeadersBase,
    handleFocusBody: handleFocusBodyBase
  } = focusManagement;

  // Create focus handlers with proper parameters
  const handleFocusParams = useCallback(() => {
    handleFocusParamsBase(setActiveContentTab);
  }, [handleFocusParamsBase, setActiveContentTab]);

  const handleFocusHeaders = useCallback(() => {
    handleFocusHeadersBase(setActiveContentTab);
  }, [handleFocusHeadersBase, setActiveContentTab]);

  const handleFocusBody = useCallback(() => {
    handleFocusBodyBase(setActiveContentTab);
  }, [handleFocusBodyBase, setActiveContentTab]);

  // Get current active request
  const activeRequest = requests.find(req => req.key === activeRequestKey) || requests[0];


  // The custom hook provides all data and functions for managing collections
  const { collections, loading, addCollection, addRequest, renameNode, deleteNode, updateRequest } = useCollections();
  
  // Environment management
  const { state: envState, loading: envLoading, addEnvironment, removeEnvironment, setActiveEnvironment, updateVariables } = useEnvironments();

  // Bookmarks management
  const { bookmarks, addBookmark, removeBookmark, isBookmarked, updateBookmarkTags, clearAllBookmarks } = useBookmarks();
  
  // Theme and keyboard shortcuts
  const { settings: themeSettings, setTheme } = useTheme();
  
  // First launch and mood selection
  const { isFirstLaunch, isChecking, markAsLaunched } = useFirstLaunch();
  
  const handleSwitchToHistory = useCallback(() => {
    setActiveTab('history');
  }, [setActiveTab]);
  
  const handleSwitchToCollections = useCallback(() => {
    setActiveTab('collections');
  }, [setActiveTab]);
  
  const handleSwitchToEnvironments = useCallback(() => {
    setActiveTab('environments');
  }, [setActiveTab]);

  // Handle mood selection
  const handleMoodSelect = useCallback((mood: string) => {
    setTheme(mood);
    markAsLaunched();
    setShowMoodSelector(false);
  }, [setTheme, markAsLaunched]);

  // Load history on mount
  useEffect(() => {
    // @ts-ignore
    if (window.electron?.loadHistory) {
      // @ts-ignore
      window.electron.loadHistory().then((items: HistoryItem[]) => {
        setHistory(items || []);
        setFilteredHistory(items || []);
      }).catch(() => {});
    }
  }, []);

  // Show mood selector on first launch
  useEffect(() => {
    if (!isChecking && isFirstLaunch) {
      setShowMoodSelector(true);
    }
  }, [isChecking, isFirstLaunch]);

  // Handle history search
  const handleHistorySearch = (filtered: HistoryItem[]) => {
    setFilteredHistory(filtered);
  };

  // Handle request duplication
  const handleRequestDuplicate = (duplicatedRequest: ApiRequest) => {
    const newRequest: ApiRequest = {
      ...duplicatedRequest,
      key: `duplicate-${Date.now()}`,
      name: `${duplicatedRequest.name} Copy`
    };
    setRequests(prev => [...prev, newRequest]);
    setActiveRequestKey(newRequest.key);
    message.success(`Request "${newRequest.name}" created successfully`);
  };

  // Handle template application
  const handleApplyTemplate = (template: any) => {
    const newRequest: ApiRequest = {
      key: `template-${Date.now()}`,
      title: template.name,
      name: template.name,
      method: template.request.method,
      url: template.request.url,
      params: template.request.params || {},
      headers: template.request.headers || {},
      body: template.request.body || ''
    };
    setRequests(prev => [...prev, newRequest]);
    setActiveRequestKey(newRequest.key);
    message.success(`Applied template: ${template.name}`);
  };

  // Persist history on change
  useEffect(() => {
    // @ts-ignore
    if (window.electron?.saveHistory) {
      // @ts-ignore
      window.electron.saveHistory(history);
    }
  }, [history]);

  const handleSendRequest = async () => {
    if (!activeRequest.url) {
      message.error('Please enter a URL');
      return;
    }
    
    // If a request is already in progress, cancel it first
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsSending(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      // Apply environment variable substitution
      const substitutedUrl = substituteTemplate(activeRequest.url, envState.items.find(env => env.key === envState.activeKey)?.variables || {});
      const substitutedHeaders = Object.entries(activeRequest.headers || {}).reduce((acc, [key, value]) => {
        acc[key] = substituteTemplate(value, envState.items.find(env => env.key === envState.activeKey)?.variables || {});
        return acc;
      }, {} as Record<string, string>);
      
      const requestConfig: RequestConfig = {
        method: activeRequest.method,
        url: substitutedUrl,
        paramsJson: JSON.stringify(activeRequest.params || {}),
        headers: Object.entries(substitutedHeaders).map(([key, value]) => ({
          key,
          value,
          enabled: true
        })),
        auth: {
          type: 'none',
          apiKey: { key: '', value: '', addTo: 'header' },
          bearer: { token: '' },
          basic: { username: '', password: '' },
          jwt: { token: '' }
        },
        bodyType: activeRequest.body ? 'raw' : 'none',
        rawBodyType: 'json',
        rawBody: activeRequest.body || '',
        formData: [],
        urlEncoded: [],
        activeEnvVars: envState.items.find(env => env.key === envState.activeKey)?.variables || {}
      };
      
      const result = await sendRequest(requestConfig, controller.signal);
      
      setResponseText(result.responseText);
      setResponseMeta(result.responseMeta);
      
      // Add to history
      setHistory(prev => [result.historyItem, ...prev.slice(0, 99)]);
      setFilteredHistory(prev => [result.historyItem, ...prev.slice(0, 99)]);
      
      // Add to response time data for charts
      setResponseTimeData(prev => [
        {
          timestamp: Date.now(),
          duration: result.responseMeta.durationMs,
          status: result.responseMeta.status || 0,
          url: substitutedUrl
        },
        ...prev.slice(0, 49) // Keep last 50 data points
      ]);
      
      showRequestSuccess(result.responseMeta.durationMs, result.responseMeta.status || 0);
    } catch (err: any) {
      console.error('Request failed:', err);
      const errorMessage = err?.message || 'Unknown error';
      
      // Show error notification with retry option
      showRequestError(errorMessage, () => {
        handleSendRequest();
      });
    } finally {
      setIsSending(false);
      abortControllerRef.current = null;
    }
  };

  // Initialize keyboard shortcuts after handleSendRequest is defined
  useKeyboardShortcuts({
    onSendRequest: handleSendRequest,
    onSaveCollection: () => showCollectionSaved(),
    onOpenCommandPalette: () => setIsCommandPaletteVisible(true),
    onFocusUrl: handleFocusUrl,
    onFocusParams: handleFocusParams,
    onFocusHeaders: handleFocusHeaders,
    onFocusBody: handleFocusBody,
    disabled: isSending
  });


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        color: 'var(--theme-text)', 
        fontSize: '20px', 
        fontWeight: 'bold', 
        background: 'var(--theme-background)',
        borderBottom: '1px solid var(--theme-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--theme-text)' }}>Rock API Client</span>
          <div data-tour="header-actions">
            <TourButton onStartTour={() => setIsTourVisible(true)} />
            <button
              onClick={() => {
                if (isBookmarked(activeRequest)) {
                  removeBookmark(activeRequest);
                } else {
                  addBookmark(activeRequest);
                }
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: isBookmarked(activeRequest) ? '#faad14' : 'var(--theme-text)', 
                cursor: 'pointer',
                marginRight: '16px',
                padding: '8px 12px',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}
              title={isBookmarked(activeRequest) ? "Remove bookmark" : "Bookmark this request"}
            >
              {isBookmarked(activeRequest) ? <StarFilled style={{ marginRight: '8px' }} /> : <StarOutlined style={{ marginRight: '8px' }} />}
              {isBookmarked(activeRequest) ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button
              onClick={() => setIsTemplatesModalVisible(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--theme-text)', 
                cursor: 'pointer',
                marginRight: '16px',
                padding: '8px 12px',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}
              title="Request Templates (Ctrl+T)"
            >
              <ThunderboltOutlined style={{ marginRight: '8px' }} />
              Templates
            </button>
            <button
              onClick={() => setIsThemeSettingsVisible(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--theme-text)', 
                cursor: 'pointer',
                marginRight: '16px',
                padding: '8px 12px',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}
              title="Theme Settings"
            >
              <SettingOutlined style={{ marginRight: '8px' }} />
              Theme
            </button>
            <button
              onClick={() => setIsEnhancedCodeGenVisible(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--theme-text)', 
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}
              title="Generate Code (15+ Languages)"
            >
              <BarChartOutlined style={{ marginRight: '8px' }} />
              Code Gen
            </button>
          </div>
        </div>
      </Header>
      
      <Layout>
        {/* Vertical Sidebar */}
        <div data-tour="sidebar">
          <VerticalSidebar
            key={`sidebar-${bookmarks.length}`}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSelectRequest={handleRequestSelect}
            history={history}
            onHistorySearch={handleHistorySearch}
            filteredHistory={filteredHistory}
            onClearHistory={() => setHistory([])}
            bookmarks={bookmarks}
            removeBookmark={removeBookmark}
            updateBookmarkTags={updateBookmarkTags}
            clearAllBookmarks={clearAllBookmarks}
          />
        </div>
        
        {/* Main Content Area */}
        <Layout style={{ background: 'var(--theme-background)' }}>
          {/* Request Tabs */}
          <div data-tour="request-tabs">
            <RequestTabs
              requests={requests}
              activeRequestKey={activeRequestKey}
              onTabChange={setActiveRequestKey}
              onCloseTab={handleCloseTab}
              onNewRequest={handleNewRequest}
            />
          </div>
          
          {/* Request Panel */}
          <div data-tour="request-builder">
            <RequestPanel
              request={activeRequest}
              onRequestChange={handleRequestChange}
              onSendRequest={handleSendRequest}
              onDuplicateRequest={handleRequestDuplicate}
              history={history}
              isSending={isSending}
              hasValidationError={false} // We'll handle validation in RequestPanel
              responseText={responseText}
              responseMeta={responseMeta}
              activeContentTab={activeContentTab}
              onContentTabChange={setActiveContentTab}
              responseTimeData={responseTimeData}
            />
          </div>
        </Layout>
      </Layout>


      {/* Command Palette */}
      <CommandPalette
        visible={isCommandPaletteVisible}
        onClose={() => setIsCommandPaletteVisible(false)}
        onSendRequest={handleSendRequest}
        onSaveCollection={() => showCollectionSaved()}
        onFocusUrl={handleFocusUrl}
        onFocusParams={handleFocusParams}
        onFocusHeaders={handleFocusHeaders}
        onFocusBody={handleFocusBody}
        onSwitchToHistory={handleSwitchToHistory}
        onSwitchToCollections={handleSwitchToCollections}
        onSwitchToEnvironments={handleSwitchToEnvironments}
      />
      
      {/* Request Templates */}
      <RequestTemplates
        visible={isTemplatesModalVisible}
        onClose={() => setIsTemplatesModalVisible(false)}
        onApplyTemplate={handleApplyTemplate}
      />
      
      {/* Theme Settings */}
      <ThemeSettings
        visible={isThemeSettingsVisible}
        onClose={() => setIsThemeSettingsVisible(false)}
      />
      
      {/* App Tour */}
      <AppTour
        isOpen={isTourVisible}
        onClose={() => setIsTourVisible(false)}
      />
      
      {/* Enhanced Code Generator Modal */}
      <EnhancedCodeGenerator
        visible={isEnhancedCodeGenVisible}
        onClose={() => setIsEnhancedCodeGenVisible(false)}
        config={{
          method: activeRequest?.method || 'GET',
          url: activeRequest?.url || '',
          headers: Object.entries(activeRequest?.headers || {}).map(([key, value]) => ({
            key,
            value,
            enabled: true
          })),
          auth: {
            type: 'none',
            apiKey: { key: '', value: '', addTo: 'header' },
            bearer: { token: '' },
            basic: { username: '', password: '' },
            jwt: { token: '' }
          },
          bodyType: activeRequest?.bodyType || 'none',
          rawBodyType: activeRequest?.rawBodyType || 'json',
          rawBody: activeRequest?.body || '',
          urlEncoded: activeRequest?.urlEncoded || [],
          activeEnvVars: envState.items.find(env => env.key === envState.activeKey)?.variables || {}
        }}
      />
      
      {/* Mood Selector - First Launch */}
      <MoodSelector
        visible={showMoodSelector}
        onSelectMood={handleMoodSelect}
        onClose={() => {
          setShowMoodSelector(false);
          markAsLaunched();
        }}
      />
      
      {/* Tour completion element (hidden) */}
      <div data-tour="tour-complete" style={{ display: 'none' }} />
    </Layout>
  );
}

export default App;
