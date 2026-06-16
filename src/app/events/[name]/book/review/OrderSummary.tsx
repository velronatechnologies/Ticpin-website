'use client';

import React from 'react';
import { Trash2, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

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
    offersSection?: React.ReactNode;
    bottomSection?: React.ReactNode;
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
    router,
    offersSection,
    bottomSection
}: OrderSummaryProps) {
    return (
        <div className="w-full bg-white border border-white rounded-[20px] shadow-sm">
            <div className="p-4 md:p-5">
                <div className="flex justify-between items-center mb-2 mt-[-10px]">

                    <h2 style={{ color: 'black', fontSize: '26px', fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}>
                        Order Summary
                    </h2>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2.5px solid #1DB954', flexShrink: 0 }} />
                </div>

                <div className="border-t border-[#AEAEAE] pt-4 space-y-4 mx-[-16px] md:mx-[-20px] px-4 md:px-5">
                    {/* ITEM DETAILS */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 mt-[-4px]">
                            <span
                                className="text-[25px] md:text-[27px] font-medium text-[#000000] uppercase tracking-normal"
                                style={{ fontFamily: "var(--font-anek-tamil-condensed), 'Anek Tamil Condensed', sans-serif", display: 'inline-block', transform: 'scaleY(1.1)' }}
                            >
                                TICKETS
                            </span>

                            <div className="flex-grow h-[0.5px] bg-[#AEAEAE]" />
                        </div>

                        {cart?.tickets && cart.tickets.length > 0 ? cart.tickets.map((ticket, i) => (
                            <div key={i} className="border-[0.5px] border-[#AEAEAE] rounded-[15px] p-4 flex justify-between items-start relative mb-3">
                                <div className="space-y-1">
                                    <h4 className="text-[18px] md:text-[22px] font-semibold text-black" style={{ fontFamily: "var(--font-anek-latin), 'Anek Latin', sans-serif" }}>
                                        {cart.eventName} <span className="font-normal mx-1">|</span> {cart.city}
                                    </h4>
                                    <p className="text-[12px] md:text-[14px] text-[#686868] font-medium uppercase tracking-tight" style={{ fontFamily: "var(--font-anek-latin), 'Anek Latin', sans-serif" }}>{ticket.name}</p>

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
                                                <p className="text-[13px] text-[#AEAEAE] font-medium uppercase italic">
                                                    {ticket.name}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span
                                            className="text-[20px] font-medium text-black leading-none"
                                            style={{ fontFamily: "var(--font-anek-tamil-condensed), 'Anek Tamil Condensed', sans-serif" }}
                                        >
                                            {ticket.quantity}
                                        </span>
                                        <span
                                            className="text-[10px] font-medium text-[#686868]"
                                            style={{ fontFamily: "var(--font-anek-latin), 'Anek Latin', sans-serif" }}
                                        >
                                            tickets
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end justify-between min-h-[65px] self-stretch">
                                    <Trash2 size={14} className="text-[#AEAEAE] cursor-pointer hover:text-red-500 transition-colors"
                                        onClick={() => removeTicket(i)}
                                    />
                                    <span className="fone-meidum" style={{ color: 'black', fontSize: '20px', fontFamily: "var(--font-anek-tamil-condensed), 'Anek Tamil Condensed', sans-serif" }}>
                                        ₹{formatPrice(ticket.price * ticket.quantity)}
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

                    {offersSection}

                    {/* PAYMENT DETAILS */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 mt-[-4px]">
                            <span
                                className="text-[25px] md:text-[27px] font-medium text-[#000000] uppercase tracking-normal"
                                style={{ fontFamily: "var(--font-anek-tamil-condensed), 'Anek Tamil Condensed', sans-serif", display: 'inline-block', transform: 'scaleY(1.1)' }}
                            >
                                PAYMENT DETAILS
                            </span>
                            <div className="flex-grow h-[0.5px] bg-[#AEAEAE]" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center mt-[-10px]" style={{ color: 'black', fontSize: '18px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}>
                                <span>Order amount</span>
                                <span className='font-medium'>₹{formatPrice(orderAmount)}</span>
                            </div>
                            <div className="flex flex-col">
                                <div
                                    className="flex justify-between items-center cursor-pointer"
                                    onClick={() => setShowGstDetails(!showGstDetails)}
                                    style={{ color: '#686868', fontSize: '14px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}
                                >
                                    <div className="flex items-center gap-1">
                                        <span>Booking fee (inc. of GST)</span>
                                        <ChevronRight size={18} className={`transition-transform duration-300 ${showGstDetails ? 'rotate-90' : ''}`} />
                                    </div>
                                    <span>₹{formatPrice(bookingFee)}</span>
                                </div>
                                {showGstDetails && (
                                    <div className="pl-4 pr-1 mt-2 mb-1 space-y-2 animate-in slide-in-from-top-2 duration-300 overflow-hidden">
                                        <div className="flex justify-between text-[13px] text-[#686868] font-medium">
                                            <span>Base Platform Fee</span>
                                            <span>₹{formatPrice(bookingFee / 1.18)}</span>
                                        </div>
                                        <div className="flex justify-between text-[13px] text-[#686868] font-medium">
                                            <span>Integrated GST (18%)</span>
                                            <span>₹{formatPrice(bookingFee - (bookingFee / 1.18))}</span>
                                        </div>
                                        <div className="h-[0.5px] bg-[#EBEBEB] w-full" />
                                    </div>
                                )}
                            </div>
                            {passDiscount > 0 && (
                                <div className="flex justify-between items-center" style={{ color: '#5331EA', fontSize: '18px', fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}>
                                    <span>Ticpin Pass Member Discount (10%)</span>
                                    <span>-₹{formatPrice(passDiscount)}</span>
                                </div>
                            )}
                            {totalDiscount - passDiscount > 0 && (
                                <div className="flex justify-between items-center" style={{ color: '#16a34a', fontSize: '18px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}>
                                    <span>Other Discounts applied</span>
                                    <span>-₹{formatPrice(totalDiscount - passDiscount)}</span>
                                </div>
                            )}
                            <div className="h-[0.5px] bg-[#AEAEAE] mt-2" />
                            <div className="pt-2 flex justify-between items-center" style={{ color: 'black', fontFamily: 'var(--font-anek-latin)', }}>
                                <span style={{ fontSize: '20px' }} className='font-bold'>Grand total</span>
                                <span className='font-medium' style={{ fontSize: '25px', color: grandTotal === 0 ? '#5331EA' : 'black' }}>
                                    {grandTotal === 0 ? 'FREE' : `₹${formatPrice(grandTotal)}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {bottomSection}
                </div>
            </div>
        </div>
    );
}
