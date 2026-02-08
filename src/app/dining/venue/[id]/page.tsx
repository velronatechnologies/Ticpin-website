'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Star, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import BookingCard from '@/components/dining/venue/BookingCard';
import CouponCard from '@/components/dining/CouponCard';
import AppBanner from '@/components/layout/AppBanner';

const restaurants = [
    { id: 1, title: 'The Grand Buffet', location: 'Downtown', image: '/login/banner.jpeg', rating: 4.8 },
    { id: 2, title: 'Sushi Zen', location: 'Midtown', image: '/login/banner.jpeg', rating: 4.5 },
    { id: 3, title: 'Steakhouse Elite', location: 'Riverside', image: '/login/banner.jpeg', rating: 4.7 },
    { id: 4, title: 'Le Petit Cafe', location: 'Old Town', image: '/login/banner.jpeg', rating: 4.2 },
    { id: 5, title: 'Skyline Bar', location: 'Rooftop', image: '/login/banner.jpeg', rating: 4.6 },
    { id: 6, title: 'Spice Garden', location: 'Main Street', image: '/login/banner.jpeg', rating: 4.4 },
];

export default function DiningVenueDetail() {
    const router = useRouter();
    const params = useParams();
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const venueId = Number(params.id);
    const venue = restaurants.find(r => r.id === venueId) || restaurants[0];

    const smallImages = [
        '/images.png',
        '/images.png',
        '/images.png',
        '/images.png',
    ];

    return (
        <div className="min-h-screen bg-[#f8f4ff] font-sans text-sm md:text-base selection:bg-primary selection:text-white">
            <main className="mx-auto max-w-[1440px] px-4 md:px-14 py-4 md:py-8">
                <button
                    onClick={() => router.back()}
                    className="mb-4 md:mb-6 flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-xl border border-zinc-100 text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400 hover:text-primary hover:border-primary transition-all shadow-sm active:scale-95 group"
                >
                    <ArrowLeft size={14} className="md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left Column */}
                    <div className="flex-1 space-y-10 md:space-y-12">
                        {/* Hero Image */}
                        <div className="relative w-full h-[350px] md:h-[500px] rounded-[30px] overflow-hidden shadow-sm group">
                            <img src={venue.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 font-[family-name:var(--font-anek-latin)]" alt={venue.title} />
                            <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
                        </div>
                        {/* Restaurant Info */}
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 font-[family-name:var(--font-anek-latin)]">{venue.title}</h1>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-1.5 py-0.5 text-white text-[8px] md:text-[10px] font-black rounded uppercase shadow-sm" style={{ background: 'rgba(41, 129, 3, 1)' }}>
                                    {venue.rating} <Star size={10} className="fill-white" />
                                </div>
                                <span className="text-xs text-zinc-500">|</span>
                                <span className="text-xs font-semibold text-green-600">Open</span>
                                <span className="text-xs text-zinc-500">{'{'} Time {'}'}</span>
                            </div>
                            <p className="text-xs text-zinc-500 font-[family-name:var(--font-anek-latin)]">{'{'} Location {'}'}</p>
                            <div className="flex items-center gap-3 font-[family-name:var(--font-anek-latin)]">
                                <button className="flex items-center gap-1.5 px-4 py-1.5 border border-zinc-300 rounded-full text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-all">
                                    <MapPin size={12} /> Directions
                                </button>
                                <button className="flex items-center gap-1.5 px-4 py-1.5 border border-zinc-300 rounded-full text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-all">
                                    📞 Call
                                </button>
                            </div>
                            <hr className="border-zinc-200 mt-2" />
                        </div>

                        {/* Offers */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-zinc-900">Offers</h2>
                                <a href="#" className="text-sm font-semibold text-zinc-900 hover:underline">See all &gt;</a>
                            </div>
                            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                                <CouponCard discount="30%" code="{ TIME }" />
                                <CouponCard discount="30%" code="{ TIME }" />
                                <CouponCard discount="30%" code="{ TIME }" />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-zinc-900">Menu</h2>
                            <div className="grid grid-cols-2 gap-4 w-fit md:gap-x-12">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-[200px] h-[260px] rounded-[20px] overflow-hidden border border-[#686868]/30 shadow-sm hover:translate-y-[-4px] hover:shadow-lg transition-all cursor-pointer">
                                        <img src="/images.png" className="w-full h-full object-cover" alt={`Menu Item ${i}`} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Facilities */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-bold italic text-zinc-900">Available facilites</h2>
                            <div className="grid grid-cols-4 gap-x-4 gap-y-1">
                                {['{ ALL DATA }', '{ ALL DATA }', '{ ALL DATA }', '{ ALL DATA }', '{ ALL DATA }', '{ ALL DATA }', '{ ALL DATA }', '{ ALL DATA }'].map((item, i) => (
                                    <span key={i} className="text-xs font-medium text-zinc-600">{item}</span>
                                ))}
                            </div>
                        </section>

                        {/* Gallery */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-black">Gallery</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {smallImages.map((src, i) => (
                                    <div key={i} className="aspect-square rounded-[20px] overflow-hidden border border-zinc-200">
                                        <img src={src} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Venue Location */}
                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-zinc-900">Venue</h2>
                            <div className="flex items-center justify-between px-4 py-4 border border-[#686868]/30 rounded-[20px] bg-white">
                                <div className="flex flex-col">
                                    <span className="text-xl text-zinc-900">{'{'} Venue Name {'}'}</span>
                                    <span className="text-xl text-zinc-600">{'{'} Venue Address{'}'}</span>
                                </div>
                                <button className="px-6 py-2 border border-[#686868]/40 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors">
                                    <MapPin size={18} /> Get Directions
                                </button>
                            </div>
                        </section>

                        {/* FAQ Section */}
                        <section className="space-y-3">
                            <div
                                onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
                                className={`w-full flex flex-col p-6 bg-white border border-[#686868]/30 rounded-[20px] cursor-pointer transition-all ${activeFaq === 1 ? 'ring-1 ring-zinc-900' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-black">Frequently Asked Questions</h3>
                                    <ChevronDown size={20} className={`transition-transform text-[#686868] ${activeFaq === 1 ? 'rotate-180' : ''}`} />
                                </div>
                                {activeFaq === 1 && (
                                    <div className="mt-4 text-[#686868] text-base font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p>Find answers to common questions about this venue.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Terms Section */}
                        <section className="space-y-3">
                            <div
                                onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
                                className={`w-full flex flex-col p-6 bg-white border border-[#686868]/30 rounded-[20px] cursor-pointer transition-all ${activeFaq === 2 ? 'ring-1 ring-zinc-900' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-black">Venue Terms & Conditions</h3>
                                    <ChevronDown size={20} className={`transition-transform text-[#686868] ${activeFaq === 2 ? 'rotate-180' : ''}`} />
                                </div>
                                {activeFaq === 2 && (
                                    <div className="mt-4 text-[#686868] text-base font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p>Please review our terms and conditions before dining.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column / Booking Card */}
                    <div className="w-full lg:w-[400px] lg:relative">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <BookingCard />
                        </div>
                    </div>
                </div>

                <div className="mt-20">
                    <AppBanner />
                </div>
            </main>
            <Footer />
        </div>
    );
}
