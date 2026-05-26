'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function BottomBanner() {
    return (
        <div className="px-4 md:px-10 lg:px-16 py-8">
            <div className="max-w-[1100px] mx-auto">
                <Link href="/pass" className="block cursor-pointer">
                    <Image
                        src="/ticpin banner.jpg"
                        alt="Banner"
                        width={1100}
                        height={367}
                        className="w-full h-auto rounded-[30px]"
                    />
                </Link>
            </div>
        </div>
    );
}
