'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MobileLogin from '@/components/mobile/login';
import AuthModal from '@/components/modals/AuthModal';
import { getUserSession } from '@/lib/auth/user';

const getTargetOnCloseWithoutAuth = (redirectVal: string): string => {
    const cleanPath = redirectVal.split('?')[0];
    const eventMatch = cleanPath.match(/^\/events\/([^/]+)/);
    if (eventMatch && eventMatch[1] && eventMatch[1] !== 'artist') {
        return `/events/${eventMatch[1]}`;
    }
    const diningMatch = cleanPath.match(/^\/dining\/venue\/([^/]+)/);
    if (diningMatch && diningMatch[1]) {
        return `/dining`;
    }
    const playMatch = cleanPath.match(/^\/play\/([^/]+)/);
    if (playMatch && playMatch[1]) {
        return `/play`;
    }
    return '/';
};

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClose = () => {
        const redirectVal = searchParams.get('redirect') || '/';
        const userSession = getUserSession();
        if (!userSession) {
            const target = getTargetOnCloseWithoutAuth(redirectVal);
            router.push(target);
        } else {
            router.push(redirectVal);
        }
    };

    if (isMobile === null) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center font-sans">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
            </div>
        );
    }

    if (isMobile === false) {
        return (
            <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#5331EA]/10 via-[#866BFF]/5 to-transparent pointer-events-none" />
                <AuthModal 
                    isOpen={true} 
                    onClose={handleClose}
                    onSuccess={() => {
                        const redirectVal = searchParams.get('redirect') || '/';
                        router.push(redirectVal);
                    }}
                />
            </div>
        );
    }

    return <MobileLogin onClose={handleClose} />;
}

export default function MobileLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center font-sans">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
