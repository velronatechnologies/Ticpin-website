'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronRight, Star, Bell, Calendar, Utensils, PlayCircle, Loader2 } from 'lucide-react';
import { useLocation } from '@/lib/useLocation';
import { useLocationStore } from '@/store/useLocationStore';
import { useUserSession } from '@/lib/auth/user';
import Image from 'next/image';

import dynamic from 'next/dynamic';
import { useIdentityStore } from '@/store/useIdentityStore';
import MobileEventCard from '@/components/mobile/MobileEventCard';

const AuthModal = dynamic(() => import('@/components/modals/AuthModal'), { ssr: false });
const LocationModal = dynamic(() => import('@/components/modals/LocationModal'), { ssr: false });
const ProfileDrawer = dynamic(() => import('@/components/layout/Navbar/ProfileDrawer'), { ssr: false });

interface Artist {
    name: string;
    image_url?: string;
    description?: string;
}

interface Event {
    id: string;
    name: string;
    date?: string;
    time?: string;
    location?: string;
    venue_name?: string;
    city?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    price_starts_from?: number;
    artists?: Artist[];
}

interface Dining {
    id: string;
    name: string;
    city?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    rating?: number;
}

interface Play {
    id: string;
    name: string;
    city?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    rating?: number;
}

interface MobileHomeProps {
    events: Event[];
    dinings: Dining[];
    plays: Play[];
}

