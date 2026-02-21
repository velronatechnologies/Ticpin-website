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
import { ChevronLeft, Edit3, Check, ShieldCheck } from 'lucide-react';

interface UserData {
    email: string;
    name: string;
    phone: string;
    address: string;
    state: string;
    district: string;
    country: string;
}

export default function TicpinPassPage() {
    const router = useRouter();
    const { isLoggedIn, email: authEmail, phone: authPhone, token, userId } = useAuth();
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
    const [userData, setUserData] = useState<UserData>({
        email: '',
        name: '',
        phone: '',
        address: '',
        state: '',
        district: '',
        country: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [passDetails, setPassDetails] = useState({
        purchaseDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        freeTurfBookings: 2,
        usedTurfBookings: 0,
        totalDiningVouchers: 2,
        usedDiningVouchers: 0,
        discountPercentage: 15
    });
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'confirmed'>('pending');

    // Wait for auth state to hydrate from localStorage
    useEffect(() => {
        const timer = setTimeout(() => setIsHydrated(true), 500);
        return () => clearTimeout(timer);
    }, []);

    // Show auth modal only after hydration confirms user is not logged in
    useEffect(() => {
        if (isHydrated && !isLoggedIn) {
            setIsAuthModalOpen(true);
        }
    }, [isHydrated, isLoggedIn]);

    // Check for existing active pass AND fetch profile when logged in
    useEffect(() => {
        if (!isLoggedIn || (!authPhone && !authEmail)) return;

        const init = async () => {
            // 1. Check if user already has an active pass (by email OR phone)
            const pass = await getUserPass(authEmail || undefined, authPhone || undefined);
            if (pass && pass.status === 'active') {
                setExistingPass({
                    id: pass.id,
                    expiryDate: pass.expiryDate,
                    daysRemaining: getPassRemainingDays(pass.expiryDate),
                });
                setCurrentStep('active_pass');
                return; // Don't load purchase flow
            }
            // 2. No active pass — load profile for purchase form
            fetchUserProfile();
        };
        init();
    }, [isLoggedIn, authPhone, authEmail]);

    const fetchUserProfile = async () => {
        setIsProfileLoading(true);
        try {
            // Set phone from auth context
            const phone = authPhone || '';

            // 1. First try to get profile from backend API
            const profileRes = await authApi.getProfile();
            if (profileRes.success && profileRes.data) {
                const p = profileRes.data;
                const hasData = p.name || p.email || p.address;
                setUserData({
                    name: p.name || '',
                    email: p.email || authEmail || '',
                    phone: p.phone || phone,
                    address: p.address || '',
                    state: p.state || '',
                    district: p.district || '',
                    country: p.country || '',
                });
                if (hasData) {
                    setProfileExists(true);
                    setIsEditing(false);
                }
            } else {
                // Fallback: set what we have from auth
                setUserData(prev => ({
                    ...prev,
                    phone: phone,
                    email: authEmail || '',
                }));
            }

            // 2. Also check existing pass data for this phone/email
            const lookupField = authEmail || phone;
            if (lookupField) {
                const field = authEmail ? 'email' : 'phone';
                const q = query(collection(db, 'ticpin_pass_users'), where(field, '==', lookupField));
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const existingData = snapshot.docs[0].data();
                    setUserData(prev => ({
                        ...prev,
                        name: prev.name || existingData.name || '',
                        email: prev.email || existingData.email || '',
                        phone: prev.phone || existingData.phone || '',
                        address: prev.address || existingData.address || '',
                        state: prev.state || existingData.state || '',
                        district: prev.district || existingData.district || '',
                        country: prev.country || existingData.country || '',
                    }));
                    setProfileExists(true);
                    setIsEditing(false);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Set fallback values
            setUserData(prev => ({
                ...prev,
                phone: authPhone || '',
                email: authEmail || '',
            }));
        } finally {
            setIsProfileLoading(false);
            // If no profile found, enable editing by default
            if (!profileExists) {
                setIsEditing(true);
            }
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!userData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!userData.name.trim()) newErrors.name = 'Full name is required';
        if (!userData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (userData.phone.length < 10) newErrors.phone = 'Please enter a valid 10-digit phone number';

        if (!userData.address.trim()) newErrors.address = 'Street address is required';
        if (!userData.state.trim()) newErrors.state = 'State is required';
        if (!userData.district.trim()) newErrors.district = 'District is required';
        if (!userData.country.trim()) newErrors.country = 'Country is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBuyPass = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setPaymentStatus('processing');

        try {
            // Check for duplicate pass using both phone and email
            const duplicateCheck = await checkDuplicatePass(userData.email, userData.phone);
            if (duplicateCheck.hasDuplicate) {
                alert(duplicateCheck.message || 'You already have an active Ticpin Pass!');
                setPaymentStatus('pending');
                setIsLoading(false);
                return;
            }

            // Mock payment processing (2 second delay)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Send OTP to the registered email for activation
            const otpRes = await authApi.sendEmailOtp(userData.email);
            if (!otpRes.success) {
                alert(otpRes.message || 'Failed to send verification code. Please try again.');
                setPaymentStatus('pending');
                setIsLoading(false);
                return;
            }

            setPaymentStatus('confirmed');
            setTimeout(() => {
                setCurrentStep('email_verification');
            }, 1000);
        } catch (error) {
            console.error('Error purchasing pass:', error);
            alert('Failed to purchase pass. Please try again.');
            setPaymentStatus('pending');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setVerificationError('Please enter the 6-digit code');
            return;
        }

        setIsLoading(true);
        setVerificationError('');
        try {
            // 1. Verify OTP
            const verifyRes = await authApi.verifyEmail(userData.email, otpCode);
            if (!verifyRes.success) {
                setVerificationError(verifyRes.message || 'Invalid verification code');
                setIsLoading(false);
                return;
            }

            // 2. Activate pass via backend (server validates, creates Firestore doc, cleans up stale records)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';
            const activateRes = await fetch(`${apiUrl}/api/v1/pass/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email || authEmail,
                    phone: userData.phone || authPhone,
                    address: userData.address,
                    state: userData.state,
                    district: userData.district,
                    country: userData.country,
                    planName: 'Quarterly Pass',
                    purchaseDate: passDetails.purchaseDate,
                    expiryDate: passDetails.expiryDate,
                    amount: 849,
                    paymentMethod: 'mock_upi',
                }),
            });

            const activateData = await activateRes.json();
            if (!activateRes.ok || !activateData.success) {
                setVerificationError(activateData.message || 'Failed to activate pass. Please try again.');
                setIsLoading(false);
                return;
            }

            const passId = activateData.data?.passId as string;

            // 3. Sync profile (non-blocking)
            if (isLoggedIn) {
                authApi.updateProfile({
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    address: userData.address,
                    state: userData.state,
                    district: userData.district,
                    country: userData.country
                }).catch((e: unknown) => console.warn('Profile sync failed:', e));
            }

            // 4. Send purchase confirmation email (non-blocking)
            if (userData.email) {
                fetch(`${apiUrl}/api/v1/emails/pass-purchase`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: userData.email,
                        name: userData.name,
                        purchaseDate: passDetails.purchaseDate,
                        expiryDate: passDetails.expiryDate,
                        passId,
                        amount: 849
                    })
                }).catch((e: unknown) => console.warn('Email notification failed:', e));
            }

            setCurrentStep('confirmation');
        } catch (error) {
            console.error('Error activating pass:', error);
            setVerificationError('An error occurred during activation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleInputChange = (field: keyof UserData, value: string) => {
        setUserData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading TicPin Pass...</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <>
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => {
                        setIsAuthModalOpen(false);
                        router.push('/profile');
                    }}
                    onAuthSuccess={() => {
                        setIsAuthModalOpen(false);
                    }}
                />
                <Footer />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1440px] mx-auto px-6 md:px-[68px] py-12">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold mb-8 transition-colors"
                >
                    <ChevronLeft size={20} />
                    Back to Profile
                </button>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                        TICPIN PASS
                    </h1>
                    <p className="text-xl text-gray-600">3 months. More play. More perks.</p>
                </div>

                {/* ── Already has an active pass ── */}
                {currentStep === 'active_pass' && existingPass && (
                    <div className="max-w-xl mx-auto text-center space-y-6">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-3xl p-10 shadow-sm">
                            <div className="flex justify-center mb-6">
                                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-5">
                                    <ShieldCheck size={48} className="text-white" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">You already have a Ticpin Pass!</h2>
                            <p className="text-gray-500 mb-6">Your pass is active and ready to use.</p>

                            <div className="bg-white rounded-2xl p-6 border border-purple-100 mb-6 space-y-3 text-left">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Status</span>
                                    <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">Active ✓</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Valid Until</span>
                                    <span className="font-semibold text-gray-800">
                                        {new Date(existingPass.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Days Remaining</span>
                                    <span className="font-bold text-purple-600">{existingPass.daysRemaining} days</span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 mb-6">
                                You can renew your pass once it expires. Come back after{' '}
                                <strong>{new Date(existingPass.expiryDate).toLocaleDateString('en-IN')}</strong>.
                            </p>

                            <button
                                onClick={() => router.push('/profile')}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
                            >
                                Go to My Profile
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'benefits' && (
                    <div className="space-y-8">
                        {/* Benefits Section */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white">
                            <h2 className="text-3xl font-bold mb-8">Unlock Premium Benefits</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                {/* Benefit 1 */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                                    <div className="text-4xl mb-3">🎾</div>
                                    <h3 className="text-xl font-bold mb-2">2 Free Turf Bookings</h3>
                                    <p className="text-sm text-white/90">Get 2 free bookings every 3 months for play/courts</p>
                                </div>

                                {/* Benefit 2 */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                                    <div className="text-4xl mb-3">🍽️</div>
                                    <h3 className="text-xl font-bold mb-2">2 Dining Vouchers</h3>
                                    <p className="text-sm text-white/90">Worth ₹250 each for dining experiences</p>
                                </div>

                                {/* Benefit 3 */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                                    <div className="text-4xl mb-3">⚡</div>
                                    <h3 className="text-xl font-bold mb-2">15% Discount</h3>
                                    <p className="text-sm text-white/90">Early access + exclusive discounts on events</p>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                                <h3 className="font-bold mb-3">Pass Duration: 3 Months</h3>
                                <p className="text-sm text-white/90 mb-4">
                                    Valid from {new Date(passDetails.purchaseDate).toLocaleDateString('en-IN')} to {new Date(passDetails.expiryDate).toLocaleDateString('en-IN')}
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p>✓ Benefits refresh every 3 months</p>
                                    <p>✓ Usage tracking available in dashboard</p>
                                    <p>✓ Renew anytime for continuous benefits</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => setCurrentStep('details')}
                                className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-full hover:shadow-lg transition-all"
                            >
                                Continue to Purchase
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'details' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <h2 className="text-3xl font-bold mb-8">Complete Your Details</h2>

                        {isProfileLoading ? (
                            <div className="flex justify-center py-16">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Fetching your profile...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Profile Found Banner */}
                                {profileExists && !isEditing && (
                                    <div className="bg-green-50 rounded-2xl p-6 border border-green-200 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-green-700 text-lg">✓ Profile Found</p>
                                            <p className="text-green-600 text-sm">Your details have been pre-filled from your profile.</p>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-xl hover:bg-green-50 transition-all font-semibold"
                                        >
                                            <Edit3 size={16} />
                                            Edit Details
                                        </button>
                                    </div>
                                )}

                                {/* Personal Information */}
                                <div className="bg-gray-50 rounded-2xl p-8 space-y-4">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                                        {isEditing && profileExists && (
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-semibold"
                                            >
                                                <Check size={16} />
                                                Done Editing
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={userData.phone}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                                            placeholder="Phone number"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Logged in with this number</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            value={userData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            disabled={!isEditing && profileExists}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-purple-600 transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                                                } ${!isEditing && profileExists ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
                                            placeholder="Enter your email address"
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            value={userData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            disabled={!isEditing && profileExists}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-purple-600 transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                                                } ${!isEditing && profileExists ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="bg-gray-50 rounded-2xl p-8 space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Address</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                                        <input
                                            type="text"
                                            value={userData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            disabled={!isEditing && profileExists}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-purple-600 transition-all ${errors.address ? 'border-red-500' : 'border-gray-300'
                                                } ${!isEditing && profileExists ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
                                            placeholder="Enter street address"
                                        />
                                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                                            <input
                                                type="text"
                                                value={userData.district}
                                                onChange={(e) => handleInputChange('district', e.target.value)}
                                                disabled={!isEditing && profileExists}
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-purple-600 transition-all ${errors.district ? 'border-red-500' : 'border-gray-300'
                                                    } ${!isEditing && profileExists ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
                                                placeholder="District"
                                            />
                                            {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                                            <input
                                                type="text"
                                                value={userData.state}
                                                onChange={(e) => handleInputChange('state', e.target.value)}
                                                disabled={!isEditing && profileExists}
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-purple-600 transition-all ${errors.state ? 'border-red-500' : 'border-gray-300'
                                                    } ${!isEditing && profileExists ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
                                                placeholder="State"
                                            />
                                            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                                        <input
                                            type="text"
                                            value={userData.country}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                            disabled={!isEditing && profileExists}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-purple-600 transition-all ${errors.country ? 'border-red-500' : 'border-gray-300'
                                                } ${!isEditing && profileExists ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
                                            placeholder="Country"
                                        />
                                        {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                                    </div>
                                </div>

                                {/* Price Summary */}
                                <div className="bg-purple-50 rounded-2xl p-8 space-y-3 border border-purple-200">
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="text-gray-700">Pass Price</span>
                                        <span className="font-bold text-purple-600">₹999</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="text-gray-700">Discount (15%)</span>
                                        <span className="font-bold text-green-600">-₹150</span>
                                    </div>
                                    <div className="border-t border-purple-200 pt-3 flex justify-between items-center text-2xl">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">₹849</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setCurrentStep('benefits')}
                                        className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!validateForm()) return;
                                            setCurrentStep('payment');
                                        }}
                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {currentStep === 'payment' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center space-y-8">
                            {paymentStatus === 'pending' && (
                                <>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Confirm Your Payment</h2>
                                    <p className="text-gray-600 mb-8">Review and confirm your Ticpin Pass purchase</p>

                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 space-y-6 border border-purple-200">
                                        {/* Payment Summary */}
                                        <div className="space-y-4 text-left">
                                            <h3 className="text-xl font-bold text-gray-900">Payment Summary</h3>

                                            <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                                                <span className="text-gray-700">Ticpin Pass (3 months)</span>
                                                <span className="font-bold text-gray-900">₹999</span>
                                            </div>

                                            <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                                                <span className="text-gray-700">Early Bird Discount (15%)</span>
                                                <span className="font-bold text-green-600">-₹150</span>
                                            </div>

                                            <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center p-4 bg-white rounded-xl">
                                                <span className="font-bold text-gray-900">Total Amount</span>
                                                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">₹849</span>
                                            </div>
                                        </div>

                                        {/* User Details */}
                                        <div className="space-y-3 text-left bg-white p-4 rounded-xl">
                                            <h4 className="font-bold text-gray-900 mb-3">Your Details</h4>
                                            <div>
                                                <p className="text-sm text-gray-500">Name</p>
                                                <p className="font-semibold text-gray-900">{userData.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-semibold text-gray-900">{userData.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="font-semibold text-gray-900">+91 {userData.phone}</p>
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="space-y-3 text-left bg-blue-50 p-4 rounded-xl border border-blue-200">
                                            <h4 className="font-bold text-blue-900 mb-3">Payment Method (Mock)</h4>
                                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">📱</div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">UPI Payment (Demo)</p>
                                                    <p className="text-xs text-gray-500">Mock transaction for testing</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setCurrentStep('details')}
                                            className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                        >
                                            Edit Details
                                        </button>
                                        <button
                                            onClick={handleBuyPass}
                                            disabled={isLoading}
                                            className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Processing...' : 'Confirm & Pay ₹849'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {paymentStatus === 'processing' && (
                                <div className="space-y-8 py-12">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Processing Your Payment...</h3>
                                    <p className="text-gray-600">Please wait while we confirm your transaction</p>
                                </div>
                            )}

                            {paymentStatus === 'confirmed' && (
                                <div className="space-y-6 py-12">
                                    <div className="text-5xl animate-bounce">✅</div>
                                    <h3 className="text-2xl font-bold text-green-600">Payment Confirmed!</h3>
                                    <p className="text-gray-600">Please verify your email to activate the pass</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 'email_verification' && (
                    <div className="max-w-md mx-auto">
                        <div className="text-center space-y-8">
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-600">
                                <Check size={40} />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
                                <p className="text-gray-500">
                                    We've sent a 6-digit confirmation code to <br />
                                    <span className="font-bold text-gray-900">{userData.email}</span>
                                </p>
                            </div>

                            <div className="flex justify-between gap-2">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="w-12 h-16 border-2 border-gray-200 rounded-2xl text-center text-2xl font-bold focus:border-purple-600 focus:outline-none transition-all"
                                    />
                                ))}
                            </div>

                            {verificationError && (
                                <p className="text-red-500 text-sm font-medium">{verificationError}</p>
                            )}

                            <div className="space-y-4 pt-4">
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={isLoading || otp.join('').length !== 6}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Verifying...' : 'Activate My Pass'}
                                </button>

                                <p className="text-sm text-gray-500">
                                    Didn't receive the code?{' '}
                                    <button
                                        onClick={() => authApi.sendEmailOtp(userData.email)}
                                        className="text-purple-600 font-bold hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 'confirmation' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center space-y-8">
                            <div className="text-6xl">✅</div>
                            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                                Purchase Successful!
                            </h2>
                            <p className="text-xl text-gray-600 mb-8">
                                Your Ticpin Pass is now active. Enjoy your benefits!
                            </p>

                            <div className="bg-purple-50 rounded-2xl p-8 space-y-4 text-left border border-purple-200">
                                <h3 className="text-xl font-bold text-gray-900">Your Pass Details</h3>
                                <div className="space-y-3 text-gray-700">
                                    <div className="flex justify-between">
                                        <span>Pass ID:</span>
                                        <span className="font-mono font-bold">TICPIN-{Date.now()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Valid Until:</span>
                                        <span className="font-bold">{new Date(passDetails.expiryDate).toLocaleDateString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Free Turf Bookings:</span>
                                        <span className="font-bold">{passDetails.freeTurfBookings}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Dining Vouchers:</span>
                                        <span className="font-bold">{passDetails.totalDiningVouchers}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Discount:</span>
                                        <span className="font-bold text-green-600">{passDetails.discountPercentage}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => router.push('/pass-dashboard')}
                                    className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                >
                                    View Dashboard
                                </button>
                                <button
                                    onClick={() => router.push('/play')}
                                    className="px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                                >
                                    Book Your Free Turf
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="px-6 py-4 border-2 border-gray-300 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    Go Home
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <BottomBanner />
            <Footer />
        </div>
    );
}
