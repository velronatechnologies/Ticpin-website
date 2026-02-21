'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';

interface Ticket {
    id: string;
    name: string;
    seat_type?: string;
    price: number;
    description: string[];
    quantity: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const { checkoutData, setCheckoutData } = useStore();
    const { addToast } = useToast();

    const bookingType = params.type as string; // 'event' or 'play'

    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        if (checkoutData && checkoutData.tickets) {
            setTickets(checkoutData.tickets);
        } else {
            // Fallback for direct navigation
            router.push('/');
        }
    }, [checkoutData, router]);

    const handleQuantityChange = (ticketId: string, quantity: number) => {
        setTickets(tickets.map(t =>
            t.id === ticketId ? { ...t, quantity: Math.max(0, quantity) } : t
        ));
    };

    const totalAmount = tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
    const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);

    const handleBookTickets = () => {
        if (totalTickets === 0) {
            addToast('Please select at least one ticket', 'error');
            return;
        }

        if (!checkoutData) return;

        // Save updated tickets back to store
        setCheckoutData({
            ...checkoutData,
            tickets,
            bookingType
        });

        // Navigate to billing page
        router.push(`/checkout/${bookingType}/billing`);
    };

    if (tickets.length === 0) {
        return <div className="min-h-screen bg-[#f8f4ff] flex items-center justify-center font-bold">Loading tickets...</div>;
    }

    return (
        <div className="min-h-screen bg-[#f8f4ff] py-8 px-4 font-[family-name:var(--font-anek-latin)]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-4xl font-bold text-zinc-900">Complete Your Booking</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Step 1: Choose Tickets */}
                        <div className="bg-white rounded-[30px] p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Step 1</h2>
                            <h3 className="text-3xl font-bold text-zinc-900 mb-8">Choose Tickets</h3>

                            <div className="space-y-6">
                                {tickets.map((ticket) => (
                                    <div key={ticket.id} className={`p-6 rounded-[24px] border-2 transition-all ${ticket.quantity > 0
                                            ? 'border-[#5331EA] bg-purple-50'
                                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                                        }`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-zinc-900">
                                                    {ticket.name} {ticket.seat_type && <span className="text-sm font-medium text-zinc-500 uppercase ml-2">({ticket.seat_type})</span>}
                                                </h4>
                                                <p className="text-3xl font-bold text-zinc-900 mt-2">₹{ticket.price.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white rounded-[12px] border border-zinc-300 px-2 py-1">
                                                <button
                                                    onClick={() => handleQuantityChange(ticket.id, ticket.quantity - 1)}
                                                    className="px-3 py-1 hover:bg-zinc-100 rounded transition-colors text-xl font-bold"
                                                >
                                                    −
                                                </button>
                                                <span className="w-8 text-center font-bold text-lg">{ticket.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(ticket.id, ticket.quantity + 1)}
                                                    className="px-3 py-1 hover:bg-zinc-100 rounded transition-colors text-xl font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        {ticket.description && ticket.description.length > 0 && (
                                            <ul className="space-y-2">
                                                {ticket.description.map((desc, idx) => (
                                                    <li key={idx} className="text-[16px] text-zinc-700 font-medium flex items-start gap-3">
                                                        <span className="text-[#5331EA] mt-1">•</span>
                                                        {desc}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 bg-white rounded-[30px] p-8 shadow-sm border border-zinc-100">
                            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Order Summary</h3>
                            <p className="text-zinc-500 font-medium mb-6">{checkoutData?.name}</p>

                            <div className="space-y-4 mb-6 pb-6 border-b border-zinc-200">
                                {tickets.map((ticket) => (
                                    ticket.quantity > 0 && (
                                        <div key={ticket.id} className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-zinc-900 text-base">{ticket.name}</p>
                                                <p className="text-sm text-zinc-500">Qty: {ticket.quantity}</p>
                                            </div>
                                            <p className="font-bold text-zinc-900">
                                                ₹{(ticket.price * ticket.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    )
                                ))}
                            </div>

                            {totalTickets > 0 && (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-base text-zinc-600 font-medium">Total Tickets</p>
                                        <p className="text-2xl font-bold text-zinc-900">{totalTickets}</p>
                                    </div>

                                    <div className="flex justify-between items-center mb-8">
                                        <p className="text-lg text-zinc-900 font-bold">Total Amount</p>
                                        <p className="text-3xl font-bold text-[#5331EA]">₹{totalAmount.toLocaleString()}</p>
                                    </div>

                                    <button
                                        onClick={handleBookTickets}
                                        className="w-full h-[60px] bg-black text-white rounded-[15px] text-lg font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-black/10"
                                    >
                                        Book Tickets
                                    </button>
                                </>
                            )}

                            {totalTickets === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-zinc-500 font-bold uppercase tracking-wider text-sm">Select items to proceed</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
