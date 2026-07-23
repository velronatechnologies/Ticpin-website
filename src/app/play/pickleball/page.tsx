export const dynamic = 'force-dynamic';

import CategoryClient from '../CategoryClient';
import { fetchApprovedPlayVenues } from '../server-play';

async function getPickleballVenues() {
    try {
        return await fetchApprovedPlayVenues('category=Pickleball&limit=100');
    } catch (error) {
        console.error("Failed to fetch pickleball venues:", error);
        return [];
    }
}

export default async function PickleballPage() {
    const venues = await getPickleballVenues();
    return (
        <CategoryClient
            venues={venues}
            categoryName="Pickleball"
            categoryImage="/play/playpb.png"
        />
    );
}
