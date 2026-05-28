'use client';

import React from 'react';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuccessViewProps {
    bookingId: string;
    cart: any;
    grandTotal: number;
    billing: {
        name: string;
        phone: string;
        nationality: string;
        state: string;
    };
    session: any;
    email: string;
    setIsProfileDrawerOpen: (open: boolean) => void;
}

export default function SuccessView({
    bookingId,
    cart,
    grandTotal,
    billing,
    session,
    email,
    setIsProfileDrawerOpen,
}: SuccessViewProps) {
    const router = useRouter();

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col items-center bg-[#FDFDFD]">
            {/* Top Space (8vh) */}
            <div className="h-[8vh] w-full flex items-center justify-between px-6 md:px-10 bg-[#FDFDFD] shrink-0">
                <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push('/')}>
                    <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-[20px] md:h-[22px] w-auto object-contain" />
                </div>
                <button
                    onClick={() => setIsProfileDrawerOpen(true)}
                    className="w-[40px] h-[40px] bg-[#F3F4F6] rounded-full flex items-center justify-center border border-[#E5E7EB] cursor-pointer hover:bg-zinc-100 transition-colors"
                >
                    <User className="text-[#4B5563]" size={20} />
                </button>
            </div>

            {/* Content Card Viewport (86vh) */}
            <div className="h-[86vh] w-full max-w-[560px] px-4 overflow-y-auto hide-scrollbar flex flex-col gap-3 shrink-0 pb-4 justify-start">
                {/* 1. Main Booking Card */}
                <div
                    className="w-full border-[0.5px] border-[#686868] rounded-[20px] p-4 md:p-5 flex flex-col shrink-0 mt-1"
                    style={{ background: 'radial-gradient(52.97% 102.98% at 0% -7.55%, #D6FAE5 0%, #FFFFFF 100%)' }}
                >
                    <div className="flex justify-between items-center mb-3">
                        <h1 className="text-[22px] md:text-[24px] font-semibold text-black" style={{ fontFamily: 'Anek Latin' }}>
                            Booking confirmed
                        </h1>
                        <div className="w-[30px] h-[30px] rounded-full bg-[#0AC655] flex items-center justify-center shrink-0 shadow-sm shadow-[#0AC655]/20">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Booking ID Row */}
                        <div className="flex justify-between items-center py-0.5">
                            <span className="text-[13px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>Booking ID:</span>
                            <span className="text-[13px] font-semibold text-black uppercase" style={{ fontFamily: 'Anek Latin' }}>
                                #{bookingId.slice(-10).toUpperCase()}
                            </span>
                        </div>

                        <div className="border-t border-[#686868]/20 w-full" />

                        {/* Event Name Row */}
                        <div className="flex flex-col gap-0.5 py-0.5">
                            <span className="text-[13px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>Event name</span>
                            <span className="text-[15px] font-semibold text-black" style={{ fontFamily: 'Anek Latin' }}>
                                {cart?.eventName || 'Event'}
                            </span>
                        </div>

                        <div className="border-t border-[#686868]/20 w-full" />

                        {/* Date & Time Row */}
                        <div className="flex flex-col gap-0.5 py-0.5">
                            <span className="text-[13px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>Date & Time</span>
                            <span className="text-[15px] font-medium text-black uppercase" style={{ fontFamily: 'Anek Latin' }}>
                                {cart?.date ? new Date(cart.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} | {cart?.timeSlot || cart?.slot || 'N/A'}
                            </span>
                        </div>

                        <div className="border-t border-[#686868]/20 w-full" />

                        {/* Location Row */}
                        <div className="flex flex-col gap-0.5 py-0.5">
                            <span className="text-[13px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>Location</span>
                            <span className="text-[15px] font-medium text-black uppercase" style={{ fontFamily: 'Anek Latin' }}>
                                {cart?.city || 'Venue Location'}
                            </span>
                        </div>

                        <div className="border-t border-[#686868]/20 w-full" />

                        {/* Tickets Row */}
                        <div className="flex flex-col gap-0.5 py-0.5">
                            <span className="text-[13px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>Tickets</span>
                            <span className="text-[15px] font-medium text-black uppercase" style={{ fontFamily: 'Anek Latin' }}>
                                {cart?.tickets?.map((t: any) => `${t.quantity}x ${t.name}`).join(', ') || '1x Ticket'}
                            </span>
                        </div>

                        <div className="border-t border-[#686868]/20 w-full" />

                        {/* Total Amount Paid Row */}
                        <div className="flex flex-col gap-0.5 py-0.5">
                            <span className="text-[13px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>Total amount paid</span>
                            <span className="text-[15px] font-bold text-black" style={{ fontFamily: 'Anek Latin' }}>
                                ₹{grandTotal.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Email Confirmation Text */}
                <p className="text-[15px] font-medium text-[#686868] text-center w-full px-4" style={{ fontFamily: 'Anek Latin' }}>
                    Booking confirmation has been sent to your email
                </p>

                {/* 2. Your Details Section */}
                <div className="w-full space-y-2 shrink-0">
                    <h2 className="text-[16px] font-semibold text-black px-1" style={{ fontFamily: 'Anek Latin' }}>
                        Your details
                    </h2>
                    <div className="w-full bg-white border-[0.5px] border-[#686868] rounded-[20px] p-4 flex items-center gap-4">
                        <div className="w-[38px] h-[38px] rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-[#EBEBEB]">
                            <User className="text-[#686868]" size={20} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[15px] font-medium text-black uppercase truncate" style={{ fontFamily: 'Anek Latin' }}>
                                {billing.name || session?.name || 'User'}
                            </span>
                            <span className="text-[14px] font-medium text-[#686868] truncate" style={{ fontFamily: 'Anek Latin' }}>
                                {email || session?.email || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Booking Date & Action Button */}
                <div className="w-full flex flex-col gap-3 mt-1 shrink-0">
                    <p className="text-[13px] font-medium text-[#686868] px-1" style={{ fontFamily: 'Anek Latin' }}>
                        Booking date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full h-[52px] bg-black text-white rounded-[7px] font-medium text-[24px] hover:bg-zinc-900 active:scale-[0.99] transition-all flex items-center justify-center uppercase tracking-wider cursor-pointer"
                        style={{ fontFamily: 'Anek Tamil Condensed' }}
                    >
                        BACK TO HOME
                    </button>
                </div>
            </div>

            {/* Bottom Space (6vh) */}
            <div className="h-[6vh] w-full bg-[#FDFDFD] shrink-0" />
        </div>
    );
}
