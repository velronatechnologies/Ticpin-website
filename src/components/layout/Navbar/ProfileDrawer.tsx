'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
    ChevronRight, 
    ClipboardList, 
    MessageCircle, 
    FileText, 
    ShieldCheck, 
    LogOut, 
    ArrowLeft 
} from 'lucide-react';

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    userSession: any;
    session: any;
    onUserLogout: () => void;
    onOrganizerLogout: () => void;
    router: any;
}

import { passApi, type TicpinPass } from '@/lib/api/pass';

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
    isOpen,
    onClose,
    userSession,
    session,
    onUserLogout,
    onOrganizerLogout,
    router
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [pass, setPass] = useState<TicpinPass | null>(null);

    useEffect(() => {
        if (isOpen && userSession?.id) {
            passApi.getLatestPass(userSession.id).then(setPass);
        }
    }, [isOpen, userSession?.id]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let rafId: number;

        if (isOpen) {
            setIsMounted(true);
            rafId = requestAnimationFrame(() => {
                rafId = requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            });
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            document.body.style.overflow = 'unset';
            timeoutId = setTimeout(() => {
                setIsMounted(false);
            }, 300);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isOpen]);

    if (!isMounted) return null;

    const handleLogout = () => {
        if (session) {
            onOrganizerLogout();
        } else {
            onUserLogout();
        }
        onClose();
    };

    const navigateTo = (path: string) => {
        router.push(path);
        onClose();
    };

    const isAdmin = userSession?.isAdmin || 
                    userSession?.email === '23cs139@kpriet.ac.in' || 
                    session?.email === '23cs139@kpriet.ac.in';

    return (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Drawer Content */}
            <div
                className={`relative w-full max-w-[400px] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
                    isVisible ? 'translate-x-0' : 'translate-x-full'
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
                            {userSession?.profilePhoto ? (
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
                                {isAdmin ? 'Admin' : (userSession?.name || (session ? 'Organizer' : 'User'))}
                            </h3>
                            <p className="text-zinc-500 text-[14px] truncate">
                                {userSession?.phone || userSession?.email || session?.email || '+91 9887654356'}
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
                        ) : session ? (
                            /* Organizer View: Dashboard, Chat with us, View Profile, Logout */
                            <div className="space-y-4 pt-4">
                                <button 
                                    onClick={() => navigateTo(`/organizer/dashboard?category=${session.vertical || 'events'}`)}
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

                                {!isAdmin && pass && pass.status === 'active' && (
                                    <div 
                                        onClick={() => navigateTo('/pass')}
                                        className="relative w-full h-[110px] rounded-[30px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all group border-2 border-white/50 shadow-lg shadow-[#7B2FF7]/20"
                                        style={{ background: 'linear-gradient(135deg, #7B2FF7 0%, #3A1A8C 100%)' }}
                                    >
                                        {/* Grid Pattern */}
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                                        
                                        <div className="flex items-center h-full px-5 gap-5 relative z-10">
                                            {/* Logo Section */}
                                            <div className="shrink-0 flex flex-col items-center">
                                                <span className="text-[9px] font-black tracking-[0.2em] text-white/60 mb-0.5 leading-none uppercase">TICPIN</span>
                                                <span className="text-[26px] font-black tracking-widest text-white leading-none italic">PASS</span>
                                            </div>

                                            {/* Separator */}
                                            <div className="w-[1px] h-12 bg-white/20" />

                                            {/* Benefits Counters */}
                                            <div className="flex-1 flex justify-around">
                                                <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-[16px] w-[60px] h-[60px] border border-white/10">
                                                    <span className="text-[18px] font-black text-white leading-none">{pass.benefits?.turf_bookings?.remaining || 0}</span>
                                                    <div className="w-5 h-[1px] bg-white/20 my-1" />
                                                    <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Play</span>
                                                </div>
                                                <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-[16px] w-[60px] h-[60px] border border-white/10">
                                                    <span className="text-[18px] font-black text-white leading-none">{pass.benefits?.dining_vouchers?.remaining || 0}</span>
                                                    <div className="w-5 h-[1px] bg-white/20 my-1" />
                                                    <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Dining</span>
                                                </div>
                                                <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-[16px] w-[60px] h-[60px] border border-white/10">
                                                    <span className="text-[18px] font-black text-white leading-none">{pass.benefits?.events_discount_active ? 'YES' : 'NO'}</span>
                                                    <div className="w-5 h-[1px] bg-white/20 my-1" />
                                                    <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Events</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <h4 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest px-1">Support</h4>
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
                                    <h4 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest px-1">More</h4>
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
                                        <span className="flex-1 text-left font-semibold text-zinc-800 group-hover:text-red-600">Logout</span>
                                        <ChevronRight size={18} className="text-zinc-400" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDrawer;
