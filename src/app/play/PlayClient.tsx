'use client';

import { useState, useEffect } from 'react';
import { useLocation } from '@/lib/useLocation';
import SportCategoryCard from '@/components/play/SportCategoryCard';
import VenueCard from '@/components/play/VenueCard';
import FilterBar from '@/components/play/FilterBar';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import MobilePlay from '@/components/mobile/MobilePlay';
import { useIsMobile } from '@/hooks/use-mobile';

interface RealPlay {
    _id?: string;
    id?: string;
    name: string;
    city?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    image?: string;
    images?: string[];
    category?: string;
    sub_category?: string;
    dimension?: string;
    rating?: number;
    status?: string;
    price_starts_from?: number;
}

const sportsCategories = [
    { name: 'CRICKET', image: '/play/playck.png', href: '/play/cricket' },
    { name: 'FOOTBALL', image: '/play/playfb.png', href: '/play/football' },
    { name: 'PICKLEBALL', image: '/play/playpb.png', href: '/play/pickleball' },
    { name: 'TENNIS', image: '/play/playtens.png', href: '/play/tennis' },
    { name: 'BADMINTON', image: '/play/playbm.png', href: '/play/badminton' },
    { name: 'TABLE TENNIS', image: '/play/playtt.png', href: '/play/table-tennis' },
    { name: 'BASKETBALL', image: '/play/playbb.png', href: '/play/basketball' },
    { name: 'VOLLEYBALL', image: '/play/playbb.png', href: '/play/volleyball' },
];

const filters = ['All', 'Top Rated', 'Cricket', 'Pickleball', 'Badminton', 'Football', 'Tennis', 'Basketball', 'Table Tennis', 'Volleyball'];

const getVenueImage = (venue: RealPlay) =>
    venue.landscape_image_url || venue.portrait_image_url || venue.images?.[0] || venue.image;

const getVenueId = (venue: RealPlay) => venue.id || venue._id || venue.name;

export default function PlayClient({ initialVenues }: { initialVenues: RealPlay[] }) {
    const [venues, setVenues] = useState<RealPlay[]>(initialVenues);
    const [activeFilter, setActiveFilter] = useState('All');
    const [modalFilters, setModalFilters] = useState<Record<string, string[]>>({});
    const [mounted, setMounted] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        setMounted(true);
    }, []);

    const selectedSports = modalFilters.sports ?? [];
    const selectedDimensions = modalFilters.dimension ?? [];
    const selectedSort = (modalFilters.play_sort ?? modalFilters.sort ?? [])[0] ?? '';
    const selectedLocation = useLocation();
    const cityFilter = selectedLocation ? selectedLocation.split(',')[0].trim().toLowerCase() : '';

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        if (filter === 'All') {
            setModalFilters(prev => ({ ...prev, sports: [] }));
        } else if (filter === 'Top Rated') {
            // Keep existing sports filters if any
        } else {
            setModalFilters(prev => ({ ...prev, sports: [filter] }));
        }
    };

    let filteredVenues = venues.filter(v => {
        // Filter by city - only after mount to avoid hydration mismatch
        if (mounted && cityFilter) {
            const vCity = (v.city || '').toLowerCase();
            if (!vCity.includes(cityFilter) && !cityFilter.includes(vCity)) return false;
        }

        // 1. Category Filter (Chip OR Modal)
        // If modal has sports selected, it takes precedence or is combined.
        // Let's make them work together: if activeFilter is set and not 'All', it must match.
        if (activeFilter !== 'All') {
            if (activeFilter === 'Top Rated') {
                if ((v.rating || 0) < 4) return false;
            } else {
                if (v.category?.toLowerCase() !== activeFilter.toLowerCase()) return false;
            }
        }

        // 2. Modal → Sports multi-select (if not already filtered by chip)
        if (selectedSports.length > 0 && activeFilter === 'All') {
            if (!selectedSports.some(s => v.category?.toLowerCase() === s.toLowerCase())) return false;
        }

        // 3. Modal → Dimension multi-select
        if (selectedDimensions.length > 0) {
            const vDim = (v.dimension || v.sub_category || '').toLowerCase().replace(/\s+/g, '');
            if (!selectedDimensions.some(d => {
                const search = d.toLowerCase().replace(/\s+/g, '');
                return vDim.includes(search) || search.includes(vDim);
            })) return false;
        }
        return true;
    });

    // Sort logic
    if (selectedSort === 'Rating : High to Low') {
        filteredVenues = [...filteredVenues].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (selectedSort === 'Price : Low to High') {
        filteredVenues = [...filteredVenues].sort((a, b) =>
            (a.price_starts_from ?? 999999) - (b.price_starts_from ?? 999999)
        );
    } else if (selectedSort === 'Price : High to Low') {
        filteredVenues = [...filteredVenues].sort((a, b) =>
            (b.price_starts_from ?? 0) - (a.price_starts_from ?? 0)
        );
    } else if (selectedSort === 'Distance : Near to Far') {
        filteredVenues = [...filteredVenues].sort((a, b) => (a.city || '').localeCompare(b.city || ''));
    } else if (selectedSort.toLowerCase().includes('dimension')) {
        filteredVenues = [...filteredVenues].sort((a, b) => {
            const vDimA = ((a as any).dimension || (a as any).sub_category || '').toLowerCase();
            const vDimB = ((b as any).dimension || (b as any).sub_category || '').toLowerCase();
            return vDimA.localeCompare(vDimB);
        });
    }

    // Mobile view - only after mount to prevent hydration mismatch
    if (isMobile) {
        return <MobilePlay venues={venues} />;
    }

    return (
        <div className="hidden md:block min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white font-[family-name:var(--font-anek-latin)]">
            <main className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 pt-2 pb-6 md:pt-3 md:pb-8 space-y-4 md:space-y-6">
                {/* Explore Sports Section */}
                <section className='pt-[20px] pb-[20px]'>
                    <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-2 md:mb-3 uppercase text-black tracking-normal text-[20px] md:text-[24px]" style={{ fontWeight: 600 }}>Explore Sports</h2>
                    <div className="flex flex-wrap gap-4 md:gap-5 px-1 max-w-[1280px]">
                        {sportsCategories.map((sport, i) => (
                            <SportCategoryCard
                                key={i}
                                name={sport.name}
                                image={sport.image}
                                href={sport.href}
                            />
                        ))}
                    </div>
                </section>

                {/* All Sports Venues Section */}
                <section className="space-y-2.5 md:space-y-3">
                    <h2 className=" pb-2 font-[family-name:var(--font-anek-latin)] font-semibold uppercase text-black tracking-normal text-[20px] md:text-[24px]" style={{ fontWeight: 600 }}>All Sports Venues</h2>

                    {/* Filters */}
                    <div>
                        <FilterBar
                            filters={filters}
                            activeFilter={activeFilter}
                            onFilterChange={handleFilterChange}
                            type="play"
                            onApply={setModalFilters}
                            initialModalFilters={modalFilters}
                        />
                    </div>

                    {/* Venues Grid */}
                    {filteredVenues.length === 0 ? (
                        <div className="text-center py-20 text-zinc-400">
                            No sports venues found for "{activeFilter}"
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto pt-1 mt-[30px]">
                            {filteredVenues.map((venue) => (
                                <VenueCard
                                    key={getVenueId(venue)}
                                    id={getVenueId(venue)}
                                    name={venue.name}
                                    location={venue.city ?? ''}
                                    image={getVenueImage(venue)}
                                    priceStartsFrom={venue.price_starts_from}
                                    category={venue.category}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <BottomBanner />
            <Footer />
        </div>
    );
}
