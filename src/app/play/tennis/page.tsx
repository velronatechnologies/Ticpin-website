'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import CategoryClient from '../CategoryClient';

async function getTennisVenues() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/play?category=Tennis&limit=100`, {
            next: { revalidate: 300 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        return list.filter((v: any) => v.status === 'approved');
    } catch (error) {
        console.error("Failed to fetch tennis venues:", error);
        return [];
    }
}

export default async function TennisPage() {
    cacheLife('days');
    cacheTag('play-venues-list', 'play-category-tennis');
    const venues = await getTennisVenues();
    return (
        <CategoryClient
            venues={venues}
            categoryName="Tennis"
            categoryImage="/play/playtens.png"
        />
    );
}
