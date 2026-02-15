'use client';

import React from 'react';
import { Search, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

export default function EventsDashboardPage() {
    return (
        <div className="min-h-screen bg-[#F8F7FF] font-[family-name:var(--font-anek-latin)]">
            <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-16 py-8 md:py-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-[32px] md:text-[36px] font-medium text-black leading-tight">Your events</h1>
                        <p className="text-[18px] text-[#686868] font-medium mt-1">An overview of your events</p>
                    </div>
                    <button
                        className="bg-black text-white px-4 py-3 rounded-[8px] flex items-center justify-center gap-1.5 text-[15px] font-medium transition-all hover:opacity-90 active:scale-95 leading-none"
                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                    >
                        <Plus size={15} />
                        Create event
                    </button>
                </div>

                {/* Separator */}
                <div className="w-full pl-6 md:pl-10 mb-10">
                    <div className="h-[1px] bg-zinc-300 w-[95%]" />
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="w-full bg-white border border-zinc-100 rounded-[18px] h-[72px] flex items-center px-8 shadow-sm group focus-within:ring-2 focus-within:ring-[#5331EA]/10 transition-all">
                        <input
                            type="text"
                            placeholder="Search for an event"
                            className="w-full bg-transparent border-none outline-none text-[20px] text-black placeholder:text-[#5331EA] font-medium"
                        />
                        <Search className="text-[#5331EA] w-6 h-6" />
                    </div>
                </div>

                {/* Event Card */}
                <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 relative overflow-hidden">

                    {/* Event Poster Thumbnail */}
                    <div className="w-[140px] aspect-[3/4] bg-[#EBE9FE] rounded-[12px] flex items-center justify-center text-center p-4 border border-[#DED9FF]">
                        <p className="text-[12px] font-bold text-[#5331EA] leading-tight uppercase tracking-wider">
                            {'{EVENT POSTER}'}<br />
                            <span className="font-normal normal-case opacity-60 mt-1 block tracking-normal">3:4 aspect ratio</span>
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col flex-1">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="space-y-1">
                                <h2 className="text-[28px] md:text-[32px] font-bold text-black">{'{EVENT NAME}'}</h2>
                                <p className="text-[20px] md:text-[24px] font-medium text-black opacity-80">{'{LOCATION}'}</p>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-col gap-3 items-end">
                                <span className="bg-[#FFBD92] text-black px-4 py-1.5 rounded-[12px] text-[15px] font-medium">
                                    Under review
                                </span>
                                <span className="bg-[#86EFAC] text-black px-4 py-1.5 rounded-[12px] text-[15px] font-medium">
                                    Live
                                </span>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="mt-auto pt-8">
                            <button
                                className="bg-black text-white px-4 py-3  rounded-[8px] flex items-center justify-center gap-1.5 text-[15px] font-medium transition-all hover:opacity-90 active:scale-95 leading-none"
                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                            >
                                <Settings size={18} />
                                Manage event
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
