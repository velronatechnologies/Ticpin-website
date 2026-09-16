import { BACKEND_API_BASE } from '../backend';

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

export interface LoginResponse {
  message: string;
  organizerId: string;
}

export interface VerifyResponse {
  _id?: string;
  id?: string;
  email: string;
  categoryStatus?: Record<string, string>;
  [key: string]: unknown;
}

export interface SetupPayload {
  organizerId: string;
  orgType: string;
  phone: string;
  pan?: string;
  panName?: string;
  panCardUrl?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  bankName?: string;
  accountHolder?: string;
  gstNumber?: string;
  backupEmail?: string;
  backupPhone?: string;
  gstList?: string[];
  signature?: string;
  signatoryEmail?: string;
  signedAt?: string;
  signedIP?: string;
}

export const diningApi = {
  /** Login or Create — treats any identifier as valid for requesting OTP */
  login: (email: string) =>
    request<LoginResponse>('/organizer/dining/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  /** Signup (same as login in password-less flow) */
  signin: (email: string) =>
    request<LoginResponse>('/organizer/dining/signin', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  googleAuth: (email: string) =>
    request<VerifyResponse>('/organizer/dining/google-auth', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOTP: (email: string, otp: string) =>
    request<VerifyResponse>('/organizer/dining/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  /** Resend OTP without password — uses dedicated backend endpoint */
  resendOTP: (email: string) =>
    request<{ message: string }>('/organizer/dining/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  /** Submit onboarding setup details — sets dining status to "pending" */
  setup: (payload: SetupPayload) =>
    request<{ message: string; status: string }>('/organizer/dining/setup', {
      method: 'POST',
      body: JSON.stringify(payload),
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

  getById: async (id: string) => {
    const items = await request<Record<string, unknown>[]>(`/organizer/dining/list`);
    const found = Array.isArray(items) ? items.find((i) => i.id === id) : null;
    if (!found) throw new Error('Dining listing not found');
    return found;
  },

  update: (id: string, payload: Record<string, unknown>) =>
    request(`/organizer/dining/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request(`/organizer/dining/${id}`, {
      method: 'DELETE',
    }),

  /** Fetch all dining listings for search/listing */
  publicList: () =>
    request<{ data: any[] }>('/dining'),
};
