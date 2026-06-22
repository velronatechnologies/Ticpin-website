'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import CategoryClient from '../CategoryClient';

async function getFootballVenues() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/play?category=Football&limit=100`, {
            next: { revalidate: 300 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        return list.filter((v: any) => v.status === 'approved');
    } catch (error) {
        console.error("Failed to fetch football venues:", error);
        return [];
    }
}

export default async function FootballPage() {
    cacheLife('days');
    cacheTag('play-venues-list', 'play-category-football');
    const venues = await getFootballVenues();
    return (
        <CategoryClient
            venues={venues}
            categoryName="Football"
            categoryImage="/play/playfb.png"
        />
    );
}
