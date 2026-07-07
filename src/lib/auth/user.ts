import { useState, useEffect } from 'react';

// ─── User Session ──────────────────────────────────────────────────

export interface UserSession {
    id: string;
    phone: string;
    email?: string;
    name?: string;
    profilePhoto?: string;
}

function getCookieRaw(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(
        new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
    );
    return match ? match[1] : null;
}

function setCookieRaw(name: string, value: string, days: number) {
    if (typeof document === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

function deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; SameSite=Lax; Max-Age=-1`;
    const host = window.location.hostname;
    document.cookie = `${name}=; path=/; domain=${host}; Max-Age=-1`;
    document.cookie = `${name}=; path=/; domain=.${host}; Max-Age=-1`;
}

function decodeSessionCookie(raw: string | null): UserSession | null {
    if (!raw) return null;
    try {
        const json = atob(raw);
        return JSON.parse(json) as UserSession;
    } catch {
        return null;
    }
}

/** Read user session from the readable user session cookie */
export function getUserSession(): UserSession | null {
    return (
        decodeSessionCookie(getCookieRaw('ticpin_user_session_info')) ??
        decodeSessionCookie(getCookieRaw('ticpin_user_session'))
    );
}

/** Save user session to cookie */
export function saveUserSession(session: UserSession): void {
    if (typeof window === 'undefined') return;
    const encoded = btoa(JSON.stringify(session));
    setCookieRaw('ticpin_user_session_info', encoded, 6);
    setCookieRaw('ticpin_user_session', encoded, 6);
    window.dispatchEvent(new Event('user-auth-change'));
}

/** Clear user session */
export function clearUserSession(): void {
    if (typeof window === 'undefined') return;

    // Call backend to log out user and reset active_role
    fetch('/backend/api/auth/logout/user', { method: 'POST', credentials: 'include' })
        .catch(err => console.error('[Auth] User Logout API call failed:', err));

    // Clear readable UI cookies. HttpOnly auth cookies are cleared by the backend logout endpoint.
    deleteCookie('ticpin_user_session_info');
    deleteCookie('ticpin_user_session');
    deleteCookie('active_role');
    
    // Clear user-specific storage keys
    sessionStorage.removeItem('dining_cart');
    sessionStorage.removeItem('event_cart');
    sessionStorage.removeItem('play_cart');
    
    // BUG FIX #1: Clear additional booking state
    sessionStorage.removeItem('payment_attempt');
    sessionStorage.removeItem('reservation_timer');
    sessionStorage.removeItem('event_booking_pending');
    sessionStorage.removeItem('dining_booking_pending');
    sessionStorage.removeItem('play_booking_pending');
    
    // BUG FIX #2: Clear lock key to prevent lock key replay attacks
    localStorage.removeItem('ticpin_lock_key');
    
    window.dispatchEvent(new Event('user-auth-change'));
    
    setTimeout(() => {
        window.location.reload();
    }, 100);
}

/** React hook to get and track user session */
export function useUserSession() {
    // Initialize directly from cookie on the client — no null flash
    const [session, setSession] = useState<UserSession | null>(() => {
        if (typeof window === 'undefined') return null;
        return getUserSession();
    });

    useEffect(() => {
        // Re-read on mount (handles SSR mismatch) and on auth changes
        const load = () => setSession(getUserSession());
        load();
        window.addEventListener('user-auth-change', load);
        return () => window.removeEventListener('user-auth-change', load);
    }, []);

    return session;
}
