'use client';

import React, { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface EventCardMediaProps {
    card_video_url?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    name: string;
    fallbackContent?: React.ReactNode;
}

export default function EventCardMedia({
    card_video_url,
    portrait_image_url,
    landscape_image_url,
    name,
    fallbackContent,
}: EventCardMediaProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const width = container.clientWidth;
        if (width > 0) {
            const index = Math.round(container.scrollLeft / width);
            setActiveSlide(index);
        }
    };

    const imageUrl = portrait_image_url || landscape_image_url;
    const cleanImageUrl = imageUrl?.startsWith('.') ? imageUrl.substring(1) : imageUrl;
    const cleanVideoUrl = card_video_url?.startsWith('.') ? card_video_url.substring(1) : card_video_url;

    if (!cleanVideoUrl && cleanImageUrl) {
        return (
            <img
                src={cleanImageUrl}
                alt={name}
                className="w-full h-full object-cover"
            />
        );
    }

    if (!cleanVideoUrl && !cleanImageUrl) {
        return fallbackContent ? <>{fallbackContent}</> : null;
    }

    return (
        <div className="relative w-full h-full">
            {/* Scrollable Container with Video (Slide 1) and Image (Slide 2) */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
                {/* Slide 1: Video */}
                <div className="w-full h-full flex-shrink-0 snap-center relative">
                    <video
                        src={cleanVideoUrl}
                        loop
                        muted={isMuted}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Slide 2: Image */}
                {cleanImageUrl && (
                    <div className="w-full h-full flex-shrink-0 snap-center relative">
                        <img
                            src={cleanImageUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>

            {/* Mute/Sound Toggle Button */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsMuted(prev => !prev);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-md z-30 active:scale-95 transition-transform"
                aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
                {isMuted ? (
                    <VolumeX size={16} className="text-black" />
                ) : (
                    <Volume2 size={16} className="text-black" />
                )}
            </button>

            {/* Dots / Indicators */}
            {cleanImageUrl && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === 0 ? 'bg-white scale-125 shadow-sm' : 'bg-white/50'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === 1 ? 'bg-white scale-125 shadow-sm' : 'bg-white/50'}`} />
                </div>
            )}
        </div>
    );
}
