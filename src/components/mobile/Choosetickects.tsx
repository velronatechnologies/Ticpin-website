'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, Info, Percent, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useUserSession } from '@/lib/auth/user';
import { useReservationStore } from '@/store/useReservationStore';
import { bookingApi } from '@/lib/api/booking';
import AuthModal from '@/components/modals/AuthModal';
import { toast } from '@/components/ui/Toast';
import { TicketSkeleton } from '@/components/ui/Skeleton';

interface TicketCategory {
    name: string;
    price?: number;
    capacity?: number;
}

interface EventDetails {
    id: string;
    name: string;
    date?: string;
    time?: string;
    venue_name?: string;
    city?: string;
    venue_address?: string;
    ticket_categories?: TicketCategory[];
    price_starts_from?: number;
    landscape_image_url?: string;
    portrait_image_url?: string;
}

interface MobileChooseTicketsProps {
    eventName?: string;
    onBack: () => void;
}

export default function MobileChooseTickets({ eventName, onBack }: MobileChooseTicketsProps) {
    const router = useRouter();
    const params = useParams();
    const slug = eventName || (params?.name as string);

    const session = useUserSession();
    const reservationStore = useReservationStore();

    const [loading, setLoading] = useState(true);
    const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
    const [bookedMap, setBookedMap] = useState<Record<string, number>>({});
    const [offers, setOffers] = useState<any[]>([]);
    const [counts, setCounts] = useState<Record<number, number>>({});
    const [initialCountsRestored, setInitialCountsRestored] = useState<Record<number, number> | null>(null);
    
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isReserving, setIsReserving] = useState(false);

    // Fetch details
    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        console.log('[MobileChooseTickets] Fetching details for slug:', slug);

        // Fetch event metadata to get the actual ID
        fetch(`/backend/api/events/${encodeURIComponent(slug)}`, { credentials: 'include' })
            .then(async res => {
                console.log('[MobileChooseTickets] events fetch status:', res.status);
                const text = await res.text();
                console.log('[MobileChooseTickets] events fetch text:', text.substring(0, 200));
                try {
                    return JSON.parse(text);
                } catch (e) {
                    throw new Error(`Invalid JSON from events API: ${text.substring(0, 100)}`);
                }
            })
            .then(eventData => {
                if (!eventData || eventData.error) {
                    throw new Error('Event not found');
                }
                setEventDetails(eventData);

                const url = `/backend/api/mobile/event/${eventData.id}/choose-tickets`;
                console.log('[MobileChooseTickets] Fetching mobile tickets from:', url);

                // Fetch mobile-specific choose tickets data
                return fetch(url, { credentials: 'include' })
                    .then(async res => {
                        console.log('[MobileChooseTickets] choose-tickets fetch status:', res.status);
                        const text = await res.text();
                        console.log('[MobileChooseTickets] choose-tickets fetch text:', text.substring(0, 200));
                        try {
                            return JSON.parse(text);
                        } catch (e) {
                            throw new Error(`Invalid JSON from choose-tickets API: ${text.substring(0, 100)}`);
                        }
                    })
                    .then(mobileData => {
                        if (mobileData && !mobileData.error) {
                            setBookedMap(mobileData.booked || {});
                            setOffers(mobileData.offers || []);
                        }
                    });
            })
            .catch(err => {
                console.error('Error loading mobile tickets:', err);
                toast.error('Failed to load tickets');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [slug]);

    // Restore counts if active reservation exists for this event
    useEffect(() => {
        if (eventDetails && reservationStore.reservationId && reservationStore.eventId === eventDetails.id && !initialCountsRestored) {
            const initialCounts: Record<number, number> = {};
            const categories = eventDetails.ticket_categories || [];
            
            reservationStore.selectedSeats.forEach((ticket: any) => {
                const idx = categories.findIndex(
                    c => c.name.trim().toLowerCase() === ticket.name.trim().toLowerCase()
                );
                if (idx !== -1) {
                    initialCounts[idx] = ticket.quantity;
                }
            });
            setCounts(initialCounts);
            setInitialCountsRestored(initialCounts);
        }
    }, [eventDetails, reservationStore, initialCountsRestored]);

    const isSelectionChanged = useMemo(() => {
        if (!initialCountsRestored) return false;
        const allKeys = new Set([
            ...Object.keys(counts).map(Number),
            ...Object.keys(initialCountsRestored).map(Number)
        ]);
        for (const key of allKeys) {
            const currentVal = counts[key] ?? 0;
            const initialVal = initialCountsRestored[key] ?? 0;
            if (currentVal !== initialVal) {
                return true;
            }
        }
        return false;
    }, [counts, initialCountsRestored]);

    const buttonText = useMemo(() => {
        if (initialCountsRestored) {
            return isSelectionChanged ? 'Update Cart' : 'Continue';
        }
        return 'Checkout';
    }, [initialCountsRestored, isSelectionChanged]);

    const categories = useMemo(() => {
        if (!eventDetails) return [];
        return eventDetails.ticket_categories || [];
    }, [eventDetails]);

    const getAvailable = (cat: TicketCategory) => {
        if (!cat.capacity || cat.capacity <= 0) return Infinity;
        const booked = bookedMap[cat.name] ?? 0;
        return Math.max(0, cat.capacity - booked);
    };

    const add = (i: number) => {
        const cat = categories[i];
        const avail = getAvailable(cat);
        const current = counts[i] ?? 0;
        if (current >= avail) {
            toast.warning('No more tickets available for this category');
            return;
        }
        setCounts(prev => ({ ...prev, [i]: current + 1 }));
    };

    const remove = (i: number) => {
        const current = counts[i] ?? 0;
        if (current === 0) return;
        setCounts(prev => ({ ...prev, [i]: current - 1 }));
    };

    const totalTickets = useMemo(() => {
        return Object.values(counts).reduce((s, v) => s + v, 0);
    }, [counts]);

    const totalPrice = useMemo(() => {
        return categories.reduce((sum, cat, i) => {
            return sum + (counts[i] ?? 0) * (cat.price ?? 0);
        }, 0);
    }, [categories, counts]);

    const handleCheckout = async () => {
        if (!session?.id) {
            setShowAuthModal(true);
            return;
        }

        if (totalTickets === 0) {
            toast.error('Please select at least one ticket');
            return;
        }

        if (initialCountsRestored && !isSelectionChanged) {
            router.push(`/events/${encodeURIComponent(slug)}/book/review`);
            return;
        }

        if (isReserving) return;
        setIsReserving(true);

        const ticketReqs = categories
            .map((cat, i) => ({
                category: cat.name,
                quantity: counts[i] ?? 0,
            }))
            .filter(t => t.quantity > 0);

        try {
            const res = await bookingApi.createReservation(
                eventDetails!.id,
                session.id,
                ticketReqs,
                reservationStore.reservationId || undefined
            );

            if (res.success) {
                reservationStore.setReservation(
                    res.reservation_id,
                    eventDetails!.id,
                    categories
                        .map((cat, i) => ({
                            name: cat.name,
                            price: cat.price ?? 0,
                            quantity: counts[i] ?? 0,
                        }))
                        .filter(t => t.quantity > 0),
                    res.expires_at
                );

                const cart = {
                    eventId: eventDetails!.id,
                    eventName: eventDetails!.name,
                    city: eventDetails!.city,
                    landscape_image_url: eventDetails!.landscape_image_url,
                    portrait_image_url: eventDetails!.portrait_image_url,
                    tickets: categories
                        .map((cat, i) => ({
                            name: cat.name,
                            price: cat.price ?? 0,
                            quantity: counts[i] ?? 0,
                        }))
                        .filter(t => t.quantity > 0),
                    totalPrice,
                    type: 'event' as const,
                };
                sessionStorage.setItem('ticpin_cart', JSON.stringify(cart));

                router.push(`/events/${encodeURIComponent(slug)}/book/review`);
            } else {
                throw new Error('Reservation failed');
            }
        } catch (err: any) {
            console.error('Reservation creation error:', err);
            toast.error(err?.message || 'Failed to reserve tickets. Please try again.');
        } finally {
            setIsReserving(false);
        }
    };

    const formattedDate = useMemo(() => {
        if (!eventDetails?.date) return '';
        const d = new Date(eventDetails.date);
        const day = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        return `${day}, ${dateStr}`;
    }, [eventDetails]);

    if (loading) {
        return (
            <div className="md:hidden min-h-screen bg-white p-6 space-y-6">
                <TicketSkeleton />
                <TicketSkeleton />
                <TicketSkeleton />
            </div>
        );
    }

    return (
        <div className="md:hidden min-h-screen bg-white relative flex flex-col overflow-x-hidden" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            {/* Header Section */}
            <div className="w-full pt-4 px-4 relative h-[80px] shrink-0">
                <div className="w-full flex flex-col items-center mt-[2px]">
                    <h1 className="text-[20px] font-semibold text-black uppercase leading-tight text-center px-4 truncate max-w-[90vw]">
                        {eventDetails?.name || 'Event'}
                    </h1>
                    <p className="text-[10px] font-medium text-[#5331EA] mt-1 uppercase">
                        {formattedDate}{eventDetails?.time ? `, ${eventDetails.time}` : ''}
                    </p>
                </div>
            </div>

            {/* Choose Tickets Title */}
            <div className="px-[25px] mt-[10px] mb-4">
                <h2 className="text-[15px] font-medium text-black">Choose tickets</h2>
            </div>

            {/* Ticket Cards List */}
            <div className="flex-1 overflow-y-auto px-4 pb-[100px] space-y-4">
                {categories.map((cat, i) => {
                    const available = getAvailable(cat);
                    const isSoldOut = available === 0;
                    const current = counts[i] ?? 0;
                    const bestOffer = offers && offers.length > 0 
                        ? offers[0].title 
                        : 'GET EXTRA DISCOUNT WITH TICPIN PASS';

                    return (
                        <div key={i} className="mx-auto w-[352px] max-w-[90vw] border border-[#E1E1E1] rounded-[15px] overflow-hidden flex flex-col bg-white">
                            <div className="p-[15px] pb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                        <span className="text-[15px] font-medium text-black">Phase 1</span>
                                        <div className="w-[1px] h-[15px] bg-black mx-2" />
                                        <span className="text-[15px] font-medium text-black">{cat.name}</span>
                                    </div>
                                    {isSoldOut ? (
                                        <div className="w-[61px] h-[23px] bg-red-100 border border-red-500 rounded-[5px] text-[10px] font-medium text-red-600 flex items-center justify-center">
                                            Sold Out
                                        </div>
                                    ) : current === 0 ? (
                                        <button 
                                            onClick={() => add(i)}
                                            className="w-[61px] h-[23px] bg-[#EFEFEF] border border-[#686868] rounded-[5px] text-[12px] font-medium text-black flex items-center justify-center active:scale-95 transition-transform"
                                        >
                                            Add
                                        </button>
                                    ) : (
                                        <div className="flex items-center border border-[#686868] rounded-[5px] bg-[#EFEFEF] h-[23px] overflow-hidden">
                                            <button
                                                onClick={() => remove(i)}
                                                className="px-2 text-[14px] font-bold text-black active:bg-zinc-200 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="px-2 text-[12px] font-medium text-black min-w-[20px] text-center">
                                                {current}
                                            </span>
                                            <button
                                                onClick={() => add(i)}
                                                disabled={current >= available}
                                                className="px-2 text-[14px] font-bold text-black active:bg-zinc-200 transition-colors disabled:opacity-40"
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <span className="text-[12px] font-normal text-black block mb-4">₹{cat.price?.toLocaleString('en-IN') || '0'}</span>
                                
                                <div className="w-full h-[0.5px] bg-[#E1E1E1] mb-4" />
                                
                                <ul className="space-y-2 mb-4">
                                    <li className="flex gap-2">
                                        <span className="text-[#686868] text-[10px] leading-tight">• Each ticket grants entry to one person in the selected section.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-[#686868] text-[10px] leading-tight">• Access to food stalls, bars and washrooms in the venue area.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-[#686868] text-[10px] leading-tight">• Wheelchair accessibility options may vary by section.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Offer Banner in Card */}
                            {/* <div className="w-full h-[26px] bg-[#5331EA] flex items-center justify-between px-[10px] mt-auto">
                                <div className="flex items-center gap-1.5">
                                    <Percent size={10} className="text-white" strokeWidth={3} />
                                    <span className="text-[10px] font-normal text-white uppercase tracking-tight truncate max-w-[250px]">
                                        {bestOffer}
                                    </span>
                                </div>
                                <Info size={11} className="text-white shrink-0" />
                            </div> */}
                        </div>
                    );
                })}
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 w-full h-[88px] bg-[#EFEFEF] flex items-center justify-between px-[25px] shrink-0 border-t border-[#AEAEAE] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
                <div className="flex flex-col">
                    <span className="text-[12px] font-normal text-black">
                        {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'}
                    </span>
                    <span className="text-[20px] font-medium text-black leading-tight">
                        ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                </div>
                <button 
                    onClick={handleCheckout}
                    disabled={isReserving}
                    className="w-[148px] h-[44px] bg-black text-white rounded-[14px] font-semibold text-[15px] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                >
                    {isReserving ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                        buttonText
                    )}
                </button>
            </div>
        </div>
    );
}
