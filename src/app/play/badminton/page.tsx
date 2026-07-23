export const dynamic = 'force-dynamic';

import CategoryClient from '../CategoryClient';
import { fetchApprovedPlayVenues } from '../server-play';

async function getBadmintonVenues() {
    try {
        return await fetchApprovedPlayVenues('category=Badminton&limit=100');
    } catch (error) {
        console.error("Failed to fetch badminton venues:", error);
        return [];
    }
}

export default async function BadmintonPage() {
    const venues = await getBadmintonVenues();
    return (
        <CategoryClient
            venues={venues}
            categoryName="Badminton"
            categoryImage="/play/playbm.png"
        />
    );
}
