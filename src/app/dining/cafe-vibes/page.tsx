'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { diningApi } from '@/lib/api';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import FilterButton from '@/components/dining/FilterButton';
import EventCard from '@/components/dining/Eventcard';

export default function CafeVibesPage() {
    const [activeFilter, setActiveFilter] = useState('Filters');
    const [restaurantList, setRestaurantList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurants = async () => {
            setIsLoading(true);
            try {
                const response = await diningApi.getAll(20, '', 'Cafe Vibes');
                if (response.success && response.data) {
                    setRestaurantList(response.data.items || []);
                }
            } catch (error) {
                console.error("Failed to fetch cafe vibes venues:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-anek-latin)]">
            <main className="space-y-12 md:space-y-20">

                {/* Hero Banner Section */}
                <section className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #E7E0FF 100%)' }}>
                    <div className="flex items-center gap-8 md:gap-12 px-4">
                        <div className="relative">
                            <Image
                                src="/dining/diningimg4.png"
                                alt="Cafe Vibes"
                                width={280}
                                height={280}
                                className="w-[180px] md:w-[280px] h-auto object-contain drop-shadow-xl"
                            />
                        </div>
                        <div className="h-[60px] md:h-[100px] w-[2px] bg-black/20" />
                        <h1 className="text-4xl md:text-7xl font-semibold text-black uppercase">
                            Cafe Vibes
                        </h1>
                    </div>
                </section>

                <div className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 space-y-12 md:space-y-16 pb-12 md:pb-20">
                    {/* Filters Section */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['Filters', 'Top rated', 'Pure Veg', 'Serves Alcohol', '50% OFF'].map((filter) => (
                            <FilterButton
                                key={filter}
                                label={filter}
                                active={activeFilter === filter}
                                onClick={() => setActiveFilter(filter)}
                            />
                        ))}
                    </div>

                    {/* Restaurants Grid */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {restaurantList.length > 0 ? (
                                restaurantList.map((res) => (
                                    <Link key={res.id} href={`/dining/venue/${res.id}`}>
                                        <EventCard
                                            variant="wide"
                                            title={res.name}
                                            location={res.location?.venue_name || res.location?.city || "Chennai"}
                                            date="Rating"
                                            tag={res.offers?.[0]?.title || "Flat 50% Off"}
                                            image={res.images?.hero || '/placeholder.jpg'}
                                            rating={res.rating || 4.5}
                                        />
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 text-lg">No restaurants available in this category right now.</p>
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