export default function MobileHome({ events, dinings, plays }: MobileHomeProps) {
    const router = useRouter();
    const city = useLocation();
    const { userSession, organizerSession, sync, logoutUser, logoutOrganizer } = useIdentityStore();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    // Organizer takes priority when dual-logged-in; user as fallback.
    // This drives which avatar/name is shown in the header.
    const activeSession = organizerSession || userSession;
    const session = activeSession; // keep alias for existing usage below
    const { setLocation } = useLocationStore();
    const [windowWidth, setWindowWidth] = useState(390); // fixed default to avoid SSR hydration mismatch

    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const placeholders = ["events", "dining", "play"];
    const [activeTab, setActiveTab] = useState<'events' | 'dining' | 'play'>('events');

    // Local self-healing states to support independent entry routes (like /play on mobile)
    const [localEvents, setLocalEvents] = useState<Event[]>(events || []);
    const [localDinings, setLocalDinings] = useState<Dining[]>(dinings || []);
    const [localPlays, setLocalPlays] = useState<Play[]>(plays || []);

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchDataRef = useRef<any[]>([]);

    const fetchSearchData = async () => {
        if (searchDataRef.current.length > 0) return;
        setIsSearching(true);
        try {
            const [eventsRes, playsRes, diningsRes] = await Promise.all([
                fetch('/backend/api/events').then(r => r.json()).catch(() => ({ data: [] })),
                fetch('/backend/api/play').then(r => r.json()).catch(() => ({ data: [] })),
                fetch('/backend/api/dining').then(r => r.json()).catch(() => ({ data: [] }))
            ]);

            const combined: any[] = [
                ...(eventsRes.data || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    type: 'event',
                    category: item.category,
                    location: item.venue_name || item.city,
                    landscape_image_url: item.landscape_image_url
                })),
                ...(playsRes.data || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    type: 'play',
                    category: item.category,
                    location: item.city,
                    landscape_image_url: item.landscape_image_url
                })),
                ...(diningsRes.data || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    type: 'dining',
                    category: item.category,
                    location: item.city,
                    landscape_image_url: item.landscape_image_url
                }))
            ];
            searchDataRef.current = combined;
        } catch (error) {
            console.error('Failed to fetch search data:', error);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            fetchSearchData();
            const filtered = searchDataRef.current.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.location?.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 8);
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const handleResultClick = (result: any) => {
        const path = result.type === 'event'
            ? `/events/${encodeURIComponent(result.name)}`
            : result.type === 'play'
                ? `/play/${encodeURIComponent(result.name)}`
                : `/dining/venue/${encodeURIComponent(result.name)}`;
        router.push(path);
        setSearchQuery('');
    };

    // Sync state when props change or initialize
    useEffect(() => {
        if (events && events.length > 0) setLocalEvents(events);
        if (dinings && dinings.length > 0) setLocalDinings(dinings);
        if (plays && plays.length > 0) setLocalPlays(plays);
    }, [events, dinings, plays]);

    // Automatically set default active tab based on which props have data on load
    useEffect(() => {
        if (events && events.length === 0 && dinings && dinings.length === 0 && plays && plays.length > 0) {
            setActiveTab('play');
        } else if (events && events.length === 0 && dinings && dinings.length > 0) {
            setActiveTab('dining');
        }
    }, [events, dinings, plays]);

    // Client-side self-healing dynamic loader to fetch complete data for other tabs
    useEffect(() => {
        // Only fetch if we are missing data
        if (localEvents.length > 0 && localDinings.length > 0 && localPlays.length > 0) return;

        fetch('/backend/api/mobile/home')
            .then(res => {
                if (!res.ok) return null; // backend offline — silently skip, no error thrown
                return res.json();
            })
            .then(data => {
                if (!data) return;
                if (data.events && data.events.length > 0 && localEvents.length === 0) {
                    setLocalEvents(data.events);
                }
                if (data.dinings && data.dinings.length > 0 && localDinings.length === 0) {
                    setLocalDinings(data.dinings);
                }
                if (data.plays && data.plays.length > 0 && localPlays.length === 0) {
                    setLocalPlays(data.plays);
                }
            })
            .catch(() => { /* backend offline — silently ignore */ });
    }, []); // Only run on mount, and only if data is missing

    useEffect(() => {
        sync();
    }, [sync]);

    const carouselRef = useRef<HTMLDivElement>(null);
    const limelightRef = useRef<HTMLDivElement>(null);
    const playRef = useRef<HTMLDivElement>(null);
    const [scrollX, setScrollX] = useState(0);
    const [limelightScrollX, setLimelightScrollX] = useState(0);
    const [playScrollX, setPlayScrollX] = useState(0);

    const eventItems = localEvents.slice(0, 5);
    const scrollEvents = eventItems.length >= 3
        ? [...eventItems, ...eventItems, ...eventItems]
        : eventItems;
    const limelightItems = localDinings.slice(0, 5);
    const scrollLimelight = limelightItems.length >= 3
        ? [...limelightItems, ...limelightItems, ...limelightItems]
        : limelightItems;
    const playItems = localPlays.slice(0, 5);
    const scrollPlay = playItems.length >= 3
        ? [...playItems, ...playItems, ...playItems]
        : playItems;

    const uniqueArtists = (() => {
        const all = localEvents.flatMap(e => e.artists || []).filter(a => a.name);
        const seen = new Set<string>();
        return all.filter(a => {
            const k = a.name.toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });
    })();

    useEffect(() => {
        // Set the real width on mount (client only, after hydration)
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Initial center scroll for loop
    useEffect(() => {
        if (carouselRef.current && localEvents.length > 0) {
            const container = carouselRef.current;
            const cardWidth = 280 + 24;
            const itemCount = Math.min(localEvents.length, 5);
            if (itemCount >= 3) {
                const initialScroll = cardWidth * itemCount;
                container.scrollLeft = initialScroll;
                setScrollX(initialScroll);
            }
        }
        if (limelightRef.current && localDinings.length > 0) {
            const container = limelightRef.current;
            const cardWidth = 326 + 24;
            const itemCount = limelightItems.length;
            if (itemCount >= 3) {
                const initialScroll = cardWidth * itemCount;
                container.scrollLeft = initialScroll;
                setLimelightScrollX(initialScroll);
            }
        }
        if (playRef.current && localPlays.length > 0) {
            const container = playRef.current;
            const cardWidth = 326 + 24;
            const itemCount = playItems.length;
            if (itemCount >= 3) {
                const initialScroll = cardWidth * itemCount;
                container.scrollLeft = initialScroll;
                setPlayScrollX(initialScroll);
            }
        }
    }, [localEvents.length, localDinings.length, localPlays.length]);

    const handleScroll = () => {
        if (!carouselRef.current || localEvents.length === 0) return;
        const container = carouselRef.current;
        const cardWidth = 280 + 24;
        const itemCount = Math.min(localEvents.length, 5);
        if (itemCount < 3) return;
        const thirdWidth = cardWidth * itemCount;

        setScrollX(container.scrollLeft);

        if (container.scrollLeft <= 0) {
            container.scrollLeft = thirdWidth;
        } else if (container.scrollLeft >= thirdWidth * 2) {
            container.scrollLeft = thirdWidth;
        }
    };

    const handleLimelightScroll = () => {
        if (!limelightRef.current || localDinings.length === 0) return;
        const container = limelightRef.current;
        const cardWidth = 326 + 24;
        const itemCount = limelightItems.length;
        if (itemCount < 3) return;
        const thirdWidth = cardWidth * itemCount;

        setLimelightScrollX(container.scrollLeft);

        if (container.scrollLeft <= 0) {
            container.scrollLeft = thirdWidth;
        } else if (container.scrollLeft >= thirdWidth * 2) {
            container.scrollLeft = thirdWidth;
        }
    };

    const handlePlayScroll = () => {
        if (!playRef.current || localPlays.length === 0) return;
        const container = playRef.current;
        const cardWidth = 326 + 24;
        const itemCount = playItems.length;
        if (itemCount < 3) return;
        const thirdWidth = cardWidth * itemCount;

        setPlayScrollX(container.scrollLeft);

        if (container.scrollLeft <= 0) {
            container.scrollLeft = thirdWidth;
        } else if (container.scrollLeft >= thirdWidth * 2) {
            container.scrollLeft = thirdWidth;
        }
    };

    return (
        <div
            className="md:hidden min-h-screen w-full overflow-x-hidden font-sans selection:bg-[#866BFF]/20"
            style={{ background: 'white' }}
        >
            {/* 1. Header Section */}
            <header className="px-6 pt-7 pb-4">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                     
                        <button
                            className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
                            onClick={() => setIsLocationOpen(true)}
                        >
                            <MapPin size={15} className="text-zinc-800" />
                            <span className="text-[14px] font-medium text-black leading-none truncate max-w-[100px]">{city || 'Location'}</span>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5">
                                <path d="M2 4L6 8L10 4" stroke="#686868" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <div
                        className="w-[42px] h-[42px] rounded-full bg-[#D9D9D9] flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => {
                            if (session) {
                                setIsProfileDrawerOpen(true);
                            } else {
                                setIsAuthOpen(true);
                            }
                        }}
                    >
                        {(organizerSession as any)?.profilePhoto ? (
                            <Image src={(organizerSession as any).profilePhoto} alt="Profile" width={42} height={42} className="object-cover" />
                        ) : userSession?.profilePhoto ? (
                            <Image src={userSession.profilePhoto} alt="Profile" width={42} height={42} className="object-cover" />
                        ) : (organizerSession || userSession) ? (
                            <span className="text-white text-[14px] font-bold uppercase bg-[#866BFF] w-full h-full rounded-full flex items-center justify-center">
                                {(organizerSession?.email || userSession?.name || userSession?.email || 'U').charAt(0).toUpperCase()}
                            </span>
                        ) : (
                            <img src="/profile icon.svg" alt="Profile" className="w-6 h-6" />
                        )}
                    </div>
                </div>

                {/* 2. Search Bar */}
                <div className="relative w-full h-[48px] bg-white rounded-[28px] border border-[#AEAEAE] flex items-center px-5 mb-14 z-50">
                    <Search size={22} className="text-[#AEAEAE] flex-shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ml-3 w-full bg-transparent border-none outline-none text-[15px] font-medium text-black placeholder:text-[#AEAEAE]"
                        placeholder=""
                    />
                    {!searchQuery && (
                        <div className="absolute left-[54px] top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
                            <span className="text-[15px] font-medium text-[#AEAEAE]">Search for</span>
                            <div className="relative h-5 w-20 overflow-hidden">
                                {placeholders.map((text, i) => (
                                    <span
                                        key={i}
                                        className={`absolute left-0 top-0 text-[15px] font-medium text-[#AEAEAE] h-5 flex items-center transition-all duration-700 ease-in-out ${i === placeholderIndex ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
                                            }`}
                                    >
                                        {text}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {searchQuery.trim().length > 0 && (
                        <div className="absolute top-[52px] left-0 right-0 bg-white border border-[#AEAEAE] rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                            {isSearching ? (
                                <div className="px-4 py-8 flex items-center justify-center gap-2 text-zinc-500">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-sm font-medium">Searching...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="py-2">
                                    {searchResults.map((result) => (
                                        <button
                                            key={`${result.type}-${result.id}`}
                                            onClick={() => handleResultClick(result)}
                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left border-b border-gray-100 last:border-0"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 rounded-[8px] bg-[#FAF6F6] border border-[#AEAEAE]/20 overflow-hidden flex items-center justify-center">
                                                {result.landscape_image_url ? (
                                                    <img
                                                        src={result.landscape_image_url}
                                                        alt={result.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-gray-500">
                                                        {result.type === 'event' && <Calendar size={20} />}
                                                        {result.type === 'play' && <PlayCircle size={20} />}
                                                        {result.type === 'dining' && <Utensils size={20} />}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-black truncate uppercase tracking-tight">
                                                    {result.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider font-medium">
                                                    <span>{result.type}</span>
                                                    {result.location && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                            <span className="flex items-center gap-0.5 truncate">
                                                                <MapPin size={10} />
                                                                {result.location}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-sm text-gray-500 font-medium font-[family-name:var(--font-anek-latin)]">
                                        No results found for "{searchQuery}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. Horizontal Divider */}
                <div className="w-full h-[1px] bg-[#AEAEAE] opacity-100 mb-6 mt-[-20px]" />

                {/* 4. Categories Section */}
                <div className="grid grid-cols-3 gap-4 px-1 text-center">
                    {/* Dining */}
                    <div className="flex flex-col items-center" onClick={() => router.push('/dining')}>
                        <div
                            className="w-full aspect-[106/125] rounded-[25px] border border-[#D9D9D9] flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all duration-300"
                            style={{ background: 'linear-gradient(180deg, #FFFFFF 50%, #E2D9FF 100%)' }}
                        >
                            <img src="/mobile_icons/Dining 1.svg" alt="Dining" className="w-[60%] h-[60%] object-contain" />
                            <span className="text-[15px] font-medium text-black uppercase tracking-tight">DINING</span>
                        </div>
                    </div>

                    {/* Events */}
                    <div className="flex flex-col items-center" onClick={() => router.push('/events')}>
                        <div
                            className="w-full aspect-[106/125] rounded-[30px] flex flex-col items-center justify-center gap-2 cursor-pointer border border-[#D9D9D9] active:scale-95 transition-all duration-300"
                            style={{ background: 'linear-gradient(180deg, #FFFFFF 50%, #E2D9FF 100%)' }}
                        >
                            <img src="/mobile_icons/Events 1.svg" alt="Events" className="w-[60%] h-[60%] object-contain" />
                            <span className="text-[15px] font-medium text-black uppercase tracking-tight">EVENTS</span>
                        </div>
                    </div>

                    {/* Play */}
                    <div className="flex flex-col items-center" onClick={() => router.push('/play')}>
                        <div
                            className="w-full aspect-[106/125] rounded-[30px] flex flex-col items-center justify-center gap-2 cursor-pointer border border-[#D9D9D9] active:scale-95 transition-all duration-300"
                            style={{ background: 'linear-gradient(180deg, #FFFFFF 50%, #FFF4C1 100%)' }}
                        >
                            <img src="/mobile_icons/Pickelball 1.svg" alt="Play" className="w-[60%] h-[60%] object-contain" />
                            <span className="text-[15px] font-medium text-black uppercase tracking-tight">PLAY</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 5. Sections Container */}
            <main className="mt-12 space-y-16 pb-12">
                {localEvents && localEvents.length > 0 && (
                    <>
                        {/* Hot Right Now Section */}
                        <section>
                            <h2 className="text-[20px] font-medium text-black text-center mb-8 uppercase tracking-wide mt-[-35px]">HOT RIGHT NOW</h2>
                            {scrollEvents.length === 1 ? (
                                <div className="flex justify-center items-center py-8 overflow-hidden w-full">
                                    <MobileEventCard
                                        key={scrollEvents[0].id}
                                        id={scrollEvents[0].id}
                                        name={scrollEvents[0].name}
                                        date={scrollEvents[0].date}
                                        time={scrollEvents[0].time}
                                        location={scrollEvents[0].location}
                                        venue_name={scrollEvents[0].venue_name}
                                        city={scrollEvents[0].city}
                                        portrait_image_url={scrollEvents[0].portrait_image_url}
                                        price_starts_from={scrollEvents[0].price_starts_from}
                                        scale={1.1}
                                        opacity={1}
                                    />
                                </div>
                            ) : (
                                <div
                                    ref={carouselRef}
                                    onScroll={handleScroll}
                                    className="flex gap-6 overflow-x-auto px-32 scrollbar-hide snap-x snap-mandatory items-center py-8"
                                >
                                    {scrollEvents.length > 0 ? scrollEvents.map((event, idx) => {
                                        const cardWidth = 280;
                                        const gap = 24;
                                        const totalCardWidth = cardWidth + gap;
                                        const containerWidth = windowWidth;
                                        const scrollCenter = scrollX + containerWidth / 2;
                                        const cardCenter = (idx * totalCardWidth) + (cardWidth / 2) + 24;
                                        const distance = Math.abs(scrollCenter - cardCenter);
                                        const threshold = totalCardWidth;
                                        const t = Math.min(distance / threshold, 1);
                                        const scale = 1.1 - t * 0.10;
                                        const opacity = 1 - t * 0;

                                        return (
                                            <MobileEventCard
                                                key={`${event.id}-${idx}`}
                                                id={event.id}
                                                name={event.name}
                                                date={event.date}
                                                time={event.time}
                                                location={event.location}
                                                venue_name={event.venue_name}
                                                city={event.city}
                                                portrait_image_url={event.portrait_image_url}
                                                price_starts_from={event.price_starts_from}
                                                scale={scale}
                                                opacity={opacity}
                                            />
                                        );
                                    }) : (
                                        <div className="w-full flex items-center justify-center py-10">
                                            <p className="text-zinc-400 text-[14px]">No events available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>


                        {/* Circular Artist squircle section matching image 1 */}
                        {/* Artist Section — from backend event data */}
                        {uniqueArtists.length > 0 && (
                            <section className="px-6 mt-[-10px]">
                                <h2 className="text-[20px] font-medium text-black text-center mb-6 uppercase tracking-wide">ARTIST</h2>
                                <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide justify-start">
                                    {uniqueArtists.map((art, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col items-center flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                                            onClick={() => router.push(`/events/artist/${encodeURIComponent(art.name)}`)}
                                        >
                                            <div className="w-[85px] h-[85px] rounded-[24px] bg-gradient-to-tr from-[#ECE8FD] to-[#D5C9FF] border border-[#AC9BF7]/50 flex items-center justify-center mb-2 shadow-sm overflow-hidden">
                                                {art.image_url ? (
                                                    <img src={art.image_url} alt={art.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[28px] font-bold text-[#5331EA] italic leading-none">{art.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-tight text-center max-w-[85px] truncate">
                                                {art.name.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* In Limelight Section */}
                {localDinings && localDinings.length > 0 && (
                    <section>
                        <h2 className="text-[20px] font-medium text-black text-center mb-8 uppercase tracking-wide mt-[-20px]">IN LIMELIGHT</h2>
                        {scrollLimelight.length === 1 ? (
                            <div className="flex justify-center items-center py-4 mt-[-30px] overflow-hidden w-full">
                                <div
                                    onClick={() => router.push(`/dining/venue/${encodeURIComponent(scrollLimelight[0].name)}`)}
                                    className="flex-shrink-0 w-[326px] max-w-[85vw] bg-white rounded-[15px] border-[0.5px] border-[#AEAEAE] overflow-hidden cursor-pointer active:scale-95 transition-all duration-150"
                                    style={{ transform: 'scale(1.05)', opacity: 1 }}
                                >
                                    <div className="w-full aspect-[326/182] bg-zinc-100 relative">
                                        {scrollLimelight[0].landscape_image_url || scrollLimelight[0].portrait_image_url ? (
                                            <img src={scrollLimelight[0].landscape_image_url || scrollLimelight[0].portrait_image_url} alt={scrollLimelight[0].name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-zinc-300 font-bold tracking-widest text-xs">DINING PREVIEW</div>
                                        )}
                                    </div>
                                    <div className="p-5 flex justify-between items-end bg-white">
                                        <div>
                                            <h3 className="text-[17px] font-bold text-black uppercase line-clamp-2">{scrollLimelight[0].name}</h3>
                                            <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-widest">{scrollLimelight[0].city || 'LOCATION'}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-400">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                ref={limelightRef}
                                onScroll={handleLimelightScroll}
                                className="flex gap-6 overflow-x-auto px-6 scrollbar-hide snap-x snap-mandatory items-center py-4 mt-[-30px]"
                            >
                                {scrollLimelight.map((item, idx) => {
                                    const cardWidth = 326;
                                    const gap = 24;
                                    const totalCardWidth = cardWidth + gap;
                                    const containerWidth = windowWidth;
                                    const scrollCenter = limelightScrollX + containerWidth / 2;
                                    const cardCenter = (idx * totalCardWidth) + (cardWidth / 2) + 24;

                                    const distance = Math.abs(scrollCenter - cardCenter);
                                    const threshold = totalCardWidth;
                                    const t = Math.min(distance / threshold, 1);

                                    const scale = 1.05 - t * 0.05;
                                    const opacity = 1 - t * 0.2;

                                    return (
                                        <div
                                            key={`limelight-${idx}`}
                                            onClick={() => router.push(`/dining/venue/${encodeURIComponent(item.name)}`)}
                                            className="flex-shrink-0 w-[326px] max-w-[85vw] bg-white rounded-[15px] border-[0.5px] border-[#AEAEAE] snap-center snap-always transition-all duration-150 ease-out origin-center overflow-hidden cursor-pointer active:scale-95"
                                            style={{
                                                transform: `scale(${scale})`,
                                                opacity: opacity
                                            }}
                                        >
                                            <div className="w-full aspect-[326/182] bg-zinc-100 relative">
                                                {item.landscape_image_url || item.portrait_image_url ? (
                                                    <img src={item.landscape_image_url || item.portrait_image_url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300 font-bold tracking-widest text-xs">DINING PREVIEW</div>
                                                )}
                                            </div>
                                            <div className="p-5 flex justify-between items-end bg-white">
                                                <div>
                                                    <h3 className="text-[17px] font-bold text-black uppercase line-clamp-2">{item.name}</h3>
                                                    <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-widest">{item.city || 'LOCATION'}</p>
                                                </div>
                                                <div className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-400">
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}



                {localPlays && localPlays.length > 0 && (
                    <>
                        {/* Play Near You Section */}
                        <section>
                            <h2 className="text-[20px] font-medium text-black text-center mb-8 uppercase tracking-wide mt-[-20px]">PLAY NEAR YOU</h2>
                            {scrollPlay.length === 1 ? (
                                <div className="flex justify-center items-center py-4 overflow-hidden w-full">
                                    <div
                                        onClick={() => router.push(`/play/${encodeURIComponent(scrollPlay[0].name)}`)}
                                        className="flex-shrink-0 w-[326px] max-w-[85vw] bg-white rounded-[15px] border-[0.5px] border-[#AEAEAE] overflow-hidden p-[1px] cursor-pointer active:scale-95 transition-all duration-150"
                                        style={{ transform: 'scale(1.05)', opacity: 1 }}
                                    >
                                        {/* Top Image Section */}
                                        <div className="w-full aspect-[326/182] rounded-t-[19px] relative bg-zinc-100">
                                            {scrollPlay[0].landscape_image_url ? (
                                                <img src={scrollPlay[0].landscape_image_url} alt={scrollPlay[0].name} className="w-full h-full object-cover rounded-t-[19px]" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-bold uppercase tracking-widest text-xs">TURF IMAGE</div>
                                            )}
                                        </div>

                                        {/* Horizontal Divider */}
                                        <div className="w-full h-[0.5px] bg-[#AEAEAE]" />

                                        {/* Bottom Details Section */}
                                        <div className="p-5 flex justify-between items-center bg-white rounded-b-[19px]">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-[19px] font-medium text-black uppercase leading-none">
                                                    {scrollPlay[0].name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 -ml-0.5">
                                                    <span className="text-[14px] font-medium text-[#866BFF] tracking-tighter">{scrollPlay[0].rating || '--'}</span>
                                                    <Star size={12} className="text-[#866BFF] fill-[#866BFF]" />
                                                </div>
                                                <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-tight">
                                                    {scrollPlay[0].city || 'LOCATION'}
                                                </p>
                                            </div>
                                            <button
                                                className="h-[42px] px-3 bg-black text-white text-[24px] font-medium rounded-[10px] uppercase transition-transform active:scale-95 leading-none flex items-center justify-center mb-5"
                                                style={{ fontFamily: "var(--font-anek-tamil-condensed), sans-serif" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/play/${encodeURIComponent(scrollPlay[0].name)}/book`);
                                                }}
                                            >
                                                BOOK SLOTS
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    ref={playRef}
                                    onScroll={handlePlayScroll}
                                    className="flex gap-6 overflow-x-auto px-6 scrollbar-hide snap-x snap-mandatory items-center py-4"
                                >
                                    {scrollPlay.length > 0 ? scrollPlay.map((item, idx) => {
                                        const cardWidth = 326;
                                        const gap = 24;
                                        const totalCardWidth = cardWidth + gap;
                                        const containerWidth = windowWidth;
                                        const scrollCenter = playScrollX + containerWidth / 2;
                                        const cardCenter = (idx * totalCardWidth) + (cardWidth / 2) + 24;

                                        const distance = Math.abs(scrollCenter - cardCenter);
                                        const threshold = totalCardWidth;
                                        const t = Math.min(distance / threshold, 1);

                                        const scale = 1.05 - t * 0.05;
                                        const opacity = 1 - t * 0.2;

                                        return (
                                            <div
                                                key={`play-${idx}`}
                                                onClick={() => router.push(`/play/${encodeURIComponent(item.name)}`)}
                                                className="flex-shrink-0 w-[326px] max-w-[85vw] bg-white rounded-[15px] border-[0.5px] border-[#AEAEAE] snap-center snap-always transition-all duration-150 ease-out origin-center overflow-hidden p-[1px] cursor-pointer active:scale-95"
                                                style={{
                                                    transform: `scale(${scale})`,
                                                    opacity: opacity
                                                }}
                                            >
                                                {/* Top Image Section */}
                                                <div className="w-full aspect-[326/182] rounded-t-[19px] relative bg-zinc-100">
                                                    {item.landscape_image_url ? (
                                                        <img src={item.landscape_image_url} alt={item.name} className="w-full h-full object-cover rounded-t-[19px]" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-bold uppercase tracking-widest text-xs">TURF IMAGE</div>
                                                    )}
                                                </div>

                                                {/* Horizontal Divider */}
                                                <div className="w-full h-[0.5px] bg-[#AEAEAE]" />

                                                {/* Bottom Details Section */}
                                                <div className="p-5 flex justify-between items-center bg-white rounded-b-[19px]">
                                                    <div className="flex flex-col gap-1">
                                                        <h3 className="text-[19px] font-medium text-black uppercase leading-none">
                                                            {item.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 -ml-0.5">
                                                            <span className="text-[14px] font-medium text-[#866BFF] tracking-tighter">{item.rating || '--'}</span>
                                                            <Star size={12} className="text-[#866BFF] fill-[#866BFF]" />
                                                        </div>
                                                        <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-tight">
                                                            {item.city || 'LOCATION'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        className="h-[42px] px-3 bg-black text-white text-[24px] font-medium rounded-[10px] uppercase transition-transform active:scale-95 leading-none flex items-center justify-center mb-5"
                                                        style={{ fontFamily: "var(--font-anek-tamil-condensed), sans-serif" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/play/${encodeURIComponent(item.name)}/book`);
                                                        }}
                                                    >
                                                        BOOK SLOTS
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="w-full flex items-center justify-center py-10">
                                            <p className="text-zinc-400 text-[14px]">No play venues available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* Footer Banner — Ticpin Pass */}
                <div className="px-6">
                    <button
                        onClick={() => router.push('/pass')}
                        className="w-full rounded-[15px] overflow-hidden relative h-[80px] mt-[-25px] block active:scale-[0.98] transition-transform"
                    >
                        <img src="/ticpin banner.jpg" alt="Ticpin Pass" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="text-white text-[18px] font-bold tracking-widest uppercase border-2 border-white/60 px-4 py-1 rounded-[8px] bg-black/20 font-[family-name:var(--font-anek-latin)]">COMING SOON</span>
                        </div>
                    </button>
                </div>
            </main>

            {/* Footer Section */}
            <footer className="bg-[#212121] px-8 py-10 flex flex-col items-center text-center">

                <div className="flex flex-col gap-4 mb-8 font-medium">
                    <Link href="/terms" className="text-white text-[15px] hover:opacity-70 transition-opacity">Terms & Conditions</Link>
                    <Link href="/privacy" className="text-white text-[15px] hover:opacity-70 transition-opacity">Privacy Policy</Link>
                    <Link href="/contact" className="text-white text-[15px] hover:opacity-70 transition-opacity">Contact Us</Link>
                    <Link href="/list-your-events" className="text-white text-[15px] hover:opacity-70 transition-opacity">List your events</Link>
                </div>

                <div className="w-full h-[0.5px] bg-[#686868] mb-8" />

                <p className="text-[#686868] text-[11px] leading-[1.5] mb-8 px-2 font-medium">
                    By accessing this page, you confirm that you have read, understood, and agreed to our Terms of Service, Cookie Policy, Privacy Policy, and Content Guidelines. All rights reserved.
                </p>

                <div className="flex gap-4 items-center">
                    <a href="#" className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                        <img src="/social icons/whatsapp.svg" alt="WhatsApp" className="w-6 h-6 invert" />
                    </a>
                    <a href="#" className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                        <img src="/social icons/facebook.svg" alt="Facebook" className="w-6 h-6 invert" />
                    </a>
                    <a href="#" className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                        <img src="/social icons/instagram.svg" alt="Instagram" className="w-6 h-6 invert" />
                    </a>
                    <a href="#" className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                        <img src="/social icons/x.svg" alt="X" className="w-6 h-6 invert" />
                    </a>
                    <a href="#" className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                        <img src="/social icons/youtube.svg" alt="YouTube" className="w-6 h-6 invert" />
                    </a>
                </div>
            </footer>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onSuccess={() => sync()}
            />
            <LocationModal
                isOpen={isLocationOpen}
                onClose={() => setIsLocationOpen(false)}
                onSelect={(locationData) => {
                    setLocation(locationData);
                    setIsLocationOpen(false);
                }}
            />
            <ProfileDrawer
                isOpen={isProfileDrawerOpen}
                onClose={() => setIsProfileDrawerOpen(false)}
                userSession={userSession}
                session={organizerSession}
                onUserLogout={logoutUser}
                onOrganizerLogout={logoutOrganizer}
                router={router}
            />
        </div>
    );
}