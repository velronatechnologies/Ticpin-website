import { BACKEND_API_BASE } from '../backend';
import { fetchWithAuth, postWithAuth } from './fetchWithAuth';

const BASE = BACKEND_API_BASE;

export interface BookingTicketItem {
    category: string;
    price: number;
    quantity: number;
}

export interface CreateBookingPayload {
    user_email: string;
    user_name: string;
    user_phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    nationality: string;
    event_id: string;
    event_name: string;
    tickets: BookingTicketItem[];
    order_amount: number;
    booking_fee: number;
    coupon_code?: string;
    offer_id?: string;
    user_id?: string;
    payment_id?: string;
    order_id?: string;
    payment_gateway?: string;
    status?: string;
    use_ticpass?: boolean; // New field for Ticpass discount
    reservation_id?: string;
    donation_amount?: number;
}

export interface CreateDiningPayload {
    user_email: string;
    user_name: string;
    user_phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    nationality: string;
    dining_id: string;
    venue_name: string;
    date: string;
    time_slot: string;
    guests: number;
    order_amount: number;
    booking_fee: number;
    coupon_code?: string;
    offer_id?: string;
    user_id?: string;
    payment_id?: string;
    order_id?: string;
    payment_gateway?: string;
    status?: string;
    use_ticpass?: boolean; // New field for Ticpass discount
}

export interface CreatePlayPayload {
    user_email: string;
    user_name: string;
    user_phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    nationality: string;
    play_id: string;
    venue_name: string;
    date: string;
    slot: string;
    duration: number;
    tickets: BookingTicketItem[];
    order_amount: number;
    booking_fee: number;
    coupon_code?: string;
    offer_id?: string;
    user_id?: string;
    payment_id?: string;
    order_id?: string;
    payment_gateway?: string;
    status?: string;
    use_ticpass?: boolean;
}

export interface PaymentOrderRequest {
    amount: number;
    customer_id?: string;
    customer_email?: string;
    customer_phone: string;
    return_url?: string;
    type?: string; // "event", "play", "dining"
    notes?: Record<string, string>;
}

export interface PaymentOrderResponse {
    gateway: 'cashfree' | 'razorpay';
    order_id: string;
    payment_session_id?: string; // Cashfree
    razorpay_key?: string;       // Razorpay
}

export interface BookingResult {
    booking_id: string;
    grand_total: number;
    discount_amount: number;
    status: string;
    message: string;
}

export interface OfferItem {
    id: string;
    title: string;
    description: string;
    discount_type: 'percent' | 'flat';
    discount_value: number;
    valid_until: string;
}

export interface CouponValidateResult {
    valid: boolean;
    discount_amount: number;
    coupon: {
        code: string;
        discount_type: string;
        discount_value: number;
    };
}

export interface AvailabilityResult {
    booked: Record<string, number>;
}

