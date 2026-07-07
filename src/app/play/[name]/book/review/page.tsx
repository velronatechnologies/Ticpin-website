'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, Tag, Trash2, ChevronDown, ArrowLeft, TriangleAlert, User, Percent, ChevronUp, Clock, MapPin, Loader2 } from 'lucide-react';
import { bookingApi, OfferItem, PaymentOrderResponse } from '@/lib/api/booking';
import { useSlotLock } from '@/hooks/useSlotLock';
import { profileApi } from '@/lib/api/profile';
import { useUserSession } from '@/lib/auth/user';
import { useOrganizerSession, clearOrganizerSession } from '@/lib/auth/organizer';
import { getBookingStatus } from '@/lib/utils/booking-status';
import { useIdentityStore } from '@/store/useIdentityStore';
import AuthModal from '@/components/modals/AuthModal';
import OrganizerLogoutModal from '@/components/modals/OrganizerLogoutModal';
import { toast } from '@/components/ui/Toast';
import UserMenu from '@/components/layout/Navbar/UserMenu';
import ProfileDrawer from '@/components/layout/Navbar/ProfileDrawer';
import MobilePlayReview from '@/components/mobile/MobilePlayReview';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentTime } from '@/hooks/use-current-time';
import { isExpiringWithinDay } from '@/lib/event-booking';


import { CITIES } from '@/app/events/create/data';

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
];

interface CartData {
    eventId: string;
    eventName: string;
    city: string;
    type: 'play';
    date: string;
    slot: string;
    display_slot?: string;
    duration: number;
    tickets: { category?: string; name: string; price: number; quantity: number }[];
    totalPrice: number;
    use_pass?: boolean;
    pass_id?: string;
}

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof document === 'undefined') return resolve();
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(s);
    });
}

function fmtDate(iso: string) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

const SearchableSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    required = false,
    error = false
}: {
    label: string,
    value: string,
    onChange: (val: string) => void,
    options: string[],
    placeholder: string,
    required?: boolean,
    error?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            opt.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label
                className="text-[15px] md:text-[16px] font-medium text-[#686868]"
                style={{ fontFamily: 'var(--font-anek-latin)' }}
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 border ${error ? 'border-red-500' : 'border-[#AEAEAE]'} rounded-[8px] px-4 flex items-center justify-between bg-white cursor-pointer transition-all ${isOpen ? 'border-black ring-1 ring-black' : ''}`}
            >
                <span
                    className={`text-[15px] ${value ? 'text-black' : 'text-zinc-400'}`}
                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                >
                    {value || placeholder}
                </span>
                <ChevronDown size={16} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[100] top-[calc(100%+4px)] left-0 w-full bg-white border border-[#AEAEAE] rounded-[8px] shadow-xl max-h-[300px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-2 border-b border-zinc-100 sticky top-0 bg-white">
                        <div className="relative">
                            <input
                                autoFocus
                                type="text"
                                placeholder={`Search ${label.toLowerCase()}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-9 px-3 bg-zinc-50 border border-zinc-100 rounded-md text-[14px] focus:ring-1 focus:ring-black focus:outline-none"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors hover:bg-zinc-50 ${value === opt ? 'bg-zinc-50 font-bold text-black' : 'text-zinc-600'}`}
                                >
                                    {opt}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-zinc-400 text-[13px]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                No {label.toLowerCase()} found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function PlayReviewPage() {
    const router = useRouter();
    const params = useParams();
    const venueName = params?.name as string;
    const session = useUserSession();
    const organizerSession = useOrganizerSession();

    const [cart, setCart] = useState<CartData | null>(null);
    const [step, setStep] = useState<'review' | 'billing' | 'success'>('review');

    const isMobile = useIsMobile();
    const nowMs = useCurrentTime(30000);

    const [lockedGrandTotal, setLockedGrandTotal] = useState<number | null>(null);

    const { timeRemaining, loading: lockLoading, locks } = useSlotLock('play');

    useEffect(() => {
        if (step === 'success') return;

        // If locks finished loading and we have no active locks or timer hit 0, kick out.
        if (!lockLoading && timeRemaining === 0 && locks.length === 0) {
            sessionStorage.removeItem('ticpin_cart');
            toast.warning("Booking expired. Try to book again.");
            router.push('/');
        }
    }, [step, timeRemaining, lockLoading, locks.length, router]);

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Offers
    const [offers, setOffers] = useState<OfferItem[]>([]);
    const [appliedOffer, setAppliedOffer] = useState<OfferItem | null>(null);
    const [offerDiscount, setOfferDiscount] = useState(0);

    // Coupons
    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState<{ id: string; code: string; discount_value: number; valid_until: string; discount_type?: string; max_uses: number; used_count: number }[]>([]);

    const [expandedSection, setExpandedSection] = useState<'none' | 'offers' | 'coupons'>('none');
    const [showGstDetails, setShowGstDetails] = useState(false);

    const [email, setEmail] = useState('');
    useEffect(() => {
        // Booking is user-only — use user session email only
        if (session?.email) {
            setEmail(session.email);
        }
    }, [session]);

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const { userSession, logoutUser, logoutOrganizer, sync: syncAuth, rememberedBilling, setRememberedBilling } = useIdentityStore();

    useEffect(() => {
        syncAuth();
    }, [syncAuth]);

    useEffect(() => {
        // Prevent browser/body level scrollbars completely on this page
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, []);

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const [authView, setAuthView] = useState<'number' | 'otp' | 'profile' | 'location'>('number');
    const profileRef = useRef<HTMLDivElement>(null);

    const [billing, setBilling] = useState({
        name: rememberedBilling?.name || '',
        phone: rememberedBilling?.phone || '',
        nationality: rememberedBilling?.nationality || 'Indian',
        address: rememberedBilling?.address || '',
        city: rememberedBilling?.city || '',
        state: rememberedBilling?.state || '',
        pincode: rememberedBilling?.pincode || '',
    });

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    // Synchronize split names and billing fields when rememberedBilling hydrates/loads
    useEffect(() => {
        if (rememberedBilling) {
            setBilling(prev => {
                const name = prev.name || rememberedBilling.name || '';
                const phone = prev.phone || rememberedBilling.phone || '';
                const address = prev.address || rememberedBilling.address || '';
                const city = prev.city || rememberedBilling.city || '';
                const state = prev.state || rememberedBilling.state || '';
                const pincode = prev.pincode || rememberedBilling.pincode || '';

                if (
                    name !== prev.name ||
                    phone !== prev.phone ||
                    address !== prev.address ||
                    city !== prev.city ||
                    state !== prev.state ||
                    pincode !== prev.pincode
                ) {
                    if (name) {
                        const parts = name.trim().split(/\s+/);
                        if (parts.length > 1) {
                            setFirstName(parts[0]);
                            setLastName(parts.slice(1).join(' '));
                        } else {
                            setFirstName(parts[0] || '');
                            setLastName('');
                        }
                    }
                    return {
                        ...prev,
                        name,
                        phone,
                        address,
                        city,
                        state,
                        pincode
                    };
                }
                return prev;
            });
        }
    }, [
        rememberedBilling?.name,
        rememberedBilling?.phone,
        rememberedBilling?.address,
        rememberedBilling?.city,
        rememberedBilling?.state,
        rememberedBilling?.pincode
    ]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.warning("Geolocation is not supported by your browser");
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const API_KEY = "AIzaSyC2gFDSPGY7wtSFHzYwzbPkP6tcq61Lmt8";
                    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;

                    const res = await fetch(url);
                    const data = await res.json();

                    if (!data.results || data.results.length === 0) {
                        throw new Error("No results found");
                    }

                    let area = "";
                    let locality = "";
                    let district = "";
                    let stateName = "";
                    let postalCode = "";

                    for (const result of data.results) {
                        const components = result.address_components;

                        components.forEach((c: any) => {
                            const types = c.types;
                            if (types.includes("sublocality") || types.includes("sublocality_level_1") || types.includes("neighborhood") || types.includes("route")) {
                                if (!area) area = c.long_name;
                            }
                            if (types.includes("locality")) {
                                if (!locality) locality = c.long_name;
                            }
                            if (types.includes("administrative_area_level_2")) {
                                if (!district) district = c.long_name;
                            }
                            if (types.includes("administrative_area_level_1")) {
                                if (!stateName) stateName = c.long_name;
                            }
                            if (types.includes("postal_code")) {
                                if (!postalCode) postalCode = c.long_name;
                            }
                        });

                        if (locality && postalCode) break;
                    }

                    if (!locality && district) locality = district;
                    if (!district && locality) district = locality;

                    const matchedState = STATES.find(s => s.toLowerCase() === stateName.toLowerCase()) || "";
                    const matchedCity = CITIES.find(c => c.toLowerCase() === locality.toLowerCase() || c.toLowerCase() === district.toLowerCase()) || "";

                    const formattedAddress = data.results[0]?.formatted_address || "";

                    setBilling(prev => ({
                        ...prev,
                        address: formattedAddress || prev.address,
                        state: matchedState || prev.state,
                        city: matchedCity || prev.city,
                        pincode: postalCode || prev.pincode
                    }));

                    toast.success("Location details autofilled!");
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to fetch location details.");
                } finally {
                    setLocationLoading(false);
                }
            },
            () => {
                toast.warning("Location access denied or unavailable.");
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const [showAuthModal, setShowAuthModal] = useState(false);

    const [bookingLoading, setBookingLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingId, setBookingId] = useState('');

    const billingRef = useRef<HTMLDivElement>(null);

    // Load cart & Cashfree logic
    useEffect(() => {
        const saved = sessionStorage.getItem('ticpin_cart');
        const urlParamsObj = new URLSearchParams(window.location.search);
        const cfOrderIdObj = urlParamsObj.get('order_id');
        const pendingPlayStrObj = sessionStorage.getItem('ticpin_pending_play');

        if (!saved && (!cfOrderIdObj || !pendingPlayStrObj)) {
            router.replace(`/play/${venueName}/book`);
            return;
        }

        if (saved) {
            try { setCart(JSON.parse(saved)); } catch { /* ignore */ }
        }
        const savedEmail = sessionStorage.getItem('ticpin_billing_email');
        if (savedEmail) setEmail(savedEmail);
        const savedBilling = sessionStorage.getItem('ticpin_billing_data');
        if (savedBilling) {
            try {
                const parsed = JSON.parse(savedBilling);
                setBilling(parsed);
                if (parsed.name) {
                    const parts = parsed.name.trim().split(/\s+/);
                    if (parts.length > 1) {
                        setFirstName(parts[0]);
                        setLastName(parts.slice(1).join(' '));
                    } else {
                        setFirstName(parsed.name);
                        setLastName('');
                    }
                }
            } catch { /* ignore */ }
        }
        // Only restore step to billing if the current cart exists (not a fresh booking)
        if (saved) {
            const savedStep = sessionStorage.getItem('ticpin_play_step');
            if (savedStep === 'billing') setStep('billing');
        }

        /* const urlParams = new URLSearchParams(window.location.search); */
        const urlParams = new URLSearchParams(window.location.search);
        const cfOrderId = urlParams.get('order_id');
        const pendingPlayStr = sessionStorage.getItem('ticpin_pending_play');
        // Accept TICPIN_ prefixed IDs (new format) or any order_id if we have a pending payment stored
        if (cfOrderId && pendingPlayStr && (cfOrderId.startsWith('TICPIN_') || cfOrderId.includes('_'))) {
            try {
                const p = JSON.parse(pendingPlayStr);
                if (p.cart) {
                    setCart(p.cart);
                    setStep('billing');
                    setBookingLoading(true);
                    if (typeof p.grandTotal === 'number') setLockedGrandTotal(p.grandTotal);
                    window.history.replaceState(null, '', window.location.pathname);
                    setTimeout(() => {
                        completeBooking(p.orderID, p.orderID, 'cashfree', p.cart, p.email, p.sessionId,
                            p.orderAmount, p.bookingFee, p.appliedCoupon || '', p.offerId);
                    }, 200);
                }
            } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            if (session?.id) {
                try {
                    const [profile, history] = await Promise.all([
                        profileApi.getProfile(session.id).catch(() => null),
                        bookingApi.getUserBookings({ userId: session.id }).catch(() => [])
                    ]);

                    const latestBooking = (Array.isArray(history) ? [...history] : [])
                        ?.filter((b: any) => getBookingStatus(b) === 'booked' || getBookingStatus(b) === 'confirmed')
                        ?.sort((a: any, b: any) => new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime())[0];

                    const fetchedName = latestBooking?.user_name || profile?.name || session?.name || '';

                    setBilling(prev => ({
                        ...prev,
                        name: prev.name || fetchedName,
                        phone: prev.phone || latestBooking?.user_phone || profile?.phone || session?.phone || '',
                        address: prev.address || latestBooking?.address || profile?.address || '',
                        city: prev.city || latestBooking?.city || profile?.district || '',
                        state: prev.state || latestBooking?.state || profile?.state || '',
                        pincode: prev.pincode || latestBooking?.pincode || '',
                        nationality: prev.nationality !== 'Indian' ? prev.nationality : (latestBooking?.nationality || 'Indian'),
                    }));

                    if (!firstName && !lastName && fetchedName) {
                        const parts = fetchedName.trim().split(/\s+/);
                        if (parts.length > 1) {
                            setFirstName(parts[0]);
                            setLastName(parts.slice(1).join(' '));
                        } else {
                            setFirstName(parts[0] || '');
                            setLastName('');
                        }
                    }

                    if (!email) {
                        setEmail(latestBooking?.user_email || profile?.email || session?.email || '');
                    }
                } catch (err) {
                    console.error('Failed to load user data', err);
                }
            }
        };
        loadUserData();
    }, [session]);

    useEffect(() => { if (email) sessionStorage.setItem('ticpin_billing_email', email); }, [email]);
    useEffect(() => {
        if (billing.name || billing.phone) {
            sessionStorage.setItem('ticpin_billing_data', JSON.stringify(billing));
            setRememberedBilling(billing);
        }
    }, [billing, setRememberedBilling]);
    useEffect(() => { sessionStorage.setItem('ticpin_play_step', step); }, [step]);

    const timeLeft = useMemo(() => {
        const formatDiff = (expiryMs: number) => {
            const diff = expiryMs - nowMs;
            if (diff <= 0) return 'Expired';

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours > 24) {
                const days = Math.floor(hours / 24);
                const remainingHours = hours % 24;
                return `${days}d ${remainingHours}h ${minutes}m`;
            }
            if (hours > 0) return `${hours}h ${minutes}m`;
            return `${Math.max(1, minutes)}m`;
        };

        const nextTimeLeft: { [key: string]: string } = {};
        offers.forEach((offer) => {
            if (!offer.valid_until) return;
            nextTimeLeft[offer.id] = formatDiff(new Date(offer.valid_until).getTime());
        });
        availableCoupons.forEach((coupon) => {
            if (!coupon.valid_until) return;
            nextTimeLeft[`coupon_${coupon.id}`] = formatDiff(new Date(coupon.valid_until).getTime());
        });
        return nextTimeLeft;
    }, [availableCoupons, nowMs, offers]);

    useEffect(() => {
        if (!venueName) return;
        Promise.all([
            bookingApi.getPlayOffers(venueName),
            bookingApi.getCouponsByCategory('play', session?.id),
        ])
            .then(([offerList, couponList]) => {
                setOffers(Array.isArray(offerList) ? offerList : []);
                setAvailableCoupons(Array.isArray(couponList) ? couponList : []);
            })
            .catch(() => {
                setOffers([]);
                setAvailableCoupons([]);
            });
    }, [venueName, session?.id]);
    const orderAmount = cart?.totalPrice ?? 0;
    const bookingFee = Math.round(orderAmount * 0.13);
    // Check if any offers are expiring soon
    const hasExpiringOffers = offers.some((offer) => isExpiringWithinDay(offer.valid_until, nowMs));
    const hasExpiringCoupons = availableCoupons.some((coupon) => isExpiringWithinDay(coupon.valid_until, nowMs));
    const totalDiscount = offerDiscount + couponDiscount;
    const isPassApplied = cart?.use_pass ?? false;
    const grandTotal = isPassApplied ? 0 : Math.max(0, orderAmount + bookingFee - totalDiscount);

    const applyOffer = (offer: OfferItem) => {
        if (grandTotal === 0 && offer.id !== appliedOffer?.id) {
            toast.warning("The total is already ₹0. No more offers can be applied.");
            return;
        }

        const isExpiringSoon = isExpiringWithinDay(offer.valid_until, nowMs);

        const disc = offer.discount_type === 'percent'
            ? Math.round(orderAmount * offer.discount_value / 100)
            : Math.min(offer.discount_value, orderAmount);
        setOfferDiscount(disc);
        setAppliedOffer(offer);
        setExpandedSection('none');

        // Show urgency message for expiring offers
        if (isExpiringSoon) {
            const expiryDate = new Date(offer.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            toast.success(`🎉 Perfect timing! You saved ₹${disc} with an offer expiring on ${expiryDate}!`);
        } else {
            toast.success(`✅ Offer applied! You saved ₹${disc}`);
        }
    };

    const validateCoupon = async (code?: string) => {
        if (grandTotal === 0 && !appliedCoupon) {
            toast.warning("The total is already ₹0. No coupon needed.");
            return;
        }
        const c = (code ?? couponInput).trim();
        if (!c) return;
        setCouponLoading(true);
        setCouponError('');
        setCouponSuccess('');
        try {
            const result = await bookingApi.validateCoupon(c, 'play', orderAmount, session?.id);
            setCouponDiscount(Math.round(result.discount_amount));
            setAppliedCoupon(c.toUpperCase());

            // Check if this coupon is expiring soon
            const coupon = availableCoupons.find(cp => cp.code.toUpperCase() === c.toUpperCase());
            const isExpiringSoon = coupon ? isExpiringWithinDay(coupon.valid_until, nowMs) : false;

            if (isExpiringSoon) {
                const expiryDate = new Date(coupon.valid_until!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                setCouponSuccess(`🎉 Perfect timing! Coupon applied! You save ₹${Math.round(result.discount_amount)} (Expires ${expiryDate})`);
            } else {
                setCouponSuccess(`✓ Coupon applied! You save ₹${Math.round(result.discount_amount)}`);
            }
            setExpandedSection('none');
        } catch (err: unknown) {
            setCouponError(err instanceof Error ? err.message : 'Invalid coupon');
            setCouponDiscount(0);
            setAppliedCoupon('');
        } finally {
            setCouponLoading(false);
        }
    };

    const billingComplete = useMemo(() => {
        return (
            billing.name.trim() !== '' &&
            billing.phone.trim().length >= 10 &&
            billing.address.trim() !== '' &&
            billing.city.trim() !== '' &&
            billing.state.trim() !== '' &&
            billing.pincode.trim().length >= 6
        );
    }, [billing]);

    const completeBooking = async (
        paymentId: string,
        orderId: string,
        paymentGateway: string,
        cartData: CartData,
        emailData: string,
        sessionId: string | undefined,
        oAmt: number,
        bFee: number,
        coupon: string,
        offerId: string | undefined,
    ) => {
        setBookingLoading(true);
        setBookingError('');
        try {
            const result = await bookingApi.createPlayBooking({
                user_email: emailData,
                user_name: billing.name,
                user_phone: billing.phone,
                address: billing.address,
                city: billing.city,
                state: billing.state,
                pincode: billing.pincode,
                nationality: billing.nationality,
                play_id: cartData.eventId,
                venue_name: cartData.eventName,
                date: cartData.date,
                slot: cartData.slot,
                duration: cartData.duration,
                tickets: cartData.tickets.map(t => ({
                    category: t.category ?? t.name,
                    price: t.price,
                    quantity: t.quantity,
                })),
                order_amount: oAmt,
                booking_fee: bFee,
                coupon_code: coupon || undefined,
                offer_id: offerId,
                user_id: sessionId,
                payment_id: paymentId,
                order_id: orderId,
                payment_gateway: paymentGateway,
                status: 'booked',
                use_ticpass: isPassApplied,
            });
            setBookingId(result.booking_id);
            ['ticpin_cart', 'ticpin_billing_email', 'ticpin_billing_data',
                'ticpin_play_step', 'ticpin_pending_play'].forEach(k => sessionStorage.removeItem(k));
            setStep('success');
        } catch (err: unknown) {
            setBookingError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
            setIsProcessing(false);
        }
    };

    const handleContinue = () => {
        if (!acceptedTerms) {
            setBookingError('Please accept the terms and conditions to proceed.');
            return;
        }

        // Booking requires a user session — organiser login is not sufficient
        if (!session) {
            setShowAuthModal(true);
            return;
        }

        setStep('billing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePayNow = async () => {
        if (!firstName.trim()) { setBookingError('Please enter your first name'); return; }
        if (!lastName.trim()) { setBookingError('Please enter your last name'); return; }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email)) { setBookingError('Please enter a valid email address'); return; }

        // Phone number validation (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!billing.phone || !phoneRegex.test(billing.phone.replace(/[^0-9]/g, ''))) { setBookingError('Please enter a valid 10-digit phone number'); return; }

        if (!billing.address.trim()) { setBookingError('Please enter your address'); return; }
        if (!billing.city.trim()) { setBookingError('Please enter your city'); return; }
        if (!billing.pincode.trim() || billing.pincode.length < 6) { setBookingError('Please enter a valid PIN code'); return; }

        // State validation
        if (!STATES.includes(billing.state)) { setBookingError('Please select a valid state'); return; }

        if (!cart) return;

        // Double-click protection
        if (isProcessing) { return; }
        setIsProcessing(true);

        // Check if email belongs to another user or organizer before payment
        try {
            const emailCheckRes = await fetch(`/backend/api/profiles/check-email?email=${encodeURIComponent(email)}`, {
                credentials: 'include',
            });
            if (emailCheckRes.ok) {
                const emailData = await emailCheckRes.json();
                if (emailData.exists) {
                    // If it's a user but NOT the current user
                    if (emailData.isUser && emailData.userId !== session?.id) {
                        setBookingError('This email is already associated with another account');
                        setIsProcessing(false);
                        return;
                    }
                    // If it's an organizer
                    if (emailData.isOrganizer) {
                        setBookingError('This email is already associated with an organizer account');
                        setIsProcessing(false);
                        return;
                    }
                }
            }
        } catch (err) {
            console.error('Email check failed:', err);
        }

        if (grandTotal === 0) {
            const freeId = isPassApplied ? `PASS_${cart.pass_id}_${Date.now()}` : `FREE_BOOKING_${Date.now()}`;
            // Optimistic Success Transition
            setBookingId(freeId);
            setStep('success');
            ['ticpin_cart', 'ticpin_billing_email', 'ticpin_billing_data',
                'ticpin_play_step', 'ticpin_pending_play'].forEach(k => sessionStorage.removeItem(k));

            void completeBooking(
                freeId,
                freeId,
                isPassApplied ? 'TICPASS' : 'FREE',
                cart,
                email,
                session?.id,
                isPassApplied ? orderAmount : 0,
                0,
                appliedCoupon || '',
                appliedOffer?.id
            ).catch(err => {
                console.error("Free booking completion failed:", err);
            });
            return;
        }

        setBookingLoading(true);
        setBookingError('');

        try {
            const orderRes: PaymentOrderResponse = await bookingApi.createPaymentOrder({
                amount: grandTotal,
                customer_phone: billing.phone,
                customer_email: email || `user_${billing.phone}@ticpin.in`,
                customer_id: session?.id || `phone_${billing.phone}`,
                return_url: `${window.location.origin}${window.location.pathname}`,
                type: 'play',
                notes: {
                    user_id: session?.id || '',
                    billing_name: billing.name,
                    billing_email: email || `user_${billing.phone}@ticpin.in`,
                    billing_phone: billing.phone,
                    billing_state: billing.state,
                    billing_city: billing.city,
                    billing_address: billing.address,
                    billing_pincode: billing.pincode,
                }
            });

            sessionStorage.setItem('ticpin_pending_play', JSON.stringify({
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

            // Stage play booking in pending status in the background without blocking the UI
            bookingApi.createPlayBooking({
                user_email: email || `user_${billing.phone}@ticpin.in`,
                user_name: billing.name,
                user_phone: billing.phone,
                address: billing.address,
                city: billing.city,
                state: billing.state,
                pincode: billing.pincode,
                nationality: billing.nationality,
                play_id: cart.eventId,
                venue_name: cart.eventName,
                date: cart.date,
                slot: cart.slot,
                duration: cart.duration,
                tickets: cart.tickets.map(t => ({
                    category: t.category ?? t.name,
                    price: t.price,
                    quantity: t.quantity,
                })),
                order_amount: orderAmount,
                booking_fee: bookingFee,
                coupon_code: appliedCoupon || undefined,
                offer_id: appliedOffer?.id,
                user_id: session?.id,
                payment_id: orderRes.order_id,
                order_id: orderRes.order_id,
                payment_gateway: orderRes.gateway,
                status: 'pending'
            }).catch(err => {
                console.error('Staging play booking in background failed:', err);
            });

            // Use Razorpay only
            try {
                await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            } catch (scriptErr) {
                console.error('Failed to load Razorpay script:', scriptErr);
                setBookingLoading(false);
                setIsProcessing(false);
                setBookingError('Failed to load payment gateway. Please refresh the page and try again.');
                return;
            }
            const options = {
                key: orderRes.razorpay_key,
                amount: grandTotal * 100,
                currency: 'INR',
                order_id: orderRes.order_id,
                name: 'Ticpin',
                description: `${cart.eventName} — ${cart.slot}`,
                method: {
                    upi: true,
                    card: true,
                    netbanking: true,
                    wallet: true
                },
                prefill: { name: billing.name, email, contact: billing.phone },
                theme: { color: '#000000' },
                handler: (response: { razorpay_payment_id: string }) => {
                    // Optimistic Success UI transition
                    setBookingId(response.razorpay_payment_id || orderRes.order_id);
                    setStep('success');
                    ['ticpin_cart', 'ticpin_billing_email', 'ticpin_billing_data',
                        'ticpin_play_step', 'ticpin_pending_play'].forEach(k => sessionStorage.removeItem(k));

                    // Silent complete in background
                    void completeBooking(
                        response.razorpay_payment_id, orderRes.order_id, 'razorpay',
                        cart, email, session?.id,
                        orderAmount, bookingFee,
                        appliedCoupon, appliedOffer?.id,
                    ).catch(err => {
                        console.error('Background completion failed:', err);
                    });
                },
                modal: {
                    ondismiss: () => {
                        sessionStorage.removeItem('ticpin_pending_play');
                        setBookingLoading(false);
                        setIsProcessing(false);
                        setBookingError('Payment was cancelled. You can resume it from your bookings.');
                    },
                    onerror: (response: any) => {
                        console.error('Razorpay error:', response);
                        sessionStorage.removeItem('ticpin_pending_play');
                        setBookingLoading(false);
                        setIsProcessing(false);
                        setBookingError('Payment failed. Please try again.');
                    },
                },
            };
            new (window as any).Razorpay(options).open();
        } catch (err: unknown) {
            console.error('Payment initialization error:', err);
            setBookingLoading(false);
            setIsProcessing(false);
            setBookingError(err instanceof Error ? err.message : 'Payment initiation failed. Please try again.');
        }
    };

    const handleProfileClick = () => {
        if (organizerSession || userSession) {
            setIsProfileDrawerOpen(!isProfileDrawerOpen);
        } else {
            setAuthView('number');
            setShowAuthModal(true);
        }
    };

    const handleUserLogout = () => {
        logoutUser();
        setIsProfileMenuOpen(false);
        router.push('/');
    };

    const handleOrganizerLogoutInternal = () => {
        logoutOrganizer();
        setIsProfileMenuOpen(false);
        router.push('/');
    };

    const handleOrganizerLogout = () => {
        clearOrganizerSession();
        logoutOrganizer();
        setShowLogoutModal(false);
        setShowAuthModal(true);
    };

    // Components for the redesigned structure
    const SectionHeader = ({ title }: { title: string }) => (
        <div className="flex items-center gap-4 mt-8 mb-4">
            <span className="text-[13px] font-semibold text-zinc-800 tracking-wider uppercase">{title}</span>
            <div className="h-[1px] bg-zinc-200 flex-1"></div>
        </div>
    );

    if (step === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                <div className="w-full max-w-[500px] bg-white rounded-2xl p-10 mx-6 text-center shadow-sm border border-zinc-200">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={44} className="text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-black mb-2">Booking Confirmed!</h1>
                    <p className="text-sm font-medium text-zinc-500 mb-1">Booking ID</p>
                    <p className="text-lg font-bold text-black mb-6 bg-zinc-50 rounded-lg py-3 px-4 font-mono uppercase border border-zinc-200">
                        #{bookingId.slice(-10).toUpperCase()}
                    </p>
                    <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                        Confirmation has been sent to your email <br /><span className="font-semibold text-black">{email}</span>
                    </p>
                    {cart && (
                        <div className="bg-zinc-50 rounded-xl p-6 text-left space-y-2 mb-8 border border-zinc-200">
                            <p className="font-bold text-black text-lg">{cart.eventName}</p>
                            <p className="text-sm text-zinc-600">{fmtDate(cart.date)} &nbsp;•&nbsp; {cart.display_slot ?? cart.slot}</p>
                            <div className="pt-2">
                                {cart.tickets.map((t, i) => (
                                    <p key={i} className="text-sm text-zinc-600 font-medium">{t.name}</p>
                                ))}
                            </div>
                        </div>
                    )}
                    <p className="text-2xl font-bold text-black mb-8">
                        {(lockedGrandTotal ?? grandTotal) === 0 ? 'FREE' : `₹${(lockedGrandTotal ?? grandTotal).toLocaleString('en-IN')}`} PAID
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full h-14 bg-black text-white rounded-lg font-semibold text-base transition-colors hover:bg-zinc-800"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (isMobile && step !== 'success') {
        return (
            <MobilePlayReview
                cart={cart}
                step={step}
                setStep={setStep}
                timeRemaining={timeRemaining}
                formatTimer={formatTimer}
                offers={offers}
                appliedOffer={appliedOffer}
                applyOffer={applyOffer}
                removeOffer={() => { setOfferDiscount(0); setAppliedOffer(null); }}
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                couponError={couponError}
                couponSuccess={couponSuccess}
                appliedCoupon={appliedCoupon}
                couponDiscount={couponDiscount}
                validateCoupon={validateCoupon}
                removeCoupon={() => { setCouponDiscount(0); setAppliedCoupon(''); setCouponSuccess(''); }}
                billing={billing}
                setBilling={setBilling}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                email={email}
                setEmail={setEmail}
                handlePayNow={handlePayNow}
                handleContinue={handleContinue}
                isProcessing={isProcessing}
                bookingError={bookingError}
                setBookingError={setBookingError}
                bookingLoading={bookingLoading}
                orderAmount={orderAmount}
                bookingFee={bookingFee}
                grandTotal={grandTotal}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                handleGetLocation={handleGetLocation}
                locationLoading={locationLoading}
                STATES={STATES}
                CITIES={CITIES}
                isPassApplied={isPassApplied}
                venueName={venueName}
            />
        );
    }

    return (
        <div
            className="h-screen w-full flex flex-col overflow-hidden text-zinc-900"
            style={{ background: 'linear-gradient(180deg, #FFF7CD -50%, #FFFFFF 55%)' }}
        >
            {/* Header matches the Figma specification */}
            <header className="shrink-0 sticky top-0 z-50 w-full h-[80px] bg-white border-b border-zinc-200 flex items-center justify-between px-6 lg:px-[37px]">
                <div className="cursor-pointer flex items-center" onClick={() => (step === 'review' ? router.push(`/play/${venueName}/book`) : setStep('review'))}>
                    <Image
                        src="/ticpin-logo-black.png"
                        alt="TICPIN"
                        width={159}
                        height={28}
                        className="h-5 md:h-7 w-auto object-contain"
                        style={{ width: "auto", minWidth: 159, height: 28 }}
                    />
                </div>

                <h1
                    className="hidden md:block absolute left-1/2 -translate-x-1/2 text-[24px] font-semibold text-black"
                    style={{ fontFamily: 'var(--font-anek-latin)', lineHeight: "33px" }}
                >
                    {step === 'billing' ? 'Billing Details' : 'Review your booking'}
                </h1>

                <div className="flex items-center gap-4">
                    {/* Ellipse 1 - Profile avatar */}
                    <div ref={profileRef}>
                        <UserMenu
                            session={organizerSession}
                            userSession={userSession}
                            isMenuOpen={isProfileMenuOpen}
                            onToggleMenu={handleProfileClick}
                            onUserLogout={handleUserLogout}
                            onOrganizerLogout={handleOrganizerLogoutInternal}
                            onOpenProfile={() => { }}
                        />
                    </div>
                </div>
            </header>

            {timeRemaining > 0 && (
                <div className="shrink-0 w-full bg-[#f4effe] flex items-center justify-center py-2 border-b border-[#e9defe]">
                    <Clock className="w-4 h-4 text-[#5331EA] mr-2" />
                    <span className="text-[13px] font-medium text-[#4a3978]">
                        Complete your booking in <span className="text-[#5331EA] font-bold">{timeRemaining > 0 ? formatTimer(timeRemaining) : "00:00"}</span> mins
                    </span>
                </div>
            )}

            <main className="flex-1 overflow-y-auto w-full max-w-[960px] mx-auto px-4 pt-6 pb-40 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
                {/* Rectangle 269 Card */}
                <div className="bg-white rounded-[30px] shadow-sm border border-zinc-100 p-5 md:p-6 relative">

                    {step === 'review' && (
                        <>
                            {/* Order Summary Title */}
                            <div className="pb-[12px]">
                                <h2
                                    className="text-[24px] md:text-[26px] font-semibold text-black leading-tight"
                                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                                >
                                    Order Summary
                                </h2>
                            </div>

                            {/* Line 74 Divider */}
                            <div className="h-[0.5px] bg-[#AEAEAE]/40 w-full mb-6" />

                            {/* SLOTS Section */}
                            <div className="mb-6">
                                <div className="flex items-center gap-4 mb-3">
                                    <span
                                        className="text-[25px] md:text-[27px] font-medium text-[#000000] uppercase tracking-normal"
                                        style={{ fontFamily: "'Anek Tamil Medium', sans-serif", display: 'inline-block', transform: 'scaleY(1.1)' }}
                                    >
                                        SLOTS
                                    </span>
                                    <div className="h-[0.5px] bg-[#AEAEAE]/40 flex-1"></div>
                                </div>

                                {cart ? (
                                    /* Rectangle 270 slot card */
                                    <div className="border-[0.5px] border-[#AEAEAE]/50 rounded-[15px] bg-white p-4 md:p-5 relative flex flex-col md:flex-row justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                            {/* Turf Name and City */}
                                            <div className="flex items-center flex-wrap gap-1.5">
                                                <h3
                                                    className="text-[20px] md:text-[22px] font-semibold text-black leading-tight"
                                                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                                                >
                                                    {cart.eventName}
                                                </h3>
                                                {/* Line 73 vertical divider */}
                                                <div className="hidden sm:block w-[1.5px] h-[22px] bg-[#000000] mx-1.5" />
                                                <h3
                                                    className="text-[20px] md:text-[22px] font-semibold text-black leading-tight"
                                                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                                                >
                                                    {cart.city}
                                                </h3>
                                            </div>

                                            {/* Time Slot */}
                                            <p
                                                className="text-[15px] md:text-[16px] font-medium text-[#686868] leading-tight"
                                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                                            >
                                                {cart.display_slot ?? cart.slot}
                                            </p>

                                            {/* Booked Courts */}
                                            <p
                                                className="text-[15px] md:text-[16px] font-medium text-[#686868] leading-tight"
                                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                                            >
                                                {cart.tickets.map((t) => t.name).join(', ')}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end justify-between gap-4 md:min-w-[120px]">
                                            <button
                                                onClick={() => { sessionStorage.removeItem('ticpin_cart'); router.back(); }}
                                                className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={20} className="text-[#AEAEAE] hover:text-red-500" />
                                            </button>
                                            <p
                                                className="text-[22px] font-semibold text-[#000000] leading-none"
                                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                                            >
                                                ₹{cart.totalPrice}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border-[0.5px] border-[#AEAEAE]/50 rounded-[15px]">
                                        <p className="text-zinc-500 text-sm">Your cart is empty.</p>
                                        <button onClick={() => router.push('/')} className="text-black font-semibold mt-2 text-sm underline underline-offset-4">Explore venues</button>
                                    </div>
                                )}
                            </div>

                            {/* OFFERS Section */}
                            <div className="mb-6">
                                <div className="flex items-center gap-4 mb-3">
                                    <span
                                        className="text-[25px] md:text-[27px] font-medium text-[#000000] uppercase tracking-normal"
                                        style={{ fontFamily: "'Anek Tamil Medium', sans-serif", display: 'inline-block', transform: 'scaleY(1.1)' }}
                                    >
                                        OFFERS
                                    </span>
                                    <div className="h-[0.5px] bg-[#AEAEAE]/40 flex-1"></div>
                                </div>

                                {/* Rectangle 271 offers card */}
                                <div className="border-[0.5px] border-[#AEAEAE]/50 rounded-[15px] bg-white overflow-hidden">

                                    {/* Item 1: Play Offers Toggle */}
                                    <button
                                        onClick={() => setExpandedSection(s => s === 'offers' ? 'none' : 'offers')}
                                        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-zinc-50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-[26px] h-[26px] flex items-center justify-center shrink-0">
                                                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="13" cy="13" r="12" stroke="black" strokeWidth="2" />
                                                    <g transform="translate(4, 4)">
                                                        <path d="M5.81773 8.06834C6.26274 8.06834 6.69775 7.93638 7.06776 7.68914C7.43777 7.44191 7.72616 7.09051 7.89646 6.67938C8.06675 6.26824 8.11131 5.81584 8.0245 5.37938C7.93768 4.94293 7.72339 4.54202 7.40872 4.22735C7.09405 3.91268 6.69314 3.69839 6.25668 3.61157C5.82022 3.52475 5.36782 3.56931 4.95669 3.73961C4.54556 3.90991 4.19415 4.19829 3.94692 4.5683C3.69969 4.93832 3.56773 5.37333 3.56773 5.81834C3.56838 6.41488 3.80564 6.98679 4.22746 7.40861C4.64927 7.83042 5.22119 8.06769 5.81773 8.06834ZM5.81773 5.06834C5.96606 5.06834 6.11107 5.11232 6.23441 5.19474C6.35774 5.27715 6.45387 5.39428 6.51064 5.53133C6.5674 5.66837 6.58226 5.81917 6.55332 5.96466C6.52438 6.11014 6.45295 6.24378 6.34806 6.34867C6.24317 6.45356 6.10953 6.52499 5.96405 6.55393C5.81856 6.58287 5.66776 6.56801 5.53072 6.51125C5.39367 6.45448 5.27654 6.35835 5.19413 6.23502C5.11171 6.11168 5.06773 5.96667 5.06773 5.81834C5.06786 5.61947 5.14692 5.42878 5.28754 5.28815C5.42817 5.14753 5.61886 5.06847 5.81773 5.06834ZM12.181 9.93162C11.736 9.93162 11.301 10.0636 10.931 10.3108C10.561 10.558 10.2726 10.9095 10.1023 11.3206C9.93199 11.7317 9.88743 12.1841 9.97425 12.6206C10.0611 13.057 10.2754 13.4579 10.59 13.7726C10.9047 14.0873 11.3056 14.3016 11.7421 14.3884C12.1785 14.4752 12.6309 14.4306 13.0421 14.2604C13.4532 14.0901 13.8046 13.8017 14.0518 13.4317C14.2991 13.0616 14.431 12.6266 14.431 12.1816C14.4304 11.5851 14.1931 11.0132 13.7713 10.5914C13.3495 10.1695 12.7775 9.93227 12.181 9.93162ZM12.181 12.9316C12.0327 12.9316 11.8877 12.8876 11.7643 12.8052C11.641 12.7228 11.5449 12.6057 11.4881 12.4686C11.4313 12.3316 11.4165 12.1808 11.4454 12.0353C11.4744 11.8898 11.5458 11.7562 11.6507 11.6513C11.7556 11.5464 11.8892 11.475 12.0347 11.446C12.1802 11.4171 12.331 11.4319 12.468 11.4887C12.6051 11.5455 12.7222 11.6416 12.8046 11.7649C12.887 11.8883 12.931 12.0333 12.931 12.1816C12.9309 12.3805 12.8518 12.5712 12.7112 12.7118C12.5706 12.8524 12.3799 12.9315 12.181 12.9316ZM14.7796 3.21973C14.71 3.15007 14.6273 3.09481 14.5363 3.05711C14.4454 3.01941 14.3478 3 14.2493 3C14.1509 3 14.0533 3.01941 13.9623 3.05711C13.8714 3.09481 13.7887 3.15007 13.7191 3.21973L3.21908 13.7197C3.14872 13.7892 3.0928 13.8719 3.05453 13.9631C3.01627 14.0543 2.99641 14.1521 2.9961 14.251C2.99579 14.3498 3.01504 14.4478 3.05273 14.5392C3.09043 14.6306 3.14583 14.7137 3.21575 14.7836C3.28567 14.8535 3.36872 14.9089 3.46014 14.9466C3.55155 14.9843 3.64951 15.0035 3.74839 15.0032C3.84726 15.0029 3.9451 14.9831 4.03627 14.9448C4.12744 14.9065 4.21015 14.8506 4.27962 14.7802L14.7796 4.28023C14.8493 4.21061 14.9045 4.12795 14.9422 4.03696C14.9799 3.94598 14.9993 3.84846 14.9993 3.74998C14.9993 3.6515 14.9799 3.55398 14.9422 3.463C14.9045 3.37202 14.8493 3.28935 14.7796 3.21973Z" fill="black" />
                                                    </g>
                                                </svg>
                                            </div>
                                            <span
                                                className="text-[16px] md:text-[17px] font-medium text-[#000000] leading-none"
                                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                                            >
                                                View all play offers
                                            </span>
                                            {offers.length > 0 && (
                                                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${appliedOffer ? 'bg-green-100 text-green-700' : 'bg-black text-white'}`}>
                                                    {offers.length}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {appliedOffer && <span className="text-[12px] text-green-600 font-semibold uppercase">{appliedOffer.title}</span>}
                                            <ChevronRight size={18} className={`text-black transition-transform ${expandedSection === 'offers' ? 'rotate-90' : ''}`} style={{ transform: expandedSection === 'offers' ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                                        </div>
                                    </button>

                                    {/* Line 77 Divider */}
                                    <div className="h-[0.5px] bg-[#AEAEAE]/40 w-full" />

                                    {expandedSection === 'offers' && (
                                        <div className="p-4 md:p-5 bg-zinc-50 border-b border-[#AEAEAE]/40 space-y-3">
                                            {offers.length > 0 ? offers.map(o => {
                                                const isExpiringSoon = isExpiringWithinDay(o.valid_until, nowMs);
                                                const expiryDate = o.valid_until ? new Date(o.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
                                                const isExpired = Boolean(o.valid_until && new Date(o.valid_until).getTime() <= nowMs);
                                                const countdown = timeLeft[o.id] || 'Loading...';

                                                return (
                                                    <div key={o.id} className={`flex justify-between items-center p-3 rounded-[10px] border shadow-sm bg-white border-zinc-200 ${isExpired ? 'opacity-60' : ''}`}>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <p className="text-[14px] font-bold text-black">{o.title}</p>
                                                                {isExpiringSoon && !isExpired && (
                                                                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded-full animate-pulse">
                                                                        EXPIRES SOON
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[12px] text-zinc-500 mb-0.5">{o.description}</p>
                                                            {o.valid_until && (
                                                                <p className="text-[10px] font-medium text-zinc-600">
                                                                    Valid until: {expiryDate} &nbsp;•&nbsp; <span className="text-[#5331EA]">⏰ {countdown}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => applyOffer(o)}
                                                            disabled={isExpired}
                                                            className="px-3 py-1 bg-black text-white hover:bg-zinc-800 transition-colors text-[12px] font-semibold rounded-lg disabled:opacity-40"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>
                                                );
                                            }) : <p className="text-[12px] text-zinc-500 text-center" style={{ fontFamily: 'var(--font-anek-latin)' }}>No offers available</p>}
                                            {appliedOffer && (
                                                <button onClick={() => { setAppliedOffer(null); setOfferDiscount(0); }} className="text-[11px] text-red-500 font-semibold pt-1 w-full text-right">Remove offer</button>
                                            )}
                                        </div>
                                    )}

                                    {/* Item 2: Coupon Codes Toggle */}
                                    <button
                                        onClick={() => setExpandedSection(s => s === 'coupons' ? 'none' : 'coupons')}
                                        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-zinc-50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0 ml-[-3px]">
                                                <svg width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.6138 27.4157C11.4857 27.4152 11.3591 27.3892 11.2411 27.3393C11.1232 27.2895 11.0163 27.2166 10.9267 27.1251L8.71056 24.9067C8.55354 24.7478 8.4562 24.5395 8.43503 24.3171C8.41387 24.0946 8.47018 23.8717 8.59443 23.686C8.74613 23.4462 8.81175 23.1618 8.78049 22.8797C8.74923 22.5976 8.62296 22.3345 8.42246 22.1338C8.22195 21.9331 7.95916 21.8067 7.67733 21.7754C7.39549 21.7441 7.11142 21.8098 6.87185 21.9617C6.68639 22.086 6.46369 22.1424 6.24146 22.1212C6.01924 22.1 5.81116 22.0026 5.65249 21.8454L3.38798 19.627C3.29654 19.5373 3.22379 19.4303 3.17396 19.3122C3.12412 19.1941 3.09819 19.0673 3.09766 18.9392C3.09819 18.811 3.12412 18.6842 3.17396 18.5661C3.22379 18.4481 3.29654 18.3411 3.38798 18.2513L17.7493 3.8751C17.8389 3.78356 17.9458 3.71074 18.0637 3.66085C18.1817 3.61097 18.3083 3.585 18.4364 3.58447C18.5644 3.585 18.6911 3.61097 18.809 3.66085C18.927 3.71074 19.0338 3.78356 19.1235 3.8751L21.3396 6.09354C21.4966 6.25237 21.594 6.46066 21.6151 6.68312C21.6363 6.90557 21.58 7.12851 21.4557 7.31416C21.2799 7.5573 21.1974 7.85565 21.2233 8.15467C21.2492 8.45369 21.3817 8.7334 21.5966 8.94267C21.8115 9.15194 22.0945 9.27678 22.3938 9.29439C22.6931 9.31199 22.9888 9.22117 23.2267 9.03854C23.4121 8.91416 23.6349 8.85779 23.8571 8.87897C24.0793 8.90016 24.2874 8.9976 24.446 9.15479L26.6622 11.3732C26.7536 11.4629 26.8264 11.5699 26.8762 11.688C26.926 11.8061 26.952 11.9329 26.9525 12.061C26.952 12.1892 26.926 12.316 26.8762 12.4341C26.8264 12.5521 26.7536 12.6591 26.6622 12.7488L12.2525 27.1251C12.0834 27.2985 11.8555 27.4022 11.6138 27.4157ZM10.5589 24.0251L11.6138 25.0713L24.5622 12.061L23.517 11.0051C22.9562 11.1946 22.3536 11.2234 21.7773 11.0881C21.201 10.9529 20.674 10.6591 20.2557 10.2398C19.8395 9.81944 19.5484 9.29138 19.4151 8.71476C19.2818 8.13815 19.3115 7.53576 19.5009 6.9751L18.4364 5.92885L5.43959 18.9392L6.48475 19.9951C7.04572 19.8046 7.64877 19.775 8.22567 19.9096C8.80257 20.0443 9.33031 20.3379 9.74919 20.7573C10.1681 21.1766 10.4614 21.7049 10.5959 22.2824C10.7305 22.8599 10.7009 23.4635 10.5106 24.0251H10.5589Z" fill="black" />
                                                </svg>
                                            </div>
                                            <span
                                                className="text-[16px] md:text-[17px] font-medium text-[#000000] leading-none"
                                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                                            >
                                                View all coupon codes
                                            </span>
                                            {availableCoupons.length > 0 && (
                                                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${appliedCoupon ? 'bg-green-100 text-green-700' : 'bg-black text-white'}`}>
                                                    {availableCoupons.length}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {appliedCoupon && <span className="text-[11px] text-green-600 font-semibold uppercase">{appliedCoupon}</span>}
                                            <ChevronRight size={18} className={`text-black transition-transform ${expandedSection === 'coupons' ? 'rotate-90' : ''}`} style={{ transform: expandedSection === 'coupons' ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                                        </div>
                                    </button>

                                    {expandedSection === 'coupons' && (
                                        <div className="p-4 md:p-5 bg-zinc-50 border-t border-[#AEAEAE]/40 space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter coupon code"
                                                    value={couponInput}
                                                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                                                    onKeyDown={e => e.key === 'Enter' && validateCoupon()}
                                                    className="flex-1 h-10 border border-zinc-200 rounded-[8px] px-3 focus:outline-none focus:border-black text-[13px] bg-white"
                                                />
                                                <button
                                                    onClick={() => validateCoupon()}
                                                    disabled={couponLoading || !couponInput}
                                                    className="px-4 h-10 bg-black text-white rounded-[8px] text-[12px] font-semibold disabled:opacity-40"
                                                >
                                                    {couponLoading ? '...' : 'Apply'}
                                                </button>
                                            </div>
                                            {couponError && <p className="text-red-500 text-[12px]">{couponError}</p>}
                                            {couponSuccess && <p className="text-green-600 text-[12px] font-medium">{couponSuccess}</p>}

                                            {availableCoupons.length > 0 && (
                                                <div className="space-y-2 pt-1">
                                                    {availableCoupons.map(c => {
                                                        const isExpiringSoon = isExpiringWithinDay(c.valid_until, nowMs);
                                                        const expiryDate = c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
                                                        const isExpired = Boolean(c.valid_until && new Date(c.valid_until).getTime() <= nowMs);
                                                        const countdown = timeLeft[`coupon_${c.id}`] || 'Loading...';

                                                        return (
                                                            <div key={c.id} className={`flex justify-between items-center p-3 rounded-[10px] border bg-white border-zinc-200 border-dashed ${isExpired ? 'opacity-60' : ''}`}>
                                                                <div className="flex-1">
                                                                    <p className="text-[14px] font-bold text-black">{c.code}</p>
                                                                    <p className="text-[11px] text-zinc-500">{c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`} OFF</p>
                                                                    {c.valid_until && (
                                                                        <p className="text-[9px] font-medium text-zinc-600">
                                                                            Valid until: {expiryDate} &nbsp;•&nbsp; <span className="text-[#5331EA]">⏰ {countdown}</span>
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => { setCouponInput(c.code); validateCoupon(c.code); }}
                                                                    disabled={isExpired}
                                                                    className="px-3 py-1 bg-black text-white hover:bg-zinc-800 transition-colors text-[12px] font-semibold rounded-lg disabled:opacity-40"
                                                                >
                                                                    Apply
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {appliedCoupon && (
                                                <button onClick={() => { setAppliedCoupon(''); setCouponDiscount(0); setCouponInput(''); setCouponSuccess(''); }} className="text-[12px] text-red-500 font-semibold w-full text-right">Remove coupon</button>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* PAYMENT DETAILS Section */}
                            <div className="mb-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <span
                                        className="text-[25px] md:text-[27px] font-medium text-[#000000] uppercase tracking-normal"
                                        style={{ fontFamily: "'Anek Tamil Medium', sans-serif", display: 'inline-block', transform: 'scaleY(1.1)' }}
                                    >
                                        PAYMENT DETAILS
                                    </span>
                                    <div className="h-[0.5px] bg-[#AEAEAE]/40 flex-1"></div>
                                </div>

                                <div className="space-y-3">
                                    {/* Order amount */}
                                    <div className="flex justify-between items-center">
                                        <span
                                            className="text-[15px] md:text-[16px] font-medium text-[#000000] leading-none"
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        >
                                            Order amount
                                        </span>
                                        <span
                                            className="text-[15px] md:text-[16px] font-medium text-[#000000] leading-none"
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        >
                                            ₹{orderAmount}
                                        </span>
                                    </div>

                                    {/* Booking fee */}
                                    <div className="flex justify-between items-center">
                                        <span
                                            className="text-[15px] md:text-[16px] font-medium text-[#686868] leading-none"
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        >
                                            Booking fee (inc. of GST)
                                        </span>
                                        <span
                                            className="text-[15px] md:text-[16px] font-medium text-[#686868] leading-none"
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        >
                                            ₹{bookingFee}
                                        </span>
                                    </div>

                                    {/* Discount if applicable */}
                                    {totalDiscount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span
                                                className="text-[15px] md:text-[16px] font-semibold text-green-600 leading-none"
                                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                                            >
                                                Total Discount
                                            </span>
                                            <span
                                                className="text-[15px] md:text-[16px] font-semibold text-green-600 leading-none"
                                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                                            >
                                                -₹{totalDiscount}
                                            </span>
                                        </div>
                                    )}

                                    {/* Line 79 Divider */}
                                    <div className="h-[0.5px] bg-[#AEAEAE]/40 w-full my-4" />

                                    {/* Grand total */}
                                    <div className="flex justify-between items-center">
                                        <span
                                            className="text-[22px] md:text-[24px] font-semibold text-[#000000] leading-none"
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        >
                                            Grand total
                                        </span>
                                        <span
                                            className="text-[22px] md:text-[24px] font-semibold text-[#000000] leading-none"
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        >
                                            ₹{grandTotal}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {bookingError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl mb-4 text-xs border border-red-100">
                                    <TriangleAlert size={14} />
                                    <span>{bookingError}</span>
                                </div>
                            )}

                            {/* Line 82 Divider */}
                            <div className="h-[0.5px] bg-[#AEAEAE]/40 w-full mb-6" />

                            {/* BOTTOM ACTIONS */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    {/* Checkbox (Rectangle 283) */}
                                    <div
                                        className={`w-[20px] h-[20px] rounded-[6px] border flex items-center justify-center transition-colors shrink-0 ${acceptedTerms ? 'bg-[#16A34A] border-[#16A34A]' : 'border-[#686868]'}`}
                                    >
                                        {acceptedTerms && <CheckCircle2 size={12} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={acceptedTerms}
                                        onChange={() => { setAcceptedTerms(!acceptedTerms); setBookingError(''); }}
                                    />
                                    <span
                                        className="text-[15px] md:text-[16px] font-medium leading-none"
                                        style={{ fontFamily: 'var(--font-anek-latin)', color: 'black' }}
                                    >
                                        I have read and accepted the <span className="underline" style={{ color: '#E7C200' }}>terms and conditions</span>
                                    </span>
                                </label>

                                {/* Continue Button Container (Rectangle 282) */}
                                <button
                                    onClick={handleContinue}
                                    className="h-[42px] px-6 md:px-8 bg-[#000000] hover:bg-zinc-800 transition-colors rounded-[7px] flex items-center justify-center cursor-pointer shrink-0"
                                >
                                    <span
                                        className="text-[18px] md:text-[20px] font-medium text-[#FFFFFF] uppercase tracking-normal"
                                        style={{ fontFamily: "'Anek Tamil Medium', sans-serif", display: 'inline-block', transform: 'scaleY(1.1)' }}
                                    >
                                        CONTINUE
                                    </span>
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'billing' && (
                        <div ref={billingRef}>
                            {/* Billing Details Title */}
                            <div className="pb-[12px]">
                                <h2
                                    className="text-[24px] md:text-[26px] font-semibold text-black leading-tight"
                                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                                >
                                    Billing Details
                                </h2>
                            </div>

                            {/* Line 74 Divider */}
                            <div className="h-[0.5px] bg-[#AEAEAE]/40 w-full mb-6" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label
                                        className="text-[15px] md:text-[16px] font-medium text-[#686868]"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    >
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFirstName(val);
                                            setBilling(b => ({ ...b, name: (val.trim() + " " + lastName.trim()).trim() }));
                                            setBookingError('');
                                        }}
                                        className="w-full h-11 border border-[#AEAEAE] rounded-[8px] px-4 focus:outline-none focus:border-black text-[15px]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label
                                        className="text-[15px] md:text-[16px] font-medium text-[#686868]"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    >
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setLastName(val);
                                            setBilling(b => ({ ...b, name: (firstName.trim() + " " + val.trim()).trim() }));
                                            setBookingError('');
                                        }}
                                        className="w-full h-11 border border-[#AEAEAE] rounded-[8px] px-4 focus:outline-none focus:border-black text-[15px]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label
                                        className="text-[15px] md:text-[16px] font-medium text-[#686868]"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    >
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setBookingError(''); }}
                                        className="w-full h-11 border border-[#AEAEAE] rounded-[8px] px-4 focus:outline-none focus:border-black text-[15px]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label
                                        className="text-[15px] md:text-[16px] font-medium text-[#686868]"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    >
                                        Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[15px]"
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        >
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            value={billing.phone}
                                            onChange={e => { setBilling({ ...billing, phone: e.target.value.replace(/\D/g, '') }); setBookingError(''); }}
                                            className="w-full h-11 border border-[#AEAEAE] rounded-[8px] pl-14 pr-4 focus:outline-none focus:border-black text-[15px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 mt-4">
                                <div className="flex justify-between items-center">
                                    <label
                                        className="text-[15px] md:text-[16px] font-medium text-[#686868]"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    >
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={locationLoading}
                                        className="flex items-center gap-1 text-[13px] md:text-[14px] font-semibold text-[#5331EA] hover:opacity-80 transition-all disabled:opacity-50"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    >
                                        {locationLoading ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5331EA]" />
                                                <span className="text-zinc-500">Fetching...</span>
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="w-3.5 h-3.5 text-[#5331EA]" />
                                                <span>Get Location</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={billing.address}
                                    onChange={e => { setBilling({ ...billing, address: e.target.value }); setBookingError(''); }}
                                    className="w-full h-11 border border-[#AEAEAE] rounded-[8px] px-4 focus:outline-none focus:border-black text-[15px]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <SearchableSelect
                                    label="State"
                                    value={billing.state}
                                    onChange={val => { setBilling({ ...billing, state: val }); setBookingError(''); }}
                                    options={STATES}
                                    placeholder="Select State"
                                    required
                                />
                                <SearchableSelect
                                    label="City"
                                    value={billing.city}
                                    onChange={val => { setBilling({ ...billing, city: val }); setBookingError(''); }}
                                    options={CITIES}
                                    placeholder="Select City"
                                    required
                                />
                                <div className="space-y-1.5">
                                    <label
                                        className="text-[15px] md:text-[16px] font-medium text-[#686868]"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    >
                                        PIN Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        maxLength={6}
                                        value={billing.pincode}
                                        onChange={e => { setBilling({ ...billing, pincode: e.target.value.replace(/\D/g, '') }); setBookingError(''); }}
                                        className="w-full h-11 border border-[#AEAEAE] rounded-[8px] px-4 focus:outline-none focus:border-black text-[15px]"
                                    />
                                </div>
                            </div>

                            {bookingError && (
                                <div className="mt-6 flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                                    <TriangleAlert size={14} />
                                    <span>{bookingError}</span>
                                </div>
                            )}

                            {/* Line 82 Divider */}
                            <div className="h-[0.5px] bg-[#AEAEAE]/40 w-full my-6" />

                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <button
                                    onClick={() => setStep('review')}
                                    className="text-zinc-500 font-medium text-[15px] hover:text-black transition-colors"
                                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                                >
                                    &larr; Back to review
                                </button>

                                <button
                                    onClick={handlePayNow}
                                    disabled={bookingLoading}
                                    className="bg-[#000000] hover:bg-zinc-800 transition-colors h-[42px] px-6 md:px-8 rounded-[7px] flex items-center justify-center font-medium disabled:opacity-50 shrink-0"
                                >
                                    <span
                                        className="text-[18px] md:text-[20px] font-medium text-[#FFFFFF] uppercase tracking-normal"
                                        style={{ fontFamily: "'Anek Tamil Medium', sans-serif", display: 'inline-block', transform: 'scaleY(1.1)' }}
                                    >
                                        {bookingLoading ? 'Processing...' : `Pay ₹${grandTotal}`}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            <ProfileDrawer
                isOpen={isProfileDrawerOpen}
                onClose={() => setIsProfileDrawerOpen(false)}
                userSession={userSession}
                session={organizerSession}
                onUserLogout={handleUserLogout}
                onOrganizerLogout={handleOrganizerLogoutInternal}
                router={router}
                forceRole="user"
            />

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialView={authView}
            />
        </div>
    );
}
