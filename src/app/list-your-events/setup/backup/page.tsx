'use client';

import React, { useState } from 'react';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BackupContactPage() {
    const [isOtpSent, setIsOtpSent] = useState(false);

    return (
        <div className="min-h-screen bg-[#FBFBFF] flex flex-col font-[family-name:var(--font-anek-latin)]">
            {/* Content Area */}
            <main className="flex-1 px-4 md:px-14 lg:px-32 py-12 md:py-20">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Sidebar Column */}
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="04" completedSteps={['01', '02', '03']} />
                    </aside>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col pt-4">
                        {/* Header Info */}
                        <div className="mb-12">
                            <p className="text-[14px] font-medium text-black opacity-80" style={{ fontFamily: 'Anek Latin' }}>
                                &#123; NUMBER OF BANK ACC ADDED &#125;
                            </p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>

                        {/* Mobile Sidebar */}
                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="04" completedSteps={['01', '02', '03']} />
                        </div>

                        {/* Form Area */}
                        <div className="space-y-10">
                            <h1 className="text-[32px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                Backup contact
                            </h1>

                            <div className="space-y-4 max-w-md">
                                <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                    Enter email
                                </label>
                                <input
                                    type="email"
                                    placeholder="contact@ticpin.in"
                                    className="w-full h-12 px-4 bg-[#F5F5F5] border border-zinc-200 rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400"
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
                                            {[...Array(6)].map((_, i) => (
                                                <input
                                                    key={i}
                                                    type="text"
                                                    maxLength={1}
                                                    className="w-10 h-10 md:w-12 md:h-12 border border-zinc-200 rounded-[12px] text-center text-xl font-bold focus:outline-none focus:border-[#5331EA] bg-[#F5F5F5]"
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
                            <div className="pt-6">
                                {!isOtpSent ? (
                                    <button
                                        onClick={() => setIsOtpSent(true)}
                                        className="bg-black text-white px-8 py-3.5 rounded-[12px] flex items-center gap-3 text-[16px] font-medium transition-all group active:scale-95"
                                    >
                                        Send OTP <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <Link href="/list-your-events/setup/agreement">
                                        <button className="bg-black text-white px-8 py-3.5 rounded-[12px] flex items-center gap-3 text-[16px] font-medium transition-all group active:scale-95">
                                            Verify & Continue <ChevronRight size={18} />
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
