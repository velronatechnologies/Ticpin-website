'use client';

import { useRouter } from 'next/navigation';
import { Share2, MapPin, ChevronDown, Ticket, Timer, ArrowLeft, ChevronRight } from 'lucide-react';
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
import MobileEventDetails from '@/components/mobile/MobileEventDetails';

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
    ticket_categories?: TicketCategory[];
    ticket_open_date?: string;
    ticket_close_date?: string;
    event_end_date?: string;
    is_sales_paused?: boolean;
    is_canceled?: boolean;
    layout_json?: string;
}

import { getMinPrice } from '@/lib/utils';

export default function EventDetailClient({ event, id }: { event: EventData, id: string }) {
    const router = useRouter();
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const session = useUserSession();
    const organizerSession = getOrganizerSession();
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

    const bookingStatus = useMemo(() => {
        if (!event) return { isClosed: false, notOpenedYet: false, text: 'BOOK TICKETS' };
        
        if (event.is_sales_paused || event.is_canceled) {
            return { isClosed: true, notOpenedYet: false, text: 'TICKETS CLOSED' };
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
                return { isClosed: false, notOpenedYet: true, text: `OPENS ON ${formatted.toUpperCase()}` };
            }
        }
        
        if (event.ticket_close_date) {
            const closeDate = new Date(event.ticket_close_date);
            if (!isNaN(closeDate.getTime()) && closeDate.getTime() < Date.now()) {
                return { isClosed: true, notOpenedYet: false, text: 'TICKETS CLOSED' };
            }
        }
        
        if (event.event_end_date) {
            const endDate = new Date(event.event_end_date);
            if (!isNaN(endDate.getTime()) && endDate.getTime() < Date.now()) {
                return { isClosed: true, notOpenedYet: false, text: 'TICKETS CLOSED' };
            }
        }
        
        return { isClosed: false, notOpenedYet: false, text: 'BOOK TICKETS' };
    }, [event]);

    const closedBooking = bookingStatus.isClosed || bookingStatus.notOpenedYet;

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleBook = async () => {
        if (closedBooking) {
            toast.error('Booking for this event is closed!');
            return;
        }
        // Fetch live availability from backend before entering the booking flow
        try {
            const avail = await bookingApi.getEventAvailability(event.id);
            const bookedMap = avail.booked ?? {};

            const categories = event.ticket_categories && event.ticket_categories.length > 0
                ? event.ticket_categories
                : [{ name: 'General Admission', capacity: 0 }];

            let totalAvailable = 0;
            let hasInfinite = false;

            for (const cat of categories) {
                if (!cat.capacity || cat.capacity <= 0) {
                    hasInfinite = true;
                    break;
                }
                const booked = bookedMap[cat.name] ?? 0;
                const left = cat.capacity - booked;
                if (left > 0) {
                    totalAvailable += left;
                }
            }

            if (!hasInfinite && totalAvailable <= 0) {
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
        router.push(`/events/${id}/book`);
    };

    const formattedDate = useMemo(() => {
        if (!event?.date) return '';
        try {
            const d = new Date(event.date);
            if (isNaN(d.getTime())) return '';
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            const weekday = days[d.getDay()];
            const day = d.getDate();
            const month = months[d.getMonth()];
            const year = d.getFullYear();

            return `${weekday}, ${day} ${month} ${year}`;
        } catch (e) {
            return '';
        }
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

    // Mobile view check
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
                                        <img src="/Duration-logo.svg" alt="Duration" className="w-[28px] h-[28px] shrink-0" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[15px] text-[#8E8E93] font-medium mb-0.5" style={{ fontFamily: 'var(--font-anek-latin)', lineHeight: '1.2' }}>Duration</p>
                                        <p className="text-[20px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)', lineHeight: '1.2' }}>{event.duration || 'TBA'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-[18px]">
                                    <div className="w-[60px] h-[60px] bg-[#FAF6F6] rounded-[15px] flex items-center justify-center shrink-0">
                                        <img src="/Ticket-logo.svg" alt="Ticket" className="w-[28px] h-[28px] shrink-0" />
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
                                onClick={() => setActiveFaq(activeFaq === 99 ? null : 99)}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Frequently Asked Questions</h3>
                                    <ChevronDown className={`transition-transform text-[#000000] w-6 h-6 ${activeFaq === 99 ? 'rotate-180' : ''}`} />
                                </div>
                                {activeFaq === 99 && (
                                    <div className="mt-4 text-[#686868] text-base font-medium border-t pt-4 space-y-4" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        {event.faqs && event.faqs.length > 0 ? (
                                            event.faqs.map((faq, i) => (
                                                <div key={i} className="space-y-1">
                                                    <p className="font-bold text-black text-base">{faq.question}</p>
                                                    <p className="text-[#686868] text-base">{faq.answer}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-zinc-400 italic text-base">No FAQs available for this event.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div
                                className="p-6 bg-white border border-[#AEAEAE] rounded-[10px] cursor-pointer min-h-[80px] flex flex-col justify-center"
                                onClick={() => setActiveFaq(activeFaq === 100 ? null : 100)}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Event Terms & Conditions</h3>
                                    <ChevronDown className={`transition-transform text-[#000000] w-6 h-6 ${activeFaq === 100 ? 'rotate-180' : ''}`} />
                                </div>
                                {activeFaq === 100 && (
                                    <div className="mt-4 text-[#686868] text-base font-medium border-t pt-4" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        <div className="whitespace-pre-wrap">
                                            {event.terms || "Standard terms and conditions apply. Please check with the venue for specific rules."}
                                        </div>
                                    </div>
                                )}
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
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10 1C5.04 1 1 5.04 1 10C1 14.96 5.04 19 10 19C14.96 19 19 14.96 19 10C19 5.04 14.96 1 10 1ZM10 17C6.13 17 3 13.87 3 10C3 6.13 6.13 3 10 3C13.87 3 17 6.13 17 10C17 13.87 13.87 17 10 17Z" fill="#686868"/>
                                                    <path d="M9.5 5H10.5V11H9.5V5Z" fill="#686868"/>
                                                    <path d="M14.2 8.5L14.8 9.1L11.2 12.7L10.6 12.1L14.2 8.5Z" fill="#686868"/>
                                                </svg>
                                                <p className="text-xl text-[#686868] font-medium" style={{ fontFamily: 'var(--font-anek-latin)' }}>{event.category}{event.sub_category ? ` · ${event.sub_category}` : ''}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M3.94989 16.5872H9.27673C9.62189 16.5872 9.90173 16.3074 9.90173 15.9622C9.90173 15.6171 9.62189 15.3372 9.27673 15.3372H3.94989C3.15033 15.3372 2.5 14.6896 2.5 13.8934V7.2467H14.7217V8.29407C14.7217 8.63922 15.0015 8.91907 15.3467 8.91907C15.6918 8.91907 15.9717 8.63922 15.9717 8.29407V5.58105C15.9717 4.09241 14.7604 2.88116 13.2718 2.88116H12.6025V2.49268C12.6025 2.14752 12.3227 1.86768 11.9775 1.86768C11.6324 1.86768 11.3525 2.14752 11.3525 2.49268V2.88116H5.86761V2.49268C5.86761 2.14752 5.58777 1.86768 5.24261 1.86768C4.89746 1.86768 4.61761 2.14752 4.61761 2.49268V2.88116H3.94989C3.01926 2.88116 2.19707 3.35457 1.71146 4.07314C1.42025 4.50378 1.25 5.02258 1.25 5.58044V13.8934C1.25 15.3787 2.46124 16.5872 3.94989 16.5872ZM14.7202 5.9967H2.5V5.58105C2.5 5.38128 2.54059 5.19085 2.61398 5.01755C2.83405 4.49829 3.34896 4.133 3.94745 4.133H4.61761V4.52332C4.61761 4.86847 4.89746 5.14832 5.24261 5.14832C5.58777 5.14832 5.86761 4.86847 5.86761 4.52332V4.133H11.3525V4.52332C11.3525 4.86847 11.6324 5.14832 11.9775 5.14832C12.3227 5.14832 12.6025 4.86847 12.6025 4.52332V4.133H13.273C14.071 4.133 14.7202 4.78241 14.7202 5.58044V5.9967Z" fill="#686868"/>
                                                    <path d="M18.0234 9.99023L17.38 10.6337C16.6025 9.90185 15.5589 9.44977 14.4095 9.44977C12.0157 9.44977 10.0684 11.3971 10.0684 13.7909C10.0684 16.1847 12.0157 18.1323 14.4095 18.1323C16.8033 18.1323 18.7509 16.1847 18.7509 13.7909C18.7509 12.9991 18.5343 12.2585 18.1625 11.6187L18.9072 10.874C19.1513 10.6299 19.1513 10.2344 18.9072 9.99023C18.663 9.74609 18.2675 9.74609 18.0234 9.99023ZM17.5009 13.7909C17.5009 15.4956 16.1142 16.8823 14.4095 16.8823C12.7051 16.8823 11.3184 15.4956 11.3184 13.7909C11.3184 12.0865 12.7051 10.6998 14.4095 10.6998C15.2142 10.6998 15.9415 11.0161 16.4921 11.5216L14.2477 13.7662L13.2956 12.814C13.0515 12.5699 12.6559 12.5699 12.4118 12.814C12.1677 13.0582 12.1677 13.4537 12.4118 13.6978L13.8058 15.0919C13.923 15.209 14.082 15.275 14.2477 15.275C14.4135 15.275 14.5724 15.209 14.6896 15.0919L17.2347 12.5467C17.4035 12.9281 17.5009 13.3477 17.5009 13.7909Z" fill="#686868"/>
                                                </svg>
                                                <p className="text-xl text-[#686868] font-medium" style={{ fontFamily: 'var(--font-anek-latin)' }}>{formattedDate}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                                                    <path d="M8.73714 16.8373C6.99221 13.9816 7.43994 10.2925 9.80635 7.92609C12.6236 5.10881 17.2038 5.09634 20.0211 7.9136C22.3789 10.2713 22.8136 13.9377 21.0726 16.7814L20.3556 17.9528L20.2115 18.145C18.8053 20.021 17.2643 21.7976 15.6063 23.4553C15.2076 23.8537 14.5604 23.8547 14.1617 23.456C12.5072 21.8019 10.9728 20.0317 9.5705 18.1589L9.42983 17.971L8.73714 16.8373Z" stroke="#686868" strokeWidth="1.5"/>
                                                    <path d="M14.8828 16.2891C16.4361 16.2891 17.6953 15.0299 17.6953 13.4766C17.6953 11.9233 16.4361 10.6641 14.8828 10.6641C13.3295 10.6641 12.0703 11.9233 12.0703 13.4766C12.0703 15.0299 13.3295 16.2891 14.8828 16.2891Z" stroke="#686868" strokeWidth="1.5"/>
                                                </svg>
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
                onSuccess={() => router.push(`/events/${id}/book`)}
            />
        </div>
    );
}
