import CategoryClient from '../CategoryClient';
import { fetchApprovedPlayVenues } from '../server-play';

async function getTennisVenues() {
    try {
        return await fetchApprovedPlayVenues('category=Tennis&limit=100');
    } catch (error) {
        console.error("Failed to fetch tennis venues:", error);
        return [];
    }
}

export default async function TennisPage() {
    const venues = await getTennisVenues();
    return (
        <CategoryClient
            venues={venues}
            categoryName="Tennis"
            categoryImage="/play/playtens.png"
        />
    );
}
