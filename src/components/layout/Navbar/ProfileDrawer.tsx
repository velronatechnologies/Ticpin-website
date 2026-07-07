'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    ChevronRight,
    ClipboardList,
    MessageCircle,
    FileText,
    ShieldCheck,
    LogOut,
    ArrowLeft,
    ChevronLeft,
    Pencil,
    PlayCircle
} from 'lucide-react';

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    userSession?: any;
    session?: any;
    onUserLogout?: () => void;
    onOrganizerLogout?: () => void;
    router?: any;
    /** Force a specific role view regardless of activeRole. Use 'user' on booking pages. */
    forceRole?: 'user' | 'organizer';
}

import { passApi, type TicpinPass } from '@/lib/api/pass';
import { useIdentityStore } from '@/store/useIdentityStore';
import { organizerApi } from '@/lib/api/organizer';

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
    isOpen,
    onClose,
    userSession,
    session,
    onUserLogout,
    onOrganizerLogout,
    router: routerProp,
    forceRole,
}) => {
    const nextRouter = useRouter();
    const router = routerProp || nextRouter;
    const { activeRole: storeActiveRole, switchRole } = useIdentityStore();
    const activeRole = 'user';
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [pass, setPass] = useState<TicpinPass | null>(null);
    const [organizerProfile, setOrganizerProfile] = useState<any>(null);
    const [isFetching, setIsFetching] = useState(false);

    // FIX: Consolidated data fetching to prevent multiple concurrent requests
    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            if (isFetching) return;
            setIsFetching(true);

            try {
                // Fetch user pass if user session exists
                if (userSession?.id) {
                    passApi.getLatestPass(userSession.id)
                        .then(setPass)
                        .catch((err) => console.error('[ProfileDrawer] Failed to load pass:', err));
                }

                // Fetch organizer profile if organizer session exists
                if (activeRole === 'organizer' && session?.id) {
                    organizerApi.getProfile(session.id)
                        .then((profile) => {
                            if (profile) {
                                setOrganizerProfile(profile);
                            }
                        })
                        .catch((err) => console.error('[ProfileDrawer] Failed to load organizer profile:', err));
                }
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();
    }, [isOpen, userSession?.id, activeRole, session?.id]);

    // FIX: Separate listener setup to avoid redundant fetches
    useEffect(() => {
        const handlePhotoUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            setOrganizerProfile((prev: any) => prev ? { ...prev, profilePhoto: customEvent.detail } : { profilePhoto: customEvent.detail });
        };

        window.addEventListener('profilePhotoUpdated', handlePhotoUpdate as EventListener);
        return () => {
            window.removeEventListener('profilePhotoUpdated', handlePhotoUpdate as EventListener);
        };
    }, []);

    useEffect(() => {
        let timeoutId1: NodeJS.Timeout;
        let timeoutId2: NodeJS.Timeout;

        if (isOpen) {
            setIsMounted(true);
            // Use a short timeout to ensure the DOM is mounted before visible triggers the transition
            timeoutId1 = setTimeout(() => {
                setIsVisible(true);
            }, 50);
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            document.body.style.overflow = 'unset';
            timeoutId2 = setTimeout(() => {
                setIsMounted(false);
            }, 300);
        }

        return () => {
            if (timeoutId1) clearTimeout(timeoutId1);
            if (timeoutId2) clearTimeout(timeoutId2);
        };
    }, [isOpen]);

    if (!isMounted) return null;

    const handleLogout = () => {
        if (activeRole === 'organizer') {
            onOrganizerLogout?.();
        } else {
            onUserLogout?.();
        }
        onClose();
    };

    const navigateTo = (path: string) => {
        router.push(path);
        onClose();
    };

    const isAdmin = false;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden font-[family-name:var(--font-anek-latin)]">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            {/* Drawer Content */}
            <div
                className={`hidden md:flex relative w-full max-w-[400px] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-zinc-100">
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-zinc-800" />
                    </button>
                    <h2 className="text-[20px] font-bold text-zinc-900">Profile</h2>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
                    {/* User Profile Section */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#866BFF] flex items-center justify-center text-white text-[24px] font-bold overflow-hidden shrink-0">
                            {activeRole === 'organizer' ? (
                                organizerProfile?.profilePhoto ? (
                                    <Image
                                        src={organizerProfile.profilePhoto}
                                        alt="Profile"
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    (organizerProfile?.name || session?.email || 'O').charAt(0).toUpperCase()
                                )
                            ) : userSession?.profilePhoto ? (
                                <Image
                                    src={userSession.profilePhoto}
                                    alt="Profile"
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                (userSession?.name || session?.email || 'U').charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[20px] font-bold text-zinc-900 truncate">
                                {isAdmin ? 'Admin' : (activeRole === 'organizer' ? (organizerProfile?.name || 'Organizer') : (userSession?.name || 'User'))}
                            </h3>
                            <p className="text-zinc-500 text-[14px] truncate">
                                {activeRole === 'organizer' ? (session?.email || '') : (userSession?.phone || userSession?.email || '')}
                            </p>
                        </div>
                    </div>



                    {/* Menu Items Container */}
                    <div className="space-y-6">
                        {isAdmin ? (
                            /* Admin View: Admin Panel & Logout alone */
                            <div className="space-y-4 pt-4">
                                <button
                                    onClick={() => navigateTo('/admin')}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-[20px] transition-all"
                                >
                                    <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <span className="flex-1 text-left font-semibold text-zinc-800">Admin Panel</span>
                                    <ChevronRight size={18} className="text-zinc-400" />
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-[20px] transition-all group"
                                >
                                    <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600 group-hover:text-red-600 transition-colors">
                                        <LogOut size={20} />
                                    </div>
                                    <span className="flex-1 text-left font-semibold text-zinc-800 group-hover:text-red-600">Logout</span>
                                    <ChevronRight size={18} className="text-zinc-400" />
                                </button>
                            </div>
                        ) : activeRole === 'organizer' ? (
                            /* Organizer View: Dashboard, Chat with us, View Profile, Logout */
                            <div className="space-y-4 pt-4">
                                <button
                                    onClick={() => navigateTo(`/organizer/dashboard?category=${session?.vertical || 'events'}`)}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-2xl transition-all"
                                >
                                    <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600">
                                        <ClipboardList size={20} />
                                    </div>
                                    <span className="flex-1 text-left font-semibold text-zinc-800">Dashboard</span>
                                    <ChevronRight size={18} className="text-zinc-400" />
                                </button>

                                <button
                                    onClick={() => navigateTo('/chat-support')}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-[20px] transition-all"
                                >
                                    <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600">
                                        <MessageCircle size={20} />
                                    </div>
                                    <span className="flex-1 text-left font-semibold text-zinc-800">Chat with us</span>
                                    <ChevronRight size={18} className="text-zinc-400" />
                                </button>

                                <button
                                    onClick={() => navigateTo('/organizer/profile')}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-2xl transition-all"
                                >
                                    <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600">
                                        <FileText size={20} />
                                    </div>
                                    <span className="flex-1 text-left font-semibold text-zinc-800">View Profile</span>
                                    <ChevronRight size={18} className="text-zinc-400" />
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-[20px] transition-all group"
                                >
                                    <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600 group-hover:text-red-600 transition-colors">
                                        <LogOut size={20} />
                                    </div>
                                    <span className="flex-1 text-left font-semibold text-zinc-800 group-hover:text-red-600">Logout</span>
                                    <ChevronRight size={18} className="text-zinc-400" />
                                </button>
                            </div>
                        ) : (
                            /* User View: View all bookings, Support (Chat with us), More (Terms, Privacy), Logout */
                            <div className="space-y-6">
                                <button
                                    onClick={() => navigateTo('/bookings?type=play')}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-2xl transition-all"
                                >
                                    <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600">
                                        <ClipboardList size={20} />
                                    </div>
                                    <span className="flex-1 text-left font-semibold text-zinc-800">View all bookings</span>
                                    <ChevronRight size={18} className="text-zinc-400" />
                                </button>


                                <div className="space-y-3">
                                    <h4 className="text-[13px] font-bold text-zinc-400  tracking-widest px-1" style={{ letterSpacing: '0px' }}>Support</h4>
                                    <button
                                        onClick={() => navigateTo('/chat-support')}
                                        className="w-full flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-[20px] transition-all"
                                    >
                                        <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600">
                                            <MessageCircle size={20} />
                                        </div>
                                        <span className="flex-1 text-left font-semibold text-zinc-800">Chat with us</span>
                                        <ChevronRight size={18} className="text-zinc-400" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[13px] font-bold text-zinc-400  tracking-widest px-1" style={{ letterSpacing: '0px' }}>More</h4>
                                    <div className="bg-white border border-zinc-200 rounded-[24px] overflow-hidden">
                                        <button
                                            onClick={() => navigateTo('/terms')}
                                            className="w-full flex items-center gap-4 p-4 transition-all border-b border-zinc-100"
                                        >
                                            <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600">
                                                <FileText size={20} />
                                            </div>
                                            <span className="flex-1 text-left font-semibold text-zinc-800">Terms & Conditions</span>
                                            <ChevronRight size={18} className="text-zinc-400" />
                                        </button>
                                        <button
                                            onClick={() => navigateTo('/privacy')}
                                            className="w-full flex items-center gap-4 p-4 transition-all"
                                        >
                                            <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <span className="flex-1 text-left font-semibold text-zinc-800">Privacy Policy</span>
                                            <ChevronRight size={18} className="text-zinc-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-[20px] transition-all group"
                                    >
                                        <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600 group-hover:text-red-600 transition-colors">
                                            <LogOut size={20} />
                                        </div>
                                        <span className="flex-1 text-left font-semibold text-zinc-800">Logout</span>
                                        <ChevronRight size={18} className="text-zinc-400" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div
                className={`md:hidden fixed inset-0 w-full h-full bg-[#F1F1F1] z-[100] overflow-y-auto scrollbar-hide px-[15px] py-6 transition-transform duration-300 ease-out ${
                    isVisible ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}
            >
                {/* 1. Header Section */}
                <header className="flex items-center gap-[10px] mb-[45px]">
                    <button
                        onClick={onClose}
                        className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center"
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
                        <div className="w-[70px] h-[70px] bg-[#D9D9D9] rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-zinc-600 text-2xl font-bold">
                            {activeRole === 'organizer' ? (
                                organizerProfile?.profilePhoto ? (
                                    <Image
                                        src={organizerProfile.profilePhoto}
                                        alt="Profile"
                                        width={70}
                                        height={70}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    (organizerProfile?.name || session?.email || 'O').charAt(0).toUpperCase()
                                )
                            ) : userSession?.profilePhoto ? (
                                <Image
                                    src={userSession.profilePhoto}
                                    alt="Profile"
                                    width={70}
                                    height={70}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                (userSession?.name || session?.email || 'U').charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[18px] font-medium text-black leading-none mb-1">
                                {isAdmin ? 'Admin' : (activeRole === 'organizer' ? (organizerProfile?.name || 'Organizer') : (userSession?.name || 'User'))}
                            </h2>
                            <p className="text-[15px] font-normal text-black leading-none">
                                {activeRole === 'organizer' ? (session?.email || '') : (userSession?.phone || userSession?.email || '')}
                            </p>
                        </div>
                    </div>
                </div>


                {activeRole === 'organizer' ? (
                    /* Mobile Organizer View */
                    <div className="space-y-[15px]">
                        <div className="bg-white rounded-[22px] border border-[#D0D0D0] overflow-hidden">
                            <button onClick={() => navigateTo(`/organizer/dashboard?category=${session?.vertical || 'events'}`)} className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors">
                                <div className="flex items-center gap-[21px]">
                                    <ClipboardList size={22} className="text-[#686868]" />
                                    <span className="text-[15px] font-medium text-black">
                                        Dashboard
                                    </span>
                                </div>
                                <ChevronRight size={18} className="text-black" />
                            </button>
                            <div className="mx-5 border-b border-[#686868] opacity-50" />
                            <button onClick={() => navigateTo('/chat-support')} className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors">
                                <div className="flex items-center gap-[21px]">
                                    <img src="/mobile_icons/profile_page/chat.svg" alt="chat" className="w-6 h-6 object-contain" />
                                    <span className="text-[15px] font-medium text-black">
                                        Chat with us
                                    </span>
                                </div>
                                <ChevronRight size={18} className="text-black" />
                            </button>
                            <div className="mx-5 border-b border-[#686868] opacity-50" />
                            <button onClick={() => navigateTo('/organizer/profile')} className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors">
                                <div className="flex items-center gap-[21px]">
                                    <FileText size={22} className="text-[#686868]" />
                                    <span className="text-[15px] font-medium text-black">
                                        View Profile
                                    </span>
                                </div>
                                <ChevronRight size={18} className="text-black" />
                            </button>
                        </div>

                        <div className="bg-white rounded-[22px] border border-[#D0D0D0] overflow-hidden">
                            <button onClick={handleLogout} className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors">
                                <div className="flex items-center gap-[21px]">
                                    <img src="/mobile_icons/profile_page/logout.svg" alt="logout" className="w-6 h-6 object-contain" />
                                    <span className="text-[15px] font-medium text-[#FF3B30]">
                                        Logout
                                    </span>
                                </div>
                                <ChevronRight size={18} className="text-black" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Mobile User/Consumer View */
                    <>
                        {/* 4. Your Bookings Section */}
                        <div className="mb-[35px]">
                            <h3 className="text-[18px] font-medium text-black mb-[15px]">
                                Your bookings
                            </h3>
                            <div className="flex gap-[15px] overflow-x-auto pb-2 scrollbar-hide">
                                <div 
                                    onClick={() => navigateTo('/bookings?type=dining')}
                                    className="flex-shrink-0 w-[134px] h-[92px] bg-white border border-[#D0D0D0] rounded-[25px] flex flex-col items-center justify-center gap-[6px] cursor-pointer"
                                >
                                    <img src="/mobile_icons/profile_page/dining-table.svg" alt="Dining" className="w-8 h-8 object-contain" />
                                    <span className="text-[15px] font-medium text-black text-center leading-none">
                                        Dining bookings
                                    </span>
                                </div>
                                <div 
                                    onClick={() => navigateTo('/bookings?type=events')}
                                    className="flex-shrink-0 w-[134px] h-[92px] bg-white border border-[#D0D0D0] rounded-[25px] flex flex-col items-center justify-center gap-[6px] cursor-pointer"
                                >
                                    <img src="/mobile_icons/profile_page/guitar.svg" alt="Events" className="w-8 h-8 object-contain" />
                                    <span className="text-[15px] font-medium text-black text-center leading-none">
                                        Event tickets
                                    </span>
                                </div>
                                <div 
                                    onClick={() => navigateTo('/bookings?type=play')}
                                    className="flex-shrink-0 w-[134px] h-[92px] bg-white border border-[#D0D0D0] rounded-[25px] flex flex-col items-center justify-center gap-[6px] cursor-pointer"
                                >
                                    <PlayCircle size={32} className="text-black" />
                                    <span className="text-[15px] font-medium text-black text-center leading-none">
                                        Play bookings
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 5. Menu Groups */}
                        <div className="space-y-[15px]">
                            <div className="bg-white rounded-[22px] border border-[#D0D0D0] overflow-hidden">
                                <button onClick={() => navigateTo('/ticlists')} className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors">
                                    <div className="flex items-center gap-[21px]">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <img src="/mobile_icons/profile_page/Vector 1.svg" alt="ticklist" className="w-6 h-6 object-contain" />
                                        </div>
                                        <span className="text-[15px] font-medium text-black">
                                            Ticlists
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className="text-black" />
                                </button>
                                <div className="mx-5 border-b border-[#686868] opacity-50" />
                                <button onClick={() => navigateTo('/bookings?type=dining')} className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors">
                                    <div className="flex items-center gap-[21px]">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <img src="/mobile_icons/profile_page/dining-table.svg" alt="Dining" className="w-6 h-6 object-contain" />
                                        </div>
                                        <span className="text-[15px] font-medium text-black">
                                            Dining reminders
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className="text-black" />
                                </button>
                                <div className="mx-5 border-b border-[#686868] opacity-50" />
                                <button onClick={() => navigateTo('/bookings?type=events')} className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors">
                                    <div className="flex items-center gap-[21px]">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <img src="/mobile_icons/profile_page/guitar.svg" alt="Events" className="w-6 h-6 object-contain" />
                                        </div>
                                        <span className="text-[15px] font-medium text-black">
                                            Event reminders
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className="text-black" />
                                </button>
                                <div className="mx-5 border-b border-[#686868] opacity-50" />
                                <button onClick={() => navigateTo('/bookings?type=play')} className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors">
                                    <div className="flex items-center gap-[21px]">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <PlayCircle size={22} className="text-[#686868]" />
                                        </div>
                                        <span className="text-[15px] font-medium text-black">
                                            Play reminders
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className="text-black" />
                                </button>
                            </div>

                            <div className="bg-white rounded-[22px] border border-[#D0D0D0] overflow-hidden">
                                <button onClick={() => navigateTo('/chat-support')} className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors">
                                    <div className="flex items-center gap-[21px]">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <img src="/mobile_icons/profile_page/chat.svg" alt="chat" className="w-6 h-6 object-contain" />
                                        </div>
                                        <span className="text-[15px] font-medium text-black">
                                            Chat with us
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className="text-black" />
                                </button>
                            </div>

                            <div className="bg-white rounded-[22px] border border-[#D0D0D0] overflow-hidden">
                                <button onClick={() => navigateTo('/terms')} className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors">
                                    <div className="flex items-center gap-[21px]">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <img src="/mobile_icons/profile_page/info.svg" alt="info" className="w-6 h-6 object-contain" />
                                        </div>
                                        <span className="text-[15px] font-medium text-black">
                                            About us
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className="text-black" />
                                </button>
                            </div>

                            <div className="bg-white rounded-[22px] border border-[#D0D0D0] overflow-hidden">
                                <button onClick={handleLogout} className="w-full flex items-center justify-between px-5 h-[57px] active:bg-zinc-50 transition-colors">
                                    <div className="flex items-center gap-[21px]">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <img src="/mobile_icons/profile_page/logout.svg" alt="logout" className="w-6 h-6 object-contain" />
                                        </div>
                                        <span className="text-[15px] font-medium text-[#FF3B30]">
                                            Logout
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className="text-black" />
                                </button>
                            </div>
                        </div>
                    </>
                )}


                {/* Footer Spacing */}
                <div className="h-20" />
            </div>
        </div>
        
    );
};

export default ProfileDrawer;
