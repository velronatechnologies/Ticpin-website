'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, SlidersHorizontal, Calendar, PlayCircle, Utensils, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLocation } from '@/lib/useLocation';
import { useLocationStore } from '@/store/useLocationStore';
import { useIdentityStore } from '@/store/useIdentityStore';
import dynamic from 'next/dynamic';

const AuthModal = dynamic(() => import('@/components/modals/AuthModal'), { ssr: false });
const LocationModal = dynamic(() => import('@/components/modals/LocationModal'), { ssr: false });
const ProfileDrawer = dynamic(() => import('@/components/layout/Navbar/ProfileDrawer'), { ssr: false });
const FilterModal = dynamic(() => import('@/components/modals/FilterModal'), { ssr: false });

interface RealPlay {
    _id?: string;
    id?: string;
    name: string;
    city?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    image?: string;
    images?: string[];
    category?: string;
    sub_category?: string;
    dimension?: string;
    rating?: number;
    status?: string;
    price_starts_from?: number;
}

interface MobilePlayProps {
    venues: RealPlay[];
}

const sportsCategories = [
    { name: 'Cricket', image: '/play/playck.png' },
    { name: 'Football', image: '/play/playfb.png' },
    { name: 'Pickleball', image: '/play/playpb.png' },
    { name: 'Tennis', image: '/play/playtens.png' },
    { name: 'Badminton', image: '/play/playbm.png' },
    { name: 'Table Tennis', image: '/play/playtt.png' },
    { name: 'Basketball', image: '/play/playbb.png' },
];

