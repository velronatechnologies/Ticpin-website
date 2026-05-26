'use client';
import { useState } from 'react';
import FilterModal from '../modals/FilterModal';

interface FilterBarProps {
    filters: string[];
    activeFilter?: string;
    onFilterChange?: (filter: string) => void;
    type?: 'play' | 'events' | 'dining';
    onApply?: (filters: Record<string, string[]>) => void;
    initialModalFilters?: Record<string, string[]>;
}

export default function FilterBar({
    filters,
    activeFilter,
    onFilterChange,
    type = 'play',
    onApply,
    initialModalFilters
}: FilterBarProps) {
    const [internalActiveFilter, setInternalActiveFilter] = useState('Filters');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const currentActiveFilter = activeFilter !== undefined ? activeFilter : internalActiveFilter;

    const handleFilterClick = (filter: string) => {
        if (onFilterChange) {
            onFilterChange(filter);
        } else {
            setInternalActiveFilter(filter);
        }
    };

    return (
        <div className="flex flex-wrap gap-1.5 md:gap-2 px-2 font-[family-name:var(--font-anek-latin)]">
            {/* Filters Button */}
            <button
                onClick={() => setIsFilterModalOpen(true)}
                className={`px-4 py-1.5 text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${isFilterModalOpen
                    ? 'bg-[#d9d9d9] text-black shadow-inner'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                style={{
                    border: '1px solid #aeaeae',
                    borderRadius: '10px'
                }}
            >
                <img src="/filter 1.png" alt="Filter" className="w-[14px] h-[14px] object-contain" />
                <span>Filters</span>
                <img src="/filter arrow.svg" alt="arrow" className={`w-[8px] h-[5px] ml-0.5 transition-transform ${isFilterModalOpen ? 'rotate-180' : ''}`} />
            </button>

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                type={type}
                onApply={onApply}
                initialFilters={initialModalFilters}
            />

            {/* Other Filter Buttons */}
            {filters.map((filter, i) => (
                <button
                    key={i}
                    onClick={() => handleFilterClick(filter)}
                    className={`px-4 py-1.5 text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap uppercase ${currentActiveFilter === filter
                        ? 'bg-[#e1e1e1] text-black shadow-inner'
                        : 'bg-white text-black '
                        }`}
                    style={{
                        border: '1px solid #aeaeae',
                        borderRadius: '10px'
                    }}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
}

