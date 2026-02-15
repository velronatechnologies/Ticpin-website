'use client';

import React from 'react';
import Link from 'next/link';
import CreatorSteps from '@/app/list-your-events/list-your-Setups/CreatorSteps';
import { ChevronRight } from 'lucide-react';

export default function ListYourEventsPage() {
    return (
        <div className="min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)]">


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
                        <CreatorSteps />
                    </div>
                </div>

                {/* Footer/Button Section */}
                <div className="mt-16 md:mt-24 lg:mt-32">
                    <Link href="/list-your-events/setup">
                        <button
                            className="bg-black text-white px-8 py-4 rounded-[12px] flex items-center gap-2 text-[18px] font-medium transition-all group active:scale-95"
                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                        >
                            Start your journey <ChevronRight size={20} className="transition-transform" />
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
