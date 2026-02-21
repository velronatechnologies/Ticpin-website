'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface EmailRegisterViewProps {
    setView: (view: any) => void;
    name: string;
    setName: (val: string) => void;
    phone: string;
    setPhone: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    handleOrganizerRegister: () => void;
    isLoading: boolean;
}

export default function EmailRegisterView({
    setView,
    name,
    setName,
    phone,
    setPhone,
    email,
    setEmail,
    password,
    setPassword,
    handleOrganizerRegister,
    isLoading
}: EmailRegisterViewProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const onRegister = () => {
        if (password !== confirmPassword) {
         
            return;
        }
        handleOrganizerRegister();
    };

    const isFormValid = name && phone && email && password.length >= 6 && password === confirmPassword && !isLoading;

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white">
            <div className="relative h-[160px] shrink-0">
                <img src="/login/banner.jpeg" className="absolute inset-0 w-full h-full object-cover" />
                <button onClick={() => setView('email_login')} className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors z-20 bg-black/20 p-2 rounded-full backdrop-blur-sm">
                    <ChevronLeft size={24} />
                </button>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col items-center justify-start bg-white overflow-y-auto scrollbar-hide">
                <div className="text-center space-y-1">
                    <h3 className="text-[28px] text-zinc-900 font-bold">Create Organizer Account</h3>
                    <p className="text-sm text-zinc-500 font-medium">Join Ticpin as an event creator</p>
                </div>
                <div className="w-full max-w-[500px] space-y-3">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full h-[50px] px-6 border border-zinc-200 rounded-2xl text-lg font-medium text-black focus:outline-none focus:border-black transition-all placeholder:text-zinc-400"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isFormValid) onRegister();
                        }}
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full h-[50px] px-6 border border-zinc-200 rounded-2xl text-lg font-medium text-black focus:outline-none focus:border-black transition-all placeholder:text-zinc-400"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isFormValid) onRegister();
                        }}
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full h-[50px] px-6 border border-zinc-200 rounded-2xl text-lg font-medium text-black focus:outline-none focus:border-black transition-all placeholder:text-zinc-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isFormValid) onRegister();
                        }}
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password (Min 6 chars)"
                            className="w-full h-[50px] px-6 border border-zinc-200 rounded-2xl text-lg font-medium text-black focus:outline-none focus:border-black transition-all pr-12 placeholder:text-zinc-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && isFormValid) onRegister();
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            className={`w-full h-[50px] px-6 border ${password && confirmPassword && password !== confirmPassword ? 'border-red-500 bg-red-50' : 'border-zinc-200'} rounded-2xl text-lg font-medium text-black focus:outline-none focus:border-black transition-all pr-12 placeholder:text-zinc-400`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && isFormValid) onRegister();
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            {showConfirmPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {password && confirmPassword && password !== confirmPassword && (
                        <p className="text-red-500 text-sm font-medium pl-2 animate-in fade-in slide-in-from-top-1">Passwords do not match</p>
                    )}
                    <button
                        onClick={onRegister}
                        disabled={!isFormValid}
                        className="w-full h-[52px] bg-black text-white text-xl font-bold rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center mt-2 disabled:bg-zinc-200 disabled:text-zinc-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                    </button>
                    <div className="text-center pt-2 space-y-2">
                        <p className="text-zinc-600 font-medium">
                            Already have an account? <button className="text-[#5331EA] font-bold hover:underline ml-1" onClick={() => setView('email_login')}>Login</button>
                        </p>
                        {/* <p className="text-zinc-500 text-sm">
                            Not an organizer? <button className="text-zinc-800 font-bold hover:underline ml-1" onClick={() => setView('number')}>Go back to user login</button>
                        </p> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
