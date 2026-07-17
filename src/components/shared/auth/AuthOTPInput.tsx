'use client';

import React, { useRef, useEffect } from 'react';

interface AuthOTPInputProps {
    otp: string[];
    setOtp: (otp: string[]) => void;
    onComplete?: () => void;
    error?: boolean;
}

export default function AuthOTPInput({ otp, setOtp, onComplete, error }: AuthOTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);


    const handleChange = (index: number, value: string) => {
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length > 1) {
            const digits = cleanValue.slice(0, 6);
            setOtp(digits.split('').slice(0, 6));
            inputRefs.current[Math.min(digits.length, 5)]?.focus();
            return;
        }

        const next = [...otp];
        next[index] = cleanValue;
        setOtp(next);
        
        if (cleanValue && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter' && otp.join('').length === 6) {
            onComplete?.();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!data) return;
        
        const next = [...otp];
        data.split('').forEach((char, i) => {
            if (i < 6) next[i] = char;
        });
        setOtp(next);
        
        const nextFocus = Math.min(data.length, 5);
        inputRefs.current[nextFocus]?.focus();
    };

    return (
        <div className="flex justify-between gap-2 max-w-[340px] mx-auto" onPaste={handlePaste}>
            {otp.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-12 h-14 bg-zinc-50 border ${error ? 'border-red-500' : 'border-zinc-200'} rounded-xl text-center text-xl font-bold focus:outline-none focus:border-black transition-all`}
                />
            ))}
        </div>
    );
}
