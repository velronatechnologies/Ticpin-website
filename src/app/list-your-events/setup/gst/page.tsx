'use client';

import React from 'react';
import Link from 'next/link';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { organizerApi } from '@/lib/api/organizer';
import { toast } from '@/components/ui/Toast';

const STORAGE_KEY = 'setup_events';

export default function GstSelectionPage() {
    const router = useRouter();
    const [selectedGsts, setSelectedGsts] = React.useState<string[]>([]);
    const [prefilled, setPrefilled] = React.useState(false);
    const [gstList, setGstList] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [accountType, setAccountType] = React.useState('');
    const [noGst, setNoGst] = React.useState(false);

    React.useEffect(() => {
        const loadInitial = async () => {
            let saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
            
            if (!saved.pan && !saved.prefilled) {
                try {
                    const setup = await organizerApi.getExistingSetup('events');
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
                        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
                    } else {
                        router.replace('/list-your-events/setup');
                        return;
                    }
                } catch (e) {
                    router.replace('/list-your-events/setup');
                    return;
                }
            }

            if (saved.gstList && Array.isArray(saved.gstList)) {
                setSelectedGsts(saved.gstList);
                if (saved.gstList.length === 0 && saved.noGst) {
                    setNoGst(true);
                }
            }
            else if (saved.gstNumber) setSelectedGsts([saved.gstNumber]);
            
            if (saved.noGst) setNoGst(true);
            if (saved.prefilled) setPrefilled(true);
            if (saved.orgType) {
                const typeMap: Record<string, string> = {
                    'individual': 'Individual',
                    'creator': 'Creator',
                    'company': 'Company',
                    'non-profit': 'Non-profit Organization'
                };
                setAccountType(typeMap[saved.orgType] || saved.orgType);
            }

            // If we already have the fetched list in sessionStorage for the SAME PAN, load it directly
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
                                const status = (item.status || item.gst_status || '').toUpperCase();
                                return status === 'ACTIVE' || status === 'REGULAR';
                            });
                            setGstList(validGsts);

                            // Save the fetched list and the PAN in sessionStorage so we don't refetch on refresh
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
                        let userMessage = 'Unable to fetch your GST details at this moment.';
                        if (err.message && err.message.includes('ip_validation_failed')) {
                            userMessage = 'Our system is experiencing temporary connectivity issues. Please try again in a few moments.';
                        } else if (err.message && err.message.includes('authentication_error')) {
                            userMessage = 'Unable to verify your GST information. Please try again later.';
                        } else if (err.message && (err.message.includes('cashfree error') || err.message.includes('credits over') || err.message.includes('Internal Server Error'))) {
                            userMessage = 'Our verification system is temporarily down. Please try again after some time.';
                        }
                        toast.error(userMessage);
                    })
                    .finally(() => setLoading(false));
            }
        };

        loadInitial();
    }, [router]);

    const toggleGst = (gstin: string) => {
        if (noGst) return;
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
        if (selectedGsts.length === 0 && !noGst) {
            toast.error('Please select at least one GSTIN or check "I don\'t have GST"');
            return;
        }
        
        let finalGsts = noGst ? [] : [...selectedGsts];

        const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ 
            ...existing, 
            gstList: finalGsts,
            gstNumber: finalGsts[0] || '', // Fallback for backward compatibility
            noGst: noGst
        }));
        router.push('/list-your-events/setup/bank');
    };

    return (
        <div className="overflow-hidden flex flex-col font-[family-name:var(--font-anek-latin)] h-[calc(100vh-80px)] bg-white">
            {/* Content Area */}
            <main className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-10 lg:px-16 py-10 md:py-16">
                <div className="max-w-[1250px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Sidebar Column */}
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="02" completedSteps={['01']} category="events" />
                    </aside>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col pt-4 lg:mt-[-75px] mt-0">
                        {/* Header Info */}
                        <div className="mb-12 mt-12">
                            <p className="text-[14px] font-medium text-black opacity-80" style={{ fontFamily: 'Anek Latin' }}>
                                PAN confirmed as a <span className="font-semibold text-black">{accountType || 'Individual'}</span>
                            </p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>

                        {/* Mobile Sidebar */}
                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="02" completedSteps={['01']} category="events" />
                        </div>

                        {/* Form Section */}
                        <div className="space-y-10 mt-[-15px]">
                            <h1 className="text-[32px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                GST selection
                            </h1>

                            <p className="text-[15px] text-[#686868] font-medium leading-relaxed max-w-2xl mt-[-15px]" style={{ fontFamily: 'Anek Latin' }}>
                                Select one or more GST accounts to onboard on Ticpin, you can configure these while creating events later. Please note, we only support Regular and Active GSTs to onboard as partners.
                            </p>

                            <div className="space-y-6 max-w-4xl">
                                {loading ? (
                                    <div className="animate-pulse flex items-center gap-2 text-[14px] font-medium text-[#5331EA]">
                                        <div className="w-4 h-4 border-2 border-t-transparent border-[#5331EA] rounded-full animate-spin" />
                                        Fetching GSTINs associated with your PAN...
                                    </div>
                                ) : (
                                    <>
                                        {gstList.length > 0 && (
                                            <div className="space-y-4">
                                                {gstList.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => !noGst && toggleGst(item.gstin)}
                                                        className={`bg-transparent border-[1.5px] border-[#AEAEAE] rounded-[20px] p-5 sm:p-6 flex items-start sm:items-center gap-6 transition-all duration-300 cursor-pointer ${noGst ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedGsts.includes(item.gstin)}
                                                            onChange={() => {}}
                                                            disabled={noGst}
                                                            className="w-6 h-6 mt-1 sm:mt-0 rounded-[8px] border border-zinc-300 bg-white accent-black focus:ring-0 focus:ring-offset-0 cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        />

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 flex-1 min-w-0">
                                                            <div className="space-y-0.5 lg:col-span-3 min-w-0">
                                                                <p className="text-[12px] text-zinc-400 font-medium tracking-wider whitespace-nowrap">Brand name</p>
                                                                <p className="text-[14px] text-black font-medium break-words" style={{ fontFamily: 'Anek Latin' }}>{item.brand_name || 'N/A'}</p>
                                                            </div>
                                                            <div className="space-y-0.5 lg:col-span-2 min-w-0">
                                                                <p className="text-[12px] text-zinc-400 font-medium tracking-wider whitespace-nowrap">Address</p>
                                                                <p className="text-[14px] text-black font-medium line-clamp-2 break-words" style={{ fontFamily: 'Anek Latin' }} title={item.state || item.address || 'N/A'}>{item.state || item.address || 'N/A'}</p>
                                                            </div>
                                                            <div className="space-y-0.5 lg:col-span-2 min-w-0">
                                                                <p className="text-[12px] text-zinc-400 font-medium tracking-wider whitespace-nowrap">GSTIN</p>
                                                                <p className="text-[14px] text-black font-medium break-words" style={{ fontFamily: 'Anek Latin' }}>{item.gstin}</p>
                                                            </div>
                                                            <div className="space-y-0.5 lg:col-span-2 min-w-0">
                                                                <p className="text-[12px] text-zinc-400 font-medium tracking-wider whitespace-nowrap">Taxpayer type</p>
                                                                <p className="text-[14px] text-black font-medium break-words" style={{ fontFamily: 'Anek Latin' }}>{item.taxpayer_type || 'N/A'}</p>
                                                            </div>
                                                            <div className="space-y-0.5 lg:col-span-2 min-w-0">
                                                                <p className="text-[12px] text-zinc-400 font-medium tracking-wider whitespace-nowrap">GST status</p>
                                                                <p className="text-[14px] text-black font-medium break-words" style={{ fontFamily: 'Anek Latin' }}>{item.status || item.gst_status || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {gstList.length === 0 && (
                                            <p className="text-[14px] text-[#686868] font-medium">No valid GST accounts found. Please check your PAN details.</p>
                                        )}

                                        {selectedGsts.length === 0 && (
                                            <div className="flex gap-4 items-center pt-2">
                                                <input
                                                    type="checkbox"
                                                    id="noGstCheckbox"
                                                    checked={noGst}
                                                    onChange={e => {
                                                        setNoGst(e.target.checked);
                                                        if (e.target.checked) setSelectedGsts([]);
                                                    }}
                                                    className="w-6 h-6 rounded-[8px] border border-zinc-300 bg-white accent-black focus:ring-0 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                                                />
                                                <label htmlFor="noGstCheckbox" className="text-[14px] text-black font-semibold cursor-pointer select-none">
                                                    I don't have GST for this PAN
                                                </label>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Continue Button */}
                            <div className="pt-2 flex justify-center md:justify-start">
                                <button
                                    onClick={handleContinue}
                                    disabled={selectedGsts.length === 0 && !noGst}
                                    className="bg-black text-white w-full max-w-[110px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
