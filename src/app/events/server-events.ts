import { cache } from 'react';
import { SERVER_BACKEND_API_BASE } from '@/lib/server-backend';

export interface EventArtist {
    name: string;
    image_url?: string;
}

export interface EventListItem {
    id: string;
    name: string;
    city?: string;
    date?: string;
    time?: string;
    price_starts_from?: number;
    portrait_image_url?: string;
    landscape_image_url?: string;
    category?: string;
    venue_type?: string;
    venue_name?: string;
    venue_address?: string;
    artists?: EventArtist[];
    status?: string;
}

function parseEventList(payload: unknown): EventListItem[] {
    if (Array.isArray(payload)) {
        return payload as EventListItem[];
    }

    if (payload && typeof payload === 'object' && 'data' in payload) {
        const nested = (payload as { data?: unknown }).data;
        return Array.isArray(nested) ? (nested as EventListItem[]) : [];
    }

    return [];
}

export const fetchEvents = cache(async (query = ''): Promise<EventListItem[]> => {
    try {
        const suffix = query ? `?${query}` : '';
        const response = await fetch(`${SERVER_BACKEND_API_BASE}/events${suffix}`, {
            next: { revalidate: 10 },
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            return [];
        }

        const list = parseEventList(await response.json());
        return list.filter((event) => !event.status || event.status.toLowerCase() === 'approved');
    } catch (err) {
        console.error("Failed to fetch events from backend:", err);
        return [];
    }
});

export async function fetchApprovedEventsByCategory(category: string): Promise<EventListItem[]> {
    const events = await fetchEvents(`category=${encodeURIComponent(category)}`);
    return events.filter((event) => !event.status || event.status.toLowerCase() === 'approved');
}
