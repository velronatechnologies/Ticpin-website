'use client';

import React from 'react';

interface AuthPillSwitchProps {
    value: 'email' | 'phone';
    onChange: (value: 'email' | 'phone') => void;
    labels?: { email: string; phone: string };
    className?: string;
}

export default function AuthPillSwitch({ value, onChange, labels = { email: 'Email', phone: 'Phone' }, className = '' }: AuthPillSwitchProps) {
    return (
        <div className={`flex bg-[#F2F2F2] p-1.5 rounded-full w-fit mb-8 shadow-inner ${className}`}>
            <button 
                type="button"
                onClick={() => onChange('email')} 
                className={`px-8 py-2 rounded-full font-medium transition-all ${value === 'email' ? 'bg-white text-black shadow-sm' : 'text-[#686868]'}`}
            >
                {labels.email}
            </button>
            <button 
                type="button"
                onClick={() => onChange('phone')} 
                className={`px-8 py-2 rounded-full font-medium transition-all ${value === 'phone' ? 'bg-white text-black shadow-sm' : 'text-[#686868]'}`}
            >
                {labels.phone}
            </button>
        </div>
    );
}
