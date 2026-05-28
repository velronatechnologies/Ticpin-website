'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getOrganizerSession } from '@/lib/auth/organizer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const [hasCheckedSession, setHasCheckedSession] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCheckedSession(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!hasCheckedSession) return;
        
        if (pathname?.startsWith('/admin/login')) {
            setAuthorized(true);
            return;
        }
        
        const session = getOrganizerSession();
        const isAdmin = session?.isAdmin || session?.email === '23cs139@kpriet.ac.in' || session?.email === 'ramjib929@gmail.com';
        
        if (!isAdmin) {
            router.replace('/admin/login');
        } else {
            setAuthorized(true);
        }
    }, [hasCheckedSession, pathname, router]);

    if (!authorized || !hasCheckedSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-100" />
                    <div className="h-4 w-32 bg-zinc-100 rounded" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
