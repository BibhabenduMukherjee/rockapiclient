import { renderHook, act } from '@testing-library/react';
import { useBookmarks } from '../../src/hooks/useBookmarks';
import { ApiRequest } from '../../src/types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useBookmarks', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('should initialize with empty bookmarks', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useBookmarks());
    
    expect(result.current.bookmarks).toEqual([]);
  });

  it('should load bookmarks from localStorage on mount', () => {
    const savedBookmarks = [
      {
        key: 'bookmark-1',
        title: 'Test Bookmark',
        method: 'GET',
        url: 'https://api.example.com/test',
        bookmarkedAt: 1234567890,
        tags: ['test']
      }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedBookmarks));
    
    const { result } = renderHook(() => useBookmarks());
    
    expect(result.current.bookmarks).toEqual(savedBookmarks);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('rock-api-bookmarks');
  });

  it('should handle localStorage parse errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useBookmarks());
    
    expect(result.current.bookmarks).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load bookmarks:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('should save bookmarks to localStorage when bookmarks change', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useBookmarks());
    
    const newBookmark: ApiRequest = {
      key: 'test-request',
      title: 'Test Request',
      method: 'GET',
      url: 'https://api.example.com/test'
    };
    
    act(() => {
      result.current.addBookmark(newBookmark);
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'rock-api-bookmarks',
      expect.stringContaining('test-request')
    );
  });

  it('should add a bookmark', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useBookmarks());
    
    const request: ApiRequest = {
      key: 'test-request',
      title: 'Test Request',
      method: 'GET',
      url: 'https://api.example.com/test'
    };
    
    act(() => {
      result.current.addBookmark(request, ['test', 'api']);
    });
    
    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0]).toMatchObject({
      ...request,
      tags: ['test', 'api']
    });
    expect(result.current.bookmarks[0].bookmarkedAt).toBeGreaterThan(0);
  });

  it('should not add duplicate bookmarks', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useBookmarks());
    
    const request: ApiRequest = {
      key: 'test-request',
      title: 'Test Request',
      method: 'GET',
      url: 'https://api.example.com/test'
    };
    
    act(() => {
      result.current.addBookmark(request);
      result.current.addBookmark(request); // Try to add the same request again
    });
    
    expect(result.current.bookmarks).toHaveLength(1);
  });

  it('should remove a bookmark', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useBookmarks());
    
    const request: ApiRequest = {
      key: 'test-request',
      title: 'Test Request',
      method: 'GET',
      url: 'https://api.example.com/test'
    };
    
    act(() => {
      result.current.addBookmark(request);
    });
    
    expect(result.current.bookmarks).toHaveLength(1);
    
    act(() => {
      result.current.removeBookmark(request);
    });
    
    expect(result.current.bookmarks).toHaveLength(0);
  });

  it('should check if a request is bookmarked', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useBookmarks());
    
    const request: ApiRequest = {
      key: 'test-request',
      title: 'Test Request',
      method: 'GET',
      url: 'https://api.example.com/test'
    };
    
    expect(result.current.isBookmarked(request)).toBe(false);
    
    act(() => {
      result.current.addBookmark(request);
    });
    
    expect(result.current.isBookmarked(request)).toBe(true);
  });

  it('should update bookmark tags', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useBookmarks());
    
    const request: ApiRequest = {
      key: 'test-request',
      title: 'Test Request',
      method: 'GET',
      url: 'https://api.example.com/test'
    };
    
    act(() => {
      result.current.addBookmark(request, ['original']);
    });
    
    expect(result.current.bookmarks[0].tags).toEqual(['original']);
    
    act(() => {
      result.current.updateBookmarkTags(request, ['updated', 'tags']);
    });
    
    expect(result.current.bookmarks[0].tags).toEqual(['updated', 'tags']);
  });

  it('should clear all bookmarks', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useBookmarks());
    
    const request1: ApiRequest = {
      key: 'test-request-1',
      title: 'Test Request 1',
      method: 'GET',
      url: 'https://api.example.com/test1'
    };
    
    const request2: ApiRequest = {
      key: 'test-request-2',
      title: 'Test Request 2',
      method: 'POST',
      url: 'https://api.example.com/test2'
    };
    
    act(() => {
      result.current.addBookmark(request1);
      result.current.addBookmark(request2);
    });
    
    expect(result.current.bookmarks).toHaveLength(2);
    
    act(() => {
      result.current.clearAllBookmarks();
    });
    
    expect(result.current.bookmarks).toHaveLength(0);
  });

  it('should handle localStorage save errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useBookmarks());
    
    const request: ApiRequest = {
      key: 'test-request',
      title: 'Test Request',
      method: 'GET',
      url: 'https://api.example.com/test'
    };
    
    act(() => {
      result.current.addBookmark(request);
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to save bookmarks:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});
