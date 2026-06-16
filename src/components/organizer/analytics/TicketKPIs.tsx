'use client';

import React from 'react';
import { Ticket, DollarSign, Percent } from 'lucide-react';

interface TicketKPIsProps {
    ticketsSold: number;
    totalRevenue: number;
    capacityPercentage: number;
    capacitySold: number;
    totalCapacity: number;
}

export default function TicketKPIs({
    ticketsSold,
    totalRevenue,
    capacityPercentage,
    capacitySold,
    totalCapacity
}: TicketKPIsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Tickets Sold */}
            <div className="bg-white p-6 border border-[#E9E9E9] rounded-[24px] shadow-sm flex flex-col justify-between h-[150px]">
                <div className="flex items-center justify-between text-[#686868]">
                    <span className="text-[12px] font-bold uppercase tracking-wider">Total Tickets Sold</span>
                    <Ticket size={20} className="text-emerald-500" />
                </div>
                <div className="mt-2">
                    <h3 className="text-[32px] font-black text-black leading-none">
                        {ticketsSold.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-[14px] font-bold text-emerald-500 mt-2 flex items-center gap-1">
                        <span>↑ 12%</span>
                        <span className="text-[#686868] font-semibold text-[12px]">vs last week</span>
                    </p>
                </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white p-6 border border-[#E9E9E9] rounded-[24px] shadow-sm flex flex-col justify-between h-[150px]">
                <div className="flex items-center justify-between text-[#686868]">
                    <span className="text-[12px] font-bold uppercase tracking-wider">Total Revenue</span>
                    <DollarSign size={20} className="text-emerald-500" />
                </div>
                <div className="mt-2">
                    <h3 className="text-[32px] font-black text-black leading-none">
                        ₹{totalRevenue >= 100000 ? `${(totalRevenue / 1000).toFixed(0)}k` : totalRevenue.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-[14px] font-bold text-emerald-500 mt-2 flex items-center gap-1">
                        <span>↑ 8%</span>
                        <span className="text-[#686868] font-semibold text-[12px]">vs last week</span>
                    </p>
                </div>
            </div>

            {/* Overall Capacity */}
            <div className="bg-white p-6 border border-[#E9E9E9] rounded-[24px] shadow-sm flex flex-col justify-between h-[150px]">
                <div className="flex items-center justify-between text-[#686868]">
                    <span className="text-[12px] font-bold uppercase tracking-wider">Overall Capacity</span>
                    <Percent size={20} className="text-[#5331EA]" />
                </div>
                <div className="mt-2">
                    <h3 className="text-[32px] font-black text-black leading-none">
                        {capacityPercentage.toFixed(0)}%
                    </h3>
                    <div className="mt-3">
                        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                            <div 
                                className="bg-[#0A2540] h-full rounded-full transition-all duration-1000"
                                style={{ width: `${capacityPercentage}%` }}
                            />
                        </div>
                        <p className="text-[12px] font-medium text-[#686868] mt-1.5 text-right">
                            {capacitySold.toLocaleString('en-IN')} / {totalCapacity.toLocaleString('en-IN')} limits
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
