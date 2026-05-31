'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, Trash2, X, Tag, CheckCircle2, ChevronDown, Clock, User, ChevronLeft, Percent, Info, Heart, Edit2, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useReservationStore } from '@/store/useReservationStore';
import { bookingApi, OfferItem, PaymentOrderResponse } from '@/lib/api/booking';
import { profileApi } from '@/lib/api/profile';
import Link from 'next/link';
import { useUserSession, clearUserSession } from '@/lib/auth/user';
import { useOrganizerSession, clearOrganizerSession } from '@/lib/auth/organizer';
import { getBookingStatus } from '@/lib/utils/booking-status';
import { toast } from '@/components/ui/Toast';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const AuthModal = dynamic(() => import('@/components/modals/AuthModal'), { ssr: false });
const OrganizerLogoutModal = dynamic(() => import('@/components/modals/OrganizerLogoutModal'), { ssr: false });
const ProfileDrawer = dynamic(() => import('@/components/layout/Navbar/ProfileDrawer'), { ssr: false });
const SuccessView = dynamic(() => import('./SuccessView'), { ssr: false });

import OrderSummary from './OrderSummary';
import OffersCoupons from './OffersCoupons';
import BillingDetailsForm from './BillingDetailsForm';


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
    const [eventData, setEventData] = useState<{id: string; name: string; portrait_image_url?: string; landscape_image_url?: string} | null>(null);


    



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
    const [pass, setPass] = useState<any>(null);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const [previousBookings, setPreviousBookings] = useState<any[]>([]);
    const [showTimerWarning, setShowTimerWarning] = useState(false);
    const [phoneInputValue, setPhoneInputValue] = useState('');
    const isPayingRef = useRef(false);
    const hasPrefilledRef = useRef(false);
    const timerWarningShownRef = useRef(false);
    const razorpayRef = useRef<any>(null);
    const isBookingCompletedRef = useRef(false);

    const reservationStore = useReservationStore();
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isValidating, setIsValidating] = useState(true);
    
    // Donation States
    const [donationAmount, setDonationAmount] = useState(5);
    const [isDonationAdded, setIsDonationAdded] = useState(false);
    const [isDonationEdited, setIsDonationEdited] = useState(false);

    // Validate reservation on mount
    useEffect(() => {
        const validateReservation = async () => {
            if (isBookingCompletedRef.current) {
                setIsValidating(false);
                return;
            }
            if (!session?.id) {
                setIsValidating(false);
                return;
            }

            let savedCart = sessionStorage.getItem('ticpin_cart');
            let parsedCart: any = null;
            let eventId = '';

            if (savedCart) {
                parsedCart = JSON.parse(savedCart);
                eventId = parsedCart.eventId;
            } else {
                // Self-healing: if cart is missing (e.g. copied/duplicated tab),
                // fetch the event details to get eventId and verify active reservation
                try {
                    const eRes = await fetch(`/backend/api/events/${encodeURIComponent(name)}`, { credentials: 'include' });
                    if (!eRes.ok) throw new Error("Failed to fetch event");
                    const eventData = await eRes.json();
                    
                    const activeRes = await bookingApi.checkActiveReservation(eventData.id, session.id);
                    if (activeRes.active) {
                        const mappedTickets = activeRes.tickets.map((t: any) => {
                            const cat = eventData.ticket_categories?.find((c: any) => c.name === t.category);
                            return {
                                name: t.category,
                                price: cat?.price || eventData.price_starts_from || 0,
                                quantity: t.quantity
                            };
                        });
                        const reconstructedCart = {
                            eventId: eventData.id,
                            eventName: eventData.name,
                            city: eventData.city,
                            tickets: mappedTickets,
                            totalPrice: mappedTickets.reduce((sum: number, t: any) => sum + t.price * t.quantity, 0),
                            type: 'event' as const
                        };
                        sessionStorage.setItem('ticpin_cart', JSON.stringify(reconstructedCart));
                        setCart(reconstructedCart);
                        setEventData({ id: eventData.id, name: eventData.name });
                        
                        reservationStore.setReservation(
                            activeRes.reservation_id,
                            activeRes.event_id,
                            mappedTickets,
                            activeRes.expires_at
                        );
                        setIsValidating(false);
                        return;
                    }
                } catch (e) {
                    console.error("Self-healing failed to reconstruct cart:", e);
                }

                // If not found or failed, redirect back to booking
                router.replace(`/events/${name}/book`);
                return;
            }

            try {
                // Check if backend has active reservation specifically for this tab's reservation ID
                const activeRes = await bookingApi.checkActiveReservation(eventId, session.id, reservationStore.reservationId || undefined);
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

    useEffect(() => {
        if (!name) return;
        fetch(`/backend/api/events/${encodeURIComponent(name)}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data && data.id) {
                    // Check if event booking is closed
                    const isClosed = (() => {
                        if (data.is_sales_paused || data.is_canceled) return true;
                        if (data.ticket_close_date) {
                            const closeDate = new Date(data.ticket_close_date);
                            if (!isNaN(closeDate.getTime()) && closeDate.getTime() < Date.now()) {
                                return true;
                            }
                        }
                        if (data.event_end_date) {
                            const endDate = new Date(data.event_end_date);
                            if (!isNaN(endDate.getTime()) && endDate.getTime() < Date.now()) {
                                return true;
                            }
                        }
                        if (data.date) {
                            const eventDate = new Date(data.date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (eventDate < today) {
                                return true;
                            }
                        }
                        return false;
                    })();

                    if (isClosed) {
                        toast.error("Bookings for this event are closed.");
                        router.replace(`/events/${name}`);
                        return;
                    }
                    setEventData(data);
                }
            })
            .catch(err => console.error("Error fetching event details:", err));
    }, [name, router]);

    // Timer countdown with 3-min warning + 5-min auto-unlock
    useEffect(() => {
        const expiresAt = reservationStore.expiresAt;
        if (!expiresAt || step === 'success') return;

        let interval: any;

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
                if (interval) clearInterval(interval);
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
        interval = setInterval(updateTimer, 1000);
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
                                p.cart.use_pass,
                                p.donationAmount
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

    // Backend Polling Status Check (Fallback & Safety Source of truth per tab session)
    useEffect(() => {
        const checkId = cart?.eventId;
        const userId = session?.id;
        const reservationId = reservationStore.reservationId;
        if (!checkId || !userId || !reservationId || step === 'success') return;

        const interval = setInterval(async () => {
            // Stop polling if booking is done or payment is in progress
            if (isBookingCompletedRef.current || isPayingRef.current || step === 'success') return;
            try {
                const res = await bookingApi.checkActiveReservation(checkId, userId, reservationId);
                if (!res?.active) {
                    // Double-check: skip if booking just completed
                    if (isBookingCompletedRef.current || isPayingRef.current) return;
                    // Clear state locally for this tab
                    reservationStore.clearReservation();
                    sessionStorage.removeItem('ticpin_cart');
                    sessionStorage.removeItem('ticpin_booking_step');
                    sessionStorage.removeItem('ticpin_pending_payment');
                    toast.info("Your reservation has expired or was cancelled.");
                    router.replace(`/events/${name}/book`);
                }
            } catch (err) {
                console.error("Error polling reservation status:", err);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [cart?.eventId, session?.id, reservationStore.reservationId, step, name, router, reservationStore]);

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
    const baseAmount = orderAmount + bookingFee - totalDiscount;
    const defaultDonation = baseAmount % 5 === 0 ? 5 : 5 - (baseAmount % 5);

    // Keep donationAmount in sync with defaultDonation unless user has edited it
    useEffect(() => {
        if (!isDonationEdited) {
            setDonationAmount(defaultDonation);
        }
    }, [baseAmount, defaultDonation, isDonationEdited]);

    const grandTotal = Math.max(0, baseAmount + (isDonationAdded ? donationAmount : 0));

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
            const res = await bookingApi.createReservation(cart.eventId, session.id, ticketReqs, reservationStore.reservationId || undefined);
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
            const res = await bookingApi.createReservation(cart.eventId, session.id, ticketReqs, reservationStore.reservationId || undefined);

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


    const handleContinue = () => {
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
        donationAmt?: number,
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
                    donation_amount: donationAmt !== undefined ? donationAmt : (isDonationAdded ? donationAmount : 0),
                });
            }
            setBookingId(result.booking_id);
            // Mark completed BEFORE clearing reservation so polling/timer see it immediately
            isBookingCompletedRef.current = true;
            isPayingRef.current = true; // keep this true so timer also stops
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
                appliedOffer?.id,
                isPassApplied,
                0
            );
            return;
        }

        try {
            // Lock reservation status to PENDING_PAYMENT on backend and receive grace extension timer
            if (reservationStore.reservationId) {
                const lockRes = await fetch('/backend/api/bookings/events/start-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reservation_id: reservationStore.reservationId }),
                });
                if (!lockRes.ok) {
                    const errorData = await lockRes.json();
                    throw new Error(errorData.error || 'Your ticket reservation lock has expired. Please select tickets again.');
                }
                const lockData = await lockRes.json();
                if (lockData.payment_expires_at) {
                    reservationStore.setExpiresAt(lockData.payment_expires_at);
                }
            }

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
                donationAmount: isDonationAdded ? donationAmount : 0,
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
                            isDonationAdded ? donationAmount : 0
                        );
                    },
                    modal: {
                        ondismiss: async () => {
                            razorpayRef.current = null;
                            sessionStorage.removeItem('ticpin_pending_payment');
                            setBookingLoading(false);
                            isPayingRef.current = false;
                            setBookingError('Payment was cancelled. Please try again.');

                            // Safely revert reservation back to standard PENDING state
                            if (reservationStore.reservationId) {
                                try {
                                    const revertRes = await fetch('/backend/api/bookings/events/fail-payment', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ reservation_id: reservationStore.reservationId }),
                                    });
                                    if (revertRes.ok) {
                                        const checkRes = await fetch(`/backend/api/bookings/events/active-reservation?event_id=${encodeURIComponent(cart.eventId)}&user_id=${encodeURIComponent(session?.id || '')}&reservation_id=${encodeURIComponent(reservationStore.reservationId)}`);
                                        if (checkRes.ok) {
                                            const activeData = await checkRes.json();
                                            if (activeData.active && activeData.expires_at) {
                                                reservationStore.setExpiresAt(activeData.expires_at);
                                            } else {
                                                reservationStore.clearReservation();
                                                sessionStorage.removeItem('ticpin_cart');
                                                toast.error("Your reservation duration has elapsed.");
                                                router.replace(`/events/${name}`);
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.error("Reverting payment status failed:", e);
                                }
                            }
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

    const handleUserLogout = () => {
        clearUserSession();
        setIsProfileDrawerOpen(false);
        router.push('/');
    };

    if (isValidating) {
        return (
            <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#FDFDFD]">
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-[#5331EA]/10 border-t-[#5331EA] animate-spin" />
                        <Clock className="w-6 h-6 text-[#5331EA] animate-pulse" />
                    </div>
                    <p className="text-[15px] font-semibold text-zinc-500 tracking-wide animate-pulse" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        Securing your booking session...
                    </p>
                </div>
            </div>
        );
    }

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
            {/* ====== MOBILE VIEW (md:hidden) ====== */}
            <div className="md:hidden min-h-screen bg-white relative flex flex-col pb-[120px] select-none" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
                {/* Header Section */}
                <div className="w-full pt-[17px] px-[15px] relative h-[60px] shrink-0 flex items-center justify-center">
                    <button 
                        onClick={() => { router.back(); }}
                        className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-sm absolute left-[15px] top-[17px] border border-[#EFEFEF] active:scale-95 transition-transform"
                    >
                        <ChevronLeft size={20} className="text-black" />
                    </button>
                    
                    <h1 className="text-[18px] font-semibold text-black uppercase tracking-tight" style={{ fontFamily: "'Anek Latin'" }}>
                        Review your booking
                    </h1>
                </div>

                {/* Complete your booking in TIME mins banner (Rectangle 524) */}
                {timeRemaining > 0 && (
                    <div className="mx-[15px] mt-[10px] h-[29px] bg-[#E1E1E1] rounded-[8px] flex items-center justify-center gap-2 px-3 shrink-0">
                        <Clock size={13} className="text-black" />
                        <span className="text-[12px] font-medium text-black" style={{ fontFamily: "'Anek Latin'" }}>
                            Complete your booking in <span className="font-bold text-[#5331EA]">{formatTimer(timeRemaining)}</span> mins
                        </span>
                    </div>
                )}

                {/* Scrollable Container */}
                <div className="flex-1 overflow-y-auto px-[15px] pt-4 space-y-[22px]">
                    {/* Event summary with thumbnail */}
                    <div className="flex gap-[15px] items-center">
                        <div className="w-[80px] h-[63px] bg-[#110D2C] rounded-[10px] overflow-hidden shrink-0 relative flex items-center justify-center shadow-sm border border-[#E1E1E1]">
                            {eventData?.landscape_image_url || eventData?.portrait_image_url ? (
                                <Image
                                    src={eventData.landscape_image_url || eventData.portrait_image_url || ''}
                                    alt={cart?.eventName || 'Event Poster'}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-black/10 z-10" />
                                    <span className="text-[10px] text-[#5331EA] font-extrabold italic uppercase tracking-wider text-center z-20">TICPIN</span>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[15px] font-semibold text-black uppercase tracking-tight leading-tight" style={{ fontFamily: "'Anek Latin'" }}>
                                {cart?.eventName || 'EVENT NAME'}
                            </h2>
                            <p className="text-[13px] font-normal text-[#686868] mt-0.5 uppercase tracking-wide" style={{ fontFamily: "'Anek Latin'" }}>
                                {cart?.city || 'LOCATION'}
                            </p>
                        </div>
                    </div>

                    {/* Ticket details (Rectangle 525) */}
                    <div className="w-full border border-[#D9D9D9] rounded-[9px] bg-white overflow-hidden shadow-sm">
                        {/* Event Date & Time */}
                        <div className="px-4 py-3 bg-zinc-50 border-b border-[#D9D9D9] flex justify-between items-center">
                            <span className="text-[15px] font-semibold text-black" style={{ fontFamily: "'Anek Latin'" }}>
                                {cart?.date ? new Date(cart.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Sat, 23 May'}
                            </span>
                            <span className="text-[15px] font-semibold text-black" style={{ fontFamily: "'Anek Latin'" }}>
                                {cart?.timeSlot || '7 PM'}
                            </span>
                        </div>

                        {/* Selected Tickets */}
                        <div className="p-4 space-y-4">
                            {cart?.tickets?.map((t, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="text-[18px] font-medium text-black" style={{ fontFamily: "'Anek Latin'" }}>
                                                {t.quantity} x {t.name}
                                            </span>
                                            <span className="text-[15px] font-normal text-[#686868] mt-1" style={{ fontFamily: "'Anek Latin'" }}>
                                                ₹{t.price.toLocaleString('en-IN')} cover
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className="text-[18px] font-semibold text-black" style={{ fontFamily: "'Anek Latin'" }}>
                                                ₹{(t.price * t.quantity).toLocaleString('en-IN')}
                                            </span>
                                            <button 
                                                onClick={() => removeTicket(i)}
                                                className="text-[12px] font-semibold text-[#686868] underline active:scale-95 transition-transform" 
                                                style={{ fontFamily: "'Anek Latin'" }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* OFFERS section */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-[#3B3B3B] tracking-[0.1em] uppercase" style={{ fontFamily: "'Anek Latin'" }}>OFFERS</span>
                            <div className="flex-1 h-[0.7px] bg-[#D9D9D9] ml-4" />
                        </div>

                        <div className="w-full border border-[#D9D9D9] rounded-[9px] bg-white divide-y divide-[#D9D9D9] shadow-sm">
                            <button 
                                onClick={() => toggleSection('offers')}
                                className="w-full h-[55px] flex items-center justify-between px-4 hover:bg-zinc-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#5331EA]/10 flex items-center justify-center text-[#5331EA]">
                                        <Percent size={14} />
                                    </div>
                                    <span className="text-[18px] font-medium text-black text-left" style={{ fontFamily: "'Anek Latin'" }}>
                                        View all event offers
                                    </span>
                                </div>
                                <ChevronRight size={18} className={`text-[#686868] transition-transform ${expandedSection === 'offers' ? 'rotate-90' : ''}`} />
                            </button>

                            <button 
                                onClick={() => toggleSection('coupons')}
                                className="w-full h-[55px] flex items-center justify-between px-4 hover:bg-zinc-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#5331EA]/10 flex items-center justify-center text-[#5331EA]">
                                        <Tag size={14} />
                                    </div>
                                    <span className="text-[18px] font-medium text-black text-left" style={{ fontFamily: "'Anek Latin'" }}>
                                        View all coupon codes
                                    </span>
                                </div>
                                <ChevronRight size={18} className={`text-[#686868] transition-transform ${expandedSection === 'coupons' ? 'rotate-90' : ''}`} />
                            </button>
                        </div>

                        {/* Offers/Coupons Expanded panel */}
                        {expandedSection !== 'none' && (
                            <div className="border border-[#D9D9D9] rounded-[9px] p-4 bg-zinc-50 space-y-3 animate-in fade-in duration-200">
                                {expandedSection === 'coupons' ? (
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <input 
                                                className="flex-1 border border-[#AEAEAE] rounded-[8px] px-3 h-[40px] text-[14px] font-medium outline-none bg-white"
                                                placeholder="Enter coupon code"
                                                value={couponInput}
                                                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                            />
                                            <button 
                                                onClick={validateCoupon}
                                                disabled={couponLoading}
                                                className="px-4 bg-black text-white rounded-[8px] text-[13px] font-bold active:scale-95 transition-transform"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {couponError && <p className="text-red-500 text-[12px]">{couponError}</p>}
                                        {couponSuccess && <p className="text-green-600 text-[12px]">{couponSuccess}</p>}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {offers.length > 0 ? (
                                            offers.map(o => (
                                                <div key={o.id} className="flex justify-between items-center p-2 bg-white rounded border border-[#D9D9D9]">
                                                    <div>
                                                        <p className="font-bold text-[13px]">{o.code}</p>
                                                        <p className="text-[11px] text-[#686868]">{o.description}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => applyOffer(o)}
                                                        className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-bold"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[12px] text-[#686868] italic text-center">No offers available for this event</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* PAYMENT DETAILS (Rectangle 527) */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-[#3B3B3B] tracking-[0.1em] uppercase" style={{ fontFamily: "'Anek Latin'" }}>PAYMENT DETAILS</span>
                            <div className="flex-1 h-[0.7px] bg-[#D9D9D9] ml-4" />
                        </div>

                        <div className="w-full border border-[#D9D9D9] rounded-[9px] bg-white p-4 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[17px] font-semibold text-black" style={{ fontFamily: "'Anek Latin'" }}>Order amount</span>
                                <span className="text-[17px] font-semibold text-black" style={{ fontFamily: "'Anek Latin'" }}>₹{orderAmount.toLocaleString('en-IN')}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-[12px] font-normal text-black flex items-center gap-1.5" style={{ fontFamily: "'Anek Latin'" }}>
                                    Fees and chargers <ChevronDown size={14} className="text-zinc-500" />
                                </span>
                                <span className="text-[12px] font-normal text-black" style={{ fontFamily: "'Anek Latin'" }}>₹{bookingFee.toLocaleString('en-IN')}</span>
                            </div>

                            {totalDiscount > 0 && (
                                <div className="flex justify-between items-center text-green-600">
                                    <span className="text-[12px] font-medium" style={{ fontFamily: "'Anek Latin'" }}>Discount Applied</span>
                                    <span className="text-[12px] font-bold" style={{ fontFamily: "'Anek Latin'" }}>-₹{totalDiscount.toLocaleString('en-IN')}</span>
                                </div>
                            )}

                            <div className="w-full h-[0.7px] bg-[#D9D9D9]" />

                            <div className="flex justify-between items-center">
                                <span className="text-[15px] font-semibold text-black" style={{ fontFamily: "'Anek Latin'" }}>Grand Total</span>
                                <span className="text-[17px] font-semibold text-black" style={{ fontFamily: "'Anek Latin'" }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    {/* DONATE TO EXPERIENCE INDIA (Rectangle 528 & Rectangle 529) */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-[#3B3B3B] tracking-[0.1em] uppercase" style={{ fontFamily: "'Anek Latin'" }}>DONATE TO EXPERIENCE INDIA</span>
                            <div className="flex-1 h-[0.7px] bg-[#D9D9D9] ml-4" />
                        </div>

                        <div className="w-full rounded-[9px] overflow-hidden border border-[#D9D9D9] shadow-sm flex flex-col bg-white">
                            {/* Rectangle 528 ( rgba(83, 49, 234, 0.15) ) */}
                            <div className="w-full bg-[#5331EA]/15 p-5 relative min-h-[105px] flex items-center justify-between">
                                <div className="max-w-[70%] z-10 flex flex-col">
                                    <span className="text-[18px] font-semibold text-[#5331EA] leading-tight" style={{ fontFamily: "'Anek Latin'" }}>
                                        Helping children
                                    </span>
                                    <span className="text-[18px] font-semibold text-[#5331EA] leading-tight" style={{ fontFamily: "'Anek Latin'" }}>
                                        access nutritious food
                                    </span>
                                </div>

                                {/* Firefly avatar */}
                                <div className="w-[78px] h-[78px] shrink-0 rounded-full bg-white flex items-center justify-center shadow-inner relative overflow-hidden border border-[#5331EA]/25">
                                    <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-[#FAF9FF]">
                                        <Heart size={34} fill="#5331EA" className="text-[#5331EA] animate-pulse" />
                                        <span className="text-[8px] font-extrabold text-[#5331EA] tracking-tighter mt-1">FEED INDIA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rectangle 529 ( white bottom strip ) */}
                            <div className="w-full bg-white h-[56px] border-t border-[#AEAEAE]/40 flex items-center justify-between px-4 shrink-0">
                                <span className="text-[12px] font-normal text-black" style={{ fontFamily: "'Anek Latin'" }}>
                                    Donate with every order
                                </span>

                                <div className="flex items-center gap-2">
                                    {/* Edit amount Rectangle 530 */}
                                    <div className="w-[69px] h-[27px] border border-[#AEAEAE] rounded-[7px] flex items-center justify-center px-1 bg-white relative">
                                        <span className="text-[12px] font-normal text-black mr-1" style={{ fontFamily: "'Anek Latin'" }}>₹</span>
                                        <input 
                                            type="number"
                                            value={donationAmount}
                                            onChange={e => {
                                                const val = parseInt(e.target.value);
                                                setDonationAmount(isNaN(val) ? 0 : Math.max(0, val));
                                                setIsDonationEdited(true);
                                            }}
                                            disabled={isDonationAdded}
                                            className="w-8 h-full text-center text-[12px] font-semibold bg-transparent focus:outline-none text-black disabled:opacity-75"
                                        />
                                        <Edit2 size={10} className="text-[#686868] ml-0.5 shrink-0" />
                                    </div>

                                    {/* Add Button Rectangle 531 */}
                                    <button 
                                        onClick={() => setIsDonationAdded(!isDonationAdded)}
                                        className={`w-[56px] h-[27px] rounded-[7px] text-[12px] font-semibold flex items-center justify-center transition-all ${
                                            isDonationAdded 
                                            ? 'bg-[#5331EA] text-white border border-[#5331EA]' 
                                            : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                                        }`}
                                    >
                                        {isDonationAdded ? (
                                            <span className="flex items-center gap-0.5"><Check size={11} strokeWidth={3} /> Yes</span>
                                        ) : `+${donationAmount}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BILLING DETAILS (Rectangle 532) */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-[#3B3B3B] tracking-[0.1em] uppercase" style={{ fontFamily: "'Anek Latin'" }}>BILLING DETAILS</span>
                            <div className="flex-1 h-[0.7px] bg-[#D9D9D9] ml-4" />
                        </div>

                        <div className="w-full border border-[#AEAEAE] rounded-[9px] bg-white p-4 shadow-sm flex flex-col relative">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#EFEFEF] flex items-center justify-center text-zinc-500">
                                        <User size={16} />
                                    </div>
                                    <span className="text-[15px] font-semibold text-black" style={{ fontFamily: "'Anek Latin'" }}>
                                        {billing.name || session?.name || 'User Name'}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setStep('billing')} 
                                    className="text-[12px] font-semibold text-[#5331EA] flex items-center gap-1 active:scale-95 transition-all"
                                    style={{ fontFamily: "'Anek Latin'" }}
                                >
                                    Edit <ChevronRight size={14} />
                                </button>
                            </div>

                            <div className="space-y-1 text-[13px] font-normal text-black pl-11" style={{ fontFamily: "'Anek Latin'" }}>
                                <p className="opacity-90">{billing.phone || session?.phone || 'Phone number'}</p>
                                <p className="opacity-90">{email || session?.email || 'Email ID'}</p>
                                <p className="opacity-90">{billing.state || 'State / Region'}</p>
                            </div>

                            <div className="w-full h-[0.7px] bg-[#D9D9D9] my-4" />

                            <p className="text-[12px] font-normal text-[#686868] leading-snug pl-1" style={{ fontFamily: "'Anek Latin'" }}>
                                Information mentioned above will be used for generating the invoice and sending out the tickets.
                            </p>
                        </div>
                    </div>

                    {/* Phone input confirmation if in review step */}
                    {step === 'review' && (
                        <div className="space-y-2">
                            <label className="text-[13px] font-semibold text-[#686868] block" style={{ fontFamily: "'Anek Latin'" }}>
                                Mobile number for booking confirmation
                            </label>
                            <div className="w-full h-[48px] border border-[#AEAEAE] rounded-[10px] px-4 flex items-center bg-white">
                                <span className="text-[15px] font-semibold text-black mr-2">🇮🇳 +91</span>
                                <input
                                    type="text"
                                    value={phoneInputValue || billing.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="Enter 10-digit mobile"
                                    maxLength={10}
                                    inputMode="numeric"
                                    className="flex-1 h-full bg-transparent focus:outline-none text-black font-semibold text-[15px] placeholder:text-[#AEAEAE]"
                                />
                            </div>
                            {bookingError && <p className="text-red-500 text-[13px] font-semibold leading-tight">{bookingError}</p>}
                        </div>
                    )}

                    {/* Billing Form Modal step (step === billing) inline for mobile */}
                    {step === 'billing' && (
                        <div className="space-y-3 border border-[#D9D9D9] rounded-[9px] p-4 bg-zinc-50 animate-in slide-in-from-top duration-300">
                            <div>
                                <label className="text-[12px] font-semibold text-[#686868] block mb-1">Full Name</label>
                                <input
                                    className="w-full h-[44px] border border-[#AEAEAE] rounded-[9px] px-4 text-[14px] font-medium outline-none bg-white"
                                    value={billing.name}
                                    onChange={e => setBilling(b => ({ ...b, name: e.target.value }))}
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold text-[#686868] block mb-1">Email</label>
                                <input
                                    className="w-full h-[44px] border border-[#AEAEAE] rounded-[9px] px-4 text-[14px] font-medium outline-none bg-white"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Enter email"
                                    type="email"
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold text-[#686868] block mb-1">State</label>
                                <select
                                    className="w-full h-[44px] border border-[#AEAEAE] rounded-[9px] px-4 text-[14px] font-medium outline-none bg-white"
                                    value={billing.state}
                                    onChange={e => setBilling(b => ({ ...b, state: e.target.value }))}
                                >
                                    <option value="">Select state</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <label className="flex items-start gap-2 cursor-pointer mt-1">
                                <input type="checkbox" className="mt-0.5 accent-black" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
                                <span className="text-[12px] text-[#686868] leading-snug">
                                    I agree to the <a href="/terms" className="underline text-black">Terms & Conditions</a> and <a href="/privacy" className="underline text-black">Privacy Policy</a>
                                </span>
                            </label>
                            {bookingError && <p className="text-red-500 text-[13px]">{bookingError}</p>}
                        </div>
                    )}
                </div>

                {/* Sticky Footer (Rectangle 519) */}
                <div className="fixed bottom-0 left-0 right-0 w-full h-[88px] bg-[#EFEFEF] flex items-center justify-between px-[25px] shrink-0 border-t border-[#E5E5E5] z-50">
                    <div className="flex flex-col">
                        <span className="text-[12px] font-normal text-black" style={{ fontFamily: "'Anek Latin'" }}>
                            {cart?.tickets?.reduce((s, t) => s + t.quantity, 0) || 0} ticket{(cart?.tickets?.reduce((s, t) => s + t.quantity, 0) || 0) !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[20px] font-medium text-black leading-tight" style={{ fontFamily: "'Anek Latin'" }}>
                            ₹{grandTotal.toLocaleString('en-IN')}
                        </span>
                    </div>

                    <button
                        onClick={step === 'review' ? handleContinue : handlePayNow}
                        disabled={bookingLoading}
                        className="w-[148px] h-[44px] bg-black text-white rounded-[14px] font-semibold text-[15px] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                        style={{ fontFamily: "'Anek Latin'" }}
                    >
                        {bookingLoading ? 'LOCKING...' : step === 'review' ? 'Checkout' : 'Pay Now'}
                    </button>
                </div>
            </div>

            {/* ====== DESKTOP VIEW (hidden md:block) ====== */}
            <div className="hidden md:flex flex-col min-h-screen">
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
                    router.push('/');
                }}>
                    <Image src="/ticpin-logo-black.png" alt="TICPIN" width={159} height={25} className="h-[20px] md:h-[25px] w-auto object-contain" />
                </div>
                <h1 className="text-[18px] md:text-[22px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                    {step === 'billing' ? 'Review & Billing' : 'Review your booking'}
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
                <OrderSummary
                    cart={cart}
                    updateTicketQuantity={updateTicketQuantity}
                    removeTicket={removeTicket}
                    orderAmount={orderAmount}
                    bookingFee={bookingFee}
                    showGstDetails={showGstDetails}
                    setShowGstDetails={setShowGstDetails}
                    passDiscount={passDiscount}
                    totalDiscount={totalDiscount}
                    grandTotal={grandTotal}
                    router={router}
                />

                <OffersCoupons
                    cart={cart}
                    session={session}
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                    offers={offers}
                    appliedOffer={appliedOffer}
                    offerDiscount={offerDiscount}
                    applyOffer={applyOffer}
                    removeOffer={removeOffer}
                    appliedCoupon={appliedCoupon}
                    couponDiscount={couponDiscount}
                    removeCoupon={removeCoupon}
                    couponInput={couponInput}
                    setCouponInput={setCouponInput}
                    validateCoupon={validateCoupon}
                    couponLoading={couponLoading}
                    couponError={couponError}
                    couponSuccess={couponSuccess}
                    availableCoupons={availableCoupons}
                />

                {step === 'review' && (
                    <div className="w-full bg-white border border-white rounded-[20px] shadow-sm">
                        <div className="p-4 md:p-5">
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
                        </div>
                    </div>
                )}

                {step === 'billing' && (
                    <BillingDetailsForm
                        billingRef={billingRef}
                        cart={cart}
                        grandTotal={grandTotal}
                        billing={billing}
                        setBilling={setBilling}
                        email={email}
                        setEmail={setEmail}
                        acceptedTerms={acceptedTerms}
                        setAcceptedTerms={setAcceptedTerms}
                        bookingError={bookingError}
                        setBookingError={setBookingError}
                        bookingLoading={bookingLoading}
                        isPaying={isPayingRef.current}
                        handlePayNow={handlePayNow}
                        INDIAN_STATES={INDIAN_STATES}
                    />
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
            </div>{/* End Desktop wrapper */}

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            {isProfileDrawerOpen && (
                <ProfileDrawer 
                    isOpen={isProfileDrawerOpen}
                    onClose={() => setIsProfileDrawerOpen(false)}
                    userSession={session}
                    session={organizerSession}
                    onUserLogout={handleUserLogout}
                    onOrganizerLogout={handleOrganizerLogout}
                    router={router}
                />
            )}
        </div>
    );
}
