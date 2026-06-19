'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/lib/auth/user';

interface EventCardProps {
    id: string;
    name: string;
    date?: string;
    time?: string;
    location?: string;
    venue_name?: string;
    city?: string;
    portrait_image_url?: string;
    price_starts_from?: number;
    scale: number;
    opacity: number;
}

function formatTime(raw?: string): string {
    if (!raw || !raw.includes(':')) return '';
    const [hStr, mStr] = raw.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return '';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const mm = m.toString().padStart(2, '0');
    return `${h12}:${mm} ${ampm}`;
}

export default function MobileEventCard({
    id, name, date, time, location, venue_name, city,
    portrait_image_url, price_starts_from, scale, opacity
}: EventCardProps) {
    const router = useRouter();
    const session = useUserSession();
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (session?.id) {
            fetch(`/backend/api/user/likes/${id}`, { credentials: 'include' })
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => setIsLiked(data.liked))
                .catch(() => {
                    try {
                        const liked: { id: string }[] = JSON.parse(localStorage.getItem('liked_events') || '[]');
                        setIsLiked(liked.some(e => e.id === id));
                    } catch { /* ignore */ }
                });
        } else {
            try {
                const liked: { id: string }[] = JSON.parse(localStorage.getItem('liked_events') || '[]');
                setIsLiked(liked.some(e => e.id === id));
            } catch { /* ignore */ }
        }
    }, [id, session?.id]);

    const toggleLike = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!session?.id) {
            localStorage.setItem('pending_like_event_id', id);
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        try {
            const res = await fetch(`/backend/api/user/likes/${id}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setIsLiked(data.liked);

                try {
                    let liked: any[] = JSON.parse(localStorage.getItem('liked_events') || '[]');
                    if (!data.liked) {
                        liked = liked.filter((le: any) => le.id !== id);
                    } else {
                        if (!liked.some((le: any) => le.id === id)) {
                            liked.push({ id, name, date, time, price_starts_from, portrait_image_url, venue_name, city });
                        }
                    }
                    localStorage.setItem('liked_events', JSON.stringify(liked));
                } catch { /* ignore */ }
            }
        } catch (err) {
            console.error('Failed to toggle like on backend:', err);
        }
    }, [id, name, date, time, price_starts_from, portrait_image_url, venue_name, city, session?.id]);

    const formattedDate = (() => {
        if (!date) return 'Date TBA';
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return date;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const tStr = formatTime(time);
            return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}${tStr ? ` | ${tStr}` : ''}`;
        } catch { return date; }
    })();

    return (
        <div
            onClick={() => router.push(`/events/${encodeURIComponent(name)}`)}
            className="flex-shrink-0 w-[280px] max-w-[85vw] bg-white rounded-[20px] border-[0.5px] border-[#AEAEAE] overflow-hidden snap-center snap-always transition-all duration-150 ease-out origin-center cursor-pointer active:scale-95"
            style={{ transform: `scale(${scale})`, opacity }}
        >
            {/* Poster */}
            <div className="w-full aspect-[280/390] relative overflow-hidden bg-[#110D2C]">
                {portrait_image_url ? (
                    <img src={portrait_image_url} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full p-6 flex flex-col items-center justify-center relative">
                        <div className="absolute inset-0 opacity-40">
                            <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_30%_30%,#DFFF00_0%,transparent_40%),radial-gradient(circle_at_70%_70%,#5331EA_0%,transparent_50%),radial-gradient(circle_at_90%_20%,#DFFF00_0%,transparent_30%)] blur-[80px]" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h1 className="text-[36px] font-black text-[#DFFF00] italic leading-[0.8] tracking-tighter uppercase"
                                style={{
                                    fontFamily: "var(--font-anek-tamil-condensed), sans-serif",
                                    transform: 'skewX(-16deg) scaleY(1.3)',
                                    textShadow: '0 0 15px rgba(223, 255, 0, 0.5)'
                                }}>
                                THE TICPIN<br />PLAY<br />FESTIVAL
                            </h1>
                            <div className="flex items-center gap-2.5 w-full max-w-[180px] my-6 relative">
                                <div className="h-[0.5px] bg-gradient-to-r from-transparent via-white/50 to-white flex-1" />
                                <div className="w-[8px] h-[8px] bg-white rotate-45 border-[0.5px] border-white/20 shadow-[0_0_6px_white]" />
                                <div className="h-[0.5px] bg-gradient-to-l from-transparent via-white/50 to-white flex-1" />
                            </div>
                            <p className="text-[20px] font-light text-white italic tracking-tight leading-tight opacity-90" style={{ fontFamily: 'serif' }}>GET UP TO</p>
                            <p className="text-[34px] font-bold text-white leading-[0.85] mt-1" style={{ fontFamily: 'serif' }}>50% off*</p>
                        </div>
                    </div>
                )}

                {/* Like button — fire icon, red when liked */}
                {/* <button
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-white active:scale-90 transition-transform z-10"
                    onClick={toggleLike}
                >
                    <img
                        src="/mobile_icons/fluent_speaker-2-28-regular.svg"
                        alt="Like"
                        className="w-[20px] h-[20px] transition-all"
                        style={{
                            filter: isLiked
                                ? 'invert(27%) sepia(100%) saturate(7000%) hue-rotate(0deg) brightness(95%) contrast(110%)'
                                : 'none'
                        }}
                    />
                </button> */}
            </div>

            {/* Bottom Details */}
            <div className="p-5 relative bg-white">
                <p className="text-[12px] font-medium text-[#5331EA] mb-1.5 uppercase tracking-wide">
                    {formattedDate}
                </p>
                <h3 className={`text-[20px] font-medium leading-[1.1] tracking-tight line-clamp-2 transition-colors text-black pr-12`}>
                    {name || 'Event Name'}
                </h3>
                <p className="text-[12px] font-regular text-[#8E8E8E] mt-2  tracking-wider truncate">
                    {venue_name || location || city || 'Location TBA'}
                </p>
                <p className="text-[12px] font-regular text-[#8E8E8E] mt-0.5 uppercase tracking-wider">
                    {price_starts_from ? `Starts at ₹${price_starts_from}` : 'Price TBA'}
                </p>

                {/* Fire badge — red bg when liked */}
                <button
                    onClick={toggleLike}
                    className={`absolute top-5 right-5 w-10 h-10 rounded-[12px] flex items-center justify-center mt-[-10px] transition-colors cursor-pointer z-10 active:scale-90 ${isLiked ? 'bg-red-500' : 'bg-[#EFEFEF]'}`}
                >
                    <img
                        src="/mobile_icons/Vector 2.svg"
                        alt="Hot"
                        className="w-[20px] h-[20px] object-contain transition-all"
                        style={{ filter: isLiked ? 'brightness(0) invert(1)' : 'none' }}
                    />
                </button>
            </div>
        </div>
    );
}
