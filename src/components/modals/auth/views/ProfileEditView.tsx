'use client';

import { ChevronLeft } from 'lucide-react';

interface ProfileEditViewProps {
    setView: (view: any) => void;
    name: string;
    setName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    address: string;
    setAddress: (val: string) => void;
    state: string;
    setState: (val: string) => void;
    district: string;
    setDistrict: (val: string) => void;
    country: string;
    setCountry: (val: string) => void;
    phone: string;
    handleUpdateProfile: () => void;
    isLoading: boolean;
}

export default function ProfileEditView({
    setView,
    name,
    setName,
    email,
    setEmail,
    address,
    setAddress,
    state,
    setState,
    district,
    setDistrict,
    country,
    setCountry,
    phone,
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
                    {/* Phone - VIEW ONLY */}
                    <div className="space-y-2 opacity-60">
                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">Phone Number (View Only)</label>
                        <div className="w-full h-[70px] px-6 bg-zinc-100 rounded-2xl border border-zinc-200 flex items-center text-xl font-medium text-zinc-500">
                            {phone || 'Not available'}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full h-[70px] px-6 bg-white rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#5331EA] text-xl font-medium text-black transition-all placeholder:text-zinc-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full h-[70px] px-6 bg-white rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#5331EA] text-xl font-medium text-black transition-all placeholder:text-zinc-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">Street Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter address"
                            className="w-full h-[70px] px-6 bg-white rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#5331EA] text-xl font-medium text-black transition-all placeholder:text-zinc-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">City/District</label>
                            <input
                                type="text"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                placeholder="District"
                                className="w-full h-[70px] px-6 bg-white rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#5331EA] text-xl font-medium text-black transition-all placeholder:text-zinc-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">State</label>
                            <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="State"
                                className="w-full h-[70px] px-6 bg-white rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#5331EA] text-xl font-medium text-black transition-all placeholder:text-zinc-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">Country</label>
                        <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Country"
                            className="w-full h-[70px] px-6 bg-white rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#5331EA] text-xl font-medium text-black transition-all placeholder:text-zinc-400"
                        />
                    </div>
                </div>
                <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="w-full h-[70px] bg-black text-white text-2xl font-bold rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-200 flex items-center justify-center gap-3 shadow-xl shadow-black/10 mt-4 mb-10"
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
