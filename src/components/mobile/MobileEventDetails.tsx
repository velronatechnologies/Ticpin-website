'use client';

import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MapPin, Clock, Calendar, X, Check, Ticket, Car, Droplets, Utensils, Activity, Wifi } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/lib/auth/user';
import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import { toast } from '@/components/ui/Toast';
import { bookingApi } from '@/lib/api/booking';
import { getMinPrice, formatEventDateUTC, formatEventDateUTCWithDay } from '@/lib/utils';

interface OfferRecord {
    id: string;
    title: string;
    description: string;
    image?: string;
    discount_type: 'percent' | 'flat';
    discount_value: number;
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

interface MobileEventDetailsProps {
    event: {
        id: string;
        name: string;
        description?: string;
        date?: string;
        time?: string;
        duration?: string;
        venue_name?: string;
        venue_address?: string;
        city?: string;
        portrait_image_url?: string;
        landscape_image_url?: string;
        gallery_urls?: string[];
        price_starts_from?: number;
        ticket_categories?: { name: string; price?: number; capacity?: number }[];
        layout_json?: string;
        is_layout_based?: boolean;
        artist_details?: { name: string; profession?: string; image_url?: string }[];
        artists?: { name: string; image_url?: string; description?: string }[];
        event_category?: string;
        category?: string;
        age_limit?: string;
        language?: string;
        guide?: {
            languages?: string[];
            min_age?: number;
            ticket_required_above_age?: number;
            venue_type?: string;
            audience_type?: string;
            is_kid_friendly?: boolean;
            is_pet_friendly?: boolean;
            gates_open_before?: boolean;
            gates_open_before_value?: number;
            gates_open_before_unit?: string;
            facilities?: string[];
        };
        faqs?: { question: string; answer: string }[];
        terms?: string;
        event_instructions?: string;
        ticket_open_date?: string;
        ticket_close_date?: string;
        event_end_date?: string;
        is_sales_paused?: boolean;
        is_canceled?: boolean;
    };
    offers: OfferRecord[];
}

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

export default function MobileEventDetails({ event, offers }: MobileEventDetailsProps) {
    const router = useRouter();
    const session = useUserSession();

    const bookingStatus = useMemo(() => {
        if (!event) return { isClosed: false, notOpenedYet: false, text: 'Book tickets' };

        if (event.is_sales_paused || event.is_canceled) {
            return { isClosed: true, notOpenedYet: false, text: 'Tickets closed' };
        }

        if (event.ticket_open_date) {
            const openDate = new Date(event.ticket_open_date);
            if (!isNaN(openDate.getTime()) && openDate.getTime() > Date.now()) {
                const formatted = openDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short'
                }) + ' at ' + openDate.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                return { isClosed: false, notOpenedYet: true, text: `Opens on ${formatted}` };
            }
        }

        if (event.ticket_close_date) {
            const closeDate = new Date(event.ticket_close_date);
            if (!isNaN(closeDate.getTime()) && closeDate.getTime() < Date.now()) {
                return { isClosed: true, notOpenedYet: false, text: 'Tickets closed' };
            }
        }

        if (event.event_end_date) {
            const endDate = new Date(event.event_end_date);
            if (!isNaN(endDate.getTime()) && endDate.getTime() < Date.now()) {
                return { isClosed: true, notOpenedYet: false, text: 'Tickets closed' };
            }
        }

        return { isClosed: false, notOpenedYet: false, text: 'Book tickets' };
    }, [event]);

    const closedBooking = bookingStatus.isClosed || bookingStatus.notOpenedYet;
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [isThingsToKnowOpen, setIsThingsToKnowOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [animateLike, setAnimateLike] = useState(false);

    const thingsSheetRef = useRef<HTMLDivElement>(null);
    const [thingsTouchStart, setThingsTouchStart] = useState<number | null>(null);
    const [thingsTouchTranslation, setThingsTouchTranslation] = useState<number>(0);

    const handleThingsTouchStart = (e: React.TouchEvent) => {
        const isAtTop = thingsSheetRef.current ? thingsSheetRef.current.scrollTop === 0 : true;
        if (isAtTop) {
            setThingsTouchStart(e.targetTouches[0].clientY);
        }
    };

    const handleThingsTouchMove = (e: React.TouchEvent) => {
        if (thingsTouchStart === null) return;
        const currentY = e.targetTouches[0].clientY;
        const diff = currentY - thingsTouchStart;
        if (diff > 0) {
            setThingsTouchTranslation(diff);
            if (e.cancelable) {
                e.preventDefault();
            }
        } else {
            setThingsTouchTranslation(0);
        }
    };

    const handleThingsTouchEnd = () => {
        if (thingsTouchTranslation > 100) {
            setIsThingsToKnowOpen(false);
        }
        setThingsTouchStart(null);
        setThingsTouchTranslation(0);
    };

    const timelineSheetRef = useRef<HTMLDivElement>(null);
    const [timelineTouchStart, setTimelineTouchStart] = useState<number | null>(null);
    const [timelineTouchTranslation, setTimelineTouchTranslation] = useState<number>(0);

    const handleTimelineTouchStart = (e: React.TouchEvent) => {
        const isAtTop = timelineSheetRef.current ? timelineSheetRef.current.scrollTop === 0 : true;
        if (isAtTop) {
            setTimelineTouchStart(e.targetTouches[0].clientY);
        }
    };

    const handleTimelineTouchMove = (e: React.TouchEvent) => {
        if (timelineTouchStart === null) return;
        const currentY = e.targetTouches[0].clientY;
        const diff = currentY - timelineTouchStart;
        if (diff > 0) {
            setTimelineTouchTranslation(diff);
            if (e.cancelable) {
                e.preventDefault();
            }
        } else {
            setTimelineTouchTranslation(0);
        }
    };

    const handleTimelineTouchEnd = () => {
        if (timelineTouchTranslation > 100) {
            setIsTimelineOpen(false);
        }
        setTimelineTouchStart(null);
        setTimelineTouchTranslation(0);
    };

    // Prevent background scrolling when bottom sheets are open
    useEffect(() => {
        if (isTimelineOpen || isThingsToKnowOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        } else {
            document.body.style.overflow = '';
            document.body.style.height = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.height = '';
        };
    }, [isTimelineOpen, isThingsToKnowOpen]);

    // Check if liked on mount, and handle pending like if exists
    useEffect(() => {
        if (session?.id) {
            const pendingLikeId = localStorage.getItem('pending_like_event_id');
            if (pendingLikeId === String(event.id)) {
                localStorage.removeItem('pending_like_event_id');
                fetch(`/backend/api/user/likes/${event.id}`, {
                    method: 'POST',
                    credentials: 'include'
                })
                    .then(res => res.ok ? res.json() : Promise.reject())
                    .then(data => {
                        setIsLiked(data.liked);
                        if (data.liked) {
                            // toast.success('Saved to liked events');
                            setAnimateLike(true);
                            setTimeout(() => setAnimateLike(false), 400);
                        }
                    })
                    .catch(() => { });
            } else {
                fetch(`/backend/api/user/likes/${event.id}`, { credentials: 'include' })
                    .then(res => res.ok ? res.json() : Promise.reject())
                    .then(data => setIsLiked(data.liked))
                    .catch(() => { });
            }
        } else {
            setIsLiked(false);
        }
    }, [event.id, session?.id]);

    const handleLikeToggle = async () => {
        if (!session?.id) {
            localStorage.setItem('pending_like_event_id', String(event.id));
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        try {
            const res = await fetch(`/backend/api/user/likes/${event.id}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setIsLiked(data.liked);
                if (data.liked) {
                    // toast.success('Saved to liked events');
                    setAnimateLike(true);
                    setTimeout(() => setAnimateLike(false), 400);
                } else {
                    // toast.success('Removed from saved events');
                }
            } else {
                toast.error('Failed to update saved events.');
            }
        } catch (err) {
            console.error('Failed to toggle like on backend:', err);
            toast.error('Failed to update saved events.');
        }
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.name,
                    text: `Check out ${event.name} on Ticpin!`,
                    url: shareUrl
                });
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    copyToClipboard(shareUrl);
                }
            }
        } else {
            copyToClipboard(shareUrl);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                toast.success('Link copied to clipboard!');
            })
            .catch(() => {
                toast.error('Failed to copy link.');
            });
    };

    const handleBook = () => {
        if (closedBooking) {
            toast.error('Booking for this event is closed!');
            return;
        }
        if (!session) {
            const redirectPath = event.is_layout_based
                ? `/events/${encodeURIComponent(event.name)}/book`
                : `/events/${encodeURIComponent(event.name)}/book/tickets/all`;
            router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
            return;
        }
        if (event.is_layout_based) {
            router.push(`/events/${encodeURIComponent(event.name)}/book`);
        } else {
            router.push(`/events/${encodeURIComponent(event.name)}/book/tickets/all`);
        }
    };

    const toggleAccordion = (section: string) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    // Format date nicely
    const formattedDate = useMemo(() => {
        if (!event.date) return 'Date TBA';
        return formatEventDateUTC(event.date);
    }, [event.date]);

    // Format date nicely with day of week
    const fullFormattedDate = useMemo(() => {
        if (!event.date) return 'Date TBA';
        return formatEventDateUTCWithDay(event.date, true);
    }, [event.date]);

    const [bookedMap, setBookedMap] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const avail = await bookingApi.getEventAvailability(event.id);
                if (avail && avail.booked) {
                    setBookedMap(avail.booked);
                }
            } catch (err) {
                console.error('Failed to fetch availability:', err);
            }
        };
        if (event?.id) {
            fetchAvailability();
        }
    }, [event?.id]);

    const minPrice = useMemo(() => getMinPrice(event, bookedMap), [event, bookedMap]);
    const displayTime = formatTime(event.time) || 'Time TBA';
    const displayPrice = minPrice > 0 ? `₹${minPrice}` : 'TBA';

    const displayGatesOpenTime = useMemo(() => {
        if (!event.time) return 'TBA';
        try {
            const [hStr, mStr] = event.time.split(':');
            let h = parseInt(hStr, 10);
            let m = parseInt(mStr, 10);
            if (isNaN(h) || isNaN(m)) return formatTime(event.time) || 'TBA';

            // Subtract gates open before value (default 30 mins)
            const subtractMins = event.guide?.gates_open_before_value || 30;
            let totalMins = h * 60 + m - subtractMins;
            if (totalMins < 0) totalMins += 24 * 60;

            const newH = Math.floor(totalMins / 60) % 24;
            const newM = totalMins % 60;

            const ampm = newH >= 12 ? 'PM' : 'AM';
            const h12 = newH % 12 || 12;
            const mm = newM.toString().padStart(2, '0');
            return `${h12}:${mm} ${ampm}`;
        } catch {
            return formatTime(event.time) || 'TBA';
        }
    }, [event.time, event.guide?.gates_open_before_value]);

    const displayEndTime = useMemo(() => {
        if (!event.time) return 'TBA';
        try {
            const [hStr, mStr] = event.time.split(':');
            let h = parseInt(hStr, 10);
            let m = parseInt(mStr, 10);
            if (isNaN(h) || isNaN(m)) return 'TBA';

            let durationMins = 0;
            const dur = (event.duration || '').toLowerCase();

            if (dur.includes('hour') || dur.includes('hr')) {
                const match = dur.match(/([\d.]+)/);
                if (match) durationMins = parseFloat(match[1]) * 60;
            } else if (dur.includes('min')) {
                const match = dur.match(/(\d+)/);
                if (match) durationMins = parseInt(match[1], 10);
            } else if (dur.includes('h') || dur.includes('m')) {
                const hMatch = dur.match(/(\d+)h/);
                const mMatch = dur.match(/(\d+)m/);
                if (hMatch) durationMins += parseInt(hMatch[1], 10) * 60;
                if (mMatch) durationMins += parseInt(mMatch[1], 10);
            } else {
                const match = dur.match(/(\d+)/);
                if (match) durationMins = parseInt(match[1], 10);
            }

            if (durationMins <= 0) return 'TBA';

            let totalMins = h * 60 + m + durationMins;
            const newH = Math.floor(totalMins / 60) % 24;
            const newM = Math.round(totalMins % 60);

            const ampm = newH >= 12 ? 'PM' : 'AM';
            const h12 = newH % 12 || 12;
            const mm = newM.toString().padStart(2, '0');
            return `${h12}:${mm} ${ampm}`;
        } catch {
            return 'TBA';
        }
    }, [event.time, event.duration]);

    const languages = event.guide?.languages?.join(', ') || event.language || null;
    const minAge = event.guide?.min_age || event.age_limit || null;
    const ticketRequiredAboveAge = event.guide?.ticket_required_above_age || null;

    const processedDesc = useMemo(() => {
        if (!event.description) return { html: '', plain: '', isLong: false };
        const sanitized = DOMPurify.sanitize(event.description);
        const plainText = sanitized.replace(/<[^>]+>/g, '');
        return {
            html: sanitized,
            plain: plainText,
            isLong: plainText.length > 200
        };
    }, [event.description]);

    const googleMapUrl = useMemo(() => {
        const query = event.venue_address || event.venue_name || event.city;
        return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
    }, [event.venue_address, event.venue_name, event.city]);

    const eventTags = useMemo(() => {
        const tags: string[] = [];
        if (event.category) tags.push(event.category);
        if (event.event_category && event.event_category !== event.category) tags.push(event.event_category);
        if (event.language) tags.push(event.language);
        if (event.age_limit) tags.push(event.age_limit);
        if (event.guide?.venue_type) tags.push(event.guide.venue_type);
        if (event.guide?.audience_type) tags.push(event.guide.audience_type);
        return tags.map(t => t.toUpperCase());
    }, [event.category, event.event_category, event.language, event.age_limit, event.guide?.venue_type, event.guide?.audience_type]);

    return (
        <div className="md:hidden min-h-screen w-full bg-[#EAEAEA] font-sans selection:bg-[#866BFF]/20 overflow-x-hidden relative" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
            {/* 1. Top Image Section - 10.1 1 */}
            <div className="fixed top-0 left-0 w-full aspect-[3/4] bg-[#110D2C] z-0">
                {event.portrait_image_url || event.landscape_image_url ? (
                    <img
                        src={(event.portrait_image_url || event.landscape_image_url!).startsWith('.') ? (event.portrait_image_url || event.landscape_image_url!).substring(1) : (event.portrait_image_url || event.landscape_image_url!)}
                        alt={event.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full p-6 flex flex-col items-center justify-center relative bg-[#110D2C]">
                        {/* Reusing the fancy background from MobileHome */}
                        <div className="absolute inset-0 opacity-40">
                            <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_30%_30%,#DFFF00_0%,transparent_40%),radial-gradient(circle_at_70%_70%,#5331EA_0%,transparent_50%),radial-gradient(circle_at_90%_20%,#DFFF00_0%,transparent_30%)] blur-[80px]" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <h1 className="text-[44px] font-black text-[#DFFF00] italic leading-[0.8] tracking-tighter uppercase text-center"
                                style={{
                                    fontFamily: "var(--font-anek-tamil-condensed), sans-serif",
                                    transform: 'skewX(-16deg) scaleY(1.3)',
                                    textShadow: '0 0 15px rgba(223, 255, 0, 0.5)'
                                }}>
                                THE TICPIN<br />PLAY<br />FESTIVAL
                            </h1>
                        </div>
                    </div>
                )}

                {/* Overlaid Buttons */}
                <div className="absolute top-6 left-4 z-20">
                    <button
                        onClick={() => router.back()}
                        className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={20} className="text-black" />
                    </button>
                </div>

                <div className="absolute top-6 right-4 flex gap-3">
                    <button
                        onClick={handleLikeToggle}
                        className={`w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${animateLike ? 'scale-125 rotate-12 bg-red-50' : 'active:scale-90'
                            }`}
                    >
                        <img
                            src="/mobile_icons/event clicking/Vector 1.svg"
                            alt="Like"
                            className={`w-4 h-4 transition-all duration-300 ${animateLike ? 'animate-bounce' : ''}`}
                            style={{ filter: isLiked ? 'invert(27%) sepia(100%) saturate(7000%) hue-rotate(0deg) brightness(95%) contrast(110%)' : 'none' }}
                        />
                    </button>
                    <button onClick={handleShare} className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform">
                        <img src="/mobile_icons/event clicking/share.svg" className="w-4 h-4" alt="Share" />
                    </button>
                </div>

                {/* Progress Indicators - Ellipse 32, 33 */}
                <div className="absolute bottom-[24px] left-0 right-0 flex justify-center gap-1.5 z-20">
                    <div className="w-1 h-1 rounded-full bg-white shadow-sm" />
                    <div className="w-1 h-1 rounded-full bg-[#686868]" />
                </div>
            </div>

            {/* 2. Content Section - Rectangle 320 */}
            <div className="relative z-10 w-full bg-white rounded-t-[15px] px-6 pt-6 pb-[115px] mt-[calc(100vw*4/3-11px)] min-h-[calc(100vh-100vw*4/3+11px)] shadow-sm">
                {/* Event Name & Date */}
                <div className="mb-6">
                    <h1 className="text-[20px] font-semibold text-black mb-1 uppercase tracking-tight" style={{ lineHeight: '22px' }}>
                        {event.name}
                    </h1>
                    <p className="text-[15px] font-medium text-[#5331EA]" style={{ lineHeight: '16px' }}>
                        {formattedDate} {displayTime}
                    </p>
                </div>

                {/* Venue & Gates Open */}
                <div className="space-y-4 mb-6">
                    <div
                        onClick={() => googleMapUrl && window.open(googleMapUrl, '_blank')}
                        className={`flex items-start justify-between group ${googleMapUrl ? 'cursor-pointer' : ''}`}
                    >
                        <div className="flex items-start gap-4 flex-1 min-w-0 pr-2">
                            <div className="w-10 h-10 bg-[#E4E4E4] rounded-[10px] flex items-center justify-center shrink-0">
                                <MapPin size={20} className="text-black opacity-70" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-medium text-black leading-tight break-words">
                                    {(() => {
                                        const firstPart = event.venue_address ? event.venue_address.split(',')[0].trim() : event.venue_name;
                                        if (firstPart && event.city) {
                                            return `${firstPart} | ${event.city}`;
                                        }
                                        return firstPart || event.city || 'Venue TBA';
                                    })()}
                                </p>
                                <p className="text-[10px] font-medium text-[#686868] uppercase tracking-wider break-words mt-1">{event.venue_address || 'Location TBA'}</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-[#686868] shrink-0 mt-3" />
                    </div>

                    <div className="w-full h-[0.5px] bg-[#AEAEAE]" />
                    <div
                        onClick={() => setIsTimelineOpen(true)}
                        className="flex items-start justify-between group cursor-pointer"
                    >
                        <div className="flex items-start gap-4 flex-1 min-w-0 pr-2">
                            <div className="w-10 h-10 bg-[#E4E4E4] rounded-[10px] flex items-center justify-center shrink-0">
                                <Clock size={20} className="text-black opacity-70" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-medium text-black leading-tight">Gates Open: {displayGatesOpenTime}</p>
                                <p className="text-[10px] font-medium text-[#686868] uppercase tracking-wider mt-1">View full schedule & timeline</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-[#686868] shrink-0 mt-3" />
                    </div>
                </div>

                {/* About the event */}
                <div className="mb-8">
                    <h2 className="text-[20px] font-semibold text-black mb-2" style={{ lineHeight: '22px' }}>About the event</h2>

                    {processedDesc.plain && (
                        <div
                            className={`text-[14px] text-zinc-600 font-medium leading-relaxed mb-2 ${!showFullDesc && processedDesc.isLong ? 'line-clamp-4' : ''}`}
                            dangerouslySetInnerHTML={{ __html: processedDesc.html }}
                        />
                    )}
                    {processedDesc.isLong && (
                        <button
                            onClick={() => setShowFullDesc(!showFullDesc)}
                            className="text-[15px] font-semibold text-black flex items-center gap-1 leading-none mt-1"
                        >
                            {showFullDesc ? 'Show less' : 'Read more'}
                            <ChevronRight size={12} className="text-black transform translate-y-[0.5px]" />
                        </button>
                    )}
                </div>

                {/* Things to Know */}
                <div className="mb-8">
                    <h2 className="text-[20px] font-semibold text-black mb-3" style={{ lineHeight: '22px' }}>Things to Know</h2>
                    <div className="space-y-4 mb-2">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#E4E4E4] rounded-[10px] flex items-center justify-center shrink-0">
                                <Ticket size={20} className="text-black opacity-70" />
                            </div>
                            <p className="text-[15px] font-medium text-black">
                                {ticketRequiredAboveAge !== null && ticketRequiredAboveAge !== undefined
                                    ? (ticketRequiredAboveAge === 0 ? 'Ticket required for all' : `Ticket needed for ages ${ticketRequiredAboveAge} and above`)
                                    : 'Ticket needed for ages 3 and above'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsThingsToKnowOpen(true)}
                        className="text-[15px] font-semibold text-black flex items-center gap-1 leading-none"
                    >
                        Read more
                        <ChevronRight size={12} className="text-black transform translate-y-[0.5px]" />
                    </button>
                </div>

                {/* More Section */}
                <div className="space-y-4 mb-6 mt-8">
                    <h2 className="text-[20px] font-semibold text-black" style={{ lineHeight: '22px' }}>More</h2>
                    <div className="space-y-4">
                        {/* FAQs Accordion */}
                        <div>
                            <button
                                onClick={() => toggleAccordion('faqs')}
                                className="w-full h-[61px] border border-[#686868] rounded-[15px] flex items-center justify-between px-5 active:scale-[0.99] transition-all"
                            >
                                <span className="text-[15px] font-semibold text-black">Frequently Asked Questions</span>
                                {openAccordion === 'faqs' ? <ChevronUp size={20} className="text-[#686868]" /> : <ChevronDown size={20} className="text-[#686868]" />}
                            </button>
                            {openAccordion === 'faqs' && (
                                <div className="mt-2 px-2 space-y-3">
                                    {event.faqs && event.faqs.length > 0 ? (
                                        event.faqs.map((faq, idx) => (
                                            <div key={idx} className="bg-[#F5F5F5] rounded-[10px] p-4">
                                                <p className="text-[14px] font-semibold text-black mb-1">{faq.question}</p>
                                                <p className="text-[13px] text-zinc-600">{faq.answer}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-[#F5F5F5] rounded-[10px] p-4">
                                            <p className="text-[13px] text-zinc-600">No FAQ available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Terms Accordion */}
                        <div>
                            <button
                                onClick={() => toggleAccordion('terms')}
                                className="w-full h-[61px] border border-[#686868] rounded-[15px] flex items-center justify-between px-5 active:scale-[0.99] transition-all"
                            >
                                <span className="text-[15px] font-semibold text-black">Event Terms & Conditions</span>
                                {openAccordion === 'terms' ? <ChevronUp size={20} className="text-[#686868]" /> : <ChevronDown size={20} className="text-[#686868]" />}
                            </button>
                            {openAccordion === 'terms' && (
                                <div className="mt-2 px-2">
                                    <div className="bg-[#F5F5F5] rounded-[10px] p-4">
                                        {event.terms || event.event_instructions ? (
                                            <p className="text-[13px] text-zinc-600 whitespace-pre-wrap">{event.terms || event.event_instructions}</p>
                                        ) : (
                                            <p className="text-[13px] text-zinc-600">Event terms and conditions apply</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ask Anything AI */}
                <div className="flex justify-center mb-6">
                    <div className="p-[1px] bg-gradient-to-r from-[#866BFF] to-[#B26BE9] rounded-full">
                        <button className="flex items-center justify-center gap-2 px-6 h-[44px] w-[170px] bg-white rounded-full active:scale-95 transition-all">
                            <img src="/mobile_icons/event clicking/Vector.svg" className="w-[20px] h-[20px]" alt="AI" />
                            <span className="text-[17px] font-semibold bg-gradient-to-r from-[#866BFF] to-[#B26BE9] bg-clip-text text-transparent whitespace-nowrap">Ask anything</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            {!isTimelineOpen && !isThingsToKnowOpen && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] h-[83px] bg-[#F5F5F5] rounded-[40px] flex items-center justify-between px-8 z-[100]">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[18px] font-semibold text-black uppercase">{displayPrice}</span>
                        <span className="text-[12px] font-medium text-[#686868]">onwards</span>
                    </div>
                    <button
                        onClick={handleBook}
                        disabled={closedBooking}
                        className={`h-[51px] rounded-[40px] font-medium active:scale-95 transition-all flex items-center justify-center px-4 ${closedBooking
                            ? 'bg-[#CCCCCC] text-[#666666] cursor-not-allowed text-[11px] leading-tight text-center min-w-[138px] max-w-[180px]'
                            : 'bg-black text-white text-[18px] w-[138px]'
                            }`}
                    >
                        {bookingStatus.text}
                    </button>
                </div>
            )}

            {/* 1. Schedule and Timeline Bottom Sheet */}
            {isTimelineOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
                        onClick={() => setIsTimelineOpen(false)}
                    />

                    {/* Sheet Content */}
                    <div
                        ref={timelineSheetRef}
                        onTouchStart={handleTimelineTouchStart}
                        onTouchMove={handleTimelineTouchMove}
                        onTouchEnd={handleTimelineTouchEnd}
                        style={{
                            transform: `translateY(${timelineTouchTranslation}px)`,
                            transition: timelineTouchStart === null ? 'transform 0.3s ease-out' : 'none'
                        }}
                        className="relative w-full bg-white rounded-t-[30px] p-6 pb-10 z-10 max-h-[85vh] overflow-y-auto shadow-2xl transition-all animate-in slide-in-from-bottom"
                    >
                        {/* Drag indicator / top bar */}
                        <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[20px] font-semibold text-black tracking-tight" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                Schedule and timeline
                            </h3>
                            <button
                                onClick={() => setIsTimelineOpen(false)}
                                className="w-[30px] h-[30px] rounded-full flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <X size={16} className="text-black" />
                            </button>
                        </div>

                        {/* Event Date Header */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-9 h-9 bg-[#E4E4E4] rounded-[10px] flex items-center justify-center shrink-0">
                                <Calendar size={18} className="text-black opacity-70" />
                            </div>
                            <span className="text-[16px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                {fullFormattedDate}
                            </span>
                        </div>

                        {/* Timeline List */}
                        <div className="space-y-0 pl-1">
                            {/* Gates Open */}
                            <div className="flex gap-4 items-start relative pb-8">
                                <div className="absolute top-6 bottom-0 left-[11px] w-[2px] bg-[#10B981]" />
                                <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 z-10 shadow-sm shadow-emerald-500/30">
                                    <Check size={14} className="stroke-[3]" />
                                </div>
                                <div className="flex justify-between w-full items-center pl-2">
                                    <span className="text-[16px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>Gates open</span>
                                    <span className="text-[16px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>{displayGatesOpenTime}</span>
                                </div>
                            </div>

                            {/* Event Starts */}
                            <div className="flex gap-4 items-start relative pb-8">
                                <div className="absolute top-6 bottom-0 left-[11px] w-[2px] bg-zinc-200" />
                                <div className="w-6 h-6 rounded-full border-2 border-zinc-400 bg-white flex items-center justify-center shrink-0 z-10" />
                                <div className="flex justify-between w-full items-center pl-2">
                                    <span className="text-[16px] font-medium text-zinc-500" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>Event starts</span>
                                    <span className="text-[16px] font-semibold text-zinc-500" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>{displayTime}</span>
                                </div>
                            </div>

                            {/* Event Ends */}
                            <div className="flex gap-4 items-start relative">
                                <div className="w-6 h-6 rounded-full border-2 border-zinc-400 bg-white flex items-center justify-center shrink-0 z-10" />
                                <div className="flex justify-between w-full items-center pl-2">
                                    <span className="text-[16px] font-medium text-zinc-500" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>Event ends</span>
                                    <span className="text-[16px] font-semibold text-zinc-500" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>{displayEndTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Things to Know Bottom Sheet */}
            {isThingsToKnowOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
                        onClick={() => setIsThingsToKnowOpen(false)}
                    />

                    {/* Sheet Content */}
                    <div
                        ref={thingsSheetRef}
                        onTouchStart={handleThingsTouchStart}
                        onTouchMove={handleThingsTouchMove}
                        onTouchEnd={handleThingsTouchEnd}
                        style={{
                            transform: `translateY(${thingsTouchTranslation}px)`,
                            transition: thingsTouchStart === null ? 'transform 0.3s ease-out' : 'none'
                        }}
                        className="relative w-full bg-white rounded-t-[30px] p-6 pb-10 z-10 max-h-[85vh] overflow-y-auto shadow-2xl transition-all animate-in slide-in-from-bottom"
                    >
                        {/* Drag indicator / top bar */}
                        <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[20px] font-semibold text-black tracking-tight" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                Things to know
                            </h3>
                            <button
                                onClick={() => setIsThingsToKnowOpen(false)}
                                className="w-[30px] h-[30px] rounded-full flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <X size={16} className="text-black" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* EVENT INFO Section */}
                            <div>
                                <h4 className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-3" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                    EVENT INFO
                                </h4>
                                <div className="space-y-4">
                                    {/* Ticket Required Age */}
                                    <div className="flex items-center gap-4 py-2.5 border-b border-zinc-100 last:border-0">
                                        <Ticket size={20} className="text-black shrink-0" />
                                        <span className="text-[15px] font-medium text-zinc-800" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                            {ticketRequiredAboveAge !== null && ticketRequiredAboveAge !== undefined
                                                ? (ticketRequiredAboveAge === 0 ? 'Ticket required for all' : `Ticket needed for ages ${ticketRequiredAboveAge} and above`)
                                                : 'Ticket needed for ages 3 and above'}
                                        </span>
                                    </div>

                                    {/* Min Age Entry */}
                                    <div className="flex items-center gap-4 py-2.5 border-b border-zinc-100 last:border-0">
                                        <svg className="w-5 h-5 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                        <span className="text-[15px] font-medium text-zinc-800" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                            {minAge !== null && minAge !== undefined
                                                ? (minAge === 0 ? 'Entry allowed for all ages' : `Entry allowed for all ages`)
                                                : 'Entry allowed for all ages'}
                                        </span>
                                    </div>

                                    {/* Kid Friendly */}
                                    <div className="flex items-center gap-4 py-2.5 border-b border-zinc-100 last:border-0">
                                        <svg className="w-5 h-5 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                                        </svg>
                                        <span className="text-[15px] font-medium text-zinc-800" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                            {event.guide?.is_kid_friendly !== undefined
                                                ? (event.guide.is_kid_friendly ? 'Kid friendly' : 'Not kid friendly')
                                                : 'Kid friendly'}
                                        </span>
                                    </div>

                                    {/* Pet Friendly */}
                                    <div className="flex items-center gap-4 py-2.5 border-b border-zinc-100 last:border-0">
                                        <svg className="w-5 h-5 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l8 8" />
                                        </svg>
                                        <span className="text-[15px] font-medium text-zinc-800" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                            {event.guide?.is_pet_friendly !== undefined
                                                ? (event.guide.is_pet_friendly ? 'Pets allowed' : 'Pets not allowed')
                                                : 'Pets not allowed'}
                                        </span>
                                    </div>

                                    {/* Language */}
                                    {languages && (
                                        <div className="flex items-center gap-4 py-2.5 border-b border-zinc-100 last:border-0">
                                            <svg className="w-5 h-5 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 0c-.439 1.891-1.357 3.598-2.622 5.053M12 20a8 8 0 100-16 8 8 0 000 16z" />
                                            </svg>
                                            <span className="text-[15px] font-medium text-zinc-800" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                                Language: {languages}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AMENITIES Section */}
                            <div>
                                <h4 className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-3" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                    AMENITIES
                                </h4>
                                    {(event.guide?.facilities && event.guide.facilities.length > 0
                                        ? event.guide.facilities
                                        : ["Free water stations", "Washrooms available"]
                                    ).map((fac, idx) => (
                                        <div key={idx} className="flex items-center gap-4 py-2.5 border-b border-zinc-100 last:border-0">
                                            {getAmenityIcon(fac)}
                                            <span className="text-[15px] font-medium text-zinc-800" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                                {fac}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
