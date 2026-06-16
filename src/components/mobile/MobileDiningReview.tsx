'use client';

import { ChevronLeft, Percent, User, ChevronRight, Clock, TriangleAlert, Check, X, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CartData {
    eventId: string;
    eventName: string;
    city: string;
    type: 'dining';
    date: string;
    timeSlot: string;
    guests: number;
    totalPrice: number;
    offerId?: string | null;
    offerType?: string | null;
    use_pass?: boolean;
    pass_id?: string;
}

interface OfferItem {
    id: string;
    title: string;
    description?: string;
    discount_value: number;
    discount_type: 'percent' | 'flat';
}

interface MobileDiningReviewProps {
    cart: CartData | null;
    step: 'review' | 'billing' | 'success';
    setStep: (step: 'review' | 'billing' | 'success') => void;
    timeRemaining: number;
    formatTimer: (seconds: number) => string;
    selectedOffer: OfferItem | null;
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
    orderAmount: number;
    bookingFee: number;
    totalDiscount: number;
    grandTotal: number;
    acceptedTerms: boolean;
    setAcceptedTerms: (val: boolean) => void;
    isPassApplied: boolean;
    pass: any;
    venueName: string;
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

export default function MobileDiningReview({
    cart,
    step,
    setStep,
    timeRemaining,
    formatTimer,
    selectedOffer,
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
    bookingError,
    setBookingError,
    bookingLoading,
    orderAmount,
    bookingFee,
    totalDiscount,
    grandTotal,
    acceptedTerms,
    setAcceptedTerms,
    isPassApplied,
    pass,
    venueName
}: MobileDiningReviewProps) {
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
                            router.push(`/dining/venue/${venueName}/book`);
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
                                <span className="text-[14px] font-semibold text-black">{cart.timeSlot}</span>
                            </div>
                            <div className="p-4 flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-[16px] font-bold text-black leading-tight">
                                        Table Reservation
                                    </h3>
                                    <p className="text-[12px] font-medium text-[#686868] uppercase tracking-tight">
                                        {cart.guests} Guests
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[16px] font-bold text-black">₹{cart.totalPrice}</p>
                                </div>
                            </div>
                        </div>

                        {/* Applied Offer Details */}
                        {selectedOffer && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-[11px] font-bold text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">APPLIED OFFER</h2>
                                    <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                                </div>
                                <div className="border border-green-200 rounded-[12px] p-4 bg-green-50/50 flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <Tag size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-bold text-green-950 uppercase">{selectedOffer.title}</h4>
                                            <p className="text-[11px] text-green-700 font-semibold uppercase mt-0.5">
                                                {selectedOffer.discount_type === 'percent' ? `${selectedOffer.discount_value}% OFF` : `₹${selectedOffer.discount_value} OFF`} APPLIED
                                            </p>
                                        </div>
                                    </div>
                                    <Check className="text-green-600" size={18} />
                                </div>
                            </div>
                        )}

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
        </div>
    );
}
