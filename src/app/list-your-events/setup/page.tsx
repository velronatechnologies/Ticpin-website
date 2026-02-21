'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronDown, FileText, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthModal from '@/components/modals/AuthModal';
import { useToast } from '@/context/ToastContext';

const categories = [
    { id: 'individual', label: 'Individual' },
    { id: 'creator', label: 'Creator' },
    { id: 'company', label: 'Company' },
    { id: 'play', label: 'Play Venue' },
    { id: 'dining', label: 'Dining Outlet' },
    { id: 'non-profit', label: 'Non-profit Organization' },
];

function AccountSetupContent() {
    const { setupData, updateSetupData, isLoggedIn, token } = useStore();
    const searchParams = useSearchParams();
    const categoryQuery = searchParams.get('category');
    const isPlay = categoryQuery === 'play';
    const isDining = categoryQuery === 'dining';

    const [selectedCategory, setSelectedCategory] = useState(setupData.category || (categories.some(c => c.id === categoryQuery) ? categoryQuery : ''));
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [pan, setPan] = useState(setupData.pan || '');
    const [panName, setPanName] = useState(setupData.pan_name || '');
    const [panImage, setPanImage] = useState(setupData.pan_image || '');
    const [panVerification, setPanVerification] = useState<any>(setupData.pan_verification || null);
    const [dob, setDob] = useState(setupData.pan_verification?.dob || '');
    const [isPanVerifiedFromDB, setIsPanVerifiedFromDB] = useState(false);
    const [isVerifyingPAN, setIsVerifyingPAN] = useState(false);
    const [panError, setPanError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isPrefilling, setIsPrefilling] = useState(false);
    const router = useRouter();
    const { addToast } = useToast();
    const hasShownAuthToast = React.useRef(false);

    // Fetch prefill data on mount
    useEffect(() => {
        const fetchPrefill = async () => {
            if (!isLoggedIn || !token) return;

            setIsPrefilling(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/partners/prefill`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const res = await response.json();
                if (res.status === 200 && res.data.is_pan_verified) {
                    setPan(res.data.pan_number);
                    setPanName(res.data.pan_details?.registered_name || res.data.organization_name || "");
                    setDob(res.data.pan_details?.dob || "");
                    setPanVerification(res.data.pan_details);
                    setIsPanVerifiedFromDB(true);

                    // Update store if not already set
                    updateSetupData({
                        pan: res.data.pan_number,
                        pan_name: res.data.pan_details?.registered_name || res.data.organization_name || "",
                        pan_verification: res.data.pan_details,
                        bank_details: res.data.bank_details,
                        backup_contact: res.data.backup_contact,
                        gst_details: res.data.gst_details
                    });
                }
            } catch (err) {
                console.error('Prefill fetch error:', err);
            } finally {
                setIsPrefilling(false);
            }
        };

        fetchPrefill();
    }, [isLoggedIn, token]);

    // Clear verification and error when PAN, name, or DOB changes (only if not prefilled)
    useEffect(() => {
        setPanError(null);
        if (!isPanVerifiedFromDB && panVerification && (
            panVerification.pan !== pan ||
            panVerification.registered_name?.toLowerCase() !== panName?.toLowerCase() ||
            panVerification.dob !== dob
        )) {
            setPanVerification(null);
            updateSetupData({ pan_verification: null });
        }
    }, [pan, panName, dob, isPanVerifiedFromDB]);

    // Check authentication and organizer status on mount
    useEffect(() => {
        const checkAuthAndStatus = async () => {
            if (!isLoggedIn || !token) {
                if (!hasShownAuthToast.current) {
                    addToast('Please login to access the setup page', 'warning');
                    hasShownAuthToast.current = true;
                }
                router.push('/list-your-events');
                return;
            }

            // If logged back in, reset the ref
            hasShownAuthToast.current = false;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/partners/my-status${categoryQuery ? `?category=${categoryQuery}` : ''}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (data.data?.status === 'approved') {
                    addToast('You are already an approved organizer for this category', 'info');
                    router.push(`/organizer-dashboard?category=${categoryQuery || 'event'}`);
                    return;
                }

                if (data.data?.status === 'pending' || data.data?.status === 'under_review') {
                    addToast('Your verification request for this category is already pending', 'info');
                    router.push(`/organizer-dashboard?category=${categoryQuery || 'event'}`);
                    return;
                }

                // If user has PAN verified but no category profile, backend returns status "new_category"
                // This is handled by prefill fetch which simplifies things for the user
            } catch (e) {
                console.error('Error checking status:', e);
            }
        };

        checkAuthAndStatus();
    }, [router, categoryQuery, addToast, isLoggedIn, token]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            addToast('File too large. Max 5MB', 'error');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'pan_cards');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await response.json();
            if (data.status === 200 || data.success) {
                setPanImage(data.data.url);
                updateSetupData({ pan_image: data.data.url });
                addToast('PAN card uploaded successfully', 'success');
            } else {
                addToast(data.message || 'Upload failed', 'error');
            }
        } catch (err) {
            console.error('Upload error:', err);
            addToast('Could not upload file', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleVerifyPAN = async () => {
        if (!token) {
            setIsAuthModalOpen(true);
            return;
        }
        if (!pan || pan.length !== 10) {
            addToast('Please enter a valid 10-character PAN number', 'warning');
            return;
        }
        if (!panName) {
            addToast('Please enter the name exactly as it appears on your PAN card', 'warning');
            return;
        }
        if (!dob) {
            addToast('Please enter your date of birth as per PAN records', 'warning');
            return;
        }

        setPanError(null);
        setIsVerifyingPAN(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/partners/verify-pan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pan, name: panName, dob })
            });

            const data = await response.json();

            if (data.status === 200 || data.success) {
                const verificationData = data.data.pan_verification;
                setPanVerification(verificationData);
                updateSetupData({
                    pan_verification: verificationData,
                    pan: pan,
                    pan_name: panName
                });

                addToast('✓ PAN verified successfully!', 'success');

                // Fetch GSTINs automatically
                try {
                    const gstResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/partners/pan-gstin`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ pan })
                    });
                    const gstData = await gstResponse.json();
                    if (gstData.status === 200 || gstData.success) {
                        updateSetupData({ gstin_mapping: gstData.data });
                    }
                } catch (e) {
                    console.error('Error fetching GSTINs:', e);
                }
            } else {
                const errorMsg = data.message || '';
                let friendlyError = '';

                if (errorMsg.includes('Name mismatch')) {
                    friendlyError = '❌ Name mismatch — The name you entered does not match PAN records. Enter your full name exactly as printed on your PAN card.';
                } else if (errorMsg.includes('Date of birth mismatch')) {
                    friendlyError = '❌ Date of birth mismatch — The DOB you entered does not match PAN records. Enter your date of birth exactly as registered on your PAN card.';
                } else if (errorMsg.includes('Invalid PAN')) {
                    friendlyError = '❌ Invalid PAN number — This PAN appears to be invalid or inactive. Please double-check your PAN number.';
                } else if (errorMsg.includes('already registered')) {
                    friendlyError = '❌ This PAN is already linked to another account. Please use the account you originally registered with.';
                } else {
                    friendlyError = '❌ Verification failed — Please check that your PAN number, name, and date of birth are correct and try again.';
                }

                setPanError(friendlyError);
                addToast(friendlyError.replace('❌ ', ''), 'error');
            }
        } catch (err) {
            console.error('Verification error:', err);
            addToast('Unable to connect to verification service. Please try again in few minutes.', 'error');
        } finally {
            setIsVerifyingPAN(false);
        }
    };

    const handleContinue = () => {
        if (!selectedCategory) {
            addToast('Please select a category', 'warning');
            return;
        }
        if (!pan || pan.length !== 10) {
            addToast('Please enter a valid 10-character PAN number', 'warning');
            return;
        }
        if (!panName) {
            addToast('Please enter the name as per PAN card', 'warning');
            return;
        }
        if (!panVerification) {
            addToast('Please verify your PAN card before continuing', 'warning');
            return;
        }
        if (!panImage && !isPanVerifiedFromDB) {
            addToast('Please upload your PAN card document', 'warning');
            return;
        }

        updateSetupData({
            category: selectedCategory,
            pan: pan,
            pan_name: panName,
            pan_image: panImage,
            pan_verification: panVerification
        });

        router.push(`/list-your-events/setup/gst?category=${selectedCategory}`);
    };

    return (
        <div className={`min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)] transition-colors duration-500 ${isPlay ? 'bg-[#FFF1A81A]' : ''}`}>
            {/* Content Area */}
            <main className="flex-1 px-4 md:px-14 lg:px-32 py-12 md:py-20">
                <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Sidebar Column */}
                    <aside className="w-fit pt-36 hidden lg:block">
                        <SetupSidebar currentStep="01" category={categoryQuery} />
                    </aside>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col pt-4">
                        {/* Global Header */}
                        <div className="mb-12 mt-[-75px]">
                            <h1 className="text-[32px] md:text-[36px] font-medium text-black mb-2" style={{ fontFamily: 'Anek Latin' }}>
                                Set up your Ticpin account
                            </h1>
                            <div className="w-[180px] h-[1px] bg-zinc-300 mt-8" />
                        </div>
                        {/* Mobile Sidebar - visible only on small screens */}
                        <div className="lg:hidden mb-12">
                            <SetupSidebar currentStep="01" category={categoryQuery} />
                        </div>

                        {/* Form Section */}
                        <div className="space-y-5 mt-[-15px]">
                            <h2 className="text-[26px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                Organization details
                            </h2>

                            <div className="space-y-8">
                                {/* Category Dropdown */}
                                <div className="flex flex-col gap-4 md:gap-3">
                                    <label className="text-[16px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                        Category
                                    </label>
                                    <div className="relative max-w-sm ml-[-3px]">
                                        <div
                                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                            className="w-full h-12 px-4 border border-zinc-200 rounded-[15px] flex items-center justify-between cursor-pointer hover:border-zinc-500 transition-colors"
                                        >
                                            <span className={`text-[15px] font-medium ${selectedCategory ? 'text-zinc-800' : 'text-zinc-400'}`}>
                                                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.label : 'Choose Category'}
                                            </span>
                                            <ChevronDown size={18} className={`text-zinc-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        {isCategoryOpen && (
                                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#D9D9D9] border border-zinc-200 rounded-[15px] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                                {categories.map((cat) => (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => {
                                                            setSelectedCategory(cat.id);
                                                            setIsCategoryOpen(false);
                                                        }}
                                                        className="px-4 py-3 text-[15px] font-medium text hover:bg-black/10 cursor-pointer transition-colors"
                                                    >
                                                        {cat.label}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* PAN Inputs Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                    <div className="flex flex-col gap-4 md:gap-3">
                                        <label className="text-[16px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                            Enter your PAN
                                        </label>
                                        <div className="ml-[-3px] flex items-center gap-3 mt-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    value={pan}
                                                    onChange={(e) => {
                                                        const val = e.target.value.toUpperCase();
                                                        if (val.length <= 10) setPan(val);
                                                    }}
                                                    maxLength={10}
                                                    placeholder="ABCDE1234F"
                                                    disabled={isPanVerifiedFromDB || (panVerification && panVerification.status === 'VALID')}
                                                    className="w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400 uppercase disabled:bg-zinc-50"
                                                />
                                                {panVerification && panVerification.status === 'VALID' && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 md:gap-3 pl-0 md:pl-10">
                                        <label className="text-[16px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                            Enter name as per PAN card
                                        </label>
                                        <div className="ml-[-3px] flex items-center gap-3 mt-3">
                                            <input
                                                type="text"
                                                value={panName}
                                                onChange={(e) => setPanName(e.target.value)}
                                                placeholder="Velrona Technologies Pvt Ltd."
                                                disabled={isPanVerifiedFromDB || (panVerification && panVerification.status === 'VALID')}
                                                className="flex-1 h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400 disabled:bg-zinc-50"
                                            />
                                        </div>
                                    </div>

                                    {/* DOB Field */}
                                    <div className="flex flex-col gap-4 md:gap-3">
                                        <label className="text-[16px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                            Date of Birth (as per PAN)
                                        </label>
                                        <div className="ml-[-3px] flex items-center gap-3 mt-3">
                                            <input
                                                type="date"
                                                value={dob}
                                                onChange={(e) => setDob(e.target.value)}
                                                disabled={isPanVerifiedFromDB || (panVerification && panVerification.status === 'VALID')}
                                                className="flex-1 h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400 disabled:bg-zinc-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Verify Button Column */}
                                    <div className="flex flex-col gap-4 md:gap-3 pl-0 md:pl-10 justify-end">
                                        <div className="ml-[-3px] flex items-center gap-3">
                                            {!isPanVerifiedFromDB && (
                                                <button
                                                    onClick={handleVerifyPAN}
                                                    disabled={isVerifyingPAN || !pan || pan.length !== 10 || !panName || !dob || (panVerification && panVerification.status === 'VALID')}
                                                    className={`h-12 w-full md:w-fit px-8 rounded-[14px] text-[14px] font-medium transition-all whitespace-nowrap ${panVerification && panVerification.status === 'VALID'
                                                        ? 'bg-[#E3FFEF] text-[#008B38] border border-[#BFFFD9] cursor-not-allowed'
                                                        : 'bg-black text-white hover:bg-zinc-800 active:scale-95 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed'
                                                        }`}
                                                >
                                                    {isVerifyingPAN ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : panVerification && panVerification.status === 'VALID' ? (
                                                        '✓ Verified'
                                                    ) : (
                                                        'Verify Details'
                                                    )}
                                                </button>
                                            )}
                                            {isPanVerifiedFromDB && (
                                                <div className="h-12 px-6 rounded-[14px] text-[14px] font-medium bg-[#E3FFEF] text-[#008B38] border border-[#BFFFD9] flex items-center w-fit">
                                                    ✓ Verified
                                                </div>
                                            )}
                                            {/* Only show Remove for fresh verifications, not for pre-filled PAN from previous categories */}
                                            {!isPanVerifiedFromDB && panVerification && panVerification.status === 'VALID' && (
                                                <button
                                                    onClick={() => {
                                                        setPanVerification(null);
                                                        setIsPanVerifiedFromDB(false);
                                                        updateSetupData({ pan_verification: null });
                                                        addToast('PAN verification reset. You can now edit and re-verify.', 'info');
                                                    }}
                                                    className="ml-2 text-[13px] text-red-500 hover:text-red-700 font-medium underline transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        {panVerification && panVerification.status === 'VALID' && (
                                            <p className="text-[13px] text-green-600 font-medium mt-2 ml-[-3px] animate-in fade-in slide-in-from-top-1">
                                                ✓ PAN successfully verified and matched.
                                            </p>
                                        )}
                                        {panError && !panVerification && (
                                            <div className="mt-3 ml-[-3px] p-3 bg-red-50 border border-red-200 rounded-[12px] animate-in fade-in slide-in-from-top-1">
                                                <p className="text-[13px] text-red-700 font-medium leading-relaxed">{panError}</p>
                                                <p className="text-[12px] text-red-500 mt-1">Please correct the field highlighted and try again.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>



                                {/* Upload PAN Card */}
                                {!isPanVerifiedFromDB && (
                                    <div className="flex flex-col gap-4 md:gap-3">
                                        <label className="text-[16px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                            Upload your PAN card
                                        </label>
                                        <div className="ml-[-3px]">
                                            <input
                                                type="file"
                                                id="pan-upload"
                                                className="hidden"
                                                accept="image/*,.pdf"
                                                onChange={handleUpload}
                                            />
                                            <label
                                                htmlFor="pan-upload"
                                                className="w-full max-w-sm h-23 bg-transparent border border-[#AEAEAE] rounded-[20px] flex items-center px-6 gap-4 transition-colors group cursor-pointer hover:bg-zinc-50"
                                            >
                                                <div className="w-10 h-10 flex items-center justify-center">
                                                    {isUploading ? (
                                                        <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
                                                    ) : (
                                                        <img src="/list your events/doc icon.svg" alt="doc" className="w-6 h-6 object-contain" />
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[16px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>
                                                        {isUploading ? 'Uploading...' : panImage ? 'File Uploaded' : 'Upload document'}
                                                    </p>
                                                    <p className="text-[12px] text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                                        {panImage ? 'Click to change' : 'Max 5MB • JPEG, JPG, PNG, PDF'}
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Continue Button */}
                            <div className="pt-2 flex justify-center md:justify-start">
                                <button
                                    onClick={handleContinue}
                                    className="bg-black text-white w-full md:w-[150px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all group active:scale-95 hover:bg-zinc-800 shadow-xl shadow-black/5"
                                >
                                    Continue<ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AuthModal
                isOpen={isAuthModalOpen}
                isOrganizer={true}
                category={categoryQuery}
                onClose={() => {
                    setIsAuthModalOpen(false);
                    if (!isLoggedIn) {
                        router.push('/');
                    }
                }}
                onAuthSuccess={(id, token) => {
                    setIsAuthModalOpen(false);
                }}
            />
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
