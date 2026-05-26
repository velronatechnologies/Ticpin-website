'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Utensils, Ticket, Gamepad2, Clock, ChevronRight, XCircle, RefreshCw } from 'lucide-react';
import { getOrganizerSession, saveOrganizerSession } from '@/lib/auth/organizer';
import { organizerApi } from '@/lib/api/organizer';
import ListingsGrid from '@/components/organizer/ListingsGrid';
import OrganizerHeader from '@/components/organizer/OrganizerHeader';

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'events' | 'play' | 'dining'>('events');
    const [searchQuery, setSearchQuery] = useState('');
    // hasMounted prevents SSR/client HTML mismatch — session is only readable client-side
    const [hasMounted, setHasMounted] = useState(false);
    const [session, setSession] = useState<ReturnType<typeof getOrganizerSession>>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [dataCount, setDataCount] = useState<Record<string, number>>({});

    const handleDataCountChange = React.useCallback((count: number) => {
        setDataCount(prev => {
            if (prev[activeTab] === count) return prev;
            return { ...prev, [activeTab]: count };
        });
    }, [activeTab]);

    // Set activeTab from URL parameter
    useEffect(() => {
        const category = searchParams.get('category');
        if (category === 'play' || category === 'dining' || category === 'events') {
            setActiveTab(category);
        }
    }, [searchParams]);

    useEffect(() => {
        setHasMounted(true);
        const s = getOrganizerSession();
        if (!s) {

            setLoading(false);
            return;
        }
        setSession(s);

        const syncStatus = async () => {
            try {
                const me = await organizerApi.getMe();
                const updatedSession = { ...s, categoryStatus: me.categoryStatus };
                setSession(updatedSession);
                saveOrganizerSession(updatedSession);
            } catch {
                try {
                    const { categoryStatus } = await organizerApi.getStatus();
                    const updatedSession = { ...s, categoryStatus };
                    setSession(updatedSession);
                    saveOrganizerSession(updatedSession);
                } catch {
                    import('@/lib/auth/organizer').then(({ clearOrganizerSession }) => {
                        clearOrganizerSession();
                        router.replace('/list-your-dining/Login');
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        syncStatus();
    }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

    // Before mount: server and client render the same pulse (fixes hydration mismatch)
    if (!hasMounted || loading) {
        return <div className="h-[calc(100vh-80px)] w-full bg-zinc-50 animate-pulse" />;
    }

    // If no session after loading complete, show error instead of redirecting
    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-xl text-red-600">No organizer session found</p>
                <p className="text-gray-500">Please log in as an organizer first</p>
                <button
                    onClick={() => router.push('/list-your-dining/Login')}
                    className="px-6 py-3 bg-[#5331EA] text-white rounded-xl"
                >
                    Go to Organizer Login
                </button>
            </div>
        );
    }

    const themes = {
        events: {
            bg: 'rgba(211, 203, 245, 0.1)',
            title: 'Your events',
            subtitle: 'An overview of your events',
            buttonLabel: 'List Event',
            createPath: '/events/create',
            listPath: '/list-your-events',
            icon: Ticket,
            accent: '#AC9BF7',
        },
        play: {
            bg: 'rgba(255, 241, 168, 0.1)',
            title: 'Your Turfs / Courts',
            subtitle: 'An overview of your Turf / Court',
            buttonLabel: 'List Play',
            createPath: '/play/create',
            listPath: '/list-your-play',
            icon: Gamepad2,
            accent: '#E7C200',
        },
        dining: {
            bg: 'rgba(211, 203, 245, 0.1)',
            title: 'Your dinings',
            subtitle: 'An overview of your dining',
            buttonLabel: 'List Dining',
            createPath: '/dining/create',
            listPath: '/list-your-dining',
            icon: Utensils,
            accent: '#E7C200',
        }
    };

    const currentTheme = themes[activeTab];

    const currentStatus = session?.categoryStatus?.[activeTab];

    return (
        <div
            className="flex flex-col font-[family-name:var(--font-anek-latin)] transition-colors duration-500 overflow-y-auto"
            style={{ background: currentTheme.bg, minHeight: '100vh' }}
        >
            <OrganizerHeader activeTab={activeTab} />

            {/* Main Content Area */}
            <main className="flex-1 px-4 md:px-14 lg:px-20 pb-16 pt-8 md:pt-10 flex flex-col justify-start">
                <div className="max-w-[1374px] mx-auto w-full">

                    <div className="flex flex-col md:flex-row md:items-center justify-between items-start mb-4 gap-4">
                        <div className="space-y-0.5">
                            <h1 className="text-[28px] md:text-[32px] font-medium text-black leading-tight" style={{ fontFamily: 'Anek Latin' }}>
                                {currentTheme.title}
                            </h1>
                            <p className="text-[18px] md:text-[22px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                {currentTheme.subtitle}
                            </p>
                        </div>

                        {/* Create Button */}
                        {currentStatus === 'approved' && (
                            <button
                                onClick={() => router.push(currentTheme.createPath)}
                                className="bg-black text-white px-6 h-[42px] md:h-[48px] rounded-[12px] flex items-center gap-1 text-[16px] md:text-[18px] font-medium transition-all"
                            >
                                <Plus size={18} className="text-white" />
                                <span style={{ fontFamily: 'Anek Latin' }}>
                                    {currentTheme.buttonLabel}
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Category Switcher */}
                    <div className="flex gap-2 items-center mb-6 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'dining', label: 'Dining' },
                            { id: 'events', label: 'Events' },
                            { id: 'play', label: 'Play' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => router.push(`/organizer/dashboard?category=${item.id}`)}
                                className="px-5 py-1.5 rounded-[15px] font-medium transition-all text-[15px] md:text-[17px] whitespace-nowrap border border-[#AEAEAE]"
                                style={{
                                    background: activeTab === item.id
                                        ? (item.id === 'play' ? 'rgba(255, 241, 168, 0.3)' : 'rgba(83, 49, 234, 0.15)')
                                        : 'white',
                                    color: activeTab === item.id ? 'black' : '#686868',
                                    fontFamily: 'Anek Latin'
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Horizontal Line Divider */}
                    <div className="w-[90%] mx-auto h-[1px] bg-[#AEAEAE] mb-8" />

                    {/* Search Bar */}
                    {(currentStatus === 'approved' && (dataCount[activeTab] || 0) > 0) && (
                        <div className="mb-8 relative w-full">
                            <input
                                type="text"
                                placeholder={`Search for an ${activeTab}`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-[50px] md:h-[60px] bg-white rounded-[12px] px-6 md:px-8 text-[18px] md:text-[20px] font-medium text-[#E7C200] placeholder:text-[#E7C200] outline-none transition-all border border-[#AEAEAE]"
                                style={{ fontFamily: 'Anek Latin' }}
                            />
                            <div className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2">
                                <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.3333 31.6667C25.6971 31.6667 31.6667 25.6971 31.6667 18.3333C31.6667 10.9695 25.6971 5 18.3333 5C10.9695 5 5 10.9695 5 18.3333C5 25.6971 10.9695 31.6667 18.3333 31.6667Z" stroke="#E7C200" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M35 35L27.75 27.75" stroke="#E7C200" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Content States */}
                    <div className="">
                        {!currentStatus ? (
                            /* State 1: Not Onboarded */
                            <div className="flex flex-col items-center gap-8 text-center max-w-lg mx-auto py-20">
                                <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center">
                                    <currentTheme.icon size={40} className="text-black/40" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-[28px] font-bold text-black capitalize">Become a {activeTab} organizer</h2>
                                    <p className="text-[#686868] text-[16px]">
                                        Start your journey as a {activeTab} partner. Onboard within minutes and reach thousands of customers.
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push(currentTheme.listPath)}
                                    className="bg-black text-white px-10 h-[56px] rounded-[15px] flex items-center gap-3 text-[18px] font-medium transition-all"
                                >
                                    Get Started as {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Partner
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        ) : currentStatus === 'pending' ? (
                            /* State 2: Under Review */
                            <div className="flex flex-col items-center gap-6 text-center max-w-md mx-auto py-20">
                                <div className="bg-[#F9C9A9] rounded-[15px] flex items-center justify-center gap-3 px-8 py-4">
                                    <Clock size={22} className="text-black" />
                                    <span className="text-[18px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                        Account under review
                                    </span>
                                </div>
                                <p className="text-[#686868] text-[15px]">
                                    Your {activeTab} organizer account is being reviewed by our team. We'll notify you once it's approved.
                                </p>
                                <button
                                    onClick={async () => {
                                        try {
                                            const me = await organizerApi.getMe();
                                            const updatedSession = { ...session!, categoryStatus: me.categoryStatus };
                                            setSession(updatedSession);
                                            saveOrganizerSession(updatedSession);
                                        } catch { }
                                    }}
                                    className="flex items-center gap-2 text-[#686868] text-[14px] transition-colors"
                                >
                                    <RefreshCw size={15} /> Refresh status
                                </button>
                            </div>
                        ) : currentStatus === 'approved' ? (
                            /* State 3: Approved — show listings grid */
                            <ListingsGrid
                                vertical={activeTab}
                                createPath={currentTheme.createPath}
                                createLabel={currentTheme.buttonLabel}
                                accentColor={currentTheme.accent}
                                Icon={currentTheme.icon}
                                searchQuery={searchQuery}
                                onDataCountChange={handleDataCountChange}
                            />
                        ) : currentStatus === 'rejected' ? (
                            /* State 4: Rejected */
                            <div className="flex flex-col items-center gap-6 text-center max-w-md mx-auto py-20">
                                <div className="bg-red-50 border border-red-200 rounded-[15px] flex items-start gap-3 px-8 py-5 text-left">
                                    <XCircle size={22} className="text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[18px] font-medium text-red-700">Application Rejected</p>
                                        <p className="text-[14px] text-red-500 mt-1">
                                            Your {activeTab} organizer application was not approved. Please review and resubmit.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push(currentTheme.listPath + '/setup')}
                                    className="bg-black text-white px-10 h-[56px] rounded-[15px] flex items-center gap-3 text-[18px] font-medium transition-all"
                                >
                                    Resubmit Application
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function OrganizerDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-zinc-50" />}>
            <DashboardContent />
        </Suspense>
    );
}
