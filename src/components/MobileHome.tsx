'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, MapPin, ChevronRight, PlayCircle, Star, Bell, Volume2, Flame } from 'lucide-react';
import { artists, events } from '@/data/mockData';

// --- Custom Components & Styles ---

export default function MobileHome() {
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 390);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const placeholders = ["events", "dining", "play"];
    const carouselRef = useRef<HTMLDivElement>(null);
    const limelightRef = useRef<HTMLDivElement>(null);
    const [scrollX, setScrollX] = useState(0);
    const [limelightScrollX, setLimelightScrollX] = useState(0);
    const scrollEvents = [...events.slice(0, 5), ...events.slice(0, 5), ...events.slice(0, 5)];
    const limelightItems = [1, 2, 3];
    const scrollLimelight = [...limelightItems, ...limelightItems, ...limelightItems];

    useEffect(() => {
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
        if (carouselRef.current) {
            const container = carouselRef.current;
            const cardWidth = 280 + 24; // w-[280px] + gap-6 (24px)
            const itemCount = events.slice(0, 5).length;
            const initialScroll = cardWidth * itemCount;
            container.scrollLeft = initialScroll;
            setScrollX(initialScroll);
        }
        if (limelightRef.current) {
            const container = limelightRef.current;
            const cardWidth = 326 + 24; // w-[326px] + gap-6 (24px)
            const itemCount = limelightItems.length;
            const initialScroll = cardWidth * itemCount;
            container.scrollLeft = initialScroll;
            setLimelightScrollX(initialScroll);
        }
    }, []);

    const handleScroll = () => {
        if (!carouselRef.current) return;
        const container = carouselRef.current;
        const cardWidth = 280 + 24;
        const itemCount = events.slice(0, 5).length;
        const thirdWidth = cardWidth * itemCount;

        setScrollX(container.scrollLeft);

        if (container.scrollLeft <= 0) {
            container.scrollLeft = thirdWidth;
        } else if (container.scrollLeft >= thirdWidth * 2) {
            container.scrollLeft = thirdWidth;
        }
    };

    const handleLimelightScroll = () => {
        if (!limelightRef.current) return;
        const container = limelightRef.current;
        const cardWidth = 326 + 24;
        const itemCount = limelightItems.length;
        const thirdWidth = cardWidth * itemCount;

        setLimelightScrollX(container.scrollLeft);

        if (container.scrollLeft <= 0) {
            container.scrollLeft = thirdWidth;
        } else if (container.scrollLeft >= thirdWidth * 2) {
            container.scrollLeft = thirdWidth;
        }
    };

    return (
        <div
            className="md:hidden min-h-screen pb-24 w-full overflow-x-hidden font-sans selection:bg-[#866BFF]/20"
            style={{ background: 'white' }}
        >
            {/* 1. Header Section */}
            <header className="px-6 pt-7 pb-4">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-2">
                        <MapPin size={17} className="text-zinc-800" />
                        <span className="text-[15px] font-medium text-black leading-none">Location Name</span>
                    </div>
                    <div className="w-[31px] h-[31px] rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img src="/profile icon.svg" alt="Profile" className="w-5 h-5" />
                    </div>
                </div>

                {/* 2. Search Bar - Rectangle 253 */}
                <div className="relative w-full h-[48px] bg-white rounded-[28px] border border-[#AEAEAE] flex items-center px-5 mb-14">
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
                </div>

                {/* 3. Horizontal Divider Line 60 */}
                <div className="w-full h-[2px] bg-[#AEAEAE] opacity-100 mb-6 mt-[-20px]" />

                {/* 4. Categories Section - Rectangle 23, 254, 255 */}
                <div className="grid grid-cols-3 gap-4 px-1">
                    {/* Dining */}
                    <div className="flex flex-col items-center">
                        <div
                            className="w-full aspect-[106/125] rounded-[25px] flex flex-col items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(360deg, #866BFF -49.4%, #EDEDED 50%)' }}
                        >
                            <img src="/mobile_icons/Dining 1.svg" alt="Dining" className="w-[60%] h-[60%] object-contain" />
                            <span className="text-[15px] font-medium text-black uppercase tracking-tight">DINING</span>
                        </div>
                    </div>

                    {/* Events */}
                    <div className="flex flex-col items-center">
                        <div
                            className="w-full aspect-[106/125] rounded-[30px] flex flex-col items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(360deg, #866BFF -49.4%, #EDEDED 50%)' }}
                        >
                            <img src="/mobile_icons/Events 1.svg" alt="Events" className="w-[50%] h-[50%] object-contain" />
                            <span className="text-[15px] font-medium text-black uppercase tracking-tight">EVENTS</span>
                        </div>
                    </div>

                    {/* Play */}
                    <div className="flex flex-col items-center">
                        <div
                            className="w-full aspect-[106/125] rounded-[30px] flex flex-col items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(360deg, #E7C200 -49.4%, #EDEDED 50%)' }}
                        >
                            <img src="/mobile_icons/Pickelball 1.svg" alt="Play" className="w-[50%] h-[50%] object-contain" />
                            <span className="text-[15px] font-medium text-black uppercase tracking-tight">PLAY</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 5. Sections Container */}
            <main className="mt-12 space-y-16 pb-12">

                {/* Hot Right Now Section */}
                <section>
                    <h2 className="text-[20px] font-medium text-black text-center mb-8 uppercase tracking-wide mt-[-35px]">HOT RIGHT NOW</h2>
                    <div
                        ref={carouselRef}
                        onScroll={handleScroll}
                        className="flex gap-6 overflow-x-auto px-6 scrollbar-hide snap-x snap-mandatory items-center py-8"
                    >
                        {scrollEvents.map((event, idx) => {
                            // Calculate scale and opacity based on distance from center
                            const cardWidth = 280;
                            const gap = 24;
                            const totalCardWidth = cardWidth + gap;
                            const containerWidth = windowWidth;
                            const scrollCenter = scrollX + containerWidth / 2;
                            const cardCenter = (idx * totalCardWidth) + (cardWidth / 2) + 24; // 24 for px-6

                            const distance = Math.abs(scrollCenter - cardCenter);
                            const threshold = totalCardWidth;
                            const t = Math.min(distance / threshold, 1);

                            const scale = 1.1 - t * 0.10; // Active 1.1, Side 1.0
                            const opacity = 1 - t * 0; // Active 1, Side 0.7

                            return (
                                <div
                                    key={`${event.id}-${idx}`}
                                    className="flex-shrink-0 w-[280px] max-w-[85vw] bg-white rounded-[20px] border-[0.5px] border-[#AEAEAE] overflow-hidden snap-center snap-always transition-all duration-150 ease-out origin-center"
                                    style={{
                                        transform: `scale(${scale})`,
                                        opacity: opacity
                                    }}
                                >
                                    {/* Top Poster Section */}
                                    <div className="w-full aspect-[280/390] relative overflow-hidden bg-[#110D2C]">
                                        {event.image ? (
                                            <img
                                                src={event.image.startsWith('.') ? event.image.substring(1) : event.image}
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
                                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10 z-20">
                                            <Volume2 size={16} className="text-white" />
                                        </div>
                                    </div>

                                    {/* Bottom Details Section */}
                                    <div className="p-5 relative bg-white">
                                        <p className="text-[12px] font-medium text-[#5331EA] mb-1.5 uppercase tracking-wide" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                            {event.date ? `${event.date.toUpperCase()}, ${event.time}` : "{DAY}, {DATE}, {TIME}"}
                                        </p>
                                        <h3 className="text-[20px] font-medium text-black uppercase leading-[1.1] tracking-tight truncate" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                            {event.name || "{EVENT NAME}"}
                                        </h3>
                                        <p className="text-[12px] font-regular text-[#8E8E8E] mt-2 uppercase tracking-wider truncate" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                            {event.location || "{EVENT LOCATION}"}
                                        </p>
                                        <p className="text-[12px] font-regular text-[#8E8E8E] mt-0.5 uppercase tracking-wider" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                                            {event.ticketPrice ? `Starts at ${event.ticketPrice}` : "{EVENT STARTING PRICE}"}
                                        </p>

                                        {/* Fire/Hot Icon */}
                                        <div className="absolute top-5 right-5 w-10 h-10 rounded-[12px] bg-[#EFEFEF] flex items-center justify-center mt-[-10px]">
                                            <Flame size={20} className="text-black" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Artist Section */}
                <section>
                    <h2 className="text-[25px] font-medium text-black text-center mb-8 uppercase tracking-normal mt-[-30px]" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>ARTIST</h2>
                    <div className="flex gap-6 overflow-x-auto px-6 scrollbar-hide snap-x ml-[20px]">
                        {artists.map((artist) => (
                            <div key={artist.id} className="flex-shrink-0 w-[138px] snap-start">
                                <div className="w-[138px] h-[146px] rounded-[13px] bg-[#AC9BF7] overflow-hidden group relative">
                                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </div>
                                <p className="text-[14px] font-medium text-black mt-3 text-center uppercase tracking-wider" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>{artist.name}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* In Limelight Section */}
                <section>
                    <h2 className="text-[25px] font-medium text-black text-center mb-8 uppercase tracking-wide mt-[-30px]" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>IN LIMELIGHT</h2>
                    <div
                        ref={limelightRef}
                        onScroll={handleLimelightScroll}
                        className="flex gap-6 overflow-x-auto px-6 scrollbar-hide snap-x snap-mandatory items-center py-8 mt-[-30px]"
                    >
                        {scrollLimelight.map((i, idx) => {
                            // Calculate scale and opacity based on distance from center
                            const cardWidth = 326;
                            const gap = 24;
                            const totalCardWidth = cardWidth + gap;
                            const containerWidth = windowWidth;
                            const scrollCenter = limelightScrollX + containerWidth / 2;
                            const cardCenter = (idx * totalCardWidth) + (cardWidth / 2) + 24; // 24 for px-6

                            const distance = Math.abs(scrollCenter - cardCenter);
                            const threshold = totalCardWidth;
                            const t = Math.min(distance / threshold, 1);

                            const scale = 1.05 - t * 0.05; // Active 1.05, Side 1.0
                            const opacity = 1 - t * 0; // Active 1, Side 0.7

                            return (
                                <div
                                    key={`limelight-${idx}`}
                                    className="flex-shrink-0 w-[326px] max-w-[85vw] bg-white rounded-[15px] border-[0.5px] border-[#AEAEAE] snap-center snap-always transition-all duration-150 ease-out origin-center overflow-hidden"
                                    style={{
                                        transform: `scale(${scale})`,
                                        opacity: opacity
                                    }}
                                >
                                    <div className="w-full aspect-[326/182] bg-zinc-100 relative">
                                        <div className="absolute inset-0 flex items-center justify-center text-zinc-300 font-bold tracking-widest text-xs">DINING PREVIEW</div>
                                        <div className="absolute h-[29px] bottom-0 left-0 right-0 bg-[#AC9BF7] flex items-center px-4">
                                            <div className="flex items-center gap-1.5">
                                                <Star size={14} className="text-[#5331EA] fill-[#5331EA]" />
                                                <span className="text-white text-[14px] font-medium">Flat 40% OFF</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 flex justify-between items-end">
                                        <div>
                                            <h3 className="text-[17px] font-bold text-black uppercase" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>Grand Dining Space</h3>
                                            <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-widest" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>KOREGAON PARK</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-400">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Offers Section */}
                <section className="px-6">
                    <h2 className="text-[20px] font-medium text-black text-center mb-8 uppercase tracking-wide" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>OFFERS</h2>
                    <div className="w-full h-[109px] bg-white rounded-[15px] border border-[#AEAEAE] relative overflow-hidden flex items-center px-8">
                        <div className="absolute left-0 top-0 w-2 h-full bg-[#AC9BF7]" />
                        <div>
                            <p className="text-[17px] font-bold text-black uppercase" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>Weekend Special</p>
                            <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-widest mt-1 underline" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>Claim your badge</p>
                        </div>
                        <ChevronRight className="ml-auto text-zinc-300" />
                    </div>
                </section>

                {/* Play Near You Section */}
                <section>
                    <h2 className="text-[20px] font-medium text-black text-center mb-8 uppercase tracking-wide" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>PLAY NEAR YOU</h2>
                    <div className="flex gap-6 overflow-x-auto px-6 scrollbar-hide snap-x">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex-shrink-0 w-[326px] bg-white rounded-[15px] border-[0.5px] border-[#AEAEAE] snap-center p-0.5">
                                <div className="h-[182px] bg-zinc-200 rounded-t-[13px] flex items-center justify-center text-zinc-400 font-bold uppercase tracking-widest text-xs">TURF IMAGE</div>
                                <div className="p-5 flex justify-between items-end">
                                    <div>
                                        <h3 className="text-[17px] font-bold text-black uppercase" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>Champions Turf</h3>
                                        <p className="text-[12px] font-medium text-zinc-500 uppercase" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>HADAPSAR, PUNE</p>
                                    </div>
                                    <button
                                        className="h-[37px] px-6 bg-black text-white text-[20px] font-medium rounded-[7px] uppercase transition-transform active:scale-95 shadow-lg shadow-black/10"
                                        style={{ fontFamily: "'Anek Tamil Condensed', sans-serif" }}
                                    >
                                        BOOK SLOTS
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. Footer Banner (Ticpin Pass) */}
                <div className="px-6">
                    <div className="rounded-[15px] overflow-hidden shadow-xl border border-[#AEAEAE] group relative h-[109px]">
                        <img src="/ticpin banner.jpg" alt="Ticpin Pass" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center px-8">
                            <div className="text-center">
                                <h2 className="text-white font-medium text-[20px] uppercase tracking-tighter shadow-sm">TICPIN PASS</h2>
                                <p className="text-white/80 text-[10px] font-medium uppercase tracking-widest mt-1 underline">Unlock Exclusive Access</p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div >
    );
}
