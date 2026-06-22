'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getOrganizerSession } from '@/lib/auth/organizer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    
    const [isMobile, setIsMobile] = useState<boolean | null>(() => {
        if (typeof window !== 'undefined') {
            const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const mobileWidth = window.innerWidth < 768;
            return mobileUA || mobileWidth;
        }
        return null;
    });

    const [authorized, setAuthorized] = useState(false);
    const [hasCheckedSession, setHasCheckedSession] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const mobileWidth = window.innerWidth < 768;
            setIsMobile(mobileUA || mobileWidth);
        };
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) {
            router.replace('/events');
        }
    }, [isMobile, router]);

    useEffect(() => {
        if (!hasCheckedSession) return;
        if (isMobile === null || isMobile) return;
        
        if (pathname?.startsWith('/admin/login') || pathname?.startsWith('/admin/newadminpanel')) {
            setAuthorized(true);
            return;
        }
        
        const session = getOrganizerSession();
        const isAdmin = session?.isAdmin || session?.email === '23cs139@kpriet.ac.in' || session?.email === 'ramjib929@gmail.com';
        
        if (!isAdmin) {
            router.replace(`/admin/login?redirect=${encodeURIComponent(pathname || '/admin')}`);
        } else {
            setAuthorized(true);
        }
    }, [hasCheckedSession, pathname, router, isMobile]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCheckedSession(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    if (isMobile === null || isMobile || !authorized || !hasCheckedSession) {
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
