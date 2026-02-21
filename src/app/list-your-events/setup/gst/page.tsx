'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSearchParams, useRouter } from 'next/navigation';

function GstSelectionContent() {
    const { setupData, updateSetupData } = useStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const category = searchParams.get('category');
    const isPlay = category === 'play';

    // Auth & Flow guard
    React.useEffect(() => {
        const state = useStore.getState();
        if (!state.isLoggedIn || !state.token) {
            router.replace('/list-your-events');
            return;
        }
    }, [router]);
    const [hasGst, setHasGst] = useState(setupData.has_gst || false);
    const [selectedGstin, setSelectedGstin] = useState(setupData.gstin || '');
    const panVerification = setupData.pan_verification;
    const gstinMapping = setupData.gstin_mapping;

    const isMockPan = setupData.pan === '5555555';

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
                                {gstinMapping?.gstin_list && gstinMapping.gstin_list.length > 0 ? (
                                    gstinMapping.gstin_list.map((item: any, index: number) => (
                                        <div key={index} className="bg-transparent border-[1.5px] border-[#AEAEAE] rounded-[20px] p-6 flex items-center gap-6">
                                            <input
                                                type="radio"
                                                name="gstin_selection"
                                                checked={selectedGstin === item.gstin}
                                                onChange={() => {
                                                    setSelectedGstin(item.gstin);
                                                    setHasGst(true);
                                                    updateSetupData({ has_gst: true, gstin: item.gstin });
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
                                    <div className="bg-transparent border-[1.5px] border-[#AEAEAE] border-dashed rounded-[20px] p-10 text-center">
                                        <p className="text-[16px] text-[#686868] font-medium" style={{ fontFamily: 'Anek Latin' }}>
                                            {panVerification?.status === 'VALID' ? 'No GSTINs found associated with this PAN.' : 'Please verify your PAN first.'}
                                        </p>
                                    </div>
                                )}

                                {(!gstinMapping?.gstin_list || gstinMapping.gstin_list.length === 0) && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <input
                                            type="checkbox"
                                            checked={!hasGst && selectedGstin === ''}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setHasGst(false);
                                                    setSelectedGstin('');
                                                    updateSetupData({ has_gst: false, gstin: '' });
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
