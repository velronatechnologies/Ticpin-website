'use client';

import { useRouter } from 'next/navigation';

interface BookingCardProps {
    venue: any;
}

export default function BookingCard({ venue }: BookingCardProps) {
    const router = useRouter();

    return (
        <div className="w-full md:w-[392px] h-auto bg-white border border-[#d9d9d9] rounded-[24px] shadow-sm p-[24px] flex flex-col overflow-visible">
            {/* Title */}
            <h3 className="text-[32px] font-medium text-black leading-normal tracking-tight mb-3">Book a table</h3>
            <p className="text-[16px] text-zinc-500 mb-6">{venue?.name}</p>

            <p className="text-[15px] text-zinc-600 mb-6">
                Select your date, time, and available dining offers on the booking page.
            </p>

            {/* Book Button */}
            <button
                onClick={() => router.push(`/dining/venue/${venue?.id}/booking`)}
                className="w-full h-[48px] bg-black text-white rounded-[12px] text-[18px] font-semibold flex items-center justify-center active:scale-[0.98]"
            >
                Book a table
            </button>
        </div>
    );
}

