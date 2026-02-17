'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bookingApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useStore } from '@/store/useStore';

interface BillingDetails {
    name: string;
    phone: string;
    nationality: 'indian' | 'international';
    state: string;
    email: string;
    acceptedTerms: boolean;
}

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
];

export default function BillingPage() {
    const router = useRouter();
    const params = useParams();
    const { phone: userPhone, isLoggedIn, token } = useAuth();
    const { checkoutData, clearCheckoutData, addBooking } = useStore();
    const { addToast } = useToast();

    const bookingType = params.type as string;

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            addToast('Please log in to complete booking', 'error');
            router.push('/');
        }
    }, [isLoggedIn, router, addToast]);

    const [billingData, setBillingData] = useState<BillingDetails>({
        name: '',
        phone: userPhone || '',
        nationality: 'indian',
        state: '',
        email: '',
        acceptedTerms: false,
    });

    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [stateSearch, setStateSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredStates = INDIAN_STATES.filter(state =>
        state.toLowerCase().includes(stateSearch.toLowerCase())
    );

    // Redirect if no checkout data
    useEffect(() => {
        if (!checkoutData) {
            router.push(`/checkout/${bookingType}`);
        }
    }, [checkoutData, router, bookingType]);

    const totalAmount = checkoutData ? checkoutData.tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0) : 0;
    const totalTickets = checkoutData ? checkoutData.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0) : 0;

    const isFormValid = () => {
        return (
            billingData.name.trim() !== '' &&
            billingData.phone.trim() !== '' &&
            billingData.state !== '' &&
            billingData.email.trim() !== '' &&
            billingData.acceptedTerms
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (e && 'key' in e && e.key === 'Enter') {
            // handle enter key if caught by form
        }
        if (!isFormValid()) {
            addToast('Please fill all required fields', 'error');
            return;
        }

        // Check if user is authenticated
        if (!userPhone) {
            addToast('Please log in to complete booking', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare booking payload with all required fields
            const bookingPayload = {
                venue_id: `${bookingType}-venue-123`,
                venue_name: bookingType === 'event' ? 'Event Venue' : 'Play Venue',
                sport: bookingType === 'event' ? 'Event' : 'Cricket',
                date: new Date().toISOString().split('T')[0],
                time_slot: '08:30 PM',
                player_name: billingData.name,
                price: totalAmount,
                billing_email: billingData.email,
                billing_state: billingData.state,
                billing_nationality: billingData.nationality,
            };

            console.log('🚀 Sending booking request:', bookingPayload);

            const response = await bookingApi.createPlayBooking(bookingPayload);

            console.log('✅ Booking response:', response);

            if (response.success) {
                addToast('Booking confirmed! Check your email for details', 'success');
                
                // Add to zustand store for immediate UI update
                if (response.data) {
                    addBooking({
                        ...response.data,
                        type: bookingType as 'play' | 'dining'
                    });
                }
                
                clearCheckoutData();
                setTimeout(() => {
                    router.push('/profile'); // Redirect to profile to see bookings
                }, 1500);
            } else {
                addToast(response.message || 'Booking failed. Please try again', 'error');
            }
        } catch (error) {
            console.error('❌ Booking failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Booking failed. Please try again';
            addToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!checkoutData) {
        return <div className="min-h-screen bg-[#f8f4ff] flex items-center justify-center">Loading...</div>;
    }

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
                    <h1 className="text-4xl font-bold text-zinc-900">Billing Details</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[30px] p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Step 2</h2>
                            <h3 className="text-3xl font-bold text-zinc-900 mb-8">Billing Details</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <p className="text-base text-zinc-600 font-medium">
                                    These details will be shown on your invoice *
                                </p>

                                {/* Name Field */}
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Name*"
                                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[12px] text-base font-medium focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
                                        value={billingData.name}
                                        onChange={(e) => setBillingData({ ...billingData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Phone Field (Read-only) */}
                                <div>
                                    <input
                                        type="tel"
                                        className="w-full px-5 py-4 bg-zinc-100 border border-zinc-200 rounded-[12px] text-base font-medium text-zinc-600 cursor-not-allowed"
                                        value={billingData.phone}
                                        readOnly
                                    />
                                </div>

                                {/* Nationality Selection */}
                                <div className="space-y-3">
                                    <p className="text-base text-zinc-700 font-medium">Select nationality</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setBillingData({ ...billingData, nationality: 'indian' })}
                                            className={`p-4 rounded-[12px] border-2 text-left font-medium transition-all ${
                                                billingData.nationality === 'indian'
                                                    ? 'border-black bg-black/5'
                                                    : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-base">Indian resident</span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                    billingData.nationality === 'indian' ? 'border-black' : 'border-zinc-300'
                                                }`}>
                                                    {billingData.nationality === 'indian' && (
                                                        <div className="w-3 h-3 bg-black rounded-full" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBillingData({ ...billingData, nationality: 'international' })}
                                            className={`p-4 rounded-[12px] border-2 text-left font-medium transition-all ${
                                                billingData.nationality === 'international'
                                                    ? 'border-black bg-black/5'
                                                    : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-base">International visitor</span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                    billingData.nationality === 'international' ? 'border-black' : 'border-zinc-300'
                                                }`}>
                                                    {billingData.nationality === 'international' && (
                                                        <div className="w-3 h-3 bg-black rounded-full" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* State Dropdown with Search */}
                                <div className="relative">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search or Select State*"
                                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[12px] text-base font-medium focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
                                            value={stateSearch || billingData.state}
                                            onChange={(e) => {
                                                setStateSearch(e.target.value);
                                                setShowStateDropdown(true);
                                                if (!e.target.value) setBillingData({ ...billingData, state: '' });
                                            }}
                                            onFocus={() => setShowStateDropdown(true)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    if (showStateDropdown && filteredStates.length > 0) {
                                                        e.preventDefault();
                                                        setBillingData({ ...billingData, state: filteredStates[0] });
                                                        setStateSearch(filteredStates[0]);
                                                        setShowStateDropdown(false);
                                                    }
                                                }
                                            }}
                                            autoComplete="off"
                                        />
                                        <ChevronDown size={20} className={`absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform ${showStateDropdown ? 'rotate-180' : ''} pointer-events-none`} />
                                    </div>

                                    {showStateDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-[12px] shadow-xl max-h-[300px] overflow-y-auto z-30">
                                            {filteredStates.length > 0 ? (
                                                filteredStates.map((state) => (
                                                    <button
                                                        key={state}
                                                        type="button"
                                                        onClick={() => {
                                                            setBillingData({ ...billingData, state });
                                                            setStateSearch(state);
                                                            setShowStateDropdown(false);
                                                        }}
                                                        className="w-full px-5 py-3 text-left text-base font-medium hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0"
                                                    >
                                                        {state}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-5 py-3 text-zinc-500 text-sm">No states found</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Email*"
                                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[12px] text-base font-medium focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
                                        value={billingData.email}
                                        onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                                        required
                                    />
                                    <p className="text-sm text-zinc-500 font-medium mt-2 px-1">
                                        We'll email you ticket confirmation and invoices
                                    </p>
                                </div>

                                {/* Terms & Conditions */}
                                <div className="flex items-start gap-3 pt-4">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={billingData.acceptedTerms}
                                        onChange={(e) => setBillingData({ ...billingData, acceptedTerms: e.target.checked })}
                                        className="mt-1 w-5 h-5 rounded border-2 border-zinc-300 checked:bg-black checked:border-black cursor-pointer"
                                    />
                                    <label htmlFor="terms" className="text-base text-zinc-700 font-medium cursor-pointer select-none">
                                        I have read and accepted the{' '}
                                        <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                                            terms and conditions
                                        </a>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={!isFormValid() || isSubmitting}
                                        className="w-full h-[56px] bg-black text-white rounded-[12px] text-lg font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Processing...' : 'Complete Booking'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 bg-white rounded-[30px] p-8 shadow-sm">
                            <h3 className="text-2xl font-bold text-zinc-900 mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-6 pb-6 border-b border-zinc-200">
                                {checkoutData.tickets.map((ticket) => (
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

                            <div className="flex justify-between items-center mb-6">
                                <p className="text-base text-zinc-600 font-medium">Total Tickets</p>
                                <p className="text-2xl font-bold text-zinc-900">{totalTickets}</p>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <p className="text-lg text-zinc-900 font-bold">Total Amount</p>
                                <p className="text-3xl font-bold text-[#5331EA]">₹{totalAmount.toLocaleString()}</p>
                            </div>

                            <p className="text-sm text-zinc-500 text-center">
                                Fill in your billing details to complete the booking
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
