'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, RefreshCw, Ticket, PlayCircle, MapPin, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useUserSession, clearUserSession } from '@/lib/auth/user';
import { bookingApi } from '@/lib/api/booking';

let cachedBookings: any[] | null = null;
let isFetchingBookings = false;
let lastSessionId: string | null = null;

function BookingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const session = useUserSession();
    const typeParam = searchParams.get('type') as any;
    const activeTab = typeParam && ['events', 'play'].includes(typeParam) ? typeParam : 'play';
    const currentPathWithQuery = () =>
        typeof window === 'undefined'
            ? '/bookings'
            : `${window.location.pathname}${window.location.search || ''}`;

    useEffect(() => {
        const checkMobile = () => {
            if (window.innerWidth < 768) {
                document.cookie = "device_view=mobile; path=/; max-age=31536000";
                const search = window.location.search || '';
                router.replace(`/myboooking${search}`);
            } else {
                document.cookie = "device_view=desktop; path=/; max-age=31536000";
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [router]);

    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // sessionReady: true once useUserSession() has finished reading the cookie (after first effect)
    const [sessionReady, setSessionReady] = useState(false);

    const tabs = [
        { id: 'events', label: 'Events' },
        { id: 'play', label: 'Play' },
    ];

    const fetchBookings = useCallback(async (force = false) => {
        if (!session?.id) return;

        // Clear cache if the logged-in user changed
        if (lastSessionId !== session.id) {
            cachedBookings = null;
            lastSessionId = session.id;
        }

        if (!force && (cachedBookings !== null || isFetchingBookings)) {
            if (cachedBookings !== null) {
                setBookings(cachedBookings);
                setLoading(false);
            }
            return;
        }

        isFetchingBookings = true;
        setLoading(true);
        setError(null);
        try {
            const data = await bookingApi.getUserBookings({
                email: session.email,
                phone: session.phone,
                userId: session.id
            });
            cachedBookings = data || [];
            setBookings(cachedBookings);
        } catch (err: any) {
            console.error('Failed to fetch bookings:', err);
            if (err.message === 'UNAUTHORIZED') {
                clearUserSession();
                router.push(`/login?redirect=${encodeURIComponent(currentPathWithQuery())}`);
                return;
            }
            setError('Failed to load bookings. Please try again.');
        } finally {
            setLoading(false);
            isFetchingBookings = false;
        }
    }, [session?.id, session?.email, session?.phone]);

    useEffect(() => {
        if (!session) {
            cachedBookings = null;
            lastSessionId = null;
        }
    }, [session]);

    // Mark session as ready after the first attempt to read it from cookie
    useEffect(() => {
        setSessionReady(true);
    }, [session]);

    // Only redirect if session is confirmed missing (not just unloaded yet)
    useEffect(() => {
        if (sessionReady && !loading && !session) {
            router.replace(`/login?redirect=${encodeURIComponent(currentPathWithQuery())}`);
        }
    }, [sessionReady, loading, session, router]);

    useEffect(() => {
        if (session?.id) {
            fetchBookings();
        } else if (sessionReady) {
            // Only stop loading once we know for sure session doesn't exist
            setLoading(false);
        }
    }, [session?.id, sessionReady, fetchBookings]);

    const filteredBookings = (bookings || [])
        .filter(b => (b.category || b.type) === activeTab)
        .sort((a, b) => {
            const dateA = new Date(a.booked_at || a.created_at || a.createdAt || 0).getTime();
            const dateB = new Date(b.booked_at || b.created_at || b.createdAt || 0).getTime();
            return dateB - dateA; // newest first
        });

    if (!session && !loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-[34px] font-semibold text-black mb-4">Please log in</h2>
                    <p className="text-[#686868] text-[20px] mb-8">You need to be logged in to review your bookings.</p>
                    <Link href={`/login?redirect=${encodeURIComponent(currentPathWithQuery())}`} className="px-8 py-4 bg-black text-white rounded-full text-[20px] font-semibold inline-block">
                        Login / Sign Up
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-anek-latin)]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-white border-b border-[#D9D9D9] z-50 flex items-center px-4 md:px-[37px]">
                {/* Mobile Header: Title, NO logo */}
                <div className="flex md:hidden items-center gap-[10px] w-full">
                    <span className="text-[18px] font-semibold text-black">Review your bookings</span>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between w-full h-full relative">
                    <div className="flex items-center">
                        <Link href="/">
                            <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-7 w-auto" />
                        </Link>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <h1 className="text-[24px] font-semibold text-black leading-none whitespace-nowrap pointer-events-auto">
                            Review your bookings
                        </h1>
                    </div>
                </div>
            </header>

            <main className="pt-16 md:pt-20 pb-20 px-4 flex flex-col items-center">
                {/* Tabs Section */}
                <div className="mt-8 bg-[#E1E1E1] rounded-full p-1 flex items-center max-w-full overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                router.replace(`/bookings?type=${tab.id}`, { scroll: false });
                            }}
                            className={`px-6 md:px-10 py-2 rounded-full text-[15px] md:text-[18px] font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-black text-white'
                                    : 'text-black'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Section */}
                <div className="mt-[30px] w-full max-w-[520px] space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center py-20">
                            <RefreshCw className="animate-spin text-zinc-400 mb-4" size={40} />
                            <p className="text-zinc-500">Loading your bookings...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button onClick={() => fetchBookings(true)} className="text-black underline font-medium">Try again</button>
                        </div>
                    ) : filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, idx) => (
                            <div key={booking.id || idx} style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }} className="bg-white border-[0.5px] border-[#aeaeae] rounded-[12px] p-5 w-full flex flex-col gap-4 relative mx-auto">
                                {/* Top Row: Details & Image */}
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0 space-y-1">
                                        {/* Title */}
                                        <h3 className="text-[20px] font-medium text-black leading-tight break-words">
                                            {booking.event_name || booking.venue_name || booking.title || 'Booking'}
                                        </h3>
                                        
                                        {/* Date & Time combined in a single line */}
                                        <p className="text-[15px] font-medium text-[#686868] leading-tight">
                                            {new Date(booking.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} | {booking.time || booking.time_slot || booking.slot || ''}
                                        </p>

                                        {/* Court Name or Ticket Details */}
                                        <p className="text-[15px] font-medium text-[#686868] leading-tight">
                                            {booking.court_name || booking.tickets?.[0]?.category || '1 ticket'}
                                        </p>
                                    </div>

                                    {/* Keep the 16:9 landscape image exactly as is in your code */}
                                    <div className="w-[100px] h-[60px] bg-zinc-100 rounded-[8px] overflow-hidden flex items-center justify-center shrink-0">
                                        {(booking.play_image || booking.image_url || booking.event_image_url || booking.venue_image_url) ? (
                                            <img src={booking.play_image || booking.image_url || booking.event_image_url || booking.venue_image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Ticket size={20} className="text-zinc-300" />
                                        )}
                                    </div>
                                </div>

                                {/* Middle Row: Location & SVG */}
                                <div className="space-y-0.5">
                                    <p className="text-[14px] font-medium text-[#686868] leading-none">Location</p>
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-[16px] font-medium text-black leading-snug break-words flex-1">
                                            {booking.venue_address || booking.address || booking.city || 'Location'}
                                        </p>
                                        {booking.google_map_link ? (
                                            <a href={booking.google_map_link} target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:opacity-80 transition-opacity shrink-0 mt-0.5">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21.1213 9.8799L14.1213 2.8799C13.549 2.33689 12.7902 2.03418 12.0013 2.03418C11.2124 2.03418 10.4535 2.33689 9.88127 2.8799L2.88127 9.8799C2.31946 10.4424 2.00391 11.2049 2.00391 11.9999C2.00391 12.7949 2.31946 13.5574 2.88127 14.1199L9.88127 21.1199C10.4438 21.6817 11.2063 21.9973 12.0013 21.9973C12.7963 21.9973 13.5588 21.6817 14.1213 21.1199L21.1213 14.1199C21.6831 13.5574 21.9986 12.7949 21.9986 11.9999C21.9986 11.2049 21.6831 10.4424 21.1213 9.8799ZM19.7113 12.7099L12.7113 19.7099C12.6183 19.8036 12.5077 19.878 12.3858 19.9288C12.264 19.9796 12.1333 20.0057 12.0013 20.0057C11.8693 20.0057 11.7385 19.9796 11.6167 19.9288C11.4948 19.878 11.3842 19.8036 11.2913 19.7099L4.29127 12.7099C4.19754 12.6169 4.12314 12.5063 4.07238 12.3845C4.02161 12.2626 3.99547 12.1319 3.99547 11.9999C3.99547 11.8679 4.02161 11.7372 4.07238 11.6153C4.12314 11.4935 4.19754 11.3829 4.29127 11.2899L11.2913 4.2899C11.3842 4.19617 11.4948 4.12178 11.6167 4.07101C11.7385 4.02024 11.8693 3.9941 12.0013 3.9941C12.1333 3.9941 12.264 4.02024 12.3858 4.07101C12.5077 4.12178 12.6183 4.19617 12.7113 4.2899L19.7113 11.2899C19.805 11.3829 19.8794 11.4935 19.9302 11.6153C19.9809 11.7372 20.0071 11.8679 20.0071 11.9999C20.0071 12.1319 19.9809 12.2626 19.9302 12.3845C19.8794 12.5063 19.805 12.6169 19.7113 12.7099ZM14.2113 9.2899C14.023 9.1016 13.7676 8.99581 13.5013 8.99581C13.235 8.99581 12.9796 9.1016 12.7913 9.2899C12.603 9.4782 12.4972 9.7336 12.4972 9.9999C12.4972 10.2662 12.603 10.5216 12.7913 10.7099L13.0913 10.9999H9.50127C9.23605 10.9999 8.9817 11.1053 8.79416 11.2928C8.60662 11.4803 8.50127 11.7347 8.50127 11.9999V13.9999C8.50127 14.2651 8.60662 14.5195 8.79416 14.707C8.9817 14.8945 9.23605 14.9999 9.50127 14.9999C9.76648 14.9999 10.0208 14.8945 10.2084 14.707C10.3959 14.5195 10.5013 14.2651 10.5013 13.9999V12.9999H13.0913L12.7913 13.2899C12.6975 13.3829 12.6231 13.4935 12.5724 13.6153C12.5216 13.7372 12.4955 13.8679 12.4955 13.9999C12.4955 14.1319 12.5216 14.2626 12.5724 14.3845C12.6231 14.5063 12.6975 14.6169 12.7913 14.7099C12.8842 14.8036 12.9948 14.878 13.1167 14.9288C13.2385 14.9796 13.3693 15.0057 13.5013 15.0057C13.6333 15.0057 13.764 14.9796 13.8858 14.9288C14.0077 14.878 14.1183 14.8036 14.2113 14.7099L16.2113 12.7099C16.305 12.6169 16.3794 12.5063 16.4302 12.3845C16.4809 12.2626 16.5071 12.1319 16.5071 11.9999C16.5071 11.8679 16.4809 11.7372 16.4302 11.6153C16.3794 11.4935 16.305 11.3829 16.2113 11.2899L14.2113 9.2899Z" fill="black"/>
                                                </svg>
                                            </a>
                                        ) : (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-zinc-400 mt-0.5">
                                                <path d="M21.1213 9.8799L14.1213 2.8799C13.549 2.33689 12.7902 2.03418 12.0013 2.03418C11.2124 2.03418 10.4535 2.33689 9.88127 2.8799L2.88127 9.8799C2.31946 10.4424 2.00391 11.2049 2.00391 11.9999C2.00391 12.7949 2.31946 13.5574 2.88127 14.1199L9.88127 21.1199C10.4438 21.6817 11.2063 21.9973 12.0013 21.9973C12.7963 21.9973 13.5588 21.6817 14.1213 21.1199L21.1213 14.1199C21.6831 13.5574 21.9986 12.7949 21.9986 11.9999C21.9986 11.2049 21.6831 10.4424 21.1213 9.8799ZM19.7113 12.7099L12.7113 19.7099C12.6183 19.8036 12.5077 19.878 12.3858 19.9288C12.264 19.9796 12.1333 20.0057 12.0013 20.0057C11.8693 20.0057 11.7385 19.9796 11.6167 19.9288C11.4948 19.878 11.3842 19.8036 11.2913 19.7099L4.29127 12.7099C4.19754 12.6169 4.12314 12.5063 4.07238 12.3845C4.02161 12.2626 3.99547 12.1319 3.99547 11.9999C3.99547 11.8679 4.02161 11.7372 4.07238 11.6153C4.12314 11.4935 4.19754 11.3829 4.29127 11.2899L11.2913 4.2899C11.3842 4.19617 11.4948 4.12178 11.6167 4.07101C11.7385 4.02024 11.8693 3.9941 12.0013 3.9941C12.1333 3.9941 12.264 4.02024 12.3858 4.07101C12.5077 4.12178 12.6183 4.19617 12.7113 4.2899L19.7113 11.2899C19.805 11.3829 19.8794 11.4935 19.9302 11.6153C19.9809 11.7372 20.0071 11.8679 20.0071 11.9999C20.0071 12.1319 19.9809 12.2626 19.9302 12.3845C19.8794 12.5063 19.805 12.6169 19.7113 12.7099ZM14.2113 9.2899C14.023 9.1016 13.7676 8.99581 13.5013 8.99581C13.235 8.99581 12.9796 9.1016 12.7913 9.2899C12.603 9.4782 12.4972 9.7336 12.4972 9.9999C12.4972 10.2662 12.603 10.5216 12.7913 10.7099L13.0913 10.9999H9.50127C9.23605 10.9999 8.9817 11.1053 8.79416 11.2928C8.60662 11.4803 8.50127 11.7347 8.50127 11.9999V13.9999C8.50127 14.2651 8.60662 14.5195 8.79416 14.707C8.9817 14.8945 9.23605 14.9999 9.50127 14.9999C9.76648 14.9999 10.0208 14.8945 10.2084 14.707C10.3959 14.5195 10.5013 14.2651 10.5013 13.9999V12.9999H13.0913L12.7913 13.2899C12.6975 13.3829 12.6231 13.4935 12.5724 13.6153C12.5216 13.7372 12.4955 13.8679 12.4955 13.9999C12.4955 14.1319 12.5216 14.2626 12.5724 14.3845C12.6231 14.5063 12.6975 14.6169 12.7913 14.7099C12.8842 14.8036 12.9948 14.878 13.1167 14.9288C13.2385 14.9796 13.3693 15.0057 13.5013 15.0057C13.6333 15.0057 13.764 14.9796 13.8858 14.9288C14.0077 14.878 14.1183 14.8036 14.2113 14.7099L16.2113 12.7099C16.305 12.6169 16.3794 12.5063 16.4302 12.3845C16.4809 12.2626 16.5071 12.1319 16.5071 11.9999C16.5071 11.8679 16.4809 11.7372 16.4302 11.6153C16.3794 11.4935 16.305 11.3829 16.2113 11.2899L14.2113 9.2899Z" fill="black"/>
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Row: Divider, Badge & Action */}
                                <div className="pt-3 border-t border-[#686868] flex justify-between items-center w-full">
                                    {/* Status Badge */}
                                    <div className={`px-3 py-1 rounded-[6px] flex items-center justify-center min-w-[80px] ${(booking.status === 'booked' || booking.status === 'confirmed' || booking.status === 'pending') ? 'bg-[#65B54E]/30 ' : 'bg-red-50'}`}>
                                        <span className={`text-[14px] font-semibold ${(booking.status === 'booked' || booking.status === 'confirmed' || booking.status === 'pending') ? 'text-[#009133]' : 'text-red-600'}`}>
                                            {(booking.status === 'booked' || booking.status === 'confirmed' || booking.status === 'pending') ? 'Booked' : booking.status || 'Booked'}
                                        </span>
                                    </div>

                                    {/* Action link */}
                                    <Link href={`/bookings/${booking.id}`} className="flex items-center gap-1 text-black">
                                        <span className="text-[15px] font-medium">View details</span>
                                        <span className="text-[18px]">›</span>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-zinc-50 rounded-[12px] border border-dashed border-zinc-300 w-full">
                            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                {activeTab === 'events' ? <Ticket size={32} className="text-zinc-400" /> : <PlayCircle size={32} className="text-zinc-400" />}
                            </div>
                            <p className="text-zinc-500 text-[18px]">No {activeTab} bookings found</p>
                            <p className="text-zinc-400 text-[14px] mt-1">Start exploring and make your first booking!</p>
                            <Link href={`/${activeTab}`} className="inline-block mt-6 text-black font-semibold border-b-2 border-black">
                                Browse {activeTab}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Chat with Support Box */}
                {/* <div className="mt-8 w-full max-w-[520px]">
                    <Link href="/chat-support" className="bg-white border-[0.5px] border-[#686868] rounded-[12px] p-4 md:p-6 flex items-center gap-4 md:gap-6 cursor-pointer hover:bg-zinc-50 transition-colors">
                        <div className="w-[36px] h-[36px] md:w-[48px] md:h-[48px] flex items-center justify-center bg-black rounded-full text-white shrink-0">
                            <MessageSquare size={18} className="md:w-6 md:h-6" />
                        </div>
                        <h3 className="text-[16px] md:text-[22px] font-semibold text-black">Chat with support</h3>
                    </Link>
                </div> */}
            </main>
        </div>
    );
}

export default function BookingsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <BookingsContent />
        </Suspense>
    );
}
