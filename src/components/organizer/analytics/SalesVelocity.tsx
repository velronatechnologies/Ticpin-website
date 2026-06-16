'use client';

import React from 'react';
import { Gauge } from 'lucide-react';

interface VelocityItem {
    category: string;
    velocity: string;
    rate: string;
}

interface SalesVelocityProps {
    items: VelocityItem[];
}

export default function SalesVelocity({ items }: SalesVelocityProps) {
    const getPillStyles = (velocity: string) => {
        const v = velocity.toLowerCase();
        if (v === 'high') {
            return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        }
        if (v === 'medium') {
            return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        }
        return 'bg-zinc-50 text-zinc-600 border-zinc-150';
    };

    return (
        <div className="bg-white border border-[#E9E9E9] rounded-[24px] p-6 shadow-sm w-full md:w-[320px]">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-50 pb-4">
                <h3 className="text-[18px] font-black text-black font-[family-name:var(--font-anek-latin)]">
                    Sales Velocity
                </h3>
                <Gauge size={20} className="text-zinc-400" />
            </div>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div 
                        key={item.category}
                        className="flex items-center justify-between p-3 rounded-[16px] hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100"
                    >
                        <div className="flex items-center gap-3">
                            {/* Rank indicator */}
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-black text-xs text-black">
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-black leading-tight truncate max-w-[120px]">
                                    {item.category}
                                </h4>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getPillStyles(item.velocity)}`}>
                                {item.velocity}
                            </span>
                            <p className="text-[11px] font-bold text-zinc-400 mt-1">
                                {item.rate}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
