'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bookingApi, getAuthToken } from '@/lib/api';
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

    const bookingFee = Math.round(totalAmount * 0.1);
    const grandTotal = finalAmount + bookingFee;

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

        // ── Step 1: Create payment order (round-robin gateway selection) ──────
        setIsSubmitting(true);

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';
        const token = getAuthToken();

        // Dynamically loads a payment SDK script (idempotent)
        const loadScript = (src: string): Promise<void> =>
            new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
                const s = document.createElement('script');
                s.src = src;
                s.onload = () => resolve();
                s.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.body.appendChild(s);
            });

        // Creates the booking in the backend after payment is confirmed
        const createBookings = async (paymentId: string, paymentGateway: string, paymentAmount: number) => {
            const selectedTickets = checkoutData!.tickets.filter(t => t.quantity > 0);
            let lastResponse: any = null;

            for (const ticket of selectedTickets) {
                if (bookingType === 'event') {
                    const payload = {
                        event_id: checkoutData!.id,
                        event_title: checkoutData!.name,
                        ticket_type: ticket.name,
                        seat_type: ticket.seat_type || '',
                        quantity: ticket.quantity,
                        unit_price: ticket.price,
                        guest_name: billingData.name,
                        billing_email: billingData.email,
                        billing_state: billingData.state,
                        payment_id: paymentId,
                        payment_gateway: paymentGateway,
                        payment_amount: paymentAmount,
                    };
                    lastResponse = await bookingApi.createEventBooking(payload);
                } else if (bookingType === 'dining') {
                    const payload = {
                        restaurant_id: checkoutData!.id,
                        restaurant_name: checkoutData!.name,
                        date: checkoutData!.date || new Date().toISOString().split('T')[0],
                        time_slot: checkoutData!.timeSlot || '',
                        guest_count: ticket.quantity,
                        guest_name: billingData.name,
                        billing_email: billingData.email,
                        special_request: '',
                        payment_id: paymentId,
                        payment_gateway: paymentGateway,
                        payment_amount: paymentAmount,
                    };
                    lastResponse = await bookingApi.createDiningBooking(payload);
                } else {
                    const payload = {
                        venue_id: checkoutData!.id,
                        venue_name: checkoutData!.name,
                        sport: checkoutData!.sport || 'Sports',
                        date: checkoutData!.date || new Date().toISOString().split('T')[0],
                        time_slot: checkoutData!.timeSlot || '08:00 AM',
                        player_name: billingData.name,
                        price: ticket.price * ticket.quantity,
                        billing_email: billingData.email,
                        billing_state: billingData.state,
                        billing_nationality: billingData.nationality,
                        payment_id: paymentId,
                        payment_gateway: paymentGateway,
                        payment_amount: paymentAmount,
                    };
                    lastResponse = await bookingApi.createPlayBooking(payload);
                }
                if (!lastResponse.success) throw new Error(lastResponse.message);
                if (lastResponse.data) addBooking({ ...lastResponse.data, type: bookingType as 'play' | 'dining' | 'event' });
            }

            // Confirmation email (includes pass-benefit info & payment ref — Go email already sent, this adds the rich template)
            try {
                await fetch('/api/emails/booking-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: billingData.email,
                        name: billingData.name,
                        bookingType,
                        venueName: checkoutData!.name,
                        bookingDate: new Date().toLocaleDateString(),
                        totalAmount: finalAmount,
                        originalAmount: totalAmount,
                        passBenefitApplied: appliedBenefit,
                        savingsAmount: totalAmount - finalAmount,
                        bookingId: lastResponse?.data?.id || `BOOK-${Date.now()}`,
                        paymentId,
                        paymentGateway,
                    }),
                });
            } catch { /* non-fatal */ }

            addToast('Booking confirmed! Check your email for details', 'success');
            clearCheckoutData();
            setTimeout(() => router.push('/profile'), 1500);
        };

        // ── Step 2: Verify payment with backend, then create booking ─────────
        const handlePaymentSuccess = async (gateway: string, orderId: string, paymentId: string, signature: string, paymentAmount: number) => {
            setIsSubmitting(true);
            try {
                const verifyRes = await fetch(`${API_BASE}/api/v1/payment/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ gateway, order_id: orderId, payment_id: paymentId, signature }),
                });
                const verifyData = await verifyRes.json();
                if (verifyData.status !== 200) throw new Error(verifyData.message || 'Payment verification failed');
                await createBookings(paymentId, gateway, paymentAmount);
            } catch (err) {
                addToast(err instanceof Error ? err.message : 'Payment verification failed', 'error');
                setIsSubmitting(false);
            }
        };

        try {
            const orderRes = await fetch(`${API_BASE}/api/v1/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    amount: grandTotal,
                    booking_ref: (checkoutData.name || 'ticpin').replace(/\s+/g, '_').slice(0, 20),
                    customer_name: billingData.name,
                    customer_email: billingData.email,
                    customer_phone: billingData.phone,
                }),
            });
            const orderData = await orderRes.json();
            if (orderData.status !== 200) throw new Error(orderData.message || 'Failed to create payment order');

            const { gateway, order_id, key_id, payment_session_id, amount } = orderData.data;

            // ── Razorpay ──────────────────────────────────────────────────────
            if (gateway === 'razorpay') {
                await loadScript('https://checkout.razorpay.com/v1/checkout.js');
                const rzpOptions = {
                    key: key_id,
                    amount: Math.round(amount * 100), // paise
                    currency: 'INR',
                    name: 'Ticpin',
                    description: checkoutData.name || 'Booking',
                    order_id,
                    prefill: { name: billingData.name, email: billingData.email, contact: billingData.phone },
                    theme: { color: '#866BFF' },
                    handler: (response: any) => {
                        handlePaymentSuccess(
                            'razorpay',
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature,
                            amount,
                        );
                    },
                    modal: {
                        ondismiss: () => {
                            setIsSubmitting(false);
                            addToast('Payment cancelled', 'error');
                        },
                    },
                };
                const rzp = new (window as any).Razorpay(rzpOptions);
                rzp.open();
                // isSubmitting stays true — will be cleared in handlePaymentSuccess or ondismiss
                return;
            }

            // ── Cashfree ──────────────────────────────────────────────────────
            if (gateway === 'cashfree') {
                await loadScript('https://sdk.cashfree.com/js/v3/cashfree.js');
                const cashfree = (window as any).Cashfree({ mode: 'production' });
                const result = await cashfree.checkout({
                    paymentSessionId: payment_session_id,
                    redirectTarget: '_modal',
                });
                if (result?.error) throw new Error(result.error?.message || 'Cashfree payment failed');
                if (result?.paymentDetails) {
                    await handlePaymentSuccess('cashfree', order_id, '', '', amount);
                    return;
                }
                throw new Error('Payment was not completed');
            }

            throw new Error('Unknown payment gateway');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again';
            addToast(errorMessage, 'error');
            setIsSubmitting(false);
        }
    };

    if (!checkoutData) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white pb-12">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <h1 className="text-2xl font-bold">TICPIN</h1>
                    <h2 className="text-xl font-semibold text-gray-900">Review your booking</h2>
                    <button
                        onClick={() => router.back()}
                        className="rounded-full bg-gray-300 p-2 text-gray-700 hover:bg-gray-400 transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-6 py-8">
                {/* Pass Benefits */}
                {(billingData.email || userPhone) && (
                    <div className="mb-6">
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
                    </div>
                )}

                {/* Order Summary Card */}
                <div className="mb-6 rounded-lg border border-gray-300 bg-white p-6">
                    <div className="mb-6 flex items-start justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">Order Summary</h3>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {/* Tickets Section */}
                    <div className="mb-6 border-b border-gray-200 pb-6">
                        <h4 className="mb-4 font-bold text-gray-900">TICKETS</h4>
                        <div className="space-y-3">
                            {checkoutData.tickets.filter(t => t.quantity > 0).map(ticket => (
                                <div key={ticket.id} className="rounded bg-gray-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                {checkoutData.name}{ticket.seat_type && ` | ${ticket.seat_type}`}
                                            </p>
                                            <p className="text-sm text-gray-600">{ticket.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-600">
                                                {ticket.quantity} ticket{ticket.quantity !== 1 ? 's' : ''}
                                            </p>
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{(ticket.price * ticket.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {totalTickets === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No tickets selected</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="mt-3 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
                        >
                            <svg className="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Edit tickets
                        </button>
                    </div>

                    {/* Offers Section */}
                    <div className="mb-6 border-b border-gray-200 pb-6">
                        <h4 className="mb-4 font-bold text-gray-900">OFFERS</h4>
                        <button type="button" className="mb-2 flex w-full items-center justify-between rounded bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                </svg>
                                <span className="font-semibold text-gray-900">View all event offers</span>
                            </div>
                            <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button type="button" className="flex w-full items-center justify-between rounded bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                                <span className="font-semibold text-gray-900">View all coupon codes</span>
                            </div>
                            <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Payment Details */}
                    <div className="mb-6 border-b border-gray-200 pb-6">
                        <h4 className="mb-4 font-bold text-gray-900">PAYMENT DETAILS</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-700">Order amount</span>
                                <span className="font-semibold text-gray-900">₹{finalAmount.toLocaleString()}</span>
                            </div>
                            {appliedBenefit && (
                                <div className="flex items-center justify-between text-green-700">
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 size={14} />
                                        <span className="text-sm font-semibold">
                                            {appliedBenefit === 'free-booking' ? 'Free booking applied' : 'Discount applied'}
                                        </span>
                                    </div>
                                    <span className="font-semibold text-green-600">
                                        −₹{(totalAmount - finalAmount).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-700">Booking fee (inc. of GST)</span>
                                    <button type="button" title="10% of order amount" className="text-gray-500 hover:text-gray-700">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                <span className="font-semibold text-gray-900">₹{bookingFee.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Grand Total */}
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">Grand total</span>
                        <span className="text-2xl font-bold text-gray-900">₹{grandTotal.toLocaleString()}</span>
                    </div>
                </div>

                {/* Billing Details Card */}
                <div className="rounded-lg border border-gray-300 bg-white p-6">
                    <div className="mb-6 flex items-start justify-between">
                        <h3 className="text-2xl font-bold text-gray-900">Billing Details</h3>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    <p className="mb-6 text-sm text-gray-600">These details will be shown on your invoice *</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <input
                                type="text"
                                placeholder="Full name"
                                className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:outline-none focus:bg-white transition-colors"
                                value={billingData.name}
                                onChange={e => setBillingData({ ...billingData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Phone (read-only) */}
                        <div>
                            <input
                                type="tel"
                                className="w-full rounded border border-gray-200 bg-gray-100 px-4 py-3 text-gray-600 cursor-not-allowed"
                                value={billingData.phone}
                                readOnly
                            />
                        </div>

                        {/* Nationality */}
                        <div>
                            <label className="mb-3 block text-sm font-semibold text-gray-900">Select nationality</label>
                            <div className="flex gap-3">
                                <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded border px-4 py-3 transition-colors ${billingData.nationality === 'indian' ? 'border-gray-900 bg-gray-50' : 'border-gray-300 bg-white'}`}>
                                    <input
                                        type="radio"
                                        name="nationality"
                                        value="indian"
                                        checked={billingData.nationality === 'indian'}
                                        onChange={() => setBillingData({ ...billingData, nationality: 'indian' })}
                                        className="h-5 w-5 accent-gray-900"
                                    />
                                    <span className="font-semibold text-gray-900">Indian resident</span>
                                </label>
                                <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded border px-4 py-3 transition-colors ${billingData.nationality === 'international' ? 'border-gray-900 bg-gray-50' : 'border-gray-300 bg-white'}`}>
                                    <input
                                        type="radio"
                                        name="nationality"
                                        value="international"
                                        checked={billingData.nationality === 'international'}
                                        onChange={() => setBillingData({ ...billingData, nationality: 'international' })}
                                        className="h-5 w-5 accent-gray-900"
                                    />
                                    <span className="font-semibold text-gray-900">International visitor</span>
                                </label>
                            </div>
                        </div>

                        {/* State Dropdown */}
                        <div className="relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="State / Region"
                                    className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:outline-none focus:bg-white transition-colors"
                                    value={stateSearch || billingData.state}
                                    onChange={e => {
                                        setStateSearch(e.target.value);
                                        setShowStateDropdown(true);
                                        if (!e.target.value) setBillingData({ ...billingData, state: '' });
                                    }}
                                    onFocus={() => setShowStateDropdown(true)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && showStateDropdown && filteredStates.length > 0) {
                                            e.preventDefault();
                                            setBillingData({ ...billingData, state: filteredStates[0] });
                                            setStateSearch(filteredStates[0]);
                                            setShowStateDropdown(false);
                                        }
                                    }}
                                    autoComplete="off"
                                />
                                <ChevronDown size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform ${showStateDropdown ? 'rotate-180' : ''}`} />
                            </div>
                            {showStateDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto z-30">
                                    {filteredStates.length > 0 ? (
                                        filteredStates.map(state => (
                                            <button
                                                key={state}
                                                type="button"
                                                onClick={() => {
                                                    setBillingData({ ...billingData, state });
                                                    setStateSearch(state);
                                                    setShowStateDropdown(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 text-gray-700"
                                            >
                                                {state}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-gray-500 text-sm">No states found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:outline-none focus:bg-white transition-colors"
                                value={billingData.email}
                                onChange={e => setBillingData({ ...billingData, email: e.target.value })}
                                required
                            />
                        </div>

                        <p className="text-sm text-gray-600">We'll mail you ticket confirmation and invoices</p>

                        {/* Terms */}
                        <div className="flex items-start gap-3 py-4">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={billingData.acceptedTerms}
                                onChange={e => setBillingData({ ...billingData, acceptedTerms: e.target.checked })}
                                className="mt-1 h-5 w-5 accent-gray-900"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-700">
                                I have read and accepted the{' '}
                                <a href="/terms" target="_blank" className="font-semibold text-blue-600 hover:text-blue-700">
                                    terms and conditions
                                </a>
                            </label>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={!isFormValid() || isSubmitting}
                                className="rounded bg-gray-900 px-8 py-3 font-bold text-white transition-all hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'PROCESSING...' : 'PAY ₹1 (TEST)'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
