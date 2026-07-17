'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Sub-components
import LoginView from '@/components/modals/auth/LoginView';
import ProfileHeader from '@/components/modals/auth/ProfileHeader';
import ProfileInfo from '@/components/modals/auth/ProfileInfo';
import TicPassCard from '@/components/modals/auth/TicPassCard';
import RecentBookings from '@/components/modals/auth/RecentBookings';
import MenuGrid from '@/components/modals/auth/MenuGrid';

import { useIdentityStore } from '@/store/useIdentityStore';
import { useProfile, useUpdateProfile, useUploadPhoto } from '@/lib/hooks/useProfile';
import { useUserBookings, useCancelBooking } from '@/lib/hooks/useBookings';
import { getOrganizerSession } from '@/lib/auth/organizer';
// import { auth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from '@/lib/firebase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialView?: 'number' | 'otp' | 'profile' | 'location' | 'bookings';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialView = 'number' }: AuthModalProps) {
    const router = useRouter();
    const { userSession, loginUser, logoutUser } = useIdentityStore();

    const [view, setView] = useState<'number' | 'otp' | 'profile' | 'location' | 'bookings'>(initialView);
    const [number, setNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const recaptchaVerifierRef = useRef<any>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (view !== 'otp' || !number) return;

        const getRemaining = () => {
            const sentAt = localStorage.getItem(`user_otp_sent_at_${number}`);
            if (!sentAt) return 0;
            const elapsed = Math.floor((Date.now() - parseInt(sentAt, 10)) / 1000);
            const remaining = 120 - elapsed;
            return remaining > 0 ? remaining : 0;
        };

        setTimeLeft(getRemaining());

        const interval = setInterval(() => {
            const remaining = getRemaining();
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [view, number]);

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // TanStack Query Hooks
    const { data: profile, isLoading: isProfileLoading } = useProfile(userSession?.id);
    const { data: bookings = [], isLoading: bookingsLoading } = useUserBookings(profile?.email, userSession?.phone, userSession?.id);
    const updateProfileMutation = useUpdateProfile();
    const uploadPhotoMutation = useUploadPhoto();
    const cancelBookingMutation = useCancelBooking();

    // Pass state (Keeping as local for now, can move to query later)
    const [pass, setPass] = useState<any>(null);
    const [organizerProfile, setOrganizerProfile] = useState<any>(null);

    useEffect(() => {
        const orgSession = getOrganizerSession();
        if (orgSession?.id && view === 'profile') {
            import('@/lib/api/organizer').then(({ organizerApi }) => {
                organizerApi.getProfile(orgSession.id).then(p => {
                    if (p) setOrganizerProfile(p);
                }).catch(() => { });
            });
        }
    }, [view]);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [activeTab, setActiveTab] = useState<'events' | 'dining' | 'play'>('events');

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const photoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const organizer = getOrganizerSession();
            if (!userSession && !organizer && (initialView === 'profile' || initialView === 'bookings')) {
                setView('number');
            } else {
                setView(initialView);
            }
        }
    }, [isOpen, initialView, userSession]);

    useEffect(() => {
        if (profile) {
            setEditedName(profile.name || '');
            setEditedEmail(profile.email || '');
        }
    }, [profile]);

    // Fetch pass manually for now
    useEffect(() => {
        if (userSession?.id && (view === 'profile')) {
            fetch(`/backend/api/pass/user/${userSession.id}`, { credentials: 'include' })
                .then(r => r.ok ? r.json() : null)
                .then(d => setPass(d));
        }
    }, [userSession?.id, view]);

    // Auto-close modal after successful login
    useEffect(() => {
        if (userSession && isOpen && initialView !== 'profile' && initialView !== 'bookings') {
            onClose();
        }
    }, [userSession, isOpen, initialView, onClose]);



    // Warm up the Vercel Serverless Go backend on modal open to eliminate cold starts
    useEffect(() => {
        if (isOpen) {
            fetch('/backend/api/health').catch(() => { });
        }
    }, [isOpen]);

    const handleUpdateProfile = async () => {
        if (!userSession?.id) return;
        updateProfileMutation.mutate({
            userId: userSession.id,
            data: { name: editedName, email: editedEmail }
        }, {
            onSuccess: () => setIsEditingProfile(false)
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userSession?.id) return;
        uploadPhotoMutation.mutate({ userId: userSession.id, file });
    };

    const handleCancelBooking = (id: string, category: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        cancelBookingMutation.mutate({ id, category });
    };

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (number.length !== 10) {
            setError('Please enter a valid 10-digit number');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // Call backend to generate and store real OTP (printed to console in dev)
            const res = await fetch('/backend/api/user/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: number }),
            });
            const d = await res.json();
            if (!res.ok) {
                setError(d.error || 'Failed to send OTP');
                setLoading(false);
                return;
            }

            const isAlreadySent = d.already_sent;
            const remaining = d.remaining_cooldown ?? 120;

            if (isAlreadySent) {
                const originalSentAt = Date.now() - (120 - remaining) * 1000;
                localStorage.setItem(`user_otp_sent_at_${number}`, originalSentAt.toString());
            } else {
                localStorage.setItem(`user_otp_sent_at_${number}`, Date.now().toString());
            }

            // Spin animation for 1 second after request succeeds
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setView('otp');
            setTimeLeft(remaining);
        } catch (err: any) {
            console.error('Send OTP Error:', err);
            setError('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length > 1) {
            const digits = cleanValue.slice(0, 6);
            setOtp(prev => {
                const next = [...prev];
                digits.split('').forEach((char, i) => {
                    if (index + i < 6) next[index + i] = char;
                });
                return next;
            });
            const nextFocus = Math.min(index + digits.length, 5);
            otpRefs.current[nextFocus]?.focus();
            return;
        }

        setOtp(prev => {
            const next = [...prev];
            next[index] = cleanValue;
            return next;
        });
        if (cleanValue && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter') handleOtpSubmit();
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!data) return;
        setOtp(prev => {
            const next = [...prev];
            data.split('').forEach((char, i) => {
                if (i < 6) next[i] = char;
            });
            return next;
        });
        const nextFocus = Math.min(data.length, 5);
        otpRefs.current[nextFocus]?.focus();
    };

    const handleOtpSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter a 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            // Send phone:otp token format to backend for real OTP verification
            const token = `${number}:${otpCode}`;

            const res = await fetch('/backend/api/user/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ token }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Verification failed');
                setLoading(false);
                return;
            }

            const userData = data.user || data;
            loginUser({ id: userData.id || userData._id || number, phone: number, name: userData.name || '' });

            if (onSuccess) {
                onSuccess();
            } else {
                setView('profile');
            }
        } catch (err: any) {
            console.error('Verification Error:', err);
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    const organizerSession = getOrganizerSession();
    const isAdmin = organizerSession?.isAdmin === true;

    return (
        <div
            className={`fixed inset-0 z-[10000] flex transition-all duration-500 ${view === 'profile' || view === 'bookings'
                ? 'justify-end pointer-events-none'
                : 'items-center justify-center p-0 md:p-4 overflow-hidden'
                }`}
            style={{ fontFamily: 'var(--font-anek-latin)' }}
        >
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-white md:bg-black/60 md:backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            <div
                className={`bg-white relative shadow-2xl transition-all duration-500 flex flex-col pointer-events-auto z-10 overflow-hidden ${view === 'profile' || view === 'bookings'
                    ? 'h-full w-full max-w-[750px] rounded-l-[60px] translate-x-0'
                    : 'w-full h-auto md:w-[500px] rounded-none md:rounded-[30px]'
                    }`}
                style={
                    view !== 'profile' && view !== 'bookings'
                        ? isMobile
                            ? {}
                            : { width: '420px', height: '580px' }
                        : {}
                }
            >
                {view === 'number' || view === 'otp' ? (
                    <LoginView
                        view={view} number={number} setNumber={setNumber} otp={otp}
                        handleOtpChange={handleOtpChange} handleKeyDown={handleKeyDown} handleOtpPaste={handleOtpPaste}
                        otpRefs={otpRefs} loading={loading} error={error}
                        handleSendOtp={handleLogin} handleVerifyOtp={handleOtpSubmit} handleResend={handleLogin}
                        onClose={onClose}
                        timeLeft={timeLeft}
                        onNumberChange={() => {
                            setView('number');
                            setOtp(['', '', '', '', '', '']);
                            setError('');

                        }}
                    />
                ) : (
                    <div className="min-h-full flex flex-col bg-[#F6F6F6] animate-in slide-in-from-right duration-500">
                        {showLogoutConfirm && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-6 animate-in fade-in duration-200">
                                <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-300">
                                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                                        <Loader2 size={40} className="rotate-90" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl text-zinc-900 font-bold">Log Out?</h3>
                                        <p className="text-zinc-500 font-medium">Are you sure you want to log out of your account?</p>
                                    </div>
                                    <div className="flex gap-4 w-full">
                                        <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold">Cancel</button>
                                        <button
                                            onClick={() => { setShowLogoutConfirm(false); logoutUser(); setView('number'); setNumber(''); setOtp(['', '', '', '', '', '']); onClose(); }}
                                            className="flex-1 py-4 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/30 font-bold"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ProfileHeader
                            title={view === 'bookings' ? 'My Bookings' : 'Profile'}
                            onBack={() => setView('profile')}
                            showBackButton={view === 'bookings'}
                            onClose={onClose}
                        />

                        <div className="flex-1 px-8 py-8 space-y-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
                            {view === 'profile' ? (
                                <>
                                    <ProfileInfo
                                        profile={profile ?? null} isAdmin={isAdmin} userPhone={userSession?.phone || ''}
                                        isOrganizer={!!organizerSession} organizerProfile={organizerProfile} organizerSession={organizerSession}
                                        isEditing={isEditingProfile} editedName={editedName} editedEmail={editedEmail}
                                        updating={updateProfileMutation.isPending || uploadPhotoMutation.isPending}
                                        setEditedName={setEditedName} setEditedEmail={setEditedEmail}
                                        setIsEditing={setIsEditingProfile} handleUpdate={handleUpdateProfile}
                                        handlePhotoUpload={handlePhotoUpload} photoInputRef={photoInputRef}
                                    />
                                    {pass && <TicPassCard pass={pass} onClose={onClose} />}
                                    <MenuGrid
                                        isAdmin={isAdmin} isOrganizer={!!organizerSession}
                                        onViewBookings={() => { router.push('/profile/bookings/events'); onClose(); }}
                                        onViewDiningBookings={() => { router.push('/profile/bookings/dining'); onClose(); }}
                                        onViewEventTickets={() => { router.push('/profile/bookings/events'); onClose(); }}
                                        onViewPlayBookings={() => { router.push('/profile/bookings/play'); onClose(); }}
                                        onEditProfile={() => {
                                            if (userSession?.id) {
                                                router.push('/profile');
                                                onClose();
                                            } else if (organizerSession?.id) {
                                                router.push('/organizer/profile');
                                                onClose();
                                            }
                                        }}
                                        onLogout={() => setShowLogoutConfirm(true)}
                                        onClose={onClose}
                                    />
                                </>
                            ) : (
                                <RecentBookings
                                    bookings={bookings} loading={bookingsLoading} activeTab={activeTab} setActiveTab={setActiveTab}
                                    hasProfileDetails={!!(profile?.email || userSession?.phone)}
                                    handleCancel={handleCancelBooking} onClose={onClose}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Reusable Ultimate Production Error Handler for Firebase Auth
const getFirebaseErrorMessage = (err: any): string => {
    const code = err?.code || '';
    const message = err?.message || '';

    switch (code) {
        case 'auth/invalid-phone-number':
            return 'Please enter a valid mobile number.';
        case 'auth/missing-phone-number':
            return 'Mobile number is required.';
        case 'auth/quota-exceeded':
            return 'SMS limit reached. Please try again later.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please wait before trying again.';
        case 'auth/captcha-check-failed':
            return 'Security verification failed. Please refresh and try again.';
        case 'auth/invalid-app-credential':
            return 'Verification service unavailable. Please try again later.';
        case 'auth/missing-app-credential':
            return 'Verification failed. Please refresh the page.';
        case 'auth/app-not-authorized':
            return 'Application is not authorized for authentication.';
        case 'auth/web-storage-unsupported':
            return 'Your browser does not support secure login.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        case 'auth/popup-blocked':
            return 'Popup blocked by browser. Please allow popups.';
        case 'auth/popup-closed-by-user':
            return 'Authentication was cancelled.';
        case 'auth/timeout':
            return 'Request timed out. Please try again.';
        case 'auth/internal-error':
            return 'Something went wrong. Please try again later.';
        case 'auth/operation-not-allowed':
            return 'Phone authentication is currently disabled.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/session-expired':
        case 'auth/code-expired':
            return 'OTP expired. Please request a new one.';
        case 'auth/invalid-verification-code':
            return 'Incorrect OTP entered.';
        case 'auth/invalid-verification-id':
            return 'Verification session expired. Please retry.';
        case 'auth/missing-verification-code':
            return 'Please enter the OTP code.';
        case 'auth/missing-verification-id':
            return 'Verification session missing. Please retry login.';
        case 'auth/credential-already-in-use':
            return 'This mobile number is already linked to another account.';
        case 'auth/user-token-expired':
            return 'Your session expired. Please login again.';
        case 'auth/requires-recent-login':
            return 'Please login again to continue.';
        case 'auth/unauthorized-domain':
            return 'This domain is not authorized for login.';
        case 'auth/invalid-api-key':
            return 'Authentication configuration error.';
        case 'auth/api-key-not-valid':
            return 'Authentication service unavailable.';
        case 'auth/argument-error':
            return 'Invalid authentication request.';
        case 'auth/missing-client-type':
            return 'Authentication configuration missing.';
        case 'auth/recaptcha-not-enabled':
            return 'Security verification unavailable.';
        case 'auth/invalid-recaptcha-token':
            return 'Security verification failed. Please retry.';
        case 'auth/missing-recaptcha-token':
            return 'Security verification missing.';
        case 'auth/invalid-recaptcha-action':
            return 'Invalid security verification action.';
        case 'auth/multi-factor-auth-required':
            return 'Additional verification required.';
        case 'auth/maximum-second-factor-count-exceeded':
            return 'Maximum verification methods reached.';
        case 'auth/unsupported-first-factor':
            return 'Unsupported login method.';
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
            return 'Account not found.';
        case 'auth/wrong-password':
            return 'Incorrect password entered.';
        case 'auth/weak-password':
            return 'Password is too weak.';
        default:
            if (message.includes('Hostname match not found')) {
                return 'Login service configuration issue.';
            }
            if (message.includes('reCAPTCHA')) {
                return 'Security verification failed. Please retry.';
            }
            return err?.message || 'Authentication failed. Please try again.';
    }
};
