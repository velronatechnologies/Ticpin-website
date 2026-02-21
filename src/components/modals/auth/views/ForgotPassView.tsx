'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface ForgotPassViewProps {
    setView: (view: any) => void;
    email: string;
    setEmail: (val: string) => void;
    isLoading: boolean;
    setIsLoading: (val: boolean) => void;
}

export default function ForgotPassView({
    setView,
    email,
    setEmail,
    isLoading,
    setIsLoading
}: ForgotPassViewProps) {
    const { addToast } = useToast();

    const handleForgot = async () => {
        if (!email) {
            addToast('Please enter your email', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const response = await authApi.organizerForgotPassword(email);
            if (response.success) {
                addToast('Verification code sent to your email!', 'success');
                setView('email_reset_pass');
            } else {
                addToast(response.message || 'Failed to send reset code', 'error');
            }
        } catch (error: any) {
            addToast(error.message || 'Email not exists or connection error', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white">
            <div className="relative h-[180px] shrink-0">
                <img src="/login/banner.jpeg" className="absolute inset-0 w-full h-full object-cover" />
                <button onClick={() => setView('email_login')} className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors z-20 bg-black/20 p-2 rounded-full backdrop-blur-sm">
                    <ChevronLeft size={24} />
                </button>
            </div>

            <div className="p-6 space-y-6 flex-1 flex flex-col items-center justify-start">
                <div className="text-center space-y-2">
                    <h3 className="text-[32px] text-zinc-900 font-bold">Forgot Password?</h3>
                    <p className="text-base text-zinc-500 font-medium max-w-[400px]">Enter your email address and we'll send you a 6-digit code to reset your password.</p>
                </div>

                <div className="w-full max-w-[500px] space-y-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full h-[52px] px-6 border border-zinc-200 rounded-2xl text-lg font-medium text-black focus:outline-none focus:border-black transition-all placeholder:text-zinc-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleForgot();
                        }}
                    />

                    <button
                        onClick={handleForgot}
                        disabled={isLoading || !email}
                        className="w-full h-[52px] bg-black text-white text-xl font-bold rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center disabled:bg-zinc-200"
                    >
                        {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Code'}
                    </button>

                    <button
                        onClick={() => setView('email_login')}
                        className="w-full text-center text-zinc-500 font-medium hover:text-zinc-900 transition-colors"
                    >
                        Back to login
                    </button>
                </div>
            </div>
        </div>
    );
}
