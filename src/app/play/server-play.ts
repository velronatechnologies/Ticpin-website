import { SERVER_BACKEND_API_BASE } from '@/lib/server-backend';

export interface PlayVenue {
    _id?: string;
    id: string;
    name: string;
    description?: string;
    category?: string;
    sub_category?: string;
    city?: string;
    venue_name?: string;
    venue_address?: string;
    google_map_link?: string;
    instagram_link?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    card_video_url?: string;
    gallery_urls?: string[];
    secondary_banner_url?: string;
    time?: string;
    opening_time?: string;
    closing_time?: string;
    pricing_plans?: { start_time: string; end_time: string; min_duration: string; price: number }[];
    pricing_format?: string;
    courts?: { id: string; name: string; type: string; price: number; image_url?: string }[];
    guide?: { facilities: string[] | string; is_pet_friendly: boolean };
    event_instructions?: string;
    youtube_video_url?: string;
    prohibited_items?: string[];
    faqs?: { question: string; answer: string }[];
    terms?: string;
    price_starts_from?: number;
    price_per_slot?: number;
    min_duration?: string;
    dimension?: string;
    rating?: number;
    status?: string;
}

function parsePlayList(payload: unknown): PlayVenue[] {
    if (Array.isArray(payload)) {
        return payload as PlayVenue[];
    }

    if (payload && typeof payload === 'object' && 'data' in payload) {
        const nested = (payload as { data?: unknown }).data;
        return Array.isArray(nested) ? (nested as PlayVenue[]) : [];
    }

    return [];
}

export async function fetchPlayVenues(query = ''): Promise<PlayVenue[]> {
    try {
        const suffix = query ? `?${query}` : '';
        const response = await fetch(`${SERVER_BACKEND_API_BASE}/play${suffix}`, {
            next: { revalidate: 10 },
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            return [];
        }

        return parsePlayList(await response.json());
    } catch {
        return [];
    }
}

export async function fetchApprovedPlayVenues(query = ''): Promise<PlayVenue[]> {
    const venues = await fetchPlayVenues(query);
    return venues.filter((venue) => venue.status === 'approved');
}

export async function fetchPlayVenue(name: string): Promise<PlayVenue | null> {
    try {
        const response = await fetch(`${SERVER_BACKEND_API_BASE}/play/${encodeURIComponent(name)}`, {
            next: { revalidate: 10 },
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            return null;
        }

        return await response.json() as PlayVenue;
    } catch {
        return null;
    }
}
