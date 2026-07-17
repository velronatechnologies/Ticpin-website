import MobileHome from '@/components/mobile/MobileHome';
import { SERVER_BACKEND_API_BASE } from '@/lib/server-backend';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function getMobileHomeData() {
    try {
        const [eventsRes, diningsRes, playsRes] = await Promise.all([
            fetch(`${SERVER_BACKEND_API_BASE}/events`, { next: { revalidate: 10 } }),
            fetch(`${SERVER_BACKEND_API_BASE}/dining`, { next: { revalidate: 10 } }),
            fetch(`${SERVER_BACKEND_API_BASE}/play`, { next: { revalidate: 10 } }),
        ]);

        const [eventsJson, diningsJson, playsJson] = await Promise.all([
            eventsRes.ok ? eventsRes.json() : { data: [] },
            diningsRes.ok ? diningsRes.json() : { data: [] },
            playsRes.ok ? playsRes.json() : { data: [] },
        ]);

        return {
            events: Array.isArray(eventsJson?.data) ? eventsJson.data : (Array.isArray(eventsJson) ? eventsJson : []),
            dinings: Array.isArray(diningsJson?.data) ? diningsJson.data : (Array.isArray(diningsJson) ? diningsJson : []),
            plays: Array.isArray(playsJson?.data) ? playsJson.data : (Array.isArray(playsJson) ? playsJson : []),
        };
    } catch (err) {
        console.error('Failed to fetch mobile home data:', err);
        return { events: [], dinings: [], plays: [] };
    }
}

export default async function Home() {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    if (!isMobile) {
        redirect('/events');
    }

    const { events, dinings, plays } = await getMobileHomeData();
    return <MobileHome events={events} dinings={dinings} plays={plays} />;
}
