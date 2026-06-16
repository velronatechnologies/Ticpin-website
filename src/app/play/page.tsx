import { Metadata } from 'next';
import PlayClient from './PlayClient';

export const metadata: Metadata = {
    title: "Play | Ticpin",
    description: "Explore and book sports venues, from cricket and football to pickleball and tennis on Ticpin.",
};

interface RealPlay {
    id: string;
    name: string;
    city?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    category?: string;
    rating?: number;
    status?: string;
    price_starts_from?: number;
}

async function getPlayVenues(): Promise<RealPlay[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/play?limit=100`, {
            cache: 'no-store'
        });
        if (!res.ok) {
            console.warn(`Backend responded with ${res.status} for play venues fetch`);
            return [];
        }
        const data = await res.json();
        const list: RealPlay[] = Array.isArray(data) ? data : (data?.data ?? []);
        return list.filter(v => v.status === 'approved');
    } catch (err) {
        console.error("Failed to fetch play venues from backend:", err);
        return [];
    }
}

export default async function PlayPage() {
    const venues = await getPlayVenues();
    return <PlayClient initialVenues={venues} />;
}
