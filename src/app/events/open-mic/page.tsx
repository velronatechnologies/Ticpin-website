import EventCategoryClient from '../EventCategoryClient';
import { fetchApprovedEventsByCategory } from '../server-events';

async function getOpenMicEvents() {
    try {
        return await fetchApprovedEventsByCategory('Open Mic');
    } catch (error) {
        console.error("Failed to fetch open mic events:", error);
        return [];
    }
}

export default async function OpenMicPage() {
    const events = await getOpenMicEvents();
    return (
        <EventCategoryClient
            events={events}
            categoryName="Open Mic"
            categoryImage="/events/Open Mic Icon 1.svg"
            gradient="linear-gradient(180deg, #FFFFFF 0%, #FFEF96 100%)"
        />
    );
}
