'use client';

import React, { RefObject } from 'react';
import Link from 'next/link';

interface BillingDetailsFormProps {
    billingRef: RefObject<HTMLDivElement | null>;
    cart: any;
    grandTotal: number;
    billing: {
        name: string;
        phone: string;
        nationality: string;
        state: string;
    };
    setBilling: React.Dispatch<React.SetStateAction<{
        name: string;
        phone: string;
        nationality: string;
        state: string;
    }>>;
    email: string;
    setEmail: (val: string) => void;
    acceptedTerms: boolean;
    setAcceptedTerms: (val: boolean) => void;
    bookingError: string;
    setBookingError: (val: string) => void;
    bookingLoading: boolean;
    isPaying: boolean;
    handlePayNow: () => void;
    INDIAN_STATES: string[];
}

export default function BillingDetailsForm({
    billingRef,
    cart,
    grandTotal,
    billing,
    setBilling,
    email,
    setEmail,
    acceptedTerms,
    setAcceptedTerms,
    bookingError,
    setBookingError,
    bookingLoading,
    isPaying,
    handlePayNow,
    INDIAN_STATES
}: BillingDetailsFormProps) {
    return (
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
                            className="w-full h-[55px] border border-[#AEAEAE] rounded-[10px] px-5 focus:outline-none focus:border-black text-black font-medium text-[16px] placeholder:text-[#AEAEAE] bg-white"
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
                            className="w-full h-[55px] border border-[#AEAEAE] rounded-[10px] px-5 focus:outline-none focus:border-black text-black font-medium text-[16px] placeholder:text-[#AEAEAE] bg-white"
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
                            disabled={bookingLoading || isPaying}
                            className="flex-1 h-[55px] bg-black text-white rounded-[10px] font-bold text-[22px] uppercase hover:bg-zinc-800 active:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wider shadow-lg shadow-black/10"
                            style={{ fontFamily: 'Anek Tamil Condensed' }}
                        >
                            {bookingLoading ? 'Processing...' : (grandTotal === 0 ? 'CONTINUE' : 'PAY NOW')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
