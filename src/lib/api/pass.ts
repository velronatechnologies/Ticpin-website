import { BACKEND_API_BASE } from '../backend';
import { fetchWithAuth, postWithAuth } from './fetchWithAuth';
import { clearUserSession } from '../auth/user';

const BASE = `${BACKEND_API_BASE}/pass`;

export interface BenefitCounter {
  total: number;
  used: number;
  remaining: number;
}

export interface DiningVoucherBenefit extends BenefitCounter {
  value_each: number;
}

export interface PassBenefits {
  turf_bookings: BenefitCounter;
  dining_vouchers: DiningVoucherBenefit;
  events_discount_active: boolean;
}

export interface TicpinPass {
  id: string;
  user_id: string;
  phone: string;
  payment_id: string;
  order_id: string;
  price: number;
  status: string;
  start_date: string;
  end_date: string;
  benefits: PassBenefits;
  createdAt: string;
  updatedAt: string;
}

export const passApi = {
  getActivePass: async (userId: string): Promise<TicpinPass | null> => {
    try {
      const res = await fetch(`${BASE}/user/${userId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      // Handle 401 Unauthorized (Expired Token) - Auto logout
      if (res.status === 401) {
        console.warn('[passApi.getActivePass] 401 Unauthorized - Token expired, auto-logging out');
        clearUserSession(true);
        return null;
      }
      
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        console.error(`getActivePass status: ${res.status}`);
        return null;
      }
      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }
      return data;
    } catch (err) {
      console.error("Failed to fetch active pass:", err);
      return null;
    }
  },

  getLatestPass: async (userId: string): Promise<TicpinPass | null> => {
    try {
      const res = await fetch(`${BASE}/user/${userId}/latest`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      // Handle 401 Unauthorized (Expired Token) - Auto logout
      if (res.status === 401) {
        console.warn('[passApi.getLatestPass] 401 Unauthorized - Token expired, auto-logging out');
        clearUserSession(true);
        return await passApi.getActivePass(userId);
      }
      
      if (!res.ok) {
        console.warn(
          `getLatestPass failed with status ${res.status}, falling back to active pass`,
        );
        return await passApi.getActivePass(userId);
      }
      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }
      return data || await passApi.getActivePass(userId);
    } catch (err) {
      console.warn(
        "Failed to fetch latest pass, falling back to active pass:",
        err,
      );
      return await passApi.getActivePass(userId);
    }
  },

  useTurf: async (passId: string): Promise<TicpinPass> => {
    return fetchWithAuth<TicpinPass>(`${BASE}/${passId}/use-turf`, {
      method: "POST",
    });
  },

  useDining: async (passId: string): Promise<TicpinPass> => {
    return fetchWithAuth<TicpinPass>(`${BASE}/${passId}/use-dining`, {
      method: "POST",
    });
  },

  createPassOrder: async (userId: string, phone: string): Promise<any> => {
    return fetchWithAuth<any>("/backend/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify({
        customer_id: userId,
        customer_phone: phone,
        type: "pass",
        amount: 1,
      }),
    });
  },

  verifyPassPayment: async (verificationData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    user_id: string;
    email: string;
    phone: string;
  }): Promise<{ success: boolean }> => {
    try {
      const res = await fetch("/backend/api/payment/verify-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verificationData),
      });
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
        throw new Error(data?.error || data?.message || "Verification failed");
      }
      return data;
    } catch (err) {
      console.error("Failed to verify pass payment:", err);
      throw err;
    }
  },
};
