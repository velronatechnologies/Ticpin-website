import type { Metadata } from 'next';
import EventDetailClient from './EventDetailClient';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import MobileEventDetailsClient from './MobileEventDetailsClient';
import { SERVER_BACKEND_API_BASE } from '@/lib/server-backend';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Artist {
    name: string;
    image_url?: string;
    description?: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface EventGuide {
    languages?: string[];
    min_age?: number;
    venue_type?: string;
    audience_type?: string;
    is_kid_friendly?: boolean;
    is_pet_friendly?: boolean;
    facilities?: string[];
}

interface EventData {
    id: string;
    name: string;
    description?: string;
    category?: string;
    sub_category?: string;
    city?: string;
    date?: string;
    time?: string;
    duration?: string;
    venue_name?: string;
    venue_address?: string;
    google_map_link?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    gallery_urls?: string[];
    price_starts_from?: number;
    tickets_needed_for?: string;
    artists?: Artist[];
    faqs?: FAQ[];
    guide?: EventGuide;
    status?: string;
    terms?: string;
    event_instructions?: string;
}

async function getEventData(name: string): Promise<EventData | null> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${SERVER_BACKEND_API_BASE}/events/${encodeURIComponent(name)}`, {
            cache: 'no-store',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data || !data.status || data.status.toLowerCase() !== 'approved') return null;
        return data;
    } catch (error) {
        console.error("Failed to fetch event data:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
    const { name } = await params;
    const event = await getEventData(name);
    if (!event) return { title: 'Not Found | Ticpin' };
    return {
        title: `Book Tickets for ${event.name} | Ticpin`,
        description: event.description ?? `Book tickets for ${event.name} on Ticpin.`,
        openGraph: {
            title: event.name,
            description: event.description ?? `Book tickets for ${event.name}`,
            images: event.landscape_image_url ? [{ url: event.landscape_image_url }] : [],
        },
    };
}

async function getMobileEventData(id: string) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${SERVER_BACKEND_API_BASE}/mobile/event/${id}`, {
            cache: 'no-store',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch mobile event data:", error);
        return null;
    }
}

export default async function EventDetailPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const isMobile = /mobile/i.test(userAgent);

    const event = await getEventData(decodedName);

    if (!event || !event.status || event.status.toLowerCase() !== 'approved') {
        notFound();
    }

    if (isMobile) {
        const mobileData = await getMobileEventData(event.id);
        if (mobileData && mobileData.event && mobileData.event.status && mobileData.event.status.toLowerCase() === 'approved') {
            return (
                <Suspense fallback={
                    <div className="min-h-screen bg-[#EAEAEA] flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-4 border-[#866BFF] border-t-transparent animate-spin" />
                    </div>
                }>
                    <MobileEventDetailsClient event={mobileData.event} offers={mobileData.offers || []} />
                </Suspense>
            );
        } else {
            notFound();
        }
    }

    return <EventDetailClient event={event} id={event.id} />;
}
