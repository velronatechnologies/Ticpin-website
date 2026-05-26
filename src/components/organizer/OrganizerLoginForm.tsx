'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { getOrganizerSession, saveOrganizerSession } from '@/lib/auth/organizer';
import { getUserSession } from '@/lib/auth/user';
import { useIdentityStore } from '@/store/useIdentityStore';
import { toast } from '@/components/ui/Toast';
import AuthPillSwitch from '@/components/shared/auth/AuthPillSwitch';
import AuthOTPInput from '@/components/shared/auth/AuthOTPInput';
import { authApi } from '@/lib/api/auth';

interface Props {
    vertical: 'play' | 'events' | 'dining';
    setupPath: string;
    signinPath: string;
}

export default function OrganizerLoginForm({ vertical, setupPath, signinPath }: Props) {
    const { rememberedEmail } = useIdentityStore();
    const [identifier, setIdentifier] = useState('');
    const [loginType, setLoginType] = useState<'email' | 'mobile'>('email');

    useEffect(() => {
        if (rememberedEmail) {
            setIdentifier(rememberedEmail);
            if (!rememberedEmail.includes('@')) setLoginType('mobile');
        }
    }, [rememberedEmail]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpArr, setOtpArr] = useState(['', '', '', '', '', '']);
    const [isResending, setIsResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const session = getOrganizerSession();
        if (session) {
            if (session.isAdmin) {
                router.replace('/admin');
            } else {
                router.replace(session.vertical === vertical && session.categoryStatus?.[vertical]
                    ? `/organizer/dashboard?category=${vertical}`
                    : setupPath);
            }
        }
    }, [router, vertical, setupPath]);

    const handleSendOTP = async () => {
        if (!identifier) { 
            setError(loginType === 'email' ? 'Email is required' : 'Phone number is required'); 
            return; 
        }

        if (loginType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
            setError('Please enter a valid email address');
            return;
        }

        if (loginType === 'mobile' && !/^\d{10}$/.test(identifier)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const { getRemainingCooldown, setOTPSentAt } = await import('@/lib/utils/otp-state');
            const remaining = getRemainingCooldown(identifier, vertical);

            if (remaining === 0) {
                await authApi.login(identifier, vertical);
                setOTPSentAt(identifier, vertical);
            }

            sessionStorage.setItem('otp_pending_email', identifier);
            sessionStorage.setItem('otp_pending_type', loginType);
            setOtpSent(true);
        } catch (e: any) {
            const msg = e instanceof Error ? e.message : 'Login failed';
            if (msg === 'user_not_found') {
                setError('Account not found. Please sign up first.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const code = otpArr.join('');
        if (code.length !== 6) { setError('Enter all 6 digits'); return; }
        setLoading(true); setError('');
        try {
            const res: any = await authApi.verifyOTP(identifier, code, vertical);
            const id = (res._id ?? res.id ?? '') as string;
            const catStatus = res.categoryStatus ?? {};
            const isAdmin = !!res.isAdmin;
            const session = { id, email: identifier, vertical, isAdmin, categoryStatus: catStatus };
            saveOrganizerSession(session);
            useIdentityStore.getState().loginOrganizer(session);
            const { clearOTPSentAt } = await import('@/lib/utils/otp-state');
            clearOTPSentAt(identifier, vertical);

            if (isAdmin) {
                router.replace('/admin');
            } else if (catStatus[vertical]) {
                router.replace(`/organizer/dashboard?category=${vertical}`);
            } else {
                router.replace(setupPath);
            }
        } catch (e: any) {
            setError(e instanceof Error ? e.message : 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!identifier) return;
        const syncTimer = async () => {
            const { getRemainingCooldown } = await import('@/lib/utils/otp-state');
            setTimeLeft(getRemainingCooldown(identifier, vertical));
        };
        syncTimer();
        const t = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
        return () => clearInterval(t);
    }, [identifier, vertical]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleResend = async () => {
        if (timeLeft > 0 || isResending) return;
        setIsResending(true); setResent(false); setError('');
        try {
            await authApi.resendOTP(identifier, vertical);
            const { setOTPSentAt } = await import('@/lib/utils/otp-state');
            setOTPSentAt(identifier, vertical);
            setResent(true);
            setTimeLeft(180);
        } catch {
            setError('Could not resend OTP. Try again later.');
        } finally { setIsResending(false); }
    };

    const isPlay = vertical === 'play';
    const bgClass = isPlay ? 'bg-gradient-to-b from-[#FFFCED] via-white to-white' : '';
    const bgStyle = !isPlay ? { background: 'rgba(211, 203, 245, 0.1)' } : {};

    // Check if regular user is logged in
    useEffect(() => {
        const userSession = getUserSession();
        if (userSession) {
            toast.error('Please logout from your user account first to access organizer login', 5000);
            router.push('/');
        }
    }, [router]);

    return (
        <div className={`overflow-hidden flex flex-col font-[family-name:var(--font-anek-latin)] ${bgClass}`} style={{ ...bgStyle, height: 'calc(100vh - 80px)' }}>
            <main className="flex-1 flex flex-col items-center justify-start pt-20 px-6 overflow-y-auto scrollbar-hide">
                <div className="w-full max-w-[1000px]">
                    <h1 className="text-5xl font-medium text-black mb-2" style={{ fontSize: '40px', lineHeight: '44px', width: '446px' }}>
                        Set up your Ticpin account
                    </h1>
                    <div className="w-52 h-px bg-[#AEAEAE] my-8"></div>
                    <h2 className="text-3xl font-medium text-black mb-4" style={{ fontSize: '30px', lineHeight: '33px', marginBottom: '24px' }}>
                        Log in Business account
                    </h2>
                    

                    <AuthPillSwitch 
                        value={loginType} 
                        onChange={(val) => {
                            setLoginType(val);
                            if (val === 'email' && !identifier.includes('@')) setIdentifier('');
                            if (val === 'mobile' && identifier.includes('@')) setIdentifier('');
                        }} 
                    />

                    <div className="max-w-[700px] mb-8">
                        <label className="block font-medium text-[#686868] mb-4" style={{ fontSize: '20px', lineHeight: '22px' }}>
                            {loginType === 'email' ? 'Enter your email' : 'Enter phone number'}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                            <div className="relative flex items-center flex-1">
                                {loginType === 'mobile' && (
                                    <div className="absolute left-6 flex items-center gap-1.5 text-zinc-800 font-medium border-r border-[#AEAEAE] pr-3 mr-3 h-1/2">
                                        <span>+91</span>
                                        <ChevronDown size={16} className="text-[#AEAEAE]" />
                                    </div>
                                )}
                                <input 
                                    type={loginType === 'email' ? 'email' : 'tel'} 
                                    placeholder={loginType === 'email' ? 'Email address' : 'Enter phone number'} 
                                    value={identifier}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (loginType === 'mobile') {
                                            setIdentifier(val.replace(/\D/g, '').slice(0, 10));
                                        } else {
                                            setIdentifier(val);
                                        }
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            if (!otpSent) handleSendOTP();
                                            else handleVerify();
                                        }
                                    }}
                                    className={`w-full py-4 border-[1.5px] border-[#AEAEAE] rounded-[20px] text-zinc-800 placeholder-[#AEAEAE] focus:outline-none focus:border-black transition-colors ${loginType === 'mobile' ? 'pl-24 pr-6' : 'px-6'}`}
                                    style={{ height: '65px' }} />
                            </div>

                            <div className="flex items-center">
                                {otpSent ? (
                                    <AuthOTPInput 
                                        otp={otpArr} 
                                        setOtp={setOtpArr} 
                                        onComplete={handleVerify}
                                        error={!!error}
                                    />
                                ) : (
                                    <div className="hidden md:block w-40" />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-start mt-4 gap-6">
                            {!otpSent ? (
                                <button onClick={handleSendOTP} disabled={loading}
                                    className="bg-black text-white px-8 py-3 rounded-[12px] flex items-center justify-center gap-2 font-medium transition-all active:scale-95 disabled:opacity-60"
                                    style={{ fontSize: '16px' }}>
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            ) : (
                                <>
                                    <button onClick={handleVerify} disabled={loading}
                                        className="bg-black text-white px-8 py-3 rounded-[12px] flex items-center justify-center gap-2 font-medium transition-all active:scale-95 disabled:opacity-60"
                                        style={{ fontSize: '16px' }}>
                                        {loading ? 'Verifying...' : 'Verify'}
                                    </button>

                                    {timeLeft > 0 ? (
                                        <p className="text-[#AEAEAE] font-medium" style={{ fontSize: '15px' }}>Next OTP in {formatTime(timeLeft)}</p>
                                    ) : (
                                        <button onClick={handleResend} disabled={isResending}
                                            className={`text-[#5331EA] border-b border-[#5331EA] text-[15px] font-medium hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                            {isResending ? 'Sending...' : 'Resend OTP'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {error && <p className="text-red-500 text-sm mt-4 font-medium">{error}</p>}
                    </div>
                </div>
            </main>
        </div>
    );
}