export const bookingApi = {
    /** Create a payment order (picks Cashfree or Razorpay via traffic weight) */
    createPaymentOrder: async (payload: PaymentOrderRequest): Promise<PaymentOrderResponse> => {
        return fetchWithAuth<PaymentOrderResponse>(`${BASE}/payment/create-order`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    /** Create an event booking (no auth required) */
    createEventBooking: async (payload: CreateBookingPayload): Promise<BookingResult> => {
        const res = await fetch(`${BASE}/bookings/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        let data: any = {};
        try { data = await res.json(); } catch { data = {}; }
        if (!res.ok) throw new Error(data.error ?? 'Booking failed');
        return data as BookingResult;
    },

    /** Validate a coupon code */
    validateCoupon: async (
        code: string,
        category: string,
        orderAmount: number,
        userId?: string,
        entityId?: string
    ): Promise<CouponValidateResult> => {
        return fetchWithAuth<CouponValidateResult>(`${BASE}/coupons/validate`, {
            method: 'POST',
            body: JSON.stringify({
                code,
                category,
                order_amount: orderAmount,
                user_id: userId,
                entity_id: entityId,
            }),
        });
    },

    /** Create a dining booking */
    createDiningBooking: async (payload: CreateDiningPayload): Promise<BookingResult> => {
        const res = await fetch(`${BASE}/bookings/dining`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        let data: any = {};
        try { data = await res.json(); } catch { data = {}; }
        if (!res.ok) throw new Error(data.error ?? 'Dining booking failed');
        return data as BookingResult;
    },

    /** Create a play booking */
    createPlayBooking: async (payload: CreatePlayPayload): Promise<BookingResult> => {
        const res = await fetch(`${BASE}/bookings/play`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        let data: any = {};
        try { data = await res.json(); } catch { data = {}; }
        if (!res.ok) throw new Error(data.error ?? 'Play booking failed');
        return data as BookingResult;
    },

    /** Get active offers for an event */
    getEventOffers: async (eventId: string): Promise<OfferItem[]> => {
        const res = await fetch(`${BASE}/events/${eventId}/offers`);
        if (!res.ok) return [];
        try {
            const data = await res.json();
            return data as OfferItem[];
        } catch {
            return [];
        }
    },

    /** Get active offers for dining */
    getDiningOffers: async (diningId: string): Promise<OfferItem[]> => {
        const res = await fetch(`${BASE}/dining/${diningId}/offers`);
        if (!res.ok) return [];
        try {
            const data = await res.json();
            return data as OfferItem[];
        } catch {
            return [];
        }
    },

    /** Get active offers for play */
    getPlayOffers: async (playId: string): Promise<OfferItem[]> => {
        const res = await fetch(`${BASE}/play/${playId}/offers`);
        if (!res.ok) return [];
        try {
            const data = await res.json();
            return data as OfferItem[];
        } catch {
            return [];
        }
    },

    /** Get seat availability (booked counts) for an event */
    getEventAvailability: async (eventId: string): Promise<AvailabilityResult> => {
        const res = await fetch(`${BASE}/events/${eventId}/availability`);
        if (!res.ok) return { booked: {} };
        try {
            const data = await res.json();
            return data as AvailabilityResult;
        } catch {
            return { booked: {} };
        }
    },

    /** Get active coupons for a category.
     *  Pass userId to also receive user-specific coupons for that user;
     *  pass entityId to filter coupons applicable to that entity.
     */
    getCouponsByCategory: async (category: string, userId?: string, entityId?: string): Promise<any[]> => {
        const params = new URLSearchParams();
        if (userId) params.append('user_id', userId);
        if (entityId) params.append('entity_id', entityId);
        const queryString = params.toString();
        const url = queryString ? `${BASE}/coupons/${category}?${queryString}` : `${BASE}/coupons/${category}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        try {
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    },
    /** Fetch all bookings for a user by multiple identifiers */
    getUserBookings: async ({ email, phone, userId }: { email?: string; phone?: string; userId?: string }): Promise<any[]> => {
        const params = new URLSearchParams();
        if (email) params.append('email', email);
        if (phone) params.append('phone', phone);
        if (userId) params.append('userId', userId);
        
        return fetchWithAuth<any[]>(`${BASE}/bookings/user/history?${params.toString()}`, {
            method: 'GET',
        }).catch((err) => {
            if (err.message.includes('UNAUTHORIZED')) {
                return [];
            }
            throw err;
        });
    },
    /** Get detailed booking information by ID */
    getBookingDetails: async (bookingId: string, userId?: string): Promise<any> => {
        const url = userId
            ? `${BASE}/bookings/${bookingId}?user_id=${encodeURIComponent(userId)}`
            : `${BASE}/bookings/${bookingId}`;
        return fetchWithAuth<any>(url, {
            method: 'GET',
        }).catch((err) => {
            if (err.message.includes('UNAUTHORIZED')) {
                throw new Error('UNAUTHORIZED');
            }
            throw err;
        });
    },

    /** Fetch all bookings for a user formatted for mobile */
    getMobileUserBookings: async ({ email, phone, userId }: { email?: string; phone?: string; userId?: string }): Promise<any[]> => {
        const params = new URLSearchParams();
        if (email) params.append('email', email);
        if (phone) params.append('phone', phone);
        if (userId) params.append('userId', userId);
        
        return fetchWithAuth<any[]>(`${BASE}/mobile/bookings?${params.toString()}`, {
            method: 'GET',
        }).catch((err) => {
            if (err.message.includes('UNAUTHORIZED')) {
                return [];
            }
            throw err;
        });
    },

    /** Get detailed booking information for mobile by ID */
    getMobileBookingDetails: async (bookingId: string, userId?: string): Promise<any> => {
        const url = userId
            ? `${BASE}/mobile/bookings/${bookingId}?user_id=${encodeURIComponent(userId)}`
            : `${BASE}/mobile/bookings/${bookingId}`;
        return fetchWithAuth<any>(url, {
            method: 'GET',
        }).catch((err) => {
            if (err.message.includes('UNAUTHORIZED')) {
                throw new Error('UNAUTHORIZED');
            }
            throw err;
        });
    },


    cancelBooking: async (id: string, category: string, reason?: string, donationAmount?: number): Promise<{ message: string }> => {
        const bodyData: any = {};
        if (reason) bodyData.reason = reason;
        if (donationAmount !== undefined) bodyData.donationAmount = donationAmount;

        return fetchWithAuth<{ message: string }>(
            `${BASE}/bookings/${id}/cancel?category=${category}`,
            {
                method: 'PUT',
                body: Object.keys(bodyData).length > 0 ? JSON.stringify(bodyData) : undefined,
            }
        );
    },

    checkActiveReservation: async (eventId: string, userId: string, reservationId?: string): Promise<any> => {
        let url = `${BASE}/bookings/events/active-reservation?event_id=${encodeURIComponent(eventId)}&user_id=${encodeURIComponent(userId)}`;
        if (reservationId) {
            url += `&reservation_id=${encodeURIComponent(reservationId)}`;
        }
        return fetchWithAuth<any>(url, {
            method: 'GET',
        }).catch(() => ({ active: false }));
    },

    createReservation: async (eventId: string, userId: string, tickets: Array<{ category: string, quantity: number }>, previousReservationId?: string): Promise<any> => {
        const payload: any = { event_id: eventId, user_id: userId, tickets };
        if (previousReservationId) {
            payload.previous_reservation_id = previousReservationId;
        }
        return fetchWithAuth<any>(`${BASE}/bookings/events/reserve`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    unlockReservation: async (reservationId: string): Promise<any> => {
        return fetchWithAuth<any>(`${BASE}/bookings/events/unlock-reservation`, {
            method: 'POST',
            body: JSON.stringify({ reservation_id: reservationId }),
        });
    },
};
