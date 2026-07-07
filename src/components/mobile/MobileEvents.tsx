'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal, ChevronDown, Calendar, PlayCircle, Utensils, Loader2, Heart } from 'lucide-react';
import Link from 'next/link';
import { useLocation } from '@/lib/useLocation';
import { useLocationStore } from '@/store/useLocationStore';
import { useIdentityStore } from '@/store/useIdentityStore';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { toast } from '@/components/ui/Toast';

const LocationModal = dynamic(() => import('@/components/modals/LocationModal'), { ssr: false });
const ProfileDrawer = dynamic(() => import('@/components/layout/Navbar/ProfileDrawer'), { ssr: false });
const FilterModal = dynamic(() => import('@/components/modals/FilterModal'), { ssr: false });

interface EventArtist {
    name: string;
    image_url?: string;
}

interface RealEvent {
    id: string;
    name: string;
    city?: string;
    date?: string;
    time?: string;
    price_starts_from?: number;
    portrait_image_url?: string;
    landscape_image_url?: string;
    category?: string;
    venue_type?: string;
    artists?: EventArtist[];
    status?: string;
}

interface MobileEventsProps {
    events: RealEvent[];
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

export default function MobileEvents({ events }: MobileEventsProps) {
    const router = useRouter();
    const city = useLocation();
    const { setLocation } = useLocationStore();
    const { userSession, organizerSession, sync } = useIdentityStore();
    const session = userSession || organizerSession;

    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [modalFilters, setModalFilters] = useState<Record<string, string[]>>({});

    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchDataRef = useRef<any[]>([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const placeholders = ["events", "dining", "play"];
    const [likedEventIds, setLikedEventIds] = useState<string[]>([]);
    const [animatingId, setAnimatingId] = useState<string | null>(null);

    useEffect(() => {
        if (session?.id) {
            fetch('/backend/api/user/likes', { credentials: 'include' })
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(async (data) => {
                    let likedIds = data.likedEventIds || data.events || [];

                    // Check for pending like
                    const pendingLikeId = localStorage.getItem('pending_like_event_id');
                    if (pendingLikeId && !likedIds.includes(pendingLikeId)) {
                        localStorage.removeItem('pending_like_event_id');
                        try {
                            const res = await fetch(`/backend/api/user/likes/${pendingLikeId}`, {
                                method: 'POST',
                                credentials: 'include'
                            });
                            if (res.ok) {
                                const toggleData = await res.json();
                                if (toggleData.liked) {
                                    likedIds = [...likedIds, pendingLikeId];
                                    setAnimatingId(pendingLikeId);
                                    setTimeout(() => setAnimatingId(null), 500);
                                    // toast.success('Saved to liked events');
                                }
                            }
                        } catch (err) { }
                    }
                    setLikedEventIds(likedIds);
                })
                .catch(() => { });
        } else {
            setLikedEventIds([]);
        }
    }, [session?.id]);

    const handleLikeToggle = async (e: React.MouseEvent, event: RealEvent) => {
        e.stopPropagation(); // Don't navigate to event details

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
                if (data.liked) {
                    setLikedEventIds(prev => [...prev, event.id]);
                    setAnimatingId(String(event.id));
                    setTimeout(() => setAnimatingId(null), 500);
                    // toast.success('Saved to liked events');
                } else {
                    setLikedEventIds(prev => prev.filter(id => id !== event.id));
                    toast.success('Removed from saved events');
                }
            } else {
                toast.error('Failed to update saved events');
            }
        } catch (err) {
            console.error('Failed to toggle like on backend:', err);
            toast.error('Failed to update saved events');
        }
    };

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

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Extract dynamic artists from current events list
    const dynamicArtists = useMemo(() => {
        const artistsMap = new Map<string, { name: string; image: string }>();
        events.forEach(ev => {
            (ev.artists ?? []).forEach(a => {
                if (a.name && !artistsMap.has(a.name)) {
                    artistsMap.set(a.name, { name: a.name, image: a.image_url ?? '/profile icon.svg' });
                }
            });
        });
        return Array.from(artistsMap.values()).slice(0, 10);
    }, [events]);

    const categories = [
        { name: 'Music', icon: '/events/Events 1.svg', bg: 'linear-gradient(360deg, #A1BFFF -49.4%, #FFFFFF 50%)' },
        { name: 'Comedy', icon: '/events/Comedy Icon.jpg 1.svg', bg: 'linear-gradient(360deg, #FFCA74 -5.56%, #FFFFFF 61.51%)' },
        { name: 'Shows', icon: '/events/Performance Icon 1.svg', bg: 'linear-gradient(360deg, #FFCECD -5.56%, #FFFFFF 61.51%)' },
        { name: 'Fests & Fairs', icon: '/events/Fests & Fairs Icon 1.svg', bg: 'linear-gradient(180deg, #FFFFFF 0%, #FFCA74 100%)' },
        { name: 'Fitness', icon: '/events/Dumbells Icon 1.svg', bg: 'linear-gradient(180deg, #FFFFFF 0%, #A1BFFF 100%)' },
        { name: 'Sports', icon: '/events/Sports Icon 2.svg', bg: 'linear-gradient(360deg, #FFE58A -5.56%, #FFFFFF 61.51%)' },
        { name: 'Food & Drinks', icon: '/events/Dining 1.svg', bg: 'linear-gradient(360deg, #8290D5 -5.56%, #FFFFFF 61.51%)' },
        { name: 'Night Life', icon: '/events/Night Life Icon 1.svg', bg: 'linear-gradient(360deg, #FAFDAA -5.56%, #FFFFFF 61.51%)' },
        { name: 'Screenings', icon: '/events/Projector Icon 1.svg', bg: 'linear-gradient(180deg, #FFFFFF 0%, #8290D5 100%)' },
        { name: 'Open Mic', icon: '/events/Open Mic Icon 1.svg', bg: 'linear-gradient(180deg, #FFFFFF 0%, #FFE58A 100%)' },
    ];

    // Filter events by Search Query, City/Location, and Category/Time Tabs
    const filteredAndSearchedEvents = useMemo(() => {
        let result = events.filter(e => e.status === 'approved');

        // Location Partitioning based on active selected city (matching city first, then others)
        if (city) {
            const cleanCity = city.split(',')[0].trim().toLowerCase();
            const matching = result.filter(e => {
                const eventCity = (e.city || '').toLowerCase();
                return eventCity.includes(cleanCity) || cleanCity.includes(eventCity);
            });
            const nonMatching = result.filter(e => {
                const eventCity = (e.city || '').toLowerCase();
                return !(eventCity.includes(cleanCity) || cleanCity.includes(eventCity));
            });
            result = [...matching, ...nonMatching];
        }

        // Search Query Filter
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            result = result.filter(e =>
                (e.name || '').toLowerCase().includes(query) ||
                (e.city || '').toLowerCase().includes(query) ||
                (e.category || '').toLowerCase().includes(query)
            );
        }

        // Date/Category Filter Tabs
        if (activeFilter !== 'All') {
            if (activeFilter === 'Today') {
                const todayStr = new Date().toISOString().split('T')[0];
                result = result.filter(e => e.date && e.date.startsWith(todayStr));
            } else if (activeFilter === 'Tomorrow') {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = tomorrow.toISOString().split('T')[0];
                result = result.filter(e => e.date && e.date.startsWith(tomorrowStr));
            } else {
                result = result.filter(e => e.category === activeFilter);
            }
        }

        // Apply Modal Filters
        if (modalFilters.event_category?.length > 0) {
            result = result.filter(e => modalFilters.event_category.includes(e.category || ''));
        }
        if (modalFilters.venue_type?.length > 0) {
            result = result.filter(e => modalFilters.venue_type.includes(e.venue_type || ''));
        }
        if (modalFilters.sort?.includes('Price : Low to High')) {
            result = [...result].sort((a, b) => (a.price_starts_from || 0) - (b.price_starts_from || 0));
        } else if (modalFilters.sort?.includes('Price : High to Low')) {
            result = [...result].sort((a, b) => (b.price_starts_from || 0) - (a.price_starts_from || 0));
        }

        return result;
    }, [events, city, searchQuery, activeFilter, modalFilters]);

