'use client';

import React from 'react';
import ArtistAvatar from '@/components/events/ArtistAvatar';

interface Artist {
    name: string;
    image: string;
}

interface ArtistsSectionProps {
    artists: Artist[];
}

const ArtistsSection = React.memo(function ArtistsSection({
    artists,
}: ArtistsSectionProps) {

    if (artists.length === 0) return null;

    return (
        <section className="space-y-2.5 md:space-y-3">
            <h2
                className="font-[family-name:var(--font-anek-latin)] font-semibold uppercase text-black tracking-normal text-[20px] md:text-[24px]"
                style={{ fontWeight: 600 }}
            >
                Artists
            </h2>

            <div
                className="
                    flex gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12
                    overflow-x-auto py-4
                    scrollbar-hide scroll-smooth
                    snap-x snap-mandatory
                    touch-pan-x
                    cursor-grab active:cursor-grabbing
                "
            >
                {artists.map((artist, i) => (
                    <ArtistAvatar
                        key={i}
                        name={artist.name}
                        image={artist.image}
                    />
                ))}
            </div>
        </section>
    );
});

export default ArtistsSection;