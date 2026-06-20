'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronRight, PlayCircle, Star, Bell, Calendar, Utensils, Loader2 } from 'lucide-react';
import { useLocation } from '@/lib/useLocation';
import { useLocationStore } from '@/store/useLocationStore';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useIdentityStore } from '@/store/useIdentityStore';
import { toast } from '@/components/ui/Toast';

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
    events?: Event[];
    dinings?: Dining[];
    plays?: Play[];
}

const formatEventDate = (date?: string, time?: string) => {
    if (!date) return 'Date TBA';
    try {
        const d = new Date(date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const tStr = time ? time : '';
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}${tStr ? ` | ${tStr}` : ''}`;
    } catch {
        return date;
    }
};

const CARD_WIDTH = 280;
const CARD_HEIGHT_RATIO = "280/390";

export default function MobileHome({ events = [], dinings = [], plays = [] }: MobileHomeProps) {
    const router = useRouter();
    const city = useLocation();
    const { userSession, organizerSession, sync, logoutUser, logoutOrganizer } = useIdentityStore();
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    
    // Organizer takes priority when dual-logged-in; user as fallback.
    const activeSession = organizerSession || userSession;
    const session = activeSession;
    const { setLocation } = useLocationStore();
    const [windowWidth, setWindowWidth] = useState(390); // default to avoid SSR hydration mismatch

    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const placeholders = ["events", "dining", "play"];

    // Local self-healing states to support independent entry routes (like /play on mobile)
    const [localEvents, setLocalEvents] = useState<Event[]>(events);
    const [localDinings, setLocalDinings] = useState<Dining[]>(dinings);
    const [localPlays, setLocalPlays] = useState<Play[]>(plays);

    const [likedEventIds, setLikedEventIds] = useState<string[]>([]);

    useEffect(() => {
        if (userSession?.id) {
            fetch('/backend/api/user/likes', { credentials: 'include' })
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => {
                    if (data && Array.isArray(data.likedEventIds)) {
                        setLikedEventIds(data.likedEventIds);
                    }
                })
                .catch(() => {
                    try {
                        const local = JSON.parse(localStorage.getItem('liked_events') || '[]');
                        setLikedEventIds(local.map((le: any) => le.id));
                    } catch { /* ignore */ }
                });
        } else {
            try {
                const local = JSON.parse(localStorage.getItem('liked_events') || '[]');
                setLikedEventIds(local.map((le: any) => le.id));
            } catch { /* ignore */ }
        }
    }, [userSession?.id]);

    const handleLikeToggle = async (eventId: string, eventName: string, date: string, time: string, priceStartsFrom: number, portraitImageUrl: string, venueName: string, city: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        if (!userSession?.id) {
            localStorage.setItem('pending_like_event_id', String(eventId));
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        try {
            const res = await fetch(`/backend/api/user/likes/${eventId}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.liked) {
                    setLikedEventIds(prev => [...prev, eventId]);
                    // toast.success('Saved to liked events');
                    try {
                        let liked = JSON.parse(localStorage.getItem('liked_events') || '[]');
                        if (!liked.some((le: any) => le.id === eventId)) {
                            liked.push({ id: eventId, name: eventName, date, time, price_starts_from: priceStartsFrom, portrait_image_url: portraitImageUrl, venue_name: venueName, city });
                        }
                        localStorage.setItem('liked_events', JSON.stringify(liked));
                    } catch { /* ignore */ }
                } else {
                    setLikedEventIds(prev => prev.filter(id => id !== eventId));
                    toast.success('Removed from saved events');
                    try {
                        let liked = JSON.parse(localStorage.getItem('liked_events') || '[]');
                        liked = liked.filter((le: any) => le.id !== eventId);
                        localStorage.setItem('liked_events', JSON.stringify(liked));
                    } catch { /* ignore */ }
                }
            } else {
                toast.error('Failed to update saved events.');
            }
        } catch (err) {
            console.error('Failed to toggle like on backend:', err);
            toast.error('Failed to update saved events.');
        }
    };

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

    // Client-side self-healing dynamic loader to fetch complete data for other tabs
    useEffect(() => {
        if (localEvents.length > 0 && localDinings.length > 0 && localPlays.length > 0) return;

        fetch('/backend/api/mobile/home')
            .then(res => {
                if (!res.ok) return null;
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
    }, []);

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
    }, [localEvents.length, localDinings.length, localPlays.length, isProfileDrawerOpen]);

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
                    <button
                        className="flex items-center gap-2 active:opacity-70 transition-opacity"
                        onClick={() => setIsLocationOpen(true)}
                    >
                        <MapPin size={17} className="text-zinc-800" />
                        <span className="text-[15px] font-medium text-black leading-none">{city || 'Location'}</span>
                    </button>
                    <div
                        className="w-[35px] h-[35px] rounded-full bg-[#D9D9D9] flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => {
                            if (session) {
                                setIsProfileDrawerOpen(true);
                            } else {
                                router.push('/login');
                            }
                        }}
                    >
                        {(organizerSession as any)?.profilePhoto ? (
                            <Image src={(organizerSession as any).profilePhoto} alt="Profile" width={35} height={35} className="object-cover" />
                        ) : userSession?.profilePhoto ? (
                            <Image src={userSession.profilePhoto} alt="Profile" width={35} height={35} className="object-cover" />
                        ) : (organizerSession || userSession) ? (
                            <span className="text-white text-[14px] font-bold uppercase bg-[#866BFF] w-full h-full rounded-full flex items-center justify-center">
                                {(organizerSession?.email || userSession?.name || userSession?.email || 'U').charAt(0).toUpperCase()}
                            </span>
                        ) : (
                            <img src="/profile icon.svg" alt="Profile" className="w-5 h-5" />
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
                                    <p className="text-sm text-gray-500 font-medium">
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
                <div className="grid grid-cols-3 gap-4 px-1">
                    {/* Dining */}
                    <div className="flex flex-col items-center">
                        <div
                            className="w-full aspect-[106/125] rounded-[25px] border-[#D9D9D9] border flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                            style={{ background: 'linear-gradient(180deg, #FFFFFF 50%, #E2D9FF 100%)' }}
                            onClick={() => router.push('/dining')}
                        >
                            <img src="/mobile_icons/Dining 1.svg" alt="Dining" className="w-[60%] h-[60%] object-contain" />
                            <span className="text-[15px] font-medium text-black uppercase tracking-tight">DINING</span>
                        </div>
                    </div>

                    {/* Events */}
                    <div className="flex flex-col items-center">
                        <div
                            className="w-full aspect-[106/125] rounded-[30px] border-[#D9D9D9] border flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                            style={{ background: 'linear-gradient(180deg, #FFFFFF 50%, #E2D9FF 100%)' }}
                            onClick={() => router.push('/events')}
                        >
                            <img src="/mobile_icons/Events 1.svg" alt="Events" className="w-[60%] h-[60%] object-contain" />
                            <span className="text-[15px] font-medium text-black uppercase tracking-tight">EVENTS</span>
                        </div>
                    </div>

                    {/* Play */}
                    <div className="flex flex-col items-center">
                        <div
                            className="w-full aspect-[106/125] rounded-[30px] border-[#D9D9D9] border flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                            style={{ background: 'linear-gradient(180deg, #FFFFFF 50%, #FFF4C1 100%)' }}
                            onClick={() => router.push('/play')}
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
                                    <div
                                        onClick={() => router.push(`/events/${encodeURIComponent(scrollEvents[0].name)}`)}
                                        className="flex-shrink-0 w-[280px] max-w-[85vw] bg-white rounded-[20px] border-[0.5px] border-[#AEAEAE] overflow-hidden transition-all duration-150 ease-out cursor-pointer active:scale-95 animate-in fade-in duration-350"
                                        style={{
                                            transform: 'scale(1.1)',
                                            opacity: 1
                                        }}
                                    >
                                        {/* Top Poster Section */}
                                        <div className="w-full aspect-[280/390] relative overflow-hidden bg-[#110D2C]">
                                            {scrollEvents[0].portrait_image_url || scrollEvents[0].landscape_image_url ? (
                                                <img
                                                    src={(scrollEvents[0].portrait_image_url || scrollEvents[0].landscape_image_url)!.startsWith('.') ? (scrollEvents[0].portrait_image_url || scrollEvents[0].landscape_image_url)!.substring(1) : (scrollEvents[0].portrait_image_url || scrollEvents[0].landscape_image_url)}
                                                    alt={scrollEvents[0].name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full p-6 flex flex-col items-center justify-center relative">
                                                    {/* Abstract Wavy Background Effect */}
                                                    <div className="absolute inset-0 opacity-40">
                                                        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_30%_30%,#DFFF00_0%,transparent_40%),radial-gradient(circle_at_70%_70%,#5331EA_0%,transparent_50%),radial-gradient(circle_at_90%_20%,#DFFF00_0%,transparent_30%)] blur-[80px]" />
                                                    </div>

                                                    {/* Sparkles */}
                                                    <div className="absolute top-[25%] left-[20%] w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse" />
                                                    <div className="absolute top-[18%] right-[25%] w-0.5 h-0.5 bg-[#DFFF00] rounded-full blur-[0.5px] animate-pulse delay-700" />
                                                    <div className="absolute bottom-[35%] left-[30%] w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse delay-[1500ms]" />
                                                    <div className="absolute top-[45%] right-[15%] w-1 h-1 bg-[#DFFF00] rounded-full blur-[1px] animate-pulse delay-300" />

                                                    {/* Main Content */}
                                                    <div className="relative z-10 flex flex-col items-center">
                                                        <h1 className="text-[36px] font-black text-[#DFFF00] italic leading-[0.8] tracking-tighter uppercase text-center"
                                                            style={{
                                                                fontFamily: "var(--font-anek-tamil-condensed), sans-serif",
                                                                transform: 'skewX(-16deg) scaleY(1.3)',
                                                                textShadow: '0 0 15px rgba(223, 255, 0, 0.5)'
                                                            }}>
                                                            THE TICPIN<br />PLAY<br />FESTIVAL
                                                        </h1>

                                                        {/* Divider */}
                                                        <div className="flex items-center gap-2.5 w-full max-w-[180px] my-6 relative">
                                                            <div className="h-[0.5px] bg-gradient-to-r from-transparent via-white/50 to-white flex-1" />
                                                            <div className="w-[8px] h-[8px] bg-white rotate-45 border-[0.5px] border-white/20 shadow-[0_0_6px_white]" />
                                                            <div className="h-[0.5px] bg-gradient-to-l from-transparent via-white/50 to-white flex-1" />
                                                        </div>

                                                        {/* Offer Text */}
                                                        <div className="text-center group">
                                                            <p className="text-[20px] font-light text-white italic tracking-tight leading-tight opacity-90" style={{ fontFamily: 'serif' }}>
                                                                GET UP TO
                                                            </p>
                                                            <p className="text-[34px] font-bold text-white leading-[0.85] mt-1 group-hover:scale-105 transition-transform duration-500" style={{ fontFamily: 'serif' }}>
                                                                50% off*
                                                            </p>
                                                        </div>

                                                        {/* Logo at bottom */}
                                                        <div className="mt-8 flex flex-col items-center">
                                                            <p className="text-[9px] text-white/70 tracking-[0.4em] font-semibold mb-1.5 uppercase">ONLY ON</p>
                                                            <div className="flex items-center gap-0.5">
                                                                <span className="text-[24px] font-black text-white tracking-tighter">TIC</span>
                                                                <span className="text-[24px] font-black text-white tracking-tighter flex items-center -ml-1">
                                                                    P <div className="w-1.5 h-1.5 bg-white rounded-full mx-0.5 mt-1 animate-pulse" /> IN
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Overlay Icons */}
                                          
                                        </div>

                                        {/* Bottom Details Section */}
                                        <div className="p-3 relative bg-white">
                                            <p className="text-[11px] font-medium text-[#5331EA] mb-0.5 uppercase tracking-wide" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                                {formatEventDate(scrollEvents[0].date, scrollEvents[0].time).toUpperCase()}
                                            </p>
                                            <h3 className="text-[17px] font-medium text-black uppercase leading-[1.15] tracking-tight line-clamp-2" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                                {scrollEvents[0].name || "{EVENT NAME}"}
                                            </h3>
                                            <p className="text-[11px] font-regular text-[#8E8E8E] mt-1 uppercase tracking-wider truncate" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                                {scrollEvents[0].venue_name || scrollEvents[0].city || scrollEvents[0].location || "{EVENT LOCATION}"}
                                            </p>
                                            <p className="text-[11px] font-regular text-[#8E8E8E] mt-0.5 uppercase tracking-wider" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                                {scrollEvents[0].price_starts_from ? `Starts at ₹ ${scrollEvents[0].price_starts_from}` : "{EVENT STARTING PRICE}"}
                                            </p>

                                            {/* Fire/Hot Icon */}
                                            <div 
                                                onClick={(e) => handleLikeToggle(
                                                    scrollEvents[0].id,
                                                    scrollEvents[0].name || '',
                                                    scrollEvents[0].date || '',
                                                    scrollEvents[0].time || '',
                                                    scrollEvents[0].price_starts_from || 0,
                                                    scrollEvents[0].portrait_image_url || '',
                                                    scrollEvents[0].venue_name || '',
                                                    scrollEvents[0].city || '',
                                                    e
                                                )}
                                                className={`absolute top-3 right-3 w-8.5 h-8.5 rounded-[10px] flex items-center justify-center transition-colors cursor-pointer z-10 active:scale-90 ${likedEventIds.includes(scrollEvents[0]?.id) ? 'bg-red-500' : 'bg-[#EFEFEF]'}`}
                                            >
                                                <img 
                                                    src="/mobile_icons/Vector 2.svg" 
                                                    alt="Hot" 
                                                    className="w-[17px] h-[17px] object-contain" 
                                                    style={{ filter: likedEventIds.includes(scrollEvents[0]?.id) ? 'brightness(0) invert(1)' : 'none' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    ref={carouselRef}
                                    onScroll={handleScroll}
                                    className="flex gap-6 overflow-x-auto px-6 scrollbar-hide snap-x snap-mandatory items-center py-8"
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

                                        const eventImg = event.portrait_image_url || event.landscape_image_url;

                                        return (
                                            <div
                                                key={`${event.id}-${idx}`}
                                                onClick={() => router.push(`/events/${encodeURIComponent(event.name)}`)}
                                                className="flex-shrink-0 w-[280px] max-w-[85vw] bg-white rounded-[20px] border-[0.5px] border-[#AEAEAE] overflow-hidden snap-center snap-always transition-all duration-150 ease-out origin-center cursor-pointer active:scale-95"
                                                style={{
                                                    transform: `scale(${scale})`,
                                                    opacity: opacity
                                                }}
                                            >
                                                {/* Top Poster Section */}
                                                <div className="w-full aspect-[280/390] relative overflow-hidden bg-[#110D2C]">
                                                    {eventImg ? (
                                                        <img
                                                            src={eventImg.startsWith('.') ? eventImg.substring(1) : eventImg}
                                                            alt={event.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full p-6 flex flex-col items-center justify-center relative">
                                                            {/* Abstract Wavy Background Effect */}
                                                            <div className="absolute inset-0 opacity-40">
                                                                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_30%_30%,#DFFF00_0%,transparent_40%),radial-gradient(circle_at_70%_70%,#5331EA_0%,transparent_50%),radial-gradient(circle_at_90%_20%,#DFFF00_0%,transparent_30%)] blur-[80px]" />
                                                            </div>

                                                            {/* Sparkles */}
                                                            <div className="absolute top-[25%] left-[20%] w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse" />
                                                            <div className="absolute top-[18%] right-[25%] w-0.5 h-0.5 bg-[#DFFF00] rounded-full blur-[0.5px] animate-pulse delay-700" />
                                                            <div className="absolute bottom-[35%] left-[30%] w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse delay-[1500ms]" />
                                                            <div className="absolute top-[45%] right-[15%] w-1 h-1 bg-[#DFFF00] rounded-full blur-[1px] animate-pulse delay-300" />

                                                            {/* Main Content */}
                                                            <div className="relative z-10 flex flex-col items-center">
                                                                <h1 className="text-[36px] font-black text-[#DFFF00] italic leading-[0.8] tracking-tighter uppercase text-center"
                                                                    style={{
                                                                        fontFamily: "var(--font-anek-tamil-condensed), sans-serif",
                                                                        transform: 'skewX(-16deg) scaleY(1.3)',
                                                                        textShadow: '0 0 15px rgba(223, 255, 0, 0.5)'
                                                                    }}>
                                                                    THE TICPIN<br />PLAY<br />FESTIVAL
                                                                </h1>

                                                                {/* Divider */}
                                                                <div className="flex items-center gap-2.5 w-full max-w-[180px] my-6 relative">
                                                                    <div className="h-[0.5px] bg-gradient-to-r from-transparent via-white/50 to-white flex-1" />
                                                                    <div className="w-[8px] h-[8px] bg-white rotate-45 border-[0.5px] border-white/20 shadow-[0_0_6px_white]" />
                                                                    <div className="h-[0.5px] bg-gradient-to-l from-transparent via-white/50 to-white flex-1" />
                                                                </div>

                                                                {/* Offer Text */}
                                                                <div className="text-center group">
                                                                    <p className="text-[20px] font-light text-white italic tracking-tight leading-tight opacity-90" style={{ fontFamily: 'serif' }}>
                                                                        GET UP TO
                                                                    </p>
                                                                    <p className="text-[34px] font-bold text-white leading-[0.85] mt-1 group-hover:scale-105 transition-transform duration-500" style={{ fontFamily: 'serif' }}>
                                                                        50% off*
                                                                    </p>
                                                                </div>

                                                                {/* Logo at bottom */}
                                                                <div className="mt-8 flex flex-col items-center">
                                                                    <p className="text-[9px] text-white/70 tracking-[0.4em] font-semibold mb-1.5 uppercase">ONLY ON</p>
                                                                    <div className="flex items-center gap-0.5">
                                                                        <span className="text-[24px] font-black text-white tracking-tighter">TIC</span>
                                                                        <span className="text-[24px] font-black text-white tracking-tighter flex items-center -ml-1">
                                                                            P <div className="w-1.5 h-1.5 bg-white rounded-full mx-0.5 mt-1 animate-pulse" /> IN
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Overlay Icons */}
                                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-white">
                                                        <img src="/mobile_icons/fluent_speaker-2-28-regular.svg" alt="Mute/Unmute" className="w-[20px] h-[20px]" />
                                                    </div>
                                                </div>

                                                {/* Bottom Details Section */}
                                                <div className="p-3 relative bg-white">
                                                    <p className="text-[11px] font-medium text-[#5331EA] mb-0.5 uppercase tracking-wide" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                                        {formatEventDate(event.date, event.time).toUpperCase()}
                                                    </p>
                                                    <h3 className="text-[17px] font-medium text-black uppercase leading-[1.15] tracking-tight line-clamp-2" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                                        {event.name || "{EVENT NAME}"}
                                                    </h3>
                                                    <p className="text-[11px] font-regular text-[#8E8E8E] mt-1 uppercase tracking-wider truncate" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                                        {event.venue_name || event.city || event.location || "{EVENT LOCATION}"}
                                                    </p>
                                                    <p className="text-[11px] font-regular text-[#8E8E8E] mt-0.5 uppercase tracking-wider" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                                        {event.price_starts_from ? `Starts at ₹ ${event.price_starts_from}` : "{EVENT STARTING PRICE}"}
                                                    </p>

                                                    {/* Fire/Hot Icon */}
                                                    <div 
                                                        onClick={(e) => handleLikeToggle(
                                                            event.id,
                                                            event.name || '',
                                                            event.date || '',
                                                            event.time || '',
                                                            event.price_starts_from || 0,
                                                            event.portrait_image_url || '',
                                                            event.venue_name || '',
                                                            event.city || '',
                                                            e
                                                        )}
                                                        className={`absolute top-3 right-3 w-8.5 h-8.5 rounded-[10px] flex items-center justify-center transition-colors cursor-pointer z-10 active:scale-90 ${likedEventIds.includes(event.id) ? 'bg-red-500' : 'bg-[#EFEFEF]'}`}
                                                    >
                                                        <img 
                                                            src="/mobile_icons/Vector 2.svg" 
                                                            alt="Hot" 
                                                            className="w-[17px] h-[17px] object-contain" 
                                                            style={{ filter: likedEventIds.includes(event.id) ? 'brightness(0) invert(1)' : 'none' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="w-full flex items-center justify-center py-10">
                                            <p className="text-zinc-400 text-[14px]">No events available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Artist Section */}
                        {uniqueArtists.length > 0 && (
                            <section>
                                <h2 className="text-[22px] font-medium text-black text-center mb-8 uppercase tracking-normal mt-[-30px]" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>ARTIST</h2>
                                <div className="flex gap-6 overflow-x-auto px-6 scrollbar-hide snap-x ml-[20px]">
                                    {uniqueArtists.map((art, idx) => (
                                        <div
                                            key={idx}
                                            className="flex-shrink-0 w-[138px] snap-start cursor-pointer active:scale-95 transition-transform"
                                            onClick={() => router.push(`/events/artist/${encodeURIComponent(art.name)}`)}
                                        >
                                            <div className="w-[138px] h-[146px] rounded-[13px] bg-[#AC9BF7] overflow-hidden group relative">
                                                {art.image_url ? (
                                                    <img src={art.image_url} alt={art.name} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#AC9BF7] mix-blend-multiply opacity-90">
                                                        <span className="text-[36px] font-bold text-white uppercase italic leading-none">{art.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                            </div>
                                            <p className="text-[14px] font-medium text-black mt-3 text-center uppercase tracking-wider truncate max-w-[138px]" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>{art.name}</p>
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
                        <h2 className="text-[22px] font-medium text-black text-center mb-8 uppercase tracking-wide mt-[-30px]" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>IN LIMELIGHT</h2>
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
                                        <div className="absolute h-[29px] bottom-0 left-0 right-0 bg-[#AC9BF7] flex items-center px-4 z-10">
                                            <div className="flex items-center gap-1.5">
                                                <Star size={14} className="text-[#5331EA] fill-[#5331EA]" />
                                                <span className="text-white text-[14px] font-medium">Flat 40% OFF</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 flex justify-between items-end bg-white">
                                        <div>
                                            <h3 className="text-[17px] font-bold text-black uppercase line-clamp-2" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>{scrollLimelight[0].name}</h3>
                                            <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-widest" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>{scrollLimelight[0].city || 'LOCATION'}</p>
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
                                className="flex gap-6 overflow-x-auto px-6 scrollbar-hide snap-x snap-mandatory items-center py-8 mt-[-30px]"
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
                                                <div className="absolute h-[29px] bottom-0 left-0 right-0 bg-[#AC9BF7] flex items-center px-4 z-10">
                                                    <div className="flex items-center gap-1.5">
                                                        <Star size={14} className="text-[#5331EA] fill-[#5331EA]" />
                                                        <span className="text-white text-[14px] font-medium">Flat 40% OFF</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-5 flex justify-between items-end bg-white">
                                                <div>
                                                    <h3 className="text-[17px] font-bold text-black uppercase line-clamp-2" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>{item.name}</h3>
                                                    <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-widest" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>{item.city || 'LOCATION'}</p>
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
                            <h2 className="text-[20px] font-medium text-black text-center mb-8 uppercase tracking-wide mt-[-20px]" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>PLAY NEAR YOU</h2>
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
                                                        <h3 className="text-[19px] font-medium text-black uppercase leading-none" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                                            {item.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 -ml-0.5">
                                                            <span className="text-[14px] font-medium text-[#866BFF] tracking-tighter">{item.rating || '--'}</span>
                                                            <Star size={12} className="text-[#866BFF] fill-[#866BFF]" />
                                                        </div>
                                                        <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-tight" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
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

                {/* 6. Footer Banner (Ticpin Pass) */}
                <div className="px-6">
                    <Link href="/ticpass" className="block rounded-[15px] overflow-hidden group relative h-[120px] mt-[-25px] cursor-pointer">
                        <img src="/ticpin banner.jpg" alt="Ticpin Pass" className="w-full h-full" />
                    </Link>
                </div>
            </main>

            {/* 7. Footer Section */}
            <footer className="bg-[#212121] px-8 py-10 flex flex-col items-center text-center w-full">
                <div className="mb-6">
                    <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-[32px] w-auto invert brightness-0" />
                </div>

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

                <div className="flex gap-2 items-center">
                    <Link href="https://whatsapp.com/channel/0029Vb8KoCH3mFY1M9gR4412"><img src="/social icons/whatsapp.svg" alt="WhatsApp" className="w-8 h-8" /></Link>
                    <Link href="https://www.facebook.com/profile.php?id=61579518933930#"><img src="/social icons/facebook.svg" alt="Facebook" className="w-8 h-8" /></Link>
                    <Link href="https://www.instagram.com/ticpinindia/"><img src="/social icons/instagram.svg" alt="Instagram" className="w-8 h-8" /></Link>
                    <Link href="https://x.com/ticpin"><img src="/social icons/x.svg" alt="X" className="w-8 h-8" /></Link>
                    <Link href="https://www.youtube.com/channel/UCrGSN3cv3q1x3yI5q7LILtw"><img src="/social icons/youtube.svg" alt="YouTube" className="w-8 h-8" /></Link>
                </div>
            </footer>


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
