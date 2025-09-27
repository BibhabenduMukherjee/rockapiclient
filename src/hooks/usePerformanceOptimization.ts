import { useCallback, useMemo, useRef, useState } from 'react';

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Hook for performance optimization with debounced callbacks
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );

  return debouncedCallback as T;
}

/**
 * Hook for memoized expensive calculations
 */
export function useExpensiveCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(calculation, dependencies);
}

/**
 * Hook for stable callback references
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies);
}

/**
 * Hook for preventing unnecessary re-renders
 */
export function useShallowEqual<T>(value: T): T {
  const ref = useRef<T>(value);
  
  if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Hook for batch state updates
 */
export function useBatchedUpdates() {
  const batchRef = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((update: () => void) => {
    batchRef.current.push(update);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      batchRef.current.forEach(update => update());
      batchRef.current = [];
    }, 0);
  }, []);

  return { batchUpdate };
}

/**
 * Hook for optimized list rendering
 */
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);
  
  const totalHeight = items.length * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    setScrollTop
  };
}

/**
 * Hook for optimized search with debouncing
 */
export function useSearch<T>(
  items: T[],
  searchFunction: (item: T, query: string) => boolean,
  debounceDelay: number = 300
) {
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  
  const debouncedSearch = useDebouncedCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setFilteredItems(items);
        return;
      }
      
      const filtered = items.filter(item => 
        searchFunction(item, searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    },
    debounceDelay
  );
  
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    debouncedSearch(searchQuery);
  }, [debouncedSearch]);
  
  return {
    query,
    filteredItems,
    handleSearch,
    clearSearch: () => handleSearch('')
  };
}

/**
 * Hook for optimized form state management
 */
export function useFormState<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate field if validation rule exists
    if (validationRules?.[field]) {
      const error = validationRules[field]!(value);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }
  }, [validationRules]);
  
  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);
  
  const validateForm = useCallback(() => {
    if (!validationRules) return true;
    
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    
    Object.entries(validationRules).forEach(([field, rule]) => {
      const error = rule(values[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);
  
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateForm,
    resetForm,
    isValid: Object.values(errors).every(error => !error)
  };
}

/**
 * Hook for optimized API calls with caching
 */
export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes
) {
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    const cached = cacheRef.current.get(key);
    const now = Date.now();
    
    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < ttl) {
      setData(cached.data);
      return cached.data;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      cacheRef.current.set(key, { data: result, timestamp: now });
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);
  
  const clearCache = useCallback(() => {
    cacheRef.current.delete(key);
    setData(null);
  }, [key]);
  
  return {
    data,
    loading,
    error,
    fetchData,
    clearCache
  };
}
