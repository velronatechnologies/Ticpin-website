export const dynamic = 'force-dynamic';

import EventCategoryClient from '../EventCategoryClient';
import { fetchApprovedEventsByCategory } from '../server-events';

async function getMusicEvents() {
    try {
        return await fetchApprovedEventsByCategory('Music');
    } catch (error) {
        console.error("Failed to fetch music events:", error);
        return [];
    }
}

export default async function MusicPage() {
    const events = await getMusicEvents();
    return (
        <EventCategoryClient
            events={events}
            categoryName="Music"
            categoryImage="/events/eventsmusic.png"
            gradient="linear-gradient(180deg, #FFFFFF 0%, #D8B4FE 100%)"
        />
    );
}
