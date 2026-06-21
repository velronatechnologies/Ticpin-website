'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import EventCard from '@/components/events/EventCard';

interface Artist {
    name: string;
    image_url?: string;
    description?: string;
}

import { getMinPrice, formatEventDateUTC } from '@/lib/utils';

interface RealEvent {
    id: string;
    name: string;
    city?: string;
    venue_name?: string;
    venue_address?: string;
    date?: string;
    time?: string;
    price_starts_from?: number;
    portrait_image_url?: string;
    landscape_image_url?: string;
    category?: string;
    artists?: Artist[];
    ticket_categories?: Array<{ name: string; price?: number; capacity?: number }>;
    layout_json?: string;
}

export default function ArtistDetailPage() {
    const { id } = useParams();
    const artistNameDecoded = decodeURIComponent(id as string);
    const [events, setEvents] = useState<RealEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [artistDetails, setArtistDetails] = useState<Artist | null>(null);

    useEffect(() => {
        fetch(`/backend/api/events?artist=${encodeURIComponent(artistNameDecoded)}`)
            .then(r => r.json())
            .then((data: any) => {
                const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
                setEvents(list);

                // Extract artist details from the returned events, merging info if needed
                let bestArtist: Artist | null = null;
                for (const ev of list) {
                    const found = ev.artists?.find((a: any) => a.name.toLowerCase() === artistNameDecoded.toLowerCase());
                    if (found) {
                        if (!bestArtist) {
                            bestArtist = { ...found };
                        } else {
                            // Merge missing info
                            if (!bestArtist.image_url && found.image_url) bestArtist.image_url = found.image_url;
                            if (!bestArtist.description && found.description) bestArtist.description = found.description;
                        }
                        // If we have both image and description, we can stop
                        if (bestArtist?.image_url && bestArtist?.description) break;
                    }
                }
                setArtistDetails(bestArtist);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [artistNameDecoded]);

    const formatDate = (iso?: string) => {
        return formatEventDateUTC(iso);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-[#7B2FF7] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-anek-latin)]">
            <main className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 py-8 md:py-16 space-y-12 md:space-y-20">

                {/* Artist Profile Header */}
                <section className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
                    <div className="relative w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-[30px] overflow-hidden bg-[#f3f0fd] flex-shrink-0 flex items-center justify-center border border-zinc-100 shadow-sm">
                        {artistDetails?.image_url ? (
                            <Image
                                src={artistDetails.image_url}
                                alt={artistNameDecoded}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <span className="text-8xl font-bold text-[#7B2FF7] opacity-20 uppercase select-none">{artistNameDecoded.charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex-1 space-y-6 text-center md:text-left pt-4">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-black uppercase tracking-tight">
                            {artistNameDecoded}
                        </h1>
                        <div className="w-20 h-1.5 bg-[#7B2FF7] mx-auto md:mx-0 rounded-full" />
                        <p className="text-zinc-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto md:mx-0 font-medium">
                            {artistDetails?.description || "This artist hasn't shared a biography yet. Stay tuned for more updates and upcoming performances!"}
                        </p>
                    </div>
                </section>

                {/* All Events Section */}
                <section className="space-y-10 pb-12">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-black uppercase whitespace-nowrap">
                            UPCOMING EVENTS
                        </h2>
                        <div className="flex-grow h-[1px] bg-zinc-200" />
                    </div>

                    {events.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-50 rounded-[20px] border-2 border-dashed border-zinc-200">
                            <p className="text-zinc-400 text-lg">No upcoming events found for {artistNameDecoded}.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                            {events.map((event) => (
                                <EventCard
                                    key={event.id}
                                    id={event.id}
                                    name={event.name}
                                    venueName={event.venue_name ?? ''}
                                    venueAddress={event.venue_address ?? ''}
                                    location={event.city ?? ''}
                                    date={formatDate(event.date)}
                                    time={event.time ?? ''}
                                    ticketPrice={(() => {
                                        const minP = getMinPrice(event);
                                        return minP > 0 ? `₹${minP}` : '—';
                                    })()}
                                    image={event.portrait_image_url || event.landscape_image_url || '/events/events-1/ticpinbanner.jpg'}
                                />
                            ))}
                        </div>
                    )}
                </section>

            </main>

            <BottomBanner />
            <Footer />
        </div>
    );
}
