'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, LogOut, X, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { saveOrganizerSession } from '@/lib/auth/organizer';
import { auth, googleProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from '@/lib/firebase';
import AuthPillSwitch from '@/components/shared/auth/AuthPillSwitch';
import AuthOTPInput from '@/components/shared/auth/AuthOTPInput';
import { authApi } from '@/lib/api/auth';

const ADMIN_PHONE = '6383667872';

export default function AdminLoginForm() {
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [view, setView] = useState<'input' | 'otp'>('input');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    const router = useRouter();
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

    const getRecaptchaVerifier = (): RecaptchaVerifier => {
        if (!auth) throw new Error('Firebase is not configured');
        if (recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current.clear();
            recaptchaVerifierRef.current = null;
        }
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-admin-container', { size: 'invisible' });
        recaptchaVerifierRef.current = verifier;
        return verifier;
    };

    const handleEmailLogin = async () => {
        if (!email) { setError('Email is required'); return; }
        setLoading(true); setError('');
        try {
            await authApi.login(email, 'admin');
            setView('otp');
        } catch (e: any) {
            setError(e.message);
        } finally { setLoading(false); }
    };

    const handleSendPhoneOtp = async () => {
        if (!phone) { setError('Phone number is required'); return; }
        if (phone.length !== 10) { setError('Please enter a valid 10-digit phone number'); return; }
        setLoading(true); setError('');
        try {
            await authApi.login(phone, 'admin');
            setView('otp');
        } catch (e: any) {
            setError(e.message);
        } finally { setLoading(false); }
    };

    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length !== 6) { setError('Enter 6 digits'); return; }
        setLoading(true); setError('');
        try {
            const identifier = loginMethod === 'email' ? email : phone;
            const data: any = await authApi.verifyOTP(identifier, code, 'admin');

            saveOrganizerSession({
                id: data.id || data._id,
                email: identifier,
                vertical: 'admin',
                isAdmin: true,
                categoryStatus: data.categoryStatus || {},
            });

            router.replace('/admin');
        } catch (e: any) {
            setError(e.message);
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#ECE8FD] flex items-center justify-center p-6 font-sans">
            <div id="recaptcha-admin-container"></div>
            <div className="w-full max-w-[500px] bg-white rounded-[40px] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <h1 className="text-[32px] font-bold text-black tracking-tight">Admin Portal</h1>
                    <p className="text-[#686868] font-medium italic">Secure access for Ticpin Administrators</p>
                    <div className="w-20 h-[2px] bg-zinc-200 mx-auto mt-4" />
                </div>

                {view === 'input' ? (
                    <div className="space-y-6">
                        <AuthPillSwitch 
                            value={loginMethod} 
                            onChange={(val) => { setLoginMethod(val); setError(''); }}
                            labels={{ email: 'Email Access', phone: 'Phone OTP' }}
                            className="mb-8"
                        />

                        {loginMethod === 'email' ? (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="admin@ticpin.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-14 px-5 bg-zinc-50 border border-zinc-200 rounded-[18px] text-zinc-900 focus:outline-none focus:border-black transition-all"
                                    />
                                </div>
                                <div className="flex justify-start">
                                    <button
                                        onClick={handleEmailLogin}
                                        disabled={loading}
                                        className="w-48 h-12 bg-black text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-black/5"
                                    >
                                        {loading ? 'Sending...' : 'Send OTP'}
                                        {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Mobile Number</label>
                                    <div className="flex gap-3">
                                        <div className="h-14 px-4 bg-zinc-50 border border-zinc-200 rounded-[18px] flex items-center gap-2 text-zinc-600 font-semibold">
                                            <span className="text-lg">+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="98765 43210"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="flex-1 h-14 px-5 bg-zinc-50 border border-zinc-200 rounded-[18px] text-zinc-900 focus:outline-none focus:border-black transition-all tracking-wider text-lg"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <button
                                        onClick={handleSendPhoneOtp}
                                        disabled={loading || phone.length !== 10}
                                        className="w-48 h-12 bg-black text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-black/5"
                                    >
                                        {loading ? 'Sending...' : 'Send OTP'}
                                        {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="space-y-8 py-4">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-black">Verification Required</h2>
                            <p className="text-sm text-[#686868] font-medium">
                                We've sent a 6-digit code to {loginMethod === 'email' ? email : `+91 ${phone}`}
                            </p>
                        </div>

                        <AuthOTPInput 
                            otp={otp} 
                            setOtp={setOtp} 
                            onComplete={handleVerifyOtp}
                            error={!!error}
                        />

                        <div className="space-y-4 pt-4">
                            <div className="flex justify-start">
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={loading || otp.join('').length !== 6}
                                    className="w-48 h-12 bg-black text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-black/5"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Enter'}
                                </button>
                            </div>
                        <button
                            onClick={() => { setView('input'); setError(''); setOtp(['', '', '', '', '', '']); }}
                            className="w-full text-zinc-500 font-semibold text-xs hover:text-black transition-colors text-center"
                        >
                            Cancel and return
                        </button>
                    </div>
                </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-red-600 text-xs font-bold text-center leading-relaxed">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
