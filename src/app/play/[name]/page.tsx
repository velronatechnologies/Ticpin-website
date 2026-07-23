import type { Metadata } from 'next';
import { headers } from 'next/headers';
import PlayDetailClient from './PlayDetailClient';
import { fetchPlayVenue } from '../server-play';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getVenueData(name: string) {
    try {
        return await fetchPlayVenue(name);
    } catch (error) {
        console.error("Failed to fetch venue data:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
    const { name } = await params;
    const venue = await getVenueData(name);
    if (!venue) return { title: 'Not Found | Ticpin' };
    return {
        title: `${venue.name} | Play | Ticpin`,
        description: venue.description ?? `Book slots at ${venue.name} on Ticpin.`,
        openGraph: {
            title: venue.name,
            description: venue.description ?? `Book slots at ${venue.name}`,
            images: venue.landscape_image_url ? [{ url: venue.landscape_image_url }] : [],
        },
    };
}

export default async function PlayDetailPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    const venue = await getVenueData(decodedName);

    if (!venue) {
        return <div className="min-h-screen flex items-center justify-center">Venue not found</div>;
    }

    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    return <PlayDetailClient venue={venue} id={venue.id} isMobileServer={isMobile} />;
}
