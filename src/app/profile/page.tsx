'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, User, Phone, Shield, Calendar, MapPin, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { bookingApi } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function ProfilePage() {
    const { isLoggedIn, isOrganizer, phone, logout } = useAuth();
    const { bookings, setBookings } = useStore();
    const { addToast } = useToast();
    const router = useRouter();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            if (isOrganizer) {
                router.push('/list-your-events/dashboard');
                return;
            }
            fetchBookings();
        }
    }, [isLoggedIn, isOrganizer, router]);

    const fetchBookings = async () => {
        setIsLoadingBookings(true);
        try {
            // Fetch both play and dining bookings by making a single call (no type specified)
            const response = await bookingApi.getUserBookings('' as any);
            console.log('Profile Bookings Response:', response);

            if (response.success && response.data) {
                const data = response.data as any;
                const playBookings = (data.play_bookings || []).map((b: any) => ({ ...b, type: 'play' }));
                const diningBookings = (data.dining_bookings || []).map((b: any) => ({ ...b, type: 'dining' }));

                const allBookings = [...playBookings, ...diningBookings].sort(
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
                                                {booking.type === 'play' ? booking.venue_name : booking.restaurant_name}
                                            </h3>
                                            <p className="text-[#5331EA] font-semibold uppercase text-sm tracking-wider mt-1">
                                                {booking.type === 'play' ? booking.sport : 'Dining'}
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
                                        ) : (
                                            <div className="flex items-center gap-2 text-zinc-600">
                                                <User size={18} />
                                                <span className="text-sm font-medium">{booking.guest_count} Guests</span>
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
