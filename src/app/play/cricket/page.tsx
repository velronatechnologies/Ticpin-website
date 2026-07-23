export const dynamic = 'force-dynamic';

import CategoryClient from '../CategoryClient';
import { fetchApprovedPlayVenues } from '../server-play';

async function getCricketVenues() {
    try {
        return await fetchApprovedPlayVenues('category=Cricket&limit=100');
    } catch (error) {
        console.error("Failed to fetch cricket venues:", error);
        return [];
    }
}

export default async function CricketPage() {
    const venues = await getCricketVenues();
    return (
        <CategoryClient
            venues={venues}
            categoryName="CRICKET"
            categoryImage="/play/playck.png"
        />
    );
}
