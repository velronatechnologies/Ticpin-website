'use client';

import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Heart, Bell, HelpCircle, MessageCircle, User, Info, LogOut, Ticket, Utensils, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useIdentityStore } from '@/store/useIdentityStore';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function MobileProfile() {
    const router = useRouter();
    const { userSession, organizerSession, sync, logoutUser } = useIdentityStore();

    const [organizerProfile, setOrganizerProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pass, setPass] = useState<any>(null);
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        sync();
    }, [sync]);

    const fetchPass = async () => {
        if (!organizerSession?.id) return;
        setPassLoading(true);
        try {
            const res = await fetch(`/backend/api/pass/user/${organizerSession.id}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setPass(data);
            }
        } catch (error) {
            console.error('Failed to fetch pass:', error);
        } finally {
            setPassLoading(false);
        }
    };

    useEffect(() => {
        if (organizerSession?.id) {
            fetchPass();
        }
    }, [organizerSession?.id]);

    useEffect(() => {
        let isMounted = true;
        
        if (organizerSession?.id) {
            const fetchProfile = async () => {
                try {
                    const res = await fetch(`/backend/api/organizer/profile`, { credentials: 'include' });
                    if (res.ok && isMounted) {
                        const data = await res.json();
                        setOrganizerProfile(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch organizer profile:', error);
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            };
            fetchProfile();
        } else {
            setLoading(false);
        }
        
        return () => {
            isMounted = false;
        };
    }, [organizerSession?.id]);

    const nameText = organizerSession?.isAdmin ? 'Admin Panel' : 
                     (organizerProfile?.name || userSession?.name || 'User');
    const phoneText = organizerSession?.isAdmin ? '' : 
                     (organizerSession ? organizerSession.email : (userSession?.phone || 'Not provided'));

    if (!userSession && !organizerSession) {
        return (
            <div className="md:hidden min-h-screen w-full bg-[#F5F5F5] font-sans px-5 py-6 overflow-x-hidden" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                <header className="flex items-center gap-[10px] mb-8">
                    <span className="text-[18px] font-semibold text-black">Profile</span>
                </header>

                <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-[24px] border border-[#E5E5E5] shadow-sm">
                    <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                        <User size={40} className="text-zinc-400" />
                    </div>
                    <p className="text-[16px] text-zinc-500 mb-6 text-center font-medium">Sign in to view your profile and bookings</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full max-w-[200px] h-[48px] bg-black text-white rounded-full text-[16px] font-medium active:scale-95 transition-all shadow-md"
                    >
                        Sign In
                    </button>
                </div>


            </div>
        );
    }

    return (
        <div className="md:hidden min-h-screen w-full bg-[#F5F5F5] font-sans px-5 pt-6 pb-20 overflow-x-hidden" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
            {/* Header with simple title */}
            <header className="flex items-center gap-[10px] mb-6">
                <span className="text-[18px] font-semibold text-black">Profile</span>
            </header>

            {/* Profile Avatar and Details block */}
            <div className="flex items-center gap-5 mb-8 px-1">
                <div className="w-[80px] h-[80px] bg-[#D9D9D9] rounded-full flex-shrink-0 overflow-hidden relative border-2 border-white shadow-sm flex items-center justify-center">
                    {userSession?.profilePhoto ? (
                        <Image src={userSession.profilePhoto} alt={nameText} fill className="object-cover" />
                    ) : (
                        <User size={36} className="text-zinc-500" />
                    )}
                </div>
                <div className="flex flex-col">
                    <h2 className="text-[22px] font-bold text-black leading-tight">{nameText}</h2>
                    {phoneText && <p className="text-[15px] font-medium text-zinc-500 mt-0.5 leading-none">{phoneText}</p>}
                </div>
            </div>

            {/* Your Bookings Title */}
            <div className="mb-6">
                <h3 className="text-[18px] font-bold text-black mb-3">Your bookings</h3>
                <div className="grid grid-cols-3 gap-3">
                    {/* Dining Bookings */}
                    <div 
                        onClick={() => router.push('/myboooking?type=dining')} 
                        className="bg-white border border-[#E5E5E5] rounded-[20px] p-4 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-all h-[110px]"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-2">
                            <Utensils size={20} className="text-zinc-700" />
                        </div>
                        <span className="text-[12px] font-bold text-black leading-tight">Dining bookings</span>
                    </div>

                    {/* Event Tickets */}
                    <div 
                        onClick={() => router.push('/myboooking?type=events')} 
                        className="bg-white border border-[#E5E5E5] rounded-[20px] p-4 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-all h-[110px]"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-2">
                            <Ticket size={20} className="text-zinc-700" />
                        </div>
                        <span className="text-[12px] font-bold text-black leading-tight">Event tickets</span>
                    </div>

                    {/* Play Bookings */}
                    <div 
                        onClick={() => router.push('/myboooking?type=play')} 
                        className="bg-white border border-[#E5E5E5] rounded-[20px] p-4 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-all h-[110px]"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-2">
                            <Activity size={20} className="text-zinc-700" />
                        </div>
                        <span className="text-[12px] font-bold text-black leading-tight">Play bookings</span>
                    </div>
                </div>
            </div>

            {/* Menu Block 1: Reminders & Ticlists */}
            <div className="bg-white rounded-[20px] border border-[#E5E5E5] overflow-hidden mb-4">
                {[
                    { icon: <Heart size={20} className="text-zinc-600" />, label: 'Ticlists', onClick: () => router.push('/ticlists') },
                    { icon: <Bell size={20} className="text-zinc-600" />, label: 'Dining reminders', onClick: () => router.push('/myboooking?type=dining') },
                    { icon: <Bell size={20} className="text-zinc-600" />, label: 'Event reminders', onClick: () => router.push('/myboooking?type=events') },
                    { icon: <Bell size={20} className="text-zinc-600" />, label: 'Play reminders', onClick: () => router.push('/myboooking?type=play') },
                ].map((item, i, arr) => (
                    <div key={i}>
                        <button onClick={item.onClick} className="w-full flex items-center justify-between px-5 h-[56px] active:bg-zinc-50 transition-colors">
                            <div className="flex items-center gap-4">
                                {item.icon}
                                <span className="text-[15px] font-semibold text-zinc-800">{item.label}</span>
                            </div>
                            <ChevronRight size={18} className="text-zinc-400" />
                        </button>
                        {i < arr.length - 1 && <div className="mx-5 border-b border-[#F0F0F0]" />}
                    </div>
                ))}
            </div>

            {/* Menu Block 2: FAQ & Chat */}
            <div className="bg-white rounded-[20px] border border-[#E5E5E5] overflow-hidden mb-4">
                {[
                    { icon: <MessageCircle size={20} className="text-zinc-600" />, label: 'Chat with us', onClick: () => router.push('/chat-support') },
                ].map((item, i, arr) => (
                    <div key={i}>
                        <button onClick={item.onClick} className="w-full flex items-center justify-between px-5 h-[56px] active:bg-zinc-50 transition-colors">
                            <div className="flex items-center gap-4">
                                {item.icon}
                                <span className="text-[15px] font-semibold text-zinc-800">{item.label}</span>
                            </div>
                            <ChevronRight size={18} className="text-zinc-400" />
                        </button>
                        {i < arr.length - 1 && <div className="mx-5 border-b border-[#F0F0F0]" />}
                    </div>
                ))}
            </div>

            {/* Menu Block 3: About */}
            <div className="bg-white rounded-[20px] border border-[#E5E5E5] overflow-hidden mb-4">
                {[
                    { icon: <Info size={20} className="text-zinc-600" />, label: 'About us', onClick: () => router.push('/terms') },
                ].map((item, i, arr) => (
                    <div key={i}>
                        <button onClick={item.onClick} className="w-full flex items-center justify-between px-5 h-[56px] active:bg-zinc-50 transition-colors">
                            <div className="flex items-center gap-4">
                                {item.icon}
                                <span className="text-[15px] font-semibold text-zinc-800">{item.label}</span>
                            </div>
                            <ChevronRight size={18} className="text-zinc-400" />
                        </button>
                        {i < arr.length - 1 && <div className="mx-5 border-b border-[#F0F0F0]" />}
                    </div>
                ))}
            </div>

            {/* Menu Block 4: Logout */}
            <div className="bg-white rounded-[20px] border border-[#E5E5E5] overflow-hidden">
                <button 
                    onClick={() => router.push('/logout')}
                    className="w-full flex items-center justify-between px-5 h-[56px] active:bg-zinc-50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <LogOut size={20} className="text-zinc-600" />
                        <span className="text-[15px] font-semibold text-zinc-800">Logout</span>
                    </div>
                    <ChevronRight size={18} className="text-zinc-400" />
                </button>
            </div>
        </div>
    );
}
