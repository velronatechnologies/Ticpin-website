'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function BottomBanner() {
    return (
        <div className="px-4 md:px-10 lg:px-16 py-8">
            <div className="max-w-[1100px] mx-auto relative group">
                <Link href="/pass" className="block cursor-pointer relative rounded-[30px] overflow-hidden">
                    <Image
                        src="/ticpin banner.jpg"
                        alt="Banner"
                        width={1100}
                        height={367}
                        className="w-full h-auto rounded-[30px]"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px] rounded-[30px]">
                        <span className="text-white text-[24px] md:text-[36px] font-black tracking-[0.2em] uppercase border-4 border-white/60 px-8 py-3 rounded-[12px] bg-black/30 shadow-2xl font-[family-name:var(--font-anek-latin)]">COMING SOON</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
