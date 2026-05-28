'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SetupSidebar from '@/app/list-your-play/list-your-Setups/SetupSidebar';
import { ChevronDown, ChevronRight, Check, Lock } from 'lucide-react';
import { getOrganizerSession } from '@/lib/auth/organizer';
import { organizerApi } from '@/lib/api/organizer';
import { toast } from '@/components/ui/Toast';

const categories = [
    { id: 'individual', label: 'Individual' },
    { id: 'creator', label: 'Creator' },
    { id: 'company', label: 'Company' },
    { id: 'non-profit', label: 'Non-profit Organization' },
];

const STORAGE_KEY = 'setup_play';

function AccountSetupContent() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('individual');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [pan, setPan] = useState('');
    const [panName, setPanName] = useState('');
    const [phone, setPhone] = useState('');
    const [panCardUrl, setPanCardUrl] = useState('');
    const [panFileName, setPanFileName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [prefilled, setPrefilled] = useState(false);
    const [panVerified, setPanVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [hasCheckedSession, setHasCheckedSession] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCheckedSession(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!hasCheckedSession) return;

        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
        if (saved.orgType) setSelectedCategory(saved.orgType);
        if (saved.prefilled) setPrefilled(saved.prefilled);
        if (saved.phone) setPhone(saved.phone);
        if (saved.pan) {
            setPan(saved.pan); 
            setPanName(saved.panName ?? '');
            setPanCardUrl(saved.panCardUrl ?? '');
            setPanFileName(saved.panFileName ?? '');
        }
        const session = getOrganizerSession();
        if (!session) {
            router.replace('/list-your-play/Login');
            return;
        }

        if (session.id) {
            organizerApi.getExistingSetup('play')
                .then(setup => {
                    if (setup?.pan) {
                        setPan(setup.pan); setPanName(setup.panName ?? '');
                        setPanCardUrl(setup.panCardUrl ?? '');
                        setPhone(setup.phone ?? '');
                        setPanFileName('(pre-filled from existing verification)');
                        setPrefilled(true);
                        setPanVerified(setup.panVerified ?? false);
                        if (setup.panVerified && setup.panCardUrl) {
                            router.push('/list-your-play/setup/gst');
                            return;
                        }
                        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                            prefilled: true,
                            orgType: 'individual',
                            phone: setup.phone ?? '',
                            pan: setup.pan, panName: setup.panName ?? '',
                            panCardUrl: setup.panCardUrl ?? '', panFileName: '(pre-filled)',
                            bankAccountNo: setup.bankAccountNo ?? '', bankIfsc: setup.bankIfsc ?? '',
                            bankName: setup.bankName ?? '', accountHolder: setup.accountHolder ?? '',
                            gstNumber: setup.gstNumber ?? '',
                            backupEmail: setup.backupEmail ?? '', backupPhone: setup.backupPhone ?? '',
                        }));
                    }
                })
                .catch(err => { console.error('Setup loading error:', err); })
                .finally(() => setPageLoading(false));
        } else { setPageLoading(false); }
    }, [hasCheckedSession, router]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit as requested)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size is too large. Please upload a file smaller than 10MB.');
            if (fileRef.current) fileRef.current.value = '';
            return;
        }

        setUploading(true);
        try {
            const url = await organizerApi.uploadPAN(file);
            setPanCardUrl(url); setPanFileName(file.name);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Upload failed';
            let userMessage = 'Unable to upload your PAN card. Please try again.';
            
            if (errMsg.includes('ip_validation_failed') || errMsg.includes('authentication_error')) {
                userMessage = 'Our system is experiencing temporary connectivity issues. Please try again in a few moments.';
            } else if (errMsg.includes('file size') || errMsg.includes('10MB') || errMsg.includes('5MB')) {
                userMessage = 'File size is too large. Please upload a file smaller than 10MB.';
            } else if (errMsg.includes('format') || errMsg.includes('type')) {
                userMessage = 'Invalid file format. Please upload JPEG, JPG, PNG, or PDF.';
            } else if (errMsg.includes('Internal Server Error') || errMsg.includes('failed')) {
                userMessage = 'Our server is experiencing issues. Please try again after some time.';
            }
            
            toast.error(userMessage);
        } finally { 
            setUploading(false); 
            if (fileRef.current) fileRef.current.value = ''; // Reset to allow re-uploading same file
        }
    };

    const handleVerifyPAN = async () => {
        if (!pan || !panName) {
            toast.error('Please fill in PAN and Name first');
            return;
        }

        if (panName.trim().length < 3) {
            toast.error('Name must be at least 3 characters long.');
            return;
        }

        setVerifying(true);
        try {
            await organizerApi.verifyPAN(pan, panName);
            setPanVerified(true);
            const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, orgType: selectedCategory, pan, panName, panVerified: true }));
        } catch (err: any) {
            const errMsg = err.message || '';
            let userMessage = 'PAN verification failed. Please check your details and try again.';
            
            if (errMsg.includes('ip_validation_failed') || errMsg.includes('authentication_error')) {
                userMessage = 'Our system is experiencing temporary connectivity issues. Please try again in a few moments.';
            } else if (errMsg.includes('pan_already_used') || errMsg.includes('already registered')) {
                userMessage = 'This PAN card is already registered with another account.';
            } else if (errMsg.includes('pan_length_short') || errMsg.includes('Enter valid PAN') || errMsg.includes('exactly 10 characters') || errMsg.includes('invalid format')) {
                userMessage = 'PAN card number is invalid. Please check and try again.';
            } else if (errMsg.includes('does not exist') || errMsg.includes('not exist') || errMsg.includes('not found')) {
                userMessage = 'This PAN card number does not exist. Please enter a valid PAN.';
            } else if (errMsg.includes('Name is not same') || errMsg.includes('name') || errMsg.includes('match') || errMsg.includes('mismatch')) {
                userMessage = 'The name you entered does not match your PAN record. Please enter the name exactly as it appears on your PAN card.';
            } else if (errMsg.includes('cashfree error') || errMsg.includes('credits over') || errMsg.includes('Internal Server Error')) {
                userMessage = 'Our verification system is temporarily down or reaching its limit. Please contact support or try again later.';
            }
            
            toast.error(userMessage);
        } finally {
            setVerifying(false);
        }
    };

    const handleContinue = async () => {
        if (!prefilled && !panVerified) {
            if (!pan || !panName || !phone) {
                toast.error('Please fill in PAN, Name and Mobile Number first');
                return;
            }
            if (!/^\d{10}$/.test(phone)) {
                toast.error('Please enter a valid 10-digit mobile number');
                return;
            }
            if (panName.trim().length < 3) {
                toast.error('Name must be at least 3 characters long.');
                return;
            }

            setVerifying(true);
            try {
                await organizerApi.verifyPAN(pan, panName);
                setPanVerified(true);
                const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, orgType: selectedCategory, pan, panName, phone, panVerified: true }));
            } catch (err: any) {
                setVerifying(false);
                const errMsg = err.message || '';
                let userMessage = 'PAN verification failed. Please check your details and try again.';

                if (errMsg.includes('ip_validation_failed') || errMsg.includes('authentication_error')) {
                    userMessage = 'Our system is experiencing temporary connectivity issues. Please try again in a few moments.';
                } else if (errMsg.includes('pan_already_used') || errMsg.includes('already registered')) {
                    userMessage = 'This PAN card is already registered with another account.';
                } else if (errMsg.includes('pan_length_short') || errMsg.includes('exactly 10 characters') || errMsg.includes('invalid')) {
                    userMessage = 'PAN card number is invalid. Please check and try again.';
                } else if (errMsg.includes('does not exist') || errMsg.includes('not exist')) {
                    userMessage = 'This PAN card number does not exist. Please enter a valid PAN.';
                } else if (errMsg.includes('Name is not same') || errMsg.includes('match') || errMsg.includes('mismatch')) {
                    userMessage = 'The name you entered does not match your PAN record. Please enter the name exactly as it appears on your PAN card.';
                } else if (errMsg.includes('cashfree error') || errMsg.includes('credits over') || errMsg.includes('Internal Server Error')) {
                    userMessage = 'Our verification system is temporarily down. Please try again later.';
                }

                toast.error(userMessage);
                return;
            } finally {
                setVerifying(false);
            }
        }

        if (!prefilled && !panCardUrl) {
            toast.error('Please upload your PAN card document');
            return;
        }

        const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, orgType: selectedCategory, pan, panName, phone, panCardUrl, panFileName, panVerified: true }));
        router.push('/list-your-play/setup/gst');
    };

    const canContinue = prefilled || (pan && panName && phone && !!panCardUrl);

    if (pageLoading) return <div className="h-[calc(100vh-80px)] animate-pulse bg-zinc-50" />;

    return (
        <div className="overflow-hidden flex flex-col font-[family-name:var(--font-anek-latin)] h-[calc(100vh-80px)] bg-gradient-to-b from-[#FFFCED] via-white to-white">
            <main className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-10 lg:px-16 py-10 md:py-16">
                <div className="max-w-[1250px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
                    <aside className="w-fit pt-32 hidden lg:block">
                        <SetupSidebar currentStep="01" />
                    </aside>
                    <div className="flex-1 flex flex-col pt-4 lg:mt-[-75px] mt-0">
                        <div className="mb-12 mt-12">
                            <h1 className="text-[32px] md:text-[36px] font-medium text-black mb-2" style={{ fontFamily: 'Anek Latin' }}>Set up your Ticpin account</h1>
                            <div className="w-[180px] h-[1px] bg-zinc-300 mt-8" />
                        </div>
                        <div className="lg:hidden mb-12"><SetupSidebar currentStep="01" /></div>

                        {/* {prefilled && (
                            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-[16px] px-6 py-4 flex items-start gap-3">
                                <Lock size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-[14px] text-blue-900 font-semibold">PAN details pre-filled from existing verification</p>
                                    <p className="text-[13px] text-blue-700 mt-1">All your information is verified. You can proceed directly to the next step.</p>
                                </div>
                            </div>
                        )} */}

                        <div className="space-y-5 mt-[-15px]">
                            <h2 className="text-[26px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>Organization details</h2>
                            <div className="space-y-8">
                                {/* Category */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-[16px] font-medium text-[#686868]">Category</label>
                                    <div className="relative max-w-sm">
                                        <div onClick={() => !prefilled && setIsCategoryOpen(v => !v)}
                                            className={`w-full h-12 px-4 border border-zinc-200 rounded-[15px] flex items-center justify-between transition-colors ${prefilled ? 'bg-zinc-100 cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-zinc-500'}`}>
                                            <span className="text-[15px] font-medium text-zinc-800">{categories.find(c => c.id === selectedCategory)?.label ?? 'Choose Category'}</span>
                                            <ChevronDown size={18} className={`text-zinc-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                        {isCategoryOpen && !prefilled && (
                                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white/10 backdrop-blur-md rounded-[15px] shadow-lg z-50 overflow-hidden">
                                                {categories.map(cat => (
                                                    <div key={cat.id} onClick={() => { setSelectedCategory(cat.id); setIsCategoryOpen(false); }}
                                                        className="px-4 py-3 text-[15px] font-medium hover:bg-black/10 cursor-pointer transition-colors">{cat.label}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* PAN fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[16px] font-medium text-[#686868]">
                                            PAN Number
                                        </label>
                                        <input type="text" placeholder="ABCDE1234F" value={pan}
                                            name="panNumber" autoComplete="off"
                                            onChange={e => setPan(e.target.value.toUpperCase())} disabled={prefilled || panVerified}
                                            className={`w-full h-12 px-4 border rounded-[14px] text-[15px] font-medium focus:outline-none transition-colors placeholder:text-zinc-400 ${(prefilled || panVerified) ? 'border-zinc-200 bg-zinc-100 text-zinc-600 cursor-not-allowed' : 'border-[#AEAEAE] text-zinc-800 focus:border-zinc-500'}`} />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[16px] font-medium text-[#686868]">
                                            Name (as on PAN)
                                        </label>
                                        <input type="text" placeholder="Name as on PAN" value={panName}
                                            name="panName" autoComplete="off"
                                            onChange={e => setPanName(e.target.value)} disabled={prefilled || panVerified}
                                            className={`w-full h-12 px-4 border rounded-[14px] text-[15px] font-medium focus:outline-none transition-colors placeholder:text-zinc-400 ${(prefilled || panVerified) ? 'border-zinc-200 bg-zinc-100 text-zinc-600 cursor-not-allowed' : 'border-[#AEAEAE] text-zinc-800 focus:border-zinc-500'}`} />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[16px] font-medium text-[#686868]">
                                            Mobile number
                                        </label>
                                        <input type="text" placeholder="10-digit mobile number" value={phone}
                                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} disabled={prefilled}
                                            className={`w-full h-12 px-4 border rounded-[14px] text-[15px] font-medium focus:outline-none transition-colors placeholder:text-zinc-400 ${prefilled ? 'border-zinc-200 bg-zinc-100 text-zinc-600 cursor-not-allowed' : 'border-[#AEAEAE] text-zinc-800 focus:border-zinc-500'}`} />
                                    </div>
                                </div>

                                {/* Verify PAN Button */}
                                

                                {/* Verification Success Message */}
                                {panVerified && (
                                    <div className="pt-4 flex items-center justify-between gap-4">
                                        <div className="flex-1 bg-green-50 border border-green-200 rounded-[14px] px-5 py-3 flex items-center gap-3">
                                            <Check size={16} className="text-green-600 flex-shrink-0" />
                                            <p className="text-[14px] text-green-700 font-medium">PAN verified successfully! You can now upload your PAN card document.</p>
                                        </div>
                                        {!prefilled && (
                                            <button onClick={() => setPanVerified(false)} className="text-[14px] font-medium text-[#5331EA] hover:underline whitespace-nowrap">Edit details</button>
                                        )}
                                    </div>
                                )}

                                {/* Upload PAN - Always show so user can upload and continue in one step */}
                                <div className="flex flex-col gap-3 pt-4">
                                    <label className="text-[16px] font-medium text-[#686868]">
                                        Upload your PAN card
                                    </label>
                                    <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} disabled={prefilled} />
                                    <button type="button" onClick={() => !prefilled && !uploading && fileRef.current?.click()} disabled={uploading || prefilled}
                                        className={`w-full max-w-sm h-[72px] border border-zinc-200 rounded-[20px] flex items-center px-6 gap-4 transition-colors ${prefilled ? 'bg-zinc-100 cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                            {uploading ? <div className="w-5 h-5 border-2 border-zinc-400 border-t-black rounded-full animate-spin" />
                                                : panCardUrl ? <Check size={22} className="text-green-600" />
                                                    : <Image src="/list your events/doc icon.svg" alt="doc" width={24} height={24} className="w-6 h-6 object-contain" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[15px] font-medium text-black truncate max-w-[220px]">{uploading ? 'Uploading…' : panFileName || 'Upload document'}</p>
                                            <p className="text-[12px] text-[#686868]">Max 5MB • JPEG, JPG, PNG, PDF</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-center md:justify-start">
                                <button onClick={handleContinue} disabled={!canContinue}
                                    className="bg-black text-white h-[48px] px-8 rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
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

export default function AccountSetupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-zinc-50" />}>
            <AccountSetupContent />
        </Suspense>
    );
}