import EventCategoryClient from '../EventCategoryClient';
import { fetchApprovedEventsByCategory } from '../server-events';

async function getFitnessEvents() {
    try {
        return await fetchApprovedEventsByCategory('Fitness');
    } catch (error) {
        console.error("Failed to fetch fitness events:", error);
        return [];
    }
}

export default async function FitnessPage() {
    const events = await getFitnessEvents();
    return (
        <EventCategoryClient
            events={events}
            categoryName="Fitness"
            categoryImage="/events/Dumbells Icon 1.svg"
            gradient="linear-gradient(180deg, #FFFFFF 0%, #98C5FF 100%)"
        />
    );
}
