'use client';

import { useState } from 'react';
import { Star, MapPin } from 'lucide-react';

interface EventCardProps {
    image?: string;
    title?: string;
    location?: string;
    date?: string;
    tag?: string;
    rating?: number;
    price?: string | number;
}

export default function EventCard({
    image,
    title,
    location,
    date,
    tag,
    rating,
    price,
}: EventCardProps) {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <div
            className="overflow-hidden cursor-pointer w-full sm:w-auto flex flex-col transition-all duration-300 hover:shadow-md"
            style={{
                width: '285px',
                background: 'white',
                borderRadius: '10px',
                border: '1px solid #686868'
            }}
        >
            <div className="flex-shrink-0 bg-gray-100 overflow-hidden relative flex items-center justify-center animate-pulse-once"
                style={{ height: '380px' }}
            >
                {image ? (
                    <img
                        src={image}
                        alt={title || 'Restaurant'}
                        className={`w-full h-full object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImgLoaded(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-zinc-300 font-medium">
                        No Image
                    </div>
                )}
                {tag && (
                    <div className="absolute top-3 left-3 bg-[#AC9BF7] text-white px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold uppercase z-10">
                        {tag}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-purple-600">
                            {date || 'Dining'}
                        </span>
                        {rating && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-700 text-white text-[10px] font-bold">
                                <Star size={8} fill="white" className="text-white" />
                                <span>{rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1 font-[family-name:var(--font-anek-latin)]">
                        {title || 'Name'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 font-[family-name:var(--font-anek-latin)] flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{location}</span>
                    </p>
                </div>
                {price && (
                    <p className="text-xs text-gray-500 mt-auto font-[family-name:var(--font-anek-latin)]">
                        Starting at <span className="font-semibold text-gray-700">₹{price}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
