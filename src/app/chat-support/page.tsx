'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useIdentityStore } from '@/store/useIdentityStore';
import ChatSupportClient from './ChatSupportClient';

export default function ChatSupportPage() {
    const router = useRouter();
    const { userSession, organizerSession, sync } = useIdentityStore();
    const [hasCheckedSession, setHasCheckedSession] = useState(false);
    const effectiveSession = organizerSession || userSession;

    // Sync session on mount
    useEffect(() => {
        sync();
    }, [sync]);

    // Session check on mount (SSR-safe)
    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCheckedSession(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (!hasCheckedSession) return;
        if (!effectiveSession) {
            router.replace('/');
            return;
        }
    }, [hasCheckedSession, effectiveSession, router]);

    if (!hasCheckedSession || !effectiveSession) {
        return (
            <div className="flex h-screen w-full items-center justify-center font-sans">
                <div className="w-10 h-10 border-4 border-[#5331EA] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center font-sans">
                <div className="w-10 h-10 border-4 border-[#5331EA] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ChatSupportClient />
        </Suspense>
    );
}
