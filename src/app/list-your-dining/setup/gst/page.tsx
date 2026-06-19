'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GstSelectionPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/list-your-dining');
    }, [router]);

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
