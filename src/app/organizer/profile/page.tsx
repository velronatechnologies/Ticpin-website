'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { getOrganizerSession, updateSessionEmail } from '@/lib/auth/organizer';
import { organizerApi, OrganizerProfile } from '@/lib/api/organizer';
import { Camera, Save, ArrowLeft, ChevronDown, Check, Loader2, X } from 'lucide-react';
import OrganizerHeader from '@/components/organizer/OrganizerHeader';

function ProfileContent() {
    const router = useRouter();
    const [session, setSession] = useState<ReturnType<typeof getOrganizerSession>>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<OrganizerProfile | null>(null);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        brandName: '',
        pan: '',
        description: ''
    });

    // Email Change State
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailChangeStep, setEmailChangeStep] = useState<'request' | 'verify'>('request');
    const [tempEmail, setTempEmail] = useState('');
    const [emailOTP, setEmailOTP] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        const s = getOrganizerSession();
        setSession(s);
        if (!s) {
            router.replace('/');
            return;
        }

        const fetchProfile = async () => {
            try {
                const data = await organizerApi.getProfile(s.id);
                if (data) {
                    setProfile(data);
                    setFormData({
                        name: data.name || '',
                        email: data.email || s.email,
                        brandName: data.name || '', // Use name as brand name for now
                        pan: '', // Backend might not return PAN in profile
                        description: data.address || '' // Use address as description for now
                    });
                    setPreviewPhoto(data.profilePhoto || null);
                    setUploadedPhotoUrl(data.profilePhoto || null);
                }
            } catch (err) {
                import('@/lib/auth/organizer').then(({ clearOrganizerSession }) => {
                    clearOrganizerSession();
                    router.replace('/list-your-dining/Login');
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    // Check if organizer is verified for play
    const isPlayVerified = session?.categoryStatus?.play === 'approved';

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Local preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload immediately
        try {
            setSaving(true);
            const url = await organizerApi.uploadProfilePhoto(file);
            setUploadedPhotoUrl(url); // Store the actual Cloudinary URL
            setPreviewPhoto(url); // Also update preview just in case
            // Also update the profile object locally to ensure consistency
            if (profile) {
                setProfile({ ...profile, profilePhoto: url });
            }
            window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { detail: url }));
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!session || !profile) return;
        setSaving(true);
        setSaveError('');
        try {
            // Make sure we have the latest profile data
            const updatedProfile = {
                ...profile,
                name: formData.brandName || formData.name,
                profilePhoto: uploadedPhotoUrl || profile.profilePhoto,
                address: formData.description
            };

            await organizerApi.updateProfile(session.id, updatedProfile);

            // Sync with navbar immediately
            if (previewPhoto) {
                window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { detail: previewPhoto }));
            }

            setIsEditing(false);
            router.refresh();
        } catch (err: any) {
            console.error("Save failed", err);
            setSaveError(err.message || 'Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleRequestEmailChange = async () => {
        if (!tempEmail || !tempEmail.includes('@')) {
            setEmailError('Please enter a valid email');
            return;
        }
        setEmailLoading(true);
        setEmailError('');
        try {
            await organizerApi.requestEmailChange();
            setEmailChangeStep('verify');
        } catch (err: any) {
            setEmailError(err.message || 'Failed to send OTP');
        } finally {
            setEmailLoading(false);
        }
    };

    const handleVerifyEmailChange = async () => {
        if (!emailOTP || emailOTP.length < 6) {
            setEmailError('Please enter 6-digit OTP');
            return;
        }
        setEmailLoading(true);
        setEmailError('');
        try {
            await organizerApi.verifyEmailChange(tempEmail, emailOTP);
            updateSessionEmail(tempEmail);
            setFormData(prev => ({ ...prev, email: tempEmail }));
            setIsEmailModalOpen(false);
            setEmailChangeStep('request');
            setTempEmail('');
            setEmailOTP('');
            // Success
            alert('Email updated successfully');
            router.refresh();
        } catch (err: any) {
            setEmailError(err.message || 'Verification failed');
        } finally {
            setEmailLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <Loader2 className="animate-spin text-[#5331EA]" size={40} />
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)] pb-32 ${isPlayVerified ? 'bg-gradient-to-b from-[#FFFCED] via-white' : 'bg-[#5331EA]/5'}`}>
            <OrganizerHeader activeTab="play" />

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-8 md:px-14 lg:px-20 py-10 space-y-12">
                {/* Title Section */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-[40px] font-medium text-black leading-tight">Settings</h1>
                        <p className="text-[30px] font-medium text-[#686868]">Manage your brand settings here</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-8 py-3 bg-black text-white rounded-xl font-bold text-lg hover:bg-zinc-800 transition-all active:scale-95 shadow-lg"
                        >
                            Edit
                        </button>
                    )}
                </div>

                <div className="w-full h-[1px] bg-[#AEAEAE]" />

                {/* Login Details Card */}
                <div className="bg-white rounded-[15px] p-8 space-y-8 shadow-sm">
                    <h2 className="text-[28px] font-medium text-black flex items-center gap-1">
                        Login details<span className="text-red-500">*</span>
                    </h2>

                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                        <label className="text-[23px] font-medium text-black w-48">User email:</label>
                        <div className="flex-1 max-w-[933px] flex items-center gap-4">
                            <div className="flex-1 h-[59px] bg-[#E1E1E1] border border-[#686868] rounded-[8px] flex items-center px-6">
                                <span className="text-[23px] font-medium text-black">{formData.email}</span>
                            </div>
                            {isEditing && (
                                <button
                                    onClick={() => setIsEmailModalOpen(true)}
                                    className="px-6 h-[59px] bg-black text-white rounded-[8px] font-bold text-lg hover:bg-zinc-800 transition-all active:scale-95"
                                >
                                    Change
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Brand Details Card */}
                <div className="bg-white rounded-[15px] p-8 space-y-10 shadow-sm">
                    <div className="space-y-4">
                        <h2 className="text-[28px] font-medium text-black flex items-center gap-1">
                            Brand details<span className="text-red-500">*</span>
                        </h2>
                        <p className="text-[23px] font-medium text-[#686868]">Add brand details to display across your hosted events.</p>
                    </div>

                    <div className="w-full h-[1px] bg-[#AEAEAE]" />

                    <div className="space-y-8">
                        <p className="text-[23px] font-medium text-[#686868]">Select your brand from the dropdown below and add their profile details.</p>

                        <div className="flex flex-col md:flex-row md:items-center gap-8">
                            <label className="text-[23px] font-medium text-black w-48">Select your brand:</label>
                            <div className="flex-1 max-w-[933px] h-[59px] bg-[#E1E1E1] border border-[#686868] rounded-[8px] flex items-center justify-between px-6 cursor-pointer">
                                <span className="text-[23px] font-medium text-black">{formData.brandName || '{BRAND NAME}'}</span>
                                <ChevronDown className="text-[#686868]" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-[#AEAEAE]" />

                    {/* Brand Info & Photo */}
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <h3 className="text-[28px] font-medium text-black uppercase">{formData.brandName || '{CHOOSED BRAND NAME}'}</h3>
                            {/* <p className="text-[23px] font-medium text-[#686868] uppercase">{formData.pan || '{CHOOSED BRAND PAN}'}</p> */}
                        </div>

                        <div className="flex flex-col md:flex-row gap-12">
                            {/* Photo Upload */}
                            <div className="flex flex-col items-center gap-4 w-[195px]">
                                <div
                                    className={`w-[157px] h-[157px] rounded-full border-[3px] border-[#E7C200] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group bg-white ${!isEditing ? 'pointer-events-none' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {previewPhoto ? (
                                        <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" stroke="#E7C200" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span className="text-[23px] font-semibold text-[#E7C200]">Upload</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="text-white" size={32} />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                    />
                                </div>
                                <p className="text-[15px] font-medium text-[#686868] text-center">This photo is displayed on your Organiser page.</p>
                            </div>

                            {/* Description Input */}
                            <div className="flex-1 max-w-[933px]">
                                <textarea
                                    className={`w-full h-[206px] border border-[#686868] rounded-[8px] p-6 text-[20px] outline-none focus:ring-1 focus:ring-black ${!isEditing ? 'bg-[#F5F5F5] text-[#686868]' : 'bg-white'}`}
                                    placeholder="Tell people about your brand..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    readOnly={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-[#AEAEAE]" />
                </div>
            </main>

            {/* Save Button Footer */}
            {isEditing && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center px-8 z-50 animate-in slide-in-from-bottom duration-300">
                    {saveError && (
                        <div className="w-full max-w-[1374px] p-4 bg-red-50 text-red-600 rounded-t-xl text-center text-sm font-medium border-b border-red-100">
                            {saveError}
                        </div>
                    )}
                    <div className="w-full max-w-[1374px] h-[100px] flex gap-4">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setSaveError('');
                            }}
                            className="flex-1 h-[64px] bg-zinc-200 text-black rounded-[15px] text-[25px] font-semibold flex items-center justify-center transition-all active:scale-[0.98] hover:bg-zinc-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-[2] h-[64px] bg-black text-white rounded-[15px] text-[25px] font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:bg-zinc-900 disabled:opacity-50 shadow-xl"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
            {/* Email Change Modal */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[30px] p-10 w-full max-w-[500px] space-y-8 relative shadow-2xl">
                        <button
                            onClick={() => setIsEmailModalOpen(false)}
                            className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-black">Change Email</h3>
                            <p className="text-zinc-500">
                                {emailChangeStep === 'request'
                                    ? 'Enter your new email address. We will send an OTP to your current email to authorize this change.'
                                    : `Enter the OTP sent to your current email address to verify the change to ${tempEmail}`}
                            </p>
                        </div>

                        {emailError && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm font-medium border border-red-100">
                                {emailError}
                            </div>
                        )}

                        {emailChangeStep === 'request' ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-black uppercase tracking-wider">New Email</label>
                                    <input
                                        type="email"
                                        value={tempEmail}
                                        onChange={(e) => setTempEmail(e.target.value)}
                                        placeholder="Enter new email address"
                                        className="w-full h-[60px] px-6 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 ring-black/5 outline-none font-medium"
                                    />
                                </div>
                                <button
                                    onClick={handleRequestEmailChange}
                                    disabled={emailLoading}
                                    className="w-full h-[60px] bg-black text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {emailLoading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-black uppercase tracking-wider">Verification OTP</label>
                                    <input
                                        type="text"
                                        value={emailOTP}
                                        onChange={(e) => setEmailOTP(e.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                        className="w-full h-[60px] px-6 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 ring-black/5 outline-none font-bold text-center tracking-[0.5em] text-xl"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setEmailChangeStep('request')}
                                        className="flex-1 h-[60px] bg-zinc-100 text-black rounded-xl font-bold hover:bg-zinc-200 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleVerifyEmailChange}
                                        disabled={emailLoading}
                                        className="flex-[2] h-[60px] bg-black text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {emailLoading ? <Loader2 className="animate-spin" /> : 'Verify & Change'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrganizerProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#5331EA]" /></div>}>
            <ProfileContent />
        </Suspense>
    );
}
