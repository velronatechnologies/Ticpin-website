'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MobileLogin from '@/components/mobile/login';
import AuthModal from '@/components/modals/AuthModal';
import { useIdentityStore } from '@/store/useIdentityStore';
import { getUserSession } from '@/lib/auth/user';

const PROTECTED_ROUTES = [
    '/profile',
    '/pass/buy',
    '/bookings',
    '/my-pass',
    '/logout',
    '/ticlists',
    '/myboooking'
];

const isRouteProtected = (path: string) => {
    const cleanPath = path.split('?')[0];
    return PROTECTED_ROUTES.some(route => cleanPath.startsWith(route)) || cleanPath.includes('/book/');
};

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const { userSession } = useIdentityStore();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                    onClose={() => {
                        const redirectVal = searchParams.get('redirect') || '/';
                        if (!getUserSession() && isRouteProtected(redirectVal)) {
                            router.push('/');
                        } else {
                            router.push(redirectVal);
                        }
                    }}
                    onSuccess={() => {
                        const redirectVal = searchParams.get('redirect') || '/';
                        router.push(redirectVal);
                    }}
                />
            </div>
        );
    }

    return <MobileLogin />;
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
