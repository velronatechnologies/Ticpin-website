import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating a value until after `delay` ms of inactivity.
 * Use for search inputs, filter dropdowns, and any rapid-change state that
 * triggers expensive API calls.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
