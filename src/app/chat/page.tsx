'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    UtensilsCrossed,
    Music2,
    Activity,
    MessageSquare,
    Info
} from 'lucide-react';
import Footer from '@/components/layout/Footer';

export default function ChatSelectionPage() {
    const router = useRouter();

    const supportOptions = [
        {
            id: 'dining',
            label: 'Dining support',
            icon: <UtensilsCrossed size={48} />,
            href: '/chat/dining'
        },
        {
            id: 'event',
            label: 'Event support',
            icon: <Music2 size={48} />,
            href: '/chat/event'
        },
        {
            id: 'play',
            label: 'Play support',
            icon: <Activity size={48} />,
            href: '/chat/play'
        },
        {
            id: 'other',
            label: 'Others',
            icon: <MessageSquare size={48} />,
            href: '/chat/other'
        }
    ];

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-anek-latin)] flex flex-col">
            {/* Header */}
            <header className="relative w-full h-[70px] bg-white border-b border-[#D9D9D9] flex items-center justify-center shrink-0">
                <button
                    onClick={() => router.back()}
                    className="absolute left-6 md:left-12 lg:left-20 p-1 hover:bg-zinc-100 rounded-full transition-colors"
                    aria-label="Go back"
                >
                    <ArrowLeft size={20} />
                </button>
                <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-6 w-auto" />
            </header>

            <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-8 flex flex-col items-center">
                <h1 className="text-xl md:text-2xl font-bold text-black mb-8 text-center">Chat with us</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 lg:gap-12 mb-10">
                    {supportOptions.map((option) => (
                        <div key={option.id} className="flex flex-col items-center group">
                            <button
                                onClick={() => router.push(option.href)}
                                className="w-32 h-36 md:w-40 md:h-44 bg-[#E1E1E1] rounded-2xl flex items-center justify-center text-black mb-3 hover:bg-zinc-300 transition-all active:scale-95 shadow-sm"
                            >
                                {option.icon}
                            </button>
                            <span className="text-base font-semibold text-black text-center">
                                {option.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Info Bar */}
                <div className="w-full max-w-[550px] h-auto min-h-[34px] bg-[#5331EA1A] border border-[#5331EA] rounded-lg flex items-center px-4 py-1.5 gap-3 mb-6">
                    <Info size={18} className="text-[#5331EA] shrink-0" />
                    <p className="text-sm font-medium text-black text-center flex-1">
                        Can&rsquo;t find an option that properly describes your issue? Email <span className="font-semibold">support@ticpin.in</span> and we&rsquo;ll assist you.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
