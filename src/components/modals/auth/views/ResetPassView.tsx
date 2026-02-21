'use client';

import { useState } from 'react';
import { Mail, ChevronLeft } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface ResetPassViewProps {
    email: string;
    emailOtp: string[];
    emailOtpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    handleEmailOtpChange: (index: number, value: string) => void;
    handleEmailOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleEmailPaste: (e: React.ClipboardEvent) => void;
    emailOtpTimer: number;
    resendTimer: number;
    canResendEmailOtp: boolean;
    handleResendOrganizerOtp: () => void;
    setView: (view: any) => void;
    isLoading: boolean;
    setIsLoading: (val: boolean) => void;
}

export default function ResetPassView({
    email,
    emailOtp,
    emailOtpRefs,
    handleEmailOtpChange,
    handleEmailOtpKeyDown,
    handleEmailPaste,
    emailOtpTimer,
    resendTimer,
    canResendEmailOtp,
    handleResendOrganizerOtp,
    setView,
    isLoading,
    setIsLoading
}: ResetPassViewProps) {
    const { addToast } = useToast();
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleReset = async () => {
        const otpCode = emailOtp.join('');
        if (otpCode.length !== 6) {
            addToast('Enter 6-digit verification code', 'error');
            return;
        }
        if (newPassword.length < 6) {
            addToast('Password must be at least 6 characters', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.organizerResetPassword({
                email,
                otp: otpCode,
                password: newPassword
            });
            if (response.success) {
                addToast('Password reset successfully! Please login.', 'success');
                setView('email_login');
            } else {
                addToast(response.message || 'Reset failed', 'error');
            }
        } catch (error: any) {
            addToast(error.message || 'Connection error', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-start p-6 bg-white overflow-y-auto scrollbar-hide">
            <button
                onClick={() => setView('email_forgot_pass')}
                className="absolute top-6 left-6 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
                <ChevronLeft size={24} />
            </button>

            <div className="text-center space-y-4 mb-8 mt-4">
                <div className="w-20 h-20 bg-[#5331EA]/10 text-[#5331EA] rounded-full flex items-center justify-center mx-auto">
                    <Mail size={40} />
                </div>
                <h3 className="text-[32px] text-zinc-900 font-bold">Reset Password</h3>
                <p className="text-base text-zinc-500 font-medium">Verify code sent to <span className="text-zinc-900 font-bold">{email}</span></p>
            </div>

            <div className="flex justify-between gap-2 w-full max-w-[380px] mb-6">
                {emailOtp.map((digit, i) => (
                    <input
                        key={i}
                        ref={(el) => { emailOtpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-12 h-14 bg-white border border-zinc-200 rounded-xl text-center text-2xl font-bold text-black focus:outline-none focus:border-[#5331EA] shadow-sm"
                        value={digit}
                        onChange={(e) => handleEmailOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleEmailOtpKeyDown(i, e)}
                        onPaste={handleEmailPaste}
                    />
                ))}
            </div>

            <div className="w-full max-w-[380px] space-y-4">
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="New Password (min 6 chars)"
                        className="w-full h-[52px] px-6 border border-zinc-200 rounded-2xl text-lg font-medium text-black focus:outline-none focus:border-black transition-all placeholder:text-zinc-400"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </button>
                </div>

                <button
                    onClick={handleReset}
                    disabled={isLoading || emailOtp.join('').length !== 6 || newPassword.length < 6}
                    className="w-full h-[55px] bg-black text-white text-xl font-bold rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center disabled:bg-zinc-200"
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                </button>

                <div className="text-center">
                    <button
                        onClick={handleResendOrganizerOtp}
                        disabled={!canResendEmailOtp || isLoading}
                        className={`text-sm font-bold ${!canResendEmailOtp ? 'text-zinc-300' : 'text-[#5331EA] hover:underline'}`}
                    >
                        {canResendEmailOtp ? 'Resend Code' : `Resend in ${emailOtpTimer}s`}
                    </button>
                </div>
            </div>
        </div>
    );
}
