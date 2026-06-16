'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

interface RevenueTierItem {
    category: string;
    price: number;
    sold: number;
    revenue_contribution: number;
    revenue: number;
}

interface RevenueByTierProps {
    items: RevenueTierItem[];
}

export default function RevenueByTier({ items }: RevenueByTierProps) {
    const getBarColor = (index: number) => {
        const colors = [
            'bg-[#0A2540]',
            'bg-[#5C3A21]',
            'bg-[#006D44]',
            'bg-[#CBD5E1]',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="bg-white border border-[#E9E9E9] rounded-[24px] p-6 shadow-sm w-full font-[family-name:var(--font-anek-latin)]">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-50 pb-4">
                <h3 className="text-[18px] font-black text-black">
                    Revenue by Tier
                </h3>
                <BarChart3 size={20} className="text-zinc-400" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#E9E9E9] text-[12px] font-black text-[#686868] uppercase tracking-wider">
                            <th className="pb-3 font-extrabold">Ticket Type</th>
                            <th className="pb-3 text-center font-extrabold">Price</th>
                            <th className="pb-3 text-center font-extrabold">Sold</th>
                            <th className="pb-3 px-4 font-extrabold">Revenue Contribution</th>
                            <th className="pb-3 text-right font-extrabold">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F1F1] text-xs font-bold text-black">
                        {items.map((item, index) => (
                            <tr key={item.category} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="py-4 font-extrabold">{item.category}</td>
                                <td className="py-4 text-center text-[#686868]">
                                    ₹{item.price.toLocaleString('en-IN')}
                                </td>
                                <td className="py-4 text-center font-bold">
                                    {item.sold.toLocaleString('en-IN')}
                                </td>
                                <td className="py-4 px-4 min-w-[200px]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-zinc-100 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${getBarColor(index)}`}
                                                style={{ width: `${Math.min(item.revenue_contribution, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-[#686868] min-w-[30px] text-right">
                                            {item.revenue_contribution.toFixed(1)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 text-right font-extrabold text-black">
                                    ₹{item.revenue >= 100000 ? `${(item.revenue / 1000).toFixed(0)}k` : item.revenue.toLocaleString('en-IN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
