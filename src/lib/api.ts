import Cookies from 'js-cookie';

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
    const token = Cookies.get('authToken');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, 30000); // 30 second timeout

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

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
        } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
        }
    } catch (error) {
        console.error('API Error:', error);
        let message = 'An unknown error occurred';

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                message = 'Request timed out. The server is taking too long to respond.';
            } else if (error.message === 'Failed to fetch') {
                message = 'Our servers are currently unreachable. Please check your connection and try again.';
            } else {
                message = error.message;
            }
        } else if (error instanceof TypeError && (error as TypeError).message === 'Failed to fetch') {
            message = 'Our servers are currently unreachable. Please check your connection and try again.';
        }

        return {
            success: false,
            message: message,
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
        return apiRequest<{ user: any; token: string; firebase_info?: any }>('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone, otp, firebase_token: firebaseToken }),
        });
    },

    getProfile: async () => {
        return apiRequest<any>('/api/v1/auth/profile', {
            method: 'GET',
        });
    },

    updateProfile: async (data: {
        name?: string;
        email?: string;
        avatar?: string;
        phone?: string;
        address?: string;
        state?: string;
        district?: string;
        country?: string;
    }) => {
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
        return apiRequest<{ user: any; token: string; firebase_info?: any; organizer_categories?: string[]; organizer_category?: string; is_pan_verified?: boolean; redirect_to?: string }>('/api/v1/organizer/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    organizerGoogleLogin: async (data: any) => {
        return apiRequest<{ user: any; token: string; firebase_info?: any; organizer_categories?: string[]; organizer_category?: string; is_pan_verified?: boolean; redirect_to?: string }>('/api/v1/organizer/auth/google', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    organizerVerifyOtp: async (data: any) => {
        return apiRequest<{ user: any; token: string; organizer_categories?: string[]; organizer_category?: string; is_pan_verified?: boolean; redirect_to?: string }>('/api/v1/organizer/auth/verify-otp', {
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

    organizerForgotPassword: async (email: string) => {
        return apiRequest<any>('/api/v1/organizer/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    organizerResetPassword: async (data: any) => {
        return apiRequest<any>('/api/v1/organizer/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(data),
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

    createDiningBooking: async (bookingData: {
        restaurant_id: string;
        restaurant_name: string;
        date: string;
        time_slot: string;
        guest_count: number;
        guest_name: string;
        special_request: string;
    }) => {
        return apiRequest<any>('/api/v1/bookings/dining', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    },

    createEventBooking: async (bookingData: {
        event_id: string;
        event_title: string;
        ticket_type: string;
        seat_type?: string;
        quantity: number;
        unit_price: number;
        guest_name: string;
        billing_email: string;
        billing_state: string;
    }) => {
        return apiRequest<any>('/api/v1/bookings/event', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    },

    getUserBookings: async (type?: 'play' | 'dining' | 'event') => {
        const url = type ? `/api/v1/bookings?type=${type}` : `/api/v1/bookings`;
        return apiRequest<any>(url, {
            method: 'GET',
        });
    },

    getBookingById: async (id: string, type: string = 'play') => {
        return apiRequest<any>(`/api/v1/bookings/${id}?type=${type}`, {
            method: 'GET',
        });
    },
};

// Events, Play, Dining Public APIs
export const eventsApi = {
    getAll: async (limit: number = 20, cursor?: string, category?: string, city?: string, q?: string, all?: boolean, status?: string) => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append('cursor', cursor);
        if (category) params.append('category', category);
        if (city) params.append('city', city);
        if (q) params.append('q', q);
        if (all) params.append('all', 'true');
        if (status) params.append('status', status);
        return apiRequest<any>(`/api/v1/events?${params.toString()}`);
    },
    getById: async (id: string) => {
        return apiRequest<any>(`/api/v1/events/${id}`);
    },
    adminCreate: async (data: any) => {
        return apiRequest<any>('/api/v1/admin/events', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    adminUpdate: async (id: string, data: any) => {
        return apiRequest<any>(`/api/v1/admin/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    delete: async (id: string) => {
        return apiRequest<any>(`/api/v1/events/${id}`, {
            method: 'DELETE',
        });
    },
    adminDelete: async (id: string) => {
        return apiRequest<any>(`/api/v1/admin/events/${id}`, {
            method: 'DELETE',
        });
    },
    approve: async (id: string, status: string, reason?: string) => {
        const params = new URLSearchParams({ status });
        if (reason) params.append('reason', reason);
        return apiRequest<any>(`/api/v1/admin/events/${id}/approve?${params.toString()}`, {
            method: 'PATCH',
        });
    },
    resubmit: async (id: string) => {
        return apiRequest<any>(`/api/v1/events/organizer/${id}/resubmit`, {
            method: 'PATCH',
        });
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
    getAll: async (limit: number = 20, cursor?: string, category?: string, city?: string, q?: string, all?: boolean) => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append('cursor', cursor);
        if (category) params.append('category', category);
        if (city) params.append('city', city);
        if (q) params.append('q', q);
        if (all) params.append('all', 'true');
        return apiRequest<any>(`/api/v1/play?${params.toString()}`);
    },
    getById: async (id: string) => {
        return apiRequest<any>(`/api/v1/play/id/${id}`);
    },
    getBySlug: async (slug: string) => {
        return apiRequest<any>(`/api/v1/play/${slug}`);
    },
    adminCreate: async (data: any) => {
        return apiRequest<any>('/api/v1/admin/play', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    adminUpdate: async (id: string, data: any) => {
        return apiRequest<any>(`/api/v1/admin/play/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    delete: async (id: string) => {
        return apiRequest<any>(`/api/v1/play/${id}`, {
            method: 'DELETE',
        });
    },
    adminDelete: async (id: string) => {
        return apiRequest<any>(`/api/v1/admin/play/${id}`, {
            method: 'DELETE',
        });
    },
    approve: async (id: string, status: string, reason?: string) => {
        const params = new URLSearchParams({ status });
        if (reason) params.append('reason', reason);
        return apiRequest<any>(`/api/v1/admin/play/${id}/approve?${params.toString()}`, {
            method: 'PATCH',
        });
    },
    resubmit: async (id: string) => {
        return apiRequest<any>(`/api/v1/play/organizer/${id}/resubmit`, {
            method: 'PATCH',
        });
    }
};

export const diningApi = {
    getAll: async (limit: number = 20, cursor?: string, category?: string, city?: string, q?: string, all?: boolean) => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append('cursor', cursor);
        if (category) params.append('category', category);
        if (city) params.append('city', city);
        if (q) params.append('q', q);
        if (all) params.append('all', 'true');
        return apiRequest<any>(`/api/v1/dining?${params.toString()}`);
    },
    getById: async (id: string) => {
        return apiRequest<any>(`/api/v1/dining/id/${id}`);
    },
    getBySlug: async (slug: string) => {
        return apiRequest<any>(`/api/v1/dining/${slug}`);
    },
    adminCreate: async (data: any) => {
        return apiRequest<any>('/api/v1/admin/dining', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    adminUpdate: async (id: string, data: any) => {
        return apiRequest<any>(`/api/v1/admin/dining/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    delete: async (id: string) => {
        return apiRequest<any>(`/api/v1/dining/${id}`, {
            method: 'DELETE',
        });
    },
    adminDelete: async (id: string) => {
        return apiRequest<any>(`/api/v1/admin/dining/${id}`, {
            method: 'DELETE',
        });
    },
    approve: async (id: string, status: string, reason?: string) => {
        const params = new URLSearchParams({ status });
        if (reason) params.append('reason', reason);
        return apiRequest<any>(`/api/v1/admin/dining/${id}/approve?${params.toString()}`, {
            method: 'PATCH',
        });
    },
    resubmit: async (id: string) => {
        return apiRequest<any>(`/api/v1/dining/organizer/${id}/resubmit`, {
            method: 'PATCH',
        });
    }
};

// Auth Helper Functions
export const storeAuthToken = (token: string) => {
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    Cookies.set('authToken', token, { expires: 7, secure: isSecure, sameSite: 'lax' });
};

export const getAuthToken = () => {
    return Cookies.get('authToken');
};

export const removeAuthToken = () => {
    Cookies.remove('authToken');
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

export const aiApi = {
    chat: async (messages: any[], venueData: any) => {
        return apiRequest<any>('/api/v1/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ messages, venue_data: venueData }),
        });
    },
    chatStream: async (messages: any[], venueData: any, onChunk: (content: string) => void) => {
        const token = Cookies.get('authToken');
        const response = await fetch(`${API_BASE_URL}/api/v1/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({ messages, venue_data: venueData }),
        });

        if (!response.ok) throw new Error('AI Chat failed');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (reader) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                    const dataStr = trimmed.slice(6);
                    if (dataStr === '[DONE]') return;
                    try {
                        const data = JSON.parse(dataStr);
                        const content = data.choices?.[0]?.delta?.content || '';
                        if (content) onChunk(content);
                    } catch (e) {
                        // Part of JSON might be in buffer
                    }
                }
            }
        }
    }
};

// Partner/Organizer APIs
export const partnerApi = {
    getMyStatus: async () => {
        return apiRequest<any>('/api/v1/partners/my-status');
    },
    getStatusByCategory: async (category: string) => {
        return apiRequest<any>(`/api/v1/partners/my-status?category=${category}`);
    },
    getPrefillData: async () => {
        return apiRequest<any>('/api/v1/partners/prefill');
    },
    submitVerification: async (data: any) => {
        return apiRequest<any>('/api/v1/partners/verify', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    verifyPan: async (data: { pan: string; name: string; dob?: string }) => {
        return apiRequest<any>('/api/v1/partners/verify-pan', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    getMyEvents: async () => {
        return apiRequest<any>('/api/v1/events/organizer/my');
    },
    getMyPlayVenues: async () => {
        return apiRequest<any>('/api/v1/play/organizer/my');
    },
    getMyDiningVenues: async () => {
        return apiRequest<any>('/api/v1/dining/organizer/my');
    },
};

export const commonApi = {
    searchLocations: async (q: string) => {
        return apiRequest<any>(`/api/v1/locations/search?q=${encodeURIComponent(q)}`);
    },
};
