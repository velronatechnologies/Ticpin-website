'use client';

import { useRouter, notFound } from 'next/navigation';
import { Share2, MapPin, Calendar, ChevronDown, Ticket, Timer, ArrowLeft, ChevronRight, Car, Droplets, Utensils, Activity, Wifi, Check } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import { useUserSession } from '@/lib/auth/user';
import { getOrganizerSession, clearOrganizerSession } from '@/lib/auth/organizer';
import AuthModal from '@/components/modals/AuthModal';
import { bookingApi } from '@/lib/api/booking';
import { toast } from '@/components/ui/Toast';
import Footer from '@/components/layout/Footer';
import OrganizerLogoutModal from '@/components/modals/OrganizerLogoutModal';
import dynamic from 'next/dynamic';
import { useIsMobile } from '@/hooks/use-mobile';

// Use dynamic import to prevent hydration mismatch when isMobile switches
const MobileEventDetails = dynamic(
    () => import('@/components/mobile/MobileEventDetails'),
    { ssr: false }
);
import { useCurrentTime } from '@/hooks/use-current-time';
import { isEventBookingClosed, isEventBookingNotOpenedYet } from '@/lib/event-booking';

interface TicketCategory {
    name: string;
    price?: number;
    capacity?: number;
    image_url?: string;
    has_image?: boolean;
}

interface Artist {
    name: string;
    image_url?: string;
    description?: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface EventGuide {
    languages?: string[];
    min_age?: number;
    venue_type?: string;
    audience_type?: string;
    is_kid_friendly?: boolean;
    is_pet_friendly?: boolean;
    facilities?: string[];
}

interface EventData {
    id: string;
    name: string;
    description?: string;
    category?: string;
    sub_category?: string;
    city?: string;
    date?: string;
    time?: string;
    duration?: string;
    venue_name?: string;
    venue_address?: string;
    google_map_link?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    gallery_urls?: string[];
    price_starts_from?: number;
    tickets_needed_for?: string;
    artists?: Artist[];
    faqs?: FAQ[];
    guide?: EventGuide;
    status?: string;
    terms?: string;
    event_instructions?: string;
    ticket_categories?: TicketCategory[];
    ticket_open_date?: string;
    ticket_close_date?: string;
    event_end_date?: string;
    timezone?: string;
    total_tickets_available?: number;
    is_sales_paused?: boolean;
    is_canceled?: boolean;
    is_layout_based?: boolean;
    layout_json?: string;
}

import { getMinPrice, formatEventDateUTCWithDay, slugify } from '@/lib/utils';

const getAmenityIcon = (name: string) => {
    const normalized = name.toLowerCase();
    const iconClass = "w-5 h-5 text-[#8E8E93] shrink-0";
    
    // Parking
    if (normalized.includes('parking')) {
        return <Car className={iconClass} />;
    }
    // Washrooms
    if (normalized.includes('washroom') || normalized.includes('restroom') || normalized.includes('toilet')) {
        return <Droplets className={iconClass} />;
    }
    // Water
    if (normalized.includes('water') || normalized.includes('drinking')) {
        return <Droplets className={iconClass} />;
    }
    // Food / Stalls / Dining
    if (normalized.includes('food') || normalized.includes('stall') || normalized.includes('eat') || normalized.includes('canteen') || normalized.includes('beverage')) {
        return <Utensils className={iconClass} />;
    }
    // Medical / First Aid
    if (normalized.includes('medical') || normalized.includes('first aid') || normalized.includes('aid') || normalized.includes('doctor')) {
        return <Activity className={iconClass} />;
    }
    // Wi-Fi
    if (normalized.includes('wifi') || normalized.includes('internet') || normalized.includes('wi-fi')) {
        return <Wifi className={iconClass} />;
    }
    // Default fallback icon
    return <Check className={iconClass} />;
};

interface EventDetailClientProps {
    event: EventData;
    id: string;
}

export default function EventDetailClient({ event, id }: EventDetailClientProps) {
    if (!event || !event.status || event.status.toLowerCase() !== 'approved') {
        notFound();
    }
    const router = useRouter();
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const session = useUserSession();
    const organizerSession = getOrganizerSession();
    const [bookedMap, setBookedMap] = useState<Record<string, number>>({});
    const [availabilityLoaded, setAvailabilityLoaded] = useState(false);
    const isMobile = useIsMobile();
    const nowMs = useCurrentTime();
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [showFaqModal, setShowFaqModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

    const facilities = useMemo(() => {
        return event.guide?.facilities && event.guide.facilities.length > 0
            ? event.guide.facilities
            : ["Free water stations", "Washrooms available"];
    }, [event.guide?.facilities]);

    const displayFacilities = useMemo(() => {
        return facilities.slice(0, 3);
    }, [facilities]);

    useEffect(() => {
        const fetchAvailability = async () => {
            setAvailabilityLoaded(false);
            setBookedMap({});
            try {
                const avail = await bookingApi.getEventAvailability(event.id);
                if (avail && avail.booked) {
                    setBookedMap(avail.booked);
                }
            } catch (err) {
                console.error('Failed to fetch availability:', err);
            } finally {
                setAvailabilityLoaded(true);
            }
        };
        if (event?.id) {
            fetchAvailability();
        }
    }, [event?.id]);

    useEffect(() => {
        if (event) {
            if (event.is_layout_based) {
                router.prefetch(`/events/${slugify(event.name)}/book`);
            } else {
                router.prefetch(`/events/${slugify(event.name)}/book/tickets/all`);
            }
        }
    }, [event, router]);

    const minPrice = useMemo(() => getMinPrice(event, bookedMap), [event, bookedMap]);

    const bookingStatus = useMemo(() => {
        if (!event) return { isClosed: false, notOpenedYet: false, text: 'BOOK TICKETS' };

        if (isEventBookingClosed(event, nowMs)) {
            return { isClosed: true, notOpenedYet: false, text: 'TICKETS CLOSED' };
        }

        if (isEventBookingNotOpenedYet(event, nowMs)) {
            const openDate = new Date(event.ticket_open_date!);
            const formatted = openDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
            }) + ' at ' + openDate.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            return { isClosed: false, notOpenedYet: true, text: `OPENS ON ${formatted.toUpperCase()}` };
        }

        return { isClosed: false, notOpenedYet: false, text: 'BOOK TICKETS' };
    }, [event, nowMs]);

