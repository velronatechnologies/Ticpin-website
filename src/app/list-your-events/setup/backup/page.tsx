'use client';

import React, { useState, useRef } from 'react';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { organizerApi } from '@/lib/api/organizer';
import { getOrganizerSession } from '@/lib/auth/organizer';
import { toast } from '@/components/ui/Toast';

export default function BackupContactPage() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [showOtp, setShowOtp] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [identifier, setIdentifier] = useState('');
    const [prefilled, setPrefilled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    const [loginType, setLoginType] = useState<'email' | 'mobile'>('email');

    React.useEffect(() => {
        const session = getOrganizerSession();
        if (session?.email) {
            setLoginType(session.email.includes('@') ? 'email' : 'mobile');
        }

        const saved = JSON.parse(sessionStorage.getItem('setup_events') ?? '{}');
        const backupVal = session?.email.includes('@') ? saved.backupPhone : saved.backupEmail;
        
        if (backupVal) {
            setIdentifier(backupVal);
            if (saved.prefilled) setPrefilled(true);
            // Check if backup contact was already verified
            if (saved.backupVerified) {
                setShowOtp(false);
                setOtp(['', '', '', '', '', '']);
            }
        }
    }, []);

    // Check if current contact is already verified
    const saved = JSON.parse(sessionStorage.getItem('setup_events') ?? '{}');
    const isCurrentVerified = (saved.backupEmail === identifier || saved.backupPhone === identifier) && saved.backupVerified;

    const handleSkipVerification = () => {
        router.push('/list-your-events/setup/agreement');
    };

    const handleContinueWithVerified = () => {
        toast.success(`Using verified backup: ${identifier}`);
        setTimeout(() => router.push('/list-your-events/setup/agreement'), 800);
    };

    React.useEffect(() => {
        if (!showOtp || timeLeft <= 0) return;
        const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [showOtp, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSendOTP = async () => {
        if (showOtp && timeLeft > 0) return;
        
        if (loginType === 'email') {
            // Logic type email means backup MUST be mobile
            if (!/^\d{10}$/.test(identifier)) {
                toast.error('Please enter a valid 10-digit phone number.');
                return;
            }
        } else {
            // Login type mobile means backup MUST be email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
                toast.error('Please enter a valid email address.');
                return;
            }
        }

        const session = getOrganizerSession();
        if (session?.email && identifier.toLowerCase() === session.email.toLowerCase()) {
            toast.error('Backup contact must be different from your login contact.');
            return;
        }

        setLoading(true);
        try {
            await organizerApi.sendBackupOTP(session?.id ?? '', identifier, 'events');
            setShowOtp(true);
            setTimeLeft(30);
            toast.success(`OTP sent to ${identifier}`);
        } catch (err: any) {
            const msg = err instanceof Error ? err.message : 'Failed to send OTP';
            if (msg === 'email_already_in_use' || msg === 'phone_already_in_use') {
                toast.error('This contact is already being used by another organization.');
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter') handleVerifyAndContinue();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!data) return;

        const next = [...otp];
        data.split('').forEach((char, i) => {
            next[i] = char;
        });
        setOtp(next);

        // Focus the last filled input or next empty
        const focusIndex = Math.min(data.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerifyAndContinue = async () => {
        const otpValue = otp.join('');
        if (otpValue.length < 6) { toast.error('Please enter the complete 6-digit OTP.'); return; }
        const session = getOrganizerSession();
        setVerifying(true);
        try {
            await organizerApi.verifyBackupOTP(session?.id ?? '', otpValue);
            const existing = JSON.parse(sessionStorage.getItem('setup_events') ?? '{}');
            const updateObj = {
                ...existing,
                backupVerified: true
            };
            if (loginType === 'email') {
                updateObj.backupPhone = identifier;
            } else {
                updateObj.backupEmail = identifier;
            }
            sessionStorage.setItem('setup_events', JSON.stringify(updateObj));
            
            toast.success(`Backup ${loginType === 'email' ? 'phone' : 'email'} verified successfully!`);
            setTimeout(() => router.push('/list-your-events/setup/agreement'), 800);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'OTP verification failed');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="overflow-hidden flex flex-col font-[family-name:var(--font-anek-latin)] h-[calc(100vh-80px)]" style={{ background: 'rgba(211, 203, 245, 0.1)' }}>
            <main className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-14 lg:px-32 py-10 md:py-16">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="04" completedSteps={['01', '02', '03']} />
                    </aside>

                    <div className="flex-1 flex flex-col pt-4 mt-[-75px]">
                        <div className="mb-12">
                            <p className="text-[14px] font-medium text-black opacity-80 uppercase" style={{ fontFamily: 'Anek Latin' }}>
                                &#123; Backup Contact &#125;
                            </p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>

                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="04" completedSteps={['01', '02', '03']} />
                        </div>

                        <div className="space-y-10 mt-[-15px]">
                            <h1 className="text-[32px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                Backup contact
                            </h1>

                            <div className="space-y-8 max-w-2xl">
                                <div className="space-y-3">
                                    <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                        {loginType === 'email' 
                                            ? 'Enter backup phone number (required for account security)' 
                                            : 'Enter backup email address (required for account security)'}
                                    </label>
                                    <div className="max-w-md">
                                        <div className="relative mt-3">
                                            {loginType === 'email' && (
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-800 font-medium border-r border-black/30 pr-3 h-1/2 flex items-center gap-1.5">
                                                    <span>🇮🇳 +91</span>
                                                </div>
                                            )}
                                            <input
                                                type={loginType === 'email' ? 'tel' : 'email'}
                                                value={identifier}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (loginType === 'email') {
                                                        setIdentifier(val.replace(/\D/g, '').slice(0, 10));
                                                    } else {
                                                        setIdentifier(val);
                                                    }
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendOTP()}
                                                placeholder={loginType === 'email' ? '10-digit mobile number' : 'backup@example.com'}
                                                disabled={showOtp}
                                                className={`w-full h-12 px-4 border border-black/30 rounded-[14px] text-[15px] font-medium focus:outline-none placeholder:text-zinc-400 ${showOtp ? 'bg-zinc-50 opacity-70' : ''} ${loginType === 'email' ? 'pl-[94px]' : ''}`}
                                            />
                                        </div>
                                        {showOtp && (
                                            <button
                                                onClick={() => { setShowOtp(false); setOtp(['', '', '', '', '', '']); }}
                                                className="mt-2 text-[14px] font-medium text-[#5331EA]"
                                            >
                                                Change {loginType === 'email' ? 'phone' : 'email'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {!showOtp ? (
                                    <div className="flex gap-4">
                                        {!isCurrentVerified && (
                                            <button
                                                onClick={handleSendOTP}
                                                disabled={loading}
                                                className="bg-black text-white h-[48px] px-8 rounded-[15px] text-[15px] font-medium flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                                            >
                                                {loading ? (
                                                    <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>Send OTP <ChevronRight size={18} /></>
                                                )}
                                            </button>
                                        )}

                                         {isCurrentVerified && (
                                             <button
                                                 onClick={handleContinueWithVerified}
                                                 className="bg-black text-white h-[48px] px-8 rounded-[15px] text-[15px] font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
                                             >
                                                 Continue <ChevronRight size={18} />
                                             </button>
                                         )}
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <p className="text-[14px] text-[#686868] font-medium" style={{ fontFamily: 'Anek Latin' }}>
                                            An OTP has been sent to <span className="text-black font-semibold">{identifier}</span> for verification.
                                        </p>

                                        <div className="space-y-3">
                                            <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                                Enter OTP
                                            </label>
                                            <div className="flex gap-3 md:gap-4">
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        ref={el => { inputRefs.current[index] = el; }}
                                                        type="text"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                                        onPaste={handlePaste}
                                                        className={`w-10 h-10 md:w-12 md:h-12 border ${digit ? 'border-[#5331EA]' : 'border-black/30'} rounded-[12px] text-center text-xl font-bold focus:outline-none focus:border-[#5331EA] bg-white transition-colors mt-3`}
                                                    />
                                                ))}
                                            </div>
                                            <button
                                                onClick={handleSendOTP}
                                                disabled={loading}
                                                className="text-[14px] font-medium text-[#5331EA] disabled:opacity-60"
                                            >
                                                {loading ? 'Sending...' : 'Resend OTP'}
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleVerifyAndContinue}
                                            disabled={verifying}
                                            className="bg-black text-white h-[48px] px-8 rounded-[15px] text-[15px] font-medium flex items-center justify-center gap-2 transition-all active:scale-95 mt-4 disabled:opacity-60"
                                        >
                                            {verifying ? (
                                                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>Verify & Continue <ChevronRight size={18} /></>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
