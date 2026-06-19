'use client';

import { ChevronLeft, ChevronRight, Pencil, PlayCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useIdentityStore } from '@/store/useIdentityStore';
import { useEffect } from 'react';

interface MobileProfileProps {
    onBack?: () => void;
}

export default function MobileProfile({ onBack }: MobileProfileProps) {
    const router = useRouter();
    const { userSession, organizerSession, sync, logoutUser, logoutOrganizer } = useIdentityStore();

    useEffect(() => {
        sync();
    }, [sync]);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    const handleLogout = () => {
        // Evict global state
        logoutUser();
        logoutOrganizer();
        useIdentityStore.persist.clearStorage();

        // Clear authentication cookies
        if (typeof document !== 'undefined') {
            const domain = window.location.hostname;
            document.cookie = `session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}`;
            document.cookie = `active_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}`;
        }

        // Evict memory and redirect to home
        window.location.href = '/';
    };

    const nameText = organizerSession?.isAdmin ? 'Admin' : 
                     (userSession?.name || organizerSession?.email || 'Guest User');
    const phoneText = organizerSession?.isAdmin ? '' : 
                     (userSession?.phone || organizerSession?.phone || '');

    const menuGroups = [
        {
            items: [
                { icon: <img src="/mobile_icons/profile_page/Vector 1.svg" alt="ticklist" className="w-6 h-6 object-contain" />, label: "Ticlists", onClick: () => router.push('/ticlists') },
                { icon: <img src="/mobile_icons/profile_page/dining-table.svg" alt="Dining" className="w-6 h-6 object-contain" />, label: "Dining reminders", onClick: () => router.push('/bookings?type=dining') },
                { icon: <img src="/mobile_icons/profile_page/guitar.svg" alt="Events" className="w-6 h-6 object-contain" />, label: "Event reminders", onClick: () => router.push('/bookings?type=events') },
                { icon: <PlayCircle size={22} className="text-[#686868]" />, label: "Play reminders", onClick: () => router.push('/bookings?type=play') },
            ]
        },
        {
            items: [
                { icon: <img src="/mobile_icons/profile_page/support.svg" alt="support" className="w-6 h-6 object-contain" />, label: "Frequently asked questions", onClick: () => router.push('/terms') },
                { icon: <img src="/mobile_icons/profile_page/chat.svg" alt="support" className="w-6 h-6 object-contain" />, label: "Chat with us", onClick: () => router.push('/chat-support') },
            ]
        },
        {
            items: [
                { icon: <img src="/mobile_icons/profile_page/profile.svg" alt="support" className="w-6 h-6 object-contain" />, label: "Account settings", onClick: () => router.push('/profile') },
                { icon: <img src="/mobile_icons/profile_page/info.svg" alt="support" className="w-6 h-6 object-contain" />, label: "About us", onClick: () => router.push('/terms') },
            ]
        },
        {
            items: [
                { icon: <img src="/mobile_icons/profile_page/logout.svg" alt="logout" className="w-6 h-6 object-contain" />, label: "Logout", onClick: handleLogout },
            ]
        }
    ];

    return (
        <div className="md:hidden min-h-screen w-full bg-[#F1F1F1] font-sans selection:bg-[#866BFF]/20 px-[15px] py-6 pb-20 overflow-y-auto" style={{ fontFamily: 'var(--font-anek-latin), sans-serif', paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}>
            {/* 1. Header Section */}
            <header className="flex items-center gap-[10px] mb-[45px]">
                <button
                    onClick={handleBack}
                    className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center border border-[#EFEFEF] active:scale-95 transition-transform"
                >
                    <ChevronLeft size={20} className="text-black" />
                </button>
                <h1 className="text-[18px] font-medium text-black">
                    Profile
                </h1>
            </header>

            {/* 2. User Info Section */}
            <div className="flex items-center justify-between mb-[26px]">
                <div className="flex items-center gap-[14px]">
                    <div className="w-[70px] h-[70px] bg-[#D9D9D9] rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <User size={30} className="text-zinc-500" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-[18px] font-medium text-black leading-none mb-1">
                            {nameText}
                        </h2>
                        {phoneText && (
                            <p className="text-[15px] font-normal text-zinc-500 leading-none">
                                {phoneText}
                            </p>
                        )}
                    </div>
                </div>
                <button className="p-2 active:scale-95 transition-transform" onClick={() => router.push('/profile')}>
                    <Pencil size={18} className="text-[#212121]" />
                </button>
            </div>

            {/* 3. Ticpin Pass Banner */}
            <div 
                className="w-full max-w-[340px] mx-auto aspect-[3/1] rounded-[12px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform mb-[20px]"
                onClick={() => router.push('/pass')}
            >
                <img src="/ticpin banner.jpg" alt="Ticpin Pass" className="w-full h-full object-cover" />
            </div>

            {/* 4. Your Bookings Section */}
            <div className="mb-[35px]">
                <h3 className="text-[18px] font-medium text-black mb-[15px]">
                    Your bookings
                </h3>
                <div className="flex gap-[15px] overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { icon: <img src="/mobile_icons/profile_page/dining-table.svg" alt="Dining" className="w-8 h-8 object-contain" />, label: "Dining bookings", onClick: () => router.push('/bookings?type=dining') },
                        { icon: <img src="/mobile_icons/profile_page/guitar.svg" alt="Events" className="w-8 h-8 object-contain" />, label: "Event tickets", onClick: () => router.push('/bookings?type=events') },
                        { icon: <PlayCircle size={32} className="text-black" />, label: "Play bookings", onClick: () => router.push('/bookings?type=play') }
                    ].map((item, i) => (
                        <div 
                            key={i} 
                            onClick={item.onClick}
                            className="flex-shrink-0 w-[134px] h-[92px] bg-white border border-[#D0D0D0] rounded-[25px] flex flex-col items-center justify-center gap-[6px] cursor-pointer active:scale-95 transition-transform"
                        >
                            {item.icon}
                            <span className="text-[15px] font-medium text-black text-center leading-none">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Menu Groups */}
            <div className="space-y-[15px]">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="bg-white rounded-[22px] border border-[#D0D0D0] overflow-hidden">
                        {group.items.map((item, itemIdx) => (
                            <div key={itemIdx}>
                                <button 
                                    onClick={item.onClick}
                                    className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors"
                                >
                                    <div className="flex items-center gap-[21px]">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            {item.icon}
                                        </div>
                                        <span className="text-[15px] font-medium text-black">
                                            {item.label}
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className="text-black" />
                                </button>
                                {itemIdx < group.items.length - 1 && (
                                    <div className="mx-5 border-b border-[#686868] opacity-50" />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* 6. Footer Spacing */}
            <div className="h-20" />
        </div>
    );
}
