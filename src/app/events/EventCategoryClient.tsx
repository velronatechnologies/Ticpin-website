'use client';

import { useState } from 'react';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import EventCard from '@/components/events/EventCard';
import Image from 'next/image';
import FilterBar from '@/components/play/FilterBar';
import { useMemo } from 'react';

import { getMinPrice } from '@/lib/utils';

interface RealEvent {
    id: string;
    name: string;
    city?: string;
    venue_name?: string;
    venue_address?: string;
    date?: string;
    time?: string;
    price_starts_from?: number;
    portrait_image_url?: string;
    landscape_image_url?: string;
    category?: string;
    ticket_categories?: Array<{ name: string; price?: number; capacity?: number }>;
    layout_json?: string;
}

export default function EventCategoryClient({
    events,
    categoryName,
    categoryImage,
    gradient
}: {
    events: RealEvent[],
    categoryName: string,
    categoryImage: string,
    gradient: string
}) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [modalFilters, setModalFilters] = useState<Record<string, string[]>>({});

    const filteredEvents = useMemo(() => {
        let result = [...events];
        
        // Chip filter (Today/Tomorrow)
        if (activeFilter === 'Today') {
            const today = new Date().toISOString().split('T')[0];
            result = result.filter(e => e.date?.startsWith(today));
        } else if (activeFilter === 'Tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            result = result.filter(e => e.date?.startsWith(tomorrowStr));
        }

        // Modal filters
        const selectedVenueTypes = modalFilters.venue_type ?? [];
        const selectedSort = (modalFilters.event_sort ?? [])[0] ?? '';

        if (selectedVenueTypes.length > 0) {
            result = result.filter(e => {
                const vType = (e as any).venue_type || '';
                return selectedVenueTypes.some(v => vType.toLowerCase().includes(v.toLowerCase()));
            });
        }

        // Sort
        if (selectedSort === 'Price : Low to High') {
            result.sort((a, b) => (a.price_starts_from ?? 0) - (b.price_starts_from ?? 0));
        } else if (selectedSort === 'Price : High to Low') {
            result.sort((a, b) => (b.price_starts_from ?? 0) - (a.price_starts_from ?? 0));
        } else if (selectedSort === 'Date : Soonest') {
            result.sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : Infinity;
                const dateB = b.date ? new Date(b.date).getTime() : Infinity;
                return dateA - dateB;
            });
        } else if (selectedSort === 'Name : A to Z') {
            result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }

        return result;
    }, [events, activeFilter, modalFilters]);

    const formatDate = (iso?: string) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-anek-latin)]">
            <main className="space-y-12 md:space-y-20">
                {/* Hero Banner Section */}
                <section className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden"
                    style={{ background: gradient }}>
                    <div className="flex items-center gap-8 md:gap-12 px-4">
                        <div className="relative w-[180px] h-[180px] md:w-[280px] md:h-[280px]">
                            <Image
                                src={categoryImage}
                                alt={categoryName}
                                fill
                                className="object-contain drop-shadow-xl"
                                priority
                            />
                        </div>
                        <div className="h-[60px] md:h-[100px] w-[2px] bg-black/20" />
                        <h1 className="text-4xl md:text-7xl font-semibold text-black uppercase">
                            {categoryName}
                        </h1>
                    </div>
                </section>

                <div className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 space-y-12 md:space-y-16 pb-12 md:pb-20">
                    {/* Filters Section */}
                    <FilterBar
                        filters={['All', 'Today', 'Tomorrow']}
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        type="events"
                        onApply={setModalFilters}
                        initialModalFilters={modalFilters}
                    />

                    {/* Events Grid */}
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-20 text-zinc-400 text-lg">No events found matching your criteria</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
                            {filteredEvents.map((event) => (
                                <EventCard
                                    key={event.id}
                                    id={event.id}
                                    name={event.name}
                                    venueName={event.venue_name ?? ''}
                                    venueAddress={event.venue_address ?? ''}
                                    location={event.city ?? ''}
                                    date={formatDate(event.date)}
                                    time={event.time ?? ''}
                                    ticketPrice={(() => {
                                        const minP = getMinPrice(event);
                                        return minP > 0 ? `₹${minP}` : '—';
                                    })()}
                                    image={event.portrait_image_url || event.landscape_image_url || '/events/events-1/ticpinbanner.jpg'}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <BottomBanner />
            <Footer />
        </div>
    );
}
