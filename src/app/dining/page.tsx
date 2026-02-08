'use client';

import EventCard from '@/components/dining/Eventcard';
import CouponCard from '@/components/dining/CouponCard';
import Link from 'next/link';
import Image from 'next/image';
import AppBanner from '@/components/layout/AppBanner';
import { useState } from 'react';
import FilterButton from '@/components/dining/FilterButton';
import Footer from "@/components/layout/Footer";

const diningCategories = [
    { name: 'Premium\ndining', image: '/dining/diningimg1.png', align: 'center' },
    { name: 'Club &\nChill', image: '/dining/diningimg2.png', align: 'center' },
    { name: 'Pure\nveg', image: '/dining/diningimg3.png', align: 'center' },
    { name: 'Cafe\nvibes', image: '/dining/diningimg4.png', align: 'center' },
    { name: 'Family\nfavourites', image: '/dining/diningimg5.png', align: 'center' },
    { name: 'Bar &\nbites', image: '/dining/diningimg6.png', align: 'center' }
];
const offers = [
    { discount: '50%', code: 'DETAILS' },
    { discount: '30%', code: 'WELCOME' },
    { discount: '20%', code: 'OFFER20' },
    { discount: '50%', code: 'DETAILS' },
];

const restaurants = [
    { id: 1, title: 'The Grand Buffet', location: 'Downtown', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop', rating: 4.8 },
    { id: 2, title: 'Sushi Zen', location: 'Midtown', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=500&fit=crop', rating: 4.5 },
    { id: 3, title: 'Steakhouse Elite', location: 'Riverside', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=500&fit=crop', rating: 4.7 },
    { id: 4, title: 'Le Petit Cafe', location: 'Old Town', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=500&fit=crop', rating: 4.2 },
    { id: 5, title: 'Skyline Bar', location: 'Rooftop', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=500&fit=crop', rating: 4.6 },
    { id: 6, title: 'Spice Garden', location: 'Main Street', image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800&h=500&fit=crop', rating: 4.4 },
];

export default function DiningPage() {
    const [activeFilter, setActiveFilter] = useState('Filters');

    return (
        <div className="min-h-screen bg-[#f8f4ff] font-sans text-sm md:text-base">


            <main className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 py-8 md:py-12 space-y-12 md:space-y-20">
                <section>
                    <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-6 md:mb-8 uppercase text-black tracking-normal" style={{ fontSize: '30px', fontWeight: 600 }}>Explore Dining</h2>
                    <div className="flex flex-wrap gap-4 md:gap-6 pb-4">
                        {diningCategories.map((category, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 rounded-[30px] border border-[#686868] flex flex-col group cursor-pointer overflow-hidden relative"
                                style={{
                                    background: 'linear-gradient(105.73deg, #866BFF -160.73%, #BDB1F3 93.19%)',
                                    width: '170px',
                                    height: '252px'
                                }}
                            >
                                <div className="px-[20px] pt-[20px] pb-1">
                                    <h3 className="text-xl md:text-2xl font-medium text-black whitespace-pre-line">
                                        {category.name}
                                    </h3>
                                </div>
                                <div className={`flex-1 relative w-full flex items-end ${category.align === 'left' ? 'justify-start' : category.align === 'center' ? 'justify-center' : 'justify-end'}`}>
                                    <div className="relative" style={{ width: '180px', height: '180px' }}>
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            className="object-contain"
                                            style={{
                                                objectPosition: `bottom ${category.align}`,
                                                marginLeft: category.align === 'left' ? '-30px' : '0',
                                                marginRight: category.align === 'right' ? '-15px' : '0',
                                                marginBottom: '-10px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold tracking-normal mb-6 md:mb-8 uppercase text-black" style={{ fontSize: '30px', fontWeight: 600 }}>Offers for you</h2>
                    <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4">
                        {offers.map((offer, i) => (
                            <div key={i} className="flex-shrink-0">
                                <CouponCard discount={offer.discount} code={offer.code} />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-6 md:space-y-8">
                    <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold tracking-normal uppercase text-black" style={{ fontSize: '30px', fontWeight: 600 }}>All Restaurants</h2>

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {restaurants.map((res) => (
                            <Link key={res.id} href={`/dining/venue/${res.id}`}>
                                <EventCard
                                    variant="wide"
                                    title={res.title}
                                    location={res.location}
                                    date="Rating"
                                    tag="Flat 50% Off"
                                    image={res.image}
                                    rating={res.rating}
                                />
                            </Link>
                        ))}
                    </div>
                </section>

                <div className="mt-20">
                    <AppBanner />
                </div>
            </main>

            <Footer />
        </div>
    );
}