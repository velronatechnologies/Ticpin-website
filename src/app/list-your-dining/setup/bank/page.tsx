'use client';

import React, { Suspense, useState, useEffect } from 'react';
import SetupSidebar from '@/app/list-your-dining/list-your-Setups/SetupSidebar';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getOrganizerSession } from '@/lib/auth/organizer';
import { organizerApi } from '@/lib/api/organizer';
import { toast } from '@/components/ui/Toast';

const STORAGE_KEY = 'setup_dining';
const NEXT_ROUTE = '/list-your-dining/setup/backup';
const BG = 'rgba(211, 203, 245, 0.1)';

function BankDetailsContent() {
    const router = useRouter();
    const [accountHolder, setAccountHolder] = useState('');
    const [bankAccountNo, setBankAccountNo] = useState('');
    const [bankIfsc, setBankIfsc] = useState('');
    const [bankName, setBankName] = useState('');
    const [prefilled, setPrefilled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [certChecked, setCertChecked] = useState(false);
    const [hasCheckedSession, setHasCheckedSession] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCheckedSession(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!hasCheckedSession) return;

        const session = getOrganizerSession();
        if (!session) { router.replace('/list-your-dining/Login'); return; }
        organizerApi.getExistingSetup('dining')
            .then(setup => {
                if (setup?.bankAccountNo) {
                    setAccountHolder(setup.accountHolder ?? '');
                    setBankAccountNo(setup.bankAccountNo);
                    setBankIfsc(setup.bankIfsc ?? '');
                    setBankName(setup.bankName ?? '');
                    setPrefilled(true);
                    const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                        ...existing, prefilled: true,
                        accountHolder: setup.accountHolder ?? '',
                        bankAccountNo: setup.bankAccountNo,
                        bankIfsc: setup.bankIfsc ?? '',
                        bankName: setup.bankName ?? '',
                    }));
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [router, hasCheckedSession]);

    useEffect(() => {
        const cleanIfsc = bankIfsc.trim().toUpperCase();
        if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
            fetch(`https://ifsc.razorpay.com/${cleanIfsc}`)
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Invalid IFSC');
                })
                .then(data => {
                    if (data && data.BANK) {
                        setBankName(data.BANK);
                    }
                })
                .catch(err => {
                    console.error('IFSC fetch error:', err);
                    toast.error('Invalid IFSC code. Please check and try again.');
                });
        }
    }, [bankIfsc]);

    const handleContinue = () => {
        if (!prefilled) {
            const nameTrimmed = accountHolder.trim();
            const accTrimmed = bankAccountNo.trim();
            const ifscTrimmed = bankIfsc.trim().toUpperCase();
            const bankTrimmed = bankName.trim();

            if (!nameTrimmed) { toast.error('Account holder name is required.'); return; }
            if (!/^[A-Za-z .&()-]{3,100}$/.test(nameTrimmed)) {
                toast.error('Account holder name must be between 3 and 100 characters and contain only letters, spaces, dots, &, -, or ( ).');
                return;
            }

            if (!accTrimmed) { toast.error('Bank account number is required.'); return; }
            if (!/^[0-9]{9,18}$/.test(accTrimmed)) {
                toast.error('Bank account number must be between 9 and 18 digits (numbers only).');
                return;
            }

            if (!ifscTrimmed) { toast.error('IFSC code is required.'); return; }
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscTrimmed)) {
                toast.error('Invalid IFSC code format (e.g. HDFC0001234).');
                return;
            }

            if (!bankTrimmed) { toast.error('Bank name is required.'); return; }
            if (!/^[A-Za-z .&()-]{3,80}$/.test(bankTrimmed)) {
                toast.error('Bank name must be between 3 and 80 characters and contain only letters, spaces, dots, &, -, or ( ).');
                return;
            }
        }
        if (!certChecked) { toast.error('Please certify that the details are accurate.'); return; }
        const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...existing,
            accountHolder: accountHolder.trim(),
            bankAccountNo: bankAccountNo.trim(),
            bankIfsc: bankIfsc.trim().toUpperCase(),
            bankName: bankName.trim(),
        }));
        router.push(NEXT_ROUTE);
    };

    const displayAccountNumber = prefilled
        ? (bankAccountNo.length > 4 ? 'X'.repeat(bankAccountNo.length - 4) + bankAccountNo.slice(-4) : bankAccountNo)
        : bankAccountNo;

    const inputCls = (locked: boolean) =>
        `w-full h-12 px-4 border border-[#AEAEAE] rounded-[14px] text-[15px] font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400 mt-3 ${locked ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed' : 'text-zinc-800'}`;

    if (loading) return <div className="min-h-screen animate-pulse bg-zinc-50" />;

    return (
        <div className="overflow-hidden flex flex-col font-[family-name:var(--font-anek-latin)] h-[calc(100vh-80px)]" style={{ background: BG }}>
            <main className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-14 lg:px-32 py-10 md:py-16">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="03" completedSteps={['01', '02']} />
                    </aside>
                    <div className="flex-1 flex flex-col pt-4 mt-[-75px]">
                        <div className="mb-12">
                            <p className="text-[14px] font-medium text-black opacity-80" style={{ fontFamily: 'Anek Latin' }}>&#123; BANK DETAILS &#125;</p>
                            <div className="w-[120px] h-[1px] bg-zinc-300 mt-6" />
                        </div>
                        <div className="lg:hidden mb-12"><SetupSidebar currentStep="03" completedSteps={['01', '02']} /></div>

                        <div className="space-y-10 mt-[-15px]">
                            <h1 className="text-[32px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>Bank details</h1>
                            {prefilled && (
                                <p className="text-[14px] text-[#5331EA] font-medium bg-[#5331EA]/10 border border-[#5331EA]/30 rounded-[12px] px-4 py-2 mt-[-20px]">
                                    Bank details pre-filled from your existing verified setup and locked.
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 max-w-4xl">
                                <div className="space-y-3 mt-[-15px]">
                                    <label className="text-[14px] font-medium text-[#686868]">Account holder name <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="Velora Technologies Pvt Ltd." value={accountHolder}
                                        onChange={e => setAccountHolder(e.target.value)} disabled={prefilled}
                                        minLength={3} maxLength={100}
                                        onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                                        className={inputCls(prefilled)} />
                                </div>
                                <div className="space-y-3 mt-[-15px]">
                                    <label className="text-[14px] font-medium text-[#686868]">Bank account number <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="eg. 012345678910" value={displayAccountNumber}
                                        onChange={e => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setBankAccountNo(value);
                                        }} disabled={prefilled}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        minLength={9} maxLength={18}
                                        onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                                        className={inputCls(prefilled)} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[14px] font-medium text-[#686868]">Bank IFSC code <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="eg. IDFB0000001" value={bankIfsc}
                                        onChange={e => setBankIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} disabled={prefilled}
                                        maxLength={11}
                                        onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                                        className={inputCls(prefilled)} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[14px] font-medium text-[#686868]">Bank name <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="eg. IDFC First Bank" value={bankName}
                                        onChange={e => setBankName(e.target.value)} disabled={prefilled}
                                        minLength={3} maxLength={80}
                                        onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                                        className={inputCls(prefilled)} />
                                </div>
                            </div>

                            <div className="flex gap-4 items-start pt-4 max-w-2xl">
                                <input type="checkbox" checked={certChecked} onChange={e => setCertChecked(e.target.checked)}
                                    className="w-6 h-6 mt-1 rounded-[8px] border border-zinc-300 accent-black cursor-pointer flex-shrink-0" />
                                <p className="text-[13px] text-[#686868] font-medium leading-normal">I hereby certify that the above details are accurate, the bank account mentioned above is maintained by me or my organisation, and I take full responsibility if any information is found false under applicable laws.</p>
                            </div>

                            <div className="pt-2 flex justify-center md:justify-start">
                                <button onClick={handleContinue}
                                    className="bg-black text-white w-full max-w-[110px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all active:scale-95">
                                    Continue<ChevronRight size={18} />
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
