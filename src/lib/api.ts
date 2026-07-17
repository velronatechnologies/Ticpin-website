import { BACKEND_API_BASE } from './backend';
import { clearUserSession } from './auth/user';

const BASE = BACKEND_API_BASE;

// ─── Generic fetch wrapper with 401 auto-logout ────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  
  // ─── Handle 401 Unauthorized (Expired Token) ───────────────────
  if (res.status === 401) {
    console.warn('[API] 401 Unauthorized - Token expired, logging out user');
    // Clear session and redirect to login
    clearUserSession();
    // The clearUserSession function handles redirect via window.location.reload()
    return Promise.reject(new Error('Session expired. Please login again.'));
  }
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
  return data as T;
}

// ─── Auth – shared shape ───────────────────────────────────────────
export interface LoginResponse {
  message: string;
  organizerId: string;
}

export interface VerifyResponse {
  id: string;
  email: string;
  [key: string]: unknown;
}

// ─── Dining ───────────────────────────────────────────────────────
export const diningApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/organizer/dining/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyOTP: (email: string, otp: string) =>
    request<VerifyResponse>('/organizer/dining/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  submitVerification: (payload: Record<string, unknown>) =>
    request('/organizer/dining/submit-verification', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  create: (payload: Record<string, unknown>) =>
    request('/organizer/dining/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  list: () =>
    request(`/organizer/dining/list`),

  update: (id: string, payload: Record<string, unknown>) =>
    request(`/organizer/dining/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request(`/organizer/dining/${id}`, {
      method: 'DELETE',
    }),
};

// ─── Events ───────────────────────────────────────────────────────
export const eventsApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/organizer/events/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyOTP: (email: string, otp: string) =>
    request<VerifyResponse>('/organizer/events/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  submitVerification: (payload: Record<string, unknown>) =>
    request('/organizer/events/submit-verification', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  create: (payload: Record<string, unknown>) =>
    request('/organizer/events/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  list: () =>
    request(`/organizer/events/list`),

  update: (id: string, payload: Record<string, unknown>) =>
    request(`/organizer/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request(`/organizer/events/${id}`, {
      method: 'DELETE',
    }),
};

// ─── Play ─────────────────────────────────────────────────────────
export const playApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/organizer/play/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyOTP: (email: string, otp: string) =>
    request<VerifyResponse>('/organizer/play/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  submitVerification: (payload: Record<string, unknown>) =>
    request('/organizer/play/submit-verification', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  create: (payload: Record<string, unknown>) =>
    request('/organizer/play/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  list: () =>
    request(`/organizer/play/list`),

  update: (id: string, payload: Record<string, unknown>) =>
    request(`/organizer/play/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request(`/organizer/play/${id}`, {
      method: 'DELETE',
    }),
};

// ─── Payment ─────────────────────────────────────────────────────
export interface CreateOrderRequest {
  amount: number;
  customer_id: string;
  customer_email: string;
  customer_phone: string;
  return_url: string;
  type: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  gateway: string;
  order_id: string;
  payment_session_id?: string;
  razorpay_key?: string;
}

export const paymentApi = {
  createOrder: (payload: CreateOrderRequest) =>
    request<CreateOrderResponse>('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
