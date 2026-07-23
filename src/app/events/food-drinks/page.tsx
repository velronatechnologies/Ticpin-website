export const dynamic = 'force-dynamic';

import EventCategoryClient from '../EventCategoryClient';
import { fetchApprovedEventsByCategory } from '../server-events';

async function getFoodDrinksEvents() {
    try {
        return await fetchApprovedEventsByCategory('Food & Drinks');
    } catch (error) {
        console.error("Failed to fetch food & drinks events:", error);
        return [];
    }
}

export default async function FoodDrinksPage() {
    const events = await getFoodDrinksEvents();
    return (
        <EventCategoryClient
            events={events}
            categoryName="Food & Drinks"
            categoryImage="/events/Dining 1.svg"
            gradient="linear-gradient(180deg, #FFFFFF 0%, #8290D5 100%)"
        />
    );
}
