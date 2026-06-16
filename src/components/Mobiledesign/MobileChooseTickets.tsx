'use client';

import { ChevronLeft, Info, Percent } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MobileChooseTicketsProps {
    event?: {
        name: string;
        date: string;
        time: string;
    };
    onBack: () => void;
    onCheckout: () => void;
}

export default function MobileChooseTickets({ event, onBack, onCheckout }: MobileChooseTicketsProps) {
    return (
        <div className="md:hidden min-h-screen bg-white relative flex flex-col" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
            {/* Header Section */}
            <div className="w-full pt-4 px-4 relative h-[80px] shrink-0">
                <button 
                    onClick={onBack}
                    className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-sm absolute left-[15px] top-[18px] z-10 border border-[#EFEFEF]"
                >
                    <ChevronLeft size={20} className="text-black" />
                </button>

                <div className="w-full flex flex-col items-center mt-[2px]">
                    <h1 className="text-[20px] font-semibold text-black uppercase leading-tight text-center px-12">
                        {event?.name || '{EVENT NAME}'}
                    </h1>
                    <p className="text-[10px] font-medium text-[#5331EA] mt-1 uppercase">
                        {event?.date || '{DAY}, {DATE} {MONTH}'}, {event?.time || '{TIME}'}
                    </p>
                </div>
            </div>

            {/* Choose Tickets Title */}
            <div className="px-[25px] mt-[10px] mb-4">
                <h2 className="text-[15px] font-medium text-black">Choose tickets</h2>
            </div>

            {/* Ticket Card - Rectangle 522 */}
            <div className="mx-auto w-[352px] max-w-[90vw] border border-[#E1E1E1] rounded-[15px] overflow-hidden flex flex-col">
                <div className="p-[15px] pb-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                            <span className="text-[15px] font-medium text-black">Phase 1</span>
                            <div className="w-[1px] h-[15px] bg-black mx-2" />
                            <span className="text-[15px] font-medium text-black">General Access</span>
                        </div>
                        <button className="w-[61px] h-[23px] bg-[#EFEFEF] border border-[#686868] rounded-[5px] text-[12px] font-medium text-black flex items-center justify-center active:scale-95 transition-transform">
                            Add
                        </button>
                    </div>
                    
                    <span className="text-[12px] font-normal text-black block mb-4">₹5,000</span>
                    
                    <div className="w-full h-[0.5px] bg-[#E1E1E1] mb-4" />
                    
                    <ul className="space-y-2 mb-4">
                        <li className="flex gap-2">
                            <span className="text-[#686868] text-[10px] leading-tight">• Each ticket grants entry to one perosn in the General Access area.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-[#686868] text-[10px] leading-tight">• Access to food stalls, bars and washrooms in the General Access area.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-[#686868] text-[10px] leading-tight">• This is a standing area with wheelchair accessibility.</span>
                        </li>
                    </ul>
                </div>

                {/* Offer Banner in Card - Rectangle 518 */}
                <div className="w-full h-[26px] bg-[#5331EA] flex items-center justify-between px-[10px]">
                    <div className="flex items-center gap-1.5">
                        <Percent size={10} className="text-white" strokeWidth={3} />
                        <span className="text-[10px] font-normal text-white uppercase tracking-tight">
                            {`{MORE PROFITABLE OFFER FOR USER}`}
                        </span>
                    </div>
                    <Info size={11} className="text-white" />
                </div>
            </div>

            {/* Sticky Footer - Rectangle 519 */}
            <div className="mt-auto w-full h-[88px] bg-[#EFEFEF] flex items-center justify-between px-[25px] shrink-0">
                <div className="flex flex-col">
                    <span className="text-[12px] font-normal text-black">1 ticket</span>
                    <span className="text-[20px] font-medium text-black leading-tight">₹5,000</span>
                </div>
                <button 
                    onClick={onCheckout}
                    className="w-[148px] h-[44px] bg-black text-white rounded-[14px] font-semibold text-[15px] flex items-center justify-center active:scale-95 transition-transform"
                >
                    Checkout
                </button>
            </div>
        </div>
    );
}
