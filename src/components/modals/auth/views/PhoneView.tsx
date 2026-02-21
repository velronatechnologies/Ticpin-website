'use client';

import { X, ChevronDown } from 'lucide-react';

interface PhoneViewProps {
    onClose: () => void;
    setView: (view: any) => void;
    number: string;
    setNumber: (val: string) => void;
    handleSendOtp: () => void;
    isLoading: boolean;
}

export default function PhoneView({
    onClose,
    setView,
    number,
    setNumber,
    handleSendOtp,
    isLoading
}: PhoneViewProps) {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Banner Section */}
            <div className="relative h-[320px] flex flex-col items-center justify-center p-0 overflow-hidden shrink-0">
                {/* Banner Image */}
                <img
                    src="/login/banner.jpeg"
                    alt="Login Banner"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <button onClick={onClose} className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-20 bg-black/20 p-2 rounded-full backdrop-blur-sm">
                    <X size={24} />
                </button>
            </div>

            <div className="p-8 space-y-6 flex-1 flex flex-col items-center justify-center bg-white ">
                <div className="text-center space-y-2">
                    <h3 className="text-[32px] text-zinc-900 font-bold">Enter your mobile number</h3>
                    <p className="text-base text-zinc-500 font-medium">Don't have an account? We'll set one up for you</p>
                </div>

                <div className="w-full max-w-[604px] space-y-8">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 bg-white border border-zinc-200 rounded-2xl h-[60px] min-w-[100px] cursor-pointer hover:border-zinc-300 transition-all">
                            <img src="https://flagcdn.com/w40/in.png" alt="IN" className="w-6 h-4 object-cover rounded-sm" />
                            <span className="text-lg text-zinc-900 font-semibold">+91</span>
                            <ChevronDown size={16} className="text-zinc-400" />
                        </div>
                        <input
                            type="tel"
                            placeholder="Enter mobile number"
                            className="flex-1 px-5 bg-white border border-zinc-200 rounded-2xl text-lg font-medium text-black focus:outline-none focus:border-zinc-900 h-[60px] transition-all placeholder:text-zinc-400"
                            value={number}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length <= 10) setNumber(val);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && number.length === 10 && !isLoading) {
                                    handleSendOtp();
                                }
                            }}
                        />
                    </div>

                    <button
                        onClick={handleSendOtp}
                        disabled={number.length < 1 || isLoading}
                        className="w-full h-[55px] bg-black text-white text-xl font-bold rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-200 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-xl shadow-black/10 flex items-center justify-center"
                    >
                        {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Continue'}
                    </button>

                    <div className="text-center space-y-4">
                        <p className="text-[13px] text-zinc-500 font-medium leading-relaxed">
                            By continuing, you agree to our<br />
                            <span className="text-zinc-400 font-semibold cursor-pointer hover:text-zinc-600 transition-colors">Terms of Service</span> &nbsp;
                            <span className="text-zinc-400 font-semibold cursor-pointer hover:text-zinc-600 transition-colors">Privacy Policy</span>
                        </p>
                        <div className="pt-2 border-t border-zinc-50">
                            <p className="text-[14px] text-zinc-600 font-medium">
                                Are you an organizer? <button onClick={() => setView('email_login')} className="text-[#5331EA] font-bold hover:underline">Login here</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
