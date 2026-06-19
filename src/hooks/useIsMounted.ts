import { useEffect, useState } from 'react';

/**
 * Hook to check if component is mounted (for hydration-safe operations).
 * 
 * Useful for components that need to access browser APIs or render
 * client-specific state without causing hydration mismatches.
 * 
 * @returns boolean - true if component is mounted on the client
 * 
 * @example
 * const isMounted = useIsMounted();
 * if (!isMounted) return null; // or a fallback
 * 
 * // Now safe to use localStorage, window, etc.
 * const value = localStorage.getItem('key');
 */
export const useIsMounted = (): boolean => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return isMounted;
};
