import { Metadata } from 'next';
import PlayClient from './PlayClient';
import { fetchApprovedPlayVenues, type PlayVenue } from './server-play';

export const metadata: Metadata = {
    title: "Play | Ticpin",
    description: "Explore and book sports venues, from cricket and football to pickleball and tennis on Ticpin.",
};

async function getPlayVenues(): Promise<PlayVenue[]> {
    try {
        return await fetchApprovedPlayVenues('limit=100');
    } catch (err) {
        console.error("Failed to fetch play venues from backend:", err);
        return [];
    }
}

export default async function PlayPage() {
    const venues = await getPlayVenues();
    return <PlayClient initialVenues={venues} />;
}
