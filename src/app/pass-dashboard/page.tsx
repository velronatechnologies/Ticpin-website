'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/layout/Footer';
import BottomBanner from '@/components/layout/BottomBanner';
import { getUserPass, getPassRemainingDays, calculateDiscountedPrice, renewPass } from '@/lib/passUtils';
import { UserPass } from '@/lib/passUtils';
import Link from 'next/link';

export default function PassDashboard() {
    const router = useRouter();
    const { isLoggedIn, email, phone, token } = useAuth();
    const [userPass, setUserPass] = useState<UserPass | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [remainingDays, setRemainingDays] = useState(0);
    const [isRenewing, setIsRenewing] = useState(false);
    const [renewalSuccess, setRenewalSuccess] = useState(false);

    useEffect(() => {
        if (!isLoggedIn || (!email && !phone)) {
            router.push('/');
            return;
        }

        const fetchPass = async () => {
            try {
                const pass = await getUserPass(email || undefined, phone || undefined);
                setUserPass(pass);

                if (pass) {
                    setRemainingDays(getPassRemainingDays(pass.expiryDate));
                }
            } catch (error) {
                console.error('Error fetching pass:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPass();
    }, [isLoggedIn, email, phone, router]);

    const handleRenewPass = async () => {
        if (!email || !token || !userPass) return;

        setIsRenewing(true);
        try {
            const newPass = await renewPass(email, token);

            if (newPass) {
                // Send renewal confirmation email
                try {
                    await fetch('/api/emails/pass-renewal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: email,
                            name: userPass.name || 'User',
                            renewalDate: new Date().toISOString(),
                            newExpiryDate: newPass.expiryDate,
                            passId: newPass.id
                        })
                    });
                } catch (emailError) {
                    console.warn('Renewal email failed (non-blocking):', emailError);
                }

                setRenewalSuccess(true);
                setUserPass(newPass);
                setRemainingDays(getPassRemainingDays(newPass.expiryDate));

                setTimeout(() => {
                    setRenewalSuccess(false);
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            console.error('Error renewing pass:', error);
            alert('Failed to renew pass. Please try again.');
        } finally {
            setIsRenewing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!userPass) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-[1440px] mx-auto px-6 md:px-[68px] py-12">
                    <div className="text-center space-y-8">
                        <h1 className="text-4xl font-bold text-gray-900">No Active Pass</h1>
                        <p className="text-xl text-gray-600">You don't have an active Ticpin Pass yet.</p>
                        <Link
                            href="/ticpin-pass"
                            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:shadow-lg transition-all"
                        >
                            Get Ticpin Pass Now
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const remainingTurfBookings = userPass.freeTurfBookings - userPass.usedTurfBookings;
    const bookingUsagePercent = (userPass.usedTurfBookings / userPass.freeTurfBookings) * 100;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1440px] mx-auto px-6 md:px-[68px] py-12 space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        TICPIN PASS
                    </h1>
                    <p className="text-xl text-gray-600">Your Premium Membership Dashboard</p>
                </div>

                {/* Pass Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status Card */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
                        <p className="text-sm font-medium text-purple-700 uppercase tracking-wide mb-2">Pass Status</p>
                        <h3 className="text-3xl font-bold text-purple-600 mb-2">Active</h3>
                        <p className="text-gray-700">
                            {remainingDays} days remaining
                        </p>
                        {remainingDays < 7 && (
                            <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-300">
                                <p className="text-sm text-orange-700 font-medium">Renew soon to avoid lapsing benefits</p>
                            </div>
                        )}
                    </div>

                    {/* Expiry Card */}
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-8 border border-pink-200">
                        <p className="text-sm font-medium text-pink-700 uppercase tracking-wide mb-2">Expiry Date</p>
                        <h3 className="text-2xl font-bold text-pink-600 mb-2">
                            {new Date(userPass.expiryDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </h3>
                        <p className="text-gray-700 text-sm">Renew before expiry</p>
                    </div>

                    {/* Discount Card */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
                        <p className="text-sm font-medium text-green-700 uppercase tracking-wide mb-2">Active Discount</p>
                        <h3 className="text-3xl font-bold text-green-600 mb-2">{userPass.discountPercentage}%</h3>
                        <p className="text-gray-700 text-sm">On all categories</p>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Benefits</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Free Turf Bookings */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Free Turf Bookings</h3>
                                    <p className="text-blue-700">
                                        {remainingTurfBookings} remaining out of {userPass.freeTurfBookings}
                                    </p>
                                </div>
                                <div className="text-5xl">🎾</div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-full transition-all duration-300"
                                    style={{ width: `${(remainingTurfBookings / userPass.freeTurfBookings) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-sm text-blue-700">Used: {userPass.usedTurfBookings}</p>
                                <p className="text-sm text-blue-700 font-bold">Total: {userPass.freeTurfBookings}</p>
                            </div>

                            <div className="mt-6">
                                <Link
                                    href="/play"
                                    className="inline-block w-full text-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                                >
                                    Book Your Free Slot
                                </Link>
                            </div>
                        </div>

                        {/* Dining Vouchers */}
                        <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl p-8 border border-pink-200">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-pink-900 mb-2">Dining Vouchers</h3>
                                    <p className="text-pink-700">
                                        {(userPass.totalDiningVouchers || 2) - (userPass.usedDiningVouchers || 0)}/{(userPass.totalDiningVouchers || 2)} coupons available
                                    </p>
                                </div>
                                <div className="text-5xl">🍽️</div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-pink-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-pink-600 to-pink-500 h-full transition-all duration-300"
                                    style={{ width: `${(((userPass.totalDiningVouchers || 2) - (userPass.usedDiningVouchers || 0)) / (userPass.totalDiningVouchers || 2)) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-sm text-pink-700">Used: {userPass.usedDiningVouchers || 0}</p>
                                <p className="text-sm text-pink-700 font-bold">Total: {userPass.totalDiningVouchers || 2}</p>
                            </div>

                            <div className="mt-6">
                                <Link
                                    href="/dining"
                                    className="inline-block w-full text-center px-6 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-all"
                                >
                                    Explore Dining
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Sample Discount Savings */}
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-8 border border-amber-200">
                        <h3 className="text-2xl font-bold text-amber-900 mb-4">Discount Savings</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { category: 'Play booking', original: 1000, after: calculateDiscountedPrice(1000, userPass.discountPercentage) },
                                { category: 'Event ticket', original: 2000, after: calculateDiscountedPrice(2000, userPass.discountPercentage) },
                                { category: 'Dining', original: 1500, after: calculateDiscountedPrice(1500, userPass.discountPercentage) }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col justify-between p-4 bg-white/50 rounded-xl">
                                    <div>
                                        <p className="font-semibold text-gray-900">{item.category}</p>
                                        <p className="text-xs text-gray-600">
                                            Save ₹{item.original - item.after}
                                        </p>
                                    </div>
                                    <div className="mt-3 flex items-baseline gap-2">
                                        <span className="font-bold text-amber-600 text-lg">₹{item.after}</span>
                                        <span className="text-xs line-through text-gray-500">₹{item.original}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pass Info */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Pass Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Purchase Date</p>
                            <p className="font-semibold text-gray-900">
                                {new Date(userPass.purchaseDate).toLocaleDateString('en-IN')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Valid For</p>
                            <p className="font-semibold text-gray-900">3 Months</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Renewal</p>
                            <p className="font-semibold text-gray-900">Auto-renew available</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <p className="font-semibold text-green-600">✓ Active</p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-center text-white">
                    {renewalSuccess ? (
                        <>
                            <h3 className="text-3xl font-bold mb-4">✓ Pass Renewed!</h3>
                            <p className="text-lg text-white/90">Your Ticpin Pass has been successfully renewed.</p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl font-bold mb-4">Love Your Pass?</h3>
                            <p className="text-lg text-white/90 mb-8">
                                Renew before expiry to continue enjoying premium benefits
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <button
                                    onClick={handleRenewPass}
                                    disabled={isRenewing}
                                    className="px-8 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRenewing ? 'Processing...' : 'Renew Pass'}
                                </button>
                                <Link
                                    href="/play"
                                    className="px-8 py-3 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                                >
                                    Continue Booking
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <BottomBanner />
            <Footer />
        </div>
    );
}
