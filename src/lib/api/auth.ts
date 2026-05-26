/**
 * Centralized Authentication Service Layer
 */

export const authApi = {
    // Organizer/User Login
    login: async (identifier: string, vertical?: string) => {
        const response = await fetch('/backend/api/organizer/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier, vertical }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    // Verify OTP for Organizer/User
    verifyOTP: async (identifier: string, otp: string, vertical?: string) => {
        const response = await fetch('/backend/api/organizer/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier, otp, vertical }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Verification failed');
        return data;
    },

    // Admin Login
    adminLogin: async (identifier: string) => {
        const payload = { email: identifier }; // Backend Login expects Email field
        const response = await fetch('/backend/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Admin login failed');
        return data;
    },

    // Verify Admin OTP
    verifyAdminOTP: async (identifier: string, otp: string) => {
        const response = await fetch('/backend/api/admin/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier, otp }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Admin verification failed');
        return data;
    },

    // Resend OTP
    resendOTP: async (identifier: string, vertical?: string) => {
        const response = await fetch('/backend/api/organizer/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier, vertical }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to resend OTP');
        return data;
    }
};
