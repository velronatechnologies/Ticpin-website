'use client';

import React, { useState } from 'react';
import ArtistAvatar from '@/components/events/ArtistAvatar';

interface Artist {
    name: string;
    image: string;
}

interface ArtistsSectionProps {
    artists: Artist[];
}

const ArtistsSection = React.memo(function ArtistsSection({ artists }: ArtistsSectionProps) {
    const [showLeftArrow, setShowLeftArrow] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        setShowLeftArrow(container.scrollLeft > 20);
    };

    if (artists.length === 0) return null;

    return (
        <section className="space-y-2.5 md:space-y-3">
            <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold uppercase text-black tracking-normal text-[20px] md:text-[24px]" style={{ fontWeight: 600 }}>Artists</h2>
            <div className="relative group">
                <div
                    id="artists-container"
                    onScroll={handleScroll}
                    className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 overflow-x-auto py-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
                >
                    {artists.map((artist, i) => (
                        <ArtistAvatar
                            key={i}
                            name={artist.name}
                            image={artist.image}
                        />
                    ))}
                </div>

                {showLeftArrow && (
                    <button
                        onClick={() => {
                            const container = document.getElementById('artists-container');
                            if (container) container.scrollBy({ left: -400, behavior: 'smooth' });
                        }}
                        className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-200 hidden md:flex z-20 animate-in fade-in zoom-in duration-200"
                        aria-label="Previous artists"
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
                <button
                    onClick={() => {
                        const container = document.getElementById('artists-container');
                        if (container) container.scrollBy({ left: 400, behavior: 'smooth' });
                    }}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-200 hidden md:flex z-20"
                    aria-label="Next artists"
                >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </section>
    );
});

export default ArtistsSection;
