'use client';

import React, { Suspense, useState } from 'react';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

const stateCityMap: { [key: string]: string[] } = {}; // Removed hardcoded map

function BankDetailsContent() {
    const { setupData, updateSetupData, isLoggedIn, token } = useStore();
    const searchParams = useSearchParams();
    const categoryQuery = searchParams.get('category');
    const isPlay = categoryQuery === 'play';

    const [bankDetails, setBankDetails] = useState({
        account_holder_name: setupData.bank_details?.account_holder_name || setupData.pan_name || '',
        account_number: setupData.bank_details?.account_number || '',
        ifsc_code: setupData.bank_details?.ifsc_code || '',
        bank_name: setupData.bank_details?.bank_name || '',
        branch_name: setupData.bank_details?.branch_name || '',
        city: setupData.bank_details?.city || setupData.pan_verification?.address?.city || ''
    });

    // Check if bank details were pre-filled from a previous category registration
    const hasPreviousBankDetails = Boolean(
        setupData.bank_details?.account_number &&
        setupData.bank_details?.ifsc_code &&
        setupData.bank_details?.account_holder_name
    );

    const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [allStates, setAllStates] = useState<string[]>([]);
    const [isCertified, setIsCertified] = useState(hasPreviousBankDetails);
    const router = useRouter();
    const { addToast } = useToast();

    // State comes from the GSTIN the organizer selected (saved by GST page)
    // Fall back to PAN address state (may be empty for PAN Lite)
    const [selectedState, setSelectedState] = useState<string>(
        setupData.selected_state || setupData.pan_verification?.address?.state || ''
    );

    // Fetch all states for the no-GSTIN picker
    React.useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/states`)
            .then(r => r.json())
            .then(res => {
                if (res.status === 200 && res.data?.states) {
                    setAllStates((res.data.states as string[]).sort());
                }
            })
            .catch(() => {});
    }, []);

    // Fetch districts whenever selectedState changes
    React.useEffect(() => {
        const fetchDistricts = async () => {
            if (!selectedState) {
                setAvailableDistricts([]);
                return;
            }
            setIsLoadingDistricts(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/states/${encodeURIComponent(selectedState)}/districts`
                );
                const data = await res.json();
                if (data.status === 200 && data.data?.districts) {
                    setAvailableDistricts(data.data.districts);
                } else {
                    setAvailableDistricts([]);
                }
            } catch {
                setAvailableDistricts([]);
            } finally {
                setIsLoadingDistricts(false);
            }
        };
        fetchDistricts();
    }, [selectedState]);

    // Auth & Flow guard
    React.useEffect(() => {
        if (!isLoggedIn || !token) {
            router.replace('/list-your-events/setup');
            return;
        }
        if (!setupData.category && !categoryQuery) {
            router.replace('/list-your-events/setup');
        }
    }, [isLoggedIn, token, router, categoryQuery, setupData.category]);

    const handleContinue = () => {
        if (!bankDetails.account_holder_name || !bankDetails.account_number || !bankDetails.ifsc_code) {
            addToast('Please fill all bank details', 'warning');
            return;
        }
        if (!selectedState) {
            addToast('Please select a state', 'warning');
            return;
        }
        if (!bankDetails.city) {
            addToast('Please select a district', 'warning');
            return;
        }
        if (!isCertified) {
            addToast('Please certify that the details are accurate', 'warning');
            return;
        }
        updateSetupData({ bank_details: bankDetails });
        const effectiveCategory = setupData.category || categoryQuery;
        router.push(`/list-your-events/setup/backup?category=${effectiveCategory}`);
    };

    return (
        <div className={`min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)] transition-colors duration-500 ${isPlay ? 'bg-[#FFF1A81A]' : 'bg-[#FBFBFF]'}`}>
            {/* Content Area */}
            <main className="flex-1 px-4 md:px-14 lg:px-32 py-12 md:py-20">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Sidebar Column */}
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="03" completedSteps={['01', '02']} category={categoryQuery} />
                    </aside>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col pt-4 mt-[-75px]">
                        {/* Header Info */}
                        <div className="mb-12">
                            <p className="text-[14px] font-medium text-black opacity-80" style={{ fontFamily: 'Anek Latin' }}>
                                {setupData.has_gst ? '1 GST added' : 'No GST added'}
                            </p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>

                        {/* Mobile Sidebar */}
                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="03" completedSteps={['01', '02']} category={categoryQuery} />
                        </div>

                        {/* Form Area */}
                        <div className="space-y-10 mt-[-15px]">
                            <h1 className="text-[32px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                Bank details
                            </h1>

                            {hasPreviousBankDetails && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 max-w-4xl">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-emerald-600 text-sm">✓</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-800">Bank details carried forward</p>
                                        <p className="text-xs text-emerald-600 mt-1">These details are from your previous verification. Bank details must remain consistent across all categories. Review and continue.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 max-w-4xl">
                                {/* Bank Account Name */}
                                <div className="space-y-3 mt-[-15px]">
                                    <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                        Enter name on bank account
                                    </label>
                                    <input
                                        type="text"
                                        value={bankDetails.account_holder_name}
                                        onChange={(e) => setBankDetails({ ...bankDetails, account_holder_name: e.target.value })}
                                        placeholder="Velrona Technologies Pvt Ltd."
                                        disabled={hasPreviousBankDetails}
                                        className={`w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400 mt-3 ${hasPreviousBankDetails ? 'bg-zinc-50 opacity-70 cursor-not-allowed' : ''}`}
                                    />
                                </div>

                                {/* Account Number */}
                                <div className="space-y-3 mt-[-15px]">
                                    <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                        Enter bank account number
                                    </label>
                                    <input
                                        type="text"
                                        value={bankDetails.account_number}
                                        onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                                        placeholder="eg. 012345678910"
                                        disabled={hasPreviousBankDetails}
                                        className={`w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400 mt-3 ${hasPreviousBankDetails ? 'bg-zinc-50 opacity-70 cursor-not-allowed' : ''}`}
                                    />
                                </div>

                                {/* IFSC Code */}
                                <div className="space-y-3">
                                    <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                        Enter bank IFSC code
                                    </label>
                                    <input
                                        type="text"
                                        value={bankDetails.ifsc_code}
                                        onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value.toUpperCase() })}
                                        placeholder="eg. IDFB0000001"
                                        maxLength={11}
                                        disabled={hasPreviousBankDetails}
                                        className={`w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400 mt-3 uppercase ${hasPreviousBankDetails ? 'bg-zinc-50 opacity-70 cursor-not-allowed' : ''}`}
                                    />
                                </div>

                                <div className="hidden md:block" />

                                {/* Bank Name */}
                                <div className="space-y-3">
                                    <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                        Bank Name
                                    </label>
                                    <input
                                        type="text"
                                        value={bankDetails.bank_name}
                                        onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                                        placeholder="eg. IDFC FIRST Bank"
                                        disabled={hasPreviousBankDetails}
                                        className={`w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400 mt-3 ${hasPreviousBankDetails ? 'bg-zinc-50 opacity-70 cursor-not-allowed' : ''}`}
                                    />
                                </div>

                                {/* State selector — shown only when no GSTIN was selected */}
                                {!setupData.selected_state && (
                                    <div className="space-y-3">
                                        <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                            Select State
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedState}
                                                onChange={(e) => {
                                                    setSelectedState(e.target.value);
                                                    setBankDetails(prev => ({ ...prev, city: '' }));
                                                    updateSetupData({ selected_state: e.target.value });
                                                }}
                                                disabled={hasPreviousBankDetails}
                                                className={`w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium appearance-none cursor-pointer focus:outline-none focus:border-zinc-500 transition-colors mt-3 ${hasPreviousBankDetails ? 'bg-zinc-50 opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="">Select state</option>
                                                {allStates.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-[38px] -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                {/* District Dropdown */}
                                <div className="space-y-3">
                                    <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                        Select District
                                        {selectedState && (
                                            <span className="ml-2 text-[12px] text-zinc-400">({selectedState})</span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={bankDetails.city}
                                            onChange={(e) => setBankDetails({ ...bankDetails, city: e.target.value })}
                                            disabled={hasPreviousBankDetails || !selectedState}
                                            className={`w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium appearance-none cursor-pointer focus:outline-none focus:border-zinc-500 transition-colors mt-3 ${(hasPreviousBankDetails || !selectedState) ? 'bg-zinc-50 opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">
                                                {!selectedState ? 'Select a state first' : isLoadingDistricts ? 'Loading districts...' : 'Select district'}
                                            </option>
                                            {availableDistricts.map((district, idx) => (
                                                <option key={idx} value={district}>{district}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={18} className="absolute right-4 top-[38px] -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Certification Checkbox */}
                            <div className="flex gap-4 items-start pt-4 max-w-2xl cursor-pointer" onClick={() => setIsCertified(!isCertified)}>
                                <input
                                    type="checkbox"
                                    checked={isCertified}
                                    onChange={(e) => setIsCertified(e.target.checked)}
                                    className="w-6 h-6 mt-1 rounded-[8px] border border-zinc-300 accent-black focus:ring-0 cursor-pointer flex-shrink-0"
                                />
                                <p className="text-[13px] text-[#686868] font-medium leading-normal select-none" style={{ fontFamily: 'Anek Latin' }}>
                                    I hereby certify that the above details are accurate, the bank account mentioned above is maintained by me or my organisation, and I take full responsibility if any information is found false under applicable laws.
                                </p>
                            </div>

                            {/* Continue Button */}
                            <div className="pt-2 flex justify-center md:justify-start">
                                <button
                                    onClick={handleContinue}
                                    disabled={!isCertified}
                                    className={`w-full md:w-[150px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all group active:scale-95 ${!isCertified
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

export default function BankDetailsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-zinc-50" />}>
            <BankDetailsContent />
        </Suspense>
    );
}
