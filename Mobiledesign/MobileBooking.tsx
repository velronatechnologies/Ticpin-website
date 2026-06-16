'use client';

import { useState } from 'react';
import { ChevronLeft, Info, Percent } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileChooseTickets from './MobileChooseTickets';
import MobileReviewBooking from './MobileReviewBooking';

interface MobileBookingProps {
    event?: {
        name: string;
        date: string;
        time: string;
    };
}

export default function MobileBooking({ event }: MobileBookingProps) {
    const router = useRouter();
    const [view, setView] = useState<'layout' | 'tickets' | 'review'>('layout');

    if (view === 'review') {
        return <MobileReviewBooking event={event} onBack={() => setView('tickets')} />;
    }

    if (view === 'tickets') {
        return <MobileChooseTickets event={event} onBack={() => setView('layout')} onCheckout={() => setView('review')} />;
    }

    return (
        <div className="md:hidden min-h-screen bg-white relative flex flex-col" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
            {/* Header Section - Roughly 132px high in Figma */}
            <div className="w-full pt-4 px-4 relative h-[132px] shrink-0">
                {/* Back Button - Ellipse 1 */}
                <button 
                    onClick={() => router.back()}
                    className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-sm absolute left-[15px] top-[18px] z-10 border border-[#EFEFEF]"
                >
                    <ChevronLeft size={20} className="text-black" />
                </button>

                {/* Event Title and Info */}
                <div className="w-full flex flex-col items-center mt-[2px]">
                    <h1 className="text-[20px] font-semibold text-black uppercase leading-tight text-center px-12">
                        {event?.name || '{EVENT NAME}'}
                    </h1>
                    <p className="text-[10px] font-medium text-[#5331EA] mt-1 uppercase">
                        {event?.date || '{DAY}, {DATE} {MONTH}'}, {event?.time || '{TIME}'}
                    </p>
                </div>

                {/* Select Section & Filters */}
                <div className="absolute left-[18px] top-[81px]">
                    <h2 className="text-[15px] font-medium text-black">Select a section</h2>
                    <div className="flex items-center gap-2 mt-[10px]">
                        <span className="text-[10px] font-normal text-black">Filters:</span>
                        <div className="flex gap-2">
                            {['₹5000', '₹9500', '₹25,000'].map((price) => (
                                <button 
                                    key={price} 
                                    className="h-[17px] px-2 bg-[#EFEFEF] border border-[#AEAEAE] rounded-[5px] text-[8px] font-medium text-black flex items-center justify-center active:scale-95 transition-transform"
                                >
                                    {price}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Banner - Rectangle 518 */}
            <div className="w-full h-[26px] bg-[#5331EA] flex items-center justify-between px-[10px] shrink-0">
                <div className="flex items-center gap-1.5">
                    <div className="w-[11px] h-[11px] flex items-center justify-center">
                         <Percent size={10} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-normal text-white uppercase tracking-tight mt-[1px]">
                        {`{MORE PROFITABLE OFFER FOR USER}`}
                    </span>
                </div>
                <Info size={11} className="text-white" />
            </div>

            {/* Main Layout Area - Scrollable */}
            <div className="flex-1 w-full flex flex-col items-center pt-[76px] pb-[50px] gap-[7px] overflow-y-auto px-4">
                {/* Rectangle 273 (Top Box) */}
                <div 
                    onClick={() => setView('tickets')}
                    className="w-[292px] h-[80px] bg-[#D9D9D9] flex items-center justify-center shrink-0 cursor-pointer active:scale-[0.98] transition-transform"
                >
                    <span className="text-[10px] font-medium text-black uppercase tracking-tight text-center px-4">{`{SAMPLE LAYOUT IMAGE}`}</span>
                </div>

                {/* Row with Rectangles 274, 272, 275 (Middle Boxes) */}
                <div className="flex gap-[6px] shrink-0">
                    <div 
                        onClick={() => setView('tickets')}
                        className="w-[93px] h-[80px] bg-[#D9D9D9] flex items-center justify-center px-2 cursor-pointer active:scale-[0.98] transition-transform"
                    >
                        <span className="text-[6px] font-medium text-black text-center uppercase leading-tight">{`{SAMPLE LAYOUT IMAGE}`}</span>
                    </div>
                    <div 
                        onClick={() => setView('tickets')}
                        className="w-[93px] h-[80px] bg-[#D9D9D9] flex items-center justify-center px-2 cursor-pointer active:scale-[0.98] transition-transform"
                    >
                        <span className="text-[6px] font-medium text-black text-center uppercase leading-tight">{`{SAMPLE LAYOUT IMAGE}`}</span>
                    </div>
                    <div 
                        onClick={() => setView('tickets')}
                        className="w-[93px] h-[80px] bg-[#D9D9D9] flex items-center justify-center px-2 cursor-pointer active:scale-[0.98] transition-transform"
                    >
                        <span className="text-[6px] font-medium text-black text-center uppercase leading-tight">{`{SAMPLE LAYOUT IMAGE}`}</span>
                    </div>
                </div>

                {/* Rectangle 278 (Bottom Box) */}
                <div 
                    onClick={() => setView('tickets')}
                    className="w-[292px] h-[108px] bg-[#D9D9D9] flex items-center justify-center shrink-0 cursor-pointer active:scale-[0.98] transition-transform"
                >
                    <span className="text-[10px] font-medium text-black uppercase tracking-tight text-center px-4">{`{SAMPLE LAYOUT IMAGE}`}</span>
                </div>
            </div>

            {/* Legend Footer - Rectangle 519 */}
            <div className="w-full h-[88px] bg-[#EFEFEF] flex items-center justify-center gap-10 shrink-0 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="w-[15px] h-[15px] bg-[#D9D9D9] rounded-[5px]" />
                    <span className="text-[10px] font-normal text-black whitespace-nowrap">Sold out</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-[15px] h-[15px] bg-white border border-[#AEAEAE] rounded-[5px]" />
                    <span className="text-[10px] font-normal text-black whitespace-nowrap">Nearly sold</span>
                </div>
            </div>
        </div>
    );
}
