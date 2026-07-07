'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function MobileBlocker() {
    const router = useRouter();

    const handleGoBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0d0d0e] z-[99999] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-[400px] p-10 rounded-[24px] bg-white/[0.03] backdrop-blur-md border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.5)] text-center flex flex-col items-center">
                <div className="mb-8">
                    <Image
                        src="/ticpin-logo-black.png"
                        alt="TICPIN"
                        width={120}
                        height={32}
                        className="h-8 w-auto invert brightness-0"
                        style={{ width: "auto" }}
                    />
                </div>
                
                <div className="w-16 h-16 rounded-2xl bg-[#866BFF]/10 flex items-center justify-center mb-6 animate-bounce">
                    <svg className="w-8 h-8 text-[#866BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h1 className="text-[22px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#866BFF] mb-3 uppercase tracking-tight">
                    Desktop Access Only
                </h1>
                
                <p className="text-[14px] text-[#aeaeae] leading-relaxed mb-8 max-w-[280px]">
                    You entered a page that is optimized for larger screens. Please visit us on a desktop or laptop computer to continue.
                </p>

                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={handleGoBack}
                        className="w-full py-3.5 bg-[#866BFF] hover:bg-[#7053e3] active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_12px_rgba(134,107,255,0.3)] text-center cursor-pointer"
                    >
                        Go Back
                    </button>
                    
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3.5 bg-transparent border border-white/20 hover:bg-white/5 active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 text-center cursor-pointer"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
