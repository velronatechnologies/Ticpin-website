'use client';

import { SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
    filters: string[];
}

export default function FilterBar({ filters }: FilterBarProps) {
    return (
        <div className="flex flex-wrap gap-3 px-2 font-[family-name:var(--font-anek-latin)]">
            <button className="flex items-center gap-2 px-4 py-2 border border-[#AEAEAE] rounded-[20px] hover:bg-zinc-100 uppercase transition-all group shadow-sm active:scale-95">
                <SlidersHorizontal size={18} className="text-[#686868] transition-colors" />
                <span className="text-base font-semibold text-[#686868] transition-colors">Filters</span>
            </button>
            {filters.map((filter, i) => (
                <button
                    key={i}
                    className="px-5 py-2 border border-[#AEAEAE] rounded-[20px] hover:bg-zinc-100 transition-all text-base font-semibold text-[#686868] uppercase shadow-sm active:scale-95"
                >
                    {filter}
                </button>
            ))}
        </div>
    );
}
