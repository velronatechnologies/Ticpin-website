'use client';

import React, { Suspense, useState, useEffect } from 'react';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthModal from '@/components/modals/AuthModal';

function AgreementContent() {
    const { setupData, token, clearSetupData, isLoggedIn } = useStore();
    const searchParams = useSearchParams();
    const categoryQuery = searchParams.get('category');
    const isPlay = categoryQuery === 'play';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async (manualToken?: string) => {
        const state = useStore.getState();
        const authToken = manualToken || state.token;
        const loggedIn = state.isLoggedIn;

        if (!loggedIn && !manualToken) {
            setIsAuthModalOpen(true);
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/partners/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    organization_details: {
                        category: setupData.category,
                        pan: setupData.pan,
                        pan_name: setupData.pan_name,
                        pan_image: setupData.pan_image || '',
                        pan_verification: setupData.pan_verification,
                        gstin_mapping: setupData.gstin_mapping || {}
                    },
                    gst_details: {
                        has_gst: setupData.has_gst,
                        gstin: setupData.gstin
                    },
                    bank_details: setupData.bank_details,
                    backup_contact: setupData.backup_contact
                })
            });

            if (response.ok) {
                setIsSuccess(true);
                clearSetupData();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to submit verification');
            }
        } catch (error) {
            console.error('Error submitting verification:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${isPlay ? 'bg-[#FFF1A81A]' : 'bg-white'} px-4`}>
                <div className="text-center space-y-8 max-w-lg">
                    <div className="flex justify-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isPlay ? 'bg-[#F9C333]/20' : 'bg-green-100'}`}>
                            <img src={isPlay ? "/list your events/tick.svg" : "/list your events/tick icon.svg"} alt="Success" className="w-10 h-10" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900">Verification Submitted!</h1>
                    <p className="text-zinc-600">
                        We have received your details. Our team will review your application and send you a verification email. We will verify and send you a response in 24 hrs.
                    </p>
                    <button
                        onClick={() => router.push('/list-your-events')}
                        className="bg-black text-white px-8 py-3 rounded-xl font-medium"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)] transition-colors duration-500 ${isPlay ? 'bg-[#FFF1A81A]' : ''}`}>
            {/* Content Area */}
            <main className="flex-1 px-4 md:px-14 lg:px-32 py-12 md:py-20">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Sidebar Column */}
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="05" completedSteps={['01', '02', '03', '04']} category={categoryQuery} />
                    </aside>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col pt-4">
                        {/* Header Info */}
                        <div className="mb-12">
                            <p className="text-[14px] font-medium text-black opacity-80" style={{ fontFamily: 'Anek Latin' }}>
                                Backup contact added.
                            </p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>

                        {/* Mobile Sidebar */}
                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="05" completedSteps={['01', '02', '03', '04']} category={categoryQuery} />
                        </div>

                        {/* Content Section */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h1
                                    className="text-[40px] font-medium text-black leading-tight"
                                    style={{ fontFamily: 'Anek Latin', wordWrap: 'break-word' }}
                                >
                                    Agreement
                                </h1>

                                <p className="text-[18px] text-[#686868] font-medium leading-relaxed max-w-2xl" style={{ fontFamily: 'Anek Latin' }}>
                                    <span className={`${isPlay ? 'text-[#F9C333]' : 'text-[#5331EA]'} font-medium`}>Almost there!</span> Complete your onboarding by signing your digital agreement with Ticpin.
                                </p>
                            </div>

                            {/* Action Button */}
                            <div className="pt-2 flex justify-center md:justify-start">
                                <button
                                    onClick={() => handleSubmit()}
                                    disabled={isSubmitting}
                                    className="bg-black text-white w-full md:w-[154px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all group active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Sign agreement'} <ChevronRight size={18} className="transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AuthModal
                isOpen={isAuthModalOpen}
                isOrganizer={true}
                onClose={() => setIsAuthModalOpen(false)}
                onAuthSuccess={(id, token) => {
                    setIsAuthModalOpen(false);
                    handleSubmit(token);
                }}
            />
        </div>
    );
}

export default function AgreementPage() {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-zinc-50" />}>
            <AgreementContent />
        </Suspense>
    );
}
