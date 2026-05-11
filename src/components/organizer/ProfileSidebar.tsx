'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
    LayoutGrid, 
    IndianRupee, 
    PieChart, 
    LogOut, 
    X
} from 'lucide-react';
import { clearOrganizerSession, getOrganizerSession } from '@/lib/auth/organizer';

interface ProfileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    firstItemLabel?: string;
    activeTab?: 'events' | 'play' | 'dining';
}

export default function ProfileSidebar({ isOpen, onClose, firstItemLabel, activeTab }: ProfileSidebarProps) {
    const router = useRouter();
    const session = getOrganizerSession();

    const handleLogout = () => {
        clearOrganizerSession();
        router.push('/');
    };

    // Determine dynamic label and path based on activeTab
    const getDashboardInfo = () => {
        if (activeTab === 'play') return { label: 'All Plays', path: '/organizer/dashboard?category=play' };
        if (activeTab === 'dining') return { label: 'All Dinings', path: '/organizer/dashboard?category=dining' };
        return { label: 'All Events', path: '/organizer/dashboard?category=events' };
    };

    const dashboardInfo = getDashboardInfo();

    const menuItems = [
        { 
            label: firstItemLabel || dashboardInfo.label, 
            icon: LayoutGrid, 
            path: dashboardInfo.path,
            onClick: () => {
                router.push(dashboardInfo.path);
                onClose();
            }
        },
        { 
            label: 'Payouts', 
            icon: IndianRupee, 
            path: '/organizer/payouts',
            onClick: () => {
                router.push('/organizer/payouts');
                onClose();
            }
        },
        { 
            label: 'Event Analytics', 
            icon: PieChart, 
            path: '/organizer/analytics',
            onClick: () => {
                router.push('/organizer/analytics');
                onClose();
            }
        },
    ];

    return (
        <>

            {/* Sidebar */}
            <div
                className={`fixed top-[114px] w-[280px] h-[calc(100vh-114px)] bg-white shadow-[-4px_0_15px_rgba(0,0,0,0.1)] z-[100] transition-all duration-500 ease-in-out ${
                    isOpen ? 'right-0' : 'right-[-280px]'
                }`}
            >
                <div className="flex flex-col h-full border-l border-zinc-200">
                    {/* Close button for mobile/UI clarity */}
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-black transition-colors md:hidden"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex-1 pt-12">
                        {menuItems.map((item, index) => (
                            <React.Fragment key={item.label}>
                                <button
                                    onClick={item.onClick}
                                    className="w-full flex items-center justify-between px-10 py-8 group hover:bg-zinc-50 transition-all text-left"
                                >
                                    <span className="text-[25px] font-medium text-zinc-900 group-hover:translate-x-1 transition-transform" style={{ fontFamily: 'Anek Latin' }}>
                                        {item.label}
                                    </span>
                                    <item.icon size={23} className="text-zinc-900" />
                                </button>
                                {index < menuItems.length - 1 && (
                                    <div className="mx-10 border-b border-zinc-200" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                </div>
            </div>
        </>
    );
}
