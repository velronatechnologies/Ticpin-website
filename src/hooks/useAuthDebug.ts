// Debug hook to check auth state
import { useAuth } from '@/context/AuthContext';
import { getAuthToken } from '@/lib/api';
import { useEffect } from 'react';

export function useAuthDebug() {
    const { isLoggedIn, token, phone } = useAuth();

    useEffect(() => {
        const storedToken = getAuthToken();
        console.log('🔐 Auth Debug Info:');
        console.log('  isLoggedIn (context):', isLoggedIn);
        console.log('  token (context):', token);
        console.log('  phone (context):', phone);
        console.log('  authToken (localStorage):', storedToken);
        console.log('  Match:', isLoggedIn === !!storedToken);
    }, [isLoggedIn, token, phone]);
}
