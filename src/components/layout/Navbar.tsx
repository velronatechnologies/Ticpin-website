'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Menu } from 'lucide-react';

// Sub-components
// Sub-components
import SearchInput from './Navbar/SearchInput';
import LocationSelector from './Navbar/LocationSelector';
import UserMenu from './Navbar/UserMenu';
import ProfileDrawer from './Navbar/ProfileDrawer';

// Hooks & Utils
import { useLocationStore } from '@/store/useLocationStore';
import { useIdentityStore } from '@/store/useIdentityStore';
import { clearOrganizerSession } from '@/lib/auth/organizer';
import { clearUserSession } from '@/lib/auth/user';
import { navItems } from '@/data/constants';

const AuthModal = dynamic(() => import('@/components/modals/AuthModal'), { ssr: false });
const LocationModal = dynamic(() => import('@/components/modals/LocationModal'), { ssr: false });

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    // UI State
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const [authView, setAuthView] = useState<'number' | 'otp' | 'profile' | 'location'>('number');

    // Custom Hooks
    // Centralized State from Stores
    const { currentLocation, setLocation, clearLocation } = useLocationStore();
    const { userSession, organizerSession, sync: syncAuth, logoutUser, logoutOrganizer } = useIdentityStore();

    useEffect(() => {
        syncAuth();

        const handleAuthChange = () => {
            syncAuth();
        };

        // Auto-open location modal only on first visit (not on refresh)
        // Check if modal has been shown before using localStorage
        const hasSeenLocationModal = typeof window !== 'undefined' && localStorage.getItem('locationModalShown') === 'true';

        if (!currentLocation && !hasSeenLocationModal) {
            const timer = setTimeout(() => {
                setIsLocationOpen(true);
                // Mark as shown so it won't show again on refresh
                localStorage.setItem('locationModalShown', 'true');
            }, 1000); // Small delay for better UX
            return () => clearTimeout(timer);
        }

        window.addEventListener('user-auth-change', handleAuthChange);
        window.addEventListener('organizer-auth-change', handleAuthChange);

        return () => {
            window.removeEventListener('user-auth-change', handleAuthChange);
            window.removeEventListener('organizer-auth-change', handleAuthChange);
        };
    }, [syncAuth, currentLocation]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('showLogin') === 'true') {
            setAuthView('number');
            setIsAuthOpen(true);
            
            // Clean up only showLogin parameter from URL
            searchParams.delete('showLogin');
            const paramStr = searchParams.toString();
            const cleanUrl = window.location.pathname + (paramStr ? '?' + paramStr : '');
            window.history.replaceState({}, '', cleanUrl);
        }
    }, []);

    const hideNavbar =
        pathname?.startsWith('/organizer') ||
        pathname?.startsWith('/ticket') ||
        pathname?.startsWith('/admin') ||
        pathname === '/contact' ||
        pathname === '/terms' ||
        pathname === '/privacy' ||
        pathname === '/refund' ||
        pathname === '/ticpass' ||
        pathname === '/pass/buy' ||
        pathname.includes('/book') ||
        pathname.startsWith('/bookings');

    // Use organizer session only when the organizer is actively logged in.
    // When only a user is logged in, session must be null so UserMenu shows user data.
    const session = organizerSession ?? null;
    const profileRef = useRef<HTMLDivElement>(null);

    // Closing profile menu on click outside
    useEffect(() => {
        if (hideNavbar) return;
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [hideNavbar]);

    if (hideNavbar) return null;

    // Logout Handlers
    const handleOrganizerLogout = () => {
        logoutOrganizer();
        setIsProfileMenuOpen(false);
        router.push('/');
    };

    const handleUserLogout = () => {
        logoutUser();
        setIsProfileMenuOpen(false);
        router.push('/');
    };

    const handleProfileClick = () => {
        if (session || userSession) {
            setIsProfileDrawerOpen(!isProfileDrawerOpen);
        } else {
            setAuthView('number');
            setIsAuthOpen(true);
        }
    };


    const closeProfileDrawer = () => {
        setIsProfileDrawerOpen(false);
    };

    const isListingPage =
        pathname.startsWith('/list-your-dining') ||
        pathname.startsWith('/list-your-events') ||
        pathname.startsWith('/list-your-play');
    const isOrganizer = pathname.startsWith('/organizer');
    const isPlayPage = pathname.startsWith('/play');
    const isHome = pathname === '/';
    const isEventDetail = pathname.match(/^\/events\/[^/]+$/);
    const isDiningDetail = pathname.match(/^\/dining\/venue\/[^/]+$/);
    const isEvents = pathname === '/events';
    const isSettingsPage = pathname.endsWith('/settings');

    return (
        <header
            className="hidden md:flex sticky top-0 z-50 w-full border-b border-zinc-200 h-[70px] items-center"
            style={{
                zoom: isSettingsPage ? '0.8' : '1.0',
                background: '#FFFFFF'
            }}
        >
            <div className="w-full h-full flex items-center justify-between px-[37px]">

                {/* Left: Logo & Nav Items */}
                <div className="flex items-center gap-3 md:gap-8 min-w-max">
                    <Link href="/" className={isListingPage ? "flex items-center" : "border-r border-zinc-200 pr-3 md:pr-6 flex items-center"}>
                        <Image
                            src="/ticpin-logo-black.png"
                            alt="Ticpin Logo"
                            width={159}
                            height={28}
                            className="h-4 md:h-7 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {!isListingPage && !isOrganizer && !isSettingsPage && (
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
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}
                </div>

                {/* Right: Location, Search & User Menu */}
                <div className="flex items-center gap-3 md:gap-6 justify-end">
                    {isSettingsPage && (
                        <div className="p-2 cursor-pointer hover:bg-zinc-100 rounded-full transition-colors mr-2">
                            <Menu size={28} className="text-black" />
                        </div>
                    )}

                    {!isListingPage && !isOrganizer && !isSettingsPage && !isSearchVisible && (
                        <>
                            <LocationSelector
                                location={currentLocation}
                                onOpenModal={() => setIsLocationOpen(true)}
                                onClear={clearLocation}
                            />
                            {!isEventDetail && (
                                <div
                                    onClick={() => setIsSearchVisible(true)}
                                    className="hidden lg:block w-5 h-5 cursor-pointer"
                                    style={{
                                        backgroundColor: isPlayPage ? '#E7C200' : '#5331EA',
                                        maskImage: 'url(/search.svg)', WebkitMaskImage: 'url(/search.svg)',
                                        maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
                                        maskPosition: 'center', WebkitMaskPosition: 'center',
                                        maskSize: 'contain', WebkitMaskSize: 'contain'
                                    }}
                                />
                            )}
                        </>
                    )}

                    {!isListingPage && !isSettingsPage && !isEventDetail && (
                        <SearchInput
                            isVisible={isSearchVisible}
                            isPlayPage={isPlayPage}
                            onClose={() => setIsSearchVisible(false)}
                        />
                    )}

                    <div ref={profileRef}>
                        <UserMenu
                            session={session}
                            userSession={userSession}
                            isMenuOpen={isProfileMenuOpen}
                            onToggleMenu={handleProfileClick}
                            onUserLogout={handleUserLogout}
                            onOrganizerLogout={handleOrganizerLogout}
                            onOpenProfile={() => { }} // No longer used - direct navigation instead
                        />
                    </div>
                </div>
            </div>

            <ProfileDrawer
                isOpen={isProfileDrawerOpen}
                onClose={closeProfileDrawer}
                userSession={userSession}
                session={session}
                onUserLogout={handleUserLogout}
                onOrganizerLogout={handleOrganizerLogout}
                router={router}
            />

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialView={authView}
            />
            <LocationModal
                isOpen={isLocationOpen}
                onClose={() => setIsLocationOpen(false)}
                onSelect={setLocation}
            />
        </header>
    );
}
