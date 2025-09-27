import { useRef, useCallback } from 'react';

export interface FocusRefs {
  urlInputRef: React.RefObject<any>;
  paramsTextAreaRef: React.RefObject<any>;
}

export function useFocusManagement() {
  const urlInputRef = useRef<any>(null);
  const paramsTextAreaRef = useRef<any>(null);

  const handleFocusUrl = useCallback(() => {
    urlInputRef.current?.focus();
  }, []);

  const handleFocusParams = useCallback((setActiveContentTab: (tab: string) => void) => {
    setActiveContentTab('params');
    setTimeout(() => paramsTextAreaRef.current?.focus(), 100);
  }, []);

  const handleFocusHeaders = useCallback((setActiveContentTab: (tab: string) => void) => {
    setActiveContentTab('headers');
  }, []);

  const handleFocusBody = useCallback((setActiveContentTab: (tab: string) => void) => {
    setActiveContentTab('body');
  }, []);

  return {
    urlInputRef,
    paramsTextAreaRef,
    handleFocusUrl,
    handleFocusParams,
    handleFocusHeaders,
    handleFocusBody
  };
}
