'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { artistsApi, eventsApi } from '@/lib/api';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import EventCard from '@/components/events/EventCard';
import { artists, events } from '@/data/mockData';

export default function ArtistDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [artist, setArtist] = useState<any>(null);
    const [artistEvents, setArtistEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArtistData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // 1. Try fetching from the dedicated artists collection
                const response = await artistsApi.getById(id);
                let currentArtist = null;

                if (response.success && response.data) {
                    currentArtist = response.data;
                } else {
                    // 2. Fallback: Scan all events for this artist (matches name with/without prefix)
                    const eventsRes = await eventsApi.getAll(100);
                    const rawId = decodeURIComponent(id);
                    const cleanId = rawId.replace(/^event-artist-/, '').toLowerCase();

                    if (eventsRes.success && eventsRes.data) {
                        const allEvents = eventsRes.data.items || [];
                        const eventWithArtist = allEvents.find((e: any) =>
                            e.artists?.some((a: any) =>
                                a.name.toLowerCase() === cleanId ||
                                (a.id && a.id === id) ||
                                a.name.toLowerCase().includes(cleanId) ||
                                cleanId.includes(a.name.toLowerCase())
                            )
                        );

                        if (eventWithArtist) {
                            const found = eventWithArtist.artists.find((a: any) =>
                                a.name.toLowerCase() === cleanId ||
                                (a.id && a.id === id) ||
                                a.name.toLowerCase().includes(cleanId) ||
                                cleanId.includes(a.name.toLowerCase())
                            );
                            currentArtist = {
                                ...found,
                                name: found.name,
                                image_url: found.image_url,
                                follower_count: found.follower_count || '15K+',
                                experience_years: found.experience_years || '8',
                                rating: found.rating || '4.9',
                                events_hosted: found.events_hosted || '30+',
                                genre: found.genre || "General",
                                location: found.location || "India"
                            };
                        }
                    }

                    // 3. Final Fallback: If still nothing, create a generic profile or use mock
                    if (!currentArtist) {
                        const mockArtist = artists.find((a: any) => a.id === Number(id));
                        if (mockArtist) {
                            currentArtist = {
                                ...mockArtist,
                                name: mockArtist.name,
                                image_url: mockArtist.image
                            };
                        } else {
                            currentArtist = {
                                name: rawId.replace(/^event-artist-/, ''),
                                image_url: '/placeholder.jpg',
                                description: 'Professional performer on Ticpin',
                                genre: 'General',
                                location: 'India',
                                follower_count: '10K+',
                                experience_years: '5+',
                                rating: '4.8',
                                is_verified: false
                            };
                        }
                    }
                }

                setArtist(currentArtist);

                // 4. Fetch associated events
                const allEventsRes = await eventsApi.getAll(100);
                if (allEventsRes.success && allEventsRes.data && currentArtist) {
                    const cleanArtistName = currentArtist.name.toLowerCase();
                    const filtered = (allEventsRes.data.items || []).filter((event: any) =>
                        event.artists?.some((a: any) =>
                            a.name.toLowerCase() === cleanArtistName ||
                            (a.id && currentArtist.id && a.id === currentArtist.id) ||
                            a.name.toLowerCase().includes(cleanArtistName) ||
                            cleanArtistName.includes(a.name.toLowerCase())
                        )
                    );
                    setArtistEvents(filtered);
                } else if (currentArtist) {
                    // Fallback to mock events if API fails
                    setArtistEvents(Array(4).fill(events[0]));
                }
            } catch (error) {
                console.error("Artist profile resolution failed:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchArtistData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!artist) return null;

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-anek-latin)]">
            <main className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 py-8 md:py-16 space-y-12 md:space-y-20">

                {/* Artist Profile Header */}
                <section className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
                    <div className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-[30px] overflow-hidden flex-shrink-0 bg-zinc-100 shadow-xl border border-zinc-200">
                        <img
                            src={artist.image_url || artist.image || '/placeholder.jpg'}
                            alt={artist.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 space-y-6 text-center md:text-left pt-2">
                        <h1 className="text-4xl md:text-7xl font-black text-black uppercase tracking-tighter mb-4">
                            {artist.name}
                        </h1>
                        <div className="space-y-6">
                            {/* Artist Content Grid - Bio & Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-zinc-500 text-sm md:text-base font-black uppercase tracking-tight pt-6 border-t border-zinc-100">
                                <span className="text-zinc-900">GENRE: {artist.genre || "GENERAL"}</span>
                                <span className="text-zinc-900">LOCATION: {artist.location || "INDIA"}</span>
                                <span className="text-zinc-900">FOLLOWERS: {artist.follower_count?.toLocaleString() || "10K+"}</span>
                                <span className="text-zinc-900">RATING: {artist.rating || '4.8'} / 5.0</span>
                                <span className="text-zinc-900">EXPERIENCE: {artist.experience_years || '5'}Y+</span>
                                <span className="text-zinc-900">EVENTS: {artist.events_hosted || '45+'}</span>
                                <span className="text-zinc-900">VERIFIED: {artist.is_verified ? "YES" : "PENDING"}</span>
                                <span className="text-zinc-900">STATUS: ACTIVE</span>
                                <span className="text-zinc-900">FANS: TOP 1%</span>

                                {/* Bio integrated into the content area */}
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 pt-6">
                                    <p className="normal-case font-medium text-zinc-500 text-lg leading-relaxed tracking-normal text-left">
                                        {artist.description || artist.bio || "Professional artist on Ticpin delivering exceptional performances across the region. Known for their unique style and engaging stage presence."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* All Events Section */}
                <section className="space-y-10 pt-10">
                    <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">
                        ALL EVENTS
                    </h2>

                    {artistEvents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {artistEvents.map((event, i) => (
                                <Link key={event.id || i} href={`/events/${event.id || String(i)}`}>
                                    <EventCard
                                        id={event.id || String(i)}
                                        name={event.title || event.name}
                                        location={event.venue?.city || event.location || "Online"}
                                        date={event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : event.date}
                                        time={event.start_datetime ? new Date(event.start_datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : event.time}
                                        ticketPrice={event.price_start ? `₹${event.price_start}` : event.ticketPrice}
                                        image={event.images?.hero || event.image || '/placeholder.jpg'}
                                        artists={event.artists}
                                    />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[40px]">
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">No upcoming events scheduled for this artist</p>
                        </div>
                    )}
                </section>

            </main>

            <BottomBanner />
            <Footer />
        </div>
    );
}
