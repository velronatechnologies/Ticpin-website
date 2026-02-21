'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import CreatorSteps from '@/app/list-your-events/list-your-Setups/CreatorSteps';
import { ChevronRight } from 'lucide-react';
import AuthModal from '@/components/modals/AuthModal';

function ListYourEventsContent() {
    const { token, isEmailVerified, isOrganizer, organizerCategory } = useStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    const isPlay = category === 'play';
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [view, setView] = useState<'landing' | 'choice'>('landing');

    // Remove restrictive redirection for logged-in non-organizers
    // They should be allowed to stay and proceed to setup/choice
    useEffect(() => {
        // Only redirect if there's a specific reason, but being a non-organizer 
        // who wants to list events is not a reason to kick them to home.
    }, [token, isOrganizer, router]);

    useEffect(() => {
        const checkStatus = async () => {
            if (!token) {
                setView('landing');
                return;
            }

            // If logged in, we check their partner status instead of kicking them out
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/partners/my-status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if ((data.status === 200 || data.success) && data.data) {
                    const status = data.data.status;
                    const cat = data.data.organization_details?.category || data.data.category || organizerCategory || 'event';

                    if (status === 'approved' || status === 'pending' || status === 'under_review') {
                        // Redirect to the new dashboard
                        setIsNavigating(true);
                        router.push(`/organizer-dashboard?category=${cat}`);
                    } else {
                        // For new users or other statuses (like 'new_category'), show the choice view
                        setView('choice');
                    }
                } else {
                    // Logged in but no verification profile yet
                    setView('choice');
                }
            } catch (error) {
                console.error('Error checking status:', error);
                setView('choice');
            }
        };

        checkStatus();
    }, [token, router, organizerCategory]);

    if (view === 'choice') {
        const choices = [
            { id: 'event', title: 'List Your Event', desc: 'Craft your first event and go live within 24 hours!', icon: '/list your events/011.svg' },
            { id: 'play', title: 'List Your Turf', desc: 'Onboard your sports venue and manage bookings easily.', icon: '/list your events/01.svg' },
            { id: 'dining', title: 'List Your Dining', desc: 'Showcase your restaurant and reach food enthusiasts.', icon: '/list your events/02.svg' }
        ];

        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-20">
                {isNavigating && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-[#5331EA] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-zinc-600 font-medium animate-pulse text-[15px]">Redirecting to dashboard...</p>
                        </div>
                    </div>
                )}
                <div className="max-w-[1000px] w-full space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-[36px] md:text-[48px] font-bold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            Welcome back!
                        </h1>
                        <p className="text-[18px] text-zinc-500 font-medium" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            Choose a category to start your journey as an organizer.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {choices.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => {
                                    setIsNavigating(true);
                                    router.push(`/list-your-events/setup?category=${c.id}`);
                                }}
                                className="group relative bg-white border-2 border-zinc-100 rounded-[30px] p-8 space-y-6 cursor-pointer transition-all hover:border-black hover:shadow-2xl hover:shadow-black/5 active:scale-95"
                            >
                                <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-zinc-50 group-hover:bg-zinc-100 transition-colors">
                                    <img src={c.icon} alt={c.title} className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[22px] font-bold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        {c.title}
                                    </h3>
                                    <p className="text-[14px] text-zinc-500 font-medium leading-relaxed" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        {c.desc}
                                    </p>
                                </div>
                                <div className="pt-4 flex items-center text-[15px] font-bold text-black gap-2">
                                    Start Now <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)] transition-colors duration-500 ${isPlay ? 'bg-[#FFF1A81A]' : ''}`}>
            {isNavigating && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#5331EA] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-zinc-600 font-medium animate-pulse text-[15px]">Redirecting to setup...</p>
                    </div>
                </div>
            )}
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
                                setIsAuthModalOpen(true);
                            } else {
                                setView('choice');
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
                    setIsNavigating(true);
                    const targetCategory = category || 'event';
                    router.push(`/list-your-events/setup?category=${targetCategory}`);
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
