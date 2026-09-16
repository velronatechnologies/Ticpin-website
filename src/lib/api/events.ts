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
  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  const trimmed = (text || '').trim();
  const isHtml = trimmed.startsWith('<') || trimmed.includes('<!doctype') || trimmed.includes('<html');

  if (!res.ok) {
    if (isHtml) {
      if ([530, 502, 503, 504].includes(res.status)) {
        throw new Error('Backend server is currently offline. Please try again shortly.');
      }
      throw new Error(`Server error (${res.status}). Please try again.`);
    }
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export const eventsApi = {
  login: (email: string) =>
    request<LoginResponse>('/organizer/events/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  signin: (email: string) =>
    request<LoginResponse>('/organizer/events/signin', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  googleAuth: (email: string) =>
    request<VerifyResponse>('/organizer/events/google-auth', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOTP: (email: string, otp: string) =>
    request<VerifyResponse>('/organizer/events/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  /** Resend OTP without password */
  resendOTP: (email: string) =>
    request<{ message: string }>('/organizer/events/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  setup: (payload: SetupPayload) =>
    request<{ message: string; status: string }>('/organizer/events/setup', {
      method: 'POST',
      body: JSON.stringify(payload),
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

  getById: async (id: string) => {
    const items = await request<Record<string, unknown>[]>(`/organizer/events/list`);
    const found = Array.isArray(items) ? items.find((i) => i.id === id) : null;
    if (!found) throw new Error('Event not found');
    return found;
  },

  /** Fetch a single event by ID via the public endpoint (no auth required) */
  getEventDirect: (id: string) =>
    request<Record<string, unknown>>(`/events/${id}`),

  update: (id: string, payload: Record<string, unknown>) =>
    request(`/organizer/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request(`/organizer/events/${id}`, {
      method: 'DELETE',
    }),

  /** Fetch all events for search/listing */
  publicList: () =>
    request<{ data: any[] }>('/events'),
};
