'use client';

import { useParams, useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export default function BookingPage() {
    const router = useRouter();
    const params = useParams();
    const name = params?.name as string;

    const [event, setEvent] = useState<any>(null);

    useEffect(() => {
        if (!name) return;
        fetch(`/backend/api/events/${encodeURIComponent(name)}`)
            .then(r => r.json())
            .then(setEvent)
            .catch(() => {});
    }, [name]);

    const formattedDateVenue = useMemo(() => {
        if (!event) return '';
        return [
            event.date ? new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : null,
            event.time ?? null,
            event.venue_name ?? event.city ?? null,
        ].filter(Boolean).join(' | ');
    }, [event]);

    return (
        <div className="flex h-screen overflow-hidden flex-col font-[family-name:var(--font-anek-latin)]" style={{ background: 'linear-gradient(180deg, #ECE8FD 0%, #FFFFFF 100%)', zoom: '90%' }}>
            {/* Header */}
            <header className="w-full h-[60px] md:h-[80px] bg-white flex items-center justify-between px-6 md:px-10 border-b border-[#FFFFFF] shadow-sm relative z-10">
                <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push('/')}>
                    <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-[20px] md:h-[25px] w-auto" />
                </div>

                <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
                    <h1 className="text-[18px] font-semibold text-black leading-tight uppercase line-clamp-1" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        {event?.name || '—'}
                    </h1>
                    <p className="text-[13px] font-medium text-[#686868] leading-tight" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        {formattedDateVenue || '—'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-[25px] h-[25px] bg-[#E1E1E1] rounded-full flex items-center justify-center">
                        <User className="text-[#686868]" size={12} />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-[800px] mx-auto px-6 md:px-10 py-8 space-y-4 flex-grow overflow-y-auto">
                {/* Large Layout Box 1 */}
                <div
                    className="w-full h-[165px] bg-[#D9D9D9] rounded-[10px] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push(`/events/${name}/book/tickets`)}
                >
                    <span className="text-[25px] font-medium text-black text-center" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        {`{SAMPLE LAYOUT IMAGE}`}
                    </span>
                </div>

                {/* Grid for 3 Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        className="h-[165px] bg-[#D9D9D9] rounded-[10px] flex items-center justify-center px-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push(`/events/${name}/book/tickets`)}
                    >
                        <span className="text-[12px] font-medium text-black text-center" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            {`{SAMPLE LAYOUT IMAGE}`}
                        </span>
                    </div>
                    <div
                        className="h-[165px] bg-[#D9D9D9] rounded-[10px] flex items-center justify-center px-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push(`/events/${name}/book/tickets`)}
                    >
                        <span className="text-[12px] font-medium text-black text-center" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            {`{SAMPLE LAYOUT IMAGE}`}
                        </span>
                    </div>
                    <div
                        className="h-[165px] bg-[#D9D9D9] rounded-[10px] flex items-center justify-center px-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push(`/events/${name}/book/tickets`)}
                    >
                        <span className="text-[12px] font-medium text-black text-center" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            {`{SAMPLE LAYOUT IMAGE}`}
                        </span>
                    </div>
                </div>

                {/* Large Layout Box 2 */}
                <div
                    className="w-full h-[224px] bg-[#D9D9D9] rounded-[10px] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push(`/events/${name}/book/tickets`)}
                >
                    <span className="text-[15px] font-medium text-black text-center" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        {`{SAMPLE LAYOUT IMAGE}`}
                    </span>
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="w-full h-[90px] bg-[#2A2A2A] flex items-center justify-center gap-6 px-10 shrink-0">
                <span className="text-[15px] font-medium text-white uppercase" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                    {event?.category ? `${event.category}:` : 'EVENT CATEGORY:'}
                </span>
                <div className="flex items-center gap-3">
                    <button className="h-[27px] px-4 bg-white rounded-[8px] flex items-center justify-center active:scale-[0.98] transition-all">
                        <span className="text-[12px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            {event?.sub_category || 'General'}
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}
