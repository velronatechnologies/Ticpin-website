'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, Trash2, X, Tag, CheckCircle2, ChevronDown, Clock, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useReservationStore } from '@/store/useReservationStore';
import { bookingApi, OfferItem, PaymentOrderResponse } from '@/lib/api/booking';
import { profileApi } from '@/lib/api/profile';
import Link from 'next/link';
import { useUserSession } from '@/lib/auth/user';
import { useOrganizerSession, clearOrganizerSession } from '@/lib/auth/organizer';
import { getBookingStatus } from '@/lib/utils/booking-status';
import { toast } from '@/components/ui/Toast';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const AuthModal = dynamic(() => import('@/components/modals/AuthModal'), { ssr: false });
const OrganizerLogoutModal = dynamic(() => import('@/components/modals/OrganizerLogoutModal'), { ssr: false });
const ProfileDrawer = dynamic(() => import('@/components/layout/Navbar/ProfileDrawer'), { ssr: false });
const SuccessView = dynamic(() => import('./SuccessView'), { ssr: false });


interface CartData {
    eventId: string;
    eventName: string;
    city: string;
    tickets: { name: string; price: number; quantity: number }[];
    totalPrice: number;
    type?: 'event' | 'dining' | 'play';
    date?: string;
    timeSlot?: string;
    guests?: number;
    slot?: string;
    duration?: number;
    offerId?: string | null;
    offerType?: string | null;
    use_pass?: boolean;
    pass_id?: string;
}

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
    'Lakshadweep', 'Puducherry'
];

/** Dynamically load a third-party payment SDK script (idempotent). */
function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(s);
    });
}

