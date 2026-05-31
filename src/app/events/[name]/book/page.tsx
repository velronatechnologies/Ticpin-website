'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { bookingApi } from '@/lib/api/booking';
import { passApi, TicpinPass } from '@/lib/api/pass';
import { useUserSession, getUserSession } from '@/lib/auth/user';
import { TicketSkeleton } from '@/components/ui/Skeleton';
import { Zap, Clock, User } from 'lucide-react';
import { useReservationStore } from '@/store/useReservationStore';
import AuthModal from '@/components/modals/AuthModal';
import { toast } from '@/components/ui/Toast';
import ProfileDrawer from '@/components/layout/Navbar/ProfileDrawer';

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
    ticket_layout_type?: string;
    ticket_open_date?: string;
    ticket_close_date?: string;
    event_end_date?: string;
    is_sales_paused?: boolean;
    is_canceled?: boolean;
}

const isBookingClosed = (evt: EventData) => {
    if (!evt) return false;
    if (evt.is_sales_paused || evt.is_canceled) return true;
    if (evt.ticket_close_date) {
        const closeDate = new Date(evt.ticket_close_date);
        if (!isNaN(closeDate.getTime()) && closeDate.getTime() < Date.now()) {
            return true;
        }
    }
    if (evt.event_end_date) {
        const endDate = new Date(evt.event_end_date);
        if (!isNaN(endDate.getTime()) && endDate.getTime() < Date.now()) {
            return true;
        }
    }
    return false;
};

