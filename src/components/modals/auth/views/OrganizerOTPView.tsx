'use client';

import { Mail } from 'lucide-react';

interface OrganizerOTPViewProps {
    email: string;
    emailOtp: string[];
    emailOtpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    handleEmailOtpChange: (index: number, value: string) => void;
    handleEmailOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleEmailPaste: (e: React.ClipboardEvent) => void;
    emailOtpTimer: number;
    canResendEmailOtp: boolean;
    handleResendOrganizerOtp: () => void;
    handleOrganizerVerifyOtp: () => void;
    setView: (view: any) => void;
    isLoading: boolean;
}

export default function OrganizerOTPView({
    email,
    emailOtp,
    emailOtpRefs,
    handleEmailOtpChange,
    handleEmailOtpKeyDown,
    handleEmailPaste,
    emailOtpTimer,
    canResendEmailOtp,
    handleResendOrganizerOtp,
    handleOrganizerVerifyOtp,
    setView,
    isLoading
}: OrganizerOTPViewProps) {
    return (
        <div className="h-full flex flex-col items-center justify-start p-6 bg-white overflow-y-auto scrollbar-hide">
            <div className="text-center space-y-4 mb-10">
                <div className="w-20 h-20 bg-[#5331EA]/10 text-[#5331EA] rounded-full flex items-center justify-center mx-auto">
                    <Mail size={40} />
                </div>
                <h3 className="text-[32px] text-zinc-900 font-bold">Verify your email</h3>
                <p className="text-lg text-zinc-500 font-medium">We've sent a 6-digit code to<br /><span className="text-zinc-900 font-bold">{email}</span></p>
            </div>

            <div className="flex justify-between gap-3 w-full max-w-[400px] mb-6">
                {emailOtp.map((digit, i) => (
                    <input
                        key={i}
                        ref={(el) => { emailOtpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-12 h-16 bg-white border border-zinc-200 rounded-xl text-center text-2xl font-bold focus:outline-none focus:border-[#5331EA] focus:ring-1 focus:ring-[#5331EA] shadow-sm"
                        value={digit}
                        onChange={(e) => handleEmailOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleEmailOtpKeyDown(i, e)}
                        onPaste={handleEmailPaste}
                    />
                ))}
            </div>

            <div className="text-center mb-8 space-y-2">
                <p className="text-zinc-500 font-medium"> Code expires in:
                    <span className={`ml-2 font-bold ${emailOtpTimer < 60 ? 'text-red-500' : 'text-[#5331EA]'}`}>
                        {Math.floor(emailOtpTimer / 60)}:{(emailOtpTimer % 60).toString().padStart(2, '0')}
                    </span>
                </p>
                <button
                    onClick={handleResendOrganizerOtp}
                    disabled={!canResendEmailOtp && emailOtpTimer > 270}
                    className={`text-sm font-bold transition-all ${(!canResendEmailOtp && emailOtpTimer > 270) ? 'text-zinc-300 cursor-not-allowed' : 'text-[#5331EA] hover:underline cursor-pointer'}`}
                >
                    {emailOtpTimer > 270 ? `Resend in ${emailOtpTimer - 270}s` : 'Resend Code'}
                </button>
            </div>

            <div className="w-full max-w-[400px] space-y-4">
                <button
                    onClick={handleOrganizerVerifyOtp}
                    disabled={emailOtp.join('').length !== 6 || isLoading || emailOtpTimer === 0}
                    className="w-full h-[60px] bg-black text-white text-xl font-bold rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center disabled:bg-zinc-200 disabled:cursor-not-allowed shadow-lg shadow-black/10"
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Account'}
                </button>
                <button
                    onClick={() => setView('email_register')}
                    className="w-full text-center text-zinc-500 font-medium hover:text-zinc-900 transition-colors"
                >
                    Change Email
                </button>
            </div>
        </div>
    );
}
