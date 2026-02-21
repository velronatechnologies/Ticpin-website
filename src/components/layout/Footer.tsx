'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { partnerApi } from '@/lib/api';
import AuthModal from '@/components/modals/AuthModal';
import { useToast } from '@/context/ToastContext';

export default function Footer() {
    const { isOrganizer, isAdmin, isLoggedIn, token, organizerCategories } = useAuth();
    const { setPendingOrganizerCategory } = useStore();
    const pathname = usePathname();
    const router = useRouter();
    const { addToast } = useToast();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [pendingCategory, setPendingCategory] = useState<string | null>(null);

    const organizerLinks = [
        { name: 'List your events', category: 'event', path: '/events' },
        { name: 'List your play/courts', category: 'play', path: '/play' },
        { name: 'List your dining', category: 'dining', path: '/dining' },
    ];

    const filteredOrganizerLinks = organizerLinks.filter((link) => {
        return pathname.startsWith(link.path);
    });

    const handleCategoryClick = async (category: string) => {
        setPendingCategory(category);
        setPendingOrganizerCategory(category);

        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        if (!isOrganizer) {
            setIsAuthModalOpen(true);
            return;
        }

        setIsNavigating(true);
        await checkVerificationAndNavigate(category);
        setTimeout(() => setIsNavigating(false), 2000);
    };

    const checkVerificationAndNavigate = async (category: string) => {
        try {
            const isVerifiedForCategory = organizerCategories.includes(category) ||
                (category === 'event' && organizerCategories.some(c => ['event', 'creator', 'individual', 'company', 'non-profit'].includes(c)));

            if (isVerifiedForCategory) {
                router.push(`/organizer-dashboard?category=${category}`);
                return;
            }
            const response = await partnerApi.getStatusByCategory(category);

            if (response.success && response.data) {
                const status = response.data.status;

                if (status === 'approved') {
                    router.push(`/organizer-dashboard?category=${category}`);
                } else if (status === 'pending' || status === 'under_review') {
                    router.push(`/organizer-dashboard?category=${category}`);
                } else if (status === 'new_category' || response.data.is_pan_verified) {
                    router.push(`/list-your-events/setup?category=${category}`);
                } else {
                    router.push(`/list-your-events/setup?category=${category}`);
                }
            } else {
                router.push(`/list-your-events/setup?category=${category}`);
            }
        } catch (error) {
            console.error('Error checking verification:', error);
            router.push(`/organizer-dashboard?category=${category}`);
        }
    };

    const handleAuthSuccess = async () => {
        setIsAuthModalOpen(false);
        setIsNavigating(true);
        const category = pendingCategory || 'event';

        // After auth, use a fresh backend call since local store may be stale
        setTimeout(async () => {
            try {
                const response = await partnerApi.getStatusByCategory(category);

                if (response.success && response.data) {
                    const status = response.data.status;
                    const cats = response.data.organizer_categories || [];
                    const isVerified = cats.includes(category) ||
                        (category === 'event' && cats.some((c: string) => ['event', 'creator', 'individual', 'company', 'non-profit'].includes(c)));

                    if (status === 'approved' || isVerified) {
                        router.push(`/organizer-dashboard?category=${category}`);
                    } else if (status === 'pending' || status === 'under_review') {
                        router.push(`/organizer-dashboard?category=${category}`);
                    } else {
                        // Not verified yet → setup page to begin verification
                        router.push(`/list-your-events/setup?category=${category}`);
                    }
                } else {
                    // No verification record → setup page
                    router.push(`/list-your-events/setup?category=${category}`);
                }
            } catch (error) {
                console.error('Error after auth:', error);
                // Fallback: go to setup page
                router.push(`/list-your-events/setup?category=${category}`);
            } finally {
                setTimeout(() => setIsNavigating(false), 3000);
            }
        }, 800);
    };

    return (
        <footer className="bg-[#212121] text-white border-t border-zinc-800/50">
            {isNavigating && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#5331EA] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-zinc-600 font-medium animate-pulse text-[15px]">Redirecting to dashboard...</p>
                    </div>
                </div>
            )}
            <div className="mx-auto max-w-[1440px] px-6 md:px-[68px] min-h-[200px] flex flex-col justify-center py-8 md:py-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-8 mb-8 md:mb-8">
                    <div className="flex-shrink-0">
                        <img
                            src="/ticpin-logo-black.png"
                            alt="TICPIN"
                            className="h-6 md:h-8 w-auto invert brightness-0"
                        />
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-x-6 md:gap-x-12 gap-y-3 font-[family-name:var(--font-anek-latin)]">
                        {[
                            { name: 'Terms & Services', href: '/terms' },
                            { name: 'Privacy Policy', href: '/privacy' },
                            { name: 'Refund & Cancellation', href: '/refund' },
                            { name: 'Contact Us', href: '/contact' }
                        ].map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-[16px] font-semibold text-white hover:opacity-70 transition-opacity whitespace-nowrap"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {!isAdmin && filteredOrganizerLinks.map((link) => (
                            <button
                                key={link.category}
                                onClick={() => handleCategoryClick(link.category)}
                                className="text-[16px] font-semibold text-white hover:opacity-70 transition-opacity whitespace-nowrap cursor-pointer bg-transparent border-none"
                            >
                                {link.name}
                            </button>
                        ))}
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="flex-shrink-0">
                        <div className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] bg-[#D9D9D9] rounded-[20px] flex items-center justify-center shadow-lg">
                            <span className="text-2xl md:text-3xl font-bold text-black tracking-tight">QR</span>
                        </div>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="w-full h-px bg-zinc-700/50 mb-6 md:mb-6"></div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 font-[family-name:var(--font-anek-latin)]">
                    <p className="text-[12px] md:text-[14px] font-medium text-[#686868] max-w-[850px] leading-relaxed text-center md:text-left">
                        By accessing this page, you confirm that you have read, understood, and agreed to our Terms of Service, Cookie Policy, Privacy Policy, and Content Guidelines. All rights reserved.
                    </p>

                    <div className="flex-shrink-0 flex items-center gap-4">
                        {[
                            {
                                name: 'WhatsApp',
                                href: 'https://whatsapp.com/channel/0029Vb8KoCH3mFY1M9gR4412',
                                icon: (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.122.547 4.191 1.586 6.033L0 24l6.105-1.602a11.83 11.83 0 005.937 1.598h.005c6.637 0 12.032-5.395 12.035-12.032a11.76 11.76 0 00-3.535-8.303" />
                                    </svg>
                                )
                            },
                            {
                                name: 'Facebook',
                                href: 'https://www.facebook.com/profile.php?id=61579518933930#',
                                icon: (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                )
                            },
                            {
                                name: 'Instagram',
                                href: 'https://www.instagram.com/ticpinindia/',
                                icon: (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.335 3.608 1.31.975.975 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.335 2.633-1.31 3.608-.975.975-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.335-3.608-1.31-.975-.975-1.248-2.242-1.31-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.335-2.633 1.31-3.608.975-.975 2.242-1.248 3.608-1.31 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.149.262-2.913.558a4.837 4.837 0 00-1.744 1.135 4.84 4.84 0 00-1.135 1.744c-.296.764-.501 1.636-.558 2.913-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.262 2.149.558 2.913.306.788.717 1.459 1.384 2.126.666.667 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.057 2.149-.262 2.913-.558.788-.306 1.459-.717 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.057-1.277-.262-2.149-.558-2.913-.306-.789-.717-1.459-1.384-2.126C21.337 1.347 20.669.935 19.879.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                )
                            },
                            {
                                name: 'X',
                                href: 'https://x.com/ticpin',
                                icon: (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                                    </svg>
                                )
                            },
                            {
                                name: 'YouTube',
                                href: 'https://www.youtube.com/channel/UCrGSN3cv3q1x3yI5q7LILtw',
                                icon: (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                )
                            }
                        ].map((social) => (
                            <Link
                                key={social.name}
                                href={social.href}
                                className="text-white hover:text-zinc-400 transition-colors"
                                aria-label={social.name}
                            >
                                {social.icon}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Auth Modal for organizer flow - email-only */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                isOrganizer={true}
                category={pendingCategory}
                initialView="email_login"
                onAuthSuccess={handleAuthSuccess}
            />
        </footer>
    );
}
