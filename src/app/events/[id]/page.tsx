'use client';

import AppBanner from '@/components/layout/AppBanner';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Share2, MapPin, Calendar, Clock, Star, HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { authApi, bookingApi, storeAuthToken, getAuthToken, isAuthenticated, eventsApi } from '@/lib/api';
import AuthModal from '@/components/modals/AuthModal';

export default function EventDetailPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [event, setEvent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Authentication & Booking State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [userAuthenticated, setUserAuthenticated] = useState(false);
    const [userPhone, setUserPhone] = useState('');
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Event Data
    useEffect(() => {
        const fetchEvent = async () => {
            setIsLoading(true);
            try {
                const response = await eventsApi.getById(eventId);
                if (response.success && response.data) {
                    setEvent(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch event:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (eventId) fetchEvent();
    }, [eventId]);

    // Check auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated()) {
                setUserAuthenticated(true);
                try {
                    const response = await authApi.getProfile();
                    if (response.success && response.data) {
                        setUserProfile(response.data);
                        setUserPhone(response.data.phone || '');
                    }
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                    setUserAuthenticated(false);
                }
            }
        };
        checkAuth();
    }, []);

    const handleBookTickets = () => {
        if (!userAuthenticated) {
            setIsAuthModalOpen(true);
        } else {
            router.push('/checkout/event');
        }
    };

    const handleAuthSuccess = async (phone: string) => {
        try {
            const response = await authApi.getProfile();
            if (response.success && response.data) {
                setUserAuthenticated(true);
                setUserPhone(phone);
                setUserProfile(response.data);
                setIsAuthModalOpen(false);
                setTimeout(() => {
                    router.push('/checkout/event');
                }, 300);
            }
        } catch (error) {
            console.error('Handle auth success failed:', error);
            setUserAuthenticated(true);
            setUserPhone(phone);
            setIsAuthModalOpen(false);
            router.push('/checkout/event');
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>;
    }

    if (!event) {
        return <div className="min-h-screen flex flex-col justify-center items-center gap-4">
            <h1 className="text-2xl font-bold">Event Not Found</h1>
            <button onClick={() => router.back()} className="text-purple-600 font-bold uppercase tracking-wider underline">Go Back</button>
        </div>;
    }

    const galleryImages = (event.images?.gallery || [
        '/images.png',
        '/images.png',
        '/images.png',
        '/images.png',
    ]).filter((src: string) => src && src.trim() !== "");

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
                            <img src={event.images?.hero || "/login/banner.jpeg"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={event.title || event.name} />
                            <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
                        </div>

                        {/* About the Event */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-zinc-900">About the Event</h2>
                            <p className="text-base text-zinc-600 leading-relaxed whitespace-pre-wrap">
                                {event.description || "No description available for this event."}
                            </p>
                        </section>

                        {/* Event Overview */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-zinc-900">Event Overview</h2>
                            </div>
                            <div className="flex gap-4 items-stretch flex-wrap">
                                <div className="flex items-center gap-2 flex-grow min-w-[140px]">
                                    <div className="flex items-center justify-center flex-shrink-0 bg-white rounded-lg p-3">
                                        <div className="w-5 h-5 rounded-full border-2 border-purple-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-700 leading-tight">Language</span>
                                        <span className="text-sm font-semibold text-zinc-600 leading-tight">{event.language || "English / Tamil"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-grow min-w-[140px]">
                                    <div className="flex items-center justify-center flex-shrink-0 bg-white rounded-lg p-3">
                                        <Clock size={20} className="text-zinc-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-700 leading-tight">Duration</span>
                                        <span className="text-sm font-semibold text-zinc-600 leading-tight">{event.duration || "2h 30m"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-grow min-w-[140px]">
                                    <div className="flex items-center justify-center flex-shrink-0 bg-white rounded-lg p-3">
                                        <CheckCircle2 size={20} className="text-zinc-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-700 leading-tight">Age Group</span>
                                        <span className="text-sm font-semibold text-zinc-600 leading-tight">{event.age_limit || "Everyone"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Artist Section */}
                        {event.artist && (
                            <section className="space-y-3">
                                <h2 className="text-lg font-bold text-zinc-900">Artist</h2>
                                <div className="flex gap-4 items-center">
                                    <img src={event.artist.image || "/placeholder.jpg"} className="w-[100px] h-[100px] rounded-full object-cover shadow-sm" alt={event.artist.name} />
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-zinc-900">{event.artist.name}</span>
                                        <span className="text-sm text-zinc-500">{event.artist.role || "Performer"}</span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Gallery */}
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-zinc-900">Gallery</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {galleryImages.map((src: string, i: number) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm border border-zinc-100">
                                        <img src={src} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Venue Location */}
                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-zinc-900">Venue</h2>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-6 border border-zinc-200 rounded-[24px] bg-white gap-4">
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-zinc-900">{event.venue?.name || event.location?.venue_name || "Venue Name"}</span>
                                    <span className="text-base text-zinc-500">{event.venue?.address || event.location?.address || "Venue Address"}</span>
                                </div>
                                <a
                                    href={event.venue?.map_url || event.location?.map_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:bg-zinc-100 transition-colors"
                                >
                                    <MapPin size={18} /> Get Directions
                                </a>
                            </div>
                        </section>

                        {/* FAQ Section */}
                        {event.faqs && event.faqs.length > 0 && (
                            <section className="space-y-3">
                                <div
                                    onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
                                    className={`w-full flex flex-col p-6 bg-white border border-zinc-200 rounded-[24px] cursor-pointer transition-all ${activeFaq === 1 ? 'ring-2 ring-purple-600/10' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-black">Frequently Asked Questions</h3>
                                        <ChevronDown size={20} className={`transition-transform text-[#686868] ${activeFaq === 1 ? 'rotate-180' : ''}`} />
                                    </div>
                                    {activeFaq === 1 && (
                                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {event.faqs.map((faq: any, i: number) => (
                                                <div key={i} className="space-y-1">
                                                    <p className="font-bold text-zinc-800">Q: {faq.question}</p>
                                                    <p className="text-zinc-600">{faq.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Terms Section */}
                        {event.terms && event.terms.length > 0 && (
                            <section className="space-y-3">
                                <div
                                    onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
                                    className={`w-full flex flex-col p-6 bg-white border border-zinc-200 rounded-[24px] cursor-pointer transition-all ${activeFaq === 2 ? 'ring-2 ring-purple-600/10' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-black">Event Terms & Conditions</h3>
                                        <ChevronDown size={20} className={`transition-transform text-[#686868] ${activeFaq === 2 ? 'rotate-180' : ''}`} />
                                    </div>
                                    {activeFaq === 2 && (
                                        <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {event.terms.map((term: string, i: number) => (
                                                <div key={i} className="flex gap-2 text-zinc-600">
                                                    <span className="text-purple-600 font-bold">•</span>
                                                    <p className="text-sm">{term}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar / Booking Pass */}
                    <div className="w-full lg:w-[400px] order-1 lg:order-2">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div className="bg-white border border-zinc-200 rounded-[30px] overflow-hidden shadow-xl p-8 space-y-6">
                                <h3 className="text-2xl font-bold text-black">{event.title || event.name}</h3>

                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Category</p>
                                        <p className="text-lg text-black font-bold">{event.category || "Event"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Date / Time</p>
                                        <p className="text-lg text-black font-bold">
                                            {event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "Coming Soon"}
                                            {event.start_datetime && <span className="text-zinc-400 font-normal ml-2">@ {new Date(event.start_datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Location</p>
                                        <p className="text-lg text-black font-bold">{event.venue?.name || event.location?.venue_name || "Chennai"}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-zinc-100 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] block mb-1">Pass starting at</span>
                                            <span className="text-3xl font-black text-zinc-900">₹{event.price_start || 0}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleBookTickets}
                                        disabled={isSubmitting}
                                        className="w-full h-14 bg-black text-white uppercase rounded-2xl hover:bg-zinc-800 transition-all font-bold text-lg flex items-center justify-center disabled:bg-zinc-400 disabled:cursor-not-allowed shadow-lg shadow-black/10"
                                    >
                                        {isSubmitting ? '...' : 'BOOK NOW'}
                                    </button>
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
