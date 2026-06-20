'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Ticket, PlayCircle, Utensils, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useUserSession, clearUserSession } from '@/lib/auth/user';
import { bookingApi } from '@/lib/api/booking';

function MyBookingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const session = useUserSession();
    const typeParam = searchParams.get('type') as any;
    const activeTab = typeParam && ['dining', 'events', 'play'].includes(typeParam) ? typeParam : 'events';

    useEffect(() => {
        const checkDesktop = () => {
            if (window.innerWidth >= 768) {
                document.cookie = "device_view=desktop; path=/; max-age=31536000";
                const search = window.location.search || '';
                router.replace(`/bookings${search}`);
            } else {
                document.cookie = "device_view=mobile; path=/; max-age=31536000";
            }
        };
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, [router]);

    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        if (!session?.id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await bookingApi.getMobileUserBookings({
                email: session.email,
                phone: session.phone,
                userId: session.id
            });
            setBookings(data || []);
        } catch (err: any) {
            console.error('Failed to fetch mobile bookings:', err);
            if (err.message === 'UNAUTHORIZED') {
                clearUserSession();
                router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                return;
            }
            setError('Failed to load bookings. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [session?.id, session?.email, session?.phone, router]);

    useEffect(() => {
        if (session?.id) {
            fetchBookings();
        } else {
            setLoading(false);
        }
    }, [session?.id, fetchBookings]);

    useEffect(() => {
        if (!loading && !session) {
            router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
    }, [loading, session, router]);

    const filteredBookings = (bookings || [])
        .filter(b => (b.category || b.type) === activeTab)
        .sort((a, b) => {
            const dateA = new Date(a.booked_at || a.created_at || a.createdAt || 0).getTime();
            const dateB = new Date(b.booked_at || b.created_at || b.createdAt || 0).getTime();
            return dateB - dateA;
        });

    // Header Title mapping based on type
    const getHeaderTitle = () => {
        if (activeTab === 'dining') return 'Dining reservation';
        if (activeTab === 'play') return 'Play booking';
        return 'Event tickets';
    };

    if (!session && !loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
                <div className="w-full max-w-sm text-center">
                    <h2 className="text-2xl font-bold text-black mb-2">Sign in required</h2>
                    <p className="text-zinc-500 text-sm mb-8 leading-relaxed">Access your bookings after signing in.</p>
                    <Link href={`/login?redirect=${encodeURIComponent('/myboooking')}`} className="inline-flex w-full items-center justify-center py-4 rounded-xl text-sm font-bold text-white bg-black">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-24" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
            
            {/* Header: Chevron left arrow added next to title */}
            <header className="px-6 py-5 flex items-center gap-2 bg-white">
                <button 
                    onClick={() => router.back()}
                    className="p-1 -ml-1 active:opacity-60 transition-opacity"
                >
                    <ChevronLeft size={22} className="text-black" />
                </button>
                <h1 className="text-[18px] font-medium text-black leading-[20px]">
                    {getHeaderTitle()}
                </h1>
            </header>

            <main className="px-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <RefreshCw className="animate-spin text-zinc-400 mb-3" size={28} />
                        <p className="text-sm text-zinc-500 font-medium">Loading bookings...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>
                        <button onClick={fetchBookings} className="text-black text-sm font-bold underline">Try again</button>
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="space-y-6">
                        {filteredBookings.map((booking, idx) => {
                            const isCancelled = booking.status === 'cancelled' || booking.status === 'refunded';
                            const isExpired = booking.date ? new Date(booking.date).getTime() < new Date().setHours(0, 0, 0, 0) : false;

                            let statusLabel = 'Confirmed';
                            let statusColor = '#009133';
                            let statusBg = '#D6FAE5';
                            if (isCancelled) {
                                statusLabel = 'Cancelled';
                                statusColor = '#E53935';
                                statusBg = '#FFD6D6';
                            } else if (isExpired) {
                                statusLabel = 'Expired';
                                statusColor = '#E65100';
                                statusBg = '#FFE4CC';
                            }

                            const title = booking.event_name || booking.venue_name || 'Booking';
                            const dateStr = booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
                            const timeStr = booking.time || booking.time_slot || booking.slot || '';
                            const formattedDateTime = dateStr && timeStr ? `${dateStr} | ${timeStr}` : (dateStr || timeStr || 'Date | Time');

                            const venue = booking.venue_address || booking.address || booking.city || 'Venue';
                            const imageSrc = booking.play_image || booking.image_url || booking.event_image_url || booking.venue_image_url || null;

                            const ticketSummary = booking.category === 'play'
                                ? `${booking.duration ? booking.duration * 30 : 60} mins`
                                : booking.category === 'dining'
                                    ? `${booking.guests || 1} Guests`
                                    : booking.tickets?.[0]?.category
                                        ? `${booking.tickets[0].category} - ${booking.tickets[0].quantity}`
                                        : '1 Ticket';

                            return (
                                <div 
                                    key={booking.id || idx}
                                    className="w-full relative bg-[#F5F5F5] rounded-[10px] pt-4 pb-3 px-5 flex flex-col justify-between"
                                    style={{ height: '261px', border: '1px solid rgba(0,0,0,0.03)' }}
                                >
                                    {/* Top Content Row */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-3 min-w-0">
                                            {/* {NAME} */}
                                            <h2 className="text-[18px] font-medium text-black truncate leading-[20px]">
                                                {title}
                                            </h2>
                                            {/* {DATE | TIME} */}
                                            <p className="text-[12px] font-medium text-[#686868] mt-1.5 leading-[13px]">
                                                {formattedDateTime}
                                            </p>
                                            {/* {NO.OF TICKETS} */}
                                            <p className="text-[12px] font-medium text-[#686868] mt-1.5 leading-[13px]">
                                                {ticketSummary}
                                            </p>
                                        </div>

                                        {/* Image Box (Rectangle 131) */}
                                        <div 
                                            className="w-[93px] h-[124px] bg-[#BDB1F3]/30 rounded-[15px] overflow-hidden shrink-0 flex items-center justify-center border border-zinc-200"
                                        >
                                            {imageSrc ? (
                                                <img src={imageSrc} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Ticket size={24} className="text-zinc-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Middle & Bottom Rows with lines */}
                                    <div className="mt-auto space-y-2">
                                        {/* Venue Location Block */}
                                        <div>
                                            <p className="text-[12px] font-medium text-[#686868] leading-[13px]">Location</p>
                                            <p className={`font-medium text-black line-clamp-2 mt-0.5 ${venue.length > 25 ? 'text-[13px] leading-[15px]' : 'text-[18px] leading-[20px]'}`}>
                                                {venue}
                                            </p>
                                        </div>

                                        {/* Line 210 */}
                                        <div className="border-t border-[#AEAEAE] w-full" />

                                        {/* Actions Row */}
                                        <div className="flex justify-between items-center h-[25px]">
                                            {/* Confirmed Badge */}
                                            <div 
                                                className="px-3 py-1 rounded-[9px] flex items-center justify-center"
                                                style={{ background: statusBg, height: '25px' }}
                                            >
                                                <span className="text-[12px] font-semibold leading-[13px]" style={{ color: statusColor }}>
                                                    {statusLabel}
                                                </span>
                                            </div>

                                            {/* View Details Link - Fixed greater arrow shape to point right */}
                                            <Link 
                                                href={`/myboooking/${booking.id}`} 
                                                className="flex items-center gap-1 text-black active:opacity-75 transition-opacity"
                                            >
                                                <span className="text-[15px] font-medium leading-[16px]">View details</span>
                                                <svg 
                                                    width="6" 
                                                    height="10" 
                                                    viewBox="0 0 6 10" 
                                                    fill="none" 
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-2.5 h-2.5"
                                                >
                                                    <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </Link>
                                        </div>

                                        {/* Line 211 */}
                                        <div className="border-t border-[#AEAEAE] w-full" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-[#F5F5F5]">
                            {activeTab === 'dining' ? <Utensils size={26} className="text-zinc-400" /> :
                             activeTab === 'play' ? <PlayCircle size={26} className="text-zinc-400" /> :
                             <Ticket size={26} className="text-zinc-400" />}
                        </div>
                        <h3 className="text-lg font-bold text-black mb-1">No bookings found</h3>
                        <p className="text-sm text-zinc-500 mb-6">Start exploring and book your next experience!</p>
                        <Link href="/" className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold">
                            Go to Home
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function MyBookingsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-10 h-10 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <MyBookingsContent />
        </Suspense>
    );
}
