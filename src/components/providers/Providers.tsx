'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getUserSession, clearUserSession } from '@/lib/auth/user';
import { getOrganizerSession, clearOrganizerSession } from '@/lib/auth/organizer';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 10 * 1000,
                retry: 1,
            },
        },
    }));

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const originalFetch = window.fetch;
        window.fetch = async function (input, init) {
            const urlString = typeof input === 'string' 
                ? input 
                : input instanceof URL 
                ? input.toString() 
                : input instanceof Request 
                ? input.url 
                : '';
            
            const isBackendApi = urlString.includes('/backend/api') || urlString.includes('/api/auth/logout');
            
            const res = await originalFetch(input, init);
            
            if (res.status === 401 && isBackendApi) {
                if (getUserSession()) {
                    console.warn('[Auth] Received 401 from API. Logging out user and redirecting to /events.');
                    clearUserSession();
                    window.location.href = '/events';
                } else if (getOrganizerSession()) {
                    console.warn('[Auth] Received 401 from API. Logging out organizer and redirecting to /events.');
                    clearOrganizerSession();
                    window.location.href = '/events';
                }
            }
            return res;
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