    return (
        <div className="md:hidden min-h-screen bg-white font-sans overflow-x-hidden pb-10" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
            {/* 1. Header Section */}
            <header className="px-6 pt-4 pb-4">
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-4">
                        <button
                            className="flex items-center gap-1.5 active:opacity-75 transition-opacity"
                            onClick={() => setIsLocationOpen(true)}
                        >
                            <MapPin size={15} className="text-zinc-800" />
                            <span className="text-[14px] font-medium text-black leading-none truncate max-w-[100px]">{city || 'Location'}</span>
                            <ChevronDown size={14} className="text-[#686868]" />
                        </button>
                    </div>
                    <div
                        className="w-[42px] h-[42px] rounded-full bg-[#D9D9D9] flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => {
                            if (session) {
                                setIsProfileDrawerOpen(true);
                            } else {
                                router.push('/login');
                            }
                        }}
                    >
                        {(session as any)?.profilePhoto ? (
                            <img src={(session as any).profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <img src="/profile icon.svg" alt="Profile" className="w-6 h-6" />
                        )}
                    </div>
                </div>

                {/* 2. Search Bar */}
                <div className="relative w-full h-[48px] bg-white rounded-[28px] border border-[#AEAEAE] flex items-center px-5 mb-6">
                    <Search size={22} className="text-[#AEAEAE] flex-shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ml-3 w-full bg-transparent border-none outline-none text-[15px] font-medium text-black placeholder:text-[#AEAEAE]"
                        placeholder=""
                    />
                    {
                        !searchQuery && (
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
                        )
                    }
                </div>
                {searchQuery.trim().length > 0 && (
                    <div className="absolute top-[136px] left-6 right-6 bg-white border border-[#AEAEAE] rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
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

                {/* 3. Horizontal Divider */}
                <div className="w-full h-[1px] bg-[#AEAEAE] opacity-100 mb-3 " />
            </header>

            {/* Explore Events Section */}
            <section className="mt-[-10px]">
                <h2 className="text-[20px] font-medium text-black mb-[12px] px-[18px]">Explore events</h2>
                <div className="grid grid-rows-2 grid-flow-col gap-[15px] overflow-x-auto scrollbar-hide px-[18px] pb-1">
                    {categories.map((cat, i) => {
                        const isSelected = activeFilter === cat.name;
                        return (
                            <button
                                key={i}
                                onClick={() => {
                                    if (isSelected) {
                                        setActiveFilter('All');
                                    } else {
                                        setActiveFilter(cat.name);
                                    }
                                }}
                                className="flex flex-col items-center gap-[10px] flex-shrink-0 w-[89px]"
                            >
                                <div
                                    className={`w-[89px] h-[120px] rounded-[25px] border flex flex-col items-center pt-[15px] relative transition-all duration-150 ${isSelected
                                            ? 'border-black ring-1 ring-black'
                                            : ''
                                        }`}
                                    style={{ background: cat.bg }}
                                >
                                    <div className="px-1 text-center">
                                        <span className={`text-[10px] font-semibold uppercase block leading-tight text-black`}>
                                            {cat.name}
                                        </span>
                                    </div>

                                    <div className="absolute inset-x-0 bottom-[10px] flex justify-center">
                                        <div className="w-[59px] h-[11px] bg-black/10 rounded-full blur-[2px]" />
                                    </div>
                                    <div className="mt-auto mb-[20px] w-full flex justify-center px-2">
                                        <img src={cat.icon} alt={cat.name} className="max-w-[70%] h-[50px] object-contain" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Artist Section */}
            {dynamicArtists.length > 0 && (
                <section className="mt-[24px] px-[18px]">
                    <h2 className="text-[20px] font-medium text-black mb-[12px]">Artists in your Ticpin</h2>
                    <div className="flex gap-[20px] overflow-x-auto scrollbar-hide">
                        {dynamicArtists.map((artist, idx) => (
                            <div
                                key={idx}
                                onClick={() => router.push(`/events/artist/${encodeURIComponent(artist.name)}`)}
                                className="flex flex-col items-center gap-[10px] flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                            >
                                <div className="w-[113px] h-[113px] rounded-full bg-[#D9D9D9] overflow-hidden border border-[#D9D9D9] relative">
                                    {artist.image ? (
                                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[32px] font-semibold text-zinc-500">
                                            {artist.name?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[15px] font-medium text-black">{artist.name}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Filters */}
            <div className="mt-[20px] px-[18px] flex items-center gap-[10px] overflow-x-auto scrollbar-hide">
                <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="h-[31px] px-3 border border-black rounded-[9px] flex items-center gap-2 flex-shrink-0 active:bg-zinc-100"
                >
                    <SlidersHorizontal size={14} />
                    <span className="text-[15px] font-medium">Filters</span>
                </button>
                {['All', 'Today', 'Tomorrow', 'Music', 'Comedy', 'Shows', 'Sports', 'Food & Drinks'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`h-[31px] px-4 border border-black rounded-[9px] flex-shrink-0 text-[15px] font-medium transition-colors ${activeFilter === filter ? 'bg-black text-white' : 'bg-transparent text-black'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Event Grid */}
            {filteredAndSearchedEvents.length > 0 ? (
                <div className="mt-[18px] px-[8px] grid grid-cols-2 gap-[10px]">
                    {filteredAndSearchedEvents.map((event) => (
                        <div
                            key={event.id}
                            className="flex flex-col bg-white rounded-[30px] border-[0.5px] border-black overflow-hidden active:scale-95 transition-all duration-150 cursor-pointer"
                            onClick={() => router.push(`/events/${encodeURIComponent(event.name)}`)}
                        >
                            <div className="aspect-[175/200] relative bg-[#E4E4E4] overflow-hidden">
                                <img
                                    src={event.portrait_image_url || event.landscape_image_url || "/login/banner.jpeg"}
                                    alt={event.name}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={(e) => handleLikeToggle(e, event)}
                                    className="absolute top-[12px] right-[12px] w-[28px] h-[28px] bg-[#E4E4E4]/90 rounded-[8px] flex items-center justify-center backdrop-blur-sm shadow-sm transition-all z-10 active:scale-90"
                                >
                                    <img
                                        src="/mobile_icons/event clicking/Vector 1.svg"
                                        alt="Like"
                                        className={`w-4 h-4 transition-all duration-300 ${animatingId === String(event.id) ? 'animate-bounce' : ''}`}
                                        style={{
                                            filter: likedEventIds.includes(event.id)
                                                ? 'invert(27%) sepia(100%) saturate(7000%) hue-rotate(0deg) brightness(95%) contrast(110%)'
                                                : 'none'
                                        }}
                                    />
                                </button>
                            </div>
                            <div className="p-3 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-[16px] font-bold text-black uppercase leading-[1.1] line-clamp-2">{event.name}</h3>
                                    <p className="text-[12px] font-semibold text-[#5331EA] mt-1">
                                        {event.date ? (() => {
                                            try {
                                                const d = new Date(event.date);
                                                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                return `${d.getDate()} ${months[d.getMonth()]}`;
                                            } catch { return event.date; }
                                        })() : 'Date TBA'}
                                        {event.time ? (() => {
                                            const formatted = formatTime(event.time);
                                            return formatted ? ` | ${formatted}` : '';
                                        })() : ''}
                                    </p>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-[11px] font-semibold text-[#686868] truncate max-w-[80px]">
                                        {event.city || 'Bangalore'}
                                    </span>
                                    <span className="text-[12px] font-bold text-black shrink-0">
                                        {event.price_starts_from ? `₹${event.price_starts_from}` : 'Free'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-zinc-500 font-medium px-6">
                    No events found matching current criteria.
                </div>
            )}

            {/* Ticpin Pass Banner */}
            <div className="mt-[40px] px-[18px] pb-10">
                <Link href="/pass" className="block w-full max-w-[340px] mx-auto aspect-[3/1] rounded-[12px] overflow-hidden group relative cursor-pointer shadow-sm active:opacity-90 transition-opacity">
                    <img src="/ticpin banner.jpg" alt="Ticpin Pass" className="w-full h-full object-cover" />
                </Link>
            </div>

            {/* Modals & Profile Drawer */}
            <LocationModal
                isOpen={isLocationOpen}
                onClose={() => setIsLocationOpen(false)}
                onSelect={(locationData) => {
                    setLocation(locationData);
                    setIsLocationOpen(false);
                }}
            />

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                type="events"
                onApply={setModalFilters}
            />

            <ProfileDrawer
                isOpen={isProfileDrawerOpen}
                onClose={() => setIsProfileDrawerOpen(false)}
            />
        </div>
    );
}
