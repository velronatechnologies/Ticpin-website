'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { bookingApi } from '@/lib/api/booking';
import { passApi, TicpinPass } from '@/lib/api/pass';
import { useUserSession } from '@/lib/auth/user';
import { TicketSkeleton } from '@/components/ui/Skeleton';
import { Zap, Clock, User } from 'lucide-react';
import { useSlotLock } from '@/hooks/useSlotLock';

interface TicketCategory {
    name: string;
    price?: number;
    capacity?: number;
    image_url?: string;
    has_image?: boolean;
}

interface EventData {
    id: string;
    name: string;
    date?: string;
    time?: string;
    venue_name?: string;
    city?: string;
    ticket_categories?: TicketCategory[];
    price_starts_from?: number;
}

export default function TicketSelectionPage() {
    const router = useRouter();
    const params = useParams();
    const name = params?.name as string;

    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState<Record<number, number>>({});
    const [bookedMap, setBookedMap] = useState<Record<string, number>>({});
    const [coupons, setCoupons] = useState<any[]>([]);
    const [pass, setPass] = useState<TicpinPass | null>(null);
    const [usePass, setUsePass] = useState(false);
    const session = useUserSession();

    useEffect(() => {
        if (!name) return;
        setLoading(true);
        Promise.all([
            fetch(`/backend/api/events/${encodeURIComponent(name)}`, { credentials: 'include' }).then(r => r.json()),
            bookingApi.getEventAvailability(event?.id || ''),
        ]).then(([eventData, availability]) => {
            setEvent(eventData);
            setBookedMap(availability.booked ?? {});
            setLoading(false);
        }).catch(() => setLoading(false));

        if (session?.id) {
            passApi.getActivePass(session.id).then(setPass).catch(() => setPass(null));
        }
    }, [name, session?.id]);

    useEffect(() => {
        fetch(`/backend/api/coupons/event`)
            .then(r => r.json())
            .then(data => setCoupons(Array.isArray(data) ? data : []))
            .catch(() => setCoupons([]));
    }, []);

    const categories: TicketCategory[] = useMemo(() => {
        if (!event) return [];
        return event.ticket_categories && event.ticket_categories.length > 0
            ? event.ticket_categories
            : [{ name: 'General Admission', price: event.price_starts_from ?? 0 }];
    }, [event]);

    const getAvailable = (cat: TicketCategory) => {
        if (!cat.capacity || cat.capacity <= 0) return Infinity;
        const booked = bookedMap[cat.name] ?? 0;
        return Math.max(0, cat.capacity - booked);
    };

    const { lockSlot, unlockSlot, timeRemaining } = useSlotLock('event');

    const add = (i: number) => {
        const cat = categories[i];
        const avail = getAvailable(cat);
        const current = counts[i] ?? 0;
        if (current >= avail) return;
        setCounts(c => ({ ...c, [i]: current + 1 }));
    };
    
    const remove = (i: number) => {
        const current = counts[i] ?? 0;
        if (current === 0) return;
        setCounts(c => ({ ...c, [i]: current - 1 }));
    };

    const totalTickets = useMemo(() => Object.values(counts).reduce((s, v) => s + v, 0), [counts]);
    const totalPrice = useMemo(() => categories.reduce((s, cat, i) => s + (counts[i] ?? 0) * (cat.price ?? 0), 0), [categories, counts]);

    const formattedDateVenue = useMemo(() => {
        return [
            event?.date ? new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : null,
            event?.time ?? null,
            event?.venue_name ?? event?.city ?? null,
        ].filter(Boolean).join(' | ');
    }, [event]);

    if (loading) return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #ECE8FD 0%, #FFFFFF 100%)' }}>
            <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 py-20 space-y-6">
                <TicketSkeleton />
                <TicketSkeleton />
                <TicketSkeleton />
            </div>
        </div>
    );

    return (
        <div className="h-screen overflow-hidden flex flex-col font-[family-name:var(--font-anek-latin)] bg-white">
            {/* Header */}
            <header className="w-full h-[60px] md:h-[80px] bg-white flex items-center justify-between px-6 md:px-10 border-b border-[#FFFFFF] shadow-sm relative z-10">
                <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push('/')}>
                    <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-[20px] md:h-[25px] w-auto" />
                </div>

                <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
                    <h1 className="text-[18px] font-semibold text-black leading-tight uppercase line-clamp-1" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        {event?.name ?? '—'}
                    </h1>
                    <p className="text-[13px] font-medium text-[#686868] leading-tight" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        {formattedDateVenue}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-[25px] h-[25px] bg-[#E1E1E1] rounded-full flex items-center justify-center">
                        <User className="text-[#686868]" size={12} />
                    </div>
                </div>
            </header>

            {timeRemaining > 0 && Object.values(counts).some(v => v > 0) && (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-900 px-4 py-3 sticky top-[60px] md:top-[80px] z-40 flex items-center justify-between shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-amber-600 animate-pulse" />
                        <span className="font-semibold text-[13px] md:text-sm tracking-wide">
                            Tickets reserved for <span className="font-bold tabular-nums bg-amber-200 px-1.5 rounded">{Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                        </span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="w-full max-w-[1000px] mx-auto px-6 md:px-12 py-8 space-y-2 flex-grow overflow-y-auto">
                <h2 className="text-black" style={{ fontSize: '28px', fontFamily: "var(--font-anek-tamil-condensed)", fontWeight: 515, lineHeight: '38px' }}>
                    CHOOSE TICKETS
                </h2>

                {categories.map((cat, i) => {
                    const available = getAvailable(cat);
                    const isSoldOut = available === 0;
                    const current = counts[i] ?? 0;

                    return (
                        <div key={i} className={`w-full bg-white border-[0.5px] rounded-[15px] p-3.5 md:p-4 flex flex-col md:flex-row justify-between items-start relative gap-3.5 h-auto min-h-[125px] ${isSoldOut ? 'border-red-200 opacity-70' : 'border-[#AEAEAE]'}`}>
                            <div className="flex flex-col gap-1 flex-grow w-full">
                                <div className="flex flex-wrap items-center gap-x-2">
                                    <span className="text-[15px] md:text-[17px] font-semibold text-black uppercase" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        {cat.name}
                                    </span>
                                    {isSoldOut && (
                                        <span className="inline-block bg-red-100 text-red-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                            SOLD OUT
                                        </span>
                                    )}
                                </div>

                                <div className="text-[18px] md:text-[21px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                    ₹{cat.price ?? 0}
                                </div>

                                <div className="w-full h-[1px] bg-[#686868]/30"></div>

                                <div className="space-y-0.5 mt-0.5">
                                    <p className="text-[9px] md:text-[11px] font-medium text-[#686868] max-w-md" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        • This ticket grants entry to one individual only.
                                    </p>
                                    <p className="text-[9px] md:text-[11px] font-medium text-[#686868] max-w-md" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        • This is a standing section.
                                    </p>
                                    {cat.capacity && (
                                        <p className={`text-[9px] md:text-[11px] font-semibold ${available <= 10 && !isSoldOut ? 'text-orange-500 font-bold' : 'text-[#686868]'}`}>
                                            {isSoldOut
                                                ? '• No seats available'
                                                : available === Infinity
                                                    ? null
                                                    : `• ${available} seat${available === 1 ? '' : 's'} available`}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center min-w-[100px] shrink-0 md:mt-[1px]">
                                {isSoldOut ? (
                                    <div className="w-[86px] h-[38px] bg-red-100 rounded-[7px] flex items-center justify-center">
                                        <span className="text-[14px] text-red-600 font-semibold uppercase">Full</span>
                                    </div>
                                ) : current === 0 ? (
                                    /* ADD Button Box */
                                    <button
                                        onClick={() => add(i)}
                                        className="w-[86px] h-[38px] bg-[#D9D9D9] rounded-[7px] flex items-center justify-center hover:bg-[#c8c8c8] active:scale-[0.98] transition-all"
                                    >
                                        <span 
                                            className="text-[25px] text-black leading-none" 
                                            style={{ 
                                                fontFamily: "var(--font-anek-tamil-condensed)", 
                                                fontWeight: 500
                                            }}
                                        >
                                            ADD
                                        </span>
                                    </button>
                                ) : (
                                    /* Quantity Selector Box */
                                    <div className="w-[86px] h-[38px] bg-black rounded-[7px] flex items-center justify-between px-2.5 text-white">
                                        <button onClick={() => remove(i)} className="text-[22px] leading-none hover:text-[#D9D9D9] cursor-pointer active:scale-90 transition-transform flex items-center justify-center w-6 h-6">-</button>
                                        <span className="text-[18px] font-medium flex items-center justify-center" style={{ fontFamily: "var(--font-anek-tamil-condensed)" }}>{current}</span>
                                        <button onClick={() => add(i)} disabled={current >= available} className="text-[18px] leading-none hover:text-[#D9D9D9] cursor-pointer active:scale-90 transition-transform flex items-center justify-center w-6 h-6">+</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Ticpass Apply */}
                {pass && pass.benefits.events_discount_active && (
                    <div className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-[15px] p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#5B21B6]">Ticpin Pass Member</h3>
                                <p className="text-sm text-[#7C3AED]">Apply your 10% premium discount on this event</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setUsePass(!usePass)}
                            className={`px-6 h-10 rounded-xl font-bold transition-all ${
                                usePass 
                                ? 'bg-[#7C3AED] text-white' 
                                : 'bg-white text-[#7C3AED] border border-[#C4B5FD] hover:bg-[#F5F3FF]'
                            }`}
                        >
                            {usePass ? 'Discount Applied' : 'Apply Discount'}
                        </button>
                    </div>
                )}
            </main>

            {/* Sticky Footer */}
            <footer className="w-full h-[70px] md:h-[90px] bg-[#2A2A2A] shrink-0 flex items-center justify-between px-6 md:px-10 z-50">
                <div className="flex flex-col justify-center">
                    <span className="text-[20px] md:text-[26px] font-medium text-white" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[12px] md:text-[14px] font-medium text-white opacity-80 uppercase" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        {totalTickets} {totalTickets === 1 ? 'TICKET' : 'TICKETS'}
                    </span>
                </div>

                <button
                    disabled={totalTickets === 0}
                    onClick={() => {
                        const cart = {
                            eventId: event?.id,
                            eventName: event?.name,
                            city: event?.city,
                            tickets: categories.map((cat, i) => ({
                                name: cat.name,
                                price: cat.price ?? 0,
                                quantity: counts[i] ?? 0
                            })).filter(t => t.quantity > 0),
                            totalPrice,
                            use_pass: usePass,
                            pass_id: pass?.id
                        };
                        sessionStorage.setItem('ticpin_cart', JSON.stringify(cart));
                        router.push(`/events/${name}/book/review`);
                    }}
                    className={`w-[160px] md:w-[140px] h-[55px] md:h-[55px] bg-white rounded-[10px] flex items-center justify-center transition-all ${totalTickets === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-[0.98]'}`}
                >
                    <span
                        style={{
                            fontFamily: "var(--font-anek-tamil-condensed)",
                            fontWeight: 500
                        }}
                        className="text-[18px] md:text-[24px] text-black uppercase leading-none"
                    >
                        ADD TO CART
                    </span>
                </button>
            </footer>
        </div>
    );
}
