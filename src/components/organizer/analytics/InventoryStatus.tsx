'use client';

import React from 'react';
import { Archive } from 'lucide-react';

interface InventoryItem {
    category: string;
    percentage_sold: number;
    sold: number;
    capacity: number;
}

interface InventoryStatusProps {
    items: InventoryItem[];
}

export default function InventoryStatus({ items }: InventoryStatusProps) {
    // Map of colors for progress bars
    const getBarColor = (index: number) => {
        const colors = [
            'bg-[#0A2540]', // Dark blue
            'bg-[#5C3A21]', // Gold/Brown
            'bg-[#006D44]', // Dark green
            'bg-[#CBD5E1]', // Grey/light slate
        ];
        return colors[index % colors.length];
    };

    const getTextColor = (index: number) => {
        const textColors = [
            'text-[#0A2540]',
            'text-[#5C3A21]',
            'text-[#006D44]',
            'text-zinc-500',
        ];
        return textColors[index % textColors.length];
    };

    return (
        <div className="bg-white border border-[#E9E9E9] rounded-[24px] p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-50 pb-4">
                <h3 className="text-[18px] font-black text-black font-[family-name:var(--font-anek-latin)]">
                    Inventory Status
                </h3>
                <Archive size={20} className="text-zinc-400" />
            </div>

            <div className="space-y-6">
                {items.map((item, index) => (
                    <div key={item.category} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-black font-extrabold">{item.category}</span>
                            <div className="space-x-3 text-right">
                                <span className={`${getTextColor(index)} font-black`}>
                                    {item.percentage_sold.toFixed(0)}% SOLD
                                </span>
                                <span className="text-[#686868] font-bold">
                                    {item.sold.toLocaleString('en-IN')} / {item.capacity.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-zinc-100 h-6 rounded-[8px] overflow-hidden p-0.5">
                            <div 
                                className={`h-full rounded-[6px] transition-all duration-1000 ${getBarColor(index)}`}
                                style={{ width: `${Math.min(item.percentage_sold, 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
