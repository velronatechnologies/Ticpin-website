'use client';

import { ChevronLeft, Percent, Tag, ChevronRight, Clock, User, Check, Edit2, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartData {
    eventId: string;
    eventName: string;
    city: string;
    tickets: { name: string; price: number; quantity: number }[];
    totalPrice: number;
    type?: 'event';
    date?: string;
    timeSlot?: string;
}

interface MobileReviewBookingProps {
    cart: CartData | null;
    step: 'review' | 'billing' | 'success';
    setStep: (step: 'review' | 'billing' | 'success') => void;
    timeRemaining: number;
    formatTimer: (seconds: number) => string;
    eventData: { id: string; name: string; portrait_image_url?: string; landscape_image_url?: string } | null;
    offers: any[];
    expandedSection: 'none' | 'offers' | 'coupons';
    toggleSection: (sec: 'none' | 'offers' | 'coupons') => void;
    couponInput: string;
    setCouponInput: (val: string) => void;
    validateCoupon: () => void;
    couponLoading: boolean;
    couponError: string;
    couponSuccess: string;
    applyOffer: (offer: any) => void;
    removeOffer: () => void;
    removeCoupon: () => void;
    orderAmount: number;
    bookingFee: number;
    totalDiscount: number;
    grandTotal: number;
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
    bookingError: string;
    setBookingError: (val: string) => void;
    bookingLoading: boolean;
    acceptedTerms: boolean;
    setAcceptedTerms: (val: boolean) => void;
    removeTicket: (index: number) => void;
    phoneInputValue: string;
    handlePhoneChange: (e: any) => void;
}

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
];

export default function MobileReviewBooking({
    cart,
    step,
    setStep,
    timeRemaining,
    formatTimer,
    eventData,
    offers,
    expandedSection,
    toggleSection,
    couponInput,
    setCouponInput,
    validateCoupon,
    couponLoading,
    couponError,
    couponSuccess,
    applyOffer,
    removeOffer,
    removeCoupon,
    orderAmount,
    bookingFee,
    totalDiscount,
    grandTotal,
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
    bookingError: checkoutError,
    setBookingError,
    bookingLoading,
    acceptedTerms,
    setAcceptedTerms,
    removeTicket,
    phoneInputValue,
    handlePhoneChange
}: MobileReviewBookingProps) {
    const router = useRouter();

    if (!cart) return null;

    const fmtDate = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <div className="md:hidden fixed inset-0 z-[140] bg-white font-sans overflow-y-auto pb-32" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
            {/* Header */}
            <header className="fixed top-0 left-0 w-full h-[60px] bg-white border-b border-zinc-100 flex items-center px-4 z-50">
                <button
                    onClick={() => {
                        if (step === 'billing') {
                            setStep('review');
                        } else {
                            router.back();
                        }
                    }}
                    className="w-[31px] h-[31px] flex items-center justify-center"
                >
                    <ChevronLeft size={24} className="text-black" />
                </button>
                <h1 className="ml-4 text-[18px] font-bold text-black tracking-tight">
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
                        {/* Event Summary Section */}
                        <div className="flex gap-4 items-center">
                            <div className="w-[80px] h-[63px] bg-[#110D2C] rounded-[10px] overflow-hidden shrink-0 relative flex items-center justify-center shadow-sm border border-[#E1E1E1]">
                                {eventData?.landscape_image_url || eventData?.portrait_image_url ? (
                                    <Image
                                        src={eventData.landscape_image_url || eventData.portrait_image_url || ''}
                                        alt={cart.eventName}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <span className="text-[10px] text-[#5331EA] font-extrabold italic uppercase tracking-wider text-center z-20">TICPIN</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-[15px] font-semibold text-black uppercase tracking-tight leading-tight">
                                    {cart.eventName}
                                </h2>
                                <p className="text-[13px] font-normal text-[#686868] mt-0.5 uppercase tracking-wide">
                                    {cart.city}
                                </p>
                            </div>
                        </div>

                        {/* Ticket details */}
                        <div className="w-full border border-[#D9D9D9] rounded-[9px] bg-white overflow-hidden shadow-sm">
                            <div className="px-4 py-3 bg-zinc-50 border-b border-[#D9D9D9] flex justify-between items-center">
                                <span className="text-[15px] font-semibold text-black">
                                    {cart.date ? fmtDate(cart.date) : 'Date'}
                                </span>
                                <span className="text-[15px] font-semibold text-black">
                                    {cart.timeSlot || 'Time'}
                                </span>
                            </div>
                            <div className="p-4 space-y-4">
                                {cart.tickets?.map((t, i) => (
                                    <div key={i} className="flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-[18px] font-medium text-black">
                                                    {t.quantity} x {t.name}
                                                </span>
                                                <span className="text-[15px] font-normal text-[#686868] mt-1">
                                                    ₹{t.price.toLocaleString('en-IN')} cover
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span className="text-[18px] font-semibold text-black">
                                                    ₹{(t.price * t.quantity).toLocaleString('en-IN')}
                                                </span>
                                                <button
                                                    onClick={() => removeTicket(i)}
                                                    className="text-[12px] font-semibold text-[#686868] underline active:scale-95 transition-transform"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Offers / Coupons */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-semibold text-[#3B3B3B] tracking-[0.1em] uppercase">OFFERS</span>
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
                                        <span className="text-[18px] font-medium text-black text-left">
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
                                        <span className="text-[18px] font-medium text-black text-left">
                                            View all coupon codes
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className={`text-[#686868] transition-transform ${expandedSection === 'coupons' ? 'rotate-90' : ''}`} />
                                </button>
                            </div>

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

                        {/* Phone confirmation */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-semibold text-[#686868] block">
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
                        </div>

                        {/* Terms checkbox */}
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
                                    I have read and accepted the <span className="underline text-amber-600 font-semibold">terms and conditions</span>
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
                                        className="w-full h-11 border border-[#AEAEAE] rounded-[8px] pl-12 pr-3 focus:outline-none focus:border-black text-[14px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[13px] font-semibold text-[#686868]">Address *</label>
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
                                    <input
                                        type="text"
                                        value={billing.city}
                                        onChange={e => { setBilling({ ...billing, city: e.target.value }); setBookingError(''); }}
                                        className="w-full h-11 border border-[#AEAEAE] rounded-[8px] px-3 focus:outline-none focus:border-black text-[14px]"
                                    />
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
                {checkoutError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                        <TriangleAlert size={14} className="shrink-0" />
                        <span>{checkoutError}</span>
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
                            <span className="text-[#686868] font-medium">Fees & charges</span>
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
        </div>
    );
}
