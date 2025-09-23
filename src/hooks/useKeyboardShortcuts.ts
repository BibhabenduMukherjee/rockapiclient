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
      console.log('🚀 Ctrl+Enter: Send Request');
      event.preventDefault();
      onSendRequest();
    } else if (event.ctrlKey && event.key.toLowerCase() === 's') {
      console.log('💾 Ctrl+S: Save Collection');
      event.preventDefault();
      onSaveCollection?.();
    } else if (event.ctrlKey && event.key === '/') {
      console.log('🔍 Ctrl+/: Open Command Palette');
      event.preventDefault();
      onOpenCommandPalette?.();
    } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      console.log('🔗 Ctrl+L: Focus URL');
      event.preventDefault();
      onFocusUrl?.();
    } else if (event.ctrlKey && event.key.toLowerCase() === 'p') {
      console.log('📝 Ctrl+P: Focus Params');
      event.preventDefault();
      onFocusParams?.();
    } else if (event.ctrlKey && event.key.toLowerCase() === 'h') {
      console.log('📋 Ctrl+H: Focus Headers');
      event.preventDefault();
      onFocusHeaders?.();
    } else if (event.ctrlKey && event.key.toLowerCase() === 'b') {
      console.log('📄 Ctrl+B: Focus Body');
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
