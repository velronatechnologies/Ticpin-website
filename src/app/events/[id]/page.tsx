'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppBanner from '@/components/layout/AppBanner';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, MapPin, Calendar, Clock, Star, HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function EventDetailPage() {
    const router = useRouter();
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const galleryImages = [
        '/images.png',
        '/images.png',
        '/images.png',
        '/images.png',
    ];

    return (
        <div className="min-h-screen bg-[#f8f4ff] font-[family-name:var(--font-anek-latin)] text-sm md:text-base">
            <main className="mx-auto max-w-[1440px] px-4 md:px-14 py-4 md:py-8">
                <button
                    onClick={() => router.back()}
                    className="mb-4 md:mb-6 flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-xl border border-zinc-100 text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400 hover:text-primary hover:border-primary transition-all shadow-sm active:scale-95 group"
                >
                    <ArrowLeft size={14} className="md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Main Content Area */}
                    <div className="flex-1 space-y-8 md:space-y-12 order-2 lg:order-1">
                        {/* Hero Image */}
                        <div className="relative w-full h-[350px] md:h-[500px] rounded-[30px] overflow-hidden shadow-sm group">
                            <img src="/login/banner.jpeg" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Hero" />
                            <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
                        </div>

                        {/* About the Event */}
                        <section className="space-y-2">
                            <h2 className="text-2xl font-bold text-zinc-900">About the Event</h2>
                            <p className="text-base text-zinc-600 leading-relaxed line-clamp-3">
                                CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT
                            </p>
                            <button className="text-xl font-semibold text-zinc-700 flex items-center gap-1 hover:text-zinc-900">
                                Show more <ChevronDown size={16} />
                            </button>
                        </section>

                        {/* Event Overview */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-zinc-900">Event Overview</h2>
                                <a href="#" className="text-sm font-semibold text-zinc-900 hover:underline">See all &gt;</a>
                            </div>
                            <div className="flex gap-4 items-stretch">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="flex items-center justify-center flex-shrink-0 bg-white rounded-lg p-4">
                                        <div className="w-6 h-6 rounded-full border-2 border-purple-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-zinc-700 leading-tight">Language</span>
                                        <span className="text-sm font-semibold text-zinc-600 leading-tight">( DETAILS )</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="flex items-center justify-center flex-shrink-0 bg-white rounded-lg p-4">
                                        <svg width="23" height="27" viewBox="0 0 23 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.5 26C17.299 26 22 21.299 22 15.5C22 9.70101 17.299 5 11.5 5C5.70101 5 1 9.70101 1 15.5C1 21.299 5.70101 26 11.5 26Z" stroke="#686868" strokeWidth="2" strokeMiterlimit="10" />
                                            <path d="M12 16L17 11" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M8 1H15" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-zinc-700 leading-tight">Duration</span>
                                        <span className="text-sm font-semibold text-zinc-600 leading-tight">( DETAILS )</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="flex items-center justify-center flex-shrink-0 bg-white rounded-lg p-4">
                                        <svg width="25" height="16" viewBox="0 0 25 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M24.6622 5.13883C24.8487 5.13883 25 4.98962 25 4.80549V1.61946C25 0.726458 24.2636 0 23.3585 0H1.64126C0.736182 0 0 0.726458 0 1.61946V4.80554C0 4.98967 0.151318 5.13888 0.337842 5.13888C1.93687 5.13888 3.2376 6.4224 3.2376 7.99995C3.2376 9.5775 1.93682 10.861 0.337842 10.861C0.151318 10.861 0 11.0102 0 11.1944V14.3805C0 15.2735 0.736182 16 1.64126 16H23.3585C24.2636 16 25 15.2735 25 14.3805V11.1944C25 11.0102 24.8487 10.861 24.6622 10.861C23.0631 10.861 21.7624 9.5775 21.7624 7.99995C21.7624 6.4224 23.0631 5.13883 24.6622 5.13883ZM21.0867 7.99995C21.0867 9.83274 22.5106 11.3436 24.3243 11.5121V14.3806C24.3243 14.906 23.891 15.3334 23.3585 15.3334H8.5106V13.7783C8.5106 13.5942 8.35928 13.445 8.17275 13.445C7.98623 13.445 7.83491 13.5942 7.83491 13.7783V15.3333H1.64126C1.10879 15.3333 0.675684 14.9059 0.675684 14.3805V11.5121C2.48936 11.3436 3.91328 9.83274 3.91328 7.99995C3.91328 6.16716 2.48936 4.65634 0.675684 4.48781V1.61946C0.675684 1.0941 1.10874 0.666671 1.64126 0.666671H7.83496V2.22158C7.83496 2.40571 7.98628 2.55491 8.1728 2.55491C8.35933 2.55491 8.51064 2.40571 8.51064 2.22158V0.666671H23.3586C23.8911 0.666671 24.3244 1.0941 24.3244 1.61946V4.48781C22.5106 4.65634 21.0867 6.16716 21.0867 7.99995ZM8.5106 6.98443V9.01547C8.5106 9.1996 8.35928 9.34881 8.17275 9.34881C7.98623 9.34881 7.83491 9.1996 7.83491 9.01547V6.98443C7.83491 6.8003 7.98623 6.6511 8.17275 6.6511C8.35928 6.6511 8.5106 6.8003 8.5106 6.98443ZM8.5106 10.3813V12.4126C8.5106 12.5967 8.35928 12.7459 8.17275 12.7459C7.98623 12.7459 7.83491 12.5967 7.83491 12.4126V10.3813C7.83491 10.1972 7.98623 10.048 8.17275 10.048C8.35928 10.048 8.5106 10.1972 8.5106 10.3813ZM8.5106 3.58744V5.61857C8.5106 5.8027 8.35928 5.95191 8.17275 5.95191C7.98623 5.95191 7.83491 5.8027 7.83491 5.61857V3.58744C7.83491 3.40331 7.98623 3.2541 8.17275 3.2541C8.35928 3.2541 8.5106 3.40331 8.5106 3.58744ZM18.5045 3.87496C18.5045 4.05909 18.3532 4.20829 18.1667 4.20829H12.1982C12.0117 4.20829 11.8604 4.05909 11.8604 3.87496C11.8604 3.69083 12.0117 3.54162 12.1982 3.54162H18.1667C18.3532 3.54162 18.5045 3.69083 18.5045 3.87496ZM18.5045 6.62494C18.5045 6.80907 18.3532 6.95827 18.1667 6.95827H12.1982C12.0117 6.95827 11.8604 6.80907 11.8604 6.62494C11.8604 6.44081 12.0117 6.2916 12.1982 6.2916H18.1667C18.3532 6.2916 18.5045 6.44081 18.5045 6.62494ZM18.5045 9.37492C18.5045 9.55905 18.3532 9.70825 18.1667 9.70825H12.1982C12.0117 9.70825 11.8604 9.55905 11.8604 9.37492C11.8604 9.19079 12.0117 9.04158 12.1982 9.04158H18.1667C18.3532 9.04158 18.5045 9.19079 18.5045 9.37492ZM18.5045 12.1249C18.5045 12.309 18.3532 12.4582 18.1667 12.4582H12.1982C12.0117 12.4582 11.8604 12.309 11.8604 12.1249C11.8604 11.9408 12.0117 11.7916 12.1982 11.7916H18.1667C18.3532 11.7916 18.5045 11.9408 18.5045 12.1249Z" fill="#686868" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-zinc-700 leading-tight">Tickets Needed For</span>
                                        <span className="text-sm font-semibold text-zinc-600 leading-tight">( DETAILS )</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Artist Section */}
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-zinc-900">Artist</h2>
                            <div className="flex gap-4">
                                <div className="w-[169px] h-[169px] bg-zinc-200 rounded-lg flex-shrink-0" />
                                <div className="flex items-center">
                                    <span className="text-sm font-semibold text-zinc-700">[ARTIST NAME]</span>
                                </div>
                            </div>
                        </section>

                        {/* Gallery */}
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-zinc-900">Gallery</h2>
                            <div className="grid grid-cols-4 gap-3">
                                {galleryImages.map((src, i) => (
                                    <div key={i} className="w-[169px] h-[169px] rounded-lg overflow-hidden shadow-sm">
                                        <img src={src} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                                    </div>
                                ))}
                            </div>
                            <div className="relative w-full h-[300px] md:h-[450px] rounded-[30px] overflow-hidden shadow-sm mt-3 group">
                                <img src="/login/banner.jpeg" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Gallery Banner" />
                                <div className="absolute inset-0 bg-black/5" />
                            </div>
                        </section>

                        {/* Venue Location */}
                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-zinc-900">Venue</h2>
                            <div className="flex items-center justify-between px-4 py-4 border border-zinc-300 rounded-[20px] bg-white">
                                <div className="flex flex-col">
                                    <span className="text-xl  text-zinc-900">[Venue Name]</span>
                                    <span className="text-xl  text-zinc-600">[Venue Address]</span>
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
                                        <p>Find answers to common questions about this event here.</p>
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
                                    <h3 className="text-xl font-semibold text-black">Event Terms & Conditions</h3>
                                    <ChevronDown size={20} className={`transition-transform text-[#686868] ${activeFaq === 2 ? 'rotate-180' : ''}`} />
                                </div>
                                {activeFaq === 2 && (
                                    <div className="mt-4 text-[#686868] text-base font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p>Please review our terms and conditions before booking.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Booking Pass */}
                    <div className="w-full lg:w-[400px] order-1 lg:order-2">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div className="bg-white border border-[#686868]/30 rounded-[20px] overflow-hidden shadow-sm p-6 space-y-4">
                                <h3 className="text-2xl font-semibold text-black mt-[-10px]">Event Name</h3>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-xl text-[#686868] font-medium uppercase tracking-wide text-xs">Category</p>
                                        <p className="text-xl text-black font-semibold">Music Festival</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl text-[#686868] font-medium uppercase tracking-wide text-xs">Date / Time</p>
                                        <p className="text-xl text-black font-semibold">22nd June, 8:30 PM</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl text-[#686868] font-medium uppercase tracking-wide text-xs">Location</p>
                                        <p className="text-xl text-black font-semibold">[Venue Name]</p>
                                    </div>
                                </div>

                                <div className="pt-0  h-[43px] border-t border-black">
                                    <div className="flex items-center justify-between mt-1 gap-3">
                                        <div>
                                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Starting from</span>
                                            <span className="text-2xl font-black text-zinc-900 block font-semibold">₹2,999</span>
                                        </div>
                                        <button
                                            style={{
                                                width: '180px',
                                                height: '33px',
                                                padding: '8px 16px',
                                                letterSpacing: '0',
                                                fontFamily: 'var(--font-anek-tamil)',
                                                fontWeight: 500,
                                                fontSize: '24px',
                                                lineHeight: '200%'
                                            }}
                                            className="bg-black text-white uppercase rounded-[9px] hover:bg-zinc-800 transition-all whitespace-nowrap flex items-center justify-center"
                                        >
                                            BOOK TICKETS
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* App Banner */}
                <div className="mt-20">
                    <AppBanner
                        title="DOWNLOAD APP"
                        subtitle="Experience everything on mobile"
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
