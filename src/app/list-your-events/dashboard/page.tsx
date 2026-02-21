'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import UnderReviewDashboard from './underReview';
import AfterApprovalDashboard from './afterApproval';

export default function DashboardPage() {
    const { token, setOrganizerCategory } = useStore();
    const router = useRouter();
    const [status, setStatus] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            router.replace('/organizer-dashboard');
        } else {
            router.replace('/list-your-events');
        }
    }, [token, router]);

    return <div className="min-h-screen flex items-center justify-center">Redirecting to new dashboard...</div>;
}
