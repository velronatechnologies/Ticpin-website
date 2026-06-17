'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QRVerifyPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#f5f7fb] text-black font-sans flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 text-center shadow-lg max-w-md w-full flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-10 h-10 border-4 border-[#5331EA] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-bold text-sm">Redirecting to Ticpin...</p>
            </div>
        </div>
    );
}
