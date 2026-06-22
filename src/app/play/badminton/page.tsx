'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import CategoryClient from '../CategoryClient';

async function getBadmintonVenues() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/play?category=Badminton&limit=100`, {
            next: { revalidate: 300 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        return list.filter((v: any) => v.status === 'approved');
    } catch (error) {
        console.error("Failed to fetch badminton venues:", error);
        return [];
    }
}

export default async function BadmintonPage() {
    cacheLife('days');
    cacheTag('play-venues-list', 'play-category-badminton');
    const venues = await getBadmintonVenues();
    return (
        <CategoryClient
            venues={venues}
            categoryName="Badminton"
            categoryImage="/play/playbm.png"
        />
    );
}
