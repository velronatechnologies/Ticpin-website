'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken, storeAuthToken, removeAuthToken, authApi } from '@/lib/api';
import { useStore } from '@/store/useStore';

interface AuthContextType {
    isLoggedIn: boolean;
    phone: string;
    email: string;
    isEmailVerified: boolean;
    isOrganizer: boolean;
    token: string | null;
    userId: string;
    login: (phoneOrEmail: string, token: string, extra?: { email?: string; isEmailVerified?: boolean; userId?: string }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    phone: '',
    email: '',
    isEmailVerified: false,
    isOrganizer: false,
    token: null,
    userId: '',
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const { isLoggedIn, phone, email, isEmailVerified, isOrganizer, token, userId, setAuth, clearAuth } = useStore();

    // Sync localStorage on mount (Zustand persist handles most of it, but let's be sure)
    useEffect(() => {
        const savedToken = getAuthToken();
        const savedPhoneOrEmail = typeof window !== 'undefined' ? localStorage.getItem('userAuthId') : null;
        const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : '';
        if (savedToken && savedPhoneOrEmail && !isLoggedIn) {
            setAuth(savedPhoneOrEmail, savedToken, { userId: savedUserId || '' });
        }
    }, [isLoggedIn, setAuth]);

    const login = (phoneOrEmail: string, authToken: string, extra?: { email?: string; isEmailVerified?: boolean; userId?: string }) => {
        storeAuthToken(authToken);
        if (typeof window !== 'undefined') {
            localStorage.setItem('userAuthId', phoneOrEmail);
            if (extra?.userId) localStorage.setItem('userId', extra.userId);
        }
        setAuth(phoneOrEmail, authToken, extra);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (e) { }

        removeAuthToken();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userAuthId');
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userId');
        }
        clearAuth();
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, phone, email, isEmailVerified, isOrganizer, token, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
