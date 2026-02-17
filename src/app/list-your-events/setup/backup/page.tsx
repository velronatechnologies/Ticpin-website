'use client';

import React, { Suspense, useState } from 'react';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { authApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

function BackupContactContent() {
    const { setupData, updateSetupData, email: userEmail, phone: userPhone } = useStore();
    const { addToast } = useToast();
    const searchParams = useSearchParams();
    const categoryQuery = searchParams.get('category');
    const isPlay = categoryQuery === 'play';

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState(setupData.backup_contact?.email || '');
    const [name, setName] = useState(setupData.backup_contact?.name || '');
    const [phone, setPhone] = useState(setupData.backup_contact?.phone || '');
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // OTP state
    const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]); // Refs for inputs
    const router = useRouter();

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleSendOtp = async () => {
        if (!email) {
            addToast('Please enter an email', 'error');
            return;
        }

        // Check if backup email is same as logged in user email
        if (userEmail && email.toLowerCase() === userEmail.toLowerCase()) {
            addToast('Backup email cannot be the same as your primary email', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.sendEmailOtp(email);
            if (response.success) {
                setIsOtpSent(true);
                addToast('OTP sent to your email', 'success');
            } else {
                addToast(response.message || 'Failed to send OTP', 'error');
            }
        } catch (error) {
            addToast('Connection error', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        if (!name || !phone || !email) {
            alert('Please fill all fields');
            return;
        }

        // Check if backup phone is same as logged in user phone
        if (userPhone && phone === userPhone) {
            addToast('Backup phone cannot be the same as your primary phone', 'error');
            return;
        }

        // Check if backup email is same as logged in user email (double check)
        if (userEmail && email.toLowerCase() === userEmail.toLowerCase()) {
            addToast('Backup email cannot be the same as your primary email', 'error');
            return;
        }

        updateSetupData({ backup_contact: { email, name, phone } });
        router.push(`/list-your-events/setup/agreement${categoryQuery ? `?category=${categoryQuery}` : ''}`);
    };

    return (
        <div className={`min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)] transition-colors duration-500 ${isPlay ? 'bg-[#FFF1A81A]' : 'bg-[#FBFBFF]'}`}>
            {/* Content Area */}
            <main className="flex-1 px-4 md:px-14 lg:px-32 py-12 md:py-20">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Sidebar Column */}
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="04" completedSteps={['01', '02', '03']} category={categoryQuery} />
                    </aside>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col pt-4">
                        {/* Header Info */}
                        <div className="mb-12">
                            <p className="text-[14px] font-medium text-black opacity-80" style={{ fontFamily: 'Anek Latin' }}>
                                1 bank account added
                            </p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>

                        {/* Mobile Sidebar */}
                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="04" completedSteps={['01', '02', '03']} category={categoryQuery} />
                        </div>

                        {/* Form Area */}
                        <div className="space-y-10">
                            <h1 className="text-[32px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                Backup contact
                            </h1>

                            <div className="space-y-6 max-w-md">
                                <div className="space-y-4">
                                    <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter contact name"
                                        className="w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 00000 00000"
                                        className="w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                        Enter email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="contact@ticpin.in"
                                        className="w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400"
                                    />
                                    {isOtpSent && (
                                        <button
                                            onClick={() => setIsOtpSent(false)}
                                            className="text-[14px] text-[#5331EA] font-medium text-left"
                                            style={{ fontFamily: 'Anek Latin' }}
                                        >
                                            Change email
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isOtpSent && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-[14px] text-[#686868] font-medium" style={{ fontFamily: 'Anek Latin' }}>
                                        An OTP has been sent to your email for verification.
                                    </p>

                                    <div className="space-y-4">
                                        <label className="text-[14px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                            Enter OTP
                                        </label>
                                        <div className="flex gap-2">
                                            {otp.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    ref={(el) => { otpRefs.current[i] = el; }}
                                                    type="text"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Backspace' && !digit && i > 0) otpRefs.current[i - 1]?.focus();
                                                    }}
                                                    className="w-10 h-10 md:w-12 md:h-12 border border-[#AEAEAE] rounded-[12px] text-center text-xl font-bold focus:outline-none focus:border-[#5331EA] bg-transparent"
                                                />
                                            ))}
                                        </div>
                                        <button
                                            className="text-[14px] text-[#5331EA] font-medium text-left"
                                            style={{ fontFamily: 'Anek Latin' }}
                                        >
                                            Resend OTP
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="pt-2 flex justify-center md:justify-start">
                                {!isOtpSent ? (
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={isLoading}
                                        className="bg-black text-white w-full md:w-[124px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all group active:scale-95 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Sending...' : 'Send OTP'} <ChevronRight size={18} className="transition-transform" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleContinue}
                                        className="bg-black text-white w-full md:w-[154px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all group active:scale-95"
                                    >
                                        Verify & Continue <ChevronRight size={18} className="transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function BackupContactPage() {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-zinc-50" />}>
            <BackupContactContent />
        </Suspense>
    );
}
