'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    CalendarCheck, 
    IndianRupee, 
    Ticket, 
    BarChart3, 
    LogOut
} from 'lucide-react';
import { clearOrganizerSession, getOrganizerSession } from '@/lib/auth/organizer';
import Link from 'next/link';

interface SidebarProps {
    activeTab: 'overview' | 'booking' | 'payout' | 'tickets' | 'analytics';
}

export default function Sidebar({ activeTab }: SidebarProps) {
    const router = useRouter();
    const session = getOrganizerSession();

    const handleLogout = () => {
        clearOrganizerSession();
        router.push('/');
    };

    const navItems = [
        {
            id: 'overview',
            label: 'Overview',
            icon: LayoutDashboard,
            path: '/organizer/dashboard',
        },
        {
            id: 'booking',
            label: 'Bookings',
            icon: CalendarCheck,
            path: '/organizer/bookings',
        },
        {
            id: 'payout',
            label: 'Payouts',
            icon: IndianRupee,
            path: '/organizer/payouts',
        },
        {
            id: 'tickets',
            label: 'Tickets',
            icon: Ticket,
            path: '/organizer/tickets',
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3,
            path: '/organizer/analytics',
        },
    ];

    return (
        <div className="w-[280px] bg-white border-r border-[#E9E9E9] flex flex-col h-screen sticky top-0 font-[family-name:var(--font-anek-latin)] z-40">
            {/* Branding / Header */}
            <div className="p-8 border-b border-[#E9E9E9] flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-[24px] font-black tracking-tight text-black">
                        TICPIN<span className="text-[#5331EA]">.</span>
                    </span>
                </Link>
            </div>

            {/* Navigation links */}
            <div className="flex-1 py-8 px-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-[16px] transition-all duration-200 group text-left ${
                                isActive 
                                    ? 'bg-[#5331EA] text-white shadow-md' 
                                    : 'text-[#686868] hover:bg-zinc-50 hover:text-black'
                            }`}
                        >
                            <Icon 
                                size={20} 
                                className={`transition-transform group-hover:scale-110 ${
                                    isActive ? 'text-white' : 'text-[#686868] group-hover:text-black'
                                }`} 
                            />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* User Session Info & Logout */}
            <div className="p-6 border-t border-[#E9E9E9] space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-[#5331EA]/10 flex items-center justify-center text-[#5331EA] font-black text-sm">
                        {session?.email ? session.email.charAt(0).toUpperCase() : 'O'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-zinc-900 truncate">
                            {session?.email || 'Organizer'}
                        </p>
                        <p className="text-[12px] font-medium text-zinc-400 truncate capitalize font-sans">
                            {session?.vertical || 'Account'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-zinc-600 font-bold hover:text-red-600 hover:bg-red-50 transition-all text-sm"
                >
                    <span>Log Out</span>
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );
}
