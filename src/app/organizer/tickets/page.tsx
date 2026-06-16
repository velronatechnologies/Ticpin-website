'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import OrganizerHeader from '@/components/organizer/OrganizerHeader';
import Sidebar from '@/components/organizer/Sidebar';
import { getOrganizerSession } from '@/lib/auth/organizer';
import TicketsOverviewClient from '@/components/organizer/analytics/TicketsOverviewClient';

export default function TicketsPage() {
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false);
    const [session, setSession] = useState<ReturnType<typeof getOrganizerSession>>(null);

    useEffect(() => {
        setHasMounted(true);
        const s = getOrganizerSession();
        if (!s) {
            router.replace('/list-your-dining/Login');
            return;
        }
        setSession(s);
    }, [router]);

    if (!hasMounted) {
        return <div className="min-h-screen bg-zinc-50 animate-pulse" />;
    }

    return (
        <div className="flex min-h-screen font-[family-name:var(--font-anek-latin)] bg-[#F8F9FA]">
            <Sidebar activeTab="tickets" />
            <div className="flex-1 flex flex-col min-w-0">
                <OrganizerHeader activeTab={session?.vertical as 'events' | 'play' | 'dining' | undefined} />

                <main className="flex-1 px-8 md:px-14 lg:px-20 py-16">
                    <Suspense fallback={
                        <div className="flex-1 flex items-center justify-center min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5331EA]" />
                        </div>
                    }>
                        <TicketsOverviewClient />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
