'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { bookingApi } from '@/lib/api/booking';
import { passApi, TicpinPass } from '@/lib/api/pass';
import { useUserSession } from '@/lib/auth/user';
import { TicketSkeleton } from '@/components/ui/Skeleton';
import { Zap, Clock, User, ChevronLeft, ChevronRight, Percent, Info } from 'lucide-react';
import { useSlotLock } from '@/hooks/useSlotLock';
import AuthModal from '@/components/modals/AuthModal';
import { useReservationStore } from '@/store/useReservationStore';
import { useRef } from 'react';

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
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isCreatingReservation, setIsCreatingReservation] = useState(false);
    const [showVisualMap, setShowVisualMap] = useState(false);
    const [selectedZoneName, setSelectedZoneName] = useState<string | null>(null);
    const isReservingRef = useRef(false);
    const session = useUserSession();
    const reservationStore = useReservationStore();

    // Handle edit mode when user returns from review page
    useEffect(() => {
        const isEditing = sessionStorage.getItem('ticpin_edit_selection') === '1';

        if (isEditing) {
            // User is editing existing selection - clear the flag
            sessionStorage.removeItem('ticpin_edit_selection');

            // Restore existing cart into counts
            const cartData = sessionStorage.getItem('ticpin_cart');
            if (cartData) {
                try {
                    const cart = JSON.parse(cartData);
                    if (cart.tickets) {
                        // We'll update counts when event loads
                        // Store temporarily to apply after event fetch
                        sessionStorage.setItem('ticpin_restore_counts', JSON.stringify(cart.tickets));
                    }
                } catch (e) {
                    console.error('Failed to parse cart data:', e);
                }
            }

            // Don't perform any auto-redirect - user intentionally came back to edit
            return;
        }
    }, []);

    useEffect(() => {
        if (!name) return;
        setLoading(true);
        fetch(`/backend/api/events/${encodeURIComponent(name)}`, { credentials: 'include' })
            .then(r => r.json())
            .then(async (eventData) => {
                if (!eventData || eventData.error) {
                    setLoading(false);
                    return;
                }

                // Check if event booking is closed
                const isClosed = (() => {
                    if (eventData.is_sales_paused || eventData.is_canceled) return true;
                    if (eventData.ticket_close_date) {
                        const closeDate = new Date(eventData.ticket_close_date);
                        if (!isNaN(closeDate.getTime()) && closeDate.getTime() < Date.now()) {
                            return true;
                        }
                    }
                    if (eventData.event_end_date) {
                        const endDate = new Date(eventData.event_end_date);
                        if (!isNaN(endDate.getTime()) && endDate.getTime() < Date.now()) {
                            return true;
                        }
                    }
                    if (eventData.date) {
                        const eventDate = new Date(eventData.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (eventDate < today && eventData.status !== 'unlimited') {
                            return true;
                        }
                    }
                    return false;
                })();

                if (isClosed) {
                    toast.error("Bookings for this event are closed.");
                    router.replace(`/events/${name}`);
                    return;
                }

                setEvent(eventData);

                // Restore counts if user is editing (returning from review)
                const restoreCounts = sessionStorage.getItem('ticpin_restore_counts');
                if (restoreCounts && eventData.ticket_categories) {
                    try {
                        const tickets = JSON.parse(restoreCounts);
                        const initialCounts: Record<number, number> = {};

                        tickets.forEach((ticket: any) => {
                            const index = eventData.ticket_categories.findIndex(
                                (cat: any) => cat.name === ticket.name
                            );
                            if (index !== -1) {
                                initialCounts[index] = ticket.quantity;
                            }
                        });

                        setCounts(initialCounts);
                        sessionStorage.removeItem('ticpin_restore_counts');
                    } catch (e) {
                        console.error('Failed to restore counts:', e);
                    }
                }

                const hasImgLayout = eventData.ticket_categories?.some((cat: any) => cat.has_image === true) ?? false;
                if (eventData.ticket_layout_type === 'image' || hasImgLayout) {
                    setShowVisualMap(true);
                } else {
                    setShowVisualMap(false);
                }
                try {
                    const availability = await bookingApi.getEventAvailability(eventData.id);
                    setBookedMap(availability.booked ?? {});
                } catch (e) {
                    console.error(e);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));

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

    const isZoneSelected = (zoneKey: string) => {
        return selectedZoneName === zoneKey;
    };

    const handleZoneClick = (zoneKey: string) => {
        setSelectedZoneName(zoneKey);
    };

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

    const handleCheckout = async () => {
        if (!session?.id) {
            setShowAuthModal(true);
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

            const res = await bookingApi.createReservation(event!.id, session.id, ticketReqs, reservationStore.reservationId || undefined);

            // Double check event date validity before proceeding to review
            if (event?.date) {
                const eventDate = new Date(event.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (eventDate < today) {
                    toast.error("Event date has passed. Bookings are closed.");
                    router.push(`/events/${name}`);
                    return;
                }
            }

            if (res.success) {
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
            } else {
                console.error('Reservation failed:', res);
            }
        } catch (err) {
            console.error('Reservation error:', err);
        } finally {
            setIsCreatingReservation(false);
            isReservingRef.current = false;
        }
    };

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
        <div className="min-h-screen overflow-x-hidden flex flex-col font-[family-name:var(--font-anek-latin)] bg-white select-none">
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            {/* ====== MOBILE VIEW (md:hidden) ====== */}
            <div className="md:hidden min-h-screen bg-white flex flex-col pb-[100px]" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
                {/* Header Section - Exact design match */}
                <div className="w-full pt-[18px] pb-[16px] relative shrink-0">
                    {/* <button 
                        onClick={() => router.push(`/events/${name}`)}
                        className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center absolute left-[15px] top-[18px] z-10 border border-[#E5E5E5]"
                    >
                        <ChevronLeft size={20} className="text-black" />
                    </button> */}

                    <div className="w-full flex flex-col items-center">
                        <h1 className="text-[20px] font-semibold text-black uppercase leading-[22px] text-center mt-[16px]">
                            {event?.name || '{EVENT NAME}'}
                        </h1>
                        <p className="text-[10px] font-medium text-[#5331EA] mt-[6px] uppercase leading-[11px]">
                            {event?.date ? new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\s/g, '') : '{DAY},{DATE}'}, {event?.time || '{TIME}'}
                        </p>
                    </div>
                </div>

                {timeRemaining > 0 && Object.values(counts).some(v => v > 0) && (
                    <div className="mx-[25px] mt-3 h-[32px] bg-[#F0EDFF] rounded-[8px] flex items-center justify-center gap-2">
                        <Clock size={13} className="text-[#5331EA]" />
                        <span className="text-[12px] font-medium text-black">
                            Reserved for <span className="font-bold">{Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}</span> mins
                        </span>
                    </div>
                )}

                {/* Choose Tickets Title */}
                <div className="px-[25px] mt-[18px] mb-[18px]">
                    <h2 className="text-[15px] font-medium text-black leading-[16px]">Choose tickets</h2>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto px-[25px]">
                    {showVisualMap ? (
                        /* Visual Layout Map Design */
                        <div className="w-full max-w-[352px] mx-auto bg-white border border-[#E1E1E1] rounded-[15px] p-4 flex flex-col items-center">
                            <div className="w-full h-[40px] bg-[#EFEFEF] border border-[#AEAEAE] rounded-[8px] flex items-center justify-center text-zinc-500 font-bold uppercase text-[13px] tracking-widest shadow-sm mb-4">
                                STAGE
                            </div>

                            {/* Zones Grid */}
                            <div className="w-full flex flex-col gap-2.5">
                                {/* VIP FANPIT */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleZoneClick('VIP FANPIT')}
                                        className={`h-[48px] rounded-[8px] border flex flex-col items-center justify-center transition-all duration-300 font-bold text-[11px] ${isZoneSelected('VIP FANPIT') ? 'border-green-600 border-2 bg-green-50' : 'border-green-600 bg-green-50/40'
                                            }`}
                                        style={{ color: '#006400' }}
                                    >
                                        <span>VIP FANPIT {getZonePrice('VIP FANPIT')}</span>
                                    </button>

                                    <button
                                        onClick={() => handleZoneClick('RAMP')}
                                        className={`h-[48px] rounded-[8px] border flex flex-col items-center justify-center transition-all duration-300 font-bold text-[11px] ${isZoneSelected('RAMP') ? 'border-red-600 border-2 bg-red-50' : 'border-red-600 bg-red-50/40'
                                            }`}
                                        style={{ color: '#8B0000' }}
                                    >
                                        <span>RAMP {getZonePrice('RAMP')}</span>
                                    </button>
                                </div>

                                {/* MIP Row */}
                                <button
                                    onClick={() => handleZoneClick('MIP')}
                                    className={`w-full h-[44px] rounded-[8px] border flex items-center justify-center transition-all duration-300 font-bold text-[12px] ${isZoneSelected('MIP') ? 'border-[#8B008B] border-2 bg-purple-50' : 'border-[#8B008B] bg-purple-50/40'
                                        }`}
                                    style={{ color: '#8B008B' }}
                                >
                                    <span>MIP {getZonePrice('MIP')}</span>
                                </button>

                                {/* VIP Row */}
                                <button
                                    onClick={() => handleZoneClick('VIP')}
                                    className={`w-full h-[44px] rounded-[8px] border flex items-center justify-center transition-all duration-300 font-bold text-[12px] ${isZoneSelected('VIP') ? 'border-[#4B0082] border-2 bg-indigo-50' : 'border-[#4B0082] bg-indigo-50/40'
                                        }`}
                                    style={{ color: '#4B0082' }}
                                >
                                    <span>VIP {getZonePrice('VIP')}</span>
                                </button>

                                {/* PLATINUM */}
                                <button
                                    onClick={() => handleZoneClick('PLATINUM')}
                                    className={`w-full h-[44px] rounded-[8px] border flex items-center justify-center transition-all duration-300 font-bold text-[12px] ${isZoneSelected('PLATINUM') ? 'border-[#008B8B] border-2 bg-cyan-50' : 'border-[#008B8B] bg-cyan-50/40'
                                        }`}
                                    style={{ color: '#008B8B' }}
                                >
                                    <span>PLATINUM {getZonePrice('PLATINUM')}</span>
                                </button>

                                {/* GOLD */}
                                <button
                                    onClick={() => handleZoneClick('GOLD')}
                                    className={`w-full h-[44px] rounded-[8px] border flex items-center justify-center transition-all duration-300 font-bold text-[12px] ${isZoneSelected('GOLD') ? 'border-[#8B8000] border-2 bg-yellow-50' : 'border-[#8B8000] bg-yellow-50/40'
                                        }`}
                                    style={{ color: '#8B8000' }}
                                >
                                    <span>GOLD {getZonePrice('GOLD')}</span>
                                </button>
                            </div>

                            {/* Zone Selection detail/counter */}
                            {selectedZoneName ? (
                                <div className="w-full mt-4 bg-zinc-50 border border-zinc-200 rounded-[10px] p-3 animate-in fade-in duration-200">
                                    {(() => {
                                        const foundIndex = categories.findIndex(c => c.name.toUpperCase().includes(selectedZoneName.toUpperCase()));
                                        const actualIndex = foundIndex !== -1 ? foundIndex : 0;
                                        const cat = categories[actualIndex];
                                        const available = getAvailable(cat);
                                        const isSoldOut = available === 0;
                                        const current = counts[actualIndex] ?? 0;

                                        return (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[14px] font-semibold text-black">{cat.name}</span>
                                                    <span className="text-[15px] font-bold text-black">₹{cat.price ?? 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-[11px] text-[#686868]">
                                                        {isSoldOut ? 'Sold out' : `${available} ticket(s) left`}
                                                    </span>
                                                    <div>
                                                        {isSoldOut ? (
                                                            <span className="text-[12px] text-red-500 font-bold">SOLD OUT</span>
                                                        ) : current === 0 ? (
                                                            <button
                                                                onClick={() => add(actualIndex)}
                                                                className="w-[28px] h-[28px] bg-black text-white rounded-full flex items-center justify-center font-bold text-[16px] active:scale-90 transition-all"
                                                            >
                                                                +
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-2 bg-black text-white px-2 py-1 rounded-[5px] text-[12px] font-medium">
                                                                <button onClick={() => remove(actualIndex)} className="px-1 font-bold">-</button>
                                                                <span>{current}</span>
                                                                {current < available && (
                                                                    <button onClick={() => add(actualIndex)} className="px-1 font-bold">+</button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <p className="text-[11px] text-[#686868] mt-4 text-center">Tap any colored section above to choose your seats</p>
                            )}
                        </div>
                    ) : (
                        /* Normal Tickets List - EXACT DESIGN MATCH */
                        <div className="w-full">
                            {categories.map((cat, i) => {
                                const available = getAvailable(cat);
                                const isSoldOut = available === 0;
                                const current = counts[i] ?? 0;

                                return (
                                    <div key={i} className="w-full flex justify-center" style={{ marginBottom: i === categories.length - 1 ? '0px' : '16px' }}>
                                        {/* Ticket Card - Exact Design */}
                                        <div className="w-full max-w-[352px] border-[1px] border-[#E1E1E1] rounded-[15px] overflow-hidden flex flex-col bg-white">

                                            {/* Card Content */}
                                            <div className="p-[15px] pb-0">
                                                {/* Category & Price */}
                                                <div className="flex items-center justify-between mb-[12px]">
                                                    <div className="flex items-center gap-0">
                                                        <span className="text-[15px] font-medium text-black leading-[16px]">Phase 1</span>
                                                        <div className="w-[15px] h-0 border-t border-black mx-[8px]" />
                                                        <span className="text-[15px] font-medium text-black leading-[16px]">{cat.name}</span>
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <span className="text-[12px] font-normal text-black block mb-[16px] leading-[13px]">
                                                    ₹{cat.price?.toLocaleString('en-IN') ?? 0}
                                                </span>

                                                {/* Description List */}
                                                <div className="space-y-[6px] mb-[12px]">
                                                    <p className="text-[10px] font-normal text-[#686868] leading-[11px]">
                                                        • Each ticket grants entry to one person in the {cat.name} area.
                                                    </p>
                                                    <p className="text-[10px] font-normal text-[#686868] leading-[11px]">
                                                        • Access to food stalls, bars and washrooms in the {cat.name} area.
                                                    </p>
                                                    <p className="text-[10px] font-normal text-[#686868] leading-[11px]">
                                                        • This is a standing area with wheelchair accessibility.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Separator Line */}
                                            <div className="w-[280px] h-[0.5px] bg-[#E1E1E1] mx-auto my-[12px]" />

                                            {/* Add Button Section */}
                                            <div className="px-[15px] pb-[12px] flex items-center justify-end">
                                                {isSoldOut ? (
                                                    <span className="text-[12px] text-red-500 font-bold uppercase">SOLD OUT</span>
                                                ) : current === 0 ? (
                                                    <button
                                                        onClick={() => add(i)}
                                                        className="w-[61px] h-[23px] bg-[#EFEFEF] border-[0.5px] border-[#686868] rounded-[5px] text-[12px] font-medium text-black flex items-center justify-center active:scale-95 transition-transform leading-[13px]"
                                                    >
                                                        Add
                                                    </button>
                                                ) : (
                                                    <div className="w-[80px] h-[23px] bg-black text-white rounded-[5px] flex items-center justify-between px-2 text-[12px] font-medium">
                                                        <button onClick={() => remove(i)} className="px-1 font-bold">−</button>
                                                        <span>{current}</span>
                                                        <button onClick={() => add(i)} disabled={current >= available} className="px-1 font-bold">+</button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Offer Banner - Exact Design */}
                                            <div className="w-full h-[26px] bg-[#5331EA] flex items-center justify-between px-[10px]">
                                                <div className="flex items-center gap-[6px]">
                                                    <Percent size={11} className="text-white" strokeWidth={2} />
                                                    <span className="text-[10px] font-normal text-white leading-[11px] uppercase tracking-tight">
                                                        (MORE PROFITABLE OFFER FOR USER)
                                                    </span>
                                                </div>
                                                <Info size={11} className="text-white" strokeWidth={2} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sticky Footer - Rectangle 519 */}
                <div className="fixed bottom-0 left-0 right-0 w-full h-[88px] bg-[#EFEFEF] flex items-center justify-between px-[25px] shrink-0 border-t border-[#E5E5E5] z-50">
                    <div className="flex flex-col">
                        <span className="text-[12px] font-normal text-black">{totalTickets} ticket{totalTickets !== 1 ? 's' : ''}</span>
                        <span className="text-[20px] font-medium text-black leading-tight">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={totalTickets === 0 || isCreatingReservation}
                        className="w-[148px] h-[44px] bg-black text-white rounded-[14px] font-semibold text-[15px] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                    >
                        Checkout
                    </button>
                </div>
            </div>

            {/* ====== DESKTOP VIEW (hidden md:flex) ====== */}
            <div className="hidden md:flex flex-col min-h-screen">
                {/* Header */}
                <header className="w-full bg-[#F5F5F5] py-5 px-6 border-b border-[#E5E5E5] flex items-center gap-4 relative z-10 shrink-0">
                    <button
                        onClick={() => router.push(`/events/${name}`)}
                        className="w-[35px] h-[35px] bg-white rounded-full flex items-center justify-center border border-[#E5E5E5] active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={20} className="text-black" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-[20px] font-bold text-black uppercase tracking-tight leading-tight">
                            {event?.name ?? 'Event Name'}
                        </h1>
                        <p className="text-[13px] font-medium text-zinc-500 mt-0.5 leading-none">
                            {formattedDateVenue}
                        </p>
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
                <main className="w-full max-w-[1000px] mx-auto px-6 md:px-12 py-8 space-y-4 flex-grow overflow-y-auto">
                    <h2 className="text-black uppercase tracking-tight font-extrabold text-[24px] mb-4">
                        CHOOSE TICKETS
                    </h2>

                    {showVisualMap ? (
                        <div className="w-full max-w-[580px] mx-auto bg-white border border-[#AEAEAE]/50 rounded-[18px] p-6 py-5 shadow-sm flex flex-col items-center select-none shrink-0">
                            <div className="flex flex-col items-center mb-4">
                                <h3 className="text-[24px] font-black tracking-wider text-black mb-0.5" style={{ fontFamily: 'Anek Latin' }}>TICPIN</h3>
                                <p className="text-[13px] text-[#686868] font-medium italic">~ For {event?.name ?? 'Event'} (Layout)</p>
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
                                        className={`col-span-4 h-[60px] rounded-[10px] border flex flex-col items-center justify-center transition-all duration-300 font-bold text-[12px] hover:scale-[1.03] hover:shadow-md cursor-pointer ${isZoneSelected('VIP FANPIT') ? 'border-green-600 border-2 ring-2 ring-green-400 bg-[#8AD18A]/30 font-black' : 'border-green-600 bg-[#8AD18A]/20 hover:bg-[#8AD18A]/30'
                                            }`}
                                        style={{ color: '#006400' }}
                                    >
                                        <span>VIP FANPIT {getZonePrice('VIP FANPIT')}</span>
                                        <span className="text-[10px] font-normal opacity-80">(Standing)</span>
                                    </button>

                                    <button
                                        onClick={() => handleZoneClick('RAMP')}
                                        className={`col-span-2 h-[60px] rounded-[10px] border flex flex-col items-center justify-center transition-all duration-300 font-bold text-[12px] hover:scale-[1.03] hover:shadow-md cursor-pointer ${isZoneSelected('RAMP') ? 'border-red-600 border-2 ring-2 ring-red-400 bg-[#D68A8A]/30 font-black' : 'border-red-600 bg-[#D68A8A]/20 hover:bg-[#D68A8A]/30'
                                            }`}
                                        style={{ color: '#8B0000' }}
                                    >
                                        <span>RAMP</span>
                                        <span className="text-[10px] font-bold opacity-80">{getZonePrice('RAMP')}</span>
                                    </button>

                                    <button
                                        onClick={() => handleZoneClick('VIP FANPIT')}
                                        className={`col-span-4 h-[60px] rounded-[10px] border flex flex-col items-center justify-center transition-all duration-300 font-bold text-[12px] hover:scale-[1.03] hover:shadow-md cursor-pointer ${isZoneSelected('VIP FANPIT') ? 'border-green-600 border-2 ring-2 ring-green-400 bg-[#8AD18A]/30 font-black' : 'border-green-600 bg-[#8AD18A]/20 hover:bg-[#8AD18A]/30'
                                            }`}
                                        style={{ color: '#006400' }}
                                    >
                                        <span>VIP FANPIT {getZonePrice('VIP FANPIT')}</span>
                                        <span className="text-[10px] font-normal opacity-80">(Standing)</span>
                                    </button>
                                </div>

                                {/* MIP Row */}
                                <button
                                    onClick={() => handleZoneClick('MIP')}
                                    className={`w-full h-[52px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[14px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${isZoneSelected('MIP') ? 'border-[#8B008B] border-2 ring-2 ring-pink-400 bg-[#DFA3CF]/30 font-black' : 'border-[#8B008B] bg-[#DFA3CF]/20 hover:bg-[#DFA3CF]/30'
                                        }`}
                                    style={{ color: '#8B008B' }}
                                >
                                    <span>MIP {getZonePrice('MIP')}</span>
                                </button>

                                {/* VIP Row */}
                                <div className="w-full grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleZoneClick('VIP')}
                                        className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${isZoneSelected('VIP') ? 'border-[#4B0082] border-2 ring-2 ring-purple-400 bg-[#B0A8E3]/30 font-black' : 'border-[#4B0082] bg-[#B0A8E3]/20 hover:bg-[#B0A8E3]/30'
                                            }`}
                                        style={{ color: '#4B0082' }}
                                    >
                                        <span>VIP {getZonePrice('VIP')}</span>
                                    </button>
                                    <button
                                        onClick={() => handleZoneClick('VIP')}
                                        className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${isZoneSelected('VIP') ? 'border-[#4B0082] border-2 ring-2 ring-purple-400 bg-[#B0A8E3]/30 font-black' : 'border-[#4B0082] bg-[#B0A8E3]/20 hover:bg-[#B0A8E3]/30'
                                            }`}
                                        style={{ color: '#4B0082' }}
                                    >
                                        <span>VIP {getZonePrice('VIP')}</span>
                                    </button>
                                </div>

                                {/* PLATINUM LEFT & RIGHT Row */}
                                <div className="w-full grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleZoneClick('PLATINUM')}
                                        className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${isZoneSelected('PLATINUM') ? 'border-[#008B8B] border-2 ring-2 ring-sky-400 bg-[#97CBE0]/30 font-black' : 'border-[#008B8B] bg-[#97CBE0]/20 hover:bg-[#97CBE0]/30'
                                            }`}
                                        style={{ color: '#008B8B' }}
                                    >
                                        <span>PLATINUM LEFT {getZonePrice('PLATINUM')}</span>
                                    </button>
                                    <button
                                        onClick={() => handleZoneClick('PLATINUM')}
                                        className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${isZoneSelected('PLATINUM') ? 'border-[#008B8B] border-2 ring-2 ring-sky-400 bg-[#97CBE0]/30 font-black' : 'border-[#008B8B] bg-[#97CBE0]/20 hover:bg-[#97CBE0]/30'
                                            }`}
                                        style={{ color: '#008B8B' }}
                                    >
                                        <span>PLATINUM RIGHT {getZonePrice('PLATINUM')}</span>
                                    </button>
                                </div>

                                {/* GOLD LEFT & RIGHT Row */}
                                <div className="w-full grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleZoneClick('GOLD')}
                                        className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${isZoneSelected('GOLD') ? 'border-[#8B8000] border-2 ring-2 ring-yellow-400 bg-[#DDD69B]/30 font-black' : 'border-[#8B8000] bg-[#DDD69B]/20 hover:bg-[#DDD69B]/30'
                                            }`}
                                        style={{ color: '#8B8000' }}
                                    >
                                        <span>GOLD LEFT {getZonePrice('GOLD')}</span>
                                    </button>
                                    <button
                                        onClick={() => handleZoneClick('GOLD')}
                                        className={`h-[46px] rounded-[10px] border flex items-center justify-center gap-1.5 transition-all duration-300 font-bold text-[13px] hover:scale-[1.02] hover:shadow-md cursor-pointer ${isZoneSelected('GOLD') ? 'border-[#8B8000] border-2 ring-2 ring-yellow-400 bg-[#DDD69B]/30 font-black' : 'border-[#8B8000] bg-[#DDD69B]/20 hover:bg-[#DDD69B]/30'
                                            }`}
                                        style={{ color: '#8B8000' }}
                                    >
                                        <span>GOLD RIGHT {getZonePrice('GOLD')}</span>
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
                        categories.map((cat, i) => {
                            const available = getAvailable(cat);
                            const isSoldOut = available === 0;
                            const current = counts[i] ?? 0;

                            return (
                                <div key={i} className={`w-full bg-white border rounded-[20px] overflow-hidden flex flex-col justify-between relative transition-all duration-200 ${isSoldOut ? 'border-red-200 opacity-70' : 'border-[#E5E5E5] hover:border-black shadow-sm'}`}>
                                    {/* Card Body */}
                                    <div className="p-5 flex justify-between items-center w-full">
                                        <div className="flex flex-col gap-1.5 flex-grow">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[16px] font-bold text-black uppercase tracking-tight">
                                                    {cat.name}
                                                </span>
                                                {isSoldOut && (
                                                    <span className="bg-red-100 text-red-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                        SOLD OUT
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[20px] font-extrabold text-black">
                                                ₹{(cat.price ?? 0).toLocaleString('en-IN')}
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0">
                                            {isSoldOut ? (
                                                <div className="w-[86px] h-[38px] bg-red-100 rounded-[10px] flex items-center justify-center">
                                                    <span className="text-[14px] text-red-600 font-semibold uppercase">Full</span>
                                                </div>
                                            ) : current === 0 ? (
                                                <button
                                                    onClick={() => add(i)}
                                                    className="w-[86px] h-[38px] bg-black text-white rounded-[10px] flex items-center justify-center hover:bg-zinc-800 active:scale-[0.96] transition-all font-bold text-[14px]"
                                                >
                                                    ADD
                                                </button>
                                            ) : (
                                                <div className="w-[86px] h-[38px] bg-black rounded-[10px] flex items-center justify-between px-2 text-white">
                                                    <button onClick={() => remove(i)} className="text-[20px] font-bold hover:text-zinc-300 transition-colors w-6 h-6 flex items-center justify-center">-</button>
                                                    <span className="text-[15px] font-bold">{current}</span>
                                                    <button onClick={() => add(i)} disabled={current >= available} className="text-[20px] font-bold hover:text-zinc-300 transition-colors w-6 h-6 flex items-center justify-center disabled:opacity-30">+</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Accent Bottom Strip */}
                                    <div className="bg-[#F0EDFF] border-t border-[#E8E4FF] px-5 py-2.5 flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-[#5331EA] uppercase tracking-wider">
                                            {isSoldOut ? 'Unavailable' : 'Flat 10% off with Ticpin Pass'}
                                        </span>
                                        <span className="text-[11px] font-semibold text-zinc-500 uppercase">
                                            Show details
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Ticpass Apply */}
                    {pass && pass.benefits.events_discount_active && (
                        <div className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-[15px] p-4 flex items-center justify-between shadow-sm mt-4">
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
                                className={`px-6 h-10 rounded-xl font-bold transition-all ${usePass
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
                <footer className="w-full h-[80px] bg-[#2A2A2A] shrink-0 flex items-center justify-between px-6 z-50 mt-auto">
                    <div className="flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest leading-none mb-1">
                            {totalTickets} {totalTickets === 1 ? 'Ticket' : 'Tickets'}
                        </span>
                        <span className="text-[22px] font-extrabold text-white leading-none">
                            ₹{totalPrice.toLocaleString('en-IN')}
                        </span>
                    </div>

                    <button
                        disabled={totalTickets === 0 || isCreatingReservation}
                        onClick={handleCheckout}
                        className={`h-[50px] px-8 bg-white text-black font-extrabold text-[15px] uppercase rounded-[12px] flex items-center justify-center transition-all ${totalTickets === 0 || isCreatingReservation ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.97]'}`}
                    >
                        {isCreatingReservation ? 'LOCKING...' : 'CHECKOUT'}
                    </button>
                </footer>
            </div>
        </div>
    );
}
