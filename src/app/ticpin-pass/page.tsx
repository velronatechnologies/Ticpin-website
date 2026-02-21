'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/modals/AuthModal';
import Footer from '@/components/layout/Footer';
import BottomBanner from '@/components/layout/BottomBanner';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { authApi } from '@/lib/api';
import { checkDuplicatePass, getUserPass, getPassRemainingDays } from '@/lib/passUtils';
import { ChevronLeft, Edit3, Check, ShieldCheck, Zap, Gift, Utensils, BadgePercent, Trophy, ArrowRight, Ticket, Star } from 'lucide-react';

interface UserData {
    email: string; name: string; phone: string;
    address: string; state: string; district: string; country: string;
}

function TagIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.3637 0H9.46325C9.35576 0 9.2492.02 9.14969.061 9.05018.101 8.95968.161 8.88336.237L.479079 8.617C.327204 8.768.20672 8.948.124516 9.147.0423116 9.345 0 9.558 0 9.772c0 .215.0423116.427.124516.626.20672.198.327204.378.479079.53L5.06917 15.518c.3049.307.7191.48 1.15161.482.21555 0 .42900-.042.62805-.125.19905-.082.37976-.204.53172-.357L15.7603 7.106C15.9112 6.954 15.9963 6.748 15.9972 6.534V1.634C15.9972 1.2 15.8251.785 15.5188.478 15.2124.172 14.7969 0 14.3637 0Z" fill="white" />
        </svg>
    );
}

function FormField({ label, value, onChange, disabled, placeholder, error, help, type = 'text' }: {
    label: string; value: string; disabled?: boolean; placeholder?: string;
    error?: string; help?: string; type?: string; onChange?: (v: string) => void;
}) {
    return (
        <div>
            <label className="block text-[13px] font-semibold text-zinc-600 mb-1.5">{label}</label>
            <input type={type} value={value} placeholder={placeholder} disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className={`w-full px-4 py-3 border rounded-[12px] text-[14px] focus:outline-none transition-all
                    ${error ? 'border-red-400 bg-red-50' : 'border-zinc-200 focus:border-[#5331EA]'}
                    ${disabled ? 'bg-zinc-50 text-zinc-400 cursor-not-allowed' : 'bg-white text-black'}`}
            />
            {error && <p className="text-red-500 text-[12px] mt-1">{error}</p>}
            {help && !error && <p className="text-zinc-400 text-[12px] mt-1">{help}</p>}
        </div>
    );
}

