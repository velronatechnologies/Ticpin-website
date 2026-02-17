'use client';

import { useEffect, useState } from 'react';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import AppBanner from '@/components/layout/AppBanner';
import ExploreCard from '@/components/events/ExploreCard';
import ArtistAvatar from '@/components/events/ArtistAvatar';
import FilterButton from '@/components/events/FilterButton';
import EventCard from '@/components/events/EventCard';
import { eventsApi, artistsApi } from '@/lib/api';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

export default function EventsPage() {
    const { location: storeLocation } = useStore();
    const [activeFilter, setActiveFilter] = useState('Today');
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [eventList, setEventList] = useState<any[]>([]);
    const [artistList, setArtistList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        setShowLeftArrow(container.scrollLeft > 20);
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [eventsRes, artistsRes] = await Promise.all([
                    eventsApi.getAll(20, '', '', storeLocation),
                    artistsApi.getAll()
                ]);

                if (eventsRes.success && eventsRes.data) {
                    setEventList(eventsRes.data.items || []);
                }

                if (artistsRes.success && artistsRes.data) {
                    setArtistList(artistsRes.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [storeLocation]);

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
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {['Filters', 'Today', 'Tomorrow', 'Music'].map((filter) => (
                                <FilterButton
                                    key={filter}
                                    label={filter}
                                    active={activeFilter === filter}
                                    onClick={() => setActiveFilter(filter)}
                                />
                            ))}
                        </div>
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
                                            name={event.title || event.name}
                                            location={event.venue?.city || event.location?.city || "Chennai"}
                                            date={event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "Coming Soon"}
                                            time={event.start_datetime ? new Date(event.start_datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "TBA"}
                                            ticketPrice={event.price_start || 0}
                                            image={event.images?.hero || '/placeholder.jpg'}
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