    const closedBooking = bookingStatus.isClosed || bookingStatus.notOpenedYet;

    // Reset state + scroll to top when navigating to a new event (handles back/forward)
    useEffect(() => {
        setShowFullDesc(false);
        setActiveFaq(null);
        setIsLoginModalOpen(false);
        setAvailabilityLoaded(false);
        setBookedMap({});
        setShowAllAmenities(false);
        setShowFaqModal(false);
        setShowTermsModal(false);
        setExpandedFaqIndex(null);
        window.scrollTo(0, 0);
        router.refresh();
    }, [event?.id, router]);

    const handleBook = async () => {
        if (closedBooking) {
            toast.error('Booking for this event is closed!');
            return;
        }
        try {
            const availabilityMap =
                availabilityLoaded
                    ? bookedMap
                    : (await bookingApi.getEventAvailability(event.id)).booked ?? {};

            const categories = event.ticket_categories || [];

            let totalAvailable = 0;
            let hasInfinite = false;

            for (const cat of categories) {
                if (!cat.capacity || cat.capacity <= 0) {
                    hasInfinite = true;
                    break;
                }
                const booked = availabilityMap[cat.name] ?? 0;
                const left = cat.capacity - booked;
                if (left > 0) {
                    totalAvailable += left;
                }
            }

            if (categories.length > 0 && !hasInfinite && totalAvailable <= 0) {
                toast.error('All tickets for this event are currently sold out or locked by others!');
                return;
            }
        } catch (err) {
            console.error('Error pre-checking availability:', err);
        }

        if (!session) {
            setIsLoginModalOpen(true);
            return;
        }
        if (event.is_layout_based) {
            router.push(`/events/${slugify(event.name)}/book`);
        } else {
            router.push(`/events/${slugify(event.name)}/book/tickets/all`);
        }
    };

