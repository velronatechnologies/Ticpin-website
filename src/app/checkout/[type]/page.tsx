'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';

interface Ticket {
    id: string;
    name: string;
    price: number;
    description: string[];
    quantity: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const { setCheckoutData } = useStore();
    const { addToast } = useToast();

    const bookingType = params.type as string; // 'event' or 'play'

    // Sample tickets data - replace with actual data based on venue
    const [tickets, setTickets] = useState<Ticket[]>([
        {
            id: 'ticket-1',
            name: 'Gold Lounge (Weekend Pass)',
            price: 8999,
            description: [
                'This ticket admits one person to the Gold Lounge 1 on both the days of the event.',
                'Start Line view',
                'All day Food & Beverages',
                'AC luxury lounge',
                'Perfect balance of action and luxury'
            ],
            quantity: 0
        },
        {
            id: 'ticket-2',
            name: 'Gold Lounge (Day 2 Pass)',
            price: 4999,
            description: [
                'This ticket admits one person to the Gold Lounge 1 on Day 2 of the event.',
                'Start Line view',
                'All day Food & Beverages',
                'AC luxury lounge',
                'Perfect balance of action and luxury'
            ],
            quantity: 0
        }
    ]);

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

        // Save checkout data to context
        setCheckoutData({
            tickets,
            bookingType
        });

        // Navigate to billing page
        router.push(`/checkout/${bookingType}/billing`);
    };

    return (
        <div className="min-h-screen bg-[#f8f4ff] py-8 px-4">
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
                                    <div key={ticket.id} className={`p-6 rounded-[24px] border-2 transition-all ${
                                        ticket.quantity > 0
                                            ? 'border-[#5331EA] bg-purple-50'
                                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                                    }`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-zinc-900">{ticket.name}</h4>
                                                <p className="text-3xl font-bold text-zinc-900 mt-2">₹{ticket.price.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white rounded-[12px] border border-zinc-300 px-2 py-1">
                                                <button
                                                    onClick={() => handleQuantityChange(ticket.id, ticket.quantity - 1)}
                                                    className="px-3 py-1 hover:bg-zinc-100 rounded transition-colors"
                                                >
                                                    −
                                                </button>
                                                <span className="w-8 text-center font-semibold">{ticket.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(ticket.id, ticket.quantity + 1)}
                                                    className="px-3 py-1 hover:bg-zinc-100 rounded transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <ul className="space-y-2">
                                            {ticket.description.map((desc, idx) => (
                                                <li key={idx} className="text-[16px] text-zinc-700 font-medium flex items-start gap-3">
                                                    <span className="text-[#5331EA] mt-1">•</span>
                                                    {desc}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 bg-white rounded-[30px] p-8 shadow-sm">
                            <h3 className="text-2xl font-bold text-zinc-900 mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-6 pb-6 border-b border-zinc-200">
                                {tickets.map((ticket) => (
                                    ticket.quantity > 0 && (
                                        <div key={ticket.id} className="flex justify-between">
                                            <div>
                                                <p className="font-medium text-zinc-900">{ticket.name}</p>
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
                                        className="w-full h-[56px] bg-black text-white rounded-[12px] text-lg font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all active:scale-[0.98]"
                                    >
                                        Book Tickets
                                    </button>
                                </>
                            )}

                            {totalTickets === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-zinc-500 font-medium">Select tickets to proceed</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

