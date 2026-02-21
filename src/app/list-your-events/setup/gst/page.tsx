'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSearchParams, useRouter } from 'next/navigation';

function GstSelectionContent() {
    const { setupData, updateSetupData } = useStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const category = searchParams.get('category');
    const isPlay = category === 'play';

    const [hasGst, setHasGst] = useState(setupData.has_gst || false);
    const [selectedGstin, setSelectedGstin] = useState(setupData.gstin || '');
    const [isFetchingGst, setIsFetchingGst] = useState(false);
    const [gstFetchError, setGstFetchError] = useState<string | null>(null);

    const panVerification = setupData.pan_verification;
    const gstinMapping = setupData.gstin_mapping;

    const isMockPan = setupData.pan === '5555555';

    // Fetch GSTINs for the verified PAN
    const fetchGstins = useCallback(async () => {
        const state = useStore.getState();
        const token = state.token;
        const pan = state.setupData.pan;

        if (!token || !pan) return;

        setIsFetchingGst(true);
        setGstFetchError(null);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/partners/pan-gstin`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ pan }),
                }
            );
            const data = await res.json();
            if (data.status === 200 && data.data) {
                updateSetupData({ gstin_mapping: data.data });
                setGstFetchError(null);
            } else {
                setGstFetchError(data.message || 'Could not fetch GSTINs.');
            }
        } catch {
            setGstFetchError('Network error — could not reach verification service.');
        } finally {
            setIsFetchingGst(false);
        }
    }, [updateSetupData]);

    // Auth & flow guard, then auto-fetch if mapping missing
    useEffect(() => {
        const state = useStore.getState();
        if (!state.isLoggedIn || !state.token) {
            router.replace('/list-your-events');
            return;
        }
        if (!state.setupData.pan_verification) {
            router.replace('/list-your-events/setup');
            return;
        }
        // Auto-fetch if we don't have gstin_mapping yet
        if (!state.setupData.gstin_mapping) {
            fetchGstins();
        }
    }, [router, fetchGstins]);

    return (
        <div className={`min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)] transition-colors duration-500 ${isPlay ? 'bg-[#FFF1A81A]' : 'bg-[#FBFBFF]'}`}>
            {/* Content Area */}
            <main className="flex-1 px-4 md:px-14 lg:px-32 py-12 md:py-20">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Sidebar Column */}
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="02" completedSteps={['01']} category={category} />
                    </aside>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col pt-4 mt-[-75px]">
                        {/* Header Info */}
                        <div className="mb-12">
                            <p className="text-[14px] font-medium text-black opacity-80" style={{ fontFamily: 'Anek Latin' }}>
                                PAN confirmed as a {setupData.category || '{ TYPE OF ACCOUNT }'}
                            </p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>

                        {/* Mobile Sidebar */}
                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="02" completedSteps={['01']} category={category} />
                        </div>

                        {/* Form Section */}
                        <div className="space-y-10 mt-[-15px]">
                            <h1 className="text-[32px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                GST selection
                            </h1>

                            <p className="text-[14px] text-[#686868] font-medium leading-relaxed max-w-2xl" style={{ fontFamily: 'Anek Latin' }}>
                                Select one or more GST accounts to onboard on Ticpin, you can configure these while creating events later. Please note, we only support Regular and Active GSTs to onboard as partners.
                            </p>

                            {/* GST Account Cards */}
                            <div className="space-y-4 max-w-4xl">
                                {isFetchingGst ? (
                                    /* Loading state */
                                    <div className="bg-transparent border-[1.5px] border-[#AEAEAE] border-dashed rounded-[20px] p-10 flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        <p className="text-[14px] text-[#686868] font-medium" style={{ fontFamily: 'Anek Latin' }}>
                                            Fetching GST registrations for your PAN…
                                        </p>
                                    </div>
                                ) : gstFetchError ? (
                                    /* Error state with retry */
                                    <div className="bg-transparent border-[1.5px] border-red-200 border-dashed rounded-[20px] p-8 flex flex-col items-center gap-3 text-center">
                                        <p className="text-[14px] text-red-600 font-medium" style={{ fontFamily: 'Anek Latin' }}>
                                            {gstFetchError}
                                        </p>
                                        <button
                                            onClick={fetchGstins}
                                            className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-black text-white text-[13px] font-medium hover:bg-zinc-800 transition-all"
                                        >
                                            <RefreshCw size={14} /> Retry
                                        </button>
                                    </div>
                                ) : gstinMapping?.gstin_list && gstinMapping.gstin_list.length > 0 ? (
                                    /* GSTIN cards */
                                    gstinMapping.gstin_list.map((item: any, index: number) => (
                                        <div key={index} className="bg-transparent border-[1.5px] border-[#AEAEAE] rounded-[20px] p-6 flex items-center gap-6">
                                            <input
                                                type="radio"
                                                name="gstin_selection"
                                                checked={selectedGstin === item.gstin}
                                                onChange={() => {
                                                    setSelectedGstin(item.gstin);
                                                    setHasGst(true);
                                                    // Save state too so bank page can fetch districts
                                                    const normalized = item.state
                                                        ? item.state.charAt(0).toUpperCase() + item.state.slice(1).toLowerCase()
                                                        : '';
                                                    updateSetupData({ has_gst: true, gstin: item.gstin, selected_state: normalized });
                                                }}
                                                className="w-6 h-6 rounded-full border border-zinc-300 bg-white accent-black cursor-pointer"
                                            />
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Brand name</p>
                                                    <p className="text-[14px] text-black font-medium" style={{ fontFamily: 'Anek Latin' }}>
                                                        {panVerification?.registered_name || setupData.pan_name || '{ NAME }'}
                                                    </p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">State</p>
                                                    <p className="text-[14px] text-black font-medium" style={{ fontFamily: 'Anek Latin' }}>
                                                        {item.state}
                                                    </p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">GSTIN</p>
                                                    <p className="text-[14px] text-black font-medium" style={{ fontFamily: 'Anek Latin' }}>{item.gstin}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">GST status</p>
                                                    <p className="text-[14px] text-black font-medium" style={{ fontFamily: 'Anek Latin' }}>{item.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* No GSTINs found */
                                    <div className="bg-transparent border-[1.5px] border-[#AEAEAE] border-dashed rounded-[20px] p-10 flex flex-col items-center gap-3 text-center">
                                        <p className="text-[16px] text-[#686868] font-medium" style={{ fontFamily: 'Anek Latin' }}>
                                            No GSTINs found associated with this PAN.
                                        </p>
                                        <button
                                            onClick={fetchGstins}
                                            className="flex items-center gap-2 px-4 py-2 rounded-[10px] border border-zinc-300 text-[13px] font-medium hover:bg-zinc-50 transition-all"
                                        >
                                            <RefreshCw size={14} /> Fetch again
                                        </button>
                                    </div>
                                )}

                                {/* "No GSTIN" checkbox — always visible unless cards are shown */}
                                {!isFetchingGst && (!gstinMapping?.gstin_list || gstinMapping.gstin_list.length === 0) && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <input
                                            type="checkbox"
                                            checked={!hasGst && selectedGstin === ''}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setHasGst(false);
                                                    setSelectedGstin('');
                                                    updateSetupData({ has_gst: false, gstin: '', selected_state: '' });
                                                }
                                            }}
                                            className="w-5 h-5 rounded-[4px] border border-zinc-300 bg-white accent-black cursor-pointer"
                                        />
                                        <label className="text-[14px] text-[#686868] font-medium" style={{ fontFamily: 'Anek Latin' }}>
                                            I don't have a GSTIN for this PAN
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Continue Button */}
                            <div className="pt-2 flex justify-center md:justify-start">
                                <button
                                    onClick={() => {
                                        if (selectedGstin || !hasGst) {
                                            const effectiveCategory = setupData.category || category;
                                            router.push(`/list-your-events/setup/bank?category=${effectiveCategory}`);
                                        }
                                    }}
                                    disabled={!selectedGstin && hasGst}
                                    className={`w-full max-w-[150px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all group active:scale-95 ${!selectedGstin && hasGst
                                        ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                        : 'bg-black text-white hover:bg-zinc-800'
                                        }`}
                                >
                                    Continue<ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function GstSelectionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-zinc-50" />}>
            <GstSelectionContent />
        </Suspense>
    );
}