export default function MobilePlay({ venues }: MobilePlayProps) {
    const router = useRouter();
    const city = useLocation();
    const { setLocation } = useLocationStore();
    const { userSession, organizerSession, sync } = useIdentityStore();
    const session = userSession || organizerSession;

    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [modalFilters, setModalFilters] = useState<Record<string, string[]>>({});

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchDataRef = useRef<any[]>([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const placeholders = ["events", "dining", "play"];

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

    // Filter venues by selected city, search text, and category
    const filteredVenues = useMemo(() => {
        let result = venues.filter(v => v.status === 'approved');

        // Location City Filter
        if (city) {
            const cleanCity = city.split(',')[0].trim().toLowerCase();
            result = result.filter(v => {
                const venueCity = (v.city || '').toLowerCase();
                return venueCity.includes(cleanCity) || cleanCity.includes(venueCity);
            });
        }

        // Search Query Filter
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            result = result.filter(v =>
                (v.name || '').toLowerCase().includes(query) ||
                (v.city || '').toLowerCase().includes(query) ||
                (v.category || '').toLowerCase().includes(query) ||
                (v.sub_category || '').toLowerCase().includes(query)
            );
        }

        // Chip / Sport category Filter
        if (activeFilter !== 'All') {
            if (activeFilter === 'Top Rated') {
                result = result.filter(v => (v.rating || 0) >= 4);
            } else {
                result = result.filter(v => (v.category || '').toLowerCase() === activeFilter.toLowerCase());
            }
        }

        // Modal Category filter (sports)
        if (modalFilters.sports?.length > 0) {
            result = result.filter(v => modalFilters.sports.map(s => s.toLowerCase()).includes((v.category || '').toLowerCase()));
        }

        // Modal Dimension filter
        if (modalFilters.dimension?.length > 0) {
            result = result.filter(v => modalFilters.dimension.includes(v.dimension || ''));
        }

        // Modal Sort filter
        if (modalFilters.play_sort?.includes('Price : Low to High')) {
            result = [...result].sort((a, b) => (a.price_starts_from || 0) - (b.price_starts_from || 0));
        } else if (modalFilters.play_sort?.includes('Price : High to Low')) {
            result = [...result].sort((a, b) => (b.price_starts_from || 0) - (a.price_starts_from || 0));
        } else if (modalFilters.play_sort?.includes('Rating : High to Low')) {
            result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (modalFilters.play_sort?.includes('Dimension : A to Z')) {
            result = [...result].sort((a, b) => (a.dimension || '').localeCompare(b.dimension || ''));
        }

        return result;
    }, [venues, searchQuery, activeFilter, city, modalFilters]);

    // Grouping for "near you" sections (only from approved list matching active city)
    const groupedPlays = useMemo(() => {
        const groups: Record<string, RealPlay[]> = {};
        const baseVenues = venues.filter(v => v.status === 'approved');

        // Apply city filter to "near you" groups
        const cityFiltered = city
            ? baseVenues.filter(v => {
                const cleanCity = city.split(',')[0].trim().toLowerCase();
                const venueCity = (v.city || '').toLowerCase();
                return venueCity.includes(cleanCity) || cleanCity.includes(venueCity);
            })
            : baseVenues;

        cityFiltered.forEach(play => {
            if (play.category) {
                const cat = play.category.toUpperCase();
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(play);
            }
        });
        return groups;
    }, [venues, city]);

    const getVenueImage = (v: RealPlay) =>
        v.landscape_image_url || v.portrait_image_url || v.images?.[0] || v.image || "/mob dining.jpg";

    return (
        <div className="md:hidden min-h-screen w-full relative overflow-x-hidden font-sans pb-10"
            style={{ background: 'linear-gradient(180deg, #FFF7CD -311.56%, #FFFFFF 100%)', fontFamily: 'var(--font-anek-latin), sans-serif' }}>

            {/* 1. Header Section */}
            <header className="px-6 pt-7 pb-4">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-5 w-auto object-contain" />
                        </Link>
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
                                setIsAuthOpen(true);
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
                <div className="relative w-full h-[48px] bg-white rounded-[28px] border border-[#AEAEAE] flex items-center px-5 mb-14">
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
                </div >
                {searchQuery.trim().length > 0 && (
                    <div className="absolute top-[180px] left-6 right-6 bg-white border border-[#AEAEAE] rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
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

                {/* 3. Horizontal Divider Line */}
                < div className="w-full h-[1px] bg-[#AEAEAE] opacity-100 mb-6 mt-[-20px]" />
            </header>

            {/* 4. Explore Sports Section */}
            <div className="mt-[-20px] px-[18px]">
                <h2 className="text-[20px] font-medium text-black mb-6 tracking-tight">Explore Sports</h2>

                {/* 5. Sports Categories Grid */}
                <div className="grid grid-cols-3 gap-x-[25px] gap-y-4">
                    {sportsCategories.map((sport, i) => {
                        const isSelected = activeFilter.toLowerCase() === sport.name.toLowerCase();
                        return (
                            <button
                                key={i}
                                onClick={() => {
                                    if (isSelected) {
                                        setActiveFilter('All');
                                    } else {
                                        setActiveFilter(sport.name);
                                    }
                                }}
                                className="flex flex-col items-center outline-none"
                            >
                                <div
                                    className={`w-[89px] h-[120px] rounded-[25px] border flex flex-col items-center justify-start pt-3 relative overflow-visible cursor-pointer transition-all duration-150 ${
                                        isSelected
                                            ? 'border-[#5331EA] shadow-[0_0_8px_rgba(83,49,234,0.3)] ring-2 ring-[#5331EA]'
                                            : 'border-[#E1E1E1]/60'
                                    }`}
                                    style={{ background: 'linear-gradient(180deg, #FFFFFF 50%, #E7C200 159.52%)' }}
                                >
                                    <span className={`text-[10px] font-semibold tracking-tight z-10 ${isSelected ? 'text-[#5331EA]' : 'text-black'}`}>
                                        {sport.name}
                                    </span>

                                    {/* Image Overlay */}
                                    <div className="absolute inset-x-0 -bottom-1 flex justify-center z-20 pointer-events-none">
                                        <img
                                            src={sport.image}
                                            alt={sport.name}
                                            className={`${sport.name === 'Football' ? 'w-[110px] h-[110px] -bottom-2 scale-110' : 'w-[80px] h-[80px]'} object-contain`}
                                            style={{
                                                transform: sport.name === 'Badminton' ? 'rotate(12.48deg)' : 'none'
                                            }}
                                        />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-1 flex justify-center">
                                        <div className="w-[59px] h-[11px] bg-black/10 rounded-full" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 6. COURT NEAR YOU - Horizontal Slider */}
            <div className="mt-[40px] space-y-12 ml-[18px]">
                {Object.entries(groupedPlays).map(([sportName, playList], idx) => {
                    if (playList.length === 0) return null;
                    return (
                        <div key={idx} className="relative">
                            <h3 className="text-[15px] font-medium text-black text-center mb-6 uppercase tracking-tight">
                                {sportName} COURT NEAR YOU
                            </h3>
                            <div className="flex gap-4 overflow-x-auto px-[18px] scrollbar-hide snap-x snap-mandatory">
                                {playList.map((venue, vIdx) => (
                                    <div
                                        key={vIdx}
                                        onClick={() => router.push(`/play/${encodeURIComponent(venue.name)}`)}
                                        className="flex-shrink-0 w-[262px] h-[241px] bg-white rounded-[15px] border-[0.5px] border-[#AEAEAE] overflow-hidden flex flex-col active:scale-[0.98] transition-all cursor-pointer snap-start mb-1 shadow-sm"
                                    >
                                        <div className="h-[148px] w-full relative overflow-hidden">
                                            <img src={getVenueImage(venue)} className="w-full h-full object-cover" alt={venue.name} />
                                            {venue.rating && venue.rating >= 4.5 && (
                                                <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center border border-white/20 shadow-sm backdrop-blur-sm">
                                                    <img src="/mobile_icons/Vector 2.svg" alt="Hot" className="w-[18px] h-[18px] object-contain" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 bg-white flex flex-col justify-between flex-1">
                                            <div className="flex flex-col">
                                                <h4 className="text-[20px] font-bold text-black leading-tight truncate uppercase tracking-tight">{venue.name}</h4>
                                                <p className="text-[14px] font-semibold text-[#686868] mt-1 line-clamp-1">{venue.city || 'Bangalore'}</p>
                                            </div>
                                            <div className="mt-auto flex justify-between items-center">
                                                <div className="px-3 h-[24px] bg-[#D9D9D9] rounded-[15px] flex items-center justify-center">
                                                    <span className="text-[10px] font-semibold text-black">Play options</span>
                                                </div>
                                                {venue.price_starts_from && (
                                                    <span className="text-[14px] font-bold text-black">₹{venue.price_starts_from}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 7. All Sports Venues Section */}
            <div className="mt-[60px] px-[18px]">
                <h3 className="text-[20px] font-medium text-black mb-6 uppercase tracking-tight">All Sports Venues</h3>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    <button 
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex-shrink-0 px-3 h-[31px] border border-black rounded-[9px] flex items-center gap-1.5 bg-white active:bg-zinc-100"
                    >
                        <SlidersHorizontal size={14} className="text-black" />
                        <span className="text-[15px] font-medium text-black">Filters</span>
                    </button>
                    {['All', 'Top Rated', 'Cricket', 'Pickleball', 'Badminton', 'Football', 'Tennis', 'Basketball'].map((filterItem) => (
                        <button
                            key={filterItem}
                            onClick={() => setActiveFilter(filterItem)}
                            className={`flex-shrink-0 px-4 h-[31px] border border-black rounded-[9px] flex items-center justify-center transition-colors text-[15px] font-medium ${
                                activeFilter === filterItem ? 'bg-black text-white' : 'bg-white text-black'
                            }`}
                        >
                            {filterItem}
                        </button>
                    ))}
                </div>

                {/* All Venue Cards */}
                {filteredVenues.length > 0 ? (
                    <div className="space-y-6">
                        {filteredVenues.map((venue, idx) => (
                            <div
                                key={idx}
                                onClick={() => router.push(`/play/${encodeURIComponent(venue.name)}`)}
                                className="w-full max-w-[366px] h-[336px] bg-white rounded-[15px] border border-[#AEAEAE] overflow-hidden flex flex-col mx-auto active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                            >
                                <div className="h-[200px] w-full relative overflow-hidden">
                                    <img src={getVenueImage(venue)} className="w-full h-full object-cover" alt={venue.name} />
                                </div>
                                <div className="p-5 flex-1 bg-white flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="text-[22px] font-bold text-black leading-tight uppercase truncate">{venue.name}</h4>
                                            <p className="text-[15px] font-semibold text-[#686868] mt-1">{venue.city || 'Bangalore'}</p>
                                        </div>
                                        {venue.price_starts_from && (
                                            <span className="text-[18px] font-extrabold text-black shrink-0">₹{venue.price_starts_from}</span>
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="w-[92px] h-[28px] bg-[#D9D9D9] rounded-[15px] flex items-center justify-center">
                                            <span className="text-[13px] font-semibold text-black">Play options</span>
                                        </div>
                                        {venue.rating && (
                                            <span className="text-[14px] font-bold text-yellow-600">★ {venue.rating}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-zinc-500 font-medium">
                        No venues found matching the criteria.
                    </div>
                )}
            </div>

            {/* 8. Bottom Ticpin Pass Banner */}
            <div className="mt-10 px-[18px] pb-10">
                <Link href="/my-pass" className="block w-full max-w-[327px] h-[80px] rounded-[15px] overflow-hidden mx-auto shadow-sm active:opacity-90 transition-opacity">
                    <img src="/ticpin banner.jpg" className="w-full h-full object-cover" alt="Ticpin Pass" />
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
            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onSuccess={() => sync()}
            />
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                type="play"
                onApply={setModalFilters}
            />
            <ProfileDrawer
                isOpen={isProfileDrawerOpen}
                onClose={() => setIsProfileDrawerOpen(false)}
            />
        </div>
    );
}
