'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocation } from '@/lib/useLocation';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import ExploreCard from '@/components/events/ExploreCard';
import { useEventStore } from '@/store/useEventStore';
import FilterBar from '@/components/play/FilterBar';
import ArtistsSection from './ArtistsSection';
import EventsGrid from './EventsGrid';
import MobileEvents from '@/components/mobile/MobileEvents';
import { useIsMobile } from '@/hooks/use-mobile';

interface EventArtist {
    name: string;
    image_url?: string;
}

interface RealEvent {
    id: string;
    name: string;
    city?: string;
    date?: string;
    time?: string;
    price_starts_from?: number;
    portrait_image_url?: string;
    landscape_image_url?: string;
    category?: string;
    venue_type?: string;
    artists?: EventArtist[];
    status?: string;
}

export default function EventsClient({ initialEvents }: { initialEvents: RealEvent[] }) {
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams.get('category');
    const {
        activeFilter,
        modalFilters,
        setActiveFilter,
        setModalFilters
    } = useEventStore();

    const [events] = useState<RealEvent[]>(initialEvents);
    const selectedLocation = useLocation();
    const [mounted, setMounted] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle category from URL query param
    useEffect(() => {
        if (categoryFromUrl) {
            // Convert URL format (e.g., "food-drinks") to category name (e.g., "Food & Drinks")
            const categoryMap: Record<string, string> = {
                'music': 'Music',
                'comedy': 'Comedy',
                'shows': 'Shows',
                'sports': 'Sports',
                'food-drinks': 'Food & Drinks',
                'night-life': 'Night Life',
                'fests-fairs': 'Fests & Fairs',
                'screenings': 'Screenings',
                'fitness': 'Fitness',
                'open-mic': 'Open Mic'
            };
            const mappedCategory = categoryMap[categoryFromUrl] || categoryFromUrl;
            setActiveFilter(mappedCategory);
        }
    }, [categoryFromUrl, setActiveFilter]);

    // Memoized artists extraction
    const allArtists = useMemo(() => {
        const artistsMap = new Map<string, { name: string; image: string }>();
        events.forEach(ev => {
            (ev.artists ?? []).forEach(a => {
                if (a.name && !artistsMap.has(a.name)) {
                    artistsMap.set(a.name, { name: a.name, image: a.image_url ?? '' });
                }
            });
        });
        return Array.from(artistsMap.values());
    }, [events]);

    // Memoized category filters
    const categoryFilters = useMemo(() => {
        return ['Filters', 'All', ...Array.from(new Set(events.map(e => e.category).filter(Boolean) as string[]))];
    }, [events]);

    // Memoized filtered and sorted events
    const filteredEvents = useMemo(() => {
        const selectedEventCategories = modalFilters.event_category ?? [];
        const selectedVenueTypes = modalFilters.venue_type ?? [];
        const selectedSort = (modalFilters.event_sort ?? [])[0] ?? '';
        const cityFilter = mounted && selectedLocation ? selectedLocation.split(',')[0].trim().toLowerCase() : '';

        let result = activeFilter === 'All'
            ? events
            : events.filter(e => e.category === activeFilter);

        // Partition by selected city (selected city events first, then others)
        if (cityFilter) {
            const matching = result.filter(e => {
                const eventCity = e.city?.toLowerCase() || '';
                return eventCity.includes(cityFilter) || cityFilter.includes(eventCity);
            });
            const nonMatching = result.filter(e => {
                const eventCity = e.city?.toLowerCase() || '';
                return !(eventCity.includes(cityFilter) || cityFilter.includes(eventCity));
            });
            result = [...matching, ...nonMatching];
        }

        result = result.filter(e => {
            if (selectedEventCategories.length > 0) {
                if (!selectedEventCategories.some(c => e.category?.toLowerCase().includes(c.toLowerCase()))) return false;
            }
            if (selectedVenueTypes.length > 0) {
                if (!selectedVenueTypes.some(v => e.venue_type?.toLowerCase().includes(v.toLowerCase()))) return false;
            }
            return true;
        });

        // Sort
        if (selectedSort === 'Rating : High to Low') {
            result = [...result].sort((a, b) => {
                const aAny = a as any;
                const bAny = b as any;
                return (bAny.rating ?? 0) - (aAny.rating ?? 0);
            });
        } else if (selectedSort === 'Price : Low to High') {
            result = [...result].sort((a, b) => (a.price_starts_from ?? 0) - (b.price_starts_from ?? 0));
        } else if (selectedSort === 'Price : High to Low') {
            result = [...result].sort((a, b) => (b.price_starts_from ?? 0) - (a.price_starts_from ?? 0));
        } else if (selectedSort === 'Date : Soonest') {
            result = [...result].sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : Infinity;
                const dateB = b.date ? new Date(b.date).getTime() : Infinity;
                return dateA - dateB;
            });
        } else if (selectedSort === 'Name : A to Z') {
            result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }

        return result;
    }, [events, activeFilter, modalFilters, selectedLocation, mounted]);

    if (isMobile) {
        return <MobileEvents events={events} />;
    }

    return (
        <div className="min-h-screen bg-white">
            <main className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 pt-2 pb-6 md:pt-3 md:pb-8 space-y-4 md:space-y-6">
                <section className="pt-[20px] pb-[20px]">
                    <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-2 md:mb-3 uppercase text-black tracking-normal text-[20px] md:text-[24px]" style={{ fontWeight: 600 }}>Explore Events</h2>
                    <ExploreCard />
                </section>

                {/* Artists Section */}
                <ArtistsSection artists={allArtists} />

                {/* All Events Section */}
                <section className="space-y-2.5 md:space-y-3">
                    <div className="space-y-2.5 md:space-y-3">
                        <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold uppercase text-black tracking-normal text-[20px] md:text-[24px]" style={{ fontWeight: 600 }}>All events</h2>
                        <FilterBar
                            filters={categoryFilters.filter(f => f !== 'Filters')}
                            activeFilter={activeFilter}
                            onFilterChange={setActiveFilter}
                            type="events"
                            onApply={setModalFilters}
                            initialModalFilters={modalFilters}
                        />
                    </div>

                    <EventsGrid events={filteredEvents} />
                </section>
            </main>
            <BottomBanner />
            <Footer />
        </div>
    );
}
