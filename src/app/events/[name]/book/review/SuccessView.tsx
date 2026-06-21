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
                <div className="flex-shrink-0 cursor-pointer" onClick={() => {
                    sessionStorage.removeItem('ticpin_booking_step');
                    router.push('/');
                }}>
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
            <div className="h-[86vh] w-full max-w-[760px] px-4 overflow-y-auto scrollbar-hide flex flex-col gap-3 shrink-0 pb-4 justify-start">
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>

                {/* 1. Main Booking Card */}
                <div
                    className="w-full border-[0.5px] border-[#686868] rounded-[20px] py-3.5 px-6 flex flex-col shrink-0 mt-1"
                    style={{ background: 'radial-gradient(52.97% 102.98% at 0% -7.55%, #D6FAE5 0%, #FFFFFF 100%)' }}
                >
                    <div className="flex items-center gap-1.5 mb-2.5">
                        <h1 className="text-[22px] md:text-[24px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            Booking confirmed
                        </h1>
                        <div className="w-[20px] h-[20px] rounded-full bg-[#0AC655] flex items-center justify-center shrink-0 shadow-sm shadow-[#0AC655]/20">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        {/* Booking ID Row */}
                        <div className="flex flex-col gap-0.5 py-0.5 -mt-2">
                            <span className="text-[13px] font-medium text-[#686868]  tracking-normal" style={{ fontFamily: 'var(--font-anek-latin)' }}>Booking ID: #{bookingId.slice(-10)}</span>
                        </div>

                        <div className="border-t border-[#686868]/20 w-full" />

                        {/* Event Name Row */}
                        <div className="flex flex-col gap-0.5 py-0.5">
                            <span className="text-[13px] font-medium text-[#686868] tracking-normal" style={{ fontFamily: 'var(--font-anek-latin)' }}>Event name</span>
                            <span className="text-[15px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                {cart?.eventName || 'Event'}
                            </span>
                        </div>

                        <div className="border-t border-[#686868]/20 w-full" />

                        {/* Date & Time Row */}
                        <div className="flex flex-col gap-0.5 py-0.5">
                            <span className="text-[13px] font-medium text-[#686868]  tracking-normal" style={{ fontFamily: 'var(--font-anek-latin)' }}>Date & Time</span>
                            <span className="text-[15px] font-medium text-black " style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                {cart?.date ? new Date(cart.date).toLocaleDateString('en-IN', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }) : new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} | {cart?.timeSlot || cart?.slot || 'N/A'}
                            </span>
                        </div>

                        <div className="border-t border-[#686868]/20 w-full" />

                        {/* Location Row */}
                        <div className="flex flex-col gap-0.5 py-0.5">
                            <span className="text-[13px] font-medium text-[#686868]  tracking-normal" style={{ fontFamily: 'var(--font-anek-latin)' }}>Location</span>
                            <span className="text-[15px] font-medium text-black " style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                {cart?.city || 'Venue Location'}
                            </span>
                        </div>

                        <div className="border-t border-[#686868]/20 w-full" />

                        {/* Tickets Row */}
                        <div className="flex flex-col gap-0.5 py-0.5">
                            <span className="text-[13px] font-medium text-[#686868]  tracking-normal" style={{ fontFamily: 'var(--font-anek-latin)' }}>Tickets</span>
                            <span className="text-[15px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                {cart?.tickets?.map((t: any) => `${t.quantity}x ${t.name}`).join(', ') || '1x Ticket'}
                            </span>
                        </div>

                        <div className="border-t border-[#686868]/20 w-full" />

                        {/* Total Amount Paid Row */}
                        <div className="flex flex-col gap-0.5 py-0.5">
                            <span className="text-[13px] font-medium text-[#686868]  tracking-normal" style={{ fontFamily: 'var(--font-anek-latin)' }}>Total amount paid</span>
                            <span className="text-[15px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                ₹{grandTotal.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Email Confirmation Text */}
                <p className="text-[15px] font-medium text-[#686868] text-center w-full px-4" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                    Booking confirmation has been sent to your email
                </p>

                {/* 2. Your Details Section */}
                <div className="w-full space-y-2 shrink-0">
                    <h2 className="text-[16px] font-semibold text-black px-1" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        Your details
                    </h2>
                    <div className="w-full bg-white border-[0.5px] border-[#686868] rounded-[20px] p-4 flex items-center gap-4">
                        <div className="w-[38px] h-[38px] rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0 border border-[#EBEBEB]">
                            <svg className="w-[16px] h-[20px] text-[#4B5563]" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.9348 19.6403C21.2221 19.6403 25.5083 15.4115 25.5083 10.1951C25.5083 4.97873 21.2221 0.75 15.9348 0.75C10.6475 0.75 6.36133 4.97873 6.36133 10.1951C6.36133 15.4115 10.6475 19.6403 15.9348 19.6403Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path fillRule="evenodd" clipRule="evenodd" d="M0.750032 32.7775C0.747492 32.1135 0.898008 31.4576 1.19023 30.8595C2.10724 29.05 4.6932 28.0911 6.83899 27.6568C8.38654 27.331 9.95546 27.1133 11.5341 27.0054C14.4568 26.7521 17.3963 26.7521 20.319 27.0054C21.8975 27.1145 23.4663 27.3322 25.0141 27.6568C27.1599 28.0911 29.7458 28.9596 30.6628 30.8595C31.2505 32.0788 31.2505 33.4943 30.6628 34.7136C29.7458 36.6134 27.1599 37.482 25.0141 37.8981C23.4683 38.2374 21.8989 38.4612 20.319 38.5676C17.9402 38.7666 15.5502 38.8029 13.1663 38.6762C12.6161 38.6762 12.0843 38.6762 11.5341 38.5676C9.96012 38.4626 8.39664 38.2387 6.85733 37.8981C4.6932 37.482 2.12558 36.6134 1.19023 34.7136C0.899501 34.1085 0.749134 33.4471 0.750032 32.7775Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[15px] font-medium text-black  truncate" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                {billing.name || session?.name || 'User'}
                            </span>
                            <span className="text-[14px] font-medium text-[#686868] truncate" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                {email || session?.email || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Booking Date & Action Button */}
                <div className="w-full flex flex-col gap-3  shrink-0">
                    <p className="text-[13px] font-medium text-[#686868] px-1" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        Booking date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>

                    <button
                        onClick={() => {
                            sessionStorage.removeItem('ticpin_booking_step');
                            router.push('/');
                        }}
                        className="w-full h-[44px] bg-black text-white rounded-[7px] font-medium text-[24px] hover:bg-zinc-900 active:scale-[0.99] transition-all flex items-center justify-center tracking-normal cursor-pointer"
                        style={{ fontFamily: "var(--font-anek-tamil-condensed), 'Anek Tamil Condensed', sans-serif" }}
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
