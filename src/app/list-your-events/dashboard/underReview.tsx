'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface UnderReviewDashboardProps {
    category?: string | null;
}

export default function UnderReviewDashboard({ category }: UnderReviewDashboardProps) {
    const isPlay = category === 'play';
    const isDining = category === 'dining';
    const label = isPlay ? 'venues' : isDining ? 'outlets' : 'events';
    const createLabel = isPlay ? 'venue' : isDining ? 'outlet' : 'event';

    return (
        <div className="min-h-screen bg-[#F8F7FF] font-[family-name:var(--font-anek-latin)]">
            {/* Main Content Area */}
            <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-16 pt-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-[32px] md:text-[36px] font-medium text-black leading-tight capitaize">Your {label}</h1>
                        <p className="text-[18px] text-[#686868] font-medium mt-1">An overview of your {label}</p>
                    </div>
                    <button
                        disabled
                        className="bg-[#E5E5E5] text-white px-4 py-3 rounded-[12px] flex items-center justify-center gap-1.5 text-[15px] font-medium cursor-not-allowed leading-none"
                    >
                        <Plus size={15} />
                        Create {createLabel}
                    </button>
                </div>

                {/* Separator Line */}
                <div className="w-full pl-6 md:pl-10 mt-6 mb-16">
                    <div className="h-[1px] bg-zinc-300 w-full md:w-[95%]" />
                </div>

                {/* Under Review Status */}
                <div className="flex justify-center items-center">
                    <div className="bg-[#FFC59E] text-black px-8 py-3 rounded-[12px] font-medium text-[15px]">
                        Account under review
                    </div>
                </div>
            </main>
        </div>
    );
}
