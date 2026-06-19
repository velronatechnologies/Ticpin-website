'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Utensils, PlayCircle, Loader2, Heart } from 'lucide-react';
import { useIdentityStore } from '@/store/useIdentityStore';
import MobileEventCard from '@/components/mobile/MobileEventCard';

type Category = 'events' | 'dining' | 'play';

export default function TiclistsPage() {
    const router = useRouter();
    const { userSession, sync, logoutUser } = useIdentityStore();
    const [activeTab, setActiveTab] = useState<Category>('events');
    const [isLoading, setIsLoading] = useState(true);
    const [likedData, setLikedData] = useState<{
        events: any[];
        dining: any[];
        play: any[];
    }>({
        events: [],
        dining: [],
        play: []
    });

    useEffect(() => {
        sync();
    }, [sync]);

    useEffect(() => {
        const fetchLikes = async () => {
            setIsLoading(true);
            try {
                // 1. Get liked IDs from backend
                const res = await fetch('/backend/api/user/likes', { credentials: 'include' });
                if (res.status === 401) {
                    logoutUser();
                    router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                    return;
                }
                let likedIds: any = { events: [], play: [], dining: [], likedEventIds: [] };
                if (res.ok) {
                    try {
                        likedIds = await res.json();
                    } catch (e) {
                        console.warn('Failed to parse likes JSON, using defaults:', e);
                    }
                } else {
                    console.warn('Likes endpoint returned status:', res.status, 'using default empty likes');
                }

                // 2. Fetch data for all categories to filter
                const [eventsRes, playsRes, diningsRes] = await Promise.all([
                    fetch('/backend/api/events').then(r => r.json()).catch(() => ({ data: [] })),
                    fetch('/backend/api/play').then(r => r.json()).catch(() => ({ data: [] })),
                    fetch('/backend/api/dining').then(r => r.json()).catch(() => ({ data: [] }))
                ]);

                const events = (eventsRes.data || []).filter((item: any) => 
                    (likedIds.events || likedIds.likedEventIds || []).includes(item.id)
                );
                const play = (playsRes.data || []).filter((item: any) => 
                    (likedIds.play || []).includes(item.id)
                );
                const dining = (diningsRes.data || []).filter((item: any) => 
                    (likedIds.dining || []).includes(item.id)
                );

                setLikedData({ events, dining, play });
            } catch (error) {
                console.error('Error fetching liked items:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userSession) {
            fetchLikes();
        } else {
            setIsLoading(false);
        }
    }, [userSession]);

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                <Heart size={32} className="text-zinc-300" />
            </div>
            <h3 className="text-[18px] font-semibold text-black mb-2">Your list is empty</h3>
            <p className="text-[14px] text-zinc-500 mb-8">
                Items you like will appear here. Start exploring to build your Ticlist!
            </p>
            <button 
                onClick={() => router.push('/')}
                className="bg-[#212121] text-white px-8 py-3 rounded-full text-[14px] font-semibold active:scale-95 transition-transform"
            >
                Explore Now
            </button>
        </div>
    );

    if (!userSession && !isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
                <div className="text-center max-w-md">
                    <h2 className="text-[34px] font-semibold text-black mb-4">Please log in</h2>
                    <p className="text-[#686868] text-[20px] mb-8">You need to be logged in to review your Ticlists.</p>
                    <button 
                        onClick={() => router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                        className="px-8 py-4 bg-black text-white rounded-full text-[20px] font-semibold inline-block active:scale-95 transition-transform"
                    >
                        Login / Sign Up
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white md:bg-gray-50 flex flex-col" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center gap-4">
                <h1 className="text-[18px] font-semibold text-black leading-none">
                    Ticlists
                </h1>
            </header>

            {/* Tabs */}
            <div className="bg-white px-6 pt-2 border-b border-zinc-100">
                <div className="flex gap-8">
                    {(['events', 'dining', 'play'] as Category[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`pb-3 text-[15px] font-semibold capitalize relative transition-colors ${
                                activeTab === cat ? 'text-black' : 'text-zinc-400'
                            }`}
                        >
                            {cat}
                            {activeTab === cat && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 p-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                        <span className="text-[14px] text-zinc-500 font-medium">Loading your favorites...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {likedData[activeTab].length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {activeTab === 'events' && likedData.events.map((event) => (
                                    <div key={event.id} className="relative group">
                                        <MobileEventCard
                                            {...event}
                                            scale={1}
                                            opacity={1}
                                        />
                                    </div>
                                ))}
                                {activeTab === 'dining' && likedData.dining.map((dining) => (
                                    <div 
                                        key={dining.id}
                                        onClick={() => router.push(`/dining/venue/${encodeURIComponent(dining.name)}`)}
                                        className="bg-white rounded-[25px] overflow-hidden border border-zinc-100 shadow-sm active:scale-[0.98] transition-all"
                                    >
                                        <div className="relative aspect-[16/9] w-full">
                                            <img 
                                                src={dining.landscape_image_url || dining.portrait_image_url} 
                                                alt={dining.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                                <Heart size={20} className="text-red-500 fill-red-500" />
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-[18px] font-bold text-black mb-1 uppercase tracking-tight">{dining.name}</h3>
                                            <div className="flex items-center gap-1.5 text-zinc-500 text-[13px]">
                                                <Utensils size={14} />
                                                <span>{dining.category || 'Dining'}</span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-300 mx-1" />
                                                <span>{dining.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {activeTab === 'play' && likedData.play.map((play) => (
                                    <div 
                                        key={play.id}
                                        onClick={() => router.push(`/play/${encodeURIComponent(play.name)}`)}
                                        className="bg-white rounded-[25px] overflow-hidden border border-zinc-100 shadow-sm active:scale-[0.98] transition-all"
                                    >
                                        <div className="relative aspect-[16/9] w-full">
                                            <img 
                                                src={play.landscape_image_url || play.portrait_image_url} 
                                                alt={play.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                                <Heart size={20} className="text-red-500 fill-red-500" />
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-[18px] font-bold text-black mb-1 uppercase tracking-tight">{play.name}</h3>
                                            <div className="flex items-center gap-1.5 text-zinc-500 text-[13px]">
                                                <PlayCircle size={14} />
                                                <span>{play.category || 'Play'}</span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-300 mx-1" />
                                                <span>{play.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : renderEmptyState()}
                    </div>
                )}
            </main>

            {/* Bottom Padding for Mobile Navigation if any */}
            <div className="h-10" />
        </div>
    );
}