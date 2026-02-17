'use client';

import { ChevronLeft } from 'lucide-react';

interface ProfileEditViewProps {
    setView: (view: any) => void;
    name: string;
    setName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    handleUpdateProfile: () => void;
    isLoading: boolean;
}

export default function ProfileEditView({
    setView,
    name,
    setName,
    email,
    setEmail,
    handleUpdateProfile,
    isLoading
}: ProfileEditViewProps) {
    return (
        <div className="h-full flex flex-col bg-[#F6F6F6] animate-in slide-in-from-right duration-500">
            <div className="flex items-center gap-6 px-8 pt-10 pb-6 bg-white shrink-0">
                <button onClick={() => setView('profile')} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
                    <ChevronLeft size={32} strokeWidth={2.5} />
                </button>
                <h3 className="text-[32px] text-zinc-900 font-bold tracking-tight">Edit Profile</h3>
            </div>
            <div className="flex-1 px-8 py-8 space-y-8 overflow-y-auto">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full h-[70px] px-6 bg-white rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#5331EA] text-xl font-medium transition-all"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isLoading) {
                                    handleUpdateProfile();
                                }
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full h-[70px] px-6 bg-white rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#5331EA] text-xl font-medium transition-all"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isLoading) {
                                    handleUpdateProfile();
                                }
                            }}
                        />
                    </div>
                </div>
                <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="w-full h-[70px] bg-black text-white text-2xl font-bold rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-200 flex items-center justify-center gap-3 shadow-xl shadow-black/10"
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
