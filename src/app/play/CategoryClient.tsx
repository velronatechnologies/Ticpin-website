'use client';

import { useState } from 'react';
import VenueCard from '@/components/play/VenueCard';
import FilterBar from '@/components/play/FilterBar';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';

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
    price_starts_from?: number;
}

const filters = ['Top rated'];

const getVenueImage = (venue: RealPlay) =>
    venue.landscape_image_url || venue.portrait_image_url || venue.images?.[0] || venue.image;

const getVenueId = (venue: RealPlay) => venue.id || venue._id || venue.name;

export default function CategoryClient({
    venues,
    categoryName,
    categoryImage
}: {
    venues: RealPlay[],
    categoryName: string,
    categoryImage: string
}) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [modalFilters, setModalFilters] = useState<Record<string, string[]>>({});

    const selectedSports = modalFilters.sports ?? [];
    const selectedDimensions = modalFilters.dimension ?? [];
    const selectedSort = (modalFilters.play_sort ?? modalFilters.sort ?? [])[0] ?? '';

    let filteredVenues = venues
        .filter(v => activeFilter === 'All' || (activeFilter === 'Top rated' && (v.rating || 0) >= 4))
        .filter(v => {
            if (selectedSports.length > 0) {
                if (!selectedSports.some(s => v.category?.toLowerCase() === s.toLowerCase())) return false;
            }
            if (selectedDimensions.length > 0) {
                const vDim = (v.dimension || v.sub_category || '').toLowerCase().replace(/\s+/g, '');
                if (!selectedDimensions.some(d => {
                    const search = d.toLowerCase().replace(/\s+/g, '');
                    return vDim.includes(search) || search.includes(vDim);
                })) return false;
            }
            return true;
        });

    if (selectedSort === 'Rating : High to Low') {
        filteredVenues = [...filteredVenues].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (selectedSort === 'Price : Low to High') {
        filteredVenues = [...filteredVenues].sort((a, b) =>
            (a.price_starts_from ?? 0) - (b.price_starts_from ?? 0)
        );
    } else if (selectedSort === 'Price : High to Low') {
        filteredVenues = [...filteredVenues].sort((a, b) =>
            (b.price_starts_from ?? 0) - (a.price_starts_from ?? 0)
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white font-[family-name:var(--font-anek-latin)]">
            <main className="space-y-6 md:space-y-8">
                {/* Hero Banner Section */}
                <section className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5E6A3 100%)' }}>
                    <div className="flex items-center gap-8 md:gap-12 px-4">
                        <div className="relative w-[280px] h-[280px]">
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

                <div className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 space-y-6 md:space-y-8 pb-12 md:pb-20 pt-2">
                    {/* Filters Section */}
                    <div className="flex items-center gap-4">
                        <FilterBar
                            filters={['All', ...filters]}
                            activeFilter={activeFilter}
                            onFilterChange={setActiveFilter}
                            type="play"
                            onApply={setModalFilters}
                            initialModalFilters={modalFilters}
                        />
                    </div>

                    {/* All Venues Grid */}
                    {venues.length === 0 ? (
                        <div className="text-center py-20 text-zinc-400 text-lg">No {categoryName.toLowerCase()} venues found</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto">
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
                </div>
            </main>

            <BottomBanner />
            <Footer />
        </div>
    );
}
