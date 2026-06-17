'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import SetupSidebar from '@/app/list-your-dining/list-your-Setups/SetupSidebar';
import { ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { organizerApi } from '@/lib/api/organizer';
import { toast } from '@/components/ui/Toast';

const STORAGE_KEY = 'setup_dining';

function GstSelectionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryQuery = searchParams.get('category');
    const [selectedGsts, setSelectedGsts] = React.useState<string[]>([]);
    const [prefilled, setPrefilled] = React.useState(false);
    const [gstList, setGstList] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
        if (saved.gstList && Array.isArray(saved.gstList)) setSelectedGsts(saved.gstList);
        else if (saved.gstNumber) setSelectedGsts([saved.gstNumber]);
        
        if (saved.prefilled) setPrefilled(true);

        if (saved.fetchedGstList && Array.isArray(saved.fetchedGstList) && saved.fetchedGstPan === saved.pan) {
            setGstList(saved.fetchedGstList);
            return;
        }

        if (saved.pan) {
            setLoading(true);
            organizerApi.fetchGST(saved.pan)
                .then(res => {
                    if (res.status === 'SUCCESS' && res.data.gstin_list) {
                        const list = res.data.gstin_list;
                        const validGsts = list.filter((item: any) => {
                            const status = (item.status || '').toUpperCase();
                            return status === 'ACTIVE' || status === 'REGULAR';
                        });
                        setGstList(validGsts);

                        const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
                        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                            ...existing,
                            fetchedGstList: validGsts,
                            fetchedGstPan: saved.pan
                        }));
                    }
                })
                .catch(err => {
                    console.error('Fetch GST failed', err);
                    toast.error(err.message || 'Failed to fetch GST details');
                })
                .finally(() => setLoading(false));
        }
    }, []);

    const toggleGst = (gstin: string) => {
        setSelectedGsts(prev => {
            if (prev.includes(gstin)) {
                return prev.filter(g => g !== gstin);
            }
            if (prev.length >= 3) {
                toast.error('You can select a maximum of 3 GST accounts.');
                return prev;
            }
            return [...prev, gstin];
        });
    };

    const handleContinue = () => {
        if (selectedGsts.length === 0) {
            toast.error('Please select at least one GSTIN');
            return;
        }

        let finalGsts = [...selectedGsts];

        const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ 
            ...existing, 
            gstList: finalGsts,
            gstNumber: finalGsts[0] || ''
        }));
        router.push('/list-your-dining/setup/bank');
    };

    return (
        <div className="overflow-hidden flex flex-col font-[family-name:var(--font-anek-latin)] h-[calc(100vh-80px)]" style={{ background: 'rgba(211, 203, 245, 0.1)' }}>
            <main className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-14 lg:px-32 py-10 md:py-16">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="02" completedSteps={['01']} category={categoryQuery} />
                    </aside>

                    <div className="flex-1 flex flex-col pt-4 mt-[-75px]">
                        <div className="mb-12">
                            <p className="text-[14px] font-medium text-black opacity-80" style={{ fontFamily: 'Anek Latin' }}>
                                GST DETAILS
                            </p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>

                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="02" completedSteps={['01']} category={categoryQuery} />
                        </div>

                        <div className="space-y-10 mt-[-15px]">
                            <h1 className="text-[32px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                GST selection
                            </h1>

                            <div className="space-y-6 max-w-2xl">
                                {loading ? (
                                    <div className="animate-pulse flex items-center gap-2 text-[14px] font-medium text-[#5331EA]">
                                        <div className="w-4 h-4 border-2 border-t-transparent border-[#5331EA] rounded-full animate-spin" />
                                        Fetching GSTINs associated with your PAN...
                                    </div>
                                ) : (
                                    <>
                                        {gstList.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <label className="text-[14px] font-medium text-[#686868]">Select GSTIN(s) associated with your PAN (Max 3)</label>
                                                    <span className="text-[12px] font-semibold text-[#5331EA]">{selectedGsts.length}/3 selected</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {gstList.map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => toggleGst(item.gstin)}
                                                            className={`p-4 rounded-[18px] border cursor-pointer transition-all ${selectedGsts.includes(item.gstin) ? 'bg-[#5331EA]/5 border-[#5331EA]' : 'bg-white border-black/10 hover:border-black/30'}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${item.status === 'ACTIVE' || item.status === 'Regular' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                    {item.status}
                                                                </span>
                                                                <span className="text-[12px] text-[#686868] uppercase font-bold">{item.state}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[15px] font-bold text-black font-mono">{item.gstin}</p>
                                                                {selectedGsts.includes(item.gstin) && (
                                                                    <div className="w-5 h-5 bg-[#5331EA] rounded-full flex items-center justify-center">
                                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-8 pt-4">

                                            <p className="text-[13px] text-[#686868] font-medium leading-relaxed">
                                                Please note, we only support Regular and Active GSTs to onboard as partners.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="pt-2 flex justify-center md:justify-start">
                                <button
                                    onClick={handleContinue}
                                    className="bg-black text-white w-full max-w-[110px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all group active:scale-95"
                                >
                                    Continue<ChevronRight size={18} className="transition-transform" />
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
