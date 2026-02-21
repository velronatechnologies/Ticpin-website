'use client';

import { useEffect, useState, Suspense } from 'react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { partnerApi } from '@/lib/api';
import { ArrowLeft, Shield, FileText, CreditCard, Ticket, Trophy, Utensils } from 'lucide-react';
import AuthModal from '@/components/modals/AuthModal';

function OrganizerOnboardingContent() {
    const { token } = useStore();
    const { isLoggedIn, isOrganizer, isAdmin } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get('category') || 'event';

    const [loading, setLoading] = useState(true);
    const [isPanVerified, setIsPanVerified] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Category display config
    const categoryInfo: Record<string, { label: string; description: string; icon: React.ReactNode; color: string }> = {
        event: {
            label: 'Events',
            description: 'List and manage your events, workshops, and shows',
            icon: <Ticket size={28} />,
            color: '#5331EA',
        },
        play: {
            label: 'Play / Courts',
            description: 'List your sports venues, turfs, and courtsf',
            icon: <Trophy size={28} />,
            color: '#E7C200',
        },
        dining: {
            label: 'Dining',
            description: 'List your restaurants, cafes, and food venues',
            icon: <Utensils size={28} />,
            color: '#FF6B35',
        },
    };

    const info = categoryInfo[category] || categoryInfo.event;

    useEffect(() => {
        if (!isLoggedIn || !token) {
            // Not logged in → Show auth modal
            setShowAuthModal(true);
            setLoading(false);
            return;
        }

        if (isAdmin) {
            router.push('/admin');
            return;
        }

        // Check current verification status
        const checkStatus = async () => {
            try {
                const response = await partnerApi.getMyStatus();
                if (response.success && response.data) {
                    setIsPanVerified(response.data.is_pan_verified || false);

                    // If already approved for this category, go to dashboard
                    if (response.data.status === 'approved') {
                        const verifiedCats = response.data.organizer_categories || [];
                        const isVerifiedForThis = verifiedCats.includes(category) ||
                            (category === 'event' && verifiedCats.some((c: string) => ['event', 'creator', 'individual', 'company', 'non-profit'].includes(c)));

                        if (isVerifiedForThis) {
                            router.push(`/organizer-dashboard?category=${category}`);
                            return;
                        }
                    }

                    setVerificationStatus(response.data.status);
                }
            } catch (error) {
                console.error('Error checking status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [isLoggedIn, token, isAdmin, category, router]);

    const handleStartVerification = () => {
        // Redirect to the existing setup page with the category
        router.push(`/list-your-events/setup?category=${category}`);
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        // Re-check status after auth
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-[#5331EA] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-zinc-500 font-medium font-[family-name:var(--font-anek-latin)]">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-[family-name:var(--font-anek-latin)]">
                <div className="bg-white rounded-2xl border border-zinc-200 p-8 md:p-12 text-center max-w-md mx-4">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                        style={{ backgroundColor: info.color }}>
                        {info.icon}
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 mb-2">Become a {info.label} Partner</h2>
                    <p className="text-zinc-500 mb-6">{info.description}. Sign in with your email to get started.</p>
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="px-6 py-3 rounded-full text-white font-bold text-[15px] transition-all hover:opacity-90 w-full"
                        style={{ backgroundColor: info.color }}
                    >
                        Sign in with Email
                    </button>
                </div>

                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => {
                        setShowAuthModal(false);
                        router.push('/play');
                    }}
                    isOrganizer={true}
                    category={category}
                    initialView="email_login"
                    onAuthSuccess={handleAuthSuccess}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-[family-name:var(--font-anek-latin)]">
            {/* Header */}
            <div className="bg-white border-b border-zinc-200">
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
                    <div className="flex items-center gap-3 mb-1">
                        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                            <ArrowLeft size={20} className="text-zinc-500" />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-zinc-900">Partner Onboarding</h1>
                    </div>
                    <p className="text-sm text-zinc-500 ml-12">{info.description}</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                {/* Category Banner */}
                <div className="rounded-2xl p-6 md:p-8 mb-8 text-white relative overflow-hidden"
                    style={{ backgroundColor: info.color }}>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            {info.icon}
                            <h2 className="text-lg font-bold">{info.label} Partner</h2>
                        </div>
                        <p className="text-white/80 text-sm max-w-xl">
                            Complete the verification process below to start listing your {info.label.toLowerCase()} on TicPin.
                        </p>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border-4 border-white/10"></div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full border-4 border-white/10"></div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                    {/* Step 1: PAN Verification */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isPanVerified ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-400'
                                }`}>
                                <Shield size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[16px] font-bold text-zinc-900">PAN Verification</h3>
                                    {isPanVerified && (
                                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Completed</span>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {isPanVerified
                                        ? 'Your PAN has been verified successfully. This will be reused for all categories.'
                                        : 'Verify your PAN card to proceed with the verification.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Category Documents */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center flex-shrink-0">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[16px] font-bold text-zinc-900">Business Documents</h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    Upload required documents specific to {info.label.toLowerCase()} verification.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Bank Details */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center flex-shrink-0">
                                <CreditCard size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[16px] font-bold text-zinc-900">Bank Details</h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    Add your bank account details for payouts and settlements.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 text-center">
                    <button
                        onClick={handleStartVerification}
                        className="px-8 py-3.5 rounded-full text-white font-bold text-[16px] transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: info.color }}
                    >
                        {isPanVerified ? `Complete ${info.label} Verification` : 'Start Verification Process'}
                    </button>
                    <p className="text-sm text-zinc-400 mt-3">
                        {isPanVerified ? 'Your PAN is already verified. Complete category-specific verification.' : 'This process usually takes 5-10 minutes.'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function OrganizerOnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-[#5331EA] border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <OrganizerOnboardingContent />
        </Suspense>
    );
}
