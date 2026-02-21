'use client';

import { useState, useEffect } from 'react';
import { getUserPass, getRemainingFreeTurfBookings, applyPassDiscount } from '@/lib/passUtils';
import { Sparkles, Zap, Gift } from 'lucide-react';

interface PassBenefitsCardProps {
    email?: string;
    phone?: string;
    bookingType: 'event' | 'play' | 'dining';
    totalAmount: number;
    onDiscountApply?: (discountedAmount: number, isFreeBooking: boolean) => void;
}

export default function PassBenefitsCard({
    email,
    phone,
    bookingType,
    totalAmount,
    onDiscountApply
}: PassBenefitsCardProps) {
    const [userPass, setUserPass] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [appliedBenefit, setAppliedBenefit] = useState<'discount' | 'free-booking' | null>(null);
    const [remainingFreeBookings, setRemainingFreeBookings] = useState(0);

    useEffect(() => {
        const fetchPassData = async () => {
            if (!email && !phone) return;

            try {
                const pass = await getUserPass(email || undefined, phone || undefined);
                setUserPass(pass);

                if (bookingType === 'play' && pass && pass.status === 'active') {
                    // Use the email/phone from the pass document for quota check
                    const qEmail = pass.email || undefined;
                    const qPhone = pass.phone || undefined;
                    const remaining = await getRemainingFreeTurfBookings(qEmail, qPhone);
                    setRemainingFreeBookings(remaining);
                }
            } catch (error) {
                console.error('Error fetching pass data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPassData();
    }, [email, phone, bookingType]);

    if (isLoading || !userPass || userPass.status !== 'active') {
        return null; // Don't show if no active pass
    }

    const discountedAmount = totalAmount * (1 - userPass.discountPercentage / 100);
    const savings = totalAmount - discountedAmount;
    const canUseFreeBooking = bookingType === 'play' && remainingFreeBookings > 0;

    const handleApplyDiscount = () => {
        setAppliedBenefit('discount');
        onDiscountApply?.(Math.round(discountedAmount), false);
    };

    const handleApplyFreeBooking = () => {
        setAppliedBenefit('free-booking');
        onDiscountApply?.(0, true);
    };

    return (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 mb-6">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-full text-white">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Ticpin Pass Benefits</h3>
                        <p className="text-sm text-gray-600">Active pass{' '}
                            <span className="font-semibold">
                                ({new Date(userPass.expiryDate).toLocaleDateString('en-IN')})
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {appliedBenefit ? (
                <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 text-green-600 font-bold mb-3">
                        <span>✓ Benefit Applied</span>
                    </div>

                    {appliedBenefit === 'discount' && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Original Amount</span>
                                <span className="font-semibold">₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600 font-bold">
                                <span>{userPass.discountPercentage}% Discount</span>
                                <span>-₹{Math.round(savings)}</span>
                            </div>
                            <div className="flex justify-between text-base border-t border-gray-200 pt-2 mt-2">
                                <span className="font-bold">You Pay</span>
                                <span className="font-bold text-green-600">₹{Math.round(discountedAmount)}</span>
                            </div>
                        </div>
                    )}

                    {appliedBenefit === 'free-booking' && (
                        <div className="space-y-2">
                            <div className="text-green-600 font-bold text-center text-lg">
                                Free Turf Booking Activated! 🎾
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                {remainingFreeBookings - 1} free bookings remaining
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => setAppliedBenefit(null)}
                        className="w-full mt-4 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all"
                    >
                        Change Benefit
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Free Booking Option */}
                    {canUseFreeBooking && (
                        <button
                            onClick={handleApplyFreeBooking}
                            className="w-full p-4 bg-white rounded-xl border-2 border-green-200 hover:bg-green-50 transition-all text-left group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Gift size={18} className="text-green-600" />
                                    <span className="font-bold text-gray-900">Free Turf Booking</span>
                                </div>
                                <span className="text-2xl font-bold text-green-600">₹{totalAmount}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                {remainingFreeBookings} free bookings remaining
                            </p>
                        </button>
                    )}

                    {/* Discount Option */}
                    <button
                        onClick={handleApplyDiscount}
                        className="w-full p-4 bg-white rounded-xl border-2 border-purple-200 hover:bg-purple-50 transition-all text-left"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Zap size={18} className="text-purple-600" />
                                <span className="font-bold text-gray-900">
                                    {userPass.discountPercentage}% Instant Discount
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Save</p>
                                <p className="font-bold text-green-600">₹{Math.round(savings)}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Pay only ₹{Math.round(discountedAmount)}
                        </p>
                    </button>
                </div>
            )}
        </div>
    );
}
