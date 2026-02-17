'use client';

import { useState, useEffect } from 'react';
import { eventsApi } from '@/lib/api';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import FilterButton from '@/components/events/FilterButton';
import Link from 'next/link';
import EventCard from '@/components/events/EventCard';

export default function SportsEventsPage() {
    const [activeFilter, setActiveFilter] = useState('Today');
    const [eventList, setEventList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const response = await eventsApi.getAll(20, '', 'Sports');
                if (response.success && response.data) {
                    setEventList(response.data.items || []);
                }
            } catch (error) {
                console.error("Failed to fetch sports events:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-anek-latin)]">
            <main className="space-y-12 md:space-y-20">

                {/* Hero Banner Section */}
                <section className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #D8B4FE 100%)' }}>
                    <div className="flex items-center gap-8 md:gap-12 px-4">
                        <div className="relative">
                            <img
                                src="/events/eventssports.png"
                                alt="Sports"
                                className="w-[180px] md:w-[280px] h-auto object-contain drop-shadow-xl"
                            />
                        </div>
                        <div className="h-[60px] md:h-[100px] w-[2px] bg-black/20" />
                        <h1 className="text-4xl md:text-7xl font-semibold text-black">
                            SPORTS
                        </h1>
                    </div>
                </section>

                <div className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 space-y-12 md:space-y-16 pb-12 md:pb-20">
                    {/* Filters Section */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {['Filters', 'Today', 'Tomorrow'].map((filter) => (
                            <FilterButton
                                key={filter}
                                label={filter}
                                active={activeFilter === filter}
                                onClick={() => setActiveFilter(filter)}
                            />
                        ))}
                    </div>

                    {/* Events Grid */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
                            {eventList.length > 0 ? (
                                eventList.map((event) => (
                                    <Link key={event.id} href={`/events/${event.id}`}>
                                        <EventCard
                                            id={event.id}
                                            name={event.name}
                                            location={event.location?.venue_name || event.location?.city || "Chennai"}
                                            date={event.dates?.[0]?.date || "Date TBA"}
                                            time={event.dates?.[0]?.show_time || "Time TBA"}
                                            ticketPrice={event.price_range?.min || 0}
                                            image={event.images?.hero || '/placeholder.jpg'}
                                        />
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 text-lg">No sports events available right now.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <BottomBanner />
            <Footer />
        </div>
    );
}
