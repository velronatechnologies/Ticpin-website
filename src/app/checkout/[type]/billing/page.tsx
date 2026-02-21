'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bookingApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useStore } from '@/store/useStore';
import PassBenefitsCard from '@/components/booking/PassBenefitsCard';

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
    const { phone: userPhone, isLoggedIn } = useAuth();
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
    const totalAmount = checkoutData ? checkoutData.tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0) : 0;
    const totalTickets = checkoutData ? checkoutData.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0) : 0;

    const [finalAmount, setFinalAmount] = useState(totalAmount);
    const [appliedBenefit, setAppliedBenefit] = useState<'discount' | 'free-booking' | null>(null);

    const filteredStates = INDIAN_STATES.filter(state =>
        state.toLowerCase().includes(stateSearch.toLowerCase())
    );

    // Redirect if no checkout data
    useEffect(() => {
        if (!checkoutData) {
            router.push(`/checkout/${bookingType}`);
        }
    }, [checkoutData, router, bookingType]);

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
        if (!isFormValid()) {
            addToast('Please fill all required fields', 'error');
            return;
        }

        if (!userPhone || !checkoutData) {
            addToast('Session expired or invalid. Please try again', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const selectedTickets = checkoutData.tickets.filter(t => t.quantity > 0);

            if (selectedTickets.length === 0) {
                addToast('No items selected for booking', 'error');
                return;
            }

            let lastResponse: any = null;

            // Handle each selected ticket separately if needed, 
            // but for now let's assume one main booking or loop them if they are distinct
            // For Play, it's usually just one slot selected anyway.
            // For Events, we'll book them one by one (simplified)

            for (const ticket of selectedTickets) {
                if (bookingType === 'event') {
                    const payload = {
                        event_id: checkoutData.id,
                        event_title: checkoutData.name,
                        ticket_type: ticket.name,
                        seat_type: ticket.seat_type || '',
                        quantity: ticket.quantity,
                        unit_price: ticket.price,
                        guest_name: billingData.name,
                        billing_email: billingData.email,
                        billing_state: billingData.state,
                    };
                    lastResponse = await bookingApi.createEventBooking(payload);
                } else if (bookingType === 'dining') {
                    const payload = {
                        restaurant_id: checkoutData.id,
                        restaurant_name: checkoutData.name,
                        date: checkoutData.date || new Date().toISOString().split('T')[0],
                        time_slot: checkoutData.timeSlot || '',
                        guest_count: ticket.quantity,
                        guest_name: billingData.name,
                        special_request: '',
                    };
                    lastResponse = await bookingApi.createDiningBooking(payload);
                } else {
                    // play
                    const payload = {
                        venue_id: checkoutData.id,
                        venue_name: checkoutData.name,
                        sport: checkoutData.sport || 'Sports',
                        date: checkoutData.date || new Date().toISOString().split('T')[0],
                        time_slot: checkoutData.timeSlot || '08:00 AM',
                        player_name: billingData.name,
                        price: ticket.price * ticket.quantity,
                        billing_email: billingData.email,
                        billing_state: billingData.state,
                        billing_nationality: billingData.nationality,
                    };
                    lastResponse = await bookingApi.createPlayBooking(payload);
                }

                if (!lastResponse.success) {
                    throw new Error(lastResponse.message);
                }

                // Add to zustand store
                if (lastResponse.data) {
                    addBooking({
                        ...lastResponse.data,
                        type: bookingType as 'play' | 'dining' | 'event'
                    });
                }
            }

            addToast('Booking confirmed! Check your email for details', 'success');

            // Send local confirmation email for the whole order
            try {
                await fetch('/api/emails/booking-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: billingData.email,
                        name: billingData.name,
                        bookingType: bookingType,
                        venueName: checkoutData.name,
                        bookingDate: new Date().toLocaleDateString(),
                        totalAmount: finalAmount,
                        originalAmount: totalAmount,
                        passBenefitApplied: appliedBenefit,
                        savingsAmount: totalAmount - finalAmount,
                        bookingId: lastResponse?.data?.id || `BOOK-${Date.now()}`
                    })
                });
            } catch (emailError) {
                console.warn('Local confirmation email failed:', emailError);
            }

            clearCheckoutData();
            setTimeout(() => {
                router.push('/profile');
            }, 1500);

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
                    <h1 className="text-4xl font-bold text-zinc-900">Billing Details</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[30px] p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-2 text-zinc-400">Step 2</h2>
                            <h3 className="text-3xl font-bold text-zinc-900 mb-8">Billing Details</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <p className="text-base text-zinc-600 font-medium pb-2 border-b border-zinc-100">
                                    These details will be shown on your invoice *
                                </p>

                                {/* Name Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[12px] text-base font-bold focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
                                        value={billingData.name}
                                        onChange={(e) => setBillingData({ ...billingData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Phone Field (Read-only) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="w-full px-5 py-4 bg-zinc-100 border border-zinc-200 rounded-[12px] text-base font-bold text-zinc-600 cursor-not-allowed"
                                        value={billingData.phone}
                                        readOnly
                                    />
                                </div>

                                {/* Nationality Selection */}
                                <div className="space-y-4">
                                    <p className="text-sm font-black uppercase tracking-widest text-zinc-400 px-1">Select nationality</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setBillingData({ ...billingData, nationality: 'indian' })}
                                            className={`p-4 rounded-[12px] border-2 text-left font-bold transition-all ${billingData.nationality === 'indian'
                                                ? 'border-black bg-black text-white shadow-lg'
                                                : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 text-zinc-600'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-base">Indian Resident</span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${billingData.nationality === 'indian' ? 'border-white' : 'border-zinc-300'
                                                    }`}>
                                                    {billingData.nationality === 'indian' && (
                                                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBillingData({ ...billingData, nationality: 'international' })}
                                            className={`p-4 rounded-[12px] border-2 text-left font-bold transition-all ${billingData.nationality === 'international'
                                                ? 'border-black bg-black text-white shadow-lg'
                                                : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 text-zinc-600'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-base">International</span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${billingData.nationality === 'international' ? 'border-white' : 'border-zinc-300'
                                                    }`}>
                                                    {billingData.nationality === 'international' && (
                                                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* State Dropdown with Search */}
                                <div className="relative space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">State / Region</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search or Select State"
                                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[12px] text-base font-bold focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
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
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-[12px] shadow-2xl max-h-[300px] overflow-y-auto z-30">
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
                                                        className="w-full px-5 py-3 text-left text-base font-bold hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-b-0 text-zinc-700"
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
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[12px] text-base font-bold focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
                                        value={billingData.email}
                                        onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-2 px-1">
                                        Confirmation will be sent here
                                    </p>
                                </div>

                                {/* Terms & Conditions */}
                                <div className="flex items-start gap-4 pt-4">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={billingData.acceptedTerms}
                                            onChange={(e) => setBillingData({ ...billingData, acceptedTerms: e.target.checked })}
                                            className="w-6 h-6 rounded-lg border-2 border-zinc-200 checked:bg-black checked:border-black cursor-pointer appearance-none transition-all"
                                        />
                                        {billingData.acceptedTerms && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <label htmlFor="terms" className="text-sm text-zinc-600 font-bold uppercase tracking-tight cursor-pointer select-none mt-0.5">
                                        Accept{' '}
                                        <a href="/terms" target="_blank" className="text-[#5331EA] hover:underline">
                                            Terms & Conditions
                                        </a>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={!isFormValid() || isSubmitting}
                                        className="w-full h-[64px] bg-black text-white rounded-[15px] text-lg font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed shadow-xl shadow-black/10"
                                    >
                                        {isSubmitting ? 'PROCESSING...' : 'COMPLETE BOOKING'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Pass Benefits Card */}
                            {(billingData.email || userPhone) && (
                                <PassBenefitsCard
                                    email={billingData.email}
                                    phone={userPhone}
                                    bookingType={bookingType as 'event' | 'play' | 'dining'}
                                    totalAmount={totalAmount}
                                    onDiscountApply={(discountedAmount, isFreeBooking) => {
                                        setFinalAmount(discountedAmount);
                                        setAppliedBenefit(isFreeBooking ? 'free-booking' : 'discount');
                                    }}
                                />
                            )}

                            {/* Order Summary */}
                            <div className="bg-white rounded-[30px] p-8 shadow-sm border border-zinc-100">
                                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Order Summary</h3>
                                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">{checkoutData.name}</p>

                                <div className="space-y-4 mb-6 pb-6 border-b border-zinc-100">
                                    {checkoutData.tickets.map((ticket) => (
                                        ticket.quantity > 0 && (
                                            <div key={ticket.id} className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-zinc-900">{ticket.name}</p>
                                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Qty: {ticket.quantity}</p>
                                                </div>
                                                <p className="font-bold text-zinc-900">
                                                    ₹{(ticket.price * ticket.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        )
                                    ))}
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">Total Items</p>
                                    <p className="text-2xl font-black text-zinc-900">{totalTickets}</p>
                                </div>

                                {appliedBenefit && (
                                    <div className="flex justify-between items-center mb-6 p-4 bg-green-50 rounded-[15px] border border-green-100">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={16} className="text-green-600" />
                                            <p className="text-xs text-green-700 font-black uppercase tracking-wider">
                                                Benefit Applied
                                            </p>
                                        </div>
                                        <p className="text-sm font-black text-green-600">-₹{(totalAmount - finalAmount).toLocaleString()}</p>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mb-10">
                                    <p className="text-lg text-zinc-900 font-black uppercase tracking-widest">Payable</p>
                                    <p className="text-4xl font-black text-[#5331EA]">₹{finalAmount.toLocaleString()}</p>
                                </div>

                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] text-center leading-relaxed">
                                        By clickable "Complete Booking" you agree to our policies and ticketing terms.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add the missing imports for Lucide components if needed
import { CheckCircle2 } from 'lucide-react';
