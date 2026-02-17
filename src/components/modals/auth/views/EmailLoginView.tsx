'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface EmailLoginViewProps {
    onClose: () => void;
    setView: (view: any) => void;
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    handleOrganizerLogin: () => void;
    handleOrganizerGoogleLogin: () => void;
    isLoading: boolean;
    name: string;
}

export default function EmailLoginView({
    onClose,
    setView,
    email,
    setEmail,
    password,
    setPassword,
    handleOrganizerLogin,
    handleOrganizerGoogleLogin,
    isLoading,
    name
}: EmailLoginViewProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="relative h-[220px] shrink-0">
                <img src="/login/banner.jpeg" className="absolute inset-0 w-full h-full object-cover" />
                <button onClick={onClose} className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-20 bg-black/20 p-2 rounded-full backdrop-blur-sm">
                    <X size={24} />
                </button>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col items-center justify-start bg-white overflow-y-auto scrollbar-hide">
                <div className="text-center space-y-2">
                    <h3 className="text-[32px] text-zinc-900 font-bold">Organizer Login</h3>
                    <p className="text-base text-zinc-500 font-medium">Access your organizer dashboard</p>
                </div>
                <div className="w-full max-w-[500px] space-y-3">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full h-[52px] px-6 border border-zinc-200 rounded-2xl text-lg font-medium focus:outline-none focus:border-black transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && email && password && !isLoading) {
                                handleOrganizerLogin();
                            }
                        }}
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            className="w-full h-[52px] px-6 border border-zinc-200 rounded-2xl text-lg font-medium focus:outline-none focus:border-black transition-all pr-12"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && email && password && !isLoading) {
                                    handleOrganizerLogin();
                                }
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
                    <button
                        onClick={handleOrganizerLogin}
                        disabled={isLoading || !email || !password}
                        className="w-full h-[52px] bg-black text-white text-xl font-bold rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center"
                    >
                        {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Login'}
                    </button>
                    <div className="text-center pt-2 space-y-2">
                        <p className="text-zinc-600 font-medium">
                            New organizer? <button className="text-[#5331EA] font-bold hover:underline ml-1" onClick={() => setView('email_register')}>Create account</button>
                        </p>
                        <p className="text-zinc-500 text-sm">
                            Not an organizer? <button className="text-zinc-800 font-bold hover:underline ml-1" onClick={() => setView('number')}>Go back to user login</button>
                        </p>
                    </div>
                    <div className="flex items-center gap-4 my-4">
                        <div className="flex-1 h-[1px] bg-zinc-200" />
                        <span className="text-zinc-400 font-medium">OR</span>
                        <div className="flex-1 h-[1px] bg-zinc-200" />
                    </div>
                    <button
                        onClick={() => handleOrganizerGoogleLogin()}
                        className="w-full h-[52px] border border-zinc-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all font-bold"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" />
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
