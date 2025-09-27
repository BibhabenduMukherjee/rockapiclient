import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export interface UseKeyboardShortcutsProps {
  onSendRequest: () => void;
  onSaveCollection?: () => void;
  onOpenCommandPalette?: () => void;
  onFocusUrl?: () => void;
  onFocusParams?: () => void;
  onFocusHeaders?: () => void;
  onFocusBody?: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  onSendRequest,
  onSaveCollection,
  onOpenCommandPalette,
  onFocusUrl,
  onFocusParams,
  onFocusHeaders,
  onFocusBody,
  disabled = false
}: UseKeyboardShortcutsProps) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    // Don't trigger shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      // Allow Ctrl+Enter even in input fields for sending requests
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        onSendRequest();
      }
      return;
    }

    // Handle shortcuts
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      onSendRequest();
    } else if (event.ctrlKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      onSaveCollection?.();
    } else if (event.ctrlKey && event.key === '/') {
      event.preventDefault();
      onOpenCommandPalette?.();
    } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      onFocusUrl?.();
    } else if (event.ctrlKey && event.key.toLowerCase() === 'p') {
      event.preventDefault();
      onFocusParams?.();
    } else if (event.ctrlKey && event.key.toLowerCase() === 'h') {
      event.preventDefault();
      onFocusHeaders?.();
    } else if (event.ctrlKey && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      onFocusBody?.();
    }
  }, [disabled, onSendRequest, onSaveCollection, onOpenCommandPalette, onFocusUrl, onFocusParams, onFocusHeaders, onFocusBody]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    handleKeyDown
  };
}
