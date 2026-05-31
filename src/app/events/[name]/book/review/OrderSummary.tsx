'use client';

import React from 'react';
import { Trash2, ChevronRight } from 'lucide-react';

interface Ticket {
    name: string;
    price: number;
    quantity: number;
}

interface CartData {
    eventId: string;
    eventName: string;
    city: string;
    tickets: Ticket[];
    totalPrice: number;
    type?: 'event' | 'dining' | 'play';
    date?: string;
    timeSlot?: string;
    guests?: number;
    slot?: string;
    duration?: number;
    offerId?: string | null;
    offerType?: string | null;
    use_pass?: boolean;
    pass_id?: string;
}

interface OrderSummaryProps {
    cart: CartData | null;
    updateTicketQuantity: (index: number, quantity: number) => void;
    removeTicket: (index: number) => void;
    orderAmount: number;
    bookingFee: number;
    showGstDetails: boolean;
    setShowGstDetails: (show: boolean) => void;
    passDiscount: number;
    totalDiscount: number;
    grandTotal: number;
    router: any;
}

export default function OrderSummary({
    cart,
    updateTicketQuantity,
    removeTicket,
    orderAmount,
    bookingFee,
    showGstDetails,
    setShowGstDetails,
    passDiscount,
    totalDiscount,
    grandTotal,
    router
}: OrderSummaryProps) {
    return (
        <div className="w-full bg-white border border-white rounded-[20px] shadow-sm">
            <div className="p-4 md:p-5">
                <div className="flex justify-between items-center mb-2 mt-[-10px]">
                    <h2 style={{ color: 'black', fontSize: '26px', fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}>
                        Order Summary
                    </h2>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #1DB954', flexShrink: 0 }} />
                </div>

                <div className="border-t border-[#AEAEAE] pt-4 space-y-4 mx-[-16px] md:mx-[-20px] px-4 md:px-5">
                    {/* ITEM DETAILS */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 mt-[-10px]">
                            <h3 style={{ color: 'black', fontSize: '20px', fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)', fontWeight: 100, lineHeight: '40px' }} className="uppercase">
                                {cart?.type === 'dining' ? 'RESERVATION' : cart?.type === 'play' ? 'SLOTS' : 'TICKETS'}
                            </h3>
                            <div className="flex-grow h-[0.5px] bg-[#AEAEAE]" />
                        </div>

                        {cart?.tickets && cart.tickets.length > 0 ? cart.tickets.map((ticket, i) => (
                            <div key={i} className="border border-[#AEAEAE] rounded-[10px] p-3 flex justify-between items-start relative mb-3">
                                <div className="space-y-1">
                                    <h4 className="text-[18px] md:text-[22px] font-bold text-black">
                                        {cart.eventName} <span className="font-normal mx-1">|</span> {cart.city}
                                    </h4>
                                    <p className="text-[12px] md:text-[14px] text-[#686868] font-medium uppercase tracking-tight">{ticket.name}</p>

                                    {/* Details for Dining/Play */}
                                    {(cart.type === 'dining' || cart.type === 'play') && (
                                        <div className="flex flex-col gap-1 mt-2">
                                            {cart.date && (
                                                <p className="text-[15px] text-[#686868] font-medium uppercase">
                                                    {cart.type === 'play' ? `${cart.slot} Feb` : `${cart.date} Feb`}
                                                    {cart.timeSlot && ` • ${cart.timeSlot}`}
                                                    {cart.slot && cart.type !== 'play' && ` • ${cart.slot}`}
                                                </p>
                                            )}
                                            {cart.type === 'play' && (
                                                <p className="text-[13px] text-[#AEAEAE] font-medium uppercase tracking-wider italic">
                                                    {ticket.name}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-2 border border-[#AEAEAE] rounded-[6px] px-2 py-1">
                                            <button
                                                onClick={() => updateTicketQuantity(i, ticket.quantity - 1)}
                                                className="w-[24px] h-[24px] flex items-center justify-center text-[16px] font-bold text-black hover:text-[#5331EA] transition-colors"
                                            >
                                                −
                                            </button>
                                            <span className="w-[30px] text-center text-[14px] font-semibold text-black">
                                                {ticket.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateTicketQuantity(i, ticket.quantity + 1)}
                                                className="w-[24px] h-[24px] flex items-center justify-center text-[16px] font-bold text-black hover:text-[#5331EA] transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-[#AEAEAE]">×</span>
                                        <p className="text-[14px] text-[#686868]">₹{ticket.price.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-4">
                                    <Trash2 size={14} className="text-[#AEAEAE] cursor-pointer hover:text-red-500 transition-colors"
                                        onClick={() => removeTicket(i)}
                                    />
                                    <span style={{ color: 'black', fontSize: '20px', fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}>
                                        ₹{(ticket.price * ticket.quantity).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-[#AEAEAE]">
                                <p className="text-[16px]">No selection found.</p>
                                <button onClick={() => router.back()} className="text-[14px] text-black underline mt-2">Go back to selection</button>
                            </div>
                        )}
                    </div>

                    {/* PAYMENT DETAILS */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 mt-[-10px]">
                            <h3 style={{ color: 'black', fontSize: '20px', fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)', fontWeight: 100, lineHeight: '40px' }} className="uppercase">PAYMENT DETAILS</h3>
                            <div className="flex-grow h-[0.5px] bg-[#AEAEAE]" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center mt-[-10px]" style={{ color: 'black', fontSize: '18px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}>
                                <span>Subtotal</span>
                                <span>₹{orderAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex flex-col">
                                <div
                                    className="flex justify-between items-center cursor-pointer group"
                                    onClick={() => setShowGstDetails(!showGstDetails)}
                                    style={{ color: '#686868', fontSize: '18px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}
                                >
                                    <div className="flex items-center gap-1 group-hover:text-black transition-colors">
                                        <span>Booking fee (inc. of GST)</span>
                                        <ChevronRight size={18} className={`transition-transform duration-300 ${showGstDetails ? 'rotate-90' : ''}`} />
                                    </div>
                                    <span>₹{bookingFee.toLocaleString('en-IN')}</span>
                                </div>
                                {showGstDetails && (
                                    <div className="pl-4 pr-1 mt-2 mb-1 space-y-2 animate-in slide-in-from-top-2 duration-300 overflow-hidden">
                                        <div className="flex justify-between text-[16px] text-[#686868] font-medium">
                                            <span>Base Platform Fee</span>
                                            <span>₹{Math.round(bookingFee / 1.18).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-[16px] text-[#686868] font-medium">
                                            <span>Integrated GST (18%)</span>
                                            <span>₹{(bookingFee - Math.round(bookingFee / 1.18)).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="h-[0.5px] bg-[#EBEBEB] w-full" />
                                    </div>
                                )}
                            </div>
                            {passDiscount > 0 && (
                                <div className="flex justify-between items-center" style={{ color: '#5331EA', fontSize: '18px', fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}>
                                    <span>TicPin Pass Member Discount (10%)</span>
                                    <span>-₹{passDiscount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {totalDiscount - passDiscount > 0 && (
                                <div className="flex justify-between items-center" style={{ color: '#16a34a', fontSize: '18px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}>
                                    <span>Other Discounts applied</span>
                                    <span>-₹{(totalDiscount - passDiscount).toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="h-[0.5px] bg-[#AEAEAE] mt-2" />
                            <div className="pt-2 flex justify-between items-center" style={{ color: 'black', fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}>
                                <span style={{ fontSize: '20px' }}>Grand total</span>
                                <span style={{ fontSize: '25px', color: grandTotal === 0 ? '#5331EA' : 'black', fontWeight: 900 }}>
                                    {grandTotal === 0 ? 'FREE' : `₹${grandTotal.toLocaleString('en-IN')}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
