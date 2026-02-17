'use client';

import { useState, useEffect } from 'react';
import { playApi } from '@/lib/api';
import VenueCard from '@/components/play/VenueCard';
import FilterBar from '@/components/play/FilterBar';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';

export default function BadmintonPage() {
    const [venueList, setVenueList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const filters = ['Top rated'];

    useEffect(() => {
        const fetchVenues = async () => {
            setIsLoading(true);
            try {
                const response = await playApi.getAll(20, '', 'Badminton');
                if (response.success && response.data) {
                    setVenueList(response.data.items || []);
                }
            } catch (error) {
                console.error("Failed to fetch badminton venues:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVenues();
    }, []);

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-anek-latin)]">
            <main className="space-y-12 md:space-y-20">

                {/* Hero Banner Section */}
                <section className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5E6A3 100%)' }}>
                    <div className="flex items-center gap-8 md:gap-12 px-4">
                        <div className="relative">
                            <img
                                src="/play/playbm.png"
                                alt="Badminton"
                                className="w-[280px] md:w-[280px] h-auto object-contain drop-shadow-xl"
                            />
                        </div>
                        <div className="h-[60px] md:h-[100px] w-[2px] bg-black/20" />
                        <h1 className="text-4xl md:text-7xl font-semibold text-black leading-tight">
                            BADMINTON
                        </h1>
                    </div>
                </section>

                <div className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 space-y-12 md:space-y-16 pb-12 md:pb-20">
                    {/* Filters Section */}
                    <div className="flex items-center gap-4">
                        <FilterBar filters={filters} />
                    </div>

                    {/* All Venues Grid */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
                            {venueList.length > 0 ? (
                                venueList.map((venue) => (
                                    <VenueCard
                                        key={venue.id}
                                        id={venue.id}
                                        name={venue.name}
                                        location={venue.location?.venue_name || venue.location?.city || "Chennai"}
                                        image={venue.images?.hero || '/placeholder.jpg'}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 text-lg">No badminton venues available right now.</p>
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
