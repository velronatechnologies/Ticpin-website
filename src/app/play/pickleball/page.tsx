'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import CategoryClient from '../CategoryClient';

async function getPickleballVenues() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/play?category=Pickleball&limit=100`, {
            next: { revalidate: 300 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        return list.filter((v: any) => v.status === 'approved');
    } catch (error) {
        console.error("Failed to fetch pickleball venues:", error);
        return [];
    }
}

export default async function PickleballPage() {
    cacheLife('days');
    cacheTag('play-venues-list', 'play-category-pickleball');
    const venues = await getPickleballVenues();
    return (
        <CategoryClient
            venues={venues}
            categoryName="Pickleball"
            categoryImage="/play/playpb.png"
        />
    );
}
