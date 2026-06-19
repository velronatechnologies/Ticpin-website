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
    const [loginType, setLoginType] = useState<'email' | 'phone'>('email');

    const [emailVal, setEmailVal] = useState('');
    const [phoneVal, setPhoneVal] = useState('');

    useEffect(() => {
        const pendingEmail = sessionStorage.getItem('otp_pending_email');
        const pendingType = sessionStorage.getItem('otp_pending_type') as 'email' | 'phone';
        
        if (pendingEmail && pendingType) {
            setIdentifier(pendingEmail);
            setLoginType(pendingType);
            if (pendingType === 'email') {
                setEmailVal(pendingEmail);
            } else {
                setPhoneVal(pendingEmail);
            }
            setOtpSent(true);
            
            const syncTimer = async () => {
                const { getRemainingCooldown } = await import('@/lib/utils/otp-state');
                const remaining = getRemainingCooldown(pendingEmail, vertical);
                setTimeLeft(remaining > 0 ? remaining : 0);
            };
            syncTimer();
        } else if (rememberedEmail) {
            setIdentifier(rememberedEmail);
            if (rememberedEmail.includes('@')) {
                setLoginType('email');
                setEmailVal(rememberedEmail);
            } else {
                setLoginType('phone');
                setPhoneVal(rememberedEmail);
            }
        }
    }, [rememberedEmail, vertical]);

    const [loading, setLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpArr, setOtpArr] = useState(['', '', '', '', '', '']);
    const [isResending, setIsResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [verificationStep, setVerificationStep] = useState<'none' | 'email_required' | 'phone_required'>('none');
    const [verificationCredential, setVerificationCredential] = useState('');
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

        if (loginType === 'phone' && !/^\d{10}$/.test(identifier)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        if (verificationStep === 'phone_required' && !/^\d{10}$/.test(verificationCredential)) {
            setError('Please enter a valid 10-digit registered mobile number for verification');
            return;
        }

        if (verificationStep === 'email_required' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verificationCredential)) {
            setError('Please enter a valid registered email address for verification');
            return;
        }

        setError('');
        setIsSending(true);

        // Wait 1 second to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const { getRemainingCooldown } = await import('@/lib/utils/otp-state');
            const remaining = getRemainingCooldown(identifier, vertical);

            if (remaining > 0) {
                // Cooldown is active: just show the timer with remaining time immediately
                setTimeLeft(remaining);
                setOtpSent(true);
                sessionStorage.setItem('otp_pending_email', identifier);
                sessionStorage.setItem('otp_pending_type', loginType);
                setIsSending(false);
                return;
            }
        } catch (importErr) {
            console.error('Error importing otp-state:', importErr);
        }

        // Show UI immediately!
        setOtpSent(true);
        setTimeLeft(120);
        sessionStorage.setItem('otp_pending_email', identifier);
        sessionStorage.setItem('otp_pending_type', loginType);

        // Start background API call
        authApi.login(identifier, vertical, verificationCredential)
            .then(async (res) => {
                if (res.status === 'phone_verification_required') {
                    setOtpSent(false);
                    setTimeLeft(0);
                    sessionStorage.removeItem('otp_pending_email');
                    sessionStorage.removeItem('otp_pending_type');
                    setVerificationStep('phone_required');
                    setError('');
                    setIsSending(false);
                    return;
                } else if (res.status === 'email_verification_required') {
                    setOtpSent(false);
                    setTimeLeft(0);
                    sessionStorage.removeItem('otp_pending_email');
                    sessionStorage.removeItem('otp_pending_type');
                    setVerificationStep('email_required');
                    setError('');
                    setIsSending(false);
                    return;
                }

                const { setOTPSentAt } = await import('@/lib/utils/otp-state');
                setOTPSentAt(identifier, vertical);
                setIsSending(false);
            })
            .catch((err) => {
                setOtpSent(false);
                setTimeLeft(0);
                sessionStorage.removeItem('otp_pending_email');
                sessionStorage.removeItem('otp_pending_type');
                setIsSending(false);

                const msg = err instanceof Error ? err.message : 'Login failed';
                
                if (msg.includes('Please wait') && msg.includes('seconds')) {
                    const match = msg.match(/\d+/);
                    if (match) {
                        const seconds = parseInt(match[0], 10);
                        setTimeLeft(seconds);
                        setOtpSent(true); 
                        sessionStorage.setItem('otp_pending_email', identifier);
                        sessionStorage.setItem('otp_pending_type', loginType);
                        return;
                    }
                }

                if (msg === 'user_not_found') {
                    setError('Account not found. Please sign up first.');
                } else {
                    setError('There is an issue with sending. Please try again.');
                }
            });
    };

    const handleVerify = async () => {
        const code = otpArr.join('');
        if (code.length !== 6) { setError('Enter all 6 digits'); return; }
        setLoading(true); setError('');
        
        // Wait 1 second to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));

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
        
        // Wait 1 second to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            await authApi.resendOTP(identifier, vertical);
            const { setOTPSentAt } = await import('@/lib/utils/otp-state');
            setOTPSentAt(identifier, vertical);
            setResent(true);
            setTimeLeft(120);
        } catch (e: any) {
            const msg = e instanceof Error ? e.message : 'Could not resend OTP';
            
            // Handle cooldown error gracefully if synced backend timer is longer
            if (msg.includes('Please wait') && msg.includes('seconds')) {
                const match = msg.match(/\d+/);
                if (match) {
                    const seconds = parseInt(match[0], 10);
                    setTimeLeft(seconds);
                    return;
                }
            }
            setError(msg);
        } finally { setIsResending(false); }
    };

    const isPlay = vertical === 'play';
    const bgClass = isPlay ? 'bg-gradient-to-b from-[#FFFCED] via-white to-white' : '';
    const bgStyle = !isPlay ? { background: 'rgba(211, 203, 245, 0.1)' } : {};

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
                    

                    {!otpSent && (
                        <AuthPillSwitch 
                            value={loginType} 
                            onChange={(val) => {
                                setLoginType(val);
                                setIdentifier(val === 'email' ? emailVal : phoneVal);
                                setVerificationStep('none');
                                setVerificationCredential('');
                            }} 
                        />
                    )}

                    <div className="max-w-[700px] mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block font-medium text-[#686868]" style={{ fontSize: '20px', lineHeight: '22px' }}>
                                {loginType === 'email' ? 'Enter your email' : 'Enter phone number'}
                            </label>
                            {otpSent && (
                                <button 
                                    onClick={() => {
                                        setOtpSent(false);
                                        sessionStorage.removeItem('otp_pending_email');
                                        sessionStorage.removeItem('otp_pending_type');
                                        setTimeLeft(0);
                                        setOtpArr(['', '', '', '', '', '']);
                                    }}
                                    className="text-[#5331EA] text-sm font-medium hover:underline"
                                >
                                    Edit {loginType === 'email' ? 'email' : 'phone'}
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                            <div className="relative flex items-center flex-1">
                                {loginType === 'phone' && (
                                    <div className="absolute left-6 flex items-center gap-1.5 text-zinc-800 font-medium border-r border-[#AEAEAE] pr-3 mr-3 h-1/2">
                                        <span>+91</span>
                                        <ChevronDown size={16} className="text-[#AEAEAE]" />
                                    </div>
                                )}
                                <input 
                                    type={loginType === 'email' ? 'email' : 'tel'} 
                                    placeholder={loginType === 'email' ? 'Email address' : 'Enter phone number'} 
                                    value={identifier}
                                    disabled={otpSent}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (loginType === 'phone') {
                                            const cleaned = val.replace(/\D/g, '').slice(0, 10);
                                            setIdentifier(cleaned);
                                            setPhoneVal(cleaned);
                                        } else {
                                            setIdentifier(val);
                                            setEmailVal(val);
                                        }
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            if (!otpSent) handleSendOTP();
                                            else handleVerify();
                                        }
                                    }}
                                    className={`w-full py-4 border-[1.5px] border-[#AEAEAE] rounded-[20px] text-zinc-800 placeholder-[#AEAEAE] focus:outline-none focus:border-black transition-colors ${loginType === 'phone' ? 'pl-24 pr-6' : 'px-6'} ${otpSent ? 'bg-zinc-50 cursor-not-allowed opacity-70' : ''}`}
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

                        {verificationStep !== 'none' && (
                            <div className="mt-6 animate-in fade-in duration-200">
                                <label className="block font-medium text-[#686868] mb-4" style={{ fontSize: '20px', lineHeight: '22px' }}>
                                    {verificationStep === 'email_required' 
                                        ? 'Confirm registered email address (Backup Email)' 
                                        : 'Confirm registered mobile number'}
                                </label>
                                <div className="relative flex items-center">
                                    {verificationStep === 'phone_required' && (
                                        <div className="absolute left-6 flex items-center gap-1.5 text-zinc-800 font-medium border-r border-[#AEAEAE] pr-3 mr-3 h-1/2">
                                            <span>+91</span>
                                            <ChevronDown size={16} className="text-[#AEAEAE]" />
                                        </div>
                                    )}
                                    <input 
                                        type={verificationStep === 'email_required' ? 'email' : 'tel'} 
                                        placeholder={verificationStep === 'email_required' ? 'Enter registered email' : 'Enter registered mobile number'} 
                                        value={verificationCredential}
                                        disabled={otpSent}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (verificationStep === 'phone_required') {
                                                setVerificationCredential(val.replace(/\D/g, '').slice(0, 10));
                                            } else {
                                                setVerificationCredential(val);
                                            }
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                handleSendOTP();
                                            }
                                        }}
                                        className={`w-full py-4 border-[1.5px] border-[#AEAEAE] rounded-[20px] text-zinc-800 placeholder-[#AEAEAE] focus:outline-none focus:border-black transition-colors ${verificationStep === 'phone_required' ? 'pl-24 pr-6' : 'px-6'} ${otpSent ? 'bg-zinc-50 cursor-not-allowed opacity-70' : ''}`}
                                        style={{ height: '65px' }} 
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-start mt-4 gap-6">
                            {!otpSent ? (
                                <button onClick={handleSendOTP} disabled={isSending}
                                    className="bg-black text-white px-8 py-3 rounded-[12px] flex items-center justify-center gap-2 font-medium transition-all active:scale-95 disabled:opacity-60"
                                    style={{ fontSize: '16px', minWidth: '120px' }}>
                                    {isSending ? (
                                        <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Send OTP'
                                    )}
                                </button>
                            ) : (
                                <>
                                    <button onClick={handleVerify} disabled={loading}
                                        className="bg-black text-white px-8 py-3 rounded-[12px] flex items-center justify-center gap-2 font-medium transition-all active:scale-95 disabled:opacity-60"
                                        style={{ fontSize: '16px', minWidth: '100px' }}>
                                        {loading ? (
                                            <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Verify'
                                        )}
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
