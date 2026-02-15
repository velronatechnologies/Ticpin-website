'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export default function AfterApprovalDashboard() {
    return (
        <div className="min-h-screen bg-[#F8F7FF] font-[family-name:var(--font-anek-latin)]">
            {/* Main Content Area */}
            <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-16 pt-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-[32px] md:text-[36px] font-medium text-black leading-tight">Your events</h1>
                        <p className="text-[18px] text-[#686868] font-medium mt-1">An overview of your events</p>
                    </div>
                    <button
                        className="bg-black text-white px-4 py-3 rounded-[12px] flex items-center justify-center gap-1.5 text-[15px] font-medium transition-all hover:opacity-90 active:scale-95 leading-none"
                    >
                        <Plus size={15} />
                        Create event
                    </button>
                </div>

                {/* Separator Line */}
                <div className="w-full pl-6 md:pl-10 mt-6">
                    <div className="h-[1px] bg-zinc-300 w-full md:w-[95%]" />
                </div>
            </main>
        </div>
    );
}
