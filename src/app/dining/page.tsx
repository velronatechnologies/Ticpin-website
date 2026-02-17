'use client';

import EventCard from '@/components/dining/Eventcard';
import CouponCard from '@/components/dining/CouponCard';
import Link from 'next/link';
import Image from 'next/image';
import AppBanner from '@/components/layout/AppBanner';
import { useState, useEffect } from 'react';
import FilterButton from '@/components/dining/FilterButton';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store/useStore';

import { diningCategories } from '@/data/diningData';
import { diningApi, offersApi } from '@/lib/api';

export default function DiningPage() {
    const { userId } = useAuth();
    const { location: storeLocation } = useStore();
    const [activeFilter, setActiveFilter] = useState('Filters');
    const [restaurantList, setRestaurantList] = useState<any[]>([]);
    const [offerList, setOfferList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffersLoading, setIsOffersLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await diningApi.getAll(20, '', '', storeLocation);
                if (response.success && response.data) {
                    setRestaurantList(response.data.items || []);
                }
            } catch (error) {
                console.error("Failed to fetch dining venues:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [storeLocation]);

    useEffect(() => {
        const fetchOffers = async () => {
            setIsOffersLoading(true);
            try {
                let response;
                if (userId) {
                    response = await offersApi.getByUserId(userId);
                } else {
                    response = await offersApi.getAll();
                }

                if (response.success && response.data) {
                    // Filter for active offers or user specific
                    setOfferList(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch offers:", error);
            } finally {
                setIsOffersLoading(false);
            }
        };
        fetchOffers();
    }, [userId]);

    return (
        <div className="min-h-screen bg-[#f8f4ff] font-sans text-sm md:text-base">
            <main className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 py-8 md:py-12 space-y-12 md:space-y-20">
                <section>
                    <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-6 md:mb-8 uppercase text-black tracking-normal text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>Explore Dining</h2>
                    <div className="flex flex-wrap gap-4 md:gap-6 pb-4">
                        {/* Premium Dining */}
                        <Link href="/dining/premium-dining" className="block flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                            <div
                                className="rounded-[30px] border border-[#686868] flex flex-col group overflow-hidden relative"
                                style={{
                                    background: 'linear-gradient(105.73deg, #866BFF -160.73%, #BDB1F3 93.19%)',
                                    width: '170px',
                                    height: '252px'
                                }}
                            >
                                <div className="px-[20px] pt-[20px] pb-1">
                                    <h3 className="text-xl md:text-2xl font-medium text-black whitespace-pre-line">
                                        Premium{"\n"}dining
                                    </h3>
                                </div>
                                <div className="flex-1 relative w-full flex items-end justify-end">
                                    <div style={{ width: '200px', height: '180px', marginRight: '-30px' }}>
                                        <Image
                                            src="/dining/diningimg1.png"
                                            alt="Premium dining"
                                            fill
                                            className="object-contain"
                                            style={{
                                                objectPosition: "bottom right",
                                                marginBottom: '-15px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Club & Chill */}
                        <Link href="/dining/club-chill" className="block flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                            <div
                                className="flex-shrink-0 rounded-[30px] border border-[#686868] flex flex-col group cursor-pointer overflow-hidden relative"
                                style={{
                                    background: 'linear-gradient(105.73deg, #866BFF -160.73%, #BDB1F3 93.19%)',
                                    width: '170px',
                                    height: '252px'
                                }}
                            >
                                <div className="px-[20px] pt-[20px] pb-1">
                                    <h3 className="text-xl md:text-2xl font-medium text-black whitespace-pre-line">
                                        Club &{"\n"}Chill
                                    </h3>
                                </div>
                                <div className="flex-1 relative w-full flex items-end justify-end">
                                    <div className="relative" style={{ width: '180px', height: '180px', marginRight: '-25px' }}>
                                        <Image
                                            src="/dining/diningimg2.png"
                                            alt="Club & Chill"
                                            fill
                                            className="object-contain"
                                            style={{
                                                objectPosition: "bottom right",
                                                marginBottom: '-15px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Pure Veg */}
                        <Link href="/dining/pure-veg" className="block flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                            <div
                                className="flex-shrink-0 rounded-[30px] border border-[#686868] flex flex-col group cursor-pointer overflow-hidden relative"
                                style={{
                                    background: 'linear-gradient(105.73deg, #866BFF -160.73%, #BDB1F3 93.19%)',
                                    width: '170px',
                                    height: '252px'
                                }}
                            >
                                <div className="px-[20px] pt-[20px] pb-1">
                                    <h3 className="text-xl md:text-2xl font-medium text-black whitespace-pre-line">
                                        Pure{"\n"}veg
                                    </h3>
                                </div>
                                <div className="flex-1 relative w-full flex items-end justify-end">
                                    <div className="relative" style={{ width: '180px', height: '180px', marginRight: '-25px' }}>
                                        <Image
                                            src="/dining/diningimg3.png"
                                            alt="Pure veg"
                                            fill
                                            className="object-contain"
                                            style={{
                                                objectPosition: "bottom right",
                                                marginBottom: '-15px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Cafe Vibes */}
                        <Link href="/dining/cafe-vibes" className="block flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                            <div
                                className="flex-shrink-0 rounded-[30px] border border-[#686868] flex flex-col group cursor-pointer overflow-hidden relative"
                                style={{
                                    background: 'linear-gradient(105.73deg, #866BFF -160.73%, #BDB1F3 93.19%)',
                                    width: '170px',
                                    height: '252px'
                                }}
                            >
                                <div className="px-[20px] pt-[20px] pb-1">
                                    <h3 className="text-xl md:text-2xl font-medium text-black whitespace-pre-line">
                                        Cafe{"\n"}vibes
                                    </h3>
                                </div>
                                <div className="flex-1 relative w-full flex items-end justify-end">
                                    <div className="relative" style={{ width: '180px', height: '180px', marginRight: '-25px' }}>
                                        <Image
                                            src="/dining/diningimg4.png"
                                            alt="Cafe vibes"
                                            fill
                                            className="object-contain"
                                            style={{
                                                objectPosition: "bottom right",
                                                marginBottom: '-15px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Family Favourites */}
                        <Link href="/dining/family-favourites" className="block flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                            <div
                                className="flex-shrink-0 rounded-[30px] border border-[#686868] flex flex-col group cursor-pointer overflow-hidden relative"
                                style={{
                                    background: 'linear-gradient(105.73deg, #866BFF -160.73%, #BDB1F3 93.19%)',
                                    width: '170px',
                                    height: '252px'
                                }}
                            >
                                <div className="px-[20px] pt-[20px] pb-1">
                                    <h3 className="text-xl md:text-2xl font-medium text-black whitespace-pre-line">
                                        Family{"\n"}favourites
                                    </h3>
                                </div>
                                <div className="flex-1 relative w-full flex items-end justify-end">
                                    <div className="relative" style={{ width: '180px', height: '180px', marginRight: '-25px' }}>
                                        <Image
                                            src="/dining/diningimg5.png"
                                            alt="Family favourites"
                                            fill
                                            className="object-contain"
                                            style={{
                                                objectPosition: "bottom right",
                                                marginBottom: '-15px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Bar & Bites */}
                        <Link href="/dining/bar-bites" className="block flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                            <div
                                className="flex-shrink-0 rounded-[30px] border border-[#686868] flex flex-col group cursor-pointer overflow-hidden relative"
                                style={{
                                    background: 'linear-gradient(105.73deg, #866BFF -160.73%, #BDB1F3 93.19%)',
                                    width: '170px',
                                    height: '252px'
                                }}
                            >
                                <div className="px-[20px] pt-[20px] pb-1">
                                    <h3 className="text-xl md:text-2xl font-medium text-black whitespace-pre-line">
                                        Bar &{"\n"}bites
                                    </h3>
                                </div>
                                <div className="flex-1 relative w-full flex items-end justify-end">
                                    <div className="relative" style={{ width: '180px', height: '180px', marginRight: '-25px' }}>
                                        <Image
                                            src="/dining/diningimg6.png"
                                            alt="Bar & bites"
                                            fill
                                            className="object-contain"
                                            style={{
                                                objectPosition: "bottom right",
                                                marginBottom: '-15px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                {(isOffersLoading || offerList.length > 0) && (
                    <section>
                        <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold tracking-normal mb-6 md:mb-8 uppercase text-black text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>Exclusive Offers</h2>
                        {isOffersLoading ? (
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-[300px] h-[120px] bg-zinc-200 animate-pulse rounded-2xl flex-shrink-0" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4">
                                {offerList.map((offer, i) => (
                                    <div key={i} className="flex-shrink-0">
                                        <CouponCard discount={offer.discount} code={offer.code} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section className="space-y-6 md:space-y-8">
                    <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold tracking-normal uppercase text-black text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>All Restaurants</h2>

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

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#866BFF]"></div>
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
                                            tag={res.offers?.[0]?.title || "Special Offer"}
                                            image={res.images?.hero || '/placeholder.jpg'}
                                            rating={res.rating || 4.5}
                                        />
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 text-lg">No restaurants available right now. Check back soon!</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* <div className="mt-20">
                    <AppBanner />
                </div> */}

            </main>
            <BottomBanner />
            <Footer />
        </div>
    );
}