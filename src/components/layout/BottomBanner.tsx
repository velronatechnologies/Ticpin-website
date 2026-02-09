'use client';

import Image from 'next/image';

export default function BottomBanner() {
    return (
        <div className="px-4 md:px-10 lg:px-16 py-8">
            <div className="max-w-[1100px] mx-auto">
                <Image
                    src="/ticpin banner.jpg"
                    alt="Banner"
                    width={1366}
                    height={455}
                    className="w-full h-auto rounded-[30px]"
                />
            </div>
        </div>
    );
}