export default function TicketSelectionPage() {
    const router = useRouter();
    const params = useParams();
    const name = params?.name as string;

    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState<Record<number, number>>({});
    const [initialCounts, setInitialCounts] = useState<Record<number, number>>({});
    const [bookedMap, setBookedMap] = useState<Record<string, number>>({});
    const [coupons, setCoupons] = useState<any[]>([]);
    const [pass, setPass] = useState<TicpinPass | null>(null);
    const [usePass, setUsePass] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const isReservingRef = useRef(false);
    const [isCreatingReservation, setIsCreatingReservation] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [showVisualMap, setShowVisualMap] = useState(false);
    const [selectedZoneName, setSelectedZoneName] = useState<string | null>(null);
    
    const session = useUserSession();
    const reservationStore = useReservationStore();

    const hasSelectionChanged = useMemo(() => {
        const allKeys = Array.from(new Set([...Object.keys(counts).map(Number), ...Object.keys(initialCounts).map(Number)]));
        for (const key of allKeys) {
            const currentVal = counts[key] ?? 0;
            const initialVal = initialCounts[key] ?? 0;
            if (currentVal !== initialVal) {
                return true;
            }
        }
        return false;
    }, [counts, initialCounts]);

    useEffect(() => {
        if (!event) return;
        const hasImageLayout = event.ticket_categories?.some(cat => cat.has_image === true) ?? false;
        if ((event as any).ticket_layout_type === 'image' || hasImageLayout) {
            setShowVisualMap(true);
        } else {
            setShowVisualMap(false);
        }
    }, [event]);

    const isZoneSelected = (zoneKey: string) => {
        return selectedZoneName === zoneKey;
    };

    const handleZoneClick = (zoneKey: string) => {
        setSelectedZoneName(zoneKey);
        const foundIndex = categories.findIndex(c => c.name.toUpperCase().includes(zoneKey.toUpperCase()));
        if (foundIndex === -1 && categories.length > 0) {
            toast.error(`Category "${zoneKey}" not found in event tickets. Showing first available category.`);
        }
    };

    useEffect(() => {
        const activeSession = getUserSession();
        if (!activeSession) {
            setShowAuthModal(true);
        }
        setIsAuthChecking(false);
    }, []);

    const handleAuthModalClose = () => {
        setShowAuthModal(false);
        const activeSession = getUserSession();
        if (!activeSession) {
            router.push(`/events/${name}`);
        }
    };

    useEffect(() => {
        if (!name) return;
        setLoading(true);

        fetch(`/backend/api/events/${encodeURIComponent(name)}`, { credentials: 'include' })
            .then(r => r.json())
            .then(async (eventData) => {
                if (isBookingClosed(eventData)) {
                    toast.error('Booking for this event is closed!');
                    router.push(`/events/${name}`);
                    return;
                }
                setEvent(eventData);

                // If user came back from review intentionally, start fresh selection.
                const forceNewSelection = sessionStorage.getItem('ticpin_force_new_selection') === '1';
                if (forceNewSelection) {
                    sessionStorage.removeItem('ticpin_force_new_selection');
                    reservationStore.clearReservation();
                    sessionStorage.removeItem('ticpin_cart');
                    const availability = await bookingApi.getEventAvailability(eventData.id);
                    setBookedMap(availability.booked ?? {});
                    setLoading(false);
                    return;
                }

                // 1. Check Zustand store or sessionStorage cart first
                const cartData = sessionStorage.getItem('ticpin_cart');
                const hasStoreRes = reservationStore.hasActiveReservation() && reservationStore.eventId === eventData.id;
                let parsedCart: any = null;
                if (cartData) {
                    try {
                        parsedCart = JSON.parse(cartData);
                    } catch (e) {
                        console.error('Failed to parse cart data:', e);
                    }
                }

                if (hasStoreRes || (parsedCart && parsedCart.eventId === eventData.id)) {
                    if (parsedCart && parsedCart.tickets) {
                        // If store doesn't have it but session does, restore store first
                        if (!hasStoreRes) {
                            const expiresAt = sessionStorage.getItem('ticpin_expires_at') || new Date(Date.now() + 10 * 60 * 1000).toISOString();
                            const resId = sessionStorage.getItem('ticpin_reservation_id') || '';
                            reservationStore.setReservation(
                                resId,
                                eventData.id,
                                parsedCart.tickets,
                                expiresAt
                            );
                        }

                        const initialCountsMap: Record<number, number> = {};
                        parsedCart.tickets.forEach((ticket: any) => {
                            const index = eventData.ticket_categories?.findIndex((c: any) => c.name.trim().toLowerCase() === ticket.name.trim().toLowerCase());
                            if (index !== undefined && index !== -1) {
                                initialCountsMap[index] = ticket.quantity;
                            }
                        });
                        setCounts(initialCountsMap);
                        setInitialCounts(initialCountsMap);

                        // Auto-select the first zone with non-zero tickets to display in visual map panel
                        const firstActiveIndex = Object.keys(initialCountsMap).find(idx => initialCountsMap[Number(idx)] > 0);
                        if (firstActiveIndex !== undefined) {
                            const cat = eventData.ticket_categories?.[Number(firstActiveIndex)];
                            if (cat) {
                                setSelectedZoneName(cat.name);
                            }
                        }
                    }
                    const availability = await bookingApi.getEventAvailability(eventData.id);
                    setBookedMap(availability.booked ?? {});
                    setLoading(false);
                    return;
                }

                // 2. Check backend for active reservation if logged in
                if (session?.id) {
                    try {
                        const activeRes = await bookingApi.checkActiveReservation(eventData.id, session.id);
                        if (activeRes.active) {
                            const mappedTickets = activeRes.tickets.map((t: any) => ({
                                name: t.category,
                                price: eventData.ticket_categories?.find((c: any) => c.name.trim().toLowerCase() === t.category.trim().toLowerCase())?.price ?? eventData.price_starts_from ?? 0,
                                quantity: t.quantity
                            }));

                            reservationStore.setReservation(
                                activeRes.reservation_id,
                                activeRes.event_id,
                                mappedTickets,
                                activeRes.expires_at
                            );

                            const initialCountsMap: Record<number, number> = {};
                            mappedTickets.forEach((ticket: any) => {
                                const index = eventData.ticket_categories?.findIndex((c: any) => c.name.trim().toLowerCase() === ticket.name.trim().toLowerCase());
                                if (index !== undefined && index !== -1) {
                                    initialCountsMap[index] = ticket.quantity;
                                }
                            });
                            setCounts(initialCountsMap);
                            setInitialCounts(initialCountsMap);

                            // Auto-select the first zone with non-zero tickets to display in visual map panel
                            const firstActiveIndex = Object.keys(initialCountsMap).find(idx => initialCountsMap[Number(idx)] > 0);
                            if (firstActiveIndex !== undefined) {
                                const cat = eventData.ticket_categories?.[Number(firstActiveIndex)];
                                if (cat) {
                                    setSelectedZoneName(cat.name);
                                }
                            }

                            const availability = await bookingApi.getEventAvailability(eventData.id);
                            setBookedMap(availability.booked ?? {});
                            setLoading(false);
                            return;
                        }
                    } catch (e) {
                        console.error('Error checking active reservation:', e);
                    }
                }

                // 3. No active reservation, load availability
                const availability = await bookingApi.getEventAvailability(eventData.id);
                setBookedMap(availability.booked ?? {});
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });

        if (session?.id) {
            passApi.getActivePass(session.id).then(setPass).catch(() => setPass(null));
        }
    }, [name, session?.id, router]);

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
        const venueFirstSegment = event?.venue_address
            ? event.venue_address.split(',')[0].trim()
            : '';
        const venuePart = venueFirstSegment || event?.venue_name;
        const locationPart = venuePart && event?.city
            ? `${venuePart} | ${event.city}`
            : (venuePart || event?.city || null);

        return [
            event?.date ? new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : null,
            event?.time ?? null,
            locationPart,
        ].filter(Boolean).join(' | ');
    }, [event]);

    if (loading || isAuthChecking || (!session?.id && !getUserSession())) return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #ECE8FD 0%, #FFFFFF 100%)' }}>
            <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 py-20 space-y-6">
                <TicketSkeleton />
                <TicketSkeleton />
                <TicketSkeleton />
            </div>
            <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} />
        </div>
    );

    const getZonePrice = (zoneName: string) => {
        const cat = categories.find(c => {
            const cName = c.name.toUpperCase();
            const zName = zoneName.toUpperCase();
            return cName.includes(zName) || zName.includes(cName) || 
                   (zName === 'VIP' && cName === 'VIP PASS') ||
                   (zName === 'PLATINUM' && cName === 'PLATINUM PASS') ||
                   (zName === 'GOLD' && cName === 'GOLD PASS') ||
                   (zName === 'MIP' && cName === 'MIP PASS');
        });
        return cat ? `₹${cat.price}` : '';
    };

    const getZoneQuantity = (zoneName: string) => {
        const foundIndex = categories.findIndex(c => {
            const cName = c.name.toUpperCase();
            const zName = zoneName.toUpperCase();
            return cName.includes(zName) || zName.includes(cName) || 
                   (zName === 'VIP' && cName === 'VIP PASS') ||
                   (zName === 'PLATINUM' && cName === 'PLATINUM PASS') ||
                   (zName === 'GOLD' && cName === 'GOLD PASS') ||
                   (zName === 'MIP' && cName === 'MIP PASS');
        });
        if (foundIndex !== -1) {
            return counts[foundIndex] ?? 0;
        }
        return 0;
    };

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
                    <div 
                        className="w-[38px] h-[38px] md:w-[44px] md:h-[44px] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border border-[#E5E7EB] hover:scale-[1.05] active:scale-[0.98]"
                        onClick={() => {
                            if (!session?.id) {
                                setShowAuthModal(true);
                            } else {
                                setIsProfileDrawerOpen(true);
                            }
                        }}
                    >
                        <User className="text-[#4B5563]" size={20} />
                    </div>
                </div>
            </header>



            {/* Main Content */}
            <main className="w-full max-w-[1000px] mx-auto px-6 md:px-12 py-3 flex-grow flex flex-col items-center justify-start overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex items-center justify-center mb-1 text-center w-full">
                    <h2 className="text-black uppercase tracking-wider" style={{ fontSize: '26px', fontFamily: "var(--font-anek-tamil-condensed)", fontWeight: 515, lineHeight: '32px' }}>
                        CHOOSE TICKETS
                    </h2>
                </div>

                {showVisualMap ? (
                    /* Premium Seat/Layout Map View */
                    <div className="w-full max-w-[580px] mx-auto bg-white border border-[#AEAEAE]/50 rounded-[18px] p-6 py-5 shadow-sm flex flex-col items-center select-none shrink-0">
                        <div className="flex flex-col items-center mb-4">
                            <h3 className="text-[24px] font-black tracking-wider text-black mb-0.5" style={{ fontFamily: 'Anek Latin' }}>TICPIN</h3>
                            <p className="text-[13px] text-[#686868] font-medium italic">~ For {event?.name ?? 'Event'}</p>
                        </div>

                        {/* Visual Sections Grid */}
                        <div className="w-full flex flex-col gap-3 items-center">
                            {/* STAGE Box */}
                            <div className="w-full h-[46px] bg-[#E1E1E1] border border-[#AEAEAE] rounded-[10px] flex items-center justify-center text-zinc-500 font-bold uppercase text-[15px] tracking-widest shadow-sm">
                                STAGE
                            </div>

                            {/* VIP FANPIT & RAMP Row */}
                            <div className="w-full grid grid-cols-10 gap-3">
                                <button 
                                    onClick={() => handleZoneClick('VIP FANPIT')}
                                    className={`col-span-4 h-[60px] rounded-[10px] border flex flex-col items-center justify-center transition-all duration-300 font-bold text-[12px] hover:scale-[1.03] hover:shadow-md cursor-pointer ${
                                        isZoneSelected('VIP FANPIT') ? 'border-green-600 border-2 ring-2 ring-green-400 bg-[#8AD18A]/30 font-black' : 'border-green-600 bg-[#8AD18A]/20 hover:bg-[#8AD18A]/30'
                                    }`}
                                    style={{ color: '#006400' }}
                                >
                                    <span className="flex items-center gap-1">
                                        VIP FANPIT {getZonePrice('VIP FANPIT')}
                                        {getZoneQuantity('VIP FANPIT') > 0 && (
                                            <span className="bg-green-700 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black">
                                                {getZoneQuantity('VIP FANPIT')}
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-[10px] font-normal opacity-80">(Standing)</span>
                                </button>
                                
                                <button 
                                    onClick={() => handleZoneClick('RAMP')}
                                    className={`col-span-2 h-[60px] rounded-[10px] border flex flex-col items-center justify-center transition-all duration-300 font-bold text-[12px] hover:scale-[1.03] hover:shadow-md cursor-pointer ${
                                        isZoneSelected('RAMP') ? 'border-red-600 border-2 ring-2 ring-red-400 bg-[#D68A8A]/30 font-black' : 'border-red-600 bg-[#D68A8A]/20 hover:bg-[#D68A8A]/30'
                                    }`}
                                    style={{ color: '#8B0000' }}
                                >
                                    <span className="flex items-center gap-1">
                                        RAMP
                                        {getZoneQuantity('RAMP') > 0 && (
                                            <span className="bg-red-700 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black">
                                                {getZoneQuantity('RAMP')}
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-[10px] font-bold opacity-80">{getZonePrice('RAMP')}</span>
                                </button>

                                <button 
                                    onClick={() => handleZoneClick('VIP FANPIT')}
                                    className={`col-span-4 h-[60px] rounded-[10px] border flex flex-col items-center justify-center transition-all duration-300 font-bold text-[12px] hover:scale-[1.03] hover:shadow-md cursor-pointer ${
                                        isZoneSelected('VIP FANPIT') ? 'border-green-600 border-2 ring-2 ring-green-400 bg-[#8AD18A]/30 font-black' : 'border-green-600 bg-[#8AD18A]/20 hover:bg-[#8AD18A]/30'
                                    }`}
                                    style={{ color: '#006400' }}
                                >
                                    <span className="flex items-center gap-1">
                                        VIP FANPIT {getZonePrice('VIP FANPIT')}
                                        {getZoneQuantity('VIP FANPIT') > 0 && (
                                            <span className="bg-green-700 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black">
                                                {getZoneQuantity('VIP FANPIT')}
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-[10px] font-normal opacity-80">(Standing)</span>
                                </button>
                            </div>

                            {/* MIP Row */}
                            <button 
                                onClick={() => handleZoneClick('MIP')}
                                className={`w-full h-[52px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[14px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                                    isZoneSelected('MIP') ? 'border-[#8B008B] border-2 ring-2 ring-pink-400 bg-[#DFA3CF]/30 font-black' : 'border-[#8B008B] bg-[#DFA3CF]/20 hover:bg-[#DFA3CF]/30'
                                }`}
                                style={{ color: '#8B008B' }}
                            >
                                <span>MIP {getZonePrice('MIP')}</span>
                                {getZoneQuantity('MIP') > 0 && (
                                    <span className="bg-[#8B008B] text-white rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-black">
                                        {getZoneQuantity('MIP')}
                                    </span>
                                )}
                                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-3h1v-6H3v6h1zM2 10V6h20v4h-2V6H4v4H2z"/></svg>
                            </button>

                            {/* VIP Row */}
                            <div className="w-full grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleZoneClick('VIP')}
                                    className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                                        isZoneSelected('VIP') ? 'border-[#4B0082] border-2 ring-2 ring-purple-400 bg-[#B0A8E3]/30 font-black' : 'border-[#4B0082] bg-[#B0A8E3]/20 hover:bg-[#B0A8E3]/30'
                                    }`}
                                    style={{ color: '#4B0082' }}
                                >
                                    <span>VIP {getZonePrice('VIP')}</span>
                                    {getZoneQuantity('VIP') > 0 && (
                                        <span className="bg-[#4B0082] text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black">
                                            {getZoneQuantity('VIP')}
                                        </span>
                                    )}
                                    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-3h1v-6H3v6h1zM2 10V6h20v4h-2V6H4v4H2z"/></svg>
                                </button>
                                <button 
                                    onClick={() => handleZoneClick('VIP')}
                                    className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                                        isZoneSelected('VIP') ? 'border-[#4B0082] border-2 ring-2 ring-purple-400 bg-[#B0A8E3]/30 font-black' : 'border-[#4B0082] bg-[#B0A8E3]/20 hover:bg-[#B0A8E3]/30'
                                    }`}
                                    style={{ color: '#4B0082' }}
                                >
                                    <span>VIP {getZonePrice('VIP')}</span>
                                    {getZoneQuantity('VIP') > 0 && (
                                        <span className="bg-[#4B0082] text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black">
                                            {getZoneQuantity('VIP')}
                                        </span>
                                    )}
                                    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-3h1v-6H3v6h1zM2 10V6h20v4h-2V6H4v4H2z"/></svg>
                                </button>
                            </div>

                            {/* PLATINUM LEFT & RIGHT Row */}
                            <div className="w-full grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleZoneClick('PLATINUM')}
                                    className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                                        isZoneSelected('PLATINUM') ? 'border-[#008B8B] border-2 ring-2 ring-sky-400 bg-[#97CBE0]/30 font-black' : 'border-[#008B8B] bg-[#97CBE0]/20 hover:bg-[#97CBE0]/30'
                                    }`}
                                    style={{ color: '#008B8B' }}
                                >
                                    <span>PLATINUM LEFT {getZonePrice('PLATINUM')}</span>
                                    {getZoneQuantity('PLATINUM') > 0 && (
                                        <span className="bg-[#008B8B] text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black">
                                            {getZoneQuantity('PLATINUM')}
                                        </span>
                                    )}
                                    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-3h1v-6H3v6h1zM2 10V6h20v4h-2V6H4v4H2z"/></svg>
                                </button>
                                <button 
                                    onClick={() => handleZoneClick('PLATINUM')}
                                    className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                                        isZoneSelected('PLATINUM') ? 'border-[#008B8B] border-2 ring-2 ring-sky-400 bg-[#97CBE0]/30 font-black' : 'border-[#008B8B] bg-[#97CBE0]/20 hover:bg-[#97CBE0]/30'
                                    }`}
                                    style={{ color: '#008B8B' }}
                                >
                                    <span>PLATINUM RIGHT {getZonePrice('PLATINUM')}</span>
                                    {getZoneQuantity('PLATINUM') > 0 && (
                                        <span className="bg-[#008B8B] text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black">
                                            {getZoneQuantity('PLATINUM')}
                                        </span>
                                    )}
                                    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-3h1v-6H3v6h1zM2 10V6h20v4h-2V6H4v4H2z"/></svg>
                                </button>
                            </div>

                            {/* GOLD LEFT & RIGHT Row */}
                            <div className="w-full grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleZoneClick('GOLD')}
                                    className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                                        isZoneSelected('GOLD') ? 'border-[#8B8000] border-2 ring-2 ring-yellow-400 bg-[#DDD69B]/30 font-black' : 'border-[#8B8000] bg-[#DDD69B]/20 hover:bg-[#DDD69B]/30'
                                    }`}
                                    style={{ color: '#8B8000' }}
                                >
                                    <span>GOLD LEFT {getZonePrice('GOLD')}</span>
                                    {getZoneQuantity('GOLD') > 0 && (
                                        <span className="bg-[#8B8000] text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black">
                                            {getZoneQuantity('GOLD')}
                                        </span>
                                    )}
                                    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-3h1v-6H3v6h1zM2 10V6h20v4h-2V6H4v4H2z"/></svg>
                                </button>
                                <button 
                                    onClick={() => handleZoneClick('GOLD')}
                                    className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                                        isZoneSelected('GOLD') ? 'border-[#8B8000] border-2 ring-2 ring-yellow-400 bg-[#DDD69B]/30 font-black' : 'border-[#8B8000] bg-[#DDD69B]/20 hover:bg-[#DDD69B]/30'
                                    }`}
                                    style={{ color: '#8B8000' }}
                                >
                                    <span>GOLD RIGHT {getZonePrice('GOLD')}</span>
                                    {getZoneQuantity('GOLD') > 0 && (
                                        <span className="bg-[#8B8000] text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black">
                                            {getZoneQuantity('GOLD')}
                                        </span>
                                    )}
                                    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-3h1v-6H3v6h1zM2 10V6h20v4h-2V6H4v4H2z"/></svg>
                                </button>
                            </div>
                        </div>

                        {/* Interactive Selection Panel */}
                        {selectedZoneName ? (
                            <div className="w-full mt-3 bg-[#FAF6F6] border border-[#AEAEAE]/40 rounded-[12px] p-3 animate-in slide-in-from-bottom-2 duration-200">
                                {(() => {
                                    const foundIndex = categories.findIndex(c => c.name.toUpperCase().includes(selectedZoneName.toUpperCase()));
                                    const actualIndex = foundIndex !== -1 ? foundIndex : 0;
                                    const cat = categories[actualIndex];
                                    const available = getAvailable(cat);
                                    const isSoldOut = available === 0;
                                    const current = counts[actualIndex] ?? 0;

                                    return (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Selected Section</span>
                                                    <h4 className="text-[16px] font-semibold text-black uppercase" style={{ fontFamily: 'var(--font-anek-latin)' }}>{cat.name}</h4>
                                                </div>
                                                <span className="text-[18px] font-black text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>₹{cat.price ?? 0}</span>
                                            </div>
                                            <div className="w-full h-[0.5px] bg-zinc-200"></div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-[#686868] font-medium" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                    {isSoldOut 
                                                        ? 'No seats available' 
                                                        : available === Infinity 
                                                            ? 'Seats available' 
                                                            : `${available} seat${available === 1 ? '' : 's'} available`}
                                                </p>

                                                <div className="flex flex-col items-center justify-center shrink-0">
                                                    {isSoldOut ? (
                                                        <div className="w-[86px] h-[34px] bg-red-100 rounded-[5px] flex items-center justify-center">
                                                            <span className="text-[12px] text-red-600 font-semibold uppercase">Full</span>
                                                        </div>
                                                    ) : current === 0 ? (
                                                        <button
                                                            onClick={() => add(actualIndex)}
                                                            className="w-[86px] h-[34px] bg-black text-white rounded-[5px] flex items-center justify-center hover:bg-zinc-800 active:scale-[0.98] transition-all font-bold uppercase tracking-wider text-[12px]"
                                                        >
                                                            ADD
                                                        </button>
                                                    ) : (
                                                        <div className="w-[86px] h-[34px] bg-black rounded-[5px] flex items-center justify-between px-2 text-white">
                                                            <button onClick={() => remove(actualIndex)} className="text-[18px] leading-none hover:text-[#D9D9D9] cursor-pointer active:scale-90 transition-transform">-</button>
                                                            <span className="text-[14px] font-bold">{current}</span>
                                                            <button onClick={() => add(actualIndex)} disabled={current >= available} className="text-[16px] leading-none hover:text-[#D9D9D9] cursor-pointer active:scale-90 transition-transform">+</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="w-full mt-3 bg-zinc-50 border border-dashed border-zinc-300 rounded-[12px] p-3 text-center text-[#686868] font-semibold text-xs">
                                Click on any section in the visual layout above to select tickets!
                            </div>
                        )}

                        <p className="text-[10px] text-[#686868] mt-3 font-medium">For support mail us at events@ticpin.in</p>
                    </div>
                ) : (
                    /* Default List View */
                    <div className="space-y-4">
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
                    </div>
                )}

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
                    disabled={totalTickets === 0 || isCreatingReservation}
                    onClick={async () => {
                        if (!session?.id) {
                            setShowAuthModal(true);
                            return;
                        }

                        // If selection has not changed, just route back to review directly!
                        if (!hasSelectionChanged) {
                            router.push(`/events/${name}/book/review`);
                            return;
                        }

                        if (isReservingRef.current) return;
                        isReservingRef.current = true;
                        setIsCreatingReservation(true);
                        try {
                            const ticketReqs = categories.map((cat, i) => ({
                                category: cat.name,
                                quantity: counts[i] ?? 0
                            })).filter(t => t.quantity > 0);

                            // Call backend API to create/update reservation lock
                            const res = await bookingApi.createReservation(event!.id, session.id, ticketReqs, reservationStore.reservationId || undefined);

                            if (res.success) {
                                // Save to Zustand store
                                reservationStore.setReservation(
                                    res.reservation_id,
                                    event!.id,
                                    categories.map((cat, i) => ({
                                        name: cat.name,
                                        price: cat.price ?? 0,
                                        quantity: counts[i] ?? 0
                                    })).filter(t => t.quantity > 0),
                                    res.expires_at
                                );

                                // Set cart in sessionStorage for Review page UI
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
                            }
                        } catch (err: any) {
                            toast.error(err.message || 'Failed to lock tickets. They may have been booked or locked by someone else.');
                            // Refresh availability
                            if (event?.id) {
                                try {
                                    const availability = await bookingApi.getEventAvailability(event.id);
                                    setBookedMap(availability.booked ?? {});
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        } finally {
                            setIsCreatingReservation(false);
                            isReservingRef.current = false;
                        }
                    }}
                    className={`w-[160px] md:w-[140px] h-[55px] md:h-[55px] bg-white rounded-[10px] flex items-center justify-center transition-all ${totalTickets === 0 || isCreatingReservation ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-[0.98]'}`}
                >
                    <span
                        style={{
                            fontFamily: "var(--font-anek-tamil-condensed)",
                            fontWeight: 500
                        }}
                        className="text-[18px] md:text-[24px] text-black uppercase leading-none"
                    >
                        {isCreatingReservation ? 'CHECKING...' : hasSelectionChanged ? 'UPDATE TICKETS' : 'CONTINUE'}
                    </span>
                </button>
            </footer>

            <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} />
            <ProfileDrawer isOpen={isProfileDrawerOpen} onClose={() => setIsProfileDrawerOpen(false)} />
        </div>
    );
}
