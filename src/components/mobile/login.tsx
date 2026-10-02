'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ArrowLeft, X } from 'lucide-react';
import { useIdentityStore } from '@/store/useIdentityStore';
import { toast } from '@/components/ui/Toast';
import LoginView from '@/components/modals/auth/LoginView';

export default function MobileLogin({ onClose }: { onClose?: () => void }) {
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

    const redirectAfterLogin = (targetUrl: string) => {
        if (typeof window !== 'undefined') {
            window.location.replace(targetUrl);
            return;
        }
        router.replace(targetUrl);
    };

    useEffect(() => {
        if (userSession) {
            redirectAfterLogin(redirectUrl);
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

            // Spin animation for 1 second after request succeeds
            await new Promise((resolve) => setTimeout(resolve, 1000));

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
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length > 1) {
            const digits = cleanValue.slice(0, 6);
            setOtp(prev => {
                const next = [...prev];
                digits.split('').forEach((char, i) => {
                    if (index + i < 6) next[index + i] = char;
                });
                return next;
            });
            const nextFocus = Math.min(index + digits.length, 5);
            otpRefs.current[nextFocus]?.focus();
            return;
        }

        setOtp(prev => {
            const next = [...prev];
            next[index] = cleanValue;
            return next;
        });
        if (cleanValue && index < 5) otpRefs.current[index + 1]?.focus();
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
        setOtp(prev => {
            const next = [...prev];
            data.split('').forEach((char, i) => {
                if (i < 6) next[i] = char;
            });
            return next;
        });
        const nextFocus = Math.min(data.length, 5);
        otpRefs.current[nextFocus]?.focus();
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
            // toast.success('Logged in successfully');
            
            // Redirect back
            redirectAfterLogin(redirectUrl);
        } catch (err: any) {
            console.error('Verification Error:', err);
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseClick = () => {
        if (onClose) {
            onClose();
            return;
        }
        const eventMatch = redirectUrl.match(/^\/events\/([^/]+)/);
        if (eventMatch && eventMatch[1] && eventMatch[1] !== 'artist') {
            router.push(`/events/${eventMatch[1]}`);
        } else {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen w-full bg-white flex flex-col justify-start">
            <LoginView
                view={view}
                number={number}
                setNumber={setNumber}
                otp={otp}
                handleOtpChange={handleOtpChange}
                handleKeyDown={handleKeyDown}
                handleOtpPaste={handleOtpPaste}
                otpRefs={otpRefs}
                loading={loading}
                error={error}
                handleSendOtp={handleSendOtp}
                handleVerifyOtp={handleVerifyOtp}
                handleResend={handleSendOtp}
                onClose={handleCloseClick}
                timeLeft={timeLeft}
                onNumberChange={() => {
                    setView('number');
                    setOtp(['', '', '', '', '', '']);
                    setError('');
                }}
            />
        </div>
    );
}