export default function TicpinPassPage() {
    const router = useRouter();
    const { isLoggedIn, email: authEmail, phone: authPhone, token } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [currentStep, setCurrentStep] = useState<'benefits' | 'details' | 'payment' | 'email_verification' | 'confirmation' | 'active_pass'>('benefits');
    const [existingPass, setExistingPass] = useState<{ id: string; expiryDate: string; daysRemaining: number } | null>(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [verificationError, setVerificationError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [profileExists, setProfileExists] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState<UserData>({ email: '', name: '', phone: '', address: '', state: '', district: '', country: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [passDetails] = useState({
        purchaseDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        freeTurfBookings: 2, usedTurfBookings: 0,
        totalDiningVouchers: 2, usedDiningVouchers: 0,
        discountPercentage: 15
    });
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'confirmed'>('pending');

    useEffect(() => { const t = setTimeout(() => setIsHydrated(true), 500); return () => clearTimeout(t); }, []);
    useEffect(() => { if (isHydrated && !isLoggedIn) setIsAuthModalOpen(true); }, [isHydrated, isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn || (!authPhone && !authEmail)) return;
        const init = async () => {
            const pass = await getUserPass(authEmail || undefined, authPhone || undefined);
            if (pass && pass.status === 'active') {
                setExistingPass({ id: pass.id, expiryDate: pass.expiryDate, daysRemaining: getPassRemainingDays(pass.expiryDate) });
                setCurrentStep('active_pass');
                return;
            }
            fetchUserProfile();
        };
        init();
    }, [isLoggedIn, authPhone, authEmail]);

    const fetchUserProfile = async () => {
        setIsProfileLoading(true);
        try {
            const phone = authPhone || '';
            const profileRes = await authApi.getProfile();
            if (profileRes.success && profileRes.data) {
                const p = profileRes.data;
                setUserData({ name: p.name || '', email: p.email || authEmail || '', phone: p.phone || phone, address: p.address || '', state: p.state || '', district: p.district || '', country: p.country || '' });
                if (p.name || p.email || p.address) { setProfileExists(true); setIsEditing(false); }
            } else {
                setUserData(prev => ({ ...prev, phone, email: authEmail || '' }));
            }
            const lookupField = authEmail || phone;
            if (lookupField) {
                const field = authEmail ? 'email' : 'phone';
                const q = query(collection(db, 'ticpin_pass_users'), where(field, '==', lookupField));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const d = snapshot.docs[0].data();
                    setUserData(prev => ({
                        name: prev.name || d.name || '', email: prev.email || d.email || '',
                        phone: prev.phone || d.phone || '', address: prev.address || d.address || '',
                        state: prev.state || d.state || '', district: prev.district || d.district || '',
                        country: prev.country || d.country || '',
                    }));
                    setProfileExists(true); setIsEditing(false);
                }
            }
        } catch (e) {
            console.error('Error fetching profile:', e);
            setUserData(prev => ({ ...prev, phone: authPhone || '', email: authEmail || '' }));
        } finally {
            setIsProfileLoading(false);
            if (!profileExists) setIsEditing(true);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!userData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(userData.email)) newErrors.email = 'Please enter a valid email address';
        if (!userData.name.trim()) newErrors.name = 'Full name is required';
        if (!userData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (userData.phone.length < 10) newErrors.phone = 'Enter a valid 10-digit phone';
        if (!userData.address.trim()) newErrors.address = 'Street address is required';
        if (!userData.state.trim()) newErrors.state = 'State is required';
        if (!userData.district.trim()) newErrors.district = 'District is required';
        if (!userData.country.trim()) newErrors.country = 'Country is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBuyPass = async () => {
        if (!validateForm()) return;
        setIsLoading(true); setPaymentStatus('processing');
        try {
            const dup = await checkDuplicatePass(userData.email, userData.phone);
            if (dup.hasDuplicate) { alert(dup.message || 'You already have an active Ticpin Pass!'); setPaymentStatus('pending'); setIsLoading(false); return; }
            await new Promise(r => setTimeout(r, 2000));
            const otpRes = await authApi.sendEmailOtp(userData.email);
            if (!otpRes.success) { alert(otpRes.message || 'Failed to send verification code. Please try again.'); setPaymentStatus('pending'); setIsLoading(false); return; }
            setPaymentStatus('confirmed');
            setTimeout(() => setCurrentStep('email_verification'), 1000);
        } catch (e) { console.error(e); alert('Failed to purchase pass. Please try again.'); setPaymentStatus('pending'); }
        finally { setIsLoading(false); }
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) { setVerificationError('Please enter the 6-digit code'); return; }
        setIsLoading(true); setVerificationError('');
        try {
            const verifyRes = await authApi.verifyEmail(userData.email, otpCode);
            if (!verifyRes.success) { setVerificationError(verifyRes.message || 'Invalid verification code'); setIsLoading(false); return; }
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';
            const activateRes = await fetch(`${apiUrl}/api/v1/pass/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: userData.name, email: userData.email || authEmail, phone: userData.phone || authPhone,
                    address: userData.address, state: userData.state, district: userData.district, country: userData.country,
                    planName: 'Quarterly Pass', purchaseDate: passDetails.purchaseDate, expiryDate: passDetails.expiryDate,
                    amount: 849, paymentMethod: 'mock_upi',
                }),
            });
            const activateData = await activateRes.json();
            if (!activateRes.ok || !activateData.success) { setVerificationError(activateData.message || 'Failed to activate pass.'); setIsLoading(false); return; }
            const passId = activateData.data?.passId as string;
            if (isLoggedIn) authApi.updateProfile({ name: userData.name, email: userData.email, phone: userData.phone, address: userData.address, state: userData.state, district: userData.district, country: userData.country }).catch(() => {});
            if (userData.email) {
                fetch(`${apiUrl}/api/v1/emails/pass-purchase`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userData.email, name: userData.name, purchaseDate: passDetails.purchaseDate, expiryDate: passDetails.expiryDate, passId, amount: 849 })
                }).catch(() => {});
            }
            setCurrentStep('confirmation');
        } catch (e) { console.error(e); setVerificationError('An error occurred. Please try again.'); }
        finally { setIsLoading(false); }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const n = [...otp]; n[index] = value.slice(-1); setOtp(n);
        if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    };
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
    };
    const handleInputChange = (field: keyof UserData, value: string) => {
        setUserData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    if (!isHydrated) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#5331EA] mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">Loading Ticpin Pass…</p>
            </div>
        </div>
    );

    if (!isLoggedIn) return (
        <>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => { setIsAuthModalOpen(false); router.push('/profile'); }} onAuthSuccess={() => setIsAuthModalOpen(false)} />
            <Footer />
        </>
    );

    const benefits = [
        { icon: <Trophy size={44} strokeWidth={1.3} className="text-white" />, bg: 'linear-gradient(135deg,#866BFF 0%,#5331EA 100%)', tag: '2 free bookings / quarter', title: 'Free Turf Slots', desc: 'Book any play or court slot at zero cost — 2 free sessions every 3 months.' },
        { icon: <Utensils size={44} strokeWidth={1.3} className="text-white" />, bg: 'linear-gradient(135deg,#F97316 0%,#c2410c 100%)', tag: '₹250 each · 2 vouchers', title: 'Dining Vouchers', desc: 'Redeem at any Ticpin dining partner. Valid for the full 3-month period.' },
        { icon: <BadgePercent size={44} strokeWidth={1.3} className="text-white" />, bg: 'linear-gradient(135deg,#06B6D4 0%,#0e7490 100%)', tag: '15% off all bookings', title: 'Exclusive Discount', desc: 'Automatic 15% savings on every event, dining, and play booking.' },
    ];

    const GradientStrip = ({ label }: { label: string }) => (
        <div className="h-[32px] flex items-center px-4 gap-2 flex-shrink-0" style={{ background: 'linear-gradient(90deg,#866BFF,#BDB1F3)' }}>
            <TagIcon /><span className="text-white text-[12px] font-medium tracking-tight truncate">{label}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-anek-latin)' }}>
            <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-10">

                {/* Back */}
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[#5331EA] hover:opacity-70 font-semibold mb-8 transition-opacity text-[15px]">
                    <ChevronLeft size={18} /> Back
                </button>

                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-1">
                        <Ticket size={26} className="text-[#5331EA]" />
                        <h1 className="text-[38px] md:text-[50px] font-black text-black tracking-tight leading-none">
                            TICPIN <span className="text-[#5331EA]">PASS</span>
                        </h1>
                    </div>
                    <p className="text-[15px] text-zinc-400 ml-[44px]">3 months · more play · more perks · ₹849</p>
                </div>

                {/* ─── active_pass ─── */}
                {currentStep === 'active_pass' && existingPass && (
                    <div className="max-w-[460px]">
                        <div className="group overflow-hidden rounded-[20px] border border-[#686868] bg-white flex flex-col">
                            <div className="h-[180px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#866BFF 0%,#5331EA 100%)' }}>
                                <ShieldCheck size={68} className="text-white" strokeWidth={1.2} />
                            </div>
                            <GradientStrip label={`Active · ${existingPass.daysRemaining} days remaining`} />
                            <div className="p-6 space-y-4">
                                <div>
                                    <h2 className="text-[22px] font-black text-black">You already have a Ticpin Pass</h2>
                                    <p className="text-zinc-500 text-[14px] mt-1">All benefits are active and ready to use.</p>
                                </div>
                                <div className="space-y-2.5 rounded-[14px] p-4 bg-zinc-50 border border-zinc-100">
                                    {[
                                        { l: 'Status', v: <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Active ✓</span> },
                                        { l: 'Valid Until', v: <span className="font-semibold text-black">{new Date(existingPass.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span> },
                                        { l: 'Days Remaining', v: <span className="font-bold text-[#5331EA]">{existingPass.daysRemaining} days</span> },
                                    ].map((r, i) => (
                                        <div key={i} className="flex justify-between items-center text-[14px]">
                                            <span className="text-zinc-500">{r.l}</span>{r.v}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-zinc-400 text-[12px]">You can renew after <strong className="text-zinc-600">{new Date(existingPass.expiryDate).toLocaleDateString('en-IN')}</strong>.</p>
                                <button onClick={() => router.push('/pass-dashboard')}
                                    className="w-full py-3.5 rounded-[14px] text-white font-bold text-[15px] hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
                                    style={{ background: 'linear-gradient(90deg,#866BFF,#5331EA)' }}>
                                    View Dashboard <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── benefits ─── */}
                {currentStep === 'benefits' && (
                    <div className="space-y-8">
                        {/* Benefit cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {benefits.map((b, i) => (
                                <div key={i} className="group overflow-hidden rounded-[20px] border border-[#686868] bg-white flex flex-col">
                                    <div className="h-[172px] flex items-center justify-center" style={{ background: b.bg }}>
                                        {b.icon}
                                    </div>
                                    <GradientStrip label={b.tag} />
                                    <div className="p-5 flex-1">
                                        <h3 className="text-[20px] font-black text-black mb-1">{b.title}</h3>
                                        <p className="text-[13px] text-zinc-500 leading-relaxed">{b.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pricing card */}
                        <div className="rounded-[20px] border border-[#686868] bg-white overflow-hidden">
                            <div className="h-[6px]" style={{ background: 'linear-gradient(90deg,#866BFF,#BDB1F3)' }} />
                            <div className="p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Quarterly Pass</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-[42px] font-black text-black">₹849</span>
                                        <span className="text-[18px] text-zinc-400 line-through">₹999</span>
                                        <span className="bg-green-100 text-green-700 text-[12px] font-black px-2.5 py-1 rounded-full">15% OFF</span>
                                    </div>
                                    <p className="text-[13px] text-zinc-500">Valid for 3 months · Renew anytime</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center md:w-auto w-full">
                                    {[{ v: '2', l: 'Free Slots' }, { v: '2', l: 'Vouchers' }, { v: '15%', l: 'Discount' }].map((s, i) => (
                                        <div key={i} className="bg-zinc-50 rounded-[12px] px-3 py-3 border border-zinc-100">
                                            <p className="text-[20px] font-black text-[#5331EA]">{s.v}</p>
                                            <p className="text-[11px] text-zinc-500 font-medium">{s.l}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="px-7 pb-7">
                                <button onClick={() => { if (!isLoggedIn) { setIsAuthModalOpen(true); return; } setCurrentStep('details'); }}
                                    className="w-full py-4 rounded-[14px] text-white text-[16px] font-black tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                    style={{ background: 'linear-gradient(90deg,#866BFF,#5331EA)' }}>
                                    Get Ticpin Pass <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Perks strip */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { icon: <Zap size={15} />, text: 'Instant activation after email verify' },
                                { icon: <Star size={15} />, text: 'Benefits refresh every 3 months' },
                                { icon: <Gift size={15} />, text: 'Renew anytime for continuous perks' },
                            ].map((p, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-[14px] bg-zinc-50 border border-zinc-100">
                                    <span className="text-[#5331EA] flex-shrink-0">{p.icon}</span>
                                    <p className="text-[13px] text-zinc-600 font-medium">{p.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── details ─── */}
                {currentStep === 'details' && (
                    <div className="max-w-[620px] space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[26px] font-black text-black">Your Details</h2>
                            <span className="text-[13px] text-zinc-400 border border-zinc-200 rounded-full px-3 py-1">Step 1 of 2</span>
                        </div>

                        {isProfileLoading ? (
                            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#5331EA]" /></div>
                        ) : (
                            <>
                                {profileExists && !isEditing && (
                                    <div className="flex items-center justify-between p-4 rounded-[14px] bg-green-50 border border-green-200">
                                        <div className="flex items-center gap-2"><Check size={15} className="text-green-600" /><p className="text-green-700 font-semibold text-[14px]">Pre-filled from your profile</p></div>
                                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-[13px] text-green-700 font-bold hover:opacity-70"><Edit3 size={13} /> Edit</button>
                                    </div>
                                )}

                                <div className="overflow-hidden rounded-[20px] border border-[#686868] bg-white">
                                    <GradientStrip label="Personal Information" />
                                    <div className="p-6 space-y-4">
                                        <FormField label="Phone Number" value={userData.phone} disabled help="Logged in with this number" />
                                        <FormField label="Email *" value={userData.email} disabled={!isEditing && profileExists} placeholder="your@email.com" error={errors.email} onChange={(v) => handleInputChange('email', v)} type="email" />
                                        <FormField label="Full Name *" value={userData.name} disabled={!isEditing && profileExists} placeholder="As per ID proof" error={errors.name} onChange={(v) => handleInputChange('name', v)} />
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-[20px] border border-[#686868] bg-white">
                                    <GradientStrip label="Billing Address" />
                                    <div className="p-6 space-y-4">
                                        <FormField label="Street Address *" value={userData.address} disabled={!isEditing && profileExists} placeholder="House / Flat, Street" error={errors.address} onChange={(v) => handleInputChange('address', v)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="District *" value={userData.district} disabled={!isEditing && profileExists} placeholder="District" error={errors.district} onChange={(v) => handleInputChange('district', v)} />
                                            <FormField label="State *" value={userData.state} disabled={!isEditing && profileExists} placeholder="State" error={errors.state} onChange={(v) => handleInputChange('state', v)} />
                                        </div>
                                        <FormField label="Country *" value={userData.country} disabled={!isEditing && profileExists} placeholder="India" error={errors.country} onChange={(v) => handleInputChange('country', v)} />
                                    </div>
                                </div>

                                {/* Mini price */}
                                <div className="flex items-center justify-between px-5 py-4 rounded-[14px] border border-zinc-200 bg-zinc-50">
                                    <div className="flex items-center gap-3 text-[14px] text-zinc-500">
                                        <span className="line-through">₹999</span>
                                        <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full">15% OFF</span>
                                    </div>
                                    <span className="text-[24px] font-black text-[#5331EA]">₹849</span>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setCurrentStep('benefits')} className="flex-1 py-4 rounded-[14px] border-2 border-zinc-200 text-zinc-700 font-bold text-[15px] hover:bg-zinc-50 transition-colors">Back</button>
                                    <button onClick={() => { if (validateForm()) setCurrentStep('payment'); }}
                                        className="flex-1 py-4 rounded-[14px] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                        style={{ background: 'linear-gradient(90deg,#866BFF,#5331EA)' }}>
                                        Review & Pay <ArrowRight size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ─── payment ─── */}
                {currentStep === 'payment' && (
                    <div className="max-w-[540px] space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[26px] font-black text-black">Confirm & Pay</h2>
                            <span className="text-[13px] text-zinc-400 border border-zinc-200 rounded-full px-3 py-1">Step 2 of 2</span>
                        </div>

                        {paymentStatus === 'pending' && (
                            <>
                                <div className="overflow-hidden rounded-[20px] border border-[#686868] bg-white">
                                    <GradientStrip label="Order Summary" />
                                    <div className="p-5 space-y-3">
                                        <div className="flex justify-between text-[14px]"><span className="text-zinc-500">Ticpin Pass (3 months)</span><span className="font-semibold">₹999</span></div>
                                        <div className="flex justify-between text-[14px]"><span className="text-zinc-500">Early Bird Discount (15%)</span><span className="font-semibold text-green-600">−₹150</span></div>
                                        <div className="border-t border-zinc-100 pt-3 flex justify-between"><span className="font-bold text-[16px]">Total</span><span className="font-black text-[24px] text-[#5331EA]">₹849</span></div>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-[20px] border border-[#686868] bg-white">
                                    <GradientStrip label="Your Details" />
                                    <div className="p-5 grid grid-cols-2 gap-4">
                                        {[{ l: 'Name', v: userData.name }, { l: 'Email', v: userData.email }, { l: 'Phone', v: `+91 ${userData.phone}` }, { l: 'Location', v: `${userData.district}, ${userData.state}` }].map((r, i) => (
                                            <div key={i}><p className="text-[11px] text-zinc-400 uppercase tracking-wide">{r.l}</p><p className="text-[14px] font-semibold text-black truncate">{r.v}</p></div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-[14px] border border-zinc-200 bg-zinc-50">
                                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg,#866BFF,#5331EA)' }}>📱</div>
                                    <div><p className="font-semibold text-[14px] text-black">UPI Payment</p><p className="text-[12px] text-zinc-400">Mock demo transaction</p></div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setCurrentStep('details')} className="flex-1 py-4 rounded-[14px] border-2 border-zinc-200 text-zinc-700 font-bold text-[15px] hover:bg-zinc-50 transition-colors">Edit Details</button>
                                    <button onClick={handleBuyPass} disabled={isLoading}
                                        className="flex-1 py-4 rounded-[14px] text-white font-bold text-[15px] disabled:opacity-50 hover:opacity-90 transition-opacity"
                                        style={{ background: 'linear-gradient(90deg,#866BFF,#5331EA)' }}>
                                        {isLoading ? 'Processing…' : 'Confirm & Pay ₹849'}
                                    </button>
                                </div>
                            </>
                        )}

                        {paymentStatus === 'processing' && (
                            <div className="flex flex-col items-center gap-5 py-16">
                                <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-[#5331EA]" />
                                <p className="text-[18px] font-bold text-black">Processing your payment…</p>
                                <p className="text-zinc-400 text-[14px]">Please wait while we confirm your transaction</p>
                            </div>
                        )}

                        {paymentStatus === 'confirmed' && (
                            <div className="flex flex-col items-center gap-4 py-12">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"><Check size={32} className="text-green-600" /></div>
                                <p className="text-[20px] font-black text-green-600">Payment Confirmed!</p>
                                <p className="text-zinc-400 text-[14px]">Sending email verification code…</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── email_verification ─── */}
                {currentStep === 'email_verification' && (
                    <div className="max-w-[420px]">
                        <div className="overflow-hidden rounded-[20px] border border-[#686868] bg-white">
                            <div className="h-[150px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#866BFF 0%,#5331EA 100%)' }}>
                                <div className="text-center text-white"><Check size={46} strokeWidth={2.5} className="mx-auto mb-1" /><p className="text-[13px] font-semibold opacity-80">One last step</p></div>
                            </div>
                            <GradientStrip label="Email Verification" />
                            <div className="p-6 space-y-5">
                                <div>
                                    <h2 className="text-[22px] font-black text-black">Verify Your Email</h2>
                                    <p className="text-zinc-500 text-[14px] mt-1">6-digit code sent to <span className="font-semibold text-black">{userData.email}</span></p>
                                </div>
                                <div className="flex justify-between gap-2">
                                    {otp.map((digit, i) => (
                                        <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className="w-11 h-14 border-2 border-zinc-200 rounded-[12px] text-center text-[20px] font-black focus:border-[#5331EA] focus:outline-none transition-all" />
                                    ))}
                                </div>
                                {verificationError && <p className="text-red-500 text-[13px] font-medium">{verificationError}</p>}
                                <button onClick={handleVerifyOtp} disabled={isLoading || otp.join('').length !== 6}
                                    className="w-full py-4 rounded-[14px] text-white font-bold text-[15px] disabled:opacity-40 hover:opacity-90 transition-opacity"
                                    style={{ background: 'linear-gradient(90deg,#866BFF,#5331EA)' }}>
                                    {isLoading ? 'Activating…' : 'Activate My Pass'}
                                </button>
                                <p className="text-center text-[13px] text-zinc-400">
                                    Didn&apos;t receive?{' '}
                                    <button onClick={() => authApi.sendEmailOtp(userData.email)} className="text-[#5331EA] font-bold hover:underline">Resend Code</button>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── confirmation ─── */}
                {currentStep === 'confirmation' && (
                    <div className="max-w-[520px] space-y-5">
                        <div className="overflow-hidden rounded-[20px] border border-[#686868] bg-white">
                            <div className="h-[190px] flex flex-col items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#866BFF 0%,#5331EA 100%)' }}>
                                <Ticket size={50} className="text-white" strokeWidth={1.4} />
                                <div className="text-center text-white">
                                    <p className="text-[11px] font-semibold opacity-60 uppercase tracking-widest">Purchase Successful</p>
                                    <p className="text-[26px] font-black">TICPIN PASS</p>
                                </div>
                            </div>
                            <GradientStrip label="Active · 3 months validity" />
                            <div className="p-6 space-y-3">
                                {[
                                    { l: 'Valid Until', v: new Date(passDetails.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
                                    { l: 'Free Turf Bookings', v: `${passDetails.freeTurfBookings} remaining` },
                                    { l: 'Dining Vouchers', v: `${passDetails.totalDiningVouchers} × ₹250` },
                                    { l: 'Discount', v: `${passDetails.discountPercentage}% on all bookings` },
                                ].map((r, i) => (
                                    <div key={i} className={`flex justify-between text-[14px] pb-2.5 ${i < 3 ? 'border-b border-zinc-50' : ''}`}>
                                        <span className="text-zinc-500">{r.l}</span>
                                        <span className="font-semibold text-black">{r.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button onClick={() => router.push('/pass-dashboard')}
                                className="py-4 rounded-[14px] text-white font-bold text-[14px] hover:opacity-90 transition-opacity"
                                style={{ background: 'linear-gradient(90deg,#866BFF,#5331EA)' }}>
                                View Dashboard
                            </button>
                            <button onClick={() => router.push('/play')} className="py-4 rounded-[14px] bg-black text-white font-bold text-[14px] hover:bg-zinc-800 transition-colors">Book Free Turf</button>
                            <button onClick={() => router.push('/')} className="py-4 rounded-[14px] border-2 border-zinc-200 text-zinc-700 font-bold text-[14px] hover:bg-zinc-50 transition-colors">Go Home</button>
                        </div>
                    </div>
                )}

            </div>
            <BottomBanner />
            <Footer />
        </div>
    );
}