export default function ReviewBookingPage() {
    const router = useRouter();
    const params = useParams();
    const name = params?.name as string;
    const session = useUserSession();
    const organizerSession = useOrganizerSession();
    const billingRef = useRef<HTMLDivElement>(null);
    const [cart, setCart] = useState<CartData | null>(null);
    const [eventData, setEventData] = useState<{id: string; name: string} | null>(null);


    



    const [offers, setOffers] = useState<OfferItem[]>([]);
    const [appliedOffer, setAppliedOffer] = useState<OfferItem | null>(null);
    const [offerDiscount, setOfferDiscount] = useState(0);

    // Coupon
    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

    // Inline UI state
    const [expandedSection, setExpandedSection] = useState<'none' | 'offers' | 'coupons'>('none');
    const [showGstDetails, setShowGstDetails] = useState(false);

    // User details
    const [email, setEmail] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // Billing details
    const [billing, setBilling] = useState({
        name: '',
        phone: '',
        nationality: 'Indian resident',
        state: '',
    });

    // All required billing fields completed
    const billingComplete =
        (billing.name || '').trim() !== '' &&
        (billing.phone || '').trim().length >= 10 &&
        (billing.nationality || '').trim() !== '' &&
        (billing.state || '').trim() !== '' &&
        acceptedTerms;

    // Flow state
    const [step, setStep] = useState<'review' | 'billing' | 'success'>('review');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingId, setBookingId] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [pass, setPass] = useState<any>(null);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const [previousBookings, setPreviousBookings] = useState<any[]>([]);
    const [showTimerWarning, setShowTimerWarning] = useState(false);
    const [phoneInputValue, setPhoneInputValue] = useState('');
    const isPayingRef = useRef(false);
    const hasPrefilledRef = useRef(false);
    const timerWarningShownRef = useRef(false);
    const razorpayRef = useRef<any>(null);

    const reservationStore = useReservationStore();
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isValidating, setIsValidating] = useState(true);

    // Validate reservation on mount
    useEffect(() => {
        const validateReservation = async () => {
            if (!session?.id) {
                setIsValidating(false);
                return;
            }

            const savedCart = sessionStorage.getItem('ticpin_cart');
            if (!savedCart) {
                router.replace(`/events/${name}/book`);
                return;
            }

            const parsedCart = JSON.parse(savedCart);
            const eventId = parsedCart.eventId;

            try {
                // Check if backend has active reservation
                const activeRes = await bookingApi.checkActiveReservation(eventId, session.id);
                if (activeRes.active) {
                    // Update Zustand
                    reservationStore.setReservation(
                        activeRes.reservation_id,
                        activeRes.event_id,
                        activeRes.tickets.map((t: any) => ({
                            name: t.category,
                            price: parsedCart.tickets.find((c: any) => c.name === t.category)?.price || 0,
                            quantity: t.quantity
                        })),
                        activeRes.expires_at
                    );
                } else {
                    // Stale / expired on backend, clear Zustand and redirect back
                    reservationStore.clearReservation();
                    sessionStorage.removeItem('ticpin_cart');
                    toast.error("Your ticket lock has expired. Please select tickets again.");
                    router.replace(`/events/${name}/book`);
                }
            } catch (err) {
                console.error("Failed to validate reservation on backend:", err);
            } finally {
                setIsValidating(false);
            }
        };

        validateReservation();
    }, [session?.id, name, router]);

    // Timer countdown with 3-min warning + 5-min auto-unlock
    useEffect(() => {
        const expiresAt = reservationStore.expiresAt;
        if (!expiresAt || step === 'success') return;

        const updateTimer = () => {
            if (isPayingRef.current) return;

            const expiresTime = new Date(expiresAt).getTime();
            const now = Date.now();
            const diff = Math.max(0, Math.floor((expiresTime - now) / 1000));
            setTimeRemaining(diff);

            // Show warning popup at 3 minutes (180 seconds)
            if (diff === 180 && !timerWarningShownRef.current) {
                timerWarningShownRef.current = true;
                setShowTimerWarning(true);
            }

            // Auto-unlock and redirect at 5 minutes remaining (300 seconds = 5 min, so unlock at expiry - 5min)
            // Actually auto-unlock when time reaches 0
            if (diff <= 0) {
                clearInterval(interval);
                toast.error("Your ticket reservation has expired. Redirecting...");
                
                // Close Razorpay popup if open
                if (razorpayRef.current) {
                    try {
                        razorpayRef.current.close();
                    } catch (e) {
                        console.error("Failed to close Razorpay popup:", e);
                    }
                    razorpayRef.current = null;
                }
                
                // Unlock on backend
                if (reservationStore.reservationId) {
                    bookingApi.unlockReservation(reservationStore.reservationId).catch(console.error);
                }
                
                // Clear state
                reservationStore.clearReservation();
                sessionStorage.removeItem('ticpin_cart');
                router.replace(`/events/${name}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [reservationStore.expiresAt, reservationStore.reservationId, name, router, step]);

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const saved = sessionStorage.getItem('ticpin_cart');
        if (saved) {
            const data = JSON.parse(saved);
            // Default to 'event' if not specified
            const cartData = { ...data, type: data.type || 'event' };
            setCart(cartData);
            
            // Set eventData when cart is loaded for events
            if (cartData.type === 'event' && cartData.eventId) {
                setEventData({ id: cartData.eventId, name: cartData.eventName });
            }
        }

        const savedEmail = sessionStorage.getItem('ticpin_billing_email');
        if (savedEmail) setEmail(savedEmail);

        const savedBilling = sessionStorage.getItem('ticpin_billing_data');
        if (savedBilling) {
            try {
                const parsed = JSON.parse(savedBilling);
                setBilling(prev => ({
                    ...prev,
                    ...parsed,
                    nationality: parsed.nationality || prev.nationality || 'Indian resident',
                    state: parsed.state || prev.state || '',
                }));
            } catch (e) { }
        }

        // ── Cashfree redirect return ───────────────────────────────────
        const urlParams = new URLSearchParams(window.location.search);
        const cfOrderId = urlParams.get('order_id');
        if (cfOrderId && cfOrderId.startsWith('TICPIN_')) {
            const pending = sessionStorage.getItem('ticpin_pending_payment');
            if (pending) {
                try {
                    const p = JSON.parse(pending);
                    if (p.cart) {
                        setCart(p.cart);
                        if (p.cart.type === 'event' && p.cart.eventId) {
                            setEventData({ id: p.cart.eventId, name: p.cart.eventName });
                        }
                        setStep('billing');
                        setBookingLoading(true);
                        window.history.replaceState(null, '', window.location.pathname);
                        setTimeout(() => {
                            completeBookingWithData(
                                p.orderID,
                                'cashfree',
                                p.cart,
                                p.email,
                                p.sessionId,
                                p.orderAmount,
                                p.bookingFee,
                                p.grandTotal,
                                p.appliedCoupon || '',
                                p.offerId,
                                p.cart.use_pass
                            );
                        }, 200);
                    }
                } catch (e) {
                    console.error('Cashfree return parse error', e);
                }
            }
        }

        if (session?.id) {
            import('@/lib/api/pass').then(({ passApi }) => {
                passApi.getActivePass(session.id!).then(setPass);
            });
        }
    }, [router, session?.id]);

    // Also pre-fill with session data if available and state is empty
    useEffect(() => {
        const loadUserData = async () => {
            if (session?.id && !hasPrefilledRef.current) {
                try {
                    // Fetch profile and booking history in parallel
                    const [profile, history] = await Promise.all([
                        profileApi.getProfile(session.id).catch(() => null),
                        bookingApi.getUserBookings({ userId: session.id }).catch(() => [])
                    ]);

                    // Extract and store last 3 confirmed bookings
                    const confirmed = (Array.isArray(history) ? history : [])
                        ?.filter((b: any) => { const s = getBookingStatus(b).toLowerCase(); return s === 'booked' || s === 'confirmed'; })
                        ?.sort((a: any, b: any) => new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime())
                        ?.slice(0, 3);
                    setPreviousBookings(confirmed || []);

                    // Find latest successful booking
                    const latestBooking = (Array.isArray(history) ? [...history] : [])
                        ?.filter((b: any) => { const s = getBookingStatus(b).toLowerCase(); return s === 'booked' || s === 'confirmed'; })
                        ?.sort((a: any, b: any) => new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime())[0];

                    setBilling(prev => {
                        const newBilling = {
                            name: prev.name || latestBooking?.user_name || profile?.name || session?.name || '',
                            phone: prev.phone || latestBooking?.user_phone || profile?.phone || session?.phone || '',
                            nationality: prev.nationality || latestBooking?.nationality || 'Indian resident',
                            state: prev.state || latestBooking?.state || profile?.state || '',
                        };
                        sessionStorage.setItem('ticpin_billing_data', JSON.stringify(newBilling));
                        return newBilling;
                    });

                    if (!email) {
                        const newEmail = latestBooking?.user_email || profile?.email || session?.email || '';
                        setEmail(newEmail);
                        if (newEmail) sessionStorage.setItem('ticpin_billing_email', newEmail);
                    }
                    hasPrefilledRef.current = true;
                } catch (err) {
                    console.error('Failed to load user data', err);
                }
            }
        };
        loadUserData();
    }, [session, email]);

    // Persist changes
    useEffect(() => {
        if (email) sessionStorage.setItem('ticpin_billing_email', email);
    }, [email]);

    useEffect(() => {
        if (billing.name || billing.phone || billing.state) {
            sessionStorage.setItem('ticpin_billing_data', JSON.stringify(billing));
        }
    }, [billing]);

    const clearReservationAndFlow = (clearCart: boolean = true, markForceRestart: boolean = false) => {
        if (reservationStore.reservationId && step !== 'success') {
            bookingApi.unlockReservation(reservationStore.reservationId).catch(console.error);
        }
        if (reservationStore.reservationId || reservationStore.eventId || reservationStore.selectedSeats.length || reservationStore.expiresAt) {
            reservationStore.clearReservation();
        }
        timerWarningShownRef.current = false;
        setShowTimerWarning(false);
        setTimeRemaining(0);
        sessionStorage.removeItem('ticpin_booking_step');
        sessionStorage.removeItem('ticpin_pending_payment');
        if (markForceRestart) {
            sessionStorage.setItem('ticpin_force_new_selection', '1');
        }
        if (clearCart) {
            sessionStorage.removeItem('ticpin_cart');
        }
    };

    useEffect(() => {
        const entityId = cart?.eventId;
        const entityType = cart?.type || 'event';
        if (!entityId) return;

        // Fetch offers by entity ID and type (same pattern as play review page)
        const fetchOffers = entityType === 'dining'
            ? bookingApi.getDiningOffers(entityId)
            : entityType === 'play'
                ? bookingApi.getPlayOffers(entityId)
                : bookingApi.getEventOffers(entityId);

        fetchOffers.then(res => {
            const arr = Array.isArray(res) ? res : [];
            setOffers(arr);
            // Auto-apply if cart has a pre-selected offer ID
            if (cart?.offerId) {
                const match = arr.find((o: OfferItem) => o.id === cart.offerId);
                if (match) applyOffer(match);
            }
        }).catch(() => setOffers([]));

        // Fetch coupons for the entity category — include userId for personalised coupons
        bookingApi.getCouponsByCategory(entityType, session?.id).then(res => {
            setAvailableCoupons(Array.isArray(res) ? res : []);
        }).catch(() => setAvailableCoupons([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart?.eventId, cart?.type, session?.id]);

    const orderAmount = cart?.totalPrice ?? 0;
    const bookingFee = Math.round(orderAmount * 0.1);
    
    const isPassApplied = cart?.use_pass ?? false;
    const passDiscount = (isPassApplied && pass?.benefits.events_discount_active) 
        ? Math.round(orderAmount * 0.1) 
        : 0;
        
    const totalDiscount = offerDiscount + couponDiscount + passDiscount;
    const grandTotal = Math.max(0, orderAmount + bookingFee - totalDiscount);

    const removeTicket = async (i: number) => {
        if (!cart || !session?.id) return;

        const newTickets = cart.tickets.filter((_, idx) => idx !== i);
        
        if (newTickets.length === 0) {
            // If all tickets removed, release reservation and redirect back
            try {
                if (reservationStore.reservationId) {
                    await bookingApi.unlockReservation(reservationStore.reservationId);
                }
            } catch (e) {
                console.error(e);
            }
            reservationStore.clearReservation();
            sessionStorage.removeItem('ticpin_cart');
            router.replace(`/events/${name}/book`);
            return;
        }

        const ticketReqs = newTickets.map(t => ({
            category: t.name,
            quantity: t.quantity
        }));

        try {
            const res = await bookingApi.createReservation(cart.eventId, session.id, ticketReqs);
            if (res.success) {
                // Update Zustand
                reservationStore.setReservation(
                    res.reservation_id,
                    cart.eventId,
                    newTickets,
                    res.expires_at
                );

                const newTotal = newTickets.reduce((s, t) => s + t.price * t.quantity, 0);
                const newCart = { ...cart, tickets: newTickets, totalPrice: newTotal };
                setCart(newCart);
                sessionStorage.setItem('ticpin_cart', JSON.stringify(newCart));
                
                if (appliedOffer) applyOffer(appliedOffer, newTotal);
                if (appliedCoupon) validateCoupon(couponInput, newTotal);
                
                toast.success("Ticket removed!");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update reservation.");
        }
    };

    const updateTicketQuantity = async (i: number, newQuantity: number) => {
        if (!cart || !session?.id) return;
        const oldQuantity = cart.tickets[i].quantity;

        if (newQuantity < 1) {
            removeTicket(i);
            return;
        }

        // Optimistically calculate new tickets array
        const newTickets = cart.tickets.map((t, idx) => 
            idx === i ? { ...t, quantity: newQuantity } : t
        );

        // Format for backend
        const ticketReqs = newTickets.map(t => ({
            category: t.name,
            quantity: t.quantity
        }));

        try {
            // Re-reserve with new quantities. This deletes the old reservation and locks new seats
            const res = await bookingApi.createReservation(cart.eventId, session.id, ticketReqs);

            if (res.success) {
                // Update Zustand
                reservationStore.setReservation(
                    res.reservation_id,
                    cart.eventId,
                    newTickets,
                    res.expires_at
                );

                // Update local cart state
                const newTotal = newTickets.reduce((s, t) => s + t.price * t.quantity, 0);
                const newCart = { ...cart, tickets: newTickets, totalPrice: newTotal };
                setCart(newCart);
                sessionStorage.setItem('ticpin_cart', JSON.stringify(newCart));
                
                if (appliedOffer) applyOffer(appliedOffer, newTotal);
                if (appliedCoupon) validateCoupon(couponInput, newTotal);
                
                toast.success("Ticket quantity updated!");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update reservation. Selected tickets may not be available.");
        }
    };

    const applyOffer = (offer: OfferItem, base?: number) => {
        if (grandTotal === 0 && offer.id !== appliedOffer?.id) {
            toast.warning("The total is already ₹0. No more offers can be applied.");
            return;
        }
        const amount = base ?? orderAmount;
        let disc = offer.discount_type === 'percent'
            ? Math.round(amount * offer.discount_value / 100)
            : Math.min(offer.discount_value, amount);
        setOfferDiscount(disc);
        setAppliedOffer(offer);
        setExpandedSection('none');
    };

    const removeOffer = () => {
        setAppliedOffer(null);
        setOfferDiscount(0);
    };

    const validateCoupon = async (code?: string, base?: number) => {
        if (grandTotal === 0 && !appliedCoupon) {
            toast.warning("The total is already ₹0. No coupon needed.");
            return;
        }
        const c = code ?? couponInput;
        if (!c.trim()) return;
        const amount = base ?? orderAmount;
        setCouponLoading(true);
        setCouponError('');
        setCouponSuccess('');
        try {
            const result = await bookingApi.validateCoupon(c.trim(), 'event', amount, session?.id);
            setCouponDiscount(Math.round(result.discount_amount));
            setAppliedCoupon(c.toUpperCase());
            setCouponSuccess(`✓ Coupon applied! You save ₹${Math.round(result.discount_amount)}`);
            setExpandedSection('none');
        } catch (err: unknown) {
            setCouponError(err instanceof Error ? err.message : 'Invalid coupon');
            setCouponDiscount(0);
            setAppliedCoupon('');
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon('');
        setCouponDiscount(0);
        setCouponInput('');
        setCouponSuccess('');
        setCouponError('');
    };

    // Handle phone input with +91 prefix - 10 digits only
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        // Keep only last 10 digits
        if (value.length > 10) {
            value = value.slice(-10);
        }
        setPhoneInputValue(value);
        if (value.length === 10) {
            setBilling(b => ({ ...b, phone: value }));
        }
    };

    // Browser back: release lock and reset flow.
    // Keep refresh intact so lock/cart persist on same page refresh.
    useEffect(() => {
        const handlePopState = () => {
            clearReservationAndFlow(true, true);
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [reservationStore.reservationId, step]);

    const handleContinue = () => {
        if (organizerSession) {
            setShowLogoutModal(true);
            return;
        }

        if (!session) {
            setShowAuthModal(true);
            return;
        }

        const activePhone = (billing.phone || session?.phone || '').trim().replace(/\D/g, '');
        if (!activePhone || activePhone.length < 10) {
            setBookingError('Please verify your profile phone number');
            return;
        }

        if (billing.phone !== activePhone) {
            setBilling(b => ({ ...b, phone: activePhone }));
        }

        setBookingError('');
        setStep('billing');
        setTimeout(() => {
            billingRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    /** Called after payment succeeds (Razorpay callback or Cashfree redirect return).
     *  Accepts all data explicitly so it works even after a page redirect. */
    const completeBookingWithData = async (
        paymentId: string,
        paymentGateway: string,
        cartData: CartData,
        emailData: string,
        sessionId: string | undefined,
        oAmt: number,
        bFee: number,
        gTotal: number,
        coupon: string,
        offerId: string | undefined,
        usePass?: boolean,
    ) => {
        setBookingLoading(true);
        setBookingError('');
        isPayingRef.current = true;
        try {
            let result;
            if (cartData.type === 'dining') {
                result = await bookingApi.createDiningBooking({
                    user_email: emailData,
                    user_name: billing.name,
                    user_phone: billing.phone,
                    nationality: billing.nationality,
                    state: billing.state,
                    dining_id: cartData.eventId,
                    venue_name: cartData.eventName,
                    date: cartData.date || '',
                    time_slot: cartData.timeSlot || '',
                    guests: cartData.guests || 1,
                    order_amount: oAmt,
                    booking_fee: bFee,
                    coupon_code: coupon || undefined,
                    offer_id: offerId,
                    user_id: sessionId,
                    payment_id: paymentId,
                    payment_gateway: paymentGateway,
                    status: 'booked',
                    use_ticpass: usePass,
                });
            } else if (cartData.type === 'play') {
                result = await bookingApi.createPlayBooking({
                    user_email: emailData,
                    user_name: billing.name,
                    user_phone: billing.phone,
                    nationality: billing.nationality,
                    state: billing.state,
                    play_id: cartData.eventId,
                    venue_name: cartData.eventName,
                    date: cartData.date || '',
                    slot: cartData.slot || '',
                    duration: cartData.duration || 1,
                    tickets: cartData.tickets.map(t => ({
                        category: t.name,
                        price: t.price,
                        quantity: t.quantity,
                    })),
                    order_amount: oAmt,
                    booking_fee: bFee,
                    coupon_code: coupon || undefined,
                    offer_id: offerId,
                    user_id: sessionId,
                    payment_id: paymentId,
                    payment_gateway: paymentGateway,
                    status: 'booked',
                    use_ticpass: usePass,
                });
            } else {
                result = await bookingApi.createEventBooking({
                    user_email: emailData,
                    user_name: billing.name,
                    user_phone: billing.phone,
                    nationality: billing.nationality,
                    state: billing.state,
                    event_id: cartData.eventId,
                    event_name: cartData.eventName,
                    tickets: cartData.tickets.map(t => ({
                        category: t.name,
                        price: t.price,
                        quantity: t.quantity,
                    })),
                    order_amount: oAmt,
                    booking_fee: bFee,
                    coupon_code: coupon || undefined,
                    offer_id: offerId,
                    user_id: sessionId,
                    payment_id: paymentId,
                    payment_gateway: paymentGateway,
                    status: 'booked',
                    use_ticpass: usePass,
                    reservation_id: reservationStore.reservationId || undefined,
                });
            }
            setBookingId(result.booking_id);
            reservationStore.clearReservation();
            sessionStorage.removeItem('ticpin_cart');
            sessionStorage.removeItem('ticpin_billing_email');
            sessionStorage.removeItem('ticpin_billing_data');
            sessionStorage.removeItem('ticpin_booking_step');
            sessionStorage.removeItem('ticpin_pending_payment');
            setStep('success');
        } catch (err: unknown) {
            setBookingError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
            isPayingRef.current = false;
        } finally {
            setBookingLoading(false);
        }
    };

    const handlePayNow = async () => {
        if (!(billing.name || '').trim()) { setBookingError('Please enter your full name'); return; }
        if (!email.trim() || !email.includes('@')) { setBookingError('Please enter a valid email address'); return; }
        if (!(billing.nationality || '').trim()) { setBookingError('Please select your nationality'); return; }
        if (!(billing.state || '').trim()) { setBookingError('Please select your state'); return; }
        if (!acceptedTerms) {
            setBookingError('Please accept the terms and conditions');
            return;
        }
        if (!cart) return;

        if (isPayingRef.current) return;
        isPayingRef.current = true;
        setBookingLoading(true);
        setBookingError('');

        // Booking email is informational for this booking; no duplicate-account blocking needed.

        // Skip payment flow if grand total is 0
        if (grandTotal === 0) {
            await completeBookingWithData(
                isPassApplied ? `PASS_${cart.pass_id}_${Date.now()}` : `FREE_BOOKING_${Date.now()}`,
                isPassApplied ? 'TICPASS' : 'FREE',
                cart,
                email,
                session?.id,
                orderAmount,
                0, // booking fee
                0, // grand total
                appliedCoupon || '',
                appliedOffer?.id
            );
            return;
        }

        try {
            // Step 1: Create a payment order (picks Cashfree or Razorpay via traffic weight)
            const orderRes: PaymentOrderResponse = await bookingApi.createPaymentOrder({
                amount: grandTotal,
                customer_phone: billing.phone,
                customer_email: email || `user_${billing.phone}@ticpin.in`,
                customer_id: session?.id || `phone_${billing.phone}`,
                return_url: `${window.location.origin}${window.location.pathname}`,
                type: cart.type || 'event',
            });

            // Step 2: Store pending booking data so we can complete after redirect (Cashfree)
            sessionStorage.setItem('ticpin_pending_payment', JSON.stringify({
                gateway: orderRes.gateway,
                orderID: orderRes.order_id,
                cart,
                email,
                sessionId: session?.id,
                orderAmount,
                bookingFee,
                grandTotal,
                appliedCoupon,
                offerId: appliedOffer?.id,
            }));

            if (orderRes.gateway === 'cashfree') {
                // Cashfree — load SDK and redirect to hosted payment page
                await loadScript('https://sdk.cashfree.com/js/v3/cashfree.js');
                const cashfree = (window as any).Cashfree({
                    mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
                });
                cashfree.checkout({
                    paymentSessionId: orderRes.payment_session_id,
                    redirectTarget: '_self',
                });
                // Page will redirect — do NOT set loading false here
            } else {
                // Razorpay — inline modal, no redirect needed
                await loadScript('https://checkout.razorpay.com/v1/checkout.js');
                const options = {
                    key: orderRes.razorpay_key,
                    amount: grandTotal * 100,
                    currency: 'INR',
                    order_id: orderRes.order_id,
                    name: 'Ticpin',
                    description: cart.eventName,
                    method: {
                        upi: true,
                        card: true,
                        netbanking: true,
                        wallet: true
                    },
                    prefill: {
                        name: billing.name,
                        email,
                        contact: billing.phone,
                    },
                    theme: { color: '#5331EA' },
                    handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string }) => {
                        razorpayRef.current = null;
                        await completeBookingWithData(
                            response.razorpay_payment_id,
                            'razorpay',
                            cart,
                            email,
                            session?.id,
                            orderAmount,
                            bookingFee,
                            grandTotal,
                            appliedCoupon,
                            appliedOffer?.id,
                            isPassApplied,
                        );
                    },
                    modal: {
                        ondismiss: () => {
                            razorpayRef.current = null;
                            sessionStorage.removeItem('ticpin_pending_payment');
                            setBookingLoading(false);
                            isPayingRef.current = false;
                            setBookingError('Payment was cancelled. Please try again.');
                        },
                    },
                };
                const rzp = new (window as any).Razorpay(options);
                razorpayRef.current = rzp;
                rzp.open();
            }
        } catch (err: unknown) {
            setBookingLoading(false);
            isPayingRef.current = false;
            setBookingError(err instanceof Error ? err.message : 'Payment initiation failed. Please try again.');
        }
    };

    const toggleSection = (section: 'offers' | 'coupons') => {
        setExpandedSection(prev => prev === section ? 'none' : section);
    };

    const handleOrganizerLogout = () => {
        clearOrganizerSession();
        setShowAuthModal(true);
    };

    if (step === 'success') {
        return (
            <SuccessView
                bookingId={bookingId}
                cart={cart}
                grandTotal={grandTotal}
                billing={billing}
                session={session}
                email={email}
                setIsProfileDrawerOpen={setIsProfileDrawerOpen}
            />
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)] overflow-x-hidden" style={{ background: 'rgba(211, 203, 245, 0.1)' }}>
            <style>{`
                /* Hide scrollbars while keeping functionality */
                .hide-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;      /* Firefox */
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;  /* Chrome, Safari and Opera */
                }
            `}</style>

            {/* Header */}
            <header className="w-full h-[60px] md:h-[70px] bg-white flex items-center justify-between px-6 md:px-10 border-b border-[#FFFFFF] shadow-sm relative z-10 shrink-0">
                <div className="flex-shrink-0 cursor-pointer" onClick={() => {
                    clearReservationAndFlow(true);
                    router.push('/');
                }}>
                    <Image src="/ticpin-logo-black.png" alt="TICPIN" width={159} height={25} className="h-[20px] md:h-[25px] w-auto object-contain" />
                </div>
                <h1 className="text-[18px] md:text-[22px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                    {step === 'billing' ? 'Billing Details' : 'Review your booking'}
                </h1>
                <div className="flex items-center gap-3">
                    <div 
                        className="w-[48px] h-[48px] md:w-[52px] md:h-[52px] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 border border-[#E5E7EB] hover:scale-[1.08] active:scale-[0.95] shadow-sm hover:shadow-md"
                        onClick={() => {
                            if (!session?.id) {
                                setShowAuthModal(true);
                            } else {
                                setIsProfileDrawerOpen(true);
                            }
                        }}
                    >
                        <User className="text-[#4B5563]" size={24} />
                    </div>
                </div>
            </header>

            {timeRemaining > 0 && (
                <div className="w-full bg-[#f4effe] flex items-center justify-center py-1.5 border-b border-[#e9defe] shrink-0">
                    <Clock className="w-4 h-4 text-[#5331EA] mr-2" />
                    <span className="text-[13px] font-medium text-[#4a3978]">
                        Complete your booking in <span className="text-[#5331EA] font-bold">{formatTimer(timeRemaining)}</span> mins
                    </span>
                </div>
            )}

            <main className="w-full max-w-[1100px] mx-auto px-6 py-4 space-y-4 flex-grow overflow-x-hidden">

                <div className="w-full bg-white border border-white rounded-[20px] shadow-sm">
                    <div className="p-4 md:p-5">
                        <div className="flex justify-between items-center mb-2 mt-[-10px]">
                            <h2 style={{ color: 'black', fontSize: '26px', fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}>
                                Order Summary
                            </h2>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #1DB954', flexShrink: 0 }} />
                        </div>

                        <div className="border-t border-[#AEAEAE] pt-4 space-y-4 mx-[-16px] md:mx-[-20px] px-4 md:px-5">

                            {/* ITEM DETAILS */}
                            <div>
                                <div className="flex items-center gap-2 mb-2 mt-[-10px]">
                                    <h3 style={{ color: 'black', fontSize: '20px', fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)', fontWeight: 100, lineHeight: '40px' }} className="uppercase">
                                        {cart?.type === 'dining' ? 'RESERVATION' : cart?.type === 'play' ? 'SLOTS' : 'TICKETS'}
                                    </h3>
                                    <div className="flex-grow h-[0.5px] bg-[#AEAEAE]" />
                                </div>

                                {cart?.tickets && cart.tickets.length > 0 ? cart.tickets.map((ticket, i) => (
                                    <div key={i} className="border border-[#AEAEAE] rounded-[10px] p-3 flex justify-between items-start relative mb-3">
                                        <div className="space-y-1">
                                            <h4 className="text-[18px] md:text-[22px] font-bold text-black">
                                                {cart.eventName} <span className="font-normal mx-1">|</span> {cart.city}
                                            </h4>
                                            <p className="text-[12px] md:text-[14px] text-[#686868] font-medium uppercase tracking-tight">{ticket.name}</p>

                                            {/* Details for Dining/Play */}
                                            {(cart.type === 'dining' || cart.type === 'play') && (
                                                <div className="flex flex-col gap-1 mt-2">
                                                    {cart.date && (
                                                        <p className="text-[15px] text-[#686868] font-medium uppercase">
                                                            {cart.type === 'play' ? `${cart.slot} Feb` : `${cart.date} Feb`}
                                                            {cart.timeSlot && ` • ${cart.timeSlot}`}
                                                            {cart.slot && cart.type !== 'play' && ` • ${cart.slot}`}
                                                        </p>
                                                    )}
                                                    {cart.type === 'play' && (
                                                        <p className="text-[13px] text-[#AEAEAE] font-medium uppercase tracking-wider italic">
                                                            {ticket.name}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-2 border border-[#AEAEAE] rounded-[6px] px-2 py-1">
                                                    <button
                                                        onClick={() => updateTicketQuantity(i, ticket.quantity - 1)}
                                                        className="w-[24px] h-[24px] flex items-center justify-center text-[16px] font-bold text-black hover:text-[#5331EA] transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-[30px] text-center text-[14px] font-semibold text-black">
                                                        {ticket.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateTicketQuantity(i, ticket.quantity + 1)}
                                                        className="w-[24px] h-[24px] flex items-center justify-center text-[16px] font-bold text-black hover:text-[#5331EA] transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="text-[#AEAEAE]">×</span>
                                                <p className="text-[14px] text-[#686868]">₹{ticket.price.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-4">
                                            <Trash2 size={14} className="text-[#AEAEAE] cursor-pointer hover:text-red-500 transition-colors"
                                                onClick={() => removeTicket(i)}
                                            />
                                            <span style={{ color: 'black', fontSize: '20px', fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}>
                                                ₹{(ticket.price * ticket.quantity).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-[#AEAEAE]">
                                        <p className="text-[16px]">No selection found.</p>
                                        <button onClick={() => router.back()} className="text-[14px] text-black underline mt-2">Go back to selection</button>
                                    </div>
                                )}
                            </div>

                            {/* OFFERS */}
                            < div >
                                <div className="flex items-center gap-4 mb-4 mt-[-20px]">
                                    <h3 style={{ color: 'black', fontSize: '25px', fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)', fontWeight: 100, lineHeight: '60px' }} className="uppercase">OFFERS</h3>
                                    <div className="flex-grow h-[0.5px] bg-[#AEAEAE]" />
                                </div>

                                {appliedOffer && (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-[10px] p-3 px-5 mb-3">
                                        <div className="flex items-center gap-3">
                                            <Tag size={16} className="text-green-600" />
                                            <div>
                                                <p className="text-[14px] font-semibold text-green-700">{appliedOffer.title}</p>
                                                <p className="text-[12px] text-green-600">-₹{offerDiscount.toLocaleString('en-IN')} discount applied</p>
                                            </div>
                                        </div>
                                        <button onClick={removeOffer} className="text-[#AEAEAE] hover:text-red-500 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                {appliedCoupon && (
                                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-[10px] p-3 px-5 mb-3">
                                        <div className="flex items-center gap-3">
                                            <Tag size={16} className="text-blue-600" />
                                            <div>
                                                <p className="text-[14px] font-semibold text-blue-700">Code: {appliedCoupon}</p>
                                                <p className="text-[12px] text-blue-600">-₹{couponDiscount.toLocaleString('en-IN')} discount applied</p>
                                            </div>
                                        </div>
                                        <button onClick={removeCoupon} className="text-[#AEAEAE] hover:text-red-500 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                <div className="border border-[#AEAEAE] rounded-[15px] overflow-hidden mt-[-10px] bg-[#FDFDFD]">
                                    <div className="border-b border-[#F0F0F0]">
                                        <div
                                            className="flex items-center justify-between p-4 px-6 cursor-pointer hover:bg-[#fafafa] transition-colors"
                                            onClick={() => toggleSection('offers')}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-6 h-6 rounded-full border-[2px] border-black flex items-center justify-center text-[15px] font-bold">%</div>
                                                <span style={{ color: 'black', fontSize: '20px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}>
                                                    {appliedOffer ? `Offer applied: ${appliedOffer.title}` : `View all ${cart?.type || 'event'} offers`}
                                                    {offers?.length > 0 && !appliedOffer && (
                                                        <span className="ml-2 text-[13px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{offers.length} available</span>
                                                    )}
                                                </span>
                                            </div>
                                            {expandedSection === 'offers' ? <ChevronDown size={18} className="text-black" /> : <ChevronRight size={18} className="text-black" />}
                                        </div>

                                        {expandedSection === 'offers' && (
                                            <div className="p-6 pt-0 space-y-4 animate-in fade-in duration-300">
                                                {!offers || offers.length === 0 ? (
                                                    <p className="text-[14px] text-[#AEAEAE] pb-4">No offers available for this {cart?.type || 'event'}.</p>
                                                ) : (
                                                    offers.map((offer, i) => (
                                                        <div key={i} className="border border-[#F0F0F0] bg-white rounded-[12px] p-4 flex justify-between items-center transition-all hover:border-[#AEAEAE]">
                                                            <div className="flex-1 pr-4">
                                                                <p className="text-[16px] font-bold text-black">{offer.title}</p>
                                                                <p className="text-[13px] text-[#686868]">{offer.description}</p>
                                                                <p className="text-[12px] text-green-600 font-semibold mt-1">
                                                                    {offer.discount_type === 'percent' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => applyOffer(offer)}
                                                                className={`px-4 h-[34px] rounded-[6px] text-[13px] font-bold uppercase transition-all ${appliedOffer?.id === offer.id ? 'bg-green-100 text-green-700' : 'bg-black text-white hover:bg-zinc-800'}`}
                                                            >
                                                                {appliedOffer?.id === offer.id ? 'Applied' : 'Apply'}
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div
                                            className="flex items-center justify-between p-4 px-6 cursor-pointer hover:bg-[#fafafa] transition-colors"
                                            onClick={() => toggleSection('coupons')}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-6 h-6 flex items-center justify-center relative">
                                                    <Image src="/events/cupon.svg" alt="Coupons" fill className="object-contain" />
                                                </div>
                                                <span style={{ color: 'black', fontSize: '20px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}>
                                                    {appliedCoupon ? `Code applied: ${appliedCoupon}` : 'View coupon codes'}
                                                    {availableCoupons.length > 0 && !appliedCoupon && (
                                                        <span className="ml-2 text-[13px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{availableCoupons.length} available</span>
                                                    )}
                                                </span>
                                            </div>
                                            {expandedSection === 'coupons' ? <ChevronDown size={18} className="text-black" /> : <ChevronRight size={18} className="text-black" />}
                                        </div>

                                        {expandedSection === 'coupons' && (
                                            <div className="p-6 pt-0 space-y-4 animate-in fade-in duration-300">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={couponInput}
                                                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                                                        onKeyDown={e => e.key === 'Enter' && validateCoupon()}
                                                        placeholder="ENTER CODE"
                                                        className="flex-1 h-[45px] border border-[#AEAEAE] rounded-[8px] px-4 focus:outline-none focus:border-black text-[14px] font-bold uppercase placeholder:normal-case placeholder:font-medium"
                                                    />
                                                    <button
                                                        onClick={() => validateCoupon()}
                                                        disabled={couponLoading || !couponInput.trim()}
                                                        className="px-6 h-[45px] bg-[#AC9BF7] text-white rounded-[8px] text-[13px] font-bold uppercase disabled:opacity-40 transition-all active:scale-[0.98]"
                                                    >
                                                        {couponLoading ? '...' : 'APPLY'}
                                                    </button>
                                                </div>
                                                {couponError && <p className="text-red-500 text-[12px] font-medium">{couponError}</p>}
                                                {couponSuccess && <p className="text-green-600 text-[12px] font-bold">{couponSuccess}</p>}

                                                {/* Available Coupons List — backend already filtered for this user */}
                                                {availableCoupons.length > 0 && !appliedCoupon && (
                                                    <div className="space-y-2 mt-4">
                                                        {availableCoupons.map((c, i) => {
                                                            const expiry = new Date(c.valid_until);
                                                            const now = new Date();
                                                            const hoursLeft = (expiry.getTime() - now.getTime()) / 36e5;
                                                            const isExpiringSoon = hoursLeft <= 24;
                                                            const expiryLabel = expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                                                            const usesLeft = c.max_uses > 0 ? c.max_uses - (c.used_count ?? 0) : null;
                                                            return (
                                                                <div key={i} className={`flex items-center justify-between p-3 border rounded-[10px] bg-white ${isExpiringSoon ? 'border-orange-300' : 'border-[#F0F0F0]'}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                                            <Tag size={14} className={isExpiringSoon ? 'text-orange-400' : 'text-[#AEAEAE]'} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[14px] font-bold text-black uppercase">{c.code}</p>
                                                                            <p className="text-[11px] text-[#686868] uppercase font-medium">
                                                                                {c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                                                                            </p>
                                                                            <p className={`text-[10px] font-medium mt-0.5 ${isExpiringSoon ? 'text-orange-500' : 'text-[#AEAEAE]'}`}>
                                                                                {isExpiringSoon ? `⚠ Expires today (${expiryLabel})` : `Valid till ${expiryLabel}`}
                                                                                {usesLeft !== null && ` · ${usesLeft} use${usesLeft !== 1 ? 's' : ''} left`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => validateCoupon(c.code)}
                                                                        className="px-4 py-1.5 bg-[#AC9BF7] text-white rounded-[8px] text-[11px] font-bold uppercase transition-all"
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                <div className="bg-[#f9f9f9] p-3 rounded-[8px]">
                                                    <p className="text-[12px] text-[#686868] font-medium leading-tight">
                                                        {session?.id
                                                            ? 'Showing coupons available for your account. Only one coupon can be applied per order.'
                                                            : 'Login to see personalised coupon codes. Only one coupon can be applied per order.'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* PAYMENT DETAILS */}
                            <div>
                                <div className="flex items-center gap-2 mb-2 mt-[-10px]">
                                    <h3 style={{ color: 'black', fontSize: '20px', fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)', fontWeight: 100, lineHeight: '40px' }} className="uppercase">PAYMENT DETAILS</h3>
                                    <div className="flex-grow h-[0.5px] bg-[#AEAEAE]" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mt-[-10px]" style={{ color: 'black', fontSize: '18px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}>
                                        <span>Subtotal</span>
                                        <span>₹{orderAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div
                                            className="flex justify-between items-center cursor-pointer group"
                                            onClick={() => setShowGstDetails(!showGstDetails)}
                                            style={{ color: '#686868', fontSize: '18px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}
                                        >
                                            <div className="flex items-center gap-1 group-hover:text-black transition-colors">
                                                <span>Booking fee (inc. of GST)</span>
                                                <ChevronRight size={18} className={`transition-transform duration-300 ${showGstDetails ? 'rotate-90' : ''}`} />
                                            </div>
                                            <span>₹{bookingFee.toLocaleString('en-IN')}</span>
                                        </div>
                                        {showGstDetails && (
                                            <div className="pl-4 pr-1 mt-2 mb-1 space-y-2 animate-in slide-in-from-top-2 duration-300 overflow-hidden">
                                                <div className="flex justify-between text-[16px] text-[#686868] font-medium">
                                                    <span>Base Platform Fee</span>
                                                    <span>₹{Math.round(bookingFee / 1.18).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between text-[16px] text-[#686868] font-medium">
                                                    <span>Integrated GST (18%)</span>
                                                    <span>₹{(bookingFee - Math.round(bookingFee / 1.18)).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="h-[0.5px] bg-[#EBEBEB] w-full" />
                                            </div>
                                        )}
                                    </div>
                                    {passDiscount > 0 && (
                                        <div className="flex justify-between items-center" style={{ color: '#5331EA', fontSize: '18px', fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}>
                                            <span>TicPin Pass Member Discount (10%)</span>
                                            <span>-₹{passDiscount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    {totalDiscount - passDiscount > 0 && (
                                        <div className="flex justify-between items-center" style={{ color: '#16a34a', fontSize: '18px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}>
                                            <span>Other Discounts applied</span>
                                            <span>-₹{(totalDiscount - passDiscount).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="h-[0.5px] bg-[#AEAEAE] mt-2" />
                                    <div className="pt-2 flex justify-between items-center" style={{ color: 'black', fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}>
                                        <span style={{ fontSize: '20px' }}>Grand total</span>
                                        <span style={{ fontSize: '25px', color: grandTotal === 0 ? '#5331EA' : 'black', fontWeight: 900 }}>
                                            {grandTotal === 0 ? 'FREE' : `₹${grandTotal.toLocaleString('en-IN')}`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* PHONE & CONTINUE */}
                            {step === 'review' && (
                                <div className="space-y-3 pt-2">
                                    <div>
                                        <label className="text-[14px] font-semibold text-[#686868] block mb-1">
                                            Mobile number for booking confirmation
                                        </label>
                                        <div className="w-full h-[50px] border border-[#AEAEAE] rounded-[10px] px-4 flex items-center bg-white">
                                            <span className="text-[16px] font-semibold text-black mr-2">🇮🇳 +91</span>
                                            <input
                                                type="text"
                                                value={phoneInputValue || billing.phone}
                                                onChange={handlePhoneChange}
                                                placeholder="Enter 10-digit mobile"
                                                maxLength={10}
                                                inputMode="numeric"
                                                className="flex-1 h-full bg-transparent focus:outline-none text-black font-semibold text-[15px] placeholder:text-[#AEAEAE]"
                                                style={{ fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}
                                            />
                                            {(phoneInputValue?.length === 10 || (billing.phone && billing.phone.length === 10)) && (
                                                <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full uppercase ml-2">
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {bookingError && (
                                        <p className="text-red-500 text-[14px] font-medium">{bookingError}</p>
                                    )}

                                    <button
                                        onClick={handleContinue}
                                        disabled={!cart?.tickets?.length}
                                        className="w-full h-[45px] bg-black text-white rounded-[10px] uppercase font-semibold tracking-widest flex items-center justify-center disabled:opacity-40"
                                        style={{ color: 'white', fontSize: '24px', fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)', fontWeight: 500 }}
                                    >
                                        CONTINUE
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── BILLING FORM ───────────────────── */}
                {step === 'billing' && (
                    <div ref={billingRef} className="w-full bg-white border border-white rounded-[20px] shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500 mb-20">
                        <div className="p-6 md:p-8">

                            {/* Mini order summary */}
                            <div className="flex justify-between items-center mb-6 mt-[-10px]">
                                <div>
                                    <h2 style={{ color: 'black', fontSize: '30px', fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}>Billing Details</h2>
                                    <p style={{ fontFamily: 'var(--font-anek-latin)' }} className="text-[14px] text-[#686868] mt-1">{cart?.eventName} &nbsp;·&nbsp; ₹{grandTotal.toLocaleString('en-IN')} total</p>
                                </div>
                                {/* Billing step indicator: green circle with tick */}
                                <div
                                    style={{
                                        width: 47,
                                        height: 47,
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'background 0.25s, border-color 0.25s',
                                        background: '#0AC655',
                                        border: 'none',
                                    }}
                                >
                                    <svg
                                        style={{ width: '83.33%', height: '83.33%' }}
                                        viewBox="0 0 39 39"
                                        fill="none"
                                    >
                                        <path
                                            d="M7 20l9 9 16-16"
                                            stroke="white"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="border-t border-[#AEAEAE] pt-6 space-y-6 mx-[-24px] md:mx-[-32px] px-6 md:px-8 mt-[-15px]">

                                <p className="text-[14px] text-[#686868] font-semibold" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                    These details will be shown on your invoice <span className="text-red-500">*</span>
                                </p>

                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-[15px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Name<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={billing.name}
                                        onChange={e => { setBilling(b => ({ ...b, name: e.target.value })); setBookingError(''); }}
                                        placeholder="Name*"
                                        className="w-full h-[55px] border border-[#AEAEAE] rounded-[10px] px-5 focus:outline-none focus:border-black text-black font-medium text-[16px] placeholder:text-[#AEAEAE]"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-[15px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Phone Number
                                    </label>
                                    <div className="w-full h-[55px] border border-[#E2E2E2] rounded-[10px] px-5 flex items-center bg-[#F8F8F8] gap-2">
                                        <span className="text-[20px]">🇮🇳</span>
                                        <span className="text-[16px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                            +91 {(billing.phone || '').replace(/^\+?91/, '')}
                                        </span>
                                    </div>
                                </div>

                                {/* Nationality */}
                                <div className="space-y-3">
                                    <label className="text-[15px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Select nationality
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {['Indian resident', 'International visitor'].map((opt) => {
                                            const active = billing.nationality === opt;
                                            return (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => { setBilling(b => ({ ...b, nationality: opt })); setBookingError(''); }}
                                                    className={`h-[50px] px-4 rounded-[10px] border flex items-center justify-between ${active ? 'border-[#2A2A2A] bg-white' : 'border-[#E2E2E2] bg-[#FAFAFA]'}`}
                                                >
                                                    <span className="text-[16px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>{opt}</span>
                                                    <span className={`w-4 h-4 rounded-full border-2 ${active ? 'border-[#2A2A2A]' : 'border-[#9CA3AF]'} flex items-center justify-center`}>
                                                        {active && <span className="w-2 h-2 rounded-full bg-[#2A2A2A]" />}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* State */}
                                <div className="space-y-2">
                                    <label className="text-[15px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Select state
                                    </label>
                                    <select
                                        value={billing.state}
                                        onChange={e => { setBilling(b => ({ ...b, state: e.target.value })); setBookingError(''); }}
                                        className="w-full h-[55px] border border-[#AEAEAE] rounded-[10px] px-5 focus:outline-none focus:border-black text-black font-medium text-[16px] bg-white appearance-none"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    >
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map((st) => (
                                            <option key={st} value={st}>{st}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-[15px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Email<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setBookingError(''); }}
                                        placeholder="Email*"
                                        className="w-full h-[55px] border border-[#AEAEAE] rounded-[10px] px-5 focus:outline-none focus:border-black text-black font-medium text-[16px] placeholder:text-[#AEAEAE]"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    />
                                    <p className="text-[13px] text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        We'll email you ticket confirmation and invoices
                                    </p>
                                </div>

                                {/* Terms */}
                                <div className="flex items-start gap-3 pt-2">
                                    <div
                                        onClick={() => setAcceptedTerms(!acceptedTerms)}
                                        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${acceptedTerms ? 'bg-black border-black' : 'border-[#AEAEAE]'}`}
                                    >
                                        {acceptedTerms && <div className="w-2 h-1 border-white border-b-2 border-r-2 rotate-45 mb-1" />}
                                    </div>
                                    <span className="text-[13px] md:text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}>
                                        I have read and accepted the <Link href="/terms" target="_blank" className="text-[#5331EA] hover:underline font-semibold">Terms &amp; Conditions</Link> and <Link href="/refund" target="_blank" className="text-[#5331EA] hover:underline font-semibold">Refund Policy</Link>
                                    </span>
                                </div>

                                {bookingError && (
                                    <p className="text-red-500 text-[14px] font-medium" style={{ fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}>{bookingError}</p>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={handlePayNow}
                                        disabled={bookingLoading || isPayingRef.current}
                                        className="flex-1 h-[55px] bg-black text-white rounded-[10px] font-bold text-[22px] uppercase hover:bg-zinc-800 active:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wider shadow-lg shadow-black/10"
                                        style={{ fontFamily: 'Anek Tamil Condensed' }}
                                    >
                                        {bookingLoading ? 'Processing...' : (grandTotal === 0 ? 'CONTINUE' : 'PAY NOW')}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Timer Warning Modal - 3 minutes remaining */}
            {showTimerWarning && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[20px] p-6 max-w-[400px] w-full shadow-2xl animate-in scale-in duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-8 h-8 text-orange-500" />
                            <h2 className="text-[20px] font-bold text-black">Time Running Out!</h2>
                        </div>
                        <p className="text-[14px] text-[#686868] mb-6 leading-relaxed">
                            Your ticket lock will expire in <span className="font-bold text-orange-600">3 minutes</span>. Complete your booking to secure your seats.
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-[10px] p-3 mb-6">
                            <p className="text-[13px] font-semibold text-orange-700">⏱️ Time remaining: {formatTimer(timeRemaining)}</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowTimerWarning(false);
                                setStep('billing');
                                setTimeout(() => billingRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                            }}
                            className="w-full h-[48px] bg-orange-500 text-white rounded-[10px] font-bold text-[16px] hover:bg-orange-600 transition-colors"
                        >
                            Complete Now
                        </button>
                    </div>
                </div>
            )}

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <OrganizerLogoutModal 
                isOpen={showLogoutModal} 
                onClose={() => setShowLogoutModal(false)} 
                onConfirm={handleOrganizerLogout}
                organizerName={organizerSession?.email}
            />
            {isProfileDrawerOpen && (
                <ProfileDrawer onClose={() => setIsProfileDrawerOpen(false)} />
            )}
        </div>
    );
}
