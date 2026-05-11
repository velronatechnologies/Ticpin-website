'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIdentityStore } from '@/store/useIdentityStore';
import { profileApi, UserProfile } from '@/lib/api/profile';
import { useUpdateProfile } from '@/lib/hooks/useProfile';
import { 
    ChevronLeft, Save, User, Mail, Phone, MapPin, 
    Calendar, Camera, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface EditProfileClientProps {
    initialProfile: UserProfile;
    userSession: any;
}

export default function EditProfileClient({ initialProfile, userSession }: EditProfileClientProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [emailVerified, setEmailVerified] = useState(!!initialProfile.email);
    const [originalEmail] = useState(initialProfile.email || '');
    const [formData, setFormData] = useState<UserProfile>(initialProfile);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { loginUser } = useIdentityStore();
    const updateProfile = useUpdateProfile();

    const handleEmailChange = (newEmail: string) => {
        setFormData(prev => ({ ...prev, email: newEmail }));
        setEmailVerified(newEmail === originalEmail);
        if (newEmail !== originalEmail) setOtpSent(false);
    };

    const handleSendOTP = async () => {
        if (!formData.email) return;
        setVerifyingEmail(true);
        try {
            await fetch('/backend/api/user/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            setOtpSent(true);
            toast.success('OTP sent to your email');
        } catch (err) {
            toast.error('Failed to send OTP');
        } finally {
            setVerifyingEmail(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) return;
        setVerifyingEmail(true);
        try {
            const res = await fetch('/backend/api/user/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp })
            });
            if (res.ok) {
                setEmailVerified(true);
                setOtpSent(false);
                toast.success('Email verified successfully');
            } else {
                throw new Error('Invalid OTP');
            }
        } catch (err: any) {
            toast.error(err.message || 'OTP verification failed');
        } finally {
            setVerifyingEmail(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.email && !emailVerified) {
            toast.error('Please verify your email first');
            return;
        }

        setSaving(true);
        try {
            await updateProfile.mutateAsync({
                userId: userSession.id,
                data: formData
            });

            loginUser({
                ...userSession,
                name: formData.name,
                profilePhoto: formData.profilePhoto
            });

            toast.success('Profile updated successfully!');
            setTimeout(() => router.push('/profile'), 1500);
        } catch (err: any) {
            toast.error(err.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setSaving(true);
        try {
            const { url } = await profileApi.uploadPhoto(userSession.id, file);
            setFormData(prev => ({ ...prev, profilePhoto: url }));
            loginUser({ ...userSession, profilePhoto: url });
            toast.success('Photo uploaded successfully');
        } catch (err) {
            toast.error('Photo upload failed');
        } finally {
            setSaving(false);
        }
    };

    const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
        'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
        'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
        'Uttarakhand', 'West Bengal', 'Delhi'
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-[family-name:var(--font-anek-latin)] py-8 px-4 md:px-8 pb-24">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 transition-colors font-bold uppercase tracking-widest text-xs">
                        <ChevronLeft size={18} /> Back
                    </button>
                    <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Edit Profile</h1>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-zinc-200/50 border border-zinc-100 flex flex-col md:flex-row items-center gap-10">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full bg-zinc-50 border-8 border-[#F8F9FA] shadow-inner overflow-hidden flex items-center justify-center">
                                {formData.profilePhoto ? (
                                    <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={80} className="text-zinc-200" />
                                )}
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 bg-[#5331EA] text-white p-3 rounded-full border-4 border-white shadow-xl hover:scale-110 transition-transform active:scale-95">
                                <Camera size={20} />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                        </div>
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">{formData.name || 'Anonymous User'}</h2>
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Identity Profile // {userSession.id.slice(-8)}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-zinc-200/50 border border-zinc-100 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Full Name</label>
                                <input required value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full h-16 px-6 rounded-[24px] bg-zinc-50 border border-transparent focus:border-[#5331EA] focus:bg-white transition-all outline-none font-bold uppercase" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Secure Line (View Only)</label>
                                <div className="w-full h-16 px-6 rounded-[24px] bg-zinc-100/50 border border-zinc-100 flex items-center font-bold text-zinc-400 select-none">{formData.phone}</div>
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Contact Correspondence</label>
                                    {emailVerified && <span className="flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle2 size={10} /> Authenticated</span>}
                                </div>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <input type="email" value={formData.email} onChange={e => handleEmailChange(e.target.value)} className="flex-1 h-16 px-6 rounded-[24px] bg-zinc-50 border border-transparent focus:border-[#5331EA] focus:bg-white transition-all outline-none font-bold italic" />
                                    {formData.email && !emailVerified && !otpSent && (
                                        <button type="button" onClick={handleSendOTP} disabled={verifyingEmail} className="h-16 px-10 rounded-[24px] bg-[#5331EA] text-white font-black uppercase tracking-widest text-xs hover:bg-[#4529c9] shadow-lg shadow-[#5331EA]/20 transition-all active:scale-95">Verify</button>
                                    )}
                                </div>
                                {otpSent && (
                                    <div className="mt-4 p-8 bg-zinc-50 rounded-[32px] border-2 border-dashed border-[#5331EA]/30 animate-in zoom-in-95">
                                        <div className="flex flex-col md:flex-row items-center gap-4">
                                            <input maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} className="flex-1 h-14 bg-white px-6 text-center text-2xl tracking-[0.8em] font-black rounded-2xl border border-zinc-200 outline-none focus:border-[#5331EA]" placeholder="000000" />
                                            <button type="button" onClick={handleVerifyOTP} className="h-14 px-10 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95">Confirm</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-zinc-200/50 border border-zinc-100 space-y-8">
                         <div className="flex items-center gap-4 border-b border-zinc-50 pb-6">
                            <MapPin className="text-[#5331EA]" />
                            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Geographic Data</h3>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Region / State</label>
                                <select value={formData.state} onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))} className="w-full h-16 px-6 rounded-[24px] bg-zinc-50 border border-transparent focus:border-[#5331EA] focus:bg-white transition-all outline-none font-bold uppercase appearance-none cursor-pointer">
                                    <option value="">Matrix State</option>
                                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Urban Area / City</label>
                                <input value={formData.city} onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))} className="w-full h-16 px-6 rounded-[24px] bg-zinc-50 border border-transparent focus:border-[#5331EA] focus:bg-white transition-all outline-none font-bold uppercase" placeholder="Enter City" />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Detailed Correspondence Address</label>
                                <textarea rows={3} value={formData.address} onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))} className="w-full p-6 rounded-[32px] bg-zinc-50 border border-transparent focus:border-[#5331EA] focus:bg-white transition-all outline-none font-bold" />
                            </div>
                         </div>
                    </div>

                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-[100] animate-in slide-in-from-bottom-8 duration-500">
                        <div className="bg-zinc-950/90 backdrop-blur-2xl rounded-[32px] p-4 border border-white/5 shadow-2xl flex gap-4">
                            <button type="button" onClick={() => router.back()} className="h-16 px-10 rounded-[22px] bg-white/5 text-white/50 font-black uppercase tracking-widest text-xs hover:text-white transition-all">Cancel</button>
                            <button type="submit" disabled={saving} className="flex-1 h-16 rounded-[22px] bg-[#5331EA] text-white font-black uppercase tracking-[0.3em] text-sm shadow-xl shadow-[#5331EA]/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group">
                                {saving ? <div className="h-5 w-5 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <><Save size={20} className="group-hover:scale-110 transition-transform" /> Synchronize Identity</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
