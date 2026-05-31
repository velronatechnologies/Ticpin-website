'use client';

import { ChevronLeft, Percent, Ticket, User, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface MobilePlayReviewProps {
    venue: {
        id: number | string;
        title: string;
        location: string;
    };
    onBack: () => void;
}

export default function MobilePlayReview({ venue, onBack }: MobilePlayReviewProps) {
    const [timeLeft, setTimeLeft] = useState(600); // 10 mins

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="md:hidden fixed inset-0 z-[140] bg-white font-sans overflow-y-auto pb-32" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
            {/* Header */}
            <header className="fixed top-0 left-0 w-full h-[60px] bg-white border-b border-zinc-100 flex items-center px-4 z-50">
                <button onClick={onBack} className="w-[31px] h-[31px] flex items-center justify-center">
                    <ChevronLeft size={24} className="text-black" />
                </button>
                <h1 className="ml-4 text-[18px] font-semibold text-black">Review your booking</h1>
            </header>

            <main className="mt-[60px] px-4 py-4 space-y-3">
                {/* Timer Banner */}
                <div className="w-full h-[29px] bg-[#E1E1E1] rounded-[8px] flex items-center justify-center">
                    <p className="text-[12px] font-medium text-black">
                        Complete your booking in <span className="text-[#5331EA]">{formatTime(timeLeft)}</span> mins
                    </p>
                </div>

                {/* Venue Header Summary - Horizontal layout with reduced padding */}
                <div className="flex items-center gap-4 py-2 px-1">
                    <div className="w-[117px] h-[66px] bg-[#5331EA] rounded-[15px] overflow-hidden shadow-sm flex items-center justify-center p-2 shrink-0">
                        <img src="/login/banner.jpeg" className="w-full h-full object-contain" alt="TICPIN" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-[20px] font-semibold text-black uppercase leading-tight">{`{VENUE NAME}`}</h2>
                        <p className="text-[13px] font-normal text-[#686868] mt-1">{`{LOCATION}`}</p>
                    </div>
                </div>

                {/* Booking Details Card - Refined to match screenshot */}
                <div className="w-full border border-[#D9D9D9] rounded-[9px] overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-4">
                        <span className="text-[15px] font-medium text-black whitespace-nowrap">Fri, 01 May</span>
                        <div className="w-[1px] h-[23px] bg-black shrink-0" />
                        <span className="text-[15px] font-medium text-black whitespace-nowrap">3 - 4 PM</span>
                    </div>
                    {/* Centered Half Divider Line */}
                    <div className="px-4">
                        <div className="w-full h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    <div className="p-4 flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="text-[18px] font-semibold text-black leading-none">5v5 Turf</h3>
                            <p className="text-[15px] font-normal text-black mt-1 uppercase tracking-tight">{`{TURF OPTIONS}`}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[18px] font-medium text-black leading-none">₹800</p>
                            <button className="text-[12px] font-medium text-[#686868] border-b border-dotted border-[#686868] leading-none mt-2">Remove</button>
                        </div>
                    </div>
                </div>

                {/* Offers Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[13px] font-medium text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">OFFERS</h2>
                        <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    <div className="w-full border border-[#D9D9D9] rounded-[9px]">
                        <button className="w-full px-4 py-4 flex items-center gap-3 active:bg-zinc-50 transition-colors">
                            <Percent size={19} className="text-black" />
                            <span className="text-[18px] font-medium text-black">View all play offers</span>
                            <ChevronRight size={18} className="ml-auto text-black" />
                        </button>
                        {/* Centered Half Divider Line */}
                        <div className="px-4">
                            <div className="w-full h-[0.7px] bg-[#D9D9D9]" />
                        </div>
                        <button className="w-full px-4 py-4 flex items-center gap-3 active:bg-zinc-50 transition-colors">
                            <Ticket size={20} className="text-black" />
                            <span className="text-[18px] font-medium text-black">View all coupon codes</span>
                            <ChevronRight size={18} className="ml-auto text-black" />
                        </button>
                    </div>
                </div>

                {/* Payment Details Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[13px] font-medium text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">PAYMENT DETAILS</h2>
                        <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    <div className="w-full border border-[#D9D9D9] rounded-[9px] py-4">
                        <div className="px-4 flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[17px] font-semibold text-black leading-none">Order amount</p>
                                <p className="text-[12px] font-normal text-black flex items-center gap-1">Fees and chargers <ChevronDown size={12} /></p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[17px] font-semibold text-black leading-none">₹800</p>
                                <p className="text-[12px] font-normal text-black">₹104</p>
                            </div>
                        </div>
                        {/* Centered Half Divider Line */}
                        <div className="px-4 py-3">
                            <div className="w-full h-[0.7px] bg-[#D9D9D9]" />
                        </div>
                        <div className="px-4 flex justify-between items-center">
                            <span className="text-[17px] font-semibold text-black">Grand Total</span>
                            <span className="text-[17px] font-semibold text-black">₹904</span>
                        </div>
                    </div>
                </div>

                {/* Payment Options Section */}
                <div className="w-full border border-[#AEAEAE] rounded-[9px] p-4 space-y-6">
                    {/* Option 1 */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-[17px] font-medium text-black">Pay ₹904 in full</p>
                            <p className="text-[12px] font-normal text-[#686868]">One-time payment</p>
                        </div>
                        <div className="w-[20px] h-[20px] rounded-full border-2 border-[#686868] mt-1" />
                    </div>

                    {/* Divider */}
                    <div className="w-full h-[0.7px] bg-[#D9D9D9]" />

                    {/* Option 2 */}
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-[15px] font-normal text-black">Pay ₹271 now</p>
                                <p className="text-[12px] font-normal text-[#5331EA]">Pay remaining ₹632 at the venue</p>
                            </div>
                            <div className="w-[20px] h-[20px] rounded-full border-2 border-[#5331EA] bg-white flex items-center justify-center mt-1">
                                <div className="w-[10px] h-[10px] rounded-full bg-[#5331EA]" />
                            </div>
                        </div>
                        <div className="flex items-start gap-1">
                            <span className="text-[8px] text-[#686868] mt-0.5">✦</span>
                            <p className="text-[10px] font-medium text-[#686868]">Your booking will be confirmed once partial payment is done</p>
                        </div>
                    </div>
                </div>

                {/* Billing Details Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[13px] font-medium text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">BILLING DETAILS</h2>
                        <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    <div className="w-full border border-[#AEAEAE] rounded-[9px] p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <User size={24} className="text-[#686868] shrink-0" />
                                <span className="text-[17px] font-semibold text-black">{`User Name {AUTO FETCH}`}</span>
                            </div>
                            <button className="text-[12px] font-normal text-black flex items-center gap-1">Edit <ChevronRight size={14} /></button>
                        </div>
                        <div className="space-y-2 ml-11">
                            <p className="text-[13px] font-normal text-black">{`User number {AUTO FETCH}`}</p>
                            <p className="text-[13px] font-normal text-black">{`User email {AUTO FETCH}`}</p>
                            <p className="text-[13px] font-normal text-black">{`User state {AUTO FETCH}`}</p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[#D9D9D9]">
                            <p className="text-[12px] font-normal text-[#686868] leading-tight">
                                Information mentioned above will be used for generating the invoice and sending out the tickets.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Bar */}
            <div className="fixed bottom-0 left-0 w-full h-[88px] bg-[#EFEFEF] rounded-t-[50px] flex items-center justify-between px-8 z-[150] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col">
                    <span className="text-[20px] font-medium text-black leading-none">₹271</span>
                    <span className="text-[15px] font-light text-black">TOTAL</span>
                </div>
                <button 
                    className="w-[148px] h-[44px] bg-black text-white rounded-[14px] font-semibold text-[15px] flex items-center justify-center active:scale-95 transition-all"
                >
                    Pay now
                </button>
            </div>
        </div>
    );
}

function ChevronDown({ size, className }: { size: number; className?: string }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
