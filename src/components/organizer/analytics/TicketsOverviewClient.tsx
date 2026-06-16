'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrganizerSession } from '@/lib/auth/organizer';
import { Download } from 'lucide-react';

import TicketKPIs from './TicketKPIs';
import InventoryStatus from './InventoryStatus';
import SalesVelocity from './SalesVelocity';
import RevenueByTier from './RevenueByTier';

interface TicketOverviewData {
    total_tickets_sold: number;
    total_revenue: number;
    overall_capacity: number;
    capacity_sold: number;
    total_capacity_limit: number;
    inventory_status: Array<{
        category: string;
        percentage_sold: number;
        sold: number;
        capacity: number;
    }>;
    sales_velocity: Array<{
        category: string;
        velocity: string;
        rate: string;
    }>;
    revenue_by_tier: Array<{
        category: string;
        price: number;
        sold: number;
        revenue_contribution: number;
        revenue: number;
    }>;
    active_event_name: string;
}

export default function TicketsOverviewClient() {
    const router = useRouter();
    const [data, setData] = useState<TicketOverviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = getOrganizerSession();
        if (!session) {
            router.replace('/list-your-dining/Login');
            return;
        }

        const fetchTicketsData = async () => {
            try {
                const res = await fetch('/backend/api/organizer/tickets/overview', {
                    headers: {
                        'Authorization': `Bearer ${session.id}`
                    }
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error('Failed to fetch tickets overview:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTicketsData();
    }, [router]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5331EA]" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px] text-zinc-500 font-bold">
                No tickets overview data found.
            </div>
        );
    }

    return (
        <div className="max-w-[1228px] mx-auto w-full space-y-8 font-[family-name:var(--font-anek-latin)]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9E9E9] pb-6">
                <div>
                    <h1 className="text-[36px] font-black text-black leading-tight">
                        Ticket Performance
                    </h1>
                    <p className="text-[16px] font-bold text-[#686868] mt-1">
                        Real-time inventory and revenue tracking for {data.active_event_name || 'your events'}.
                    </p>
                </div>

                <button 
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 border border-[#E9E9E9] hover:bg-zinc-50 text-black font-extrabold px-5 py-3 rounded-xl transition-all text-sm shadow-sm"
                >
                    <Download size={16} />
                    <span>Export</span>
                </button>
            </div>

            {/* KPIs component */}
            <TicketKPIs
                ticketsSold={data.total_tickets_sold}
                totalRevenue={data.total_revenue}
                capacityPercentage={data.overall_capacity}
                capacitySold={data.capacity_sold}
                totalCapacity={data.total_capacity_limit}
            />

            {/* Middle row: Inventory Status and Sales Velocity */}
            <div className="flex flex-col md:flex-row gap-6">
                <InventoryStatus items={data.inventory_status} />
                <SalesVelocity items={data.sales_velocity} />
            </div>

            {/* Bottom Row: Revenue by Tier */}
            <RevenueByTier items={data.revenue_by_tier} />
        </div>
    );
}
