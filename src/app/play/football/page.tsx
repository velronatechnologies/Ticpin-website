export const dynamic = 'force-dynamic';

import CategoryClient from '../CategoryClient';
import { fetchApprovedPlayVenues } from '../server-play';

async function getFootballVenues() {
    try {
        return await fetchApprovedPlayVenues('category=Football&limit=100');
    } catch (error) {
        console.error("Failed to fetch football venues:", error);
        return [];
    }
}

export default async function FootballPage() {
    const venues = await getFootballVenues();
    return (
        <CategoryClient
            venues={venues}
            categoryName="Football"
            categoryImage="/play/playfb.png"
        />
    );
}
