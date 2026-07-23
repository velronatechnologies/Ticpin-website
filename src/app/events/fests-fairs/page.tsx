export const dynamic = 'force-dynamic';

import EventCategoryClient from '../EventCategoryClient';
import { fetchApprovedEventsByCategory } from '../server-events';

async function getFestsFairsEvents() {
    try {
        return await fetchApprovedEventsByCategory('Fests & Fairs');
    } catch (error) {
        console.error("Failed to fetch fests & fairs events:", error);
        return [];
    }
}

export default async function FestsFairsPage() {
    const events = await getFestsFairsEvents();
    return (
        <EventCategoryClient
            events={events}
            categoryName="Fests & Fairs"
            categoryImage="/events/Fests & Fairs Icon 1.svg"
            gradient="linear-gradient(180deg, #FFFFFF 0%, #FFC799 100%)"
        />
    );
}
