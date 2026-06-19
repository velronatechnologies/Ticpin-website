'use client';

import React, { useState, useEffect } from 'react';
import SetupSidebar from '@/app/list-your-play/list-your-Setups/SetupSidebar';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { playApi } from '@/lib/api/play';
import { organizerApi } from '@/lib/api/organizer';
import { getOrganizerSession, updateSessionCategoryStatus } from '@/lib/auth/organizer';
import { toast } from '@/components/ui/Toast';
import { AgreementModal } from '@/components/ui/AgreementModal';

export default function AgreementPage() {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkSetup = async () => {
            let saved = JSON.parse(sessionStorage.getItem('setup_play') ?? '{}');
            if (!saved.pan && !saved.prefilled) {
                try {
                    const setup = await organizerApi.getExistingSetup('play');
                    if (setup && setup.pan) {
                        saved = {
                            prefilled: true,
                            orgType: setup.orgType || 'individual',
                            pan: setup.pan,
                            panName: setup.panName ?? '',
                            panCardUrl: setup.panCardUrl ?? '',
                            panFileName: '(pre-filled)',
                            bankAccountNo: setup.bankAccountNo ?? '',
                            bankIfsc: setup.bankIfsc ?? '',
                            bankName: setup.bankName ?? '',
                            accountHolder: setup.accountHolder ?? '',
                            gstNumber: setup.gstNumber ?? '',
                            backupEmail: setup.backupEmail ?? '',
                            backupPhone: setup.backupPhone ?? '',
                        };
                        sessionStorage.setItem('setup_play', JSON.stringify(saved));
                    } else {
                        router.replace('/list-your-play/setup');
                    }
                } catch (e) {
                    router.replace('/list-your-play/setup');
                }
            }
        };
        checkSetup();
    }, [router]);

    const handleSign = async (signature: string, signatoryEmail: string, signedAt: string, signedIP: string) => {
        setLoading(true);
        try {
            const session = getOrganizerSession();
            const data = JSON.parse(sessionStorage.getItem('setup_play') ?? '{}');
            await playApi.setup({
                organizerId: session?.id ?? '',
                orgType: data.orgType ?? 'individual',
                phone: data.phone ?? '',
                pan: data.pan,
                panName: data.panName,
                panCardUrl: data.panCardUrl,
                bankAccountNo: data.bankAccountNo,
                bankIfsc: data.bankIfsc,
                bankName: data.bankName,
                accountHolder: data.accountHolder,
                gstNumber: data.gstNumber ?? '',
                backupEmail: data.backupEmail,
                backupPhone: data.backupPhone,
                gstList: data.gstList ?? [],
                signature,
                signatoryEmail,
                signedAt,
                signedIP,
            });
            updateSessionCategoryStatus('play', 'pending');
            sessionStorage.removeItem('setup_play');
            router.push('/organizer/dashboard?category=play');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Something went wrong';
            if (msg === 'pan_already_used' || msg.includes('already registered')) {
                toast.error('This PAN card is already registered by another account.');
            } else if (msg === 'pan_mismatch') {
                toast.error('Your PAN card number must match the one provided in your previous setup.');
            } else if (msg.includes('invalid') || msg.includes('must be')) {
                toast.error('Verification failed: ' + msg);
            } else if (msg.includes('cashfree error') || msg.includes('credits over') || msg.includes('Internal Server Error')) {
                toast.error('Our verification system is temporarily down. Please try again after some time.');
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleEnter = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !loading && !isModalOpen) setIsModalOpen(true);
        };
        window.addEventListener('keydown', handleEnter);
        return () => window.removeEventListener('keydown', handleEnter);
    }, [loading, isModalOpen]);

    return (
        <div className="overflow-hidden flex flex-col font-[family-name:var(--font-anek-latin)] h-[calc(100vh-80px)] bg-gradient-to-b from-[#FFFCED] via-white to-white">
            {/* Content Area */}
            <main className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-14 lg:px-32 py-10 md:py-16">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Sidebar Column */}
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="05" completedSteps={['01', '02', '03', '04']} category="play" />
                    </aside>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col pt-4 mt-[-75px]">
                        {/* Header Info */}
                        <div className="mb-12">
                            <p className="text-[14px] font-medium text-black opacity-80" style={{ fontFamily: 'Anek Latin' }}>
                                &#123; AGREEMENT &#125;
                            </p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>

                        {/* Mobile Sidebar */}
                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="05" completedSteps={['01', '02', '03', '04']} category="play" />
                        </div>

                        {/* Form Area */}
                        <div className="space-y-10 mt-[-15px]">
                            <h1 className="text-[32px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                Agreement
                            </h1>

                            <p className="text-[16px] text-[#686868] font-medium leading-relaxed max-w-2xl" style={{ fontFamily: 'Anek Latin' }}>
                                <span className="text-[#E7C200]"> Almost there!</span> Complete your onboarding by signing your digital agreement with Ticpin.
                            </p>

                            <div className="pt-2 flex justify-center md:justify-start">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={loading}
                                    className="bg-black text-white w-full max-w-[160px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all group active:scale-95 disabled:opacity-60"
                                >
                                    Sign agreement<ChevronRight size={18} className="transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AgreementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSign}
                submitLoading={loading}
                category="play"
            />
        </div>
    );
}
