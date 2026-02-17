// API Configuration and Helper Functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

// Helper function to make API requests
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include', // Support cookies
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response. Is the backend running?');
        }

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'API request failed'
            };
        }

        return {
            success: true,
            message: data.message || '',
            data: data.data
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        };
    }
}

// Authentication APIs
export const authApi = {
    sendOtp: async (phone: string) => {
        return apiRequest<any>('/api/v1/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ phone }),
        });
    },

    login: async (phone: string, otp: string, firebaseToken?: string) => {
        return apiRequest<{ user: any; token: string }>('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone, otp, firebase_token: firebaseToken }),
        });
    },

    getProfile: async () => {
        return apiRequest<any>('/api/v1/auth/profile', {
            method: 'GET',
        });
    },

    updateProfile: async (data: { name?: string; email?: string; avatar?: string; phone?: string }) => {
        return apiRequest<any>('/api/v1/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    sendEmailOtp: async (email: string) => {
        return apiRequest<any>('/api/v1/auth/email/send-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    verifyEmail: async (email: string, otp: string) => {
        return apiRequest<any>('/api/v1/auth/email/verify', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        });
    },

    // Organizer Auth
    organizerRegister: async (data: any) => {
        return apiRequest<any>('/api/v1/organizer/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    organizerLogin: async (data: any) => {
        return apiRequest<{ user: any; token: string }>('/api/v1/organizer/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    organizerGoogleLogin: async (data: any) => {
        return apiRequest<{ user: any; token: string }>('/api/v1/organizer/auth/google', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    organizerVerifyOtp: async (data: any) => {
        return apiRequest<{ user: any; token: string }>('/api/v1/organizer/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    organizerResendOtp: async (email: string) => {
        return apiRequest<any>('/api/v1/organizer/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    logout: async () => {
        return apiRequest<any>('/api/v1/auth/logout', {
            method: 'POST',
        });
    },
};

// Booking APIs
export const bookingApi = {
    createPlayBooking: async (bookingData: {
        venue_id: string;
        venue_name: string;
        sport: string;
        date: string;
        time_slot: string;
        player_name: string;
        price: number;
        billing_email: string;
        billing_state: string;
        billing_nationality: string;
    }) => {
        return apiRequest<any>('/api/v1/bookings/play', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    },

    getUserBookings: async (type: 'play' | 'dining') => {
        return apiRequest<any[]>(`/api/v1/bookings?type=${type}`, {
            method: 'GET',
        });
    },

    getBookingById: async (id: string) => {
        return apiRequest<any>(`/api/v1/bookings/${id}`, {
            method: 'GET',
        });
    },
};

// Events, Play, Dining Public APIs
export const eventsApi = {
    getAll: async (limit: number = 20, cursor?: string, category?: string, city?: string, q?: string) => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append('cursor', cursor);
        if (category) params.append('category', category);
        if (city) params.append('city', city);
        if (q) params.append('q', q);
        return apiRequest<any>(`/api/v1/events?${params.toString()}`);
    },
    getById: async (id: string) => {
        return apiRequest<any>(`/api/v1/events/${id}`);
    }
};

export const artistsApi = {
    getAll: async () => {
        return apiRequest<any[]>('/api/v1/artists');
    },
    getById: async (id: string) => {
        return apiRequest<any>(`/api/v1/artists/${id}`);
    },
    seed: async () => {
        return apiRequest<any>('/api/v1/artists/seed', { method: 'POST' });
    }
};

export const playApi = {
    getAll: async (limit: number = 20, cursor?: string, category?: string, city?: string, q?: string) => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append('cursor', cursor);
        if (category) params.append('category', category);
        if (city) params.append('city', city);
        if (q) params.append('q', q);
        return apiRequest<any>(`/api/v1/play?${params.toString()}`);
    },
    getById: async (id: string) => {
        return apiRequest<any>(`/api/v1/play/id/${id}`);
    },
    getBySlug: async (slug: string) => {
        return apiRequest<any>(`/api/v1/play/${slug}`);
    }
};

export const diningApi = {
    getAll: async (limit: number = 20, cursor?: string, category?: string, city?: string, q?: string) => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append('cursor', cursor);
        if (category) params.append('category', category);
        if (city) params.append('city', city);
        if (q) params.append('q', q);
        return apiRequest<any>(`/api/v1/dining?${params.toString()}`);
    },
    getById: async (id: string) => {
        return apiRequest<any>(`/api/v1/dining/id/${id}`);
    },
    getBySlug: async (slug: string) => {
        return apiRequest<any>(`/api/v1/dining/${slug}`);
    }
};

// Auth Helper Functions
export const storeAuthToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
    }
};

export const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
    }
};

export const isAuthenticated = () => {
    return !!getAuthToken();
};

export const offersApi = {
    getAll: async () => {
        return apiRequest<any[]>('/api/v1/offers');
    },
    getByUserId: async (userId: string) => {
        return apiRequest<any[]>(`/api/v1/offers/user/${userId}`);
    },
    create: async (data: any) => {
        return apiRequest<any>('/api/v1/offers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    seed: async () => {
        return apiRequest<any>('/api/v1/offers/seed', { method: 'POST' });
    }
};
