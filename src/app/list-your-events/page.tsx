'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import CreatorSteps from '@/app/list-your-events/list-your-Setups/CreatorSteps';
import { ChevronRight } from 'lucide-react';
import AuthModal from '@/components/modals/AuthModal';

function ListYourEventsContent() {
    const { token, isEmailVerified } = useStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    const isPlay = category === 'play';
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/partners/my-status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if ((data.status === 200 || data.success) && data.data) {
                    router.push('/list-your-events/dashboard');
                }
            } catch (error) {
                console.error('Error checking status:', error);
            }
        };
        checkStatus();
    }, [token, router]);

    return (
        <div className={`min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)] transition-colors duration-500 ${isPlay ? 'bg-[#FFF1A81A]' : ''}`}>
            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-14 py-12 md:py-20 lg:py-32">
                <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left side: Heading */}
                    <div className="w-full">
                        <h1 className="text-[40px] md:text-[45px] font-medium text-black leading-tight" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            Earn more as you grow with <br />
                            the right audience
                        </h1>
                    </div>

                    {/* Right side: Steps */}
                    <div>
                        <CreatorSteps category={category} />
                    </div>
                </div>

                {/* Footer/Button Section */}
                <div className="mt-16 md:mt-24 lg:mt-32">
                    <button
                        onClick={() => {
                            if (!token) {
                                setIsAuthModalOpen(true);
                            } else if (!isEmailVerified) {
                                // Trigger email verify view if token exists but email not verified
                                setIsAuthModalOpen(true);
                            } else {
                                router.push(`/list-your-events/setup${category ? `?category=${category}` : ''}`);
                            }
                        }}
                        className="bg-black text-white px-8 py-4 rounded-[12px] flex items-center gap-2 text-[18px] font-medium transition-all group active:scale-[0.98] shadow-xl shadow-black/10"
                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                    >
                        Start your journey <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </main>

            <AuthModal
                isOpen={isAuthModalOpen}
                isOrganizer={true}
                category={category}
                initialView={token && !isEmailVerified ? 'email_otp' : 'email_login'}
                onClose={() => setIsAuthModalOpen(false)}
                onAuthSuccess={() => {
                    setIsAuthModalOpen(false);
                    router.push(`/list-your-events/setup${category ? `?category=${category}` : ''}`);
                }}
            />
        </div>
    );
}

export default function ListYourEventsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-zinc-50" />}>
            <ListYourEventsContent />
        </Suspense>
    );
}
