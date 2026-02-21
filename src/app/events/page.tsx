'use client';

import { useEffect, useState } from 'react';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import AppBanner from '@/components/layout/AppBanner';
import ExploreCard from '@/components/events/ExploreCard';
import ArtistAvatar from '@/components/events/ArtistAvatar';
import FilterButton from '@/components/events/FilterButton';
import Link from 'next/link';
import EventCard from '@/components/events/EventCard';
import FilterBar from '@/components/shared/FilterBar';
import { eventsApi, artistsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';

import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserPass } from '@/lib/passUtils';

export default function EventsPage() {
    const { location: storeLocation } = useStore();
    const [activeFilter, setActiveFilter] = useState('Today');
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [eventList, setEventList] = useState<any[]>([]);
    const [artistList, setArtistList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userHasActivePass, setUserHasActivePass] = useState(false);

    const eventCategories = [
        { id: 'sort', name: 'Sort By' },
        { id: 'type', name: 'Event Type' },
        { id: 'category', name: 'Category' },
    ];

    const eventOptions = {
        sort: ['Newest First', 'Price: Low to High', 'Price: High to Low', 'Distance'],
        type: ['Online', 'Offline', 'Hybrid'],
        category: ['Music', 'Comedy', 'Workshops', 'Concerts', 'Sports', 'Other']
    };

    const eventFilters = ['Today', 'Tomorrow', 'This Weekend', 'Music'];

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        setShowLeftArrow(container.scrollLeft > 20);
    };

    useEffect(() => {
        // Check if user has active pass
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userPass = await getUserPass(user.email || undefined, user.phoneNumber || undefined);
                setUserHasActivePass(userPass?.status === 'active' || false);
            } else {
                setUserHasActivePass(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            // Extract city from "Area, City" - empty = show all cities
            const cityOnly = storeLocation ? (storeLocation.includes(',') ? storeLocation.split(',').pop()?.trim() : storeLocation) : '';
            try {
                const [eventsRes, artistsRes] = await Promise.all([
                    eventsApi.getAll(20, '', '', cityOnly),
                    artistsApi.getAll()
                ]);

                if (eventsRes.success && eventsRes.data) {
                    let items = eventsRes.data.items || [];
                    // If city filter yielded nothing, fall back to all
                    if (items.length === 0 && cityOnly) {
                        const fallback = await eventsApi.getAll(20, '', '', '');
                        if (fallback.success && fallback.data) {
                            items = fallback.data.items || [];
                        }
                    }
                    setEventList(items);

                    // Extract unique artists from events to supplement the artistList
                    const artistsFromEvents = items.flatMap((e: any) => e.artists || []).map((a: any) => ({
                        id: `event-artist-${a.name}`,
                        name: a.name,
                        image_url: a.image_url
                    }));

                    if (artistsFromEvents.length > 0) {
                        setArtistList(prev => {
                            const combined = [...prev, ...artistsFromEvents];
                            // Remove duplicates by name
                            const unique = Array.from(new Map(combined.map(a => [a.name, a])).values());
                            return unique;
                        });
                    }
                }

                if (artistsRes.success && artistsRes.data) {
                    setArtistList(prev => {
                        const artistData = Array.isArray(artistsRes.data) ? artistsRes.data : [];
                        const combined = [...prev, ...artistData];
                        const unique = Array.from(new Map(combined.map(a => [a.name, a])).values());
                        return unique;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [storeLocation]); // Re-fetch when location changes

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50">
            <main className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 py-8 md:py-12 space-y-12 md:space-y-20">
                <section>
                    <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-6 md:mb-8 uppercase text-black tracking-normal text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>Explore Events</h2>
                    <ExploreCard />
                </section>

                {artistList.length > 0 && (
                    <section>
                        <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-6 md:mb-8 uppercase text-black tracking-normal text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>Artists</h2>
                        <div className="relative group">
                            <div
                                id="artists-container"
                                onScroll={handleScroll}
                                className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 overflow-x-auto py-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
                            >
                                {artistList.map((artist) => (
                                    <ArtistAvatar
                                        key={artist.id}
                                        id={artist.id}
                                        name={artist.name}
                                        image={artist.image_url || '/placeholder.jpg'}
                                    />
                                ))}
                            </div>

                            {showLeftArrow && (
                                <button
                                    onClick={() => {
                                        const container = document.getElementById('artists-container');
                                        if (container) {
                                            container.scrollBy({ left: -400, behavior: 'smooth' });
                                        }
                                    }}
                                    className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-200 hidden md:flex z-20 animate-in fade-in zoom-in duration-200"
                                    aria-label="Previous artists"
                                >
                                    <svg
                                        className="w-6 h-6 text-gray-700"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            {/* Next Button */}
                            <button
                                onClick={() => {
                                    const container = document.getElementById('artists-container');
                                    if (container) {
                                        container.scrollBy({ left: 400, behavior: 'smooth' });
                                    }
                                }}
                                className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-200 hidden md:flex z-20"
                                aria-label="Next artists"
                            >
                                <svg
                                    className="w-6 h-6 text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </section>
                )}

                <section>
                    <div className="mb-6">
                        <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-6 md:mb-8 uppercase text-black tracking-normal text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>All events</h2>
                        <FilterBar
                            filters={eventFilters}
                            categories={eventCategories}
                            options={eventOptions}
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                            {eventList.length > 0 ? (
                                eventList.map((event) => (
                                    <Link key={event.id} href={`/events/${event.id}`}>
                                        <EventCard
                                            id={event.id}
                                            name={event.title || event.name}
                                            location={event.venue?.city || event.location?.city || "Chennai"}
                                            date={event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "Coming Soon"}
                                            time={event.start_datetime ? new Date(event.start_datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "TBA"}
                                            ticketPrice={String(event.price_start || 0)}
                                            image={event.images?.hero || '/placeholder.jpg'}
                                            artists={event.artists}
                                        />
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center w-full py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 text-lg">No events found. Check back later!</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
            <BottomBanner />
            <Footer />
        </div>
    );
}
