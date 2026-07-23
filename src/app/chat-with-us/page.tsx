'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatWithUsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/chat-support');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center font-sans">
            <div className="w-10 h-10 border-4 border-[#5331EA] border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
