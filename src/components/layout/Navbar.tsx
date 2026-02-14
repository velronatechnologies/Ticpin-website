'use client';

import Link from 'next/link';
import { ChevronDown, UserCircle, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import AuthModal from '@/components/modals/AuthModal';
import LocationModal from '@/components/modals/LocationModal';

export default function Navbar() {
    const pathname = usePathname();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Mocking logged in for now to show the new profile sidebar
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('Location Name');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const isPlayPage = pathname.startsWith('/play');

    const navItems = [
        { name: 'Dining', href: '/dining' },
        { name: 'Events', href: '/events' },
        { name: 'Play', href: '/play' },
    ];

    const exploreCategories = [
        { name: 'Movies', icon: '🎬', href: '/movies' },
        { name: 'Music', icon: '🎵', href: '/music' },
        { name: 'Comedy', icon: '🎭', href: '/comedy' },
        { name: 'Workshops', icon: '🎨', href: '/workshops' },
        // { name: 'Theatre', icon: '🏛️', href: '/theatre' },
        // { name: 'Adventure', icon: '🧗', href: '/adventure' },
        // { name: 'Kids', icon: '🎈', href: '/kids' },
        // { name: 'Experiences', icon: '✨', href: '/experiences' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white h-16 md:h-20 flex items-center">
            <div className="w-full h-full flex items-center justify-between px-3 md:px-4 lg:px-6">
                {/* Left: Logo, Explore and Tabs */}
                <div className="flex items-center gap-3 md:gap-8 min-w-max">
                    <div className="flex items-center gap-3 md:gap-6 relative">
                        <Link href="/dining" className="border-r border-zinc-200 pr-3 md:pr-6 flex items-center">
                            <img
                                src="/ticpin-logo-black.png"
                                alt="TicPin Logo"
                                className="h-4 md:h-7 w-auto object-contain"
                            />
                        </Link>

                        {/* Explore Dropdown */}
                        <div
                            className="hidden sm:flex items-center gap-1 cursor-pointer group"
                            onClick={() => setIsExploreOpen(!isExploreOpen)}
                        >
                            <span className="text-[18px] font-medium text-black group-hover:text-[#5331EA] transition-colors" style={{ fontFamily: 'Anek Latin' }}>Explore</span>
                            <ChevronDown size={18} className={`text-black group-hover:text-[#5331EA] transition-transform duration-300 ${isExploreOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isExploreOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsExploreOpen(false)}
                                />
                                <div className="absolute top-full left-0 mt-4 w-[280px] bg-white rounded-2xl shadow-2xl border border-zinc-100 p-3 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                                    <div className="grid grid-cols-1 gap-1">
                                        {exploreCategories.map((type) => (
                                            <Link
                                                key={type.name}
                                                href={type.href}
                                                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#5331EA]/5 transition-colors group"
                                                onClick={() => setIsExploreOpen(false)}
                                            >
                                                <span className="text-xl">{type.icon}</span>
                                                <span className="text-[16px] font-semibold text-zinc-900 group-hover:text-[#5331EA] transition-colors" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                    {type.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-zinc-50 flex items-center justify-center">
                                        <button className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest py-2 hover:text-[#5331EA] transition-colors">
                                            View All Categories
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
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
                <div className="flex items-center gap-3 md:gap-6 justify-end">
                    {!isSearchVisible ? (
                        <>
                            <div
                                onClick={() => setIsLocationOpen(true)}
                                className="hidden lg:flex items-center gap-2 cursor-pointer hover:text-primary transition-colors min-w-max"
                            >
                                <img
                                    src="/loc.png"
                                    alt="Location"
                                    className="w-4.5 h-4.5 object-contain"
                                />
                                <span className="text-[16px] font-medium text-black break-words" style={{ fontFamily: 'Anek Latin' }}>
                                    {currentLocation}
                                </span>
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
                        <div className="relative flex-1 max-w-md animate-in slide-in-from-right-4 duration-300">
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
                                placeholder="Search for events, movies and restaurants"
                                onBlur={() => setIsSearchVisible(false)}
                                className="w-full h-10 pl-12 pr-10 border border-[#686868] rounded-[9px] text-sm font-medium focus:outline-none focus:border-[#5331EA] transition-all font-[family-name:var(--font-anek-latin)]"
                            />
                            <button
                                onClick={() => setIsSearchVisible(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#686868] hover:text-black"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}
                    <div
                        onClick={() => setIsAuthOpen(true)}
                        className="h-8 w-8 md:h-10 md:w-10 bg-[#d9d9d9] rounded-full flex items-center justify-center cursor-pointer min-w-max"
                    >
                        {/* Profile Icon */}
                        <div className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-zinc-500">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialView={isLoggedIn ? 'profile' : 'number'}
            />
            <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
        </header>
    );
}
