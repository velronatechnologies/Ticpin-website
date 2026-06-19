'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyPassPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/pass');
    }, [router]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
