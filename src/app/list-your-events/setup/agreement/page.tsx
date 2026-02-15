'use client';

import React, { Suspense } from 'react';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function AgreementContent() {
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    const isPlay = category === 'play';

    return (
        <div className={`min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)] transition-colors duration-500 ${isPlay ? 'bg-[#FFF1A81A]' : 'bg-[#FBFBFF]'}`}>
            {/* Content Area */}
            <main className="flex-1 px-4 md:px-14 lg:px-32 py-12 md:py-20">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Sidebar Column */}
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="05" completedSteps={['01', '02', '03', '04']} category={category} />
                    </aside>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col pt-4 mt-[-75px]">
                        {/* Header Info */}
                        <div className="mb-12">
                            <p className="text-[14px] font-medium text-black opacity-80" style={{ fontFamily: 'Anek Latin' }}>
                                &#123; BACKUP CONTACT DETAILS &#125;
                            </p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>

                        {/* Mobile Sidebar */}
                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="05" completedSteps={['01', '02', '03', '04']} category={category} />
                        </div>

                        {/* Form Area */}
                        <div className="space-y-10 mt-[-15px]">
                            <h1 className="text-[32px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                Agreement
                            </h1>

                            <p className="text-[14px] text-[#686868] font-medium leading-relaxed max-w-2xl" style={{ fontFamily: 'Anek Latin' }}>
                                Almost there! Complete your onboarding by signing your digital agreement with Ticpin.
                            </p>

                            <div className="pt-2 flex justify-center md:justify-start">
                                <button className="bg-black text-white w-full max-w-[160px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all group active:scale-95">
                                    Sign agreement<ChevronRight size={18} className="transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function AgreementPage() {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-zinc-50" />}>
            <AgreementContent />
        </Suspense>
    );
}
