'use client';

import { ChevronLeft, Mail } from 'lucide-react';

interface EmailVerifyViewProps {
    setView: (view: any) => void;
    email: string;
    emailOtp: string[];
    emailOtpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    handleEmailOtpChange: (index: number, value: string) => void;
    handleEmailOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleEmailPaste: (e: React.ClipboardEvent) => void;
    handleVerifyEmail: () => void;
    handleSendEmailOtp: () => void;
    isLoading: boolean;
}

export default function EmailVerifyView({
    setView,
    email,
    emailOtp,
    emailOtpRefs,
    handleEmailOtpChange,
    handleEmailOtpKeyDown,
    handleEmailPaste,
    handleVerifyEmail,
    handleSendEmailOtp,
    isLoading
}: EmailVerifyViewProps) {
    return (
        <div className="h-full flex flex-col bg-[#F6F6F6] animate-in slide-in-from-right duration-500">
            <div className="flex items-center gap-6 px-8 pt-10 pb-6 bg-white shrink-0">
                <button onClick={() => setView('profile_edit')} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
                    <ChevronLeft size={32} strokeWidth={2.5} />
                </button>
                <h3 className="text-[32px] text-zinc-900 font-bold tracking-tight">Verify Email</h3>
            </div>
            <div className="flex-1 px-8 py-12 space-y-10 flex flex-col items-center">
                <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-[#5331EA]/10 text-[#5331EA] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={40} />
                    </div>
                    <h4 className="text-2xl text-zinc-900 font-bold">Verify your email</h4>
                    <p className="text-lg text-zinc-500 font-medium">We've sent a 6-digit code to<br /><span className="text-zinc-900 font-bold">{email}</span></p>
                </div>

                <div className="flex justify-between gap-3 w-full max-w-md">
                    {emailOtp.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { emailOtpRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className="w-14 h-16 bg-white border border-zinc-200 rounded-xl text-center text-2xl font-bold focus:outline-none focus:border-[#5331EA] focus:ring-1 focus:ring-[#5331EA] shadow-sm"
                            value={digit}
                            onChange={(e) => handleEmailOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleEmailOtpKeyDown(i, e)}
                            onPaste={handleEmailPaste}
                        />
                    ))}
                </div>

                <div className="w-full max-w-md space-y-4">
                    <button
                        onClick={handleVerifyEmail}
                        disabled={emailOtp.join('').length !== 6 || isLoading}
                        className="w-full h-[70px] bg-[#5331EA] text-white text-2xl font-bold rounded-2xl hover:bg-[#4323d4] transition-all active:scale-[0.98] disabled:bg-zinc-200 flex items-center justify-center shadow-xl shadow-[#5331EA]/20"
                    >
                        {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify & Update'}
                    </button>
                    <button
                        onClick={handleSendEmailOtp}
                        disabled={isLoading}
                        className="w-full py-2 text-zinc-500 font-bold hover:text-[#5331EA] transition-colors"
                    >
                        Resend Code
                    </button>
                </div>
            </div>
        </div>
    );
}
