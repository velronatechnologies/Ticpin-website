'use client';

import { useRouter } from 'next/navigation';
import { Share2, MapPin, ChevronDown, Ticket, Timer, ArrowLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import { useUserSession } from '@/lib/auth/user';
import { getOrganizerSession, clearOrganizerSession } from '@/lib/auth/organizer';
import AuthModal from '@/components/modals/AuthModal';
import OrganizerLogoutModal from '@/components/modals/OrganizerLogoutModal';
import MobileEventDetails from '@/components/mobile/MobileEventDetails';

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
}

export default function EventDetailClient({ event, id }: { event: EventData, id: string }) {
    const router = useRouter();
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const session = useUserSession();
    const organizerSession = getOrganizerSession();

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleBook = () => {
        // Check if organizer is logged in
        if (organizerSession) {
            setShowLogoutModal(true);
            return;
        }

        if (!session) {
            setIsLoginModalOpen(true);
            return;
        }
        router.push(`/events/${id}/book`);
    };

    const handleOrganizerLogout = () => {
        clearOrganizerSession();
        // Show user auth modal after organizer logout
        setIsLoginModalOpen(true);
    };

    const formattedDate = useMemo(() => {
        if (!event?.date) return '';
        return new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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

    const bannerImg = useMemo(() => event?.portrait_image_url || event?.landscape_image_url || '', [event]);

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
                                        <img src="/language logo.svg" alt="Language" className="w-[28px] h-[28px] shrink-0" />
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

                        {/* Artist Section */}
                        {event.artists && event.artists.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Artist</h2>
                                <div className="flex flex-col gap-6">
                                    {event.artists.map((artist, idx) => (
                                        <div key={idx} className="flex items-center gap-10">
                                            <div className="relative w-[169px] h-[169px] bg-white rounded-[15px] border border-[#AEAEAE] overflow-hidden flex items-center justify-center">
                                                {artist.image_url ? (
                                                    <Image src={artist.image_url} alt={artist.name} fill className="object-cover" />
                                                ) : (
                                                    <span className="text-4xl font-bold text-[#7B2FF7] opacity-40">{artist.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <span className="text-[24px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>{artist.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

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
                                            <p className="text-xl text-[#686868] font-medium" style={{ fontFamily: 'var(--font-anek-latin)' }}>{event.category}{event.sub_category ? ` · ${event.sub_category}` : ''}</p>
                                            <p className="text-xl text-[#686868] font-medium" style={{ fontFamily: 'var(--font-anek-latin)' }}>{formattedDate}</p>
                                            <p className="text-xl text-[#686868] font-medium" style={{ fontFamily: 'var(--font-anek-latin)' }}>{event.venue_name || event.city || 'Location TBA'}</p>
                                        </div>
                                    </div>

                                    <div className="w-full h-[1.5px] bg-[#686868]/60" />
                                    <div className="flex items-center justify-between gap-4">
                                        <div style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                            <span className="text-xs font-medium text-[#686868] pl-[18px] tracking-wide uppercase">Starts from</span>
                                            <span className="text-2xl font-medium text-black block pl-[18px]">₹{event.price_starts_from?.toLocaleString('en-IN') || 'TBA'}</span>
                                        </div>
                                        <button
                                            onClick={handleBook}
                                            className="w-[140px] h-[46px] bg-black text-white rounded-[10px] flex items-center justify-center active:scale-[0.98] transition-all hover:bg-zinc-800"
                                        >
                                            <span
                                                style={{
                                                    fontFamily: "var(--font-anek-tamil-condensed)",
                                                    fontWeight: 500,
                                                    lineHeight: "2.5"
                                                }}
                                                className="text-[30px] tracking-normal uppercase"
                                            >
                                                BOOK TICKETS
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full min-h-[410px] bg-[#2A2A2A] relative overflow-hidden text-white px-6 md:px-[80px] pt-20 md:pt-[136px] pb-10 md:pb-0">
                <div className="flex flex-col md:flex-row justify-between gap-10">
                    <div>
                        <Image src="/ticpin-logo-black.png" alt="TICPIN" width={150} height={40} className="brightness-0 invert" />
                    </div>
                    <div className="flex flex-wrap gap-6 md:gap-[40px] text-[16px] font-semibold" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        <a href="#" className="hover:text-purple-300">Terms & Conditions</a>
                        <a href="#" className="hover:text-purple-300">Privacy Policy</a>
                        <a href="#" className="hover:text-purple-300">Contact Us</a>
                        <a href="#" className="hover:text-purple-300">List your events</a>
                    </div>
                </div>

                <div className="md:absolute md:bottom-[20px] md:left-[80px] md:right-[80px] mt-12">
                    <div className="w-full h-[1px] bg-white mb-[20px] opacity-20" />
                    <div className="flex flex-col md:flex-row justify-between items-center text-[#AEAEAE] text-[16px] font-medium" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        <p className="max-w-[900px] text-center md:text-left mb-6 md:mb-0 leading-snug">
                            By accessing this page, you confirm that you have read, understood, and agreed to our Terms of Service, Cookie Policy, Privacy Policy, and Content Guidelines. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors">
                                <Share2 className="w-4 h-4 text-black" />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <AuthModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => router.push(`/events/${id}/book`)}
            />

            <OrganizerLogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleOrganizerLogout}
                organizerName={organizerSession?.email}
            />
        </div>
    );
}
