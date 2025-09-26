import { useState, useEffect, useCallback } from 'react';
import { ApiRequest } from '../types';

interface BookmarkedRequest extends ApiRequest {
  bookmarkedAt: number;
  tags?: string[];
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedRequest[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rock-api-bookmarks');
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    try {
      localStorage.setItem('rock-api-bookmarks', JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  }, [bookmarks]);

  const addBookmark = useCallback((request: ApiRequest, tags: string[] = []) => {
    const bookmark: BookmarkedRequest = {
      ...request,
      bookmarkedAt: Date.now(),
      tags
    };
    
    setBookmarks(prev => {
      // Check if already bookmarked (by method + url)
      const exists = prev.some(b => 
        b.method === request.method && b.url === request.url
      );
      
      if (exists) {
        return prev; // Don't add duplicates
      }
      
      return [bookmark, ...prev];
    });
  }, []);

  const removeBookmark = useCallback((request: ApiRequest) => {
    setBookmarks(prev => 
      prev.filter(b => !(b.method === request.method && b.url === request.url))
    );
  }, []);

  const isBookmarked = useCallback((request: ApiRequest) => {
    return bookmarks.some(b => 
      b.method === request.method && b.url === request.url
    );
  }, [bookmarks]);

  const updateBookmarkTags = useCallback((request: ApiRequest, tags: string[]) => {
    setBookmarks(prev => 
      prev.map(b => 
        b.method === request.method && b.url === request.url
          ? { ...b, tags }
          : b
      )
    );
  }, []);

  const clearAllBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    updateBookmarkTags,
    clearAllBookmarks
  };
}
