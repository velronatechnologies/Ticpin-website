'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, User, Phone, Shield, Calendar, MapPin, Clock, Gift, Zap, Ticket } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { bookingApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { getUserPass, UserPass } from '@/lib/passUtils';

export default function ProfilePage() {
    const { isLoggedIn, isOrganizer, phone, logout, email } = useAuth();
    const { bookings, setBookings } = useStore();
    const { addToast } = useToast();
    const router = useRouter();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [userPass, setUserPass] = useState<UserPass | null>(null);
    const [isLoadingPass, setIsLoadingPass] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            if (isOrganizer) {
                router.push('/list-your-events/dashboard');
                return;
            }
            fetchBookings();
            fetchUserPass();
        }
    }, [isLoggedIn, isOrganizer, router, email]);

    const fetchUserPass = async () => {
        if (!email && !phone) return;
        setIsLoadingPass(true);
        try {
            const pass = await getUserPass(email || undefined, phone || undefined);
            setUserPass(pass);
        } catch (error) {
            console.error('Failed to fetch user pass:', error);
        } finally {
            setIsLoadingPass(false);
        }
    };

    const fetchBookings = async () => {
        setIsLoadingBookings(true);
        try {
            // Fetch all booking types in one call (no type param = returns all)
            const response = await bookingApi.getUserBookings();
            console.log('Profile Bookings Response:', response);

            if (response.success && response.data) {
                const data = response.data as any;
                const playBookings = (data.play_bookings || []).map((b: any) => ({ ...b, type: 'play' }));
                const diningBookings = (data.dining_bookings || []).map((b: any) => ({ ...b, type: 'dining' }));
                const eventBookings = (data.event_bookings || []).map((b: any) => ({ ...b, type: 'event' }));

                const allBookings = [...playBookings, ...diningBookings, ...eventBookings].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                setBookings(allBookings);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            addToast('Failed to load bookings. Please try again later.', 'error');
        } finally {
            setIsLoadingBookings(false);
        }
    };

    const handleLogout = () => {
        logout();
        addToast('You have been logged out', 'success');
        setShowLogoutConfirm(false);
        router.push('/');
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#f8f4ff] flex items-center justify-center p-4">
                <div className="bg-white rounded-[30px] p-8 text-center max-w-sm shadow-lg">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={32} className="text-zinc-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Not Logged In</h2>
                    <p className="text-zinc-500 mb-8">You need to log in to access your profile.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-[#5331EA] text-white py-3 rounded-xl font-semibold hover:bg-[#4424d0] transition-all"
                    >
                        Go to Home & Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f4ff] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Profile Card */}
                <div className="bg-white rounded-[30px] p-8 shadow-lg mb-6">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-zinc-900 mb-2">Your Profile</h1>
                            <p className="text-zinc-500">Manage your account settings</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-[#5331EA] to-[#7c00e6] rounded-full flex items-center justify-center">
                            <User size={32} className="text-white" />
                        </div>
                    </div>

                    {/* Account Status */}
                    <div className="flex items-center gap-3 mb-8 p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-semibold text-green-700">✓ You are logged in</span>
                    </div>

                    {/* User Info */}
                    <div className="space-y-6 mb-8">
                        <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl">
                            <Phone size={24} className="text-[#5331EA]" />
                            <div>
                                <p className="text-sm text-zinc-500">Phone Number</p>
                                <p className="text-lg font-semibold text-zinc-900">{phone || 'Not set'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-4 rounded-xl font-semibold hover:bg-red-100 transition-all border border-red-200"
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>
                </div>

                {/* TicPin Pass Section */}
                {!isLoadingPass && (
                    userPass ? (
                        <div
                            onClick={() => router.push('/pass-dashboard')}
                            className="bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#5b21b6] rounded-[30px] p-8 shadow-lg mb-6 text-white cursor-pointer hover:scale-[1.01] transition-all"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Ticket size={28} />
                                        <h2 className="text-3xl font-bold">TicPin Pass</h2>
                                    </div>
                                    <p className="text-purple-100">3 months of exclusive benefits</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest ${userPass.status === 'active'
                                    ? 'bg-green-400/30 text-green-100 border border-green-300'
                                    : 'bg-red-400/30 text-red-100 border border-red-300'
                                    }`}>
                                    {userPass.status === 'active' ? '✓ Active' : '⏱ Expired'}
                                </div>
                            </div>

                            {/* Pass Benefits */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Zap size={20} className="text-yellow-300" />
                                        <p className="text-purple-100 text-sm">Free Turf Bookings</p>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">{userPass.freeTurfBookings - userPass.usedTurfBookings}</span>
                                        <span className="text-purple-200">/ {userPass.freeTurfBookings} remaining</span>
                                    </div>
                                    <div className="mt-3 bg-white/5 rounded-lg h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all"
                                            style={{ width: `${((userPass.freeTurfBookings - userPass.usedTurfBookings) / userPass.freeTurfBookings) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Gift size={20} className="text-pink-300" />
                                        <p className="text-purple-100 text-sm">Dining Vouchers</p>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">{(userPass.totalDiningVouchers || 2) - (userPass.usedDiningVouchers || 0)}</span>
                                        <span className="text-purple-200">/ {userPass.totalDiningVouchers || 2} remaining</span>
                                    </div>
                                    <div className="mt-3 bg-white/5 rounded-lg h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-pink-300 to-pink-500 transition-all"
                                            style={{ width: `${(((userPass.totalDiningVouchers || 2) - (userPass.usedDiningVouchers || 0)) / (userPass.totalDiningVouchers || 2)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Shield size={20} className="text-blue-300" />
                                        <p className="text-purple-100 text-sm">Event Discount</p>
                                    </div>
                                    <p className="text-3xl font-bold">{userPass.discountPercentage}%</p>
                                    <p className="text-purple-200 text-sm mt-1">On all event bookings</p>
                                </div>

                                <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Calendar size={20} className="text-green-300" />
                                        <p className="text-purple-100 text-sm">Passes Used</p>
                                    </div>
                                    <p className="text-3xl font-bold">{userPass.usedTurfBookings}</p>
                                    <p className="text-purple-200 text-sm mt-1">Free bookings applied</p>
                                </div>
                            </div>

                            {/* Pass Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                                    <p className="text-purple-100 text-xs uppercase tracking-widest mb-1">Purchase Date</p>
                                    <p className="text-lg font-semibold">{new Date(userPass.purchaseDate).toLocaleDateString('en-IN')}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                                    <p className="text-purple-100 text-xs uppercase tracking-widest mb-1">Expiry Date</p>
                                    <p className="text-lg font-semibold">{new Date(userPass.expiryDate).toLocaleDateString('en-IN')}</p>
                                </div>
                            </div>

                            {userPass.status === 'expired' && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => router.push('/ticpin-pass')}
                                        className="w-full bg-white text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all"
                                    >
                                        Renew Your Pass
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-[30px] p-8 shadow-lg mb-6 border-2 border-dashed border-purple-200">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Ticket size={32} className="text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 mb-2">No Active TicPin Pass</h3>
                                <p className="text-zinc-600 mb-6 max-w-md mx-auto">
                                    Unlock exclusive benefits with a TicPin Pass! Get 2 free turf bookings, dining vouchers, and event discounts.
                                </p>
                                <button
                                    onClick={() => router.push('/ticpin-pass')}
                                    className="inline-block bg-gradient-to-r from-[#5331EA] to-[#7c00e6] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    Get Your Pass Now
                                </button>
                            </div>
                        </div>
                    )
                )}

                {/* My Bookings Section */}
                <div className="bg-white rounded-[30px] p-8 shadow-lg mb-6">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-6">My Bookings</h2>

                    {isLoadingBookings ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-zinc-200 border-t-[#5331EA] rounded-full animate-spin"></div>
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-[#5331EA]/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900">
                                                {booking.type === 'play' ? booking.venue_name :
                                                    booking.type === 'dining' ? booking.restaurant_name :
                                                        booking.event_title}
                                            </h3>
                                            <p className="text-[#5331EA] font-semibold uppercase text-sm tracking-wider mt-1">
                                                {booking.type === 'play' ? booking.sport :
                                                    booking.type === 'dining' ? 'Dining' :
                                                        `Event - ${booking.ticket_type}`}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-600'
                                            }`}>
                                            {booking.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2 text-zinc-600">
                                            <Calendar size={18} />
                                            <span className="text-sm font-medium">{booking.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-600">
                                            <Clock size={18} />
                                            <span className="text-sm font-medium">{booking.time_slot}</span>
                                        </div>
                                        {booking.type === 'play' ? (
                                            <div className="flex items-center gap-2 text-zinc-900 font-bold">
                                                <span className="text-sm">₹{booking.price?.toLocaleString()}</span>
                                            </div>
                                        ) : booking.type === 'dining' ? (
                                            <div className="flex items-center gap-2 text-zinc-600">
                                                <User size={18} />
                                                <span className="text-sm font-medium">{booking.guest_count} Guests</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-zinc-900 font-bold">
                                                <span className="text-sm">₹{booking.total_price?.toLocaleString()} ({booking.quantity} tkts)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
                            <p className="text-zinc-500 font-medium">No bookings found yet</p>
                            <button
                                onClick={() => router.push('/play')}
                                className="mt-4 text-[#5331EA] font-bold hover:underline"
                            >
                                Book your first sport →
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-[30px] p-8 shadow-lg">
                    <h2 className="text-xl font-bold text-zinc-900 mb-4">Account Options</h2>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push(userPass ? '/pass-dashboard' : '/ticpin-pass')}
                            className="w-full text-left p-4 hover:bg-purple-50 rounded-xl transition-colors flex items-center justify-between group border-l-4 border-transparent hover:border-[#5331EA]"
                        >
                            <div>
                                <span className="font-medium text-zinc-900 group-hover:text-[#5331EA]">TicPin Pass</span>
                                <p className="text-xs text-zinc-500 mt-1">{userPass ? `Status: ${userPass.status}` : 'Get exclusive benefits'}</p>
                            </div>
                            <span className="text-zinc-400">→</span>
                        </button>
                        <button className="w-full text-left p-4 hover:bg-zinc-50 rounded-xl transition-colors flex items-center justify-between group">
                            <span className="font-medium text-zinc-900 group-hover:text-[#5331EA]">View All Bookings</span>
                            <span className="text-zinc-400">→</span>
                        </button>
                        <button className="w-full text-left p-4 hover:bg-zinc-50 rounded-xl transition-colors flex items-center justify-between group">
                            <span className="font-medium text-zinc-900 group-hover:text-[#5331EA]">Payment Methods</span>
                            <span className="text-zinc-400">→</span>
                        </button>
                        <button className="w-full text-left p-4 hover:bg-zinc-50 rounded-xl transition-colors flex items-center justify-between group">
                            <span className="font-medium text-zinc-900 group-hover:text-[#5331EA]">Edit Profile</span>
                            <span className="text-zinc-400">→</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-[30px] p-8 max-w-sm animate-in zoom-in">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <LogOut size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-center text-zinc-900 mb-2">Log Out?</h3>
                        <p className="text-center text-zinc-500 mb-8">
                            Are you sure you want to log out? You'll need to log in again next time.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
