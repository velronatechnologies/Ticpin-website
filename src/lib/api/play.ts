import type { LoginResponse, VerifyResponse, SetupPayload } from './dining';
import { BACKEND_API_BASE } from '../backend';
export type { LoginResponse, VerifyResponse, SetupPayload };

const BASE = BACKEND_API_BASE;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  
  if (!res.ok) {
    // Try to parse error from JSON response
    let errorMessage = 'Something went wrong';
    try {
      const data = await res.json();
      errorMessage = data.error ?? data.message ?? 'Something went wrong';
    } catch {
      // If JSON parsing fails, try to get text response
      try {
        errorMessage = await res.text();
      } catch {
        errorMessage = `Request failed with status ${res.status}`;
      }
    }
    throw new Error(errorMessage);
  }
  
  const data = await res.json();
  return data as T;
}

export const playApi = {
  login: (email: string) =>
    request<LoginResponse>('/organizer/play/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  signin: (email: string) =>
    request<LoginResponse>('/organizer/play/signin', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  googleAuth: (email: string) =>
    request<VerifyResponse>('/organizer/play/google-auth', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOTP: (email: string, otp: string) =>
    request<VerifyResponse>('/organizer/play/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  /** Resend OTP without password */
  resendOTP: (email: string) =>
    request<{ message: string }>('/organizer/play/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  setup: (payload: SetupPayload) =>
    request<{ message: string; status: string }>('/organizer/play/setup', {
      method: 'POST',
      body: JSON.stringify(payload),
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

  getByID: (id: string) =>
    request<Record<string, unknown>>(`/organizer/play/${id}`),

  update: (id: string, payload: Record<string, unknown>) =>
    request(`/organizer/play/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request(`/organizer/play/${id}`, {
      method: 'DELETE',
    }),

  /** Fetch all plays for search/listing */
  publicList: () =>
    request<{ data: any[] }>('/play'),

  /** Fetch play details by ID (public) */
  getPlayById: (id: string) =>
    request<any>(`/play/${id}`),
};
