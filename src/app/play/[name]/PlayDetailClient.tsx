'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import { ChevronDown, MapPin, Clock, ParkingCircle, Bath, Shirt, Droplets, Wind, Wifi, X, Plus, ShowerHead, Utensils, Lock, HeartPulse, Armchair, Toilet } from 'lucide-react';
import { useUserSession } from '@/lib/auth/user';
import { useOrganizerSession, clearOrganizerSession } from '@/lib/auth/organizer';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import MobilePlayDetails from '@/components/mobile/MobilePlayDetails';
import { useIsMobile } from '@/hooks/use-mobile';


const AuthModal = dynamic(() => import('@/components/modals/AuthModal'), { ssr: false });
const OrganizerLogoutModal = dynamic(() => import('@/components/modals/OrganizerLogoutModal'), { ssr: false });

/**
 * Converts any stored time string to 12-hr AM/PM display format.
 * Handles: "09:00" (24-hr), "9:00" (24-hr), "09:00 AM" (already 12-hr).
 * For composite "HH:MM - HH:MM" strings, converts both halves.
 */
function toDisplayTime(t: string): string {
    if (!t) return t;
    const s = t.trim();

    // Composite "open - close" — convert both sides
    if (s.includes(' - ')) {
        const [a, b] = s.split(' - ');
        return `${toDisplayTime(a.trim())} - ${toDisplayTime(b.trim())}`;
    }

    // Already has AM/PM — return as-is
    if (/AM|PM/i.test(s)) return s;

    // Pure 24-hr "HH:MM" or "H:MM"
    const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
    if (m24) {
        let h = parseInt(m24[1], 10);
        const min = m24[2];
        const period = h >= 12 ? 'PM' : 'AM';
        if (h === 0) h = 12;
        else if (h > 12) h -= 12;
        return `${String(h).padStart(2, '0')}:${min} ${period}`;
    }

    return s; // unrecognised — show as-is
}

interface RealPlay {
    id: string;
    name: string;
    description?: string;
    category?: string;
    sub_category?: string;
    city?: string;
    venue_name?: string;
    venue_address?: string;
    google_map_link?: string;
    instagram_link?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    card_video_url?: string;
    gallery_urls?: string[];
    secondary_banner_url?: string;
    time?: string;
    opening_time?: string;
    closing_time?: string;
    pricing_plans?: { start_time: string; end_time: string; min_duration: string; price: number }[];
    pricing_format?: string;
    price_per_slot?: number;
    courts?: { id: string; name: string; type: string; price: number; image_url?: string }[];
    guide?: { facilities: string[] | string; is_pet_friendly: boolean };
    event_instructions?: string;
    youtube_video_url?: string;
    prohibited_items?: string[];
    faqs?: { question: string; answer: string }[];
    terms?: string;
    price_starts_from?: number;
    min_duration?: string;
}

