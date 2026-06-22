'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ListYourPlayLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    
    const [isMobile, setIsMobile] = useState<boolean | null>(() => {
        if (typeof window !== 'undefined') {
            const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const mobileWidth = window.innerWidth < 768;
            return mobileUA || mobileWidth;
        }
        return null;
    });

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

    if (isMobile === null || isMobile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-200" />
                    <div className="h-4 w-32 bg-zinc-200 rounded" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
