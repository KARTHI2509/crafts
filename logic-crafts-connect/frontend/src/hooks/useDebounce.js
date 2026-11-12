import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - The debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debouncing a callback function
 * @param {Function} callback - The callback function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - The debounced callback
 */
export const useDebouncedCallback = (callback, delay = 300) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Custom hook for local storage with state sync
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {[any, Function]} - [value, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

/**
 * Custom hook for window scroll position
 * @returns {{ scrollY: number, scrollX: number, scrollDirection: string }}
 */
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({
    scrollY: 0,
    scrollX: 0,
    scrollDirection: 'none',
  });
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
      
      setScrollPosition({
        scrollY: currentScrollY,
        scrollX: window.scrollX,
        scrollDirection: direction,
      });
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};

/**
 * Custom hook for detecting outside clicks
 * @param {Function} handler - Handler to call on outside click
 * @returns {React.RefObject} - Ref to attach to the element
 */
export const useClickOutside = (handler) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler]);

  return ref;
};

/**
 * Custom hook for media queries
 * @param {string} query - Media query string
 * @returns {boolean} - Whether the query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * Custom hook for detecting mobile devices
 * @returns {boolean} - Whether the device is mobile
 */
export const useIsMobile = () => {
  return useMediaQuery('(max-width: 768px)');
};

/**
 * Custom hook for async operations with loading/error states
 * @param {Function} asyncFunction - Async function to execute
 * @returns {{ execute: Function, loading: boolean, error: any, data: any }}
 */
export const useAsync = (asyncFunction, immediate = false) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...params) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFunction(...params);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, loading, error, data };
};

export default {
  useDebounce,
  useDebouncedCallback,
  useLocalStorage,
  useScrollPosition,
  useClickOutside,
  useMediaQuery,
  useIsMobile,
  useAsync,
};
