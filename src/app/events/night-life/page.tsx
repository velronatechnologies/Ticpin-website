import EventCategoryClient from '../EventCategoryClient';
import { fetchApprovedEventsByCategory } from '../server-events';

async function getNightLifeEvents() {
    try {
        return await fetchApprovedEventsByCategory('Night Life');
    } catch (error) {
        console.error("Failed to fetch night life events:", error);
        return [];
    }
}

export default async function NightLifePage() {
    const events = await getNightLifeEvents();
    return (
        <EventCategoryClient
            events={events}
            categoryName="Night Life"
            categoryImage="/events/Night Life Icon 1.svg"
            gradient="linear-gradient(180deg, #FFFFFF 0%, #FAFDAA 100%)"
        />
    );
}