export default function PlayDetailClient({ venue, id, isMobileServer }: { venue: RealPlay; id: string; isMobileServer?: boolean }) {
    const router = useRouter();
    const [isAboutExpanded, setIsAboutExpanded] = useState(false);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isOrgLogoutModalOpen, setIsOrgLogoutModalOpen] = useState(false);
    const [isFacilitiesModalOpen, setIsFacilitiesModalOpen] = useState(false);
    const session = useUserSession();
    const organizerSession = useOrganizerSession();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const isMobile = useIsMobile(isMobileServer);

    useEffect(() => {
        if (venue?.name) {
            router.prefetch(`/play/${encodeURIComponent(venue.name)}/book`);
        }
    }, [venue?.name, router]);

    const handleBook = () => {
        if (!venue) return;

        // 1. If no User session, show generic login
        if (!session) {
            setIsLoginModalOpen(true);
            return;
        }

        // 2. Proceed to booking
        router.push(`/play/${encodeURIComponent(venue.name)}/book`);
    };

    const toggleAccordion = (section: string) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    const sanitizedDescription = useMemo(() => {
        if (!venue?.description) return '';
        return DOMPurify.sanitize(venue.description);
    }, [venue?.description]);

    // Mobile view
    if (isMobile) {
        return <MobilePlayDetails venue={venue} offers={[]} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white font-[family-name:var(--font-anek-latin)] pt-[20px]">
            <main className="max-w-[1440px] mx-auto px-4 md:px-14 py-8 ">
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-10">
                        <div className="relative w-full h-[350px] md:h-[500px] rounded-[15px] overflow-hidden s">
                            <Image
                                src={venue.landscape_image_url || venue.portrait_image_url || "/login/banner.jpeg"}
                                alt={venue.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* <div className="absolute inset-0 bg-black/10 trans" /> */}
                        </div>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-semibold text-black">About the Venue</h2>
                            <div className="relative">
                                <div
                                    className={`text-[#686868] text-lg font-medium leading-relaxed prose prose-zinc max-w-none ${!isAboutExpanded && 'line-clamp-3'}`}
                                    dangerouslySetInnerHTML={{ __html: sanitizedDescription || "Experience the finest sports infrastructure at our venue. Whether you're a professional athlete or a weekend warrior, we provide the perfect environment for your favorite sports." }}
                                />
                                <button
                                    onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                                    className="flex items-center gap-1 mt-2 text-black font-bold"
                                >
                                    Show {isAboutExpanded ? 'less' : 'more'} <ChevronDown className={`transition-transform grow-0 ${isAboutExpanded ? 'rotate-180' : ''}`} size={16} />
                                </button>
                            </div>
                        </section>
                        <hr className='mt-[-10px]' />
                        <section className="space-y-4 mt-[-20px]">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-black">Venue Guide</h2>
                                {(() => {
                                    const facs = Array.isArray(venue.guide?.facilities)
                                        ? venue.guide.facilities
                                        : venue.guide?.facilities
                                            ? String(venue.guide.facilities).split(',').map(f => f.trim()).filter(Boolean)
                                            : [];
                                    if (facs.length > 2) {
                                        return (
                                            <button
                                                onClick={() => setIsFacilitiesModalOpen(true)}
                                                className="flex items-center gap-1 text-black font-semibold text-[15px] hover:opacity-70 transition-opacity"
                                            >
                                                See all <ChevronDown size={16} className="-rotate-90" />
                                            </button>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {(venue.time?.trim() || venue.pricing_plans?.length || (venue.opening_time?.trim() && venue.closing_time?.trim())) && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#D9D9D9] rounded-[10px] flex items-center justify-center text-[#686868]">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#686868] font-medium uppercase tracking-wider mb-1">DURATIONS</p>
                                            <p className="text-base font-semibold text-black">
                                                {venue.min_duration || venue.pricing_plans?.[0]?.min_duration || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {venue.guide && (() => {
                                    const facs = Array.isArray(venue.guide.facilities)
                                        ? venue.guide.facilities
                                        : venue.guide.facilities
                                            ? String(venue.guide.facilities).split(',').map(f => f.trim()).filter(Boolean)
                                            : [];

                                    const getIcon = (name: string) => {
                                        const n = name.toLowerCase();
                                        if (n.includes('park')) return <ParkingCircle size={24} />;
                                        if (n.includes('chang')) return <Shirt size={24} />;
                                        if (n.includes('shower')) return <ShowerHead size={24} />;
                                        if (n.includes('wash') || n.includes('restroom') || n.includes('toilet')) return <Toilet size={24} />;
                                        if (n.includes('water')) return <Droplets size={24} />;
                                        if (n.includes('ac') || n.includes('air')) return <Wind size={24} />;
                                        if (n.includes('wifi') || n.includes('internet')) return <Wifi size={24} />;
                                        if (n.includes('cafe') || n.includes('food') || n.includes('cafeter')) return <Utensils size={24} />;
                                        if (n.includes('locker')) return <Lock size={24} />;
                                        if (n.includes('first aid') || n.includes('firstaid') || n.includes('medical')) return <HeartPulse size={24} />;
                                        if (n.includes('seat')) return <Armchair size={24} />;
                                        if (n.includes('equip') || n.includes('rental')) return <Armchair size={24} />;
                                        return <Plus size={24} />;
                                    };

                                    const displayFacs = facs.slice(0, 2); // Show only 2 facilities to make total 3 with timings

                                    return (
                                        <>
                                            {displayFacs.map((f) => (
                                                <div key={f} className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-[#D9D9D9] rounded-[10px] flex items-center justify-center text-[#686868]">
                                                        {getIcon(f)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-[#686868] font-medium uppercase tracking-wider mb-1">FACILITY</p>
                                                        <p className="text-base font-semibold text-black uppercase">{f}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    );
                                })()}
                            </div>
                        </section>

                        {/* {venue.courts && venue.courts.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold text-black">Available Courts</h2>
                                <div className="space-y-3">
                                    {venue.courts.map((court, index) => (
                                        <div key={`${court.id}-${index}`} className="flex items-center gap-4 p-4 bg-white rounded-[16px] border border-zinc-200">
                                            <div className="w-[90px] h-[70px] rounded-[12px] overflow-hidden shrink-0 bg-[#D9D9D9] relative">
                                                {court.image_url ? (
                                                    <Image src={court.image_url} alt={court.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-zinc-400 text-[10px] font-bold uppercase">COURT</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-lg font-semibold text-black uppercase">{court.name}</p>
                                                <p className="text-sm text-[#686868] font-medium">{court.type}</p>
                                            </div>
                                            <p className="text-lg font-bold text-black">₹{court.price}<span className="text-sm font-medium text-[#686868]">/hr</span></p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )} */}

                        {(venue.gallery_urls && venue.gallery_urls.length > 0) || venue.secondary_banner_url ? (
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-black">Gallery</h2>
                                {venue.gallery_urls && venue.gallery_urls.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {venue.gallery_urls.map((url, i) => (
                                            <div key={url} className="aspect-square rounded-[20px] overflow-hidden border border-zinc-200 relative">
                                                <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {venue.secondary_banner_url && (
                                    <div className="w-full rounded-[15px] overflow-hidden border border-zinc-200 relative aspect-video">
                                        <Image
                                            src={venue.secondary_banner_url}
                                            alt="Secondary Banner"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                            </section>
                        ) : null}

                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Venue</h2>
                            <div className="p-6 bg-white rounded-[10px] border border-[#AEAEAE] flex flex-col md:flex-row items-center justify-between gap-8 min-h-[97px]">
                                <div className="space-y-1 flex-1">
                                    <h3 className="text-xl font-semibold text-blacl" style={{ fontFamily: 'var(--font-anek-latin)' }}>{venue.venue_name || venue.name}</h3>
                                    <p className="text-base font-medium text-[#686868] leading-relaxed">
                                        {venue.venue_address || venue.city}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (venue.google_map_link) {
                                            window.open(venue.google_map_link, '_blank');
                                        }
                                    }}
                                    className="flex items-center justify-center gap-2 w-[154px] h-[44px] bg-white border border-[#AEAEAE] rounded-[7px] text-black font-medium uppercase text-[18px] hover:bg-zinc-50 transition-all shrink-0"
                                    style={{ fontFamily: 'var(--font-anek-tamil)', lineHeight: '1.2' }}
                                >
                                    <MapPin size={18} className="text-black" />
                                    <span>GET DIRECTIONS</span>
                                </button>
                            </div>
                        </section>

                        <div className="space-y-5">
                            <div
                                className="p-6 bg-white border border-[#AEAEAE] rounded-[10px] cursor-pointer min-h-[80px] flex flex-col justify-center"
                                onClick={() => toggleAccordion('terms')}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Terms & Conditions</h3>
                                    <ChevronDown className={`transition-transform text-[#000000] w-6 h-6 ${openAccordion === 'terms' ? 'rotate-180' : ''}`} />
                                </div>
                                {openAccordion === 'terms' && (
                                    <div className="mt-4 text-[#686868] text-base font-medium animate-in fade-in slide-in-from-top-2 duration-300 border-t pt-4">
                                        {venue.terms || "Standard terms and conditions apply."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[392px]">
                        <div className="space-y-6">
                            <div className="box-border w-full lg:w-[392px] h-[235px] bg-white rounded-[12px] border border-[#686868]/30 overflow-hidden">
                                <div className="h-full p-6  flex flex-col justify-between mt-[-10px]">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-semibold text-black">{venue.name}</h3>
                                        <div className="space-y-2">
                                            {venue.sub_category && (
                                                <div>
                                                    <p className="text-xs text-[#686868] font-medium uppercase tracking-wider mb-0.5">Play options</p>
                                                    <p className="text-lg text-black font-medium mt-[-5px]">{venue.sub_category}</p>
                                                </div>
                                            )}
                                            {venue.city && (
                                                <div>
                                                    <p className="text-xs text-[#686868] font-medium uppercase tracking-wider mb-0.5">Location</p>
                                                    <p className="text-lg text-black font-medium mt-[-5px]">{venue.city}</p>
                                                </div>
                                            )}
                                            {/* {venue.price_starts_from != null && (
                                                <p className="text-lg text-black font-semibold mt-1">From ₹{venue.price_starts_from} / hr</p>
                                            )} */}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-[#686868]/20 flex justify-center mt-[9px]">
                                        <button
                                            onClick={handleBook}
                                            className="w-[357px] h-[43px] bg-black text-white rounded-[9px] flex items-center justify-center"
                                        >
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    fontFamily: "'Anek Tamil Medium', sans-serif",
                                                    lineHeight: 1
                                                }}
                                                className="text-[25px] uppercase font-medium"
                                            >
                                                BOOK SLOTS
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <BottomBanner />
            <Footer />
            <AuthModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => router.push(`/play/${encodeURIComponent(venue.name)}/book`)}
            />

            {/* Facilities Modal */}
            {isFacilitiesModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[30px] w-full max-w-[600px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 flex items-center justify-between border-b border-zinc-100">
                            <h3 className="text-2xl font-bold text-black">All Facilities</h3>
                            <button onClick={() => setIsFacilitiesModalOpen(false)} className="text-[#AEAEAE] hover:text-black transition-colors">
                                <X size={32} />
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {(() => {
                                    const facs = Array.isArray(venue.guide?.facilities)
                                        ? venue.guide?.facilities
                                        : venue.guide?.facilities
                                            ? String(venue.guide.facilities).split(',').map(f => f.trim()).filter(Boolean)
                                            : [];

                                    const getIcon = (name: string) => {
                                        const n = name.toLowerCase();
                                        if (n.includes('park')) return <ParkingCircle size={20} />;
                                        if (n.includes('chang')) return <Shirt size={20} />;
                                        if (n.includes('shower')) return <ShowerHead size={20} />;
                                        if (n.includes('wash') || n.includes('restroom') || n.includes('toilet')) return <Toilet size={20} />;
                                        if (n.includes('water')) return <Droplets size={20} />;
                                        if (n.includes('ac') || n.includes('air')) return <Wind size={20} />;
                                        if (n.includes('wifi') || n.includes('internet')) return <Wifi size={20} />;
                                        if (n.includes('cafe') || n.includes('food') || n.includes('cafeter')) return <Utensils size={20} />;
                                        if (n.includes('locker')) return <Lock size={20} />;
                                        if (n.includes('first aid') || n.includes('firstaid') || n.includes('medical')) return <HeartPulse size={20} />;
                                        if (n.includes('seat')) return <Armchair size={20} />;
                                        if (n.includes('equip') || n.includes('rental')) return <Armchair size={20} />;
                                        return <Plus size={20} />;
                                    };

                                    return facs.map((f) => (
                                        <div key={f} className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-[15px]">
                                            <div className="text-[#686868]">{getIcon(f)}</div>
                                            <span className="text-[17px] font-semibold text-black uppercase">{f}</span>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                        <div className="p-8 bg-zinc-50 flex justify-center">
                            <button
                                onClick={() => setIsFacilitiesModalOpen(false)}
                                className="px-12 h-[50px] bg-black text-white rounded-[15px] text-[18px] font-bold uppercase"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = `
    @font-face {
        font-family: 'Anek Tamil Medium';
        src: url('/AnekTamil_Condensed-Medium.ttf') format('truetype');
        font-weight: 500;
        font-style: normal;
    }
`;

if (typeof document !== 'undefined') {
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
}
