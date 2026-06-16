'use client';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CATEGORY_DATA } from '@/app/play/create/data';

type FilterType = 'play' | 'events' | 'dining';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    type?: FilterType;
    onApply?: (filters: Record<string, string[]>) => void;
    initialFilters?: Record<string, string[]>;
}

type CategoryId = 'play_sort' | 'event_sort' | 'dining_sort' | 'sort' | 'sports' | 'dimension' | 'event_category' | 'venue_type' | 'dining_category' | 'amenities';

const CATEGORIES_CONFIG: Record<FilterType, { id: CategoryId, name: string }[]> = {
    play: [
        { id: 'play_sort', name: 'Sort By' },
        { id: 'sports', name: 'Sports' },
        { id: 'dimension', name: 'Dimension' },
    ],
    events: [
        { id: 'event_sort', name: 'Sort By' },
        { id: 'event_category', name: 'Category' },
        { id: 'venue_type', name: 'Venue Type' },
    ],
    dining: [
        { id: 'dining_sort', name: 'Sort By' },
        { id: 'dining_category', name: 'Category' },
        { id: 'amenities', name: 'Amenities' },
    ]
};

const OPTIONS: Record<string, string[]> = {
    play_sort: [
        'Price : Low to High',
        'Price : High to Low',
        'Rating : High to Low',
        'Distance : Near to Far',
        'Dimension : A to Z'
    ],
    event_sort: [
        'Date : Soonest',
        'Price : Low to High',
        'Price : High to Low',
        'Rating : High to Low',
        'Name : A to Z'
    ],
    dining_sort: [
        'Rating : High to Low',
        'Price : Low to High',
        'Price : High to Low',
        'Distance : Near to Far'
    ],
    sort: [
        'Price : Low to High',
        'Price : High to Low',
        'Rating : High to Low',
        'Distance : Near to Far',
        'Dimension : A to Z'
    ],
    sports: Object.keys(CATEGORY_DATA),
    dimension: [
        '10 vs 10', '11 vs 11', '4 vs 4', '5 vs 5', '6 vs 6', '7 vs 7',
        '8 vs 8', '9 vs 9', 'Full court', 'Half court', 'Lane', 'Practice net', 'Standard'
    ],
    event_category: [
        'Music', 'Comedy', 'Workshop', 'Spirituality', 'Kids', 'Conference', 'Exhibition'
    ],
    venue_type: [
        'Indoor', 'Outdoor', 'Stadium', 'Club', 'Theater'
    ],
    dining_category: [
        'Premium Dining', 'Club & Chill', 'Pure Veg', 'Cafe Vibes', 'Family Favourites', 'Bar & Bites'
    ],
    amenities: [
        'WiFi', 'Parking', 'Air Conditioned', 'Live Music', 'Outdoor Seating', 'Pet Friendly'
    ]
};

export default function FilterModal({ isOpen, onClose, type = 'play', onApply, initialFilters }: FilterModalProps) {
    const categories = CATEGORIES_CONFIG[type];
    const [activeCategory, setActiveCategory] = useState<CategoryId>(categories[0].id);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

    // Reset state when type changes or on initial load
    useEffect(() => {
        if (initialFilters && Object.keys(initialFilters).length > 0) {
            setSelectedOptions(initialFilters);
        } else {
            const initialSelections: Record<string, string[]> = {};
            Object.keys(OPTIONS).forEach(key => {
                if (key.includes('sort')) {
                    initialSelections[key] = [OPTIONS[key][0]];
                } else {
                    initialSelections[key] = [];
                }
            });
            setSelectedOptions(initialSelections);
        }
        setActiveCategory(categories[0].id);
    }, [type, isOpen, initialFilters]);

    if (!isOpen) return null;

    const handleOptionSelect = (option: string) => {
        setSelectedOptions(prev => {
            const current = prev[activeCategory] || [];
            if (activeCategory.includes('sort')) {
                return { ...prev, [activeCategory]: [option] };
            }
            const updated = current.includes(option)
                ? current.filter(item => item !== option)
                : [...current, option];
            return {
                ...prev,
                [activeCategory]: updated
            };
        });
    };

    const handleClear = () => {
        const reset: Record<string, string[]> = {};
        Object.keys(OPTIONS).forEach(key => {
            reset[key] = key.includes('sort') ? [OPTIONS[key][0]] : [];
        });
        setSelectedOptions(reset);
        if (onApply) onApply(reset);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full md:w-[760px] h-[85vh] md:h-[500px] rounded-t-[30px] md:rounded-[24px] p-4 md:p-8 shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95 duration-300 relative flex flex-col">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-8 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
                    <X size={18} className="text-gray-400" />
                </button>

                {/* Title */}
                <h2 className="text-[18px] md:text-[22px] font-bold text-black mb-3 md:mb-5 px-1 md:px-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                    Filter by
                </h2>

                {/* Content Area */}
                <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
                    {/* Left Sidebar - Scrollable horizontally on mobile */}
                    <div className="w-full md:w-[140px] flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto scrollbar-hide mb-3 md:mb-0 pb-1.5 md:pb-0 shrink-0">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`whitespace-nowrap md:whitespace-normal text-left px-3 md:px-4 py-1 md:py-2 text-[13px] md:text-[15px] font-bold transition-all rounded-full md:rounded-l-[8px] md:rounded-r-none md:w-full ${activeCategory === cat.id
                                    ? 'bg-[#D9D9D9] text-black'
                                    : 'bg-transparent text-black border border-gray-200 md:border-none'
                                    }`}
                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Right Panel (The Main Gray Box) - Scrollable */}
                    <div className="flex-1 bg-[#D9D9D9] rounded-[16px] md:rounded-r-[16px] md:rounded-bl-[16px] md:rounded-tl-none p-4 md:p-6 overflow-y-auto scrollbar-hide">
                        <div className={`grid ${activeCategory.includes('sort') ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-x-8 gap-y-2.5 md:gap-y-4`}>
                            {(OPTIONS[activeCategory] || []).map((option) => {
                                const isCircle = activeCategory.includes('sort');
                                const isSelected = (selectedOptions[activeCategory] || []).includes(option);
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionSelect(option)}
                                        className="flex items-center gap-2.5 md:gap-3.5 w-full group text-left transition-transform active:scale-[0.98]"
                                    >
                                        <div className={`w-4 h-4 md:w-5 md:h-5 border-[1.5px] md:border-2 border-black flex items-center justify-center transition-all bg-transparent shrink-0 ${
                                            isCircle ? 'rounded-full' : 'rounded-[4px]'
                                        }`}>
                                            {isSelected && (
                                                <div className={`w-2 h-2 md:w-2.5 md:h-2.5 bg-black ${
                                                    isCircle ? 'rounded-full' : 'rounded-[2px]'
                                                }`} />
                                            )}
                                        </div>
                                        <span className="text-[12px] md:text-[14px] font-bold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                            {option}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer UI */}
                <div className="mt-4 md:mt-6 flex items-center justify-between px-1 md:px-2 shrink-0">
                    <button
                        onClick={handleClear}
                        className="text-[13px] md:text-[15px] font-bold text-black hover:opacity-70 transition-opacity"
                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                    >
                        Clear filters
                    </button>
                    <button
                        onClick={() => {
                            if (onApply) onApply(selectedOptions);
                            onClose();
                        }}
                        className="bg-black text-white px-5 md:px-8 py-2 md:py-2.5 rounded-full text-[13px] md:text-[15px] font-bold hover:bg-zinc-800 transition-colors"
                        style={{ fontFamily: 'var(--font-anek-latin)' }}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
}
