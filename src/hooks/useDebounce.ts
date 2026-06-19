import { useEffect, useState, useRef } from 'react';

/**
 * Debounce hook to delay function execution until after a specified time has passed.
 * Prevents excessive API calls, especially useful for search inputs.
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export const useDebounce = <T,>(value: T, delay: number = 300): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Clear the previous timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Set a new timer
        timerRef.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup function to clear the timer on unmount
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [value, delay]);

    return debouncedValue;
};
