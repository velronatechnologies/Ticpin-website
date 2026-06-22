'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import EventCategoryClient from '../EventCategoryClient';

async function getFestsFairsEvents() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events?category=Fests%20%26%20Fairs`, {
            next: { revalidate: 300 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const events = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        return events.filter((e: any) => e.status === 'approved');
    } catch (error) {
        console.error("Failed to fetch fests & fairs events:", error);
        return [];
    }
}

export default async function FestsFairsPage() {
    cacheLife('days');
    cacheTag('events-list', 'event-category-fests-fairs');
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
