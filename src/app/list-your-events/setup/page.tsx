'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import SetupSidebar from '@/app/list-your-events/list-your-Setups/SetupSidebar';
import { ChevronDown, FileText, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthModal from '@/components/modals/AuthModal';

const categories = [
    { id: 'individual', label: 'Individual' },
    { id: 'creator', label: 'Creator' },
    { id: 'company', label: 'Company' },
    { id: 'play', label: 'Play Venue' },
    { id: 'dining', label: 'Dining Outlet' },
    { id: 'non-profit', label: 'Non-profit Organization' },
];

function AccountSetupContent() {
    const { setupData, updateSetupData, isLoggedIn } = useStore();
    const searchParams = useSearchParams();
    const categoryQuery = searchParams.get('category');
    const isPlay = categoryQuery === 'play';
    const isDining = categoryQuery === 'dining';

    const [selectedCategory, setSelectedCategory] = useState(setupData.category || (categories.some(c => c.id === categoryQuery) ? categoryQuery : ''));
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [pan, setPan] = useState(setupData.pan || '');
    const [panName, setPanName] = useState(setupData.pan_name || '');
    const [panImage, setPanImage] = useState(setupData.pan_image || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkStatus = async () => {
            const state = useStore.getState();
            if (state.token) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/partners/my-status${categoryQuery ? `?category=${categoryQuery}` : ''}`, {
                        headers: { 'Authorization': `Bearer ${state.token}` }
                    });
                    const data = await response.json();
                    if (data.data?.status) {
                        router.push('/list-your-events/dashboard');
                    }
                } catch (e) { }
            }
        };
        checkStatus();
    }, [router, categoryQuery]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Max 5MB');
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
                    'Authorization': `Bearer ${useStore.getState().token}`
                },
                body: formData
            });
            const data = await response.json();
            if (data.status === 200) {
                setPanImage(data.data.url);
                updateSetupData({ pan_image: data.data.url });
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Could not upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleContinue = () => {
        const loggedIn = useStore.getState().isLoggedIn;
        if (!loggedIn) {
            setIsAuthModalOpen(true);
            return;
        }
        if (!selectedCategory || !pan || !panName || !panImage) {
            alert('Please fill all fields and upload PAN card');
            return;
        }

        // Save to store
        updateSetupData({
            category: selectedCategory,
            pan: pan,
            pan_name: panName,
            pan_image: panImage
        });

        router.push(`/list-your-events/setup/gst${categoryQuery ? `?category=${categoryQuery}` : ''}`);
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mt">
                                    <div className="flex flex-col gap-4 md:gap-3">
                                        <label className="text-[16px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                            Enter your PAN
                                        </label>
                                        <div className="ml-[-3px]">
                                            <input
                                                type="text"
                                                value={pan}
                                                onChange={(e) => setPan(e.target.value)}
                                                placeholder="ABCDE1234F"
                                                className="w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400 mt-3"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 md:gap-3 pl-0 md:pl-10">
                                        <label className="text-[16px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>
                                            Enter your PAN name / your company's name
                                        </label>
                                        <div className="ml-[-3px]">
                                            <input
                                                type="text"
                                                value={panName}
                                                onChange={(e) => setPanName(e.target.value)}
                                                placeholder="Velrona Technologies Pvt Ltd."
                                                className="w-full h-12 px-4 bg-transparent border border-[#AEAEAE] rounded-[14px] text-[15px] text-zinc-800 font-medium focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400 mt-3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Upload PAN Card */}
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
                            </div>

                            {/* Continue Button */}
                            <div className="pt-2 flex justify-center md:justify-start">
                                <button
                                    onClick={handleContinue}
                                    className="bg-black text-white w-full md:w-[124px] h-[48px] rounded-[15px] flex items-center justify-center gap-2 text-[15px] font-medium transition-all group active:scale-95"
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
                onClose={() => setIsAuthModalOpen(false)}
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
