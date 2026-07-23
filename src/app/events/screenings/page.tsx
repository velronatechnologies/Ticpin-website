export const dynamic = 'force-dynamic';

import EventCategoryClient from '../EventCategoryClient';
import { fetchApprovedEventsByCategory } from '../server-events';

async function getScreeningsEvents() {
    try {
        return await fetchApprovedEventsByCategory('Screenings');
    } catch (error) {
        console.error("Failed to fetch screenings events:", error);
        return [];
    }
}

export default async function ScreeningsPage() {
    const events = await getScreeningsEvents();
    return (
        <EventCategoryClient
            events={events}
            categoryName="Screenings"
            categoryImage="/events/Projector Icon 1.svg"
            gradient="linear-gradient(180deg, #FFFFFF 0%, #B4E9FF 100%)"
        />
    );
}
