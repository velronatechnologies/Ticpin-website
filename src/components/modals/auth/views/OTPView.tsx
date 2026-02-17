'use client';

import { X } from 'lucide-react';

interface OTPViewProps {
    onClose: () => void;
    number: string;
    setView: (view: any) => void;
    otp: string[];
    otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    handleOtpChange: (index: number, value: string) => void;
    handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
    handlePaste: (e: React.ClipboardEvent) => void;
    completeLogin: () => void;
    handleSendOtp: () => void;
    isLoading: boolean;
}

export default function OTPView({
    onClose,
    number,
    setView,
    otp,
    otpRefs,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    completeLogin,
    handleSendOtp,
    isLoading
}: OTPViewProps) {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Banner Section */}
            <div className="relative h-[320px] flex flex-col items-center justify-center p-0 overflow-hidden shrink-0">
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
                    <h3 className="text-[32px] text-zinc-900 font-bold">Enter OTP</h3>
                    <p className="text-[15px] text-zinc-500 font-medium">
                        We have sent a verification code to {number || '{ NUMBER }'}{' '}
                        <span
                            className="text-[#7c00e6] font-bold cursor-pointer hover:underline"
                            onClick={() => setView('number')}
                        >
                            (Change)
                        </span>
                    </p>
                </div>

                <div className="w-full max-w-[604px] space-y-10">
                    <div className="flex justify-between gap-3">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => { otpRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                className="w-[64px] h-[64px] bg-white border border-zinc-200 rounded-[11px] text-center text-2xl font-bold focus:outline-none focus:border-[#7c00e6] focus:ring-1 focus:ring-[#7c00e6] transition-all shadow-sm"
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={handlePaste}
                            />
                        ))}
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={completeLogin}
                            disabled={otp.join('').length !== 6 || isLoading}
                            className="w-full h-[55px] bg-black text-white text-xl font-bold rounded-[11px] hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-200 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'Continue'}
                        </button>
                        <div className="text-center">
                            <p className="text-[15px] text-zinc-500 font-medium">
                                Didn't get the OPT? <span
                                    className={`text-[#7c00e6] font-bold ${isLoading ? 'text-zinc-400 cursor-not-allowed' : 'cursor-pointer hover:underline'}`}
                                    onClick={!isLoading ? handleSendOtp : undefined}
                                >Resend OTP</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
