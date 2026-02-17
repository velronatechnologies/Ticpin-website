'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

// Import Views
import PhoneView from './auth/views/PhoneView';
import OTPView from './auth/views/OTPView';
import ProfileView from './auth/views/ProfileView';
import ProfileEditView from './auth/views/ProfileEditView';
import EmailVerifyView from './auth/views/EmailVerifyView';
import EmailLoginView from './auth/views/EmailLoginView';
import EmailRegisterView from './auth/views/EmailRegisterView';
import OrganizerOTPView from './auth/views/OrganizerOTPView';

// Firebase
import { auth as firebaseAuth, googleProvider } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, signInWithPopup } from 'firebase/auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'number' | 'otp' | 'profile' | 'location' | 'profile_edit' | 'email_verify' | 'email_login' | 'email_register' | 'email_otp';
    onAuthSuccess?: (id: string, token: string) => void;
    isOrganizer?: boolean;
    category?: string | null;
}

export default function AuthModal({ isOpen, onClose, initialView = 'number', onAuthSuccess, isOrganizer = false, category = null }: AuthModalProps) {
    const { login: authLogin, logout, phone: savedPhone, isOrganizer: authIsOrganizer } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const [view, setView] = useState<'number' | 'otp' | 'profile' | 'location' | 'profile_edit' | 'email_verify' | 'email_login' | 'email_register' | 'email_otp'>(initialView);

    useEffect(() => {
        if (isOpen) {
            if (isOrganizer && initialView === 'number') {
                setView('email_login');
            } else {
                setView(initialView);
            }
        }
    }, [isOpen, initialView, isOrganizer]);

    const [number, setNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [emailOtpTimer, setEmailOtpTimer] = useState(300);
    const [canResendEmailOtp, setCanResendEmailOtp] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const emailOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Firebase Phone Auth
    const confirmationResultRef = useRef<ConfirmationResult | null>(null);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

    useEffect(() => {
        if (view === 'otp') {
            otpRefs.current[0]?.focus();
        } else if (['email_otp', 'email_verify'].includes(view)) {
            setTimeout(() => {
                emailOtpRefs.current[0]?.focus();
            }, 100);
        }
    }, [view]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (view === 'email_otp' && emailOtpTimer > 0) {
            interval = setInterval(() => {
                setEmailOtpTimer((prev) => prev - 1);
            }, 1000);
        } else if (emailOtpTimer === 0) {
            setCanResendEmailOtp(true);
        }
        return () => clearInterval(interval);
    }, [view, emailOtpTimer]);

    useEffect(() => {
        if (view === 'email_otp') {
            setEmailOtpTimer(300);
            setCanResendEmailOtp(false);
        }
    }, [view]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authApi.getProfile();
                if (response.success) {
                    setUserProfile(response.data);
                    setName(response.data.name || '');
                    setEmail(response.data.email || '');
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };

        if (isOpen && ['profile', 'profile_edit', 'email_verify'].includes(view)) {
            fetchProfile();
        }
    }, [isOpen, view]);

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleEmailOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...emailOtp];
        newOtp[index] = value.substring(value.length - 1);
        setEmailOtp(newOtp);

        if (value && index < 5) {
            emailOtpRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter' && otp.join('').length === 6 && !isLoading) {
            completeLogin();
        }
    };

    const handleEmailOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
            emailOtpRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter' && emailOtp.join('').length === 6 && !isLoading) {
            if (view === 'email_otp') handleOrganizerVerifyOtp();
            if (view === 'email_verify') handleVerifyEmail();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text');
        const digits = data.replace(/\D/g, '').slice(0, 6).split('');

        if (digits.length > 0) {
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                newOtp[i] = digit;
            });
            setOtp(newOtp);

            // Focus the appropriate input
            const nextIndex = Math.min(digits.length, 5);
            otpRefs.current[nextIndex]?.focus();

            // If we have all 6 digits, we could potentially auto-submit
            if (digits.length === 6) {
                // Optional: trigger login
            }
        }
    };

    const handleEmailPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text');
        const digits = data.replace(/\D/g, '').slice(0, 6).split('');

        if (digits.length > 0) {
            const newOtp = [...emailOtp];
            digits.forEach((digit, i) => {
                newOtp[i] = digit;
            });
            setEmailOtp(newOtp);

            // Focus the appropriate input
            const nextIndex = Math.min(digits.length, 5);
            emailOtpRefs.current[nextIndex]?.focus();
        }
    };

    const setupRecaptcha = () => {
        if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;

        try {
            const verifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    console.log('Recaptcha verified');
                },
                'expired-callback': () => {
                    addToast('Recaptcha expired. Please try again.', 'error');
                }
            });
            recaptchaVerifierRef.current = verifier;
            return verifier;
        } catch (error) {
            console.error('Recaptcha error:', error);
            return null;
        }
    };

    const handleSendOtp = async () => {
        // TESTING: Simplified validation - allow any number
        if (!number || number.length < 1) {
            addToast('Please enter a phone number', 'error');
            return;
        }

        setIsLoading(true);
        try {
            // TESTING: Skip Firebase - go directly to backend (which now accepts any OTP)
            // Backend is set to bypass OTP verification for testing
            addToast('OTP: Use any code for normal users, 123456 for admin (1000000000)', 'success');
            setView('otp');
        } catch (error: any) {
            console.error('Error:', error);
            addToast('Failed to proceed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setIsLoading(true);
        try {
            const response = await authApi.updateProfile({ name, email });
            if (response.success) {
                setUserProfile(response.data);
                addToast('Profile updated!', 'success');
                if (email && email !== response.data.email || !response.data.is_email_verified) {
                    await handleSendEmailOtp();
                } else {
                    setView('profile');
                }
            } else {
                addToast(response.message || 'Update failed', 'error');
            }
        } catch (error) {
            addToast('Connection error', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEmailOtp = async () => {
        setIsLoading(true);
        try {
            const response = await authApi.sendEmailOtp(email);
            if (response.success) {
                addToast('Verification OTP sent to your email!', 'success');
                setView('email_verify');
            } else {
                addToast(response.message || 'Failed to send verification email', 'error');
            }
        } catch (error) {
            addToast('Connection error', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const completeLogin = async () => {
        setIsLoading(true);
        try {
            const otpCode = otp.join('');

            if (!otpCode || otpCode.length !== 6) {
                addToast('Please enter 6-digit OTP', 'error');
                setIsLoading(false);
                return;
            }

            // TESTING: Direct backend login with OTP (backend accepts any OTP now)
            // Admin: 1000000000 requires 123456
            // Others: any number with any OTP
            const response = await authApi.login(number, otpCode, '');

            if (response.success && response.data) {
                authLogin(number, response.data.token, { userId: response.data.user.id });
                addToast('Login successful!', 'success');
                setIsLoading(false);

                if (onAuthSuccess) {
                    onAuthSuccess(number, response.data.token);
                } else {
                    onClose();
                }
                return;
            } else {
                addToast(response.message || 'Login failed', 'error');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            addToast(error.message || 'Login failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOrganizerLogin = async () => {
        setIsLoading(true);
        try {
            const response = await authApi.organizerLogin({ email, password });
            if (response.success && response.data) {
                setUserProfile(response.data.user);
                authLogin(email, response.data.token, {
                    email,
                    isEmailVerified: response.data.user.is_email_verified,
                    userId: response.data.user.id
                });
                addToast('Login successful!', 'success');
                router.push(`/list-your-events/dashboard${category ? `?category=${category}` : ''}`);
                onClose();
                if (onAuthSuccess) onAuthSuccess(email, response.data.token);
            } else {
                // UX Improvement: Check specific error cases
                const msg = response.message?.toLowerCase() || '';

                if (msg.includes('not verified')) {
                    addToast('Email not verified. Sending new verification code...', 'warning');
                    await authApi.organizerResendOtp(email);
                    setTimeout(() => setView('email_otp'), 1500);
                } else if (msg.includes('invalid credentials') || msg.includes('password mismatch') || msg.includes('incorrect password')) {
                    addToast('Incorrect password. Please try again.', 'error');
                } else if (msg.includes('not found') || msg.includes('no account') || msg.includes('invalid user') || msg.includes('invalid email')) {
                    addToast('No account found with this email. Redirecting to Register...', 'warning');
                    setTimeout(() => setView('email_register'), 1500);
                } else {
                    addToast(response.message || 'Login failed. Please check your credentials.', 'error');
                }
            }
        } catch (error) {
            addToast('Backend connection failed. Please try again later.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOrganizerRegister = async () => {
        if (!name || !phone || !email || !password) {
            addToast('Please fill all required fields', 'error');
            return;
        }
        if (password.length < 6) {
            addToast('Password must be at least 6 characters', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const response = await authApi.organizerRegister({ name, phone, email, password });
            if (response.success) {
                addToast('Account created! Please verify the code sent to your email.', 'success');
                setView('email_otp');
            } else {
                // UX Improvement: If email already exists, offer to move to login
                const msg = response.message?.toLowerCase() || '';
                if (msg.includes('already registered') || msg.includes('exists') || msg.includes('already taken')) {
                    addToast('This email is already registered. Switching to Login...', 'warning');
                    setTimeout(() => setView('email_login'), 1500);
                } else {
                    addToast(response.message || 'Registration failed. Please try again.', 'error');
                }
            }
        } catch (error) {
            addToast('Our servers are temporarily unreachable. Please check your connection and try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOrganizerVerifyOtp = async () => {
        setIsLoading(true);
        try {
            const otpCode = emailOtp.join('');
            const response = await authApi.organizerVerifyOtp({ email, otp: otpCode });
            if (response.success && response.data) {
                authLogin(email, response.data.token, { email, isEmailVerified: true });
                addToast('Verification successful!', 'success');
                router.push(`/list-your-events/dashboard${category ? `?category=${category}` : ''}`);
                onClose();
                if (onAuthSuccess) onAuthSuccess(email, response.data.token);
            } else {
                addToast(response.message || 'Verification failed', 'error');
            }
        } catch (error) {
            addToast('Our servers are temporarily unreachable. Please check your connection and try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOrganizerGoogleLogin = async () => {
        setIsLoading(true);
        try {
            // 1. Sign in with Google via Firebase
            const result = await signInWithPopup(firebaseAuth, googleProvider);
            const user = result.user;

            // 2. Get the ID token
            const idToken = await user.getIdToken();

            // 3. Send to backend for verification and session creation
            const response = await authApi.organizerGoogleLogin({
                email: user.email || '',
                name: user.displayName || '',
                id_token: idToken
            });

            if (response.success && response.data) {
                setUserProfile(response.data.user);
                authLogin(user.email || '', response.data.token, {
                    email: user.email || '',
                    isEmailVerified: true,
                    userId: response.data.user.id
                });
                addToast('Google Login successful!', 'success');
                router.push(`/list-your-events/dashboard${category ? `?category=${category}` : ''}`);
                onClose();
                if (onAuthSuccess) onAuthSuccess(user.email || '', response.data.token);
            } else {
                addToast(response.message || 'Google login failed on backend', 'error');
            }
        } catch (error: any) {
            console.error('Google Auth Error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                // Ignore popup closures
            } else {
                addToast(error.message || 'Google Login failed', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOrganizerOtp = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await authApi.organizerResendOtp(email);
            if (response.success) {
                addToast('A new code has been sent to your email!', 'success');
                setEmailOtpTimer(300);
                setCanResendEmailOtp(false);
                setEmailOtp(['', '', '', '', '', '']);
                emailOtpRefs.current[0]?.focus();
            } else {
                addToast(response.message || 'Failed to resend OTP', 'error');
            }
        } catch (error) {
            addToast('Our servers are temporarily unreachable. Please check your connection and try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        setIsLoading(true);
        try {
            const otpCode = emailOtp.join('');
            const response = await authApi.verifyEmail(email, otpCode);
            if (response.success) {
                addToast('Email verified successfully!', 'success');
                setView('profile');
            } else {
                addToast(response.message || 'Verification failed', 'error');
            }
        } catch (error) {
            addToast('Our servers are temporarily unreachable. Please check your connection and try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const isCompact = view === 'profile' && authIsOrganizer;
    const isSidebarView = (['profile_edit', 'email_verify'].includes(view) || (view === 'profile' && !authIsOrganizer));

    return (
        <div
            className={`fixed inset-0 z-[10000] flex transition-all duration-500 ${isSidebarView ? 'justify-end pointer-events-none' : 'items-center justify-center p-4'
                }`}
            style={{ fontFamily: 'var(--font-anek-latin)' }}
        >
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            <div
                className={`bg-white relative shadow-2xl transition-all duration-500 flex flex-col pointer-events-auto z-10 overflow-hidden ${isSidebarView
                    ? 'h-full w-full max-w-[750px] rounded-l-[60px] translate-x-0'
                    : 'rounded-[35px] animate-in zoom-in duration-300'
                    }`}
                style={isCompact ? { width: '500px', height: 'auto' } : (!isSidebarView ? { width: '850px', height: '700px' } : {})}
            >
                {/* TESTING: Recaptcha disabled */}
                {/* <div id="recaptcha-container"></div> */}

                {view === 'number' && (
                    <PhoneView
                        onClose={onClose}
                        setView={setView}
                        number={number}
                        setNumber={setNumber}
                        handleSendOtp={handleSendOtp}
                        isLoading={isLoading}
                    />
                )}

                {view === 'otp' && (
                    <OTPView
                        onClose={onClose}
                        number={number}
                        setView={setView}
                        otp={otp}
                        otpRefs={otpRefs}
                        handleOtpChange={handleOtpChange}
                        handleKeyDown={handleKeyDown}
                        handlePaste={handlePaste}
                        completeLogin={completeLogin}
                        handleSendOtp={handleSendOtp}
                        isLoading={isLoading}
                    />
                )}

                {view === 'profile' && (
                    <ProfileView
                        onClose={onClose}
                        showLogoutConfirm={showLogoutConfirm}
                        setShowLogoutConfirm={setShowLogoutConfirm}
                        logout={logout}
                        addToast={addToast}
                        setNumber={setNumber}
                        setOtp={setOtp}
                        setView={setView}
                        userProfile={userProfile}
                        number={number}
                        savedPhone={savedPhone}
                        isOrganizer={authIsOrganizer}
                    />
                )}

                {view === 'profile_edit' && (
                    <ProfileEditView
                        setView={setView}
                        name={name}
                        setName={setName}
                        email={email}
                        setEmail={setEmail}
                        handleUpdateProfile={handleUpdateProfile}
                        isLoading={isLoading}
                    />
                )}

                {view === 'email_verify' && (
                    <EmailVerifyView
                        setView={setView}
                        email={email}
                        emailOtp={emailOtp}
                        emailOtpRefs={emailOtpRefs}
                        handleEmailOtpChange={handleEmailOtpChange}
                        handleEmailOtpKeyDown={handleEmailOtpKeyDown}
                        handleEmailPaste={handleEmailPaste}
                        handleVerifyEmail={handleVerifyEmail}
                        handleSendEmailOtp={handleSendEmailOtp}
                        isLoading={isLoading}
                    />
                )}

                {view === 'email_login' && (
                    <EmailLoginView
                        onClose={onClose}
                        setView={setView}
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        handleOrganizerLogin={handleOrganizerLogin}
                        handleOrganizerGoogleLogin={handleOrganizerGoogleLogin}
                        isLoading={isLoading}
                        name={name}
                    />
                )}

                {view === 'email_register' && (
                    <EmailRegisterView
                        setView={setView}
                        name={name}
                        setName={setName}
                        phone={phone}
                        setPhone={setPhone}
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        handleOrganizerRegister={handleOrganizerRegister}
                        isLoading={isLoading}
                    />
                )}

                {view === 'email_otp' && (
                    <OrganizerOTPView
                        email={email}
                        emailOtp={emailOtp}
                        emailOtpRefs={emailOtpRefs}
                        handleEmailOtpChange={handleEmailOtpChange}
                        handleEmailOtpKeyDown={handleEmailOtpKeyDown}
                        handleEmailPaste={handleEmailPaste}
                        emailOtpTimer={emailOtpTimer}
                        canResendEmailOtp={canResendEmailOtp}
                        handleResendOrganizerOtp={handleResendOrganizerOtp}
                        handleOrganizerVerifyOtp={handleOrganizerVerifyOtp}
                        setView={setView}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
}
