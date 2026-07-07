import EventCategoryClient from '../EventCategoryClient';
import { fetchApprovedEventsByCategory } from '../server-events';

async function getComedyEvents() {
    try {
        return await fetchApprovedEventsByCategory('Comedy');
    } catch (error) {
        console.error("Failed to fetch comedy events:", error);
        return [];
    }
}

export default async function ComedyPage() {
    const events = await getComedyEvents();
    return (
        <EventCategoryClient
            events={events}
            categoryName="Comedy"
            categoryImage="/events/eventscomedy.png"
            gradient="linear-gradient(180deg, #FFFFFF 0%, #FECACA 100%)"
        />
    );
}
