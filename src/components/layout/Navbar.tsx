'use client';

import Link from 'next/link';
import { ChevronDown, UserCircle, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import AuthModal from '@/components/modals/AuthModal';
import LocationModal from '@/components/modals/LocationModal';
import { useAuth } from '@/context/AuthContext';
import { sportsCategories, sportsVenues } from '@/data/playData';
import { diningCategories, restaurants } from '@/data/diningData';
import { exploreEvents, events as allEvents } from '@/data/mockData';

import { useStore } from '@/store/useStore';
import { playApi, diningApi, eventsApi, artistsApi } from '@/lib/api';


export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isLoggedIn, isOrganizer, organizerCategory, isAdmin, logout } = useAuth();
    const { location: storeLocation, setLocation, hasSetLocation } = useStore();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initial location prompt
    useEffect(() => {
        if (isMounted && !hasSetLocation) {
            const timer = setTimeout(() => {
                setIsLocationOpen(true);
            }, 1500); // Small delay for better UX
            return () => clearTimeout(timer);
        }
    }, [isMounted, hasSetLocation]);


    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ categories: any[], items: any[] }>({ categories: [], items: [] });
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const isPlayPage = pathname.startsWith('/play');
    const isDiningPage = pathname.startsWith('/dining');
    const isEventsPage = pathname.startsWith('/events');

    // Debounced search effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults({ categories: [], items: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const query = searchQuery.toLowerCase();
                let results: any = { categories: [], items: [] };

                if (isPlayPage) {
                    const res = await playApi.getAll(10, '', '', storeLocation, query);
                    if (res.success && res.data && res.data.items) {
                        results.items = res.data.items.map((v: any) => ({
                            id: v.id,
                            name: v.name,
                            location: v.location?.city || storeLocation,
                            image: v.images?.hero || '/placeholder.jpg'
                        }));
                    }
                    results.categories = sportsCategories.filter(c => c.name.toLowerCase().includes(query));
                } else if (isDiningPage) {
                    const res = await diningApi.getAll(10, '', '', storeLocation, query);
                    if (res.success && res.data && res.data.items) {
                        results.items = res.data.items.map((r: any) => ({
                            id: r.id,
                            title: r.name,
                            location: r.location?.city || storeLocation,
                            image: r.images?.hero || '/placeholder.jpg'
                        }));
                    }
                    results.categories = diningCategories.filter(c => c.name.toLowerCase().includes(query));
                } else if (isEventsPage) {
                    const res = await eventsApi.getAll(10, '', '', storeLocation, query);
                    if (res.success && res.data && res.data.items) {
                        results.items = res.data.items.map((e: any) => ({
                            id: e.id,
                            name: e.title || e.name,
                            location: e.venue?.city || e.location?.city || storeLocation,
                            image: e.images?.hero || '/placeholder.jpg'
                        }));
                    }
                    results.categories = exploreEvents.filter(e => e.name.toLowerCase().includes(query));
                }

                setSearchResults(results);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, isPlayPage, isDiningPage, isEventsPage, storeLocation]);

    // Close search on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchVisible(false);
                setSearchQuery('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navItems = [
        { name: 'Dining', href: '/dining' },
        { name: 'Events', href: '/events' },
        { name: 'Play', href: '/' },
    ];

    const exploreCategories = [
        { name: 'Movies', href: '/movies' },
        { name: 'Music', href: '/music' },
        { name: 'Comedy', href: '/comedy' },
        { name: 'Workshops', href: '/workshops' },
    ];

    const hasResults = searchResults.categories.length > 0 || searchResults.items.length > 0;

    if (!isMounted || pathname === '/contact' || pathname.startsWith('/chat') || pathname.startsWith('/checkout') || pathname.endsWith('/booking')) return null;
    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white h-16 md:h-20 flex items-center">
                <div className="w-full h-full flex items-center justify-between px-3 md:px-4 lg:px-6">
                    {/* Left: Logo, Explore and Tabs */}
                    <div className="flex items-center gap-3 md:gap-8 min-w-max">
                        <div className="flex items-center gap-3 md:gap-6 relative">
                            <Link href="/" className="border-r border-zinc-200 pr-3 md:pr-6 flex items-center">
                                <img
                                    src="/ticpin-logo-black.png"
                                    alt="TicPin Logo"
                                    className="h-4 md:h-7 w-auto object-contain"
                                />
                            </Link>

                            {/* Explore Dropdown disabled */}
                        </div>

                        {/* Tabs */}
                        <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide">
                            {navItems.map((item) => {
                                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="px-4 py-1 text-[18px] font-medium transition-all duration-300 whitespace-nowrap"
                                        style={isActive ? {
                                            fontFamily: 'Anek Latin',
                                            background: item.name === 'Play' ? 'rgba(231, 194, 0, 0.15)' : 'rgba(83, 49, 234, 0.15)',
                                            color: 'black',
                                            borderRadius: '30px'
                                        } : {
                                            fontFamily: 'Anek Latin',
                                            color: 'black'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.color = 'black';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.color = 'black';
                                            }
                                        }}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right: Location & User (Now moved closer to tabs) */}
                    <div className="flex items-center gap-3 md:gap-6 justify-end flex-1 max-w-md">
                        {!isSearchVisible ? (
                            <>
                                <div
                                    className="hidden lg:flex items-center gap-2 cursor-pointer hover:text-primary transition-colors min-w-max group"
                                >
                                    <div
                                        onClick={() => setIsLocationOpen(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <img
                                            src="/loc.png"
                                            alt="Location"
                                            className="w-4.5 h-4.5 object-contain flex-shrink-0"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-[17px] font-bold text-black leading-tight tracking-tight" style={{ fontFamily: 'Anek Latin' }}>
                                                {storeLocation ? storeLocation.split(',')[0].trim() : 'Set Location'}
                                            </span>
                                            {storeLocation && storeLocation.includes(',') && (
                                                <span className="text-[13px] font-medium text-[#686868] leading-tight" style={{ fontFamily: 'Anek Latin' }}>
                                                    {storeLocation.split(',').slice(1).join(',').trim()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {storeLocation && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLocation('');
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full"
                                            title="Clear location filter"
                                        >
                                            <X size={14} className="text-gray-600" />
                                        </button>
                                    )}
                                </div>
                                <div
                                    onClick={() => setIsSearchVisible(true)}
                                    className="hidden lg:block w-5 h-5 cursor-pointer"
                                    style={{
                                        backgroundColor: isPlayPage ? '#E7C200' : '#5331EA',
                                        maskImage: 'url(/search.svg)',
                                        WebkitMaskImage: 'url(/search.svg)',
                                        maskRepeat: 'no-repeat',
                                        WebkitMaskRepeat: 'no-repeat',
                                        maskPosition: 'center',
                                        WebkitMaskPosition: 'center',
                                        maskSize: 'contain',
                                        WebkitMaskSize: 'contain'
                                    }}
                                />
                            </>
                        ) : (
                            <div ref={searchRef} className="relative w-full max-w-[280px] animate-in slide-in-from-right-4 duration-300">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <div
                                        className="w-5 h-5"
                                        style={{
                                            backgroundColor: isPlayPage ? '#E7C200' : '#5331EA',
                                            maskImage: 'url(/search.svg)',
                                            WebkitMaskImage: 'url(/search.svg)',
                                            maskRepeat: 'no-repeat',
                                            WebkitMaskRepeat: 'no-repeat',
                                            maskPosition: 'center',
                                            WebkitMaskPosition: 'center',
                                            maskSize: 'contain',
                                            WebkitMaskSize: 'contain'
                                        }}
                                    />
                                </div>
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={`Search for ${isPlayPage ? 'sports' : isDiningPage ? 'restaurants' : 'events'}...`}
                                    className={`w-full h-9 pl-11 pr-10 border rounded-[9px] text-sm font-medium focus:outline-none transition-all font-[family-name:var(--font-anek-latin)] ${isPlayPage
                                        ? 'border-[#E7C200] focus:border-[#E7C200] focus:ring-1 focus:ring-[#E7C200]'
                                        : 'border-[#686868] focus:border-[#5331EA]'
                                        }`}
                                />
                                <button
                                    onClick={() => {
                                        setIsSearchVisible(false);
                                        setSearchQuery('');
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#686868] hover:text-black"
                                >
                                    <X size={18} />
                                </button>

                                {/* Search Results Dropdown */}
                                {searchQuery.trim() && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-zinc-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="max-h-[70vh] overflow-y-auto scrollbar-hide p-2">
                                            {isSearching ? (
                                                <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
                                                    <div className="w-8 h-8 border-2 border-[#5331EA] border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-zinc-500 font-medium">Searching...</span>
                                                </div>
                                            ) : !hasResults ? (
                                                <div className="px-4 py-8 text-center text-zinc-500 font-medium">
                                                    No results found for "{searchQuery}"
                                                </div>
                                            ) : (
                                                <div className="space-y-4 py-2">
                                                    {/* Categories */}
                                                    {searchResults.categories.length > 0 && (
                                                        <div>
                                                            <h4 className="px-4 text-[12px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Categories</h4>
                                                            <div className="grid grid-cols-1 gap-1">
                                                                {searchResults.categories.map((cat: any) => (
                                                                    <Link
                                                                        key={cat.name}
                                                                        href={cat.href || '#'}
                                                                        className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 rounded-lg transition-colors group"
                                                                        onClick={() => setIsSearchVisible(false)}
                                                                    >
                                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                                                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <span className="font-medium text-zinc-900 group-hover:text-[#5331EA]">{cat.name}</span>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Items (Venues/Restaurants/Events) */}
                                                    {searchResults.items.length > 0 && (
                                                        <div>
                                                            <h4 className="px-4 text-[12px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                                                {isPlayPage ? 'Venues' : isDiningPage ? 'Restaurants' : 'Events'}
                                                            </h4>
                                                            <div className="grid grid-cols-1 gap-1">
                                                                {searchResults.items.map((item: any) => (
                                                                    <Link
                                                                        key={item.id || item.name}
                                                                        href={isDiningPage ? `/dining/venue/${item.id}` : isPlayPage ? `/play/${item.id}` : `/events/${item.id}`}
                                                                        className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 rounded-lg transition-colors group"
                                                                        onClick={() => setIsSearchVisible(false)}
                                                                    >
                                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                                                                            <img src={item.image} alt={item.name || item.title} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium text-zinc-900 group-hover:text-[#5331EA]">{item.name || item.title}</span>
                                                                            <span className="text-xs text-zinc-500">{item.location}</span>
                                                                        </div>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin Action Links */}
                        {isLoggedIn && isAdmin && (
                            <div className="hidden lg:flex items-center gap-2">
                                <Link
                                    href="/admin"
                                    className="flex items-center px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-all"
                                >
                                    <span className="text-[15px] font-bold text-zinc-900 whitespace-nowrap" style={{ fontFamily: 'Anek Latin' }}>
                                        Dashboard
                                    </span>
                                </Link>

                                {/* Create Dropdown */}
                                <div className="relative group/create">
                                    <button className="flex items-center gap-1 px-4 py-2 rounded-full bg-black text-white hover:bg-zinc-800 transition-all">
                                        <span className="text-[15px] font-bold whitespace-nowrap" style={{ fontFamily: 'Anek Latin' }}>Create</span>
                                        <ChevronDown size={16} />
                                    </button>

                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-100 py-2 opacity-0 invisible group-hover/create:opacity-100 group-hover/create:visible transition-all">
                                        <Link href="/admin/create-event" className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-black">
                                            Create Event
                                        </Link>
                                        <Link href="/admin/create-play" className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-black">
                                            Create Play
                                        </Link>
                                        <Link href="/admin/create-dining" className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-black">
                                            Create Dining
                                        </Link>
                                        <div className="mt-2 pt-2 border-t border-zinc-100">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Organizer Action Link */}
                        {isLoggedIn && isOrganizer && !isAdmin && (
                            <Link
                                href={`/organizer-dashboard?category=${organizerCategory || 'event'}`}
                                className="hidden sm:flex items-center px-4 py-2 rounded-full bg-[#f3f0ff] hover:bg-[#5331EA]/10 border border-[#5331EA]/20 transition-all group"
                            >
                                <span className="text-[15px] font-bold text-[#5331EA] whitespace-nowrap" style={{ fontFamily: 'Anek Latin' }}>
                                    Partner Dashboard
                                </span>
                            </Link>
                        )}

                        {!isAdmin && (
                            <div
                                onClick={() => setIsAuthOpen(true)}
                                className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center cursor-pointer min-w-max transition-all ${isLoggedIn ? 'bg-[#5331EA] text-white' : 'bg-[#d9d9d9] text-zinc-500'
                                    }`}
                            >
                                {/* Profile Icon */}
                                <div className="w-4.5 h-4.5 md:w-5.5 md:h-5.5">
                                    {isLoggedIn ? (
                                        <UserCircle size={24} />
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </header >
            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialView={isLoggedIn ? 'profile' : 'number'}
            />
            <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
        </>
    );
}

