'use client';


import SportCategoryCard from '@/components/play/SportCategoryCard';
import VenueCard from '@/components/play/VenueCard';
import FilterBar from '@/components/play/FilterBar';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import { useState, useEffect } from 'react';
import { playApi } from '@/lib/api';
import { useStore } from '@/store/useStore';


import { sportsCategories } from '@/data/playData';


const filters = ['Top Rated', 'Cricket', 'Pickleball', 'Badminton'];

export default function PlayPage() {
    const { location: storeLocation } = useStore();
    const [venueList, setVenueList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlay = async () => {
            setIsLoading(true);
            try {
                const response = await playApi.getAll(20, '', '', storeLocation);
                if (response.success && response.data) {
                    setVenueList(response.data.items || []);
                }
            } catch (error) {
                console.error("Failed to fetch play venues:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlay();
    }, [storeLocation]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white font-[family-name:var(--font-anek-latin)]">
            <main className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 py-8 md:py-12 space-y-12 md:space-y-20">

                {/* Explore Sports Section */}
                <section className="space-y-8 md:space-y-10">
                    <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-6 md:mb-8 uppercase text-black tracking-normal text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>Explore Sports</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 px-2 max-w-5xl">
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
                <section className="space-y-8 md:space-y-10">
                    <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-6 md:mb-8 uppercase text-black tracking-normal text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>All Sports Venues</h2>

                    {/* Filters */}
                    <div>
                        <FilterBar filters={filters} />
                    </div>

                    {/* Venues Grid */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl">
                            {venueList.length > 0 ? (
                                venueList.map((venue, i) => (
                                    <VenueCard
                                        key={i}
                                        id={venue.id}
                                        name={venue.name}
                                        location={venue.location?.venue_name || venue.location?.city || "Chennai"}
                                        image={venue.images?.hero || '/placeholder.jpg'}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 text-lg">No sports venues available right now. Check back soon!</p>
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
