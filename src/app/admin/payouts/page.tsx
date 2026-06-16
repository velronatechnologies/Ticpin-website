import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react';
import AdminPayoutsClient from '@/components/admin/AdminPayoutsClient';

async function getAdminPayoutsData() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('ticpin_session');
    const token = cookieStore.get('ticpin_token');

    if (!sessionCookie || !token) {
        return null;
    }

    try {
        const raw = sessionCookie.value;
        const json = Buffer.from(raw, 'base64').toString();
        const session = JSON.parse(json);

        const isAdmin = session.isAdmin || session.email === '23cs139@kpriet.ac.in';

        if (!isAdmin) {
            return null;
        }

        const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:9000';
        // Fetch payouts and organizers in parallel
        const [payoutsRes, organizersRes] = await Promise.all([
            fetch(`${backendUrl}/api/admin/payouts?page=1&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${session.id}`,
                    'Cookie': `ticpin_token=${token.value}`
                },
                next: { revalidate: 0 } 
            }),
            fetch(`${backendUrl}/api/admin/payouts/organizers`, {
                headers: {
                    'Authorization': `Bearer ${session.id}`,
                    'Cookie': `ticpin_token=${token.value}`
                },
                next: { revalidate: 3600 } 
            })
        ]);

        if (!payoutsRes.ok) {
            const text = await payoutsRes.text();
            console.error("Payouts fetch failed:", payoutsRes.status, text);
            return null;
        }

        if (!organizersRes.ok) {
            const text = await organizersRes.text();
            console.error("Organizers fetch failed:", organizersRes.status, text);
            return null;
        }

        const payoutsData = await payoutsRes.json();
        const organizersData = await organizersRes.json();

        return {
            payouts: payoutsData.payouts || [],
            total: payoutsData.total || 0,
            organizers: organizersData.organizers || []
        };
    } catch (err) {
        console.error("Error fetching admin payouts data:", err);
        return null;
    }
}

export default async function AdminPayoutsPage() {
    const data = await getAdminPayoutsData();

    if (!data) {
        redirect('/'); 
    }

    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-zinc-50" />}>
            <AdminPayoutsClient 
                initialPayouts={data.payouts} 
                initialTotal={data.total}
                initialOrganizers={data.organizers}
            />
        </Suspense>
    );
}
