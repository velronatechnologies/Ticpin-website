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
        const fetchStatus = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/partners/my-status`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if ((data.status === 200 || data.success) && data.data) {
                    setStatus(data.data.status);
                    const fetchedCategory = data.data.organization_details?.category || data.data.category || null;
                    setCategory(fetchedCategory);
                    setOrganizerCategory(fetchedCategory);
                } else if (data.status === 200 && !data.data) {
                    // No verification found, redirect to setup
                    router.push('/list-your-events/setup');
                }
            } catch (error) {
                console.error('Error fetching status:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStatus();
        } else {
            // Not logged in, redirect to landing
            router.push('/list-your-events');
        }
    }, [token, router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (status === 'approved') {
        return <AfterApprovalDashboard category={category} />;
    }

    if (status === 'pending' || status === 'under_review') {
        return <UnderReviewDashboard category={category} />;
    }

    return <UnderReviewDashboard category={category} />;
}
