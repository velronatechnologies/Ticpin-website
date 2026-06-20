import React from 'react';
import Image from 'next/image';
import { X, ChevronDown } from 'lucide-react';

interface LoginViewProps {
    view: 'number' | 'otp';
    number: string;
    setNumber: (val: string) => void;
    otp: string[];
    handleOtpChange: (index: number, value: string) => void;
    handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleOtpPaste: (e: React.ClipboardEvent) => void;
    otpRefs: React.RefObject<(HTMLInputElement | null)[]>;
    loading: boolean;
    error: string;
    handleSendOtp: (e: React.FormEvent) => void;
    handleVerifyOtp: (e: React.FormEvent) => void;
    handleResend: () => void;
    onClose: () => void;
    onNumberChange?: () => void;
    timeLeft?: number;
}

const LoginView: React.FC<LoginViewProps> = ({
    view,
    number,
    setNumber,
    otp,
    handleOtpChange,
    handleKeyDown,
    handleOtpPaste,
    otpRefs,
    loading,
    error,
    handleSendOtp,
    handleVerifyOtp,
    handleResend,
    onClose,
    onNumberChange,
    timeLeft
}) => {
    React.useEffect(() => {
        if (view === 'otp' && otpRefs.current && otpRefs.current[0]) {
            otpRefs.current[0].focus();
        }
    }, [view, otpRefs]);

    return (
        <div className="h-full flex flex-col overflow-hidden overflow-y-hidden">
            {/* Permanent recaptcha-container so it never gets unmounted */}
            <div id="recaptcha-container"></div>

            {/* Banner Section */}
            <div className="relative h-[260px] sm:h-[300px] flex flex-col items-center justify-center p-0 overflow-hidden shrink-0">
                <Image
                    src="/login/banner.jpeg"
                    alt="Login Banner"
                    fill
                    className="object-cover"
                    priority
                />
                <button onClick={onClose} className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-20 bg-black/20 p-2 rounded-full backdrop-blur-sm">
                    <X size={24} />
                </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col items-center justify-center bg-white">
                {view === 'number' ? (
                    <>
                        <div className="text-center space-y-2">
                            <h3 className="text-[26px] sm:text-[32px] text-zinc-900 font-bold tracking-tight">Enter your mobile number</h3>
                            <p className="text-[14px] sm:text-base text-zinc-500 font-semibold leading-tight">Don't have an account? We'll set one up for you</p>
                        </div>

                        <div className="w-full max-w-[604px] space-y-6">
                            <div className="flex gap-3">
                                <div className="flex items-center gap-1.5 px-3 bg-white border border-zinc-200 rounded-[15px] h-[55px] cursor-pointer hover:border-zinc-400 transition-all">
                                    <Image src="https://flagcdn.com/w40/in.png" alt="IN" width={20} height={13} className="w-5 h-3.5 object-cover rounded-sm" />
                                    <span className="text-base text-zinc-900 font-bold">+91</span>
                                    <ChevronDown size={14} className="text-zinc-400" />
                                </div>
                                <input
                                    autoFocus
                                    type="tel"
                                    placeholder="Enter mobile number"
                                    className="flex-1 px-4 bg-white border border-zinc-200 rounded-[15px] text-base font-semibold focus:outline-none focus:border-black h-[55px] transition-all"
                                    value={number}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setNumber(val);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp(e)}
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm -mt-2 font-medium">{error}</p>}

                            <button
                                onClick={handleSendOtp}
                                disabled={number.length !== 10 || loading}
                                className={`w-full h-[55px] text-base font-bold rounded-[15px] transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2
                                    ${number.length === 10 
                                        ? 'bg-black text-white hover:bg-zinc-800' 
                                        : 'bg-[#DEDEDE] text-black cursor-not-allowed'
                                    }`}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Continue'}
                            </button>

                            <div className="text-center pt-2">
                                <p className="text-[12px] text-zinc-400 font-semibold leading-normal">
                                    By continuing, you agree to our<br />
                                    <span className="text-[#3311D1] font-semibold cursor-pointer hover:underline">Terms of Service</span>&nbsp;and&nbsp;
                                    <span className="text-[#3311D1] font-semibold cursor-pointer hover:underline">Privacy Policy</span>
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center space-y-2">
                            <h3 className="text-[26px] sm:text-[32px] text-zinc-900 font-bold tracking-tight">Enter OTP</h3>
                            <p className="text-[14px] sm:text-base text-zinc-500 font-semibold leading-tight">
                                We sent a 6-digit code to +91 {number}{' '}
                                <span
                                    className="text-[#3311D1] font-bold cursor-pointer hover:underline"
                                    onClick={onNumberChange}
                                >
                                    (Change)
                                </span>
                            </p>
                        </div>

                        <div className="w-full max-w-[604px] space-y-6 flex flex-col justify-center items-center">
                            <div className="flex justify-center gap-1.5 sm:gap-3 w-full">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { if (otpRefs.current) otpRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        className="w-10 h-[50px] sm:w-[55px] sm:h-[55px] bg-white border border-zinc-200 rounded-[12px] text-center text-lg sm:text-2xl font-bold focus:outline-none focus:border-black transition-all shadow-sm"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        onPaste={handleOtpPaste}
                                    />
                                ))}
                            </div>

                            {error && <p className="text-red-500 text-sm -mt-2 font-medium">{error}</p>}

                            <div className="w-full space-y-4">
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={otp.some(d => !d) || loading}
                                    className={`w-full h-[55px] text-base font-bold rounded-[15px] transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2
                                        ${!otp.some(d => !d) 
                                            ? 'bg-black text-white hover:bg-zinc-800' 
                                            : 'bg-[#DEDEDE] text-black cursor-not-allowed'
                                        }`}
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : 'Continue'}
                                </button>
                                <div className="text-center pt-1">
                                    {timeLeft && timeLeft > 0 ? (
                                        <p className="text-[14px] text-zinc-400 font-semibold">
                                            Resend OTP in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                        </p>
                                    ) : (
                                        <p className="text-[14px] text-zinc-500 font-semibold">
                                            Didn&apos;t get the OTP?{' '}
                                            <span
                                                onClick={handleResend}
                                                className="text-[#3311D1] font-bold cursor-pointer hover:underline inline-flex items-center gap-1.5"
                                                style={{ pointerEvents: loading ? 'none' : 'auto' }}
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin h-3.5 w-3.5 text-[#3311D1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span>Sending…</span>
                                                    </>
                                                ) : 'Resend OTP'}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginView;
