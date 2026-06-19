import { useEffect, useState } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';

/**
 * Hydration-safe hook for Zustand stores.
 * 
 * Prevents hydration mismatches by ensuring the component only renders
 * the store's state after the client has mounted. During server render,
 * returns `defaultValue`.
 * 
 * @param store - The Zustand store
 * @param selector - Optional selector function to pick specific state
 * @param defaultValue - Default value to use during SSR
 * @returns The store state (or selected subset)
 * 
 * @example
 * const userSession = useStore(useIdentityStore, (state) => state.userSession, null);
 */
export const useStore = <S, U>(
    store: UseBoundStore<StoreApi<S>>,
    selector?: (state: S) => U,
    defaultValue?: U
): U | S | undefined => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return defaultValue;
    }

    return selector ? store(selector) : store((state) => state);
};
