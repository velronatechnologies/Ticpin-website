import EventCategoryClient from '../EventCategoryClient';
import { fetchApprovedEventsByCategory } from '../server-events';

async function getSportsEvents() {
    try {
        return await fetchApprovedEventsByCategory('Sports');
    } catch (error) {
        console.error("Failed to fetch sports events:", error);
        return [];
    }
}

export default async function SportsPage() {
    const events = await getSportsEvents();
    return (
        <EventCategoryClient
            events={events}
            categoryName="Sports"
            categoryImage="/events/Sports Icon 2.svg"
            gradient="linear-gradient(180deg, #FFFFFF 0%, #BAE6FD 100%)"
        />
    );
}
