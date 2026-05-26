'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreatorSteps from '@/app/list-your-play/list-your-Setups/CreatorSteps';
import { ChevronRight } from 'lucide-react';
import { getOrganizerSession } from '@/lib/auth/organizer';

export default function ListYourPlayPage() {
    const router = useRouter();
    const [hasCheckedSession, setHasCheckedSession] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCheckedSession(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!hasCheckedSession) return;

        const session = getOrganizerSession();
        if (session) {
            if (session.categoryStatus?.play) {
                router.replace('/organizer/dashboard?category=play');
            } else {
                router.replace('/list-your-play/setup');
            }
        }
    }, [hasCheckedSession, router]);

    const handleStart = () => {
        const session = getOrganizerSession();
        if (session) {
            if (session.categoryStatus?.play) {
                router.push('/organizer/dashboard?category=play');
            } else {
                router.push('/list-your-play/setup');
            }
        } else {
            router.push('/list-your-play/Login');
        }
    };

    return (
        <div
            className="overflow-hidden flex flex-col font-[family-name:var(--font-anek-latin)] h-[calc(100vh-80px)] bg-gradient-to-b from-[#FFFCED] via-white to-white"
        >
            <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-14 py-5 overflow-hidden">
                <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
                    <div className="w-full">
                        <h1 className="text-[36px] md:text-[40px] font-medium text-black leading-[44px]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            Earn more as you grow with <br />
                            the right audience
                        </h1>
                    </div>
                    <div>
                        <CreatorSteps type="play" category="play" />
                    </div>
                </div>
                <div className="mt-20 md:mt-22">
                    <button
                        onClick={handleStart}
                        className="bg-black text-white px-8 h-[65px] rounded-[20px] flex items-center justify-center gap-2 text-[20px] font-medium "
                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                    >
                        Start your journey
                        <svg width="8" height="15" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
                            <path d="M0.253911 1.47332L5.4839 6.5L0.253912 11.5267C0.0891446 11.6906 -0.00202675 11.9102 3.41559e-05 12.1382C0.00209506 12.3661 0.0972232 12.5842 0.26493 12.7454C0.432637 12.9066 0.659504 12.998 0.896669 13C1.13383 13.0019 1.36232 12.9143 1.53291 12.756L7.39969 7.11725C7.48417 7.03639 7.55104 6.94016 7.59639 6.83418C7.64174 6.7282 7.66466 6.61459 7.66381 6.5C7.66441 6.38544 7.64138 6.27191 7.59604 6.16596C7.55071 6.06001 7.48397 5.96375 7.39969 5.88275L1.53291 0.244041C1.36232 0.085679 1.13383 -0.00194841 0.896668 3.23857e-05C0.659504 0.00201318 0.432637 0.0934429 0.26493 0.25463C0.0972226 0.415818 0.00209455 0.633866 3.3663e-05 0.861811C-0.00202722 1.08976 0.0891441 1.30936 0.253911 1.47332Z" fill="white" />
                        </svg>
                    </button>
                </div>
            </main>
        </div>
    );
}
