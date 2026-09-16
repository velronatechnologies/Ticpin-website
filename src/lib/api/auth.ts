/**
 * Centralized Authentication Service Layer
 */
import { BACKEND_API_BASE } from '../backend';

async function safeAuthFetch(url: string, init?: RequestInit, fallbackError = 'Request failed') {
    const res = await fetch(url, init);
    const text = await res.text();
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
    const trimmed = (text || '').trim();
    const isHtml = trimmed.startsWith('<') || trimmed.includes('<!doctype') || trimmed.includes('<html');

    if (!res.ok) {
        if (isHtml) {
            if ([530, 502, 503, 504].includes(res.status)) {
                throw new Error('Backend server is currently offline. Please try again shortly.');
            }
            throw new Error(`Server error (${res.status}). Please try again.`);
        }
        throw new Error(data?.error || data?.message || fallbackError);
    }
    return data;
}

export const authApi = {
    // Organizer/User Login
    login: async (identifier: string, vertical?: string, verificationCredential?: string) => {
        return safeAuthFetch(`${BACKEND_API_BASE}/organizer/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: identifier, 
                vertical, 
                verification_credential: verificationCredential 
            }),
        }, 'Login failed');
    },

    // Verify OTP for Organizer/User
    verifyOTP: async (identifier: string, otp: string, vertical?: string) => {
        return safeAuthFetch(`${BACKEND_API_BASE}/organizer/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier, otp, vertical }),
        }, 'Verification failed');
    },

    // Admin Login
    adminLogin: async (identifier: string) => {
        const payload = { email: identifier }; // Backend Login expects Email field
        return safeAuthFetch(`${BACKEND_API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }, 'Admin login failed');
    },

    // Verify Admin OTP
    verifyAdminOTP: async (identifier: string, otp: string) => {
        return safeAuthFetch(`${BACKEND_API_BASE}/admin/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier, otp }),
        }, 'Admin verification failed');
    },

    // Resend OTP
    resendOTP: async (identifier: string, vertical?: string) => {
        return safeAuthFetch(`${BACKEND_API_BASE}/organizer/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier, vertical }),
        }, 'Failed to resend OTP');
    }
};
