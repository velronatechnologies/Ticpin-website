export const dynamic = 'force-dynamic';

import CategoryClient from '../CategoryClient';
import { fetchApprovedPlayVenues } from '../server-play';

async function getTTVenues() {
    try {
        return await fetchApprovedPlayVenues('category=Table%20Tennis&limit=100');
    } catch (error) {
        console.error("Failed to fetch table tennis venues:", error);
        return [];
    }
}

export default async function TableTennisPage() {
    const venues = await getTTVenues();
    return (
        <CategoryClient
            venues={venues}
            categoryName="Table Tennis"
            categoryImage="/play/playtt.png"
        />
    );
}
