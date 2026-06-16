'use client';

import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MapPin, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/lib/auth/user';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import dynamic from 'next/dynamic';
import { toast } from '@/components/ui/Toast';
import { bookingApi } from '@/lib/api/booking';

const AuthModal = dynamic(() => import('@/components/modals/AuthModal'), { ssr: false });


interface OfferRecord {
    id: string;
    title: string;
    description: string;
    image?: string;
    discount_type: 'percent' | 'flat';
    discount_value: number;
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
        };
        faqs?: { question: string; answer: string }[];
        terms?: string;
        ticket_close_date?: string;
        event_end_date?: string;
        is_sales_paused?: boolean;
        is_canceled?: boolean;
    };
    offers: OfferRecord[];
}

import { getMinPrice } from '@/lib/utils';

export default function MobileEventDetails({ event, offers }: MobileEventDetailsProps) {
    const router = useRouter();
    const session = useUserSession();

    const closedBooking = useMemo(() => {
        if (!event) return false;
        if (event.is_sales_paused || event.is_canceled) return true;
        
        if (event.ticket_close_date) {
            const closeDate = new Date(event.ticket_close_date);
            if (!isNaN(closeDate.getTime()) && closeDate.getTime() < Date.now()) {
                return true;
            }
        }
        
        if (event.event_end_date) {
            const endDate = new Date(event.event_end_date);
            if (!isNaN(endDate.getTime()) && endDate.getTime() < Date.now()) {
                return true;
            }
        }
        
        return false;
    }, [event]);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    // Check if liked on mount
    useEffect(() => {
        if (session?.id) {
            fetch(`/backend/api/user/likes/${event.id}`, { credentials: 'include' })
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => setIsLiked(data.liked))
                .catch(() => {
                    try {
                        const liked = JSON.parse(localStorage.getItem('liked_events') || '[]');
                        setIsLiked(liked.some((e: any) => e.id === event.id));
                    } catch { /* ignore */ }
                });
        } else {
            try {
                const liked = JSON.parse(localStorage.getItem('liked_events') || '[]');
                setIsLiked(liked.some((e: any) => e.id === event.id));
            } catch { /* ignore */ }
        }
    }, [event.id, session?.id]);

    const handleLikeToggle = async () => {
        if (!session?.id) {
            try {
                let liked = JSON.parse(localStorage.getItem('liked_events') || '[]');
                const isAlreadyLiked = liked.some((e: any) => e.id === event.id);
                if (isAlreadyLiked) {
                    liked = liked.filter((e: any) => e.id !== event.id);
                    setIsLiked(false);
                    toast.success('Removed from saved events');
                } else {
                    liked.push({
                        id: event.id,
                        name: event.name,
                        date: event.date,
                        time: event.time,
                        price_starts_from: event.price_starts_from,
                        portrait_image_url: event.portrait_image_url,
                        landscape_image_url: event.landscape_image_url,
                        venue_name: event.venue_name,
                        city: event.city
                    });
                    setIsLiked(true);
                    toast.success('Saved to liked events');
                }
                localStorage.setItem('liked_events', JSON.stringify(liked));
            } catch (e) {
                console.error('Error writing liked events to localStorage:', e);
                toast.error('Failed to update saved events.');
            }
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
                    toast.success('Saved to liked events');
                } else {
                    toast.success('Removed from saved events');
                }

                try {
                    let liked = JSON.parse(localStorage.getItem('liked_events') || '[]');
                    if (!data.liked) {
                        liked = liked.filter((e: any) => e.id !== event.id);
                    } else {
                        if (!liked.some((e: any) => e.id === event.id)) {
                            liked.push({
                                id: event.id,
                                name: event.name,
                                date: event.date,
                                time: event.time,
                                price_starts_from: event.price_starts_from,
                                portrait_image_url: event.portrait_image_url,
                                landscape_image_url: event.landscape_image_url,
                                venue_name: event.venue_name,
                                city: event.city
                            });
                        }
                    }
                    localStorage.setItem('liked_events', JSON.stringify(liked));
                } catch { /* ignore */ }
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
            setIsLoginModalOpen(true);
            return;
        }
        router.push(`/events/${encodeURIComponent(event.name)}/book`);
    };

    const toggleAccordion = (section: string) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    // Format date nicely
    const formattedDate = useMemo(() => {
        if (!event.date) return 'Date TBA';
        try {
            const d = new Date(event.date);
            if (isNaN(d.getTime())) return event.date;
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${days[d.getDay()]} , ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        } catch {
            return event.date;
        }
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
    const displayTime = event.time || 'Time TBA';
    const displayPrice = minPrice > 0 ? `₹${minPrice}` : 'TBA';

    // Get languages from guide
    const languages = event.guide?.languages?.join(', ') || event.language || null;
    // Get min age from guide
    const minAge = event.guide?.min_age || event.guide?.ticket_required_above_age || event.age_limit || null;

    // Process description - render HTML properly
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

    return (
        <div className="md:hidden min-h-screen w-full bg-[#EAEAEA] font-sans selection:bg-[#866BFF]/20 overflow-x-hidden relative" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
            {/* 1. Top Image Section */}
            <div className="relative w-full h-[536px] bg-[#110D2C] shrink-0">
                {event.landscape_image_url || event.portrait_image_url ? (
                    <img
                        src={event.landscape_image_url || event.portrait_image_url!}
                        alt={event.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full p-6 flex flex-col items-center justify-center relative bg-[#110D2C]">
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
                <div className="absolute top-6 left-4 flex gap-2">
                    <button onClick={() => router.back()} className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-md">
                        <ChevronLeft size={20} className="text-black" />
                    </button>
                </div>

                <div className="absolute top-6 right-4 flex gap-3">
                    <button onClick={handleLikeToggle} className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform">
                        <img
                            src="/mobile_icons/event clicking/Vector 1.svg"
                            alt="Like"
                            className="w-4 h-4 transition-all"
                            style={{ filter: isLiked ? 'invert(27%) sepia(100%) saturate(7000%) hue-rotate(0deg) brightness(95%) contrast(110%)' : 'none' }}
                        />
                    </button>
                    <button onClick={handleShare} className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform">
                        <img src="/mobile_icons/event clicking/share.svg" className="w-4 h-4" alt="Share" />
                    </button>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-[24px] left-0 right-0 flex justify-center gap-1.5 z-20">
                    <div className="w-1 h-1 rounded-full bg-white shadow-sm" />
                    <div className="w-1 h-1 rounded-full bg-[#686868]" />
                </div>
            </div>

            {/* 2. Content Section */}
            <div className="relative -mt-[11px] w-full bg-white rounded-t-[15px] px-6 pt-6 pb-32 min-h-[1000px]">
                {/* Event Name & Date */}
                <div className="mb-6">
                    <h1 className="text-[20px] font-semibold text-black mb-1 uppercase tracking-tight" style={{ lineHeight: '22px' }}>
                        {event.name}
                    </h1>
                    <p className="text-[15px] font-medium text-[#5331EA]" style={{ lineHeight: '16px' }}>
                        {formattedDate} · {displayTime}
                    </p>
                </div>

                {/* Venue & Gates Open */}
                <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#E4E4E4] rounded-[10px] flex items-center justify-center">
                                <MapPin size={20} className="text-black opacity-70" />
                            </div>
                            <div>
                                <p className="text-[15px] font-medium text-black leading-tight">
                                    {(() => {
                                        const firstPart = event.venue_address ? event.venue_address.split(',')[0].trim() : event.venue_name;
                                        if (firstPart && event.city) {
                                            return `${firstPart} | ${event.city}`;
                                        }
                                        return firstPart || event.city || 'Venue TBA';
                                    })()}
                                </p>
                                <p className="text-[10px] font-medium text-[#686868] uppercase tracking-wider">{event.venue_address || 'Location TBA'}</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-[#686868]" />
                    </div>

                    <div className="w-full h-[0.5px] bg-[#AEAEAE]" />

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#E4E4E4] rounded-[10px] flex items-center justify-center">
                                <Clock size={20} className="text-black opacity-70" />
                            </div>
                            <div>
                                <p className="text-[15px] font-medium text-black leading-tight">{displayTime}</p>
                                <p className="text-[10px] font-medium text-[#686868] uppercase tracking-wider">
                                    {event.duration ? `Duration: ${event.duration}` : 'View full schedule & timeline'}
                                </p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-[#686868]" />
                    </div>
                </div>

                {/* Offers Section — only show if offers exist */}
                {offers.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-[20px] font-semibold text-black mb-4">Offers for you</h2>
                        <div className="w-full h-[120px] bg-[#AC9BF7] rounded-[8px] p-4 flex flex-col justify-center">
                            <div>
                                <p className="text-white font-bold">{offers[0].title}</p>
                                <p className="text-white/80 text-sm">{offers[0].description}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* About the event — render HTML properly */}
                {processedDesc.plain && (
                    <div className="mb-12">
                        <h2 className="text-[20px] font-semibold text-black mb-2" style={{ lineHeight: '22px' }}>About the event</h2>
                        <div
                            className={`text-[14px] text-zinc-600 font-medium leading-relaxed mb-4 ${!showFullDesc && processedDesc.isLong ? 'line-clamp-4' : ''}`}
                            dangerouslySetInnerHTML={{ __html: processedDesc.html }}
                        />
                        {processedDesc.isLong && (
                            <button
                                onClick={() => setShowFullDesc(!showFullDesc)}
                                className="text-[15px] font-semibold text-black flex items-center gap-1 leading-none"
                            >
                                {showFullDesc ? 'Show less' : 'Read more'}
                                <ChevronRight size={12} className="text-black transform translate-y-[0.5px]" />
                            </button>
                        )}
                    </div>
                )}

                {/* Things to Know — from backend guide data */}
                {(languages || minAge) && (
                    <div className="mb-12 mt-[-15px]">
                        <h2 className="text-[20px] font-semibold text-black mb-6" style={{ lineHeight: '22px' }}>Things to Know</h2>
                        <div className="space-y-4 mb-4">
                            {languages && (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#E4E4E4] rounded-[10px] flex items-center justify-center">
                                        <img src="/mobile_icons/event clicking/language.svg" className="w-[23px] h-[23px]" alt="Language" />
                                    </div>
                                    <p className="text-[15px] font-medium text-black">{languages}</p>
                                </div>
                            )}
                            {minAge && (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#E4E4E4] rounded-[10px] flex items-center justify-center">
                                        <img src="/mobile_icons/event clicking/users-alt.svg" className="w-[23px] h-[23px]" alt="Age" />
                                    </div>
                                    <p className="text-[15px] font-medium text-black">{typeof minAge === 'number' ? `${minAge}+ years` : minAge}</p>
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#E4E4E4] rounded-[10px] flex items-center justify-center">
                                    <img src="/mobile_icons/event clicking/ticket.svg" className="w-[22px] h-[22px]" alt="Entry" />
                                </div>
                                <p className="text-[15px] font-medium text-black">Ticket Required for Entry</p>
                            </div>
                            {event.guide?.venue_type && (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#E4E4E4] rounded-[10px] flex items-center justify-center">
                                        <MapPin size={20} className="text-black opacity-70" />
                                    </div>
                                    <p className="text-[15px] font-medium text-black">{event.guide.venue_type} · {event.guide?.audience_type || 'General'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* More Section — FAQs & Terms with expand/collapse */}
                <div className="space-y-4 mb-12 mt-[-15px]">
                    <h2 className="text-[20px] font-semibold text-black" style={{ lineHeight: '22px' }}>More</h2>
                    <div className="space-y-4">
                        {/* FAQs */}
                        {event.faqs && event.faqs.length > 0 && (
                            <div>
                                <button
                                    onClick={() => toggleAccordion('faqs')}
                                    className="w-full h-[61px] border border-[#686868] rounded-[15px] flex items-center justify-between px-5"
                                >
                                    <span className="text-[15px] font-semibold text-black">Frequently Asked Questions</span>
                                    {openAccordion === 'faqs' ? <ChevronUp size={20} className="text-[#686868]" /> : <ChevronDown size={20} className="text-[#686868]" />}
                                </button>
                                {openAccordion === 'faqs' && (
                                    <div className="mt-2 px-2 space-y-3">
                                        {event.faqs.map((faq, idx) => (
                                            <div key={idx} className="bg-[#F5F5F5] rounded-[10px] p-4">
                                                <p className="text-[14px] font-semibold text-black mb-1">{faq.question}</p>
                                                <p className="text-[13px] text-zinc-600">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Terms */}
                        {event.terms && (
                            <div>
                                <button
                                    onClick={() => toggleAccordion('terms')}
                                    className="w-full h-[61px] border border-[#686868] rounded-[15px] flex items-center justify-between px-5"
                                >
                                    <span className="text-[15px] font-semibold text-black">Event Terms & Conditions</span>
                                    {openAccordion === 'terms' ? <ChevronUp size={20} className="text-[#686868]" /> : <ChevronDown size={20} className="text-[#686868]" />}
                                </button>
                                {openAccordion === 'terms' && (
                                    <div className="mt-2 px-2">
                                        <div className="bg-[#F5F5F5] rounded-[10px] p-4">
                                            <p className="text-[13px] text-zinc-600 whitespace-pre-wrap">{event.terms}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Ask Anything AI */}
                <div className="flex justify-center mb-10">
                    <div className="p-[1px] bg-gradient-to-r from-[#866BFF] to-[#B26BE9] rounded-full">
                        <button className="flex items-center justify-center gap-2 px-6 h-[44px] w-[170px] bg-white rounded-full active:scale-95 transition-all">
                            <img src="/mobile_icons/event clicking/Vector.svg" className="w-[20px] h-[20px]" alt="AI" />
                            <span className="text-[17px] font-semibold bg-gradient-to-r from-[#866BFF] to-[#B26BE9] bg-clip-text text-transparent whitespace-nowrap">Ask anything</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] h-[83px] bg-[#F5F5F5] rounded-[40px] flex items-center justify-between px-8 z-[100]">
                <div className="flex items-center gap-1.5">
                    <span className="text-[18px] font-semibold text-black uppercase">{displayPrice}</span>
                    <span className="text-[12px] font-medium text-[#686868]">onwards</span>
                </div>
                <button 
                    onClick={handleBook}
                    disabled={closedBooking}
                    className={`w-[138px] h-[51px] rounded-[40px] font-medium text-[18px] active:scale-95 transition-all flex items-center justify-center ${
                        closedBooking
                        ? 'bg-[#CCCCCC] text-[#666666] cursor-not-allowed'
                        : 'bg-black text-white'
                    }`}
                >
                    {closedBooking ? 'Tickets closed' : 'Book tickets'}
                </button>
            </div>

            <AuthModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => router.push(`/events/${encodeURIComponent(event.name)}/book`)}
            />

        </div>
    );
}
