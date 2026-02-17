'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppBanner from '@/components/layout/AppBanner';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import AuthModal from '@/components/modals/AuthModal';
import { ChevronDown, MapPin, Clock, Share2, CheckCircle2 } from 'lucide-react';
import { playApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function PlayDetailPage() {
    const router = useRouter();
    const params = useParams();
    const venueId = params.id as string;
    const { isLoggedIn, phone: userPhone, login } = useAuth();
    const [isAboutExpanded, setIsAboutExpanded] = useState(false);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [venue, setVenue] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Booking State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchVenue = async () => {
            setIsLoading(true);
            try {
                const response = await playApi.getById(venueId);
                if (response.success && response.data) {
                    setVenue(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch play venue:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (venueId) fetchVenue();
    }, [venueId]);

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    // Handle Book Slots button click
    const handleBookSlots = () => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
        } else {
            router.push(`/checkout/play?venue=${venueId}`);
        }
    };

    // Handle successful authentication
    const handleAuthSuccess = (phone: string) => {
        setIsAuthModalOpen(false);
        setTimeout(() => {
            router.push(`/checkout/play?venue=${venueId}`);
        }, 300);
    };

    if (isLoading) {
        return <div className="min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>;
    }

    if (!venue) {
        return <div className="min-h-screen flex flex-col justify-center items-center gap-4">
            <h1 className="text-2xl font-bold">Venue Not Found</h1>
            <button onClick={() => router.back()} className="text-black font-bold uppercase tracking-wider underline">Go Back</button>
        </div>;
    }

    const galleryImages = (venue.images?.gallery || [
        '/play/1.png',
        '/play/1.png',
        '/play/1.png',
        '/play/1.png',
    ]).filter((src: string) => src && src.trim() !== "");

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white font-[family-name:var(--font-anek-latin)]">
            <main className="max-w-[1440px] mx-auto px-4 md:px-14 py-8">
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-12">
                        <div className="relative w-full h-[350px] md:h-[500px] rounded-[30px] overflow-hidden shadow-sm">
                            <Image
                                src={venue.images?.hero || "/login/banner.jpeg"}
                                alt={venue.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-black/10 transition-opacity hover:opacity-0" />
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-3xl font-semibold text-black">About the Venue</h2>
                            <div className="relative">
                                <p className={`text-[#686868] text-lg font-medium leading-relaxed ${!isAboutExpanded && 'line-clamp-3'}`}>
                                    {venue.description || "Experience the finest sports infrastructure at our venue. Whether you're a professional athlete or a weekend warrior, we provide the perfect environment for your favorite sports."}
                                </p>
                                {venue.description && venue.description.length > 200 && (
                                    <button
                                        onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                                        className="flex items-center gap-1 mt-2 text-black font-bold"
                                    >
                                        Show {isAboutExpanded ? 'less' : 'more'} <ChevronDown className={`transition-transform grow-0 ${isAboutExpanded ? 'rotate-180' : ''}`} size={16} />
                                    </button>
                                )}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-black ">Venue Guide</h2>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#D9D9D9] rounded-[10px] flex items-center justify-center text-[#686868]">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-[#686868] font-medium uppercase tracking-wider">Timing</p>
                                    <p className="text-base font-medium text-black">{venue.timings || "Open 24/7"}</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-black ">Gallery</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {galleryImages.map((src: string, i: number) => (
                                    <div key={i} className="aspect-square relative rounded-[20px] overflow-hidden border border-zinc-200">
                                        <Image src={src} alt={`Gallery ${i}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-black">Venue</h2>
                            <div className="p-6 bg-white rounded-[20px] border border-[#686868]/30 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-xl text-[#686868] font-medium">{venue.location?.venue_name || venue.name}</h4>
                                    <p className="text-lg text-[#686868] font-medium">{venue.location?.address || "Address not available"}</p>
                                </div>
                                <a
                                    href={venue.location?.map_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-zinc-300 rounded-[10px] text-black font-medium uppercase tracking-tight text-[18px] hover:bg-zinc-50 transition-colors"
                                >
                                    <MapPin size={18} strokeWidth={1.5} /> GET DIRECTIONS
                                </a>
                            </div>
                        </section>

                        <div className="space-y-4">
                            {venue.faqs && venue.faqs.length > 0 && (
                                <div
                                    className="p-6 bg-white border border-[#686868]/30 rounded-[20px] cursor-pointer"
                                    onClick={() => toggleAccordion('faq')}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold text-black">Frequently Asked Questions</h3>
                                        <ChevronDown className={`transition-transform text-[#686868] ${openAccordion === 'faq' ? 'rotate-180' : ''}`} />
                                    </div>
                                    {openAccordion === 'faq' && (
                                        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {venue.faqs.map((faq: any, i: number) => (
                                                <div key={i} className="space-y-1">
                                                    <p className="font-bold text-zinc-800">Q: {faq.question}</p>
                                                    <p className="text-zinc-600">A: {faq.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {venue.terms && venue.terms.length > 0 && (
                                <div
                                    className="p-6 bg-white border border-[#686868]/30 rounded-[20px] cursor-pointer"
                                    onClick={() => toggleAccordion('terms')}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold text-black">Terms & Conditions</h3>
                                        <ChevronDown className={`transition-transform text-[#686868] ${openAccordion === 'terms' ? 'rotate-180' : ''}`} />
                                    </div>
                                    {openAccordion === 'terms' && (
                                        <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {venue.terms.map((term: string, i: number) => (
                                                <div key={i} className="flex gap-2 text-[#686868]">
                                                    <span className="font-bold">•</span>
                                                    <p className="text-sm">{term}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-[400px]">
                        <div className="lg:sticky lg:top-32 space-y-6">
                            <div className="bg-white border border-[#686868]/30 rounded-[20px] overflow-hidden shadow-sm">
                                <div className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-black">{venue.name}</h3>
                                        <div className="space-y-1">
                                            <p className="text-xl text-[#686868] font-medium">{venue.category || "Sports"}</p>
                                            <p className="text-xl text-[#686868] font-medium mt-[15px]">{venue.location?.city || "Chennai"}</p>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-[#686868]/20">
                                        <button
                                            onClick={handleBookSlots}
                                            disabled={isSubmitting}
                                            className="w-full h-[54px] bg-black text-white rounded-[12px] flex items-center justify-center active:scale-[0.98] disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <span
                                                style={{
                                                    transform: 'scaleY(2)',
                                                    display: 'inline-block',
                                                    fontFamily: "var(--font-anek-tamil)",
                                                    fontWeight: 600,
                                                    lineHeight: 1
                                                }}
                                                className="text-[18px] tracking-wider uppercase"
                                            >
                                                {isSubmitting ? 'PROCESSING...' : 'BOOK SLOTS'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Authentication Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialView="number"
                onAuthSuccess={handleAuthSuccess}
            />

            <BottomBanner />
            <Footer />
        </div>
    );
}