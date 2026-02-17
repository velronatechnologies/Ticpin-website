'use client';

import { Plus, Calendar, MapPin, Tag, User, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AfterApprovalDashboardProps {
    category?: string | null;
}

export default function AfterApprovalDashboard({ category }: AfterApprovalDashboardProps) {
    const { token, isAdmin } = useStore();
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isPlay = category === 'play';
    const isDining = category === 'dining';
    const label = isAdmin ? 'all listings' : (isPlay ? 'venues' : isDining ? 'outlets' : 'events');

    const getCreateUrl = (type: 'event' | 'play' | 'dining', id?: string) => {
        let base = `/list-your-events/dashboard/create`;
        if (type === 'play') base = `/list-your-events/dashboard/create-play`;
        if (type === 'dining') base = `/list-your-events/dashboard/create-dining`;

        let url = base;
        if (id) {
            url += `?id=${id}`;
            url += `&category=${type}`;
        } else {
            url += `?category=${type}`;
        }
        return url;
    };

    const [cursor, setCursor] = useState<string | null>(null);

    const fetchEvents = async (nextCursor?: string) => {
        try {
            // Use specific endpoint or fallback to events
            const fetchUrl = isPlay ? '/api/v1/play/organizer/my' : isDining ? '/api/v1/dining/organizer/my' : '/api/v1/events/organizer/my';

            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}${fetchUrl}`);
            if (nextCursor) url.searchParams.append('cursor', nextCursor);
            url.searchParams.append('limit', '12');

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 200 || data.success) {
                const fetchedItems = data.data?.items || data.data || [];
                const fetchedCursor = data.data?.cursor || null;

                if (nextCursor) {
                    setEvents(prev => [...prev, ...fetchedItems]);
                } else {
                    setEvents(fetchedItems);
                }
                setCursor(fetchedCursor);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchEvents();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#F8F7FF] font-[family-name:var(--font-anek-latin)]">
            {/* Main Content Area */}
            <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-16 pt-12 pb-24">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-[32px] md:text-[36px] font-medium text-black leading-tight uppercase tracking-tight">Your {label}</h1>
                        <p className="text-[18px] text-[#686868] font-medium mt-1">An overview of your dashboard</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {isAdmin ? (
                            <>
                                <button
                                    onClick={() => router.push(getCreateUrl('play'))}
                                    className="bg-[#F9C333] text-black px-5 py-4 rounded-[12px] flex items-center justify-center gap-2 text-[15px] font-bold transition-all hover:opacity-90 active:scale-95 leading-none shadow-lg border-b-4 border-black/10"
                                >
                                    <Plus size={18} /> Create Turf
                                </button>
                                <button
                                    onClick={() => router.push(getCreateUrl('dining'))}
                                    className="bg-[#FF6B6B] text-white px-5 py-4 rounded-[12px] flex items-center justify-center gap-2 text-[15px] font-bold transition-all hover:opacity-90 active:scale-95 leading-none shadow-lg border-b-4 border-black/10"
                                >
                                    <Plus size={18} /> Create Dining
                                </button>
                                <button
                                    onClick={() => router.push(getCreateUrl('event'))}
                                    className="bg-black text-white px-5 py-4 rounded-[12px] flex items-center justify-center gap-2 text-[15px] font-bold transition-all hover:opacity-90 active:scale-95 leading-none shadow-lg border-b-4 border-white/10"
                                >
                                    <Plus size={18} /> Create Event
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => router.push(getCreateUrl(category as any || 'event'))}
                                className="bg-black text-white px-6 py-4 rounded-[12px] flex items-center justify-center gap-2 text-[16px] font-medium transition-all hover:opacity-90 active:scale-95 leading-none shadow-lg"
                            >
                                <Plus size={18} />
                                Create {isPlay ? 'Venue' : isDining ? 'Outlet' : 'Event'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 text-zinc-400">Loading {label}...</div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((item) => (
                            <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="aspect-video relative overflow-hidden">
                                    <Image
                                        src={item.images?.hero || '/placeholder.jpg'}
                                        alt={item.title || item.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase text-black">
                                        {item.status}
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                        <Tag size={14} />
                                        {item.category || category || (isPlay ? 'Sports' : isDining ? 'Dining' : 'General')}
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 line-clamp-1">{item.title || item.name}</h3>
                                    <div className="space-y-2">
                                        {item.start_datetime && (
                                            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                                <Calendar size={16} />
                                                {new Date(item.start_datetime).toLocaleDateString()}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                            <MapPin size={16} />
                                            {item.venue?.name || item.location?.venue_name || item.location?.name || 'Location N/A'}, {item.venue?.city || item.location?.city || ''}
                                        </div>
                                    </div>
                                    <div className="pt-4 flex items-center justify-between border-t gap-4">
                                        <div>
                                            <p className="text-zinc-400 text-xs font-bold uppercase">{isPlay ? 'Slots from' : isDining ? 'Avg Price' : 'Price from'}</p>
                                            <p className="text-lg font-bold text-[#5331EA]">₹{item.price_start || (item.play_options?.[0]?.price_per_slot) || 0}</p>
                                        </div>
                                        <button
                                            onClick={() => router.push(getCreateUrl(item.type || (isPlay ? 'play' : isDining ? 'dining' : 'event'), item.id))}
                                            className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                                        >
                                            <Edit size={14} />
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {cursor && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center pt-8">
                                <button
                                    onClick={() => fetchEvents(cursor)}
                                    className="px-8 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-600 font-bold hover:bg-zinc-50 transition-colors shadow-sm"
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-zinc-300">
                        <p className="text-zinc-500 text-lg mb-6 font-medium">No {label} found. Start by creating your first listing!</p>
                        <div className="flex items-center justify-center gap-4">
                            {isAdmin ? (
                                <p className="text-zinc-400">Use the buttons above to create test listings</p>
                            ) : (
                                <button
                                    onClick={() => router.push(getCreateUrl(category as any || 'event'))}
                                    className="text-[#5331EA] font-bold flex items-center gap-2 hover:underline"
                                >
                                    <Plus size={18} /> Create {isPlay ? 'Venue' : isDining ? 'Outlet' : 'Event'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
