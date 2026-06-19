'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useIdentityStore } from '@/store/useIdentityStore';
import { toast } from '@/components/ui/Toast';

export default function MobileLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';

    const { userSession, loginUser } = useIdentityStore();

    const [view, setView] = useState<'number' | 'otp'>('number');
    const [number, setNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (userSession) {
            router.replace(redirectUrl);
        }
    }, [userSession, redirectUrl, router]);

    useEffect(() => {
        if (view !== 'otp' || !number) return;

        const getRemaining = () => {
            const sentAt = localStorage.getItem(`user_otp_sent_at_${number}`);
            if (!sentAt) return 0;
            const elapsed = Math.floor((Date.now() - parseInt(sentAt, 10)) / 1000);
            const remaining = 120 - elapsed;
            return remaining > 0 ? remaining : 0;
        };

        setTimeLeft(getRemaining());

        const interval = setInterval(() => {
            const remaining = getRemaining();
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [view, number]);

    useEffect(() => {
        if (view === 'otp' && otpRefs.current?.[0]) {
            otpRefs.current[0].focus();
        }
    }, [view]);

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (number.length !== 10) {
            setError('Please enter a valid 10-digit number');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch('/backend/api/user/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: number }),
            });
            if (!res.ok) {
                const d = await res.json();
                setError(d.error || 'Failed to send OTP');
                setLoading(false);
                return;
            }
            localStorage.setItem(`user_otp_sent_at_${number}`, Date.now().toString());
            setView('otp');
            setTimeLeft(120);
            toast.success('OTP sent successfully');
        } catch (err: any) {
            console.error('Send OTP Error:', err);
            setError('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter') handleVerifyOtp();
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!data) return;
        const next = [...otp];
        data.split('').forEach((char, i) => { next[i] = char; });
        setOtp(next);
        otpRefs.current[Math.min(data.length, 5)]?.focus();
    };

    const handleVerifyOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter a 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            const token = `${number}:${otpCode}`;
            const res = await fetch('/backend/api/user/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ token }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Verification failed');
                setLoading(false);
                return;
            }

            const userData = data.user || data;
            loginUser({ id: userData.id || userData._id || number, phone: number, name: userData.name || '' });
            toast.success('Logged in successfully');
            
            // Redirect back
            router.replace(redirectUrl);
        } catch (err: any) {
            console.error('Verification Error:', err);
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans relative pb-10" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
            <div id="recaptcha-container"></div>

            {/* Top Navigation */}
            <div className="flex items-center px-6 py-5 border-b border-zinc-100">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center border border-zinc-200 active:scale-95 transition-all">
                    <ArrowLeft size={20} className="text-black" />
                </button>
                <h1 className="ml-4 text-[20px] font-bold text-black">Login</h1>
            </div>

            {/* Banner Section */}
            <div className="relative w-full h-[220px] shrink-0">
                <Image
                    src="/login/banner.jpeg"
                    alt="Login Banner"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <div className="flex-1 flex flex-col px-6 pt-8 max-w-md mx-auto w-full">
                {view === 'number' ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-[26px] font-bold text-zinc-900 leading-tight">Enter your mobile number</h2>
                            <p className="text-[14px] text-zinc-500 font-semibold leading-tight">Don't have an account? We'll set one up for you</p>
                        </div>

                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="flex gap-3">
                                <div className="flex items-center gap-1.5 px-3 bg-white border border-zinc-200 rounded-[15px] h-[55px] shrink-0">
                                    <Image src="https://flagcdn.com/w40/in.png" alt="IN" width={20} height={13} className="w-5 h-3.5 object-cover rounded-sm" />
                                    <span className="text-base text-zinc-900 font-bold">+91</span>
                                    <ChevronDown size={14} className="text-zinc-400" />
                                </div>
                                <input
                                    autoFocus
                                    type="tel"
                                    placeholder="Enter mobile number"
                                    className="flex-1 px-4 bg-white border border-zinc-200 rounded-[15px] text-base font-semibold focus:outline-none focus:border-black h-[55px] transition-all"
                                    value={number}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setNumber(val);
                                    }}
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button
                                type="submit"
                                disabled={number.length !== 10 || loading}
                                className={`w-full h-[55px] text-base font-bold rounded-[15px] transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2
                                    ${loading 
                                        ? 'bg-black text-white cursor-wait' 
                                        : 'bg-black text-white hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed'
                                    }`}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Continue'}
                            </button>
                        </form>

                        <div className="text-center pt-4">
                            <p className="text-[12px] text-zinc-400 font-semibold leading-normal">
                                By continuing, you agree to our<br />
                                <span className="text-[#3311D1] font-semibold cursor-pointer hover:underline">Terms of Service</span>&nbsp;and&nbsp;
                                <span className="text-[#3311D1] font-semibold cursor-pointer hover:underline">Privacy Policy</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-[26px] font-bold text-zinc-900 leading-tight">Enter OTP</h2>
                            <p className="text-[14px] text-zinc-500 font-semibold leading-tight">
                                We sent a 6-digit code to +91 {number}{' '}
                                <span
                                    className="text-[#3311D1] font-bold cursor-pointer hover:underline ml-1"
                                    onClick={() => {
                                        setView('number');
                                        setOtp(['', '', '', '', '', '']);
                                        setError('');
                                    }}
                                >
                                    (Change)
                                </span>
                            </p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-6 flex flex-col items-center">
                            <div className="flex justify-between gap-2 w-full">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { if (otpRefs.current) otpRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        className="w-12 h-12 bg-white border border-zinc-200 rounded-[12px] text-center text-xl font-bold focus:outline-none focus:border-black transition-all shadow-sm"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        onPaste={handleOtpPaste}
                                    />
                                ))}
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium self-start">{error}</p>}

                            <button
                                type="submit"
                                disabled={otp.some(d => !d) || loading}
                                className={`w-full h-[55px] text-base font-bold rounded-[15px] transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2
                                    ${loading 
                                        ? 'bg-black text-white cursor-wait' 
                                        : 'bg-black text-white hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed'
                                    }`}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Verify & Continue'}
                            </button>
                        </form>

                        <div className="text-center">
                            {timeLeft > 0 ? (
                                <p className="text-[14px] text-zinc-400 font-semibold">
                                    Resend OTP in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                </p>
                            ) : (
                                <p className="text-[14px] text-zinc-500 font-semibold">
                                    Didn&apos;t get the OTP?{' '}
                                    <span
                                        onClick={handleSendOtp}
                                        className="text-[#3311D1] font-bold cursor-pointer hover:underline"
                                    >
                                        Resend OTP
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
