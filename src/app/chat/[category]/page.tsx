'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Plus,
    Send,
    Info
} from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';

export default function ChatViewPage() {
    const router = useRouter();
    const { category } = useParams();
    const { isLoggedIn } = useAuth();
    const [userName, setUserName] = useState('User');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authApi.getProfile();
                if (response.success && response.data.name) {
                    setUserName(response.data.name);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };
        fetchProfile();
    }, []);

    const questions = [
        "Common issue 1",
        "Common issue 2",
        "Common issue 3",
        "Common issue 4",
        "Common issue 5"
    ];

    const categoryTitle = typeof category === 'string'
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : 'General';

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

            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-6 flex flex-col items-center">
                <h1 className="text-xl md:text-2xl font-bold text-black mb-6 text-center">Chat with us</h1>

                {/* Chat Container */}
                <div className="w-full max-w-[1000px] bg-[#F0F0F0] rounded-[20px] p-5 flex flex-col min-h-[420px] relative shadow-inner">
                    {/* Date Separator */}
                    <div className="flex justify-center mb-5">
                        <span className="text-[#5331EA] text-base font-semibold">Today</span>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 space-y-4">
                        {/* Assistant Message Bubble */}
                        <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 bg-[#E5E0FC] rounded-full shrink-0" />
                            <div className="flex flex-col gap-1">
                                <div className="bg-[#5331EA26] rounded-tr-lg rounded-br-lg rounded-bl-lg p-3 max-w-[320px]">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[9px] font-bold text-black uppercase">Ticpin</span>
                                        <span className="text-[6px] text-[#686868] uppercase">Interactive Assistant</span>
                                    </div>
                                    <p className="text-xs text-black leading-tight">
                                        Hi {userName}<br />
                                        Welcome to {categoryTitle} chat support.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Questions Card */}
                        <div className="flex items-start gap-2.5">
                            <div className="w-7 h-0 shrink-0" />
                            <div className="w-full max-w-[170px] border-[0.5px] border-[#5331EA66] rounded-lg bg-white overflow-hidden shadow-sm">
                                <div className="bg-[#D8D3EF] p-1.5">
                                    <p className="text-[10px] text-black font-semibold leading-tight">
                                        Please select the issue:
                                    </p>
                                </div>
                                <div className="flex flex-col">
                                    {questions.map((q, idx) => (
                                        <button
                                            key={idx}
                                            className="px-2.5 py-1.5 text-[10px] text-black text-left border-t-[0.5px] border-[#5331EA66] hover:bg-[#F8F7FF] transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="mt-6 flex items-center gap-2.5">
                        <button className="text-[#5331EA] hover:bg-[#5331EA1A] p-1 rounded-full transition-all">
                            <Plus size={20} strokeWidth={2.5} />
                        </button>

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full h-9 bg-transparent border-[0.5px] border-[#5331EA] rounded-full px-4 text-xs text-[#5331EA] placeholder:text-[#5331EA] focus:outline-none"
                            />
                        </div>

                        <button className="w-9 h-9 bg-[#D9D9D9] rounded-full flex items-center justify-center text-[#5331EA] hover:bg-zinc-300 transition-all shadow-sm">
                            <Send size={16} />
                        </button>
                    </div>
                </div>

                {/* Footer Info Bar */}
                <div className="w-full max-w-[550px] mt-6 bg-[#5331EA1A] border border-[#5331EA] rounded-lg flex items-center px-4 py-1.5 gap-3">
                    <Info size={18} className="text-[#5331EA] shrink-0" />
                    <p className="text-xs font-medium text-black text-center flex-1">
                        Can&rsquo;t find an option? Email <span className="font-semibold">support@ticpin.in</span> and we&rsquo;ll assist you.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
