'use client';

import { ChevronLeft, Info, Percent } from 'lucide-react';
import { useState } from 'react';

interface MobileChooseTicketsProps {
    event?: {
        name: string;
        date: string;
        time: string;
    };
    onBack: () => void;
    onCheckout: (quantity: number, pricePerTicket: number) => void;
}

export default function MobileChooseTickets({ event, onBack, onCheckout }: MobileChooseTicketsProps) {
    const [quantity, setQuantity] = useState(0);
    const PRICE_PER_TICKET = 5000;

    const handleIncrement = () => {
        setQuantity(prev => Math.min(prev + 1, 10)); // limit max tickets to 10
    };

    const handleDecrement = () => {
        setQuantity(prev => Math.max(prev - 1, 0));
    };

    const handleCheckoutClick = () => {
        if (quantity > 0) {
            onCheckout(quantity, PRICE_PER_TICKET);
        }
    };

    return (
        <div className="md:hidden min-h-screen bg-white relative flex flex-col" style={{ fontFamily: "'Anek Latin', sans-serif", paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}>
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
                        {event?.name || 'THE TICPIN PLAY FESTIVAL'}
                    </h1>
                    <p className="text-[10px] font-medium text-[#5331EA] mt-1 uppercase">
                        {event?.date || 'SAT, 23 MAY'}, {event?.time || '7:00 PM'}
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
                        {quantity === 0 ? (
                            <button 
                                onClick={handleIncrement}
                                className="w-[61px] h-[23px] bg-[#EFEFEF] border border-[#686868] rounded-[5px] text-[12px] font-medium text-black flex items-center justify-center active:scale-95 transition-transform"
                            >
                                Add
                            </button>
                        ) : (
                            <div className="flex items-center border border-[#686868] rounded-[5px] bg-[#EFEFEF] h-[23px] overflow-hidden">
                                <button 
                                    onClick={handleDecrement}
                                    className="px-2 text-[14px] font-bold text-black active:bg-zinc-200 transition-colors"
                                >
                                    -
                                </button>
                                <span className="px-2 text-[12px] font-medium text-black min-w-[20px] text-center">
                                    {quantity}
                                </span>
                                <button 
                                    onClick={handleIncrement}
                                    className="px-2 text-[14px] font-bold text-black active:bg-zinc-200 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <span className="text-[12px] font-normal text-black block mb-4">₹{PRICE_PER_TICKET.toLocaleString('en-IN')}</span>
                    
                    <div className="w-full h-[0.5px] bg-[#E1E1E1] mb-4" />
                    
                    <ul className="space-y-2 mb-4">
                        <li className="flex gap-2">
                            <span className="text-[#686868] text-[10px] leading-tight">• Each ticket grants entry to one person in the General Access area.</span>
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
                            Flat 10% discount on purchase of 3+ tickets
                        </span>
                    </div>
                    <Info size={11} className="text-white" />
                </div>
            </div>

            {/* Sticky Footer - Rectangle 519 */}
            <div className="mt-auto w-full h-[88px] bg-[#EFEFEF] flex items-center justify-between px-[25px] shrink-0 border-t border-zinc-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="flex flex-col">
                    <span className="text-[12px] font-normal text-black">
                        {quantity} {quantity === 1 ? 'ticket' : 'tickets'}
                    </span>
                    <span className="text-[20px] font-medium text-black leading-tight">
                        ₹{(quantity * PRICE_PER_TICKET).toLocaleString('en-IN')}
                    </span>
                </div>
                <button 
                    onClick={handleCheckoutClick}
                    disabled={quantity === 0}
                    className={`w-[148px] h-[44px] text-white rounded-[14px] font-semibold text-[15px] flex items-center justify-center transition-all ${
                        quantity > 0 
                            ? 'bg-black active:scale-95 cursor-pointer' 
                            : 'bg-zinc-400 cursor-not-allowed opacity-60'
                    }`}
                >
                    Checkout
                </button>
            </div>
        </div>
    );
}
