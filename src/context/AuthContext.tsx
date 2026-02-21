'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import Cookies from 'js-cookie';

interface AuthContextType {
    isLoggedIn: boolean;
    phone: string;
    email: string;
    isEmailVerified: boolean;
    isOrganizer: boolean;
    isAdmin: boolean;
    organizerCategory: string | null;
    organizerCategories: string[];
    pendingOrganizerCategory: string | null;
    token: string | null;
    userId: string;
    isLoading: boolean;
    login: (phoneOrEmail: string, token: string, extra?: { email?: string; isEmailVerified?: boolean; isOrganizer?: boolean; userId?: string; organizerCategory?: string | null; organizerCategories?: string[]; isAdmin?: boolean }) => void;
    logout: () => void;
    setPendingOrganizerCategory: (category: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    phone: '',
    email: '',
    isEmailVerified: false,
    isOrganizer: false,
    isAdmin: false,
    organizerCategory: null,
    organizerCategories: [],
    pendingOrganizerCategory: null,
    token: null,
    userId: '',
    isLoading: true,
    login: () => { },
    logout: () => { },
    setPendingOrganizerCategory: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const { isLoggedIn, phone, email, isEmailVerified, isOrganizer, isAdmin, organizerCategory, organizerCategories, pendingOrganizerCategory, token, userId, setAuth, clearAuth, setPendingOrganizerCategory } = useStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const cookieToken = Cookies.get('authToken');

        // If we have a cookie but no store state OR if we want to sync store with current server data
        if (cookieToken) {
            const verifySession = async () => {
                try {
                    const response = await authApi.getProfile();
                    if (response.success && response.data) {
                        const user = response.data;
                        setAuth(user.phone || user.email, cookieToken, {
                            email: user.email,
                            isEmailVerified: user.is_email_verified,
                            isOrganizer: user.is_organizer,
                            isAdmin: user.is_admin,
                            organizerCategory: user.organizer_category,
                            organizerCategories: user.organizer_categories,
                            userId: user.id
                        });
                    } else {
                        // Cookie invalid or session expired
                        Cookies.remove('authToken');
                        clearAuth();
                    }
                } catch (e) {
                    // Profile fetch failed, but don't clear auth immediately unless it's a 401
                    // For now, let's keep the local state if it's a network error
                } finally {
                    setIsLoading(false);
                }
            };

            // If store says logged in, we verify in background. If not, we wait for it.
            if (!isLoggedIn) {
                verifySession();
            } else {
                // Already logged in from persist, but let's sync once in background
                verifySession();
                setIsLoading(false);
            }
        } else {
            // No cookie = definitely not logged in
            if (isLoggedIn) {
                clearAuth();
            }
            setIsLoading(false);
        }
    }, [setAuth, clearAuth]); // Remove isLoggedIn from dependency to prevent loop

    const login = (phoneOrEmail: string, authToken: string, extra?: { email?: string; isEmailVerified?: boolean; isOrganizer?: boolean; userId?: string; organizerCategory?: string | null; organizerCategories?: string[]; isAdmin?: boolean }) => {
        // Set cookie - valid for 7 days. Only enforce secure flag over HTTPS (not localhost).
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
        Cookies.set('authToken', authToken, { expires: 7, secure: isSecure, sameSite: 'lax' });
        // Still update store for reactive UI
        setAuth(phoneOrEmail, authToken, extra);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (e) { }

        // Remove auth cookie
        Cookies.remove('authToken');
        Cookies.remove('authToken', { path: '/' });

        // Clear all localStorage — legacy keys + Zustand persist store
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userAuthId');
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userId');
            localStorage.removeItem('ticpin-auth-store'); // Zustand persist key
            sessionStorage.clear();
        }

        // Reset Zustand in-memory state
        clearAuth();
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, phone, email, isEmailVerified, isOrganizer, isAdmin, organizerCategory, organizerCategories, pendingOrganizerCategory, token, userId, isLoading, login, logout, setPendingOrganizerCategory }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

