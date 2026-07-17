'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

// Load MobileEventDetails without SSR to prevent hydration mismatch.
// The component uses Date.now() in booking-status useMemo; the server and
// client timestamps diverge, causing React to unmount the whole tree
// (white screen on hard refresh). Skipping SSR here solves it cleanly.
const MobileEventDetails = dynamic(
    () => import('@/components/mobile/MobileEventDetails'),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen bg-[#EAEAEA] flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-[#866BFF] border-t-transparent animate-spin" />
            </div>
        )
    }
);

type Props = ComponentProps<typeof MobileEventDetails>;

export default function MobileEventDetailsClient(props: Props) {
    return <MobileEventDetails {...props} />;
}
