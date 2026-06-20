'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useIdentityStore } from '@/store/useIdentityStore';
import { toast } from '@/components/ui/Toast';

export default function MobileLogin() {
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
            const res = await fetch('/backend/api/mobile/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: number }),
            });
            const d = await res.json();
            if (!res.ok) {
                setError(d.error || 'Failed to send OTP');
                setLoading(false);
                return;
            }

            const isAlreadySent = d.already_sent;
            const remaining = d.remaining_cooldown ?? 120;

            if (isAlreadySent) {
                const originalSentAt = Date.now() - (120 - remaining) * 1000;
                localStorage.setItem(`user_otp_sent_at_${number}`, originalSentAt.toString());
                // toast.success('OTP session resumed');
            } else {
                localStorage.setItem(`user_otp_sent_at_${number}`, Date.now().toString());
                toast.success('OTP sent successfully');
            }

            setView('otp');
            setTimeLeft(remaining);
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
            const res = await fetch('/backend/api/mobile/verify-otp', {
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
            // toast.success('Logged in successfully');
            
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
        <div className="min-h-screen bg-white flex justify-center">
            <div 
                className="relative bg-white overflow-hidden w-full max-w-full min-h-screen" 
                style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}
            >
                <div id="recaptcha-container"></div>

                {/* Banner Section */}
                <div 
                    className="absolute left-0 top-0 w-full h-[226px] bg-[#110D2C] overflow-hidden"
                >
                    <Image
                        src="/login/banner.jpeg"
                        alt="Login Banner"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {view === 'number' ? (
                    <div>
                        {/* Title: Enter your mobile number */}
                        <h2 
                            style={{
                                position: 'absolute',
                                width: '284px',
                                height: '28px',
                                left: '59px',
                                top: '256px',
                                fontSize: '25px',
                                fontWeight: 600,
                                lineHeight: '28px',
                                color: '#000000'
                            }}
                        >
                            Enter your mobile number
                        </h2>

                        {/* Subtitle */}
                        <p 
                            style={{
                                position: 'absolute',
                                width: '297px',
                                height: '17px',
                                left: 'calc(50% - 297px/2 + 0.5px)',
                                top: '289px',
                                fontSize: '15px',
                                fontWeight: 500,
                                lineHeight: '16px',
                                color: '#686868',
                                textAlign: 'center'
                            }}
                        >
                            Don’t have an account? We’ll set one up for you
                        </p>

                        <form onSubmit={handleSendOtp}>
                            {/* Rectangle 55 - Country Code */}
                            <div 
                                style={{
                                    boxSizing: 'border-box',
                                    position: 'absolute',
                                    width: '80px',
                                    height: '39px',
                                    left: '46px',
                                    top: '327px',
                                    border: '1px solid #686868',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: '10px',
                                    gap: '6px'
                                }}
                            >
                                {/* India Flag using styled divs */}
                                <div className="flex flex-col w-[13.39px] h-[12.54px] rounded-[1px] overflow-hidden shrink-0">
                                    <div className="h-[4.18px] bg-[#F28623]" />
                                    <div className="h-[4.18px] bg-[#F0F5F9] flex items-center justify-center">
                                        <div className="w-[3px] h-[3px] rounded-full bg-[#00247D]" />
                                    </div>
                                    <div className="h-[4.18px] bg-[#65B54E]" />
                                </div>

                                <span 
                                    style={{
                                        fontSize: '15px',
                                        fontWeight: 500,
                                        lineHeight: '16px',
                                        color: '#686868'
                                    }}
                                >
                                    +91
                                </span>
                            </div>

                            {/* Rectangle 56 - Mobile Number Input */}
                            <div 
                                style={{
                                    boxSizing: 'border-box',
                                    position: 'absolute',
                                    width: '223px',
                                    height: '39px',
                                    left: '133px',
                                    top: '327px',
                                    border: '1px solid #686868',
                                    borderRadius: '15px'
                                }}
                            >
                                <input
                                    autoFocus
                                    type="tel"
                                    placeholder="Enter mobile number"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        padding: '0 15px',
                                        fontSize: '15px',
                                        fontWeight: 500,
                                        color: '#000000'
                                    }}
                                    className="placeholder:text-[#686868]"
                                    value={number}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setNumber(val);
                                    }}
                                />
                            </div>

                            {error && (
                                <p 
                                    style={{
                                        position: 'absolute',
                                        left: '46px',
                                        top: '372px',
                                        color: '#EF4444',
                                        fontSize: '12px',
                                        fontWeight: 500
                                    }}
                                >
                                    {error}
                                </p>
                            )}

                            {/* Continue Button */}
                            <button
                                type="submit"
                                disabled={number.length !== 10 || loading}
                                style={{
                                    position: 'absolute',
                                    width: '362px',
                                    height: '39px',
                                    left: 'calc(50% - 362px/2)',
                                    top: '391px',
                                    background: number.length === 10 ? '#000000' : '#DEDEDE',
                                    borderRadius: '15px',
                                    color: number.length === 10 ? '#FFFFFF' : '#000000',
                                    fontSize: '18px',
                                    fontWeight: 500,
                                    lineHeight: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                className="active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'Continue'
                                )}
                            </button>
                        </form>

                        {/* Agreement footer */}
                        <div 
                            style={{
                                position: 'absolute',
                                width: '300px',
                                left: 'calc(50% - 150px)',
                                top: '460px',
                                textAlign: 'center',
                                fontSize: '15px',
                                fontWeight: 500,
                                color: '#686868',
                                lineHeight: '18px'
                            }}
                        >
                            By continuing, you agree to our
                            <div 
                                style={{
                                    marginTop: '8px',
                                    fontSize: '12px',
                                    color: '#686868',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '15px'
                                }}
                            >
                                <Link href="/terms" className="cursor-pointer hover:underline text-[#686868]">
                                    Terms of Service
                                </Link>
                                <Link href="/privacy" className="cursor-pointer hover:underline text-[#686868]">
                                    Privacy Policy
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Title: Enter OTP */}
                        <h2 
                            style={{
                                position: 'absolute',
                                width: '109px',
                                height: '28px',
                                left: 'calc(50% - 109px/2 + 0.5px)',
                                top: '256px',
                                fontSize: '25px',
                                fontWeight: 600,
                                lineHeight: '28px',
                                color: '#000000'
                            }}
                        >
                            Enter OTP
                        </h2>

                        {/* Subtitle */}
                        <p 
                            style={{
                                position: 'absolute',
                                width: '325px',
                                height: '15px',
                                left: 'calc(50% - 325px/2 + 0.5px)',
                                top: '289px',
                                fontSize: '14px',
                                fontWeight: 500,
                                lineHeight: '15px',
                                color: '#686868',
                                textAlign: 'center'
                            }}
                        >
                            We have sent a verification code to {number} 
                            <span 
                                onClick={() => {
                                    setView('number');
                                    setOtp(['', '', '', '', '', '']);
                                    setError('');
                                }}
                                className="text-[#5331EA] font-semibold cursor-pointer hover:underline ml-1"
                            >
                                (Change)
                            </span>
                        </p>

                        <form onSubmit={handleVerifyOtp}>
                            {/* OTP Inputs */}
                            <div 
                                style={{
                                    position: 'absolute',
                                    width: '362px',
                                    left: 'calc(50% - 362px/2)',
                                    top: '329px',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                            >
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { if (otpRefs.current) otpRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        style={{
                                            boxSizing: 'border-box',
                                            width: '48px',
                                            height: '39px',
                                            border: '1px solid #686868',
                                            borderRadius: '15px',
                                            textAlign: 'center',
                                            fontSize: '15px',
                                            fontWeight: 500,
                                            color: '#686868',
                                            outline: 'none',
                                            background: '#FFFFFF'
                                        }}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        onPaste={handleOtpPaste}
                                    />
                                ))}
                            </div>

                            {error && (
                                <p 
                                    style={{
                                        position: 'absolute',
                                        left: '32px',
                                        top: '375px',
                                        color: '#EF4444',
                                        fontSize: '12px',
                                        fontWeight: 500
                                    }}
                                >
                                    {error}
                                </p>
                            )}

                            {/* Verify Button */}
                            <button
                                type="submit"
                                disabled={otp.some(d => !d) || loading}
                                style={{
                                    position: 'absolute',
                                    width: '362px',
                                    height: '39px',
                                    left: 'calc(50% - 362px/2)',
                                    top: '393px',
                                    background: !otp.some(d => !d) ? '#000000' : '#DEDEDE',
                                    borderRadius: '15px',
                                    color: !otp.some(d => !d) ? '#FFFFFF' : '#000000',
                                    fontSize: '18px',
                                    fontWeight: 500,
                                    lineHeight: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                className="active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'Continue'
                                )}
                            </button>
                        </form>

                        {/* Resend text */}
                        <div 
                            style={{
                                position: 'absolute',
                                width: '251px',
                                left: 'calc(50% - 251px/2 + 0.5px)',
                                top: '462px',
                                textAlign: 'center',
                                fontSize: '15px',
                                fontWeight: 500,
                                color: '#686868',
                                lineHeight: '16px'
                            }}
                        >
                            {timeLeft > 0 ? (
                                <span>Resend OTP in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                            ) : (
                                <span>
                                    Didn’t get the OTP?{' '}
                                    <span 
                                        onClick={handleSendOtp}
                                        className="text-[#5331EA] font-semibold cursor-pointer hover:underline"
                                    >
                                        Resend OTP
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
