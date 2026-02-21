'use client';

import { useState, useEffect } from 'react';
import { getUserPass, getRemainingFreeTurfBookings } from '@/lib/passUtils';
import { Sparkles, Gift, Zap } from 'lucide-react';

interface PassStatusBannerProps {
    email?: string;
    phone?: string;
    bookingType?: 'event' | 'play' | 'dining';
}

export default function PassStatusBanner({ email, phone, bookingType = 'play' }: PassStatusBannerProps) {
    const [userPass, setUserPass] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(!email && !phone);
    const [remainingFreeBookings, setRemainingFreeBookings] = useState(0);

    useEffect(() => {
        if (!email && !phone) {
            setIsLoading(false);
            return;
        }

        const fetchPassData = async () => {
            try {
                const pass = await getUserPass(email || undefined, phone || undefined);
                setUserPass(pass);

                if (bookingType === 'play' && pass?.status === 'active') {
                    const remaining = await getRemainingFreeTurfBookings(pass.email || undefined, pass.phone || undefined);
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
        return null;
    }

    const daysRemaining = Math.ceil((new Date(userPass.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 md:p-6 text-white mb-6 shadow-lg">
            <div className="flex items-start gap-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-full flex-shrink-0">
                    <Sparkles size={24} className="text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg md:text-xl mb-2">Your Ticpin Pass is Active! 🎉</h3>
                    <p className="text-white/90 text-sm md:text-base mb-3">
                        Enjoy exclusive benefits on this booking and more
                    </p>

                    {/* Benefits Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {bookingType === 'play' && remainingFreeBookings > 0 && (
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <Gift size={18} className="mb-1" />
                                <p className="text-xs font-semibold">{remainingFreeBookings} Free Bookings</p>
                            </div>
                        )}

                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <Zap size={18} className="mb-1" />
                            <p className="text-xs font-semibold">{userPass.discountPercentage}% Discount</p>
                        </div>

                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <span className="text-sm font-semibold">📅 {daysRemaining} days left</span>
                        </div>
                    </div>

                    <p className="text-xs text-white/80">
                        Apply your benefits at checkout
                    </p>
                </div>
            </div>
        </div>
    );
}
