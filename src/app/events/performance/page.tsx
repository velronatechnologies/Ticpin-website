import EventCategoryClient from '../EventCategoryClient';
import { fetchApprovedEventsByCategory } from '../server-events';

async function getPerformanceEvents() {
    try {
        return await fetchApprovedEventsByCategory('Performance');
    } catch (error) {
        console.error("Failed to fetch performance events:", error);
        return [];
    }
}

export default async function PerformancePage() {
    const events = await getPerformanceEvents();
    return (
        <EventCategoryClient
            events={events}
            categoryName="Performance"
            categoryImage="/events/eventperfomance.png"
            gradient="linear-gradient(180deg, #FFFFFF 0%, #BBF7D0 100%)"
        />
    );
}
