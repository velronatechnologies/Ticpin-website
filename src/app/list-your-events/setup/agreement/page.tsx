'use client';

import React from 'react';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronRight } from 'lucide-react';

export default function AgreementPage() {
    return (
        <div className="min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)]">
            {/* Content Area */}
            <main className="flex-1 px-4 md:px-14 lg:px-32 py-12 md:py-20">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Sidebar Column */}
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="05" completedSteps={['01', '02', '03', '04']} />
                    </aside>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col pt-4">
                        {/* Header Info */}
                        <div className="mb-12">
                            <p className="text-[14px] font-medium text-black opacity-80" style={{ fontFamily: 'Anek Latin' }}>
                                Backup contact added.
                            </p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>

                        {/* Mobile Sidebar */}
                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="05" completedSteps={['01', '02', '03', '04']} />
                        </div>

                        {/* Content Section */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h1
                                    className="text-[40px] font-medium text-black leading-tight"
                                    style={{ fontFamily: 'Anek Latin', wordWrap: 'break-word' }}
                                >
                                    Agreement
                                </h1>

                                <p className="text-[18px] text-[#686868] font-medium leading-relaxed max-w-2xl" style={{ fontFamily: 'Anek Latin' }}>
                                    <span className="text-[#5331EA] font-medium">Almost there!</span> Complete your onboarding by signing your digital agreement with Ticpin.
                                </p>
                            </div>

                            {/* Action Button */}
                            <div className="pt-6">
                                <button className="bg-black text-white px-8 py-3.5 rounded-[12px] flex items-center gap-3 text-[16px] font-medium transition-all group active:scale-95">
                                    Sign agreement <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
