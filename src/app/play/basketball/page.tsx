export const dynamic = 'force-dynamic';

import CategoryClient from '../CategoryClient';
import { fetchApprovedPlayVenues } from '../server-play';

async function getBasketballVenues() {
    try {
        return await fetchApprovedPlayVenues('category=Basketball&limit=100');
    } catch (error) {
        console.error("Failed to fetch basketball venues:", error);
        return [];
    }
}

export default async function BasketballPage() {
    const venues = await getBasketballVenues();
    return (
        <CategoryClient
            venues={venues}
            categoryName="Basketball"
            categoryImage="/play/playbb.png"
        />
    );
}
