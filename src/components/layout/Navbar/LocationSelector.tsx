'use client';

import React from 'react';
import Image from 'next/image';
import { LocationData } from '@/lib/hooks/useGeolocation';
interface LocationSelectorProps {
    location: LocationData | null;
    onOpenModal: () => void;
    onClear: () => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ location, onOpenModal, onClear }) => {
    return (
        <div className="hidden lg:flex items-center gap-1 min-w-max">
            <div
                onClick={onOpenModal}
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
            >
                <Image src="/loc icon.svg" alt="Location" width={18} height={18} className="w-4.5 h-4.5 object-contain" />
                <span className="text-[16px] font-medium text-black break-words max-w-[180px] truncate" style={{ fontFamily: 'Anek Latin' }}>
                    {location?.name || 'Location Name'}
                </span>
            </div>
        </div>
    );
};

export default React.memo(LocationSelector);
