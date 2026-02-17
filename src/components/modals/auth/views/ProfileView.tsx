'use client';

import { ChevronLeft, LogOut } from 'lucide-react';

interface ProfileViewProps {
    onClose: () => void;
    showLogoutConfirm: boolean;
    setShowLogoutConfirm: (show: boolean) => void;
    logout: () => void;
    addToast: (msg: string, type: 'success' | 'error') => void;
    setNumber: (num: string) => void;
    setOtp: (otp: string[]) => void;
    setView: (view: any) => void;
    userProfile: any;
    number: string;
    savedPhone: string | null;
    isOrganizer?: boolean;
}

export default function ProfileView({
    onClose,
    showLogoutConfirm,
    setShowLogoutConfirm,
    logout,
    addToast,
    setNumber,
    setOtp,
    setView,
    userProfile,
    number,
    savedPhone,
    isOrganizer
}: ProfileViewProps) {
    if (isOrganizer) {
        return (
            <div className="flex flex-col bg-white p-8 animate-in zoom-in duration-300">
                {/* Logout Confirmation Overlay */}
                {showLogoutConfirm && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-6 animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                                <LogOut size={40} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl text-zinc-900 font-bold">Log Out?</h3>
                                <p className="text-zinc-500 font-medium">Are you sure you want to log out of your account?</p>
                            </div>
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-2xl hover:bg-zinc-200 transition-colors font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        logout();
                                        addToast('You have been logged out', 'success');
                                        setShowLogoutConfirm(false);
                                        setView('number');
                                        setNumber('');
                                        setOtp(['', '', '', '', '', '']);
                                        setTimeout(() => {
                                            onClose();
                                        }, 300);
                                    }}
                                    className="flex-1 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 font-bold"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl text-zinc-900 font-bold">Account</h3>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                        <ChevronLeft size={24} className="rotate-270" />
                    </button>
                </div>

                <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 bg-[#5331EA]/10 rounded-full flex items-center justify-center text-[#5331EA]">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div className="flex-1 space-y-1">
                        <h4 className="text-2xl font-bold text-zinc-900">{userProfile?.name || 'Organizer'}</h4>
                        <div className="flex items-center gap-2">
                            <p className="text-zinc-500 font-medium">{userProfile?.email || 'Loading email...'}</p>
                            {userProfile?.is_email_verified && (
                                <div className="bg-green-100 text-green-600 p-0.5 rounded-full" title="Email Verified">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => setView('profile_edit')}
                        className="w-full h-16 flex items-center justify-between px-6 bg-zinc-50 text-zinc-900 rounded-2xl hover:bg-zinc-100 transition-all font-bold group"
                    >
                        <div className="flex items-center gap-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <span>Edit Profile</span>
                        </div>
                        <ChevronLeft size={18} className="rotate-180" />
                    </button>

                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full h-16 flex items-center justify-between px-6 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all font-bold group"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </div>
                        <ChevronLeft size={18} className="rotate-180" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F6F6F6] animate-in slide-in-from-right duration-500">
            {/* Logout Confirmation Overlay */}
            {showLogoutConfirm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                            <LogOut size={40} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl text-zinc-900 font-bold">Log Out?</h3>
                            <p className="text-zinc-500 font-medium">Are you sure you want to log out of your account?</p>
                        </div>
                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-2xl hover:bg-zinc-200 transition-colors font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    logout();
                                    addToast('You have been logged out', 'success');
                                    setShowLogoutConfirm(false);
                                    setView('number');
                                    setNumber('');
                                    setOtp(['', '', '', '', '', '']);
                                    setTimeout(() => {
                                        onClose();
                                    }, 300);
                                }}
                                className="flex-1 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 font-bold"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-6 px-8 pt-10 pb-6 bg-white shrink-0">
                <button onClick={onClose} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
                    <ChevronLeft size={32} strokeWidth={2.5} />
                </button>
                <h3 className="text-[32px] text-zinc-900 font-bold tracking-tight">Profile</h3>
            </div>

            <div className="flex-1 px-8 py-8 space-y-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {/* Profile Info Section (No Card Background) */}
                <div className="flex items-center gap-6 px-2 py-4">
                    <div className="w-24 h-24 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-400 shrink-0">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div className="space-y-1">
                        <h4 style={{ fontSize: '36px', fontWeight: 500, lineHeight: '100%', fontFamily: 'var(--font-anek-latin)' }} className="text-zinc-900">
                            {userProfile?.name || 'Name'}
                        </h4>
                        <div className="flex items-center gap-2">
                            <p className="text-lg text-zinc-500 font-medium tracking-tight uppercase">
                                {userProfile?.email || (number ? `+91 ${number}` : savedPhone || '{ NUMBER }')}
                            </p>
                            {userProfile?.email && userProfile?.is_email_verified && (
                                <div className="bg-green-100 text-green-600 p-0.5 rounded-full" title="Email Verified">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Menu Items Section */}
                <div className="space-y-4 pt-4">
                    {[
                        { label: 'View all bookings', action: () => { window.location.href = '/profile'; onClose(); }, hide: isOrganizer },
                        { label: 'My Profile', action: () => setView('profile_edit'), hide: isOrganizer },
                        { label: 'Chat with us', action: () => { }, hide: isOrganizer },
                        { label: 'Terms & Conditions', action: () => { }, hide: isOrganizer },
                        { label: 'Privacy Policy', action: () => { }, hide: isOrganizer },
                        { label: 'Logout', action: () => setShowLogoutConfirm(true) }
                    ].filter(item => !item.hide).map((item, idx) => (
                        <button
                            key={idx}
                            onClick={item.action}
                            className="w-full flex items-center justify-between h-[80px] px-8 bg-white rounded-[15px] shadow-sm hover:shadow-md transition-all active:scale-[0.99] group border border-zinc-100/50"
                        >
                            <span style={{ fontSize: '20px', fontWeight: 500, lineHeight: '100%', fontFamily: 'var(--font-anek-latin)' }} className="text-zinc-500 group-hover:text-zinc-900 transition-colors">{item.label}</span>
                            <ChevronLeft size={20} className="rotate-180 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
