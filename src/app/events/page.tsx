import { Metadata } from 'next';
import EventsClient from './EventsClient';
import { fetchEvents, type EventListItem } from './server-events';

export const metadata: Metadata = {
    title: "Events | Ticpin",
    description: "Explore and book the most exciting music, comedy, and performance events on Ticpin.",
};

async function getEvents(): Promise<EventListItem[]> {
    try {
        const events = await fetchEvents();
        
        if (events.length === 0) {
            console.log("No events returned from backend /api/events");
        }
        
        // Return all events regardless of status - let EventsClient handle filtering
        return events;
    } catch (err) {
        console.error("Failed to fetch events from backend:", err);
        return [];
    }
}

export default async function EventsPage() {
    const events = await getEvents();
    return <EventsClient initialEvents={events} />;
}