    const formattedDate = useMemo(() => {
        return formatEventDateUTCWithDay(event?.date);
    }, [event?.date]);

    const processedDesc = useMemo(() => {
        if (!event?.description) return { plain: '', isLong: false, html: '' };
        const sanitized = DOMPurify.sanitize(event.description);
        const plainText = sanitized.replace(/<[^>]+>/g, '');
        return {
            html: sanitized,
            isLong: plainText.length > 400
        };
    }, [event?.description]);

    const bannerImg = useMemo(() => event?.landscape_image_url || event?.portrait_image_url || '', [event]);

    if (isMobile) {
        return <MobileEventDetails event={event} offers={[]} />;
    }

    return (
        <div className="min-h-screen font-[family-name:var(--font-anek-latin)] bg-white pt-[20px]">
            <main className="max-w-[1440px] mx-auto px-4 md:px-14 pt-8 pb-12 space-y-8">
                <div className="flex flex-col md:flex-row gap-10">
                    <div className="flex-1 space-y-8">
                        {/* Banner */}
                        <div className="relative w-full aspect-video rounded-[15px] overflow-hidden shadow-sm">
                            {bannerImg ? (
                                <Image
                                    src={bannerImg}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    alt={event.name}
                                    fill
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#D3CBF5] to-[#7B2FF7] flex items-center justify-center">
                                    <span className="text-white text-5xl font-bold opacity-20 text-center px-4">{event.name}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/10" />
                        </div>

                        {/* About Section */}
                        <section className="space-y-2">
                            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>About the Event</h2>
                            <div className="relative">
                                <div
                                    className={`text-[#686868] text-lg font-medium leading-relaxed ${!showFullDesc && processedDesc.isLong ? 'line-clamp-3' : ''}`}
                                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    dangerouslySetInnerHTML={{ __html: processedDesc.html || '<p>No description provided.</p>' }}
                                />
                                {processedDesc.isLong && (
                                    <button
                                        onClick={() => setShowFullDesc(!showFullDesc)}
                                        className="flex items-center gap-1 mt-2 text-black font-bold"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    >
                                        Show {showFullDesc ? 'less' : 'more'} <ChevronDown className={`transition-transform ${showFullDesc ? 'rotate-180' : ''}`} size={16} />
                                    </button>
                                )}
                            </div>
                        </section>

                        <div className="w-full h-[1.5px] bg-[#686868]" />

                        {/* Overview Section */}
                        <section className="space-y-5" style={{ marginTop: '-20px' }}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-[28px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Event Overview</h2>
                                {facilities.length > 0 && (
                                    <button
                                        onClick={() => setShowAllAmenities(true)}
                                        className="text-black font-bold text-lg hover:underline flex items-center gap-1"
                                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                                    >
                                        See All <ChevronRight size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex items-center gap-[18px]">
                                    <div className="w-[60px] h-[60px] bg-[#FAF6F6] rounded-[15px] flex items-center justify-center shrink-0">
                                        <img src="/language-logo.svg" alt="Language" className="w-[28px] h-[28px] shrink-0" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[15px] text-[#8E8E93] font-medium mb-0.5" style={{ fontFamily: 'var(--font-anek-latin)', lineHeight: '1.2' }}>Language</p>
                                        <p className="text-[20px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)', lineHeight: '1.2' }}>
                                            {event.guide?.languages?.length ? event.guide.languages.filter(Boolean).join(', ') : 'TBA'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-[18px]">
                                    <div className="w-[60px] h-[60px] bg-[#FAF6F6] rounded-[15px] flex items-center justify-center shrink-0">
                                        <Timer className="w-[28px] h-[28px] text-[#8E8E93] shrink-0" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[15px] text-[#8E8E93] font-medium mb-0.5" style={{ fontFamily: 'var(--font-anek-latin)', lineHeight: '1.2' }}>Duration</p>
                                        <p className="text-[20px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)', lineHeight: '1.2' }}>{event.duration || 'TBA'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-[18px]">
                                    <div className="w-[60px] h-[60px] bg-[#FAF6F6] rounded-[15px] flex items-center justify-center shrink-0">
                                        <Ticket className="w-[28px] h-[28px] text-[#8E8E93] shrink-0" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[15px] text-[#8E8E93] font-medium mb-0.5" style={{ fontFamily: 'var(--font-anek-latin)', lineHeight: '1.2' }}>Tickets Needed For</p>
                                        <p className="text-[20px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)', lineHeight: '1.2' }}>{event.tickets_needed_for || 'All ages'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>


                        {/* Gallery Section */}
                        {event.gallery_urls && event.gallery_urls.length > 0 && (
                            <section className="space-y-6">
                                <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Gallery</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {event.gallery_urls.slice(0, 4).map((src, i) => (
                                        <div key={i} className="relative aspect-square rounded-[20px] overflow-hidden border border-zinc-200">
                                            <Image src={src} fill className="object-cover" alt={`Gallery ${i}`} />
                                        </div>
                                    ))}
                                </div>
                                {event.landscape_image_url && (
                                    <div className="relative w-full h-[300px] md:h-[450px] rounded-[30px] overflow-hidden mt-8">
                                        <Image src={event.landscape_image_url} fill className="object-cover" alt="Gallery Banner" />
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Venue Section */}
                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Venue</h2>
                            <div className="p-6 bg-white rounded-[10px] border border-[#AEAEAE] flex flex-col md:flex-row items-center justify-between gap-8 min-h-[97px]">
                                <div className="space-y-1 flex-1">
                                    <h3 className="text-xl font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>{event.venue_name || 'Venue TBA'}</h3>
                                    <p className="text-base font-medium text-[#686868] leading-relaxed">
                                        {event.venue_address || event.city || 'Address not provided'}
                                    </p>
                                </div>
                                {event.google_map_link && (
                                    <button
                                        onClick={() => {
                                            window.open(event.google_map_link, '_blank');
                                        }}
                                        className="flex items-baseline justify-center gap-[7px] w-[154px] h-[44px] bg-white border border-[#AEAEAE] rounded-[10px] text-black font-medium uppercase text-[24px] shrink-0 pt-[7px]"
                                        style={{ fontFamily: 'var(--font-anek-tamil-condensed)', fontWeight: 500, lineHeight: '1.2' }}
                                    >
                                        <img src="/Location-logo.svg" alt="Location" className="w-[17px] h-[17px] shrink-0 " />
                                        <span>GET DIRECTIONS</span>
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* FAQ and Terms */}
                        <div className="space-y-5">
                            <div
                                className="p-6 bg-white border border-[#AEAEAE] rounded-[10px] cursor-pointer min-h-[80px] flex flex-col justify-center"
                                onClick={() => setShowFaqModal(true)}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Frequently Asked Questions</h3>
                                    <ChevronRight className="text-[#000000] w-6 h-6" />
                                </div>
                            </div>

                            <div
                                className="p-6 bg-white border border-[#AEAEAE] rounded-[10px] cursor-pointer min-h-[80px] flex flex-col justify-center"
                                onClick={() => setShowTermsModal(true)}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Event Terms & Conditions</h3>
                                    <ChevronRight className="text-[#000000] w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Booking Card */}
                    <div className="w-full md:w-[390px] shrink-0 md:mt-0.5">
                        <div className="space-y-4">
                            <div className="bg-white border border-[#AEAEAE] rounded-[15px] overflow-hidden">
                                <div className="p-4 space-y-4">
                                    <div className="space-y-3">
                                        <h1 className="text-3xl font-medium text-black leading-tight pl-[18px]" style={{ fontFamily: 'var(--font-anek-latin)' }}>{event.name}</h1>
                                        <div className="space-y-2 pl-[35px]">
                                            <div className="flex items-center gap-2">
                                                <Timer className="w-5 h-5 text-[#686868] shrink-0" />
                                                <p className="text-xl text-[#686868] font-medium" style={{ fontFamily: 'var(--font-anek-latin)' }}>{event.category}{event.sub_category ? ` · ${event.sub_category}` : ''}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-[#686868] shrink-0" />
                                                <p className="text-xl text-[#686868] font-medium" style={{ fontFamily: 'var(--font-anek-latin)' }}>{formattedDate}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-[#686868] shrink-0" />
                                                <p className="text-xl text-[#686868] font-medium" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                    {(() => {
                                                        const firstPart = event.venue_address ? event.venue_address.split(',')[0].trim() : event.venue_name;
                                                        if (firstPart && event.city) {
                                                            return `${firstPart} | ${event.city}`;
                                                        }
                                                        return firstPart || event.city || 'Location TBA';
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full h-[1.5px] bg-[#686868]/60" />
                                    <div className="flex items-center justify-between gap-4">
                                        <div style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                            <span className="text-xs font-medium text-[#686868] pl-[18px] tracking-wide uppercase">Starts from</span>
                                            <span className="text-2xl font-medium text-black block pl-[18px]">₹{minPrice > 0 ? minPrice.toLocaleString('en-IN') : 'TBA'}</span>
                                        </div>
                                        <button
                                            onClick={handleBook}
                                            disabled={closedBooking}
                                            className={`h-[46px] rounded-[10px] flex items-center justify-center active:scale-[0.98] transition-all px-4 ${
                                                closedBooking 
                                                ? 'bg-[#CCCCCC] text-[#666666] cursor-not-allowed min-w-[160px]' 
                                                : 'bg-black text-white hover:bg-zinc-800 w-[160px]'
                                            }`}
                                        >
                                            <span
                                                style={{
                                                    fontFamily: "var(--font-anek-tamil-condensed)",
                                                    fontWeight: 500,
                                                    lineHeight: bookingStatus.notOpenedYet ? "1.2" : "2.5"
                                                }}
                                                className={`tracking-normal uppercase text-center ${
                                                    bookingStatus.notOpenedYet ? 'text-[12px] font-semibold' : 'text-[25px]'
                                                }`}
                                            >
                                                {bookingStatus.text}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <AuthModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => router.push(event.is_layout_based ? `/events/${slugify(event.name)}/book` : `/events/${slugify(event.name)}/book/tickets/all`)}
            />

            {showAllAmenities && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-[20px] max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowAllAmenities(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-2xl font-bold text-black mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            All Amenities
                        </h3>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {facilities.map((facility, i) => (
                                <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0">
                                    {getAmenityIcon(facility)}
                                    <span className="text-lg font-medium text-zinc-800" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        {facility}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showFaqModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] max-w-2xl w-full p-8 relative shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Frequently asked questions
                            </h3>
                            <button
                                onClick={() => {
                                    setShowFaqModal(false);
                                    setExpandedFaqIndex(null);
                                }}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content Accordion */}
                        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2">
                            {event.faqs && event.faqs.length > 0 ? (
                                event.faqs.map((faq, i) => {
                                    const isExpanded = expandedFaqIndex === i;
                                    return (
                                        <div key={i} className="border-b border-zinc-100 last:border-0 py-4">
                                            <div
                                                onClick={() => setExpandedFaqIndex(isExpanded ? null : i)}
                                                className="flex items-center justify-between cursor-pointer gap-4 group"
                                            >
                                                <span className="text-lg font-semibold text-zinc-900 group-hover:text-black transition-colors" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                    {faq.question}
                                                </span>
                                                <ChevronDown className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                            <div
                                                style={{
                                                    transition: 'all 0.3s ease-in-out',
                                                    maxHeight: isExpanded ? '500px' : '0px',
                                                    opacity: isExpanded ? 1 : 0,
                                                    overflow: 'hidden',
                                                    marginTop: isExpanded ? '12px' : '0px'
                                                }}
                                            >
                                                <p className="text-[#686868] text-[15px] font-medium leading-relaxed" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-zinc-400 italic text-base py-4">No FAQs available for this event.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] max-w-2xl w-full p-8 relative shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Event Terms & Conditions
                            </h3>
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[60vh] overflow-y-auto pr-2 text-[#686868] text-[15px] font-medium leading-relaxed" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            <div className="whitespace-pre-wrap bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                {event.terms || event.event_instructions || "Standard terms and conditions apply. Please check with the venue for specific rules."}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
