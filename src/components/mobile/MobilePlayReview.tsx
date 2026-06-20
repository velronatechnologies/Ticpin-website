'use client';

import { ChevronLeft, Percent, Ticket, User, ChevronRight, Clock, MapPin, Loader2, TriangleAlert, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

interface OfferItem {
    id: string;
    title: string;
    description: string;
    discount_value: number;
    discount_type: 'percent' | 'flat';
    valid_until?: string;
}

interface MobilePlayReviewProps {
    cart: CartData | null;
    step: 'review' | 'billing' | 'success';
    setStep: (step: 'review' | 'billing' | 'success') => void;
    timeRemaining: number;
    formatTimer: (seconds: number) => string;
    offers: OfferItem[];
    appliedOffer: OfferItem | null;
    applyOffer: (offer: OfferItem) => void;
    removeOffer: () => void;
    couponInput: string;
    setCouponInput: (val: string) => void;
    couponError: string;
    couponSuccess: string;
    appliedCoupon: string;
    couponDiscount: number;
    validateCoupon: (code?: string) => Promise<void>;
    removeCoupon: () => void;
    billing: {
        name: string;
        phone: string;
        nationality: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    setBilling: (val: any) => void;
    firstName: string;
    setFirstName: (val: string) => void;
    lastName: string;
    setLastName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    handlePayNow: () => Promise<void>;
    handleContinue: () => void;
    isProcessing: boolean;
    bookingError: string;
    setBookingError: (val: string) => void;
    bookingLoading: boolean;
    orderAmount: number;
    bookingFee: number;
    grandTotal: number;
    acceptedTerms: boolean;
    setAcceptedTerms: (val: boolean) => void;
    handleGetLocation: () => void;
    locationLoading: boolean;
    STATES: string[];
    CITIES: string[];
    isPassApplied: boolean;
    venueName: string;
}

export default function MobilePlayReview({
    cart,
    step,
    setStep,
    timeRemaining,
    formatTimer,
    offers,
    appliedOffer,
    applyOffer,
    removeOffer,
    couponInput,
    setCouponInput,
    couponError,
    couponSuccess,
    appliedCoupon,
    couponDiscount,
    validateCoupon,
    removeCoupon,
    billing,
    setBilling,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    handlePayNow,
    handleContinue,
    isProcessing,
    bookingError,
    setBookingError,
    bookingLoading,
    orderAmount,
    bookingFee,
    grandTotal,
    acceptedTerms,
    setAcceptedTerms,
    handleGetLocation,
    locationLoading,
    STATES,
    CITIES,
    isPassApplied,
    venueName
}: MobilePlayReviewProps) {
    const router = useRouter();
    const [isOffersOpen, setIsOffersOpen] = useState(false);
    const [isCouponsOpen, setIsCouponsOpen] = useState(false);
    const [isEditingBilling, setIsEditingBilling] = useState(false);

    if (!cart) return null;

    const fmtDate = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const totalDiscount = (appliedOffer ? couponDiscount + (appliedOffer.discount_type === 'percent' ? Math.round(orderAmount * appliedOffer.discount_value / 100) : appliedOffer.discount_value) : couponDiscount);

    return (
        <div className="md:hidden fixed inset-0 z-[140] bg-white font-sans overflow-y-auto pb-32" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
            {/* Header */}
            <header className="fixed top-0 left-0 w-full h-[60px] bg-white border-b border-zinc-100 flex items-center px-4 z-50">
                <h1 className="ml-2 text-[18px] font-bold text-black tracking-tight">
                    {step === 'billing' ? 'Billing Details' : 'Review your booking'}
                </h1>
            </header>

            <main className="mt-[60px] px-4 py-4 space-y-4">
                {/* Timer Banner */}
                {timeRemaining > 0 && (
                    <div className="w-full h-[32px] bg-zinc-100 rounded-[8px] flex items-center justify-center gap-2">
                        <Clock size={14} className="text-[#5331EA]" />
                        <p className="text-[12px] font-medium text-black">
                            Complete your booking in <span className="text-[#5331EA] font-bold">{formatTimer(timeRemaining)}</span> mins
                        </p>
                    </div>
                )}

                {step === 'review' ? (
                    <>
                        {/* Venue Header Summary */}
                        <div className="flex items-center gap-4 py-1 px-1">
                            <div className="w-[100px] h-[60px] bg-[#D9D9D9] rounded-[10px] overflow-hidden shrink-0">
                                <img src="/login/banner.jpeg" className="w-full h-full object-cover" alt="Venue" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-[18px] font-bold text-black uppercase leading-tight truncate">{cart.eventName}</h2>
                                <p className="text-[12px] font-medium text-[#686868] mt-0.5 truncate">{cart.city}</p>
                            </div>
                        </div>

                        {/* Booking Details Card */}
                        <div className="w-full border border-[#D9D9D9] rounded-[12px] overflow-hidden">
                            <div className="px-4 py-3 flex items-center gap-4 bg-zinc-50 border-b border-[#D9D9D9]">
                                <span className="text-[14px] font-semibold text-black">{fmtDate(cart.date)}</span>
                                <div className="w-[1px] h-[16px] bg-zinc-300 shrink-0" />
                                <span className="text-[14px] font-semibold text-black">{cart.display_slot || cart.slot}</span>
                            </div>
                            <div className="p-4 flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-[16px] font-bold text-black leading-tight">
                                        {cart.tickets[0]?.name || 'Court Booking'}
                                    </h3>
                                    <p className="text-[12px] font-medium text-[#686868] uppercase tracking-tight">
                                        {cart.duration * 0.5} Hours duration
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[16px] font-bold text-black">₹{cart.totalPrice}</p>
                                </div>
                            </div>
                        </div>

                        {/* Offers Section */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-[11px] font-bold text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">OFFERS & COUPONS</h2>
                                <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                            </div>
                            <div className="w-full border border-[#D9D9D9] rounded-[12px] overflow-hidden bg-white divide-y divide-[#D9D9D9]">
                                <button
                                    onClick={() => setIsOffersOpen(true)}
                                    className="w-full px-4 py-3.5 flex items-center gap-3 active:bg-zinc-50 transition-colors text-left"
                                >
                                    <Percent size={18} className="text-black" />
                                    <span className="text-[15px] font-semibold text-black flex-1">
                                        {appliedOffer ? `Offer Applied: ${appliedOffer.title}` : 'View all play offers'}
                                    </span>
                                    <ChevronRight size={16} className="text-zinc-400" />
                                </button>
                                <button
                                    onClick={() => setIsCouponsOpen(true)}
                                    className="w-full px-4 py-3.5 flex items-center gap-3 active:bg-zinc-50 transition-colors text-left"
                                >
                                    <Ticket size={18} className="text-black" />
                                    <span className="text-[15px] font-semibold text-black flex-1">
                                        {appliedCoupon ? `Coupon Applied: ${appliedCoupon}` : 'View all coupon codes'}
                                    </span>
                                    <ChevronRight size={16} className="text-zinc-400" />
                                </button>
                            </div>
                        </div>

                        {/* Terms and conditions */}
                        <div className="pt-2">
                            <label className="flex items-start gap-3 cursor-pointer select-none">
                                <div className={`mt-0.5 w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors shrink-0 ${
                                    acceptedTerms ? 'bg-[#16A34A] border-[#16A34A]' : 'border-zinc-300'
                                }`}>
                                    {acceptedTerms && <Check size={12} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={acceptedTerms}
                                    onChange={() => { setAcceptedTerms(!acceptedTerms); setBookingError(''); }}
                                />
                                <span className="text-[13px] font-medium text-zinc-700 leading-tight">
                                    I have read and accepted the <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-amber-600 font-semibold">terms and conditions</a>
                                </span>
                            </label>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Billing Form Section */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-[#686868]">First Name *</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFirstName(val);
                                            setBilling((b: any) => ({ ...b, name: (val.trim() + " " + lastName.trim()).trim() }));
                                            setBookingError('');
                                        }}
                                        className="w-full h-11 border border-[#AEAEAE] rounded-[8px] px-3 focus:outline-none focus:border-black text-[14px]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-[#686868]">Last Name *</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setLastName(val);
                                            setBilling((b: any) => ({ ...b, name: (firstName.trim() + " " + val.trim()).trim() }));
                                            setBookingError('');
                                        }}
                                        className="w-full h-11 border border-[#AEAEAE] rounded-[8px] px-3 focus:outline-none focus:border-black text-[14px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[13px] font-semibold text-[#686868]">Email Address *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setBookingError(''); }}
                                    className="w-full h-11 border border-[#AEAEAE] rounded-[8px] px-3 focus:outline-none focus:border-black text-[14px]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[13px] font-semibold text-[#686868]">Mobile Number *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[14px]">+91</span>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={billing.phone}
                                        onChange={e => { setBilling({ ...billing, phone: e.target.value.replace(/\D/g, '') }); setBookingError(''); }}
                                        className="w-full h-11 border border-[#AEAEAE] rounded-[8px] pl-16 pr-3 focus:outline-none focus:border-black text-[14px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-[13px] font-semibold text-[#686868]">Address *</label>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={locationLoading}
                                        className="flex items-center gap-1 text-[13px] font-semibold text-[#5331EA]"
                                    >
                                        {locationLoading ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span>Locating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="w-3 h-3" />
                                                <span>Get Location</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={billing.address}
                                    onChange={e => { setBilling({ ...billing, address: e.target.value }); setBookingError(''); }}
                                    className="w-full h-11 border border-[#AEAEAE] rounded-[8px] px-3 focus:outline-none focus:border-black text-[14px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-[#686868]">State *</label>
                                    <select
                                        value={billing.state}
                                        onChange={e => { setBilling({ ...billing, state: e.target.value }); setBookingError(''); }}
                                        className="w-full h-11 border border-[#AEAEAE] bg-white rounded-[8px] px-2 focus:outline-none focus:border-black text-[14px]"
                                    >
                                        <option value="">Select State</option>
                                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-[#686868]">City *</label>
                                    <select
                                        value={billing.city}
                                        onChange={e => { setBilling({ ...billing, city: e.target.value }); setBookingError(''); }}
                                        className="w-full h-11 border border-[#AEAEAE] bg-white rounded-[8px] px-2 focus:outline-none focus:border-black text-[14px]"
                                    >
                                        <option value="">Select City</option>
                                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[13px] font-semibold text-[#686868]">PIN Code *</label>
                                <input
                                    type="tel"
                                    maxLength={6}
                                    value={billing.pincode}
                                    onChange={e => { setBilling({ ...billing, pincode: e.target.value.replace(/\D/g, '') }); setBookingError(''); }}
                                    className="w-full h-11 border border-[#AEAEAE] rounded-[8px] px-3 focus:outline-none focus:border-black text-[14px]"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Booking & Error Summary */}
                {bookingError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                        <TriangleAlert size={14} className="shrink-0" />
                        <span>{bookingError}</span>
                    </div>
                )}

                {/* Price Breakdown Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[11px] font-bold text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">PAYMENT DETAILS</h2>
                        <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    <div className="w-full border border-[#D9D9D9] rounded-[12px] p-4 bg-zinc-50 space-y-2">
                        <div className="flex justify-between text-[14px]">
                            <span className="text-[#686868] font-medium">Order amount</span>
                            <span className="font-semibold text-black">₹{orderAmount}</span>
                        </div>
                        <div className="flex justify-between text-[14px]">
                            <span className="text-[#686868] font-medium">Booking fee</span>
                            <span className="font-semibold text-black">₹{bookingFee}</span>
                        </div>
                        {totalDiscount > 0 && (
                            <div className="flex justify-between text-[14px] text-green-600">
                                <span className="font-medium">Total Discount</span>
                                <span className="font-bold">-₹{totalDiscount}</span>
                            </div>
                        )}
                        <div className="border-t border-[#D9D9D9] pt-2 flex justify-between text-[16px] font-bold text-black">
                            <span>Grand Total</span>
                            <span>₹{grandTotal}</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Bar */}
            <div className="fixed bottom-0 left-0 w-full h-[88px] bg-[#EFEFEF] rounded-t-[30px] flex items-center justify-between px-6 z-[130] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-zinc-200">
                <div className="flex flex-col">
                    <span className="text-[20px] font-bold text-black leading-none">₹{grandTotal}</span>
                    <span className="text-[11px] font-semibold text-[#686868] uppercase tracking-wider mt-0.5">TOTAL</span>
                </div>
                {step === 'review' ? (
                    <button
                        onClick={handleContinue}
                        className="w-[148px] h-[44px] bg-black text-white rounded-[14px] font-bold text-[15px] flex items-center justify-center active:scale-95 transition-all"
                    >
                        Continue
                    </button>
                ) : (
                    <button
                        onClick={handlePayNow}
                        disabled={bookingLoading}
                        className="w-[148px] h-[44px] bg-black text-white rounded-[14px] font-bold text-[15px] flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
                    >
                        {bookingLoading ? 'Processing...' : 'Pay now'}
                    </button>
                )}
            </div>

            {/* Offers Selection Drawer */}
            {isOffersOpen && (
                <div className="fixed inset-0 z-[200] bg-black/60 flex flex-col justify-end animate-in fade-in duration-200">
                    <div className="bg-white rounded-t-[24px] max-h-[70vh] flex flex-col overflow-hidden pb-6">
                        <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
                            <h3 className="text-[18px] font-bold text-black">Available Offers</h3>
                            <button onClick={() => setIsOffersOpen(false)} className="w-8 h-8 flex items-center justify-center">
                                <X size={20} className="text-zinc-500" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-3 flex-1">
                            {offers.length > 0 ? (
                                offers.map(o => {
                                    const isSelected = appliedOffer?.id === o.id;
                                    return (
                                        <div
                                            key={o.id}
                                            onClick={() => {
                                                if (isSelected) {
                                                    removeOffer();
                                                } else {
                                                    applyOffer(o);
                                                }
                                                setIsOffersOpen(false);
                                            }}
                                            className={`p-4 border rounded-[12px] cursor-pointer transition-all ${
                                                isSelected ? 'border-black bg-black/5' : 'border-zinc-200 bg-white'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-black text-[15px]">{o.title}</h4>
                                                <span className="text-[12px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                                                    {o.discount_type === 'percent' ? `${o.discount_value}% OFF` : `₹${o.discount_value} OFF`}
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-zinc-500 mt-1">{o.description}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center py-8 text-zinc-500 font-medium">No offers available at the moment.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Coupon Code Drawer */}
            {isCouponsOpen && (
                <div className="fixed inset-0 z-[200] bg-black/60 flex flex-col justify-end animate-in fade-in duration-200">
                    <div className="bg-white rounded-t-[24px] max-h-[80vh] flex flex-col overflow-hidden pb-6">
                        <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
                            <h3 className="text-[18px] font-bold text-black">Apply Coupon</h3>
                            <button onClick={() => setIsCouponsOpen(false)} className="w-8 h-8 flex items-center justify-center">
                                <X size={20} className="text-zinc-500" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Coupon Code"
                                    value={couponInput}
                                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                    className="flex-1 h-11 border border-zinc-300 rounded-[8px] px-3 focus:outline-none focus:border-black uppercase text-[14px]"
                                />
                                <button
                                    onClick={async () => {
                                        await validateCoupon();
                                        if (couponSuccess) {
                                            setIsCouponsOpen(false);
                                        }
                                    }}
                                    className="px-6 bg-black text-white rounded-[8px] font-bold text-[14px]"
                                >
                                    Apply
                                </button>
                            </div>

                            {couponError && <p className="text-[12px] text-red-500 font-medium">{couponError}</p>}
                            {couponSuccess && <p className="text-[12px] text-green-600 font-medium">{couponSuccess}</p>}

                            {appliedCoupon && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[8px] flex justify-between items-center">
                                    <div>
                                        <span className="text-[12px] font-bold text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded mr-2">
                                            {appliedCoupon}
                                        </span>
                                        <span className="text-[13px] font-medium text-emerald-700">₹{couponDiscount} discount applied</span>
                                    </div>
                                    <button onClick={removeCoupon} className="text-red-500 text-[12px] font-bold">Remove</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
