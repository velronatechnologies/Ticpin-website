'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, PlusCircle, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/Toast';
import { playApi } from '@/lib/api/play';
import { usePlayCreateStore } from '@/store/playCreateStore';

interface PricingPlan {
    startTime: string;
    endTime: string;
    minDuration: string;
    price: string;
    weekendPrice: string;
    useWeekendPricing: boolean;
}

const FormatPage = () => {
    const router = useRouter();
    const [selectedFormat, setSelectedFormat] = useState('fixed');
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [venueName, setVenueName] = useState('');
    
    // Form state for adding a new plan
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
    const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('PM');
    const [minDuration, setMinDuration] = useState('1 Hour');
    const [pricePerSlot, setPricePerSlot] = useState('');
    const [weekendPrice, setWeekendPrice] = useState('');
    const [useDifferentWeekendPricing, setUseDifferentWeekendPricing] = useState(false);
    
    // Dropdown toggle states
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Access all data from store
    const store = usePlayCreateStore();

    useEffect(() => {
        if (store.venueName) {
            setVenueName(store.venueName);
        } else {
            // Fallback to localStorage just in case, but prioritize store
            const data = localStorage.getItem('play_create_draft');
            if (data) {
                const parsed = JSON.parse(data);
                setVenueName(parsed.name);
            } else {
                router.push('/play/create');
            }
        }
    }, [router, store.venueName]);

    const addPricingPlan = () => {
        if (!pricePerSlot) {
            toast.warning('Please enter price per slot.');
            return;
        }
        
        const newPlan: PricingPlan = {
            startTime: `${startTime.split(':')[0]}:${startTime.split(':')[1]}`,
            endTime: `${endTime.split(':')[0]}:${endTime.split(':')[1]}`,
            minDuration,
            price: pricePerSlot,
            weekendPrice: useDifferentWeekendPricing ? weekendPrice : pricePerSlot,
            useWeekendPricing: useDifferentWeekendPricing
        };
        
        setPricingPlans([...pricingPlans, newPlan]);
        // Reset form for next entry
        setPricePerSlot('');
        setWeekendPrice('');
        setUseDifferentWeekendPricing(false);
    };

    const removePricingPlan = (index: number) => {
        setPricingPlans(pricingPlans.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (selectedFormat === 'fixed' && pricingPlans.length === 0) {
            toast.warning('Please add at least one pricing plan for Fixed Schedule.');
            return;
        }

        setSubmitLoading(true);
        try {
            // Construct final data object using store values
            const finalData = {
                name: store.venueName.trim(),
                description: store.description,
                category: store.selections.category,
                sub_category: store.selections.subCategory === 'Select Court Type' ? '' : store.selections.subCategory,
                city: store.selections.city,
                venue_name: store.venueName.trim(),
                venue_address: store.venueAddress,
                google_map_link: store.googleMapLink,
                instagram_link: store.instagramLink,
                portrait_image_url: store.portraitUrl,
                landscape_image_url: store.landscapeUrl,
                secondary_banner_url: store.secondaryBannerUrl,
                card_video_url: store.videoUrl,
                gallery_urls: store.galleryUrls,
                guide: {
                    facilities: store.facilities,
                    is_pet_friendly: store.petFriendly === 'Yes',
                    outside_food_allowed: store.outsideFood === 'Yes',
                    venue_location_type: store.venueLocationType,
                    surface_type: store.surfaceType,
                    cancellations_allowed: store.cancellations === 'Yes',
                    changing_rooms_available: store.changingRooms === 'Yes',
                    equipment_rentals_available: store.equipmentRentals === 'Yes',
                    max_duration: store.maxDuration,
                },
                pricing_format: selectedFormat,
                price_per_slot: selectedFormat === 'fixed' ? Math.min(...pricingPlans.map(p => parseFloat(p.price))) : 0,
                // Fixed Schedule data
                pricing_plans: selectedFormat === 'fixed' ? pricingPlans.map(p => ({
                    start_time: `${p.startTime.split(':')[0]}:${p.startTime.split(':')[1]}`,
                    end_time: `${p.endTime.split(':')[0]}:${p.endTime.split(':')[1]}`,
                    min_duration: p.minDuration,
                    price: parseFloat(p.price),
                    weekend_price: parseFloat(p.weekendPrice),
                    use_weekend_pricing: p.useWeekendPricing
                })) : [],
                status: 'pending',
            };

            await playApi.create(finalData);
            
            // Cleanup
            localStorage.removeItem('play_create_draft');
            store.clearDraft();
            
            toast.success('Venue submitted for review!');
            setTimeout(() => router.push('/organizer/dashboard?category=play'), 2000);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Submission failed.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white flex flex-col font-[var(--font-anek-latin)] overflow-x-hidden">
            <div className="w-full">
                <main className="max-w-[1440px] mx-auto px-[33px] py-[40px] space-y-10">
                    {/* Header Section */}
                    <div className="space-y-3">
                        <h1 className="text-[40px] font-medium text-black">List an venue</h1>
                        <p className="text-[25px] font-medium text-[#686868]">
                            Only a few steps left to get your venue live on Ticpin!
                        </p>
                        <div className="h-[1.5px] bg-[#AEAEAE] w-full" />
                    </div>

                    <div className="space-y-1">
                        <p className="text-[20px] font-medium text-black">Manage your venue</p>
                        <h2 className="text-[30px] font-medium text-[#AEAEAE] uppercase">
                            {venueName || '{VENUE NAME GIVEN}'}
                        </h2>
                    </div>

                    {/* Format Selection Card */}
                    <section className="bg-white rounded-[15px] p-8 shadow-sm border border-zinc-100">
                        <h3 className="text-[30px] font-medium text-black mb-6">
                            Choose the format <span className="text-[#E7C200]">*</span>
                        </h3>
                        <div className="h-[1px] bg-[#AEAEAE] mb-8" />

                        <div className="border border-[#AEAEAE] rounded-[10px] overflow-hidden">
                            <div
                                onClick={() => setSelectedFormat('fixed')}
                                className={`p-6 flex items-center justify-between cursor-pointer border-b border-[#AEAEAE] transition-colors ${selectedFormat === 'fixed' ? 'bg-[#FFFCED]/40' : 'bg-white'}`}
                            >
                                <div>
                                    <p className="text-[25px] font-medium text-black">Fixed schedule</p>
                                    <p className="text-[20px] font-medium text-[#686868]">For turfs with regular daily time slots</p>
                                </div>
                                <div className={`w-[31px] h-[31px] rounded-full border-2 flex items-center justify-center shrink-0 ml-4 ${selectedFormat === 'fixed' ? 'border-[#FFEF96]' : 'border-[#686868]'}`}>
                                    {selectedFormat === 'fixed' && <div className="w-[23px] h-[23px] rounded-full border-[6px] border-[#E7C200]" />}
                                </div>
                            </div>
                            <div
                                onClick={() => setSelectedFormat('custom')}
                                className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${selectedFormat === 'custom' ? 'bg-[#FFFCED]/40' : 'bg-white'}`}
                            >
                                <div>
                                    <p className="text-[25px] font-medium text-black">Custom availability</p>
                                    <p className="text-[20px] font-medium text-[#686868]">For one-off or date-specific openings</p>
                                </div>
                                <div className={`w-[31px] h-[31px] rounded-full border-2 flex items-center justify-center shrink-0 ml-4 ${selectedFormat === 'custom' ? 'border-[#FFEF96]' : 'border-[#686868]'}`}>
                                    {selectedFormat === 'custom' && <div className="w-[23px] h-[23px] rounded-full border-[6px] border-[#E7C200]" />}
                                </div>
                            </div>
                        </div>
                    </section>
                    )}

                    {/* Multiple Pricing Plans Card - Fixed Schedule */}
                    {selectedFormat === 'fixed' && (
                        <section className="bg-white rounded-[15px] p-8 shadow-sm border border-zinc-100">
                            <h3 className="text-[30px] font-medium text-black mb-6">Add Slot / Pricing Plan</h3>
                            <div className="h-[1px] bg-[#AEAEAE] mb-8" />

                            <div className="space-y-10">
                            {/* Input Form for a New Slot */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[25px] font-medium text-[#686868]">Start Hour</label>
                                    <div className="relative w-full">
                                        <div 
                                            onClick={() => setOpenDropdown(openDropdown === 'startHour' ? null : 'startHour')}
                                            className="border border-[#686868] rounded-[10px] h-[50px] flex items-center justify-between px-4 cursor-pointer bg-transparent"
                                        >
                                            <span className="text-[18px] text-black select-none">{startTime.split(':')[0]}</span>
                                            <ChevronDown size={18} />
                                        </div>
                                        {openDropdown === 'startHour' && (
                                            <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(hour => (
                                                    <div 
                                                        key={hour} 
                                                        onClick={() => { setStartTime(`${hour}:${startTime.split(':')[1]}`); setOpenDropdown(null); }}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[18px] text-black"
                                                    >
                                                        {hour}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[25px] font-medium text-[#686868]">Start Minute</label>
                                    <div className="relative w-full">
                                        <div 
                                            onClick={() => setOpenDropdown(openDropdown === 'startMinute' ? null : 'startMinute')}
                                            className="border border-[#686868] rounded-[10px] h-[50px] flex items-center justify-between px-4 cursor-pointer bg-transparent"
                                        >
                                            <span className="text-[18px] text-black select-none">{startTime.split(':')[1]}</span>
                                            <ChevronDown size={18} />
                                        </div>
                                        {openDropdown === 'startMinute' && (
                                            <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(minute => (
                                                    <div 
                                                        key={minute} 
                                                        onClick={() => { setStartTime(`${startTime.split(':')[0]}:${minute}`); setOpenDropdown(null); }}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[18px] text-black"
                                                    >
                                                        {minute}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[25px] font-medium text-[#686868]">Start Period</label>
                                    <div className="flex border border-[#686868] rounded-[10px] h-[50px] overflow-hidden">
                                        {['AM', 'PM'].map(period => (
                                            <button
                                                key={period}
                                                type="button"
                                                onClick={() => { setStartTime(`${startTime.split(':')[0]}:${startTime.split(':')[1]}`); setStartPeriod(period as 'AM' | 'PM'); setOpenDropdown(null); }}
                                                className={`flex-1 text-[18px] font-semibold transition-colors ${startPeriod === period ? 'bg-[#FFFCED] text-black' : 'bg-transparent text-[#686868] hover:bg-zinc-100'}`}
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[25px] font-medium text-[#686868]">End Hour</label>
                                    <div className="relative w-full">
                                        <div 
                                            onClick={() => setOpenDropdown(openDropdown === 'endHour' ? null : 'endHour')}
                                            className="border border-[#686868] rounded-[10px] h-[50px] flex items-center justify-between px-4 cursor-pointer bg-transparent"
                                        >
                                            <span className="text-[18px] text-black select-none">{endTime.split(':')[0]}</span>
                                            <ChevronDown size={18} />
                                        </div>
                                        {openDropdown === 'endHour' && (
                                            <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(hour => (
                                                    <div 
                                                        key={hour} 
                                                        onClick={() => { setEndTime(`${hour}:${endTime.split(':')[1]}`); setOpenDropdown(null); }}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[18px] text-black"
                                                    >
                                                        {hour}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[25px] font-medium text-[#686868]">End Minute</label>
                                    <div className="relative w-full">
                                        <div 
                                            onClick={() => setOpenDropdown(openDropdown === 'endMinute' ? null : 'endMinute')}
                                            className="border border-[#686868] rounded-[10px] h-[50px] flex items-center justify-between px-4 cursor-pointer bg-transparent"
                                        >
                                            <span className="text-[18px] text-black select-none">{endTime.split(':')[1]}</span>
                                            <ChevronDown size={18} />
                                        </div>
                                        {openDropdown === 'endMinute' && (
                                            <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(minute => (
                                                    <div 
                                                        key={minute} 
                                                        onClick={() => { setEndTime(`${endTime.split(':')[0]}:${minute}`); setOpenDropdown(null); }}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[18px] text-black"
                                                    >
                                                        {minute}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[25px] font-medium text-[#686868]">End Period</label>
                                    <div className="flex border border-[#686868] rounded-[10px] h-[50px] overflow-hidden">
                                        {['AM', 'PM'].map(period => (
                                            <button
                                                key={period}
                                                type="button"
                                                onClick={() => { setEndTime(`${endTime.split(':')[0]}:${endTime.split(':')[1]}`); setEndPeriod(period as 'AM' | 'PM'); setOpenDropdown(null); }}
                                                className={`flex-1 text-[18px] font-semibold transition-colors ${endPeriod === period ? 'bg-[#FFFCED] text-black' : 'bg-transparent text-[#686868] hover:bg-zinc-100'}`}
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[25px] font-medium text-[#686868]">Minimum booking duration</label>
                                <div className="relative w-full max-w-[360px]">
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'min' ? null : 'min')}
                                        className="border border-[#686868] rounded-[10px] h-[50px] flex items-center justify-between px-4 cursor-pointer bg-transparent"
                                    >
                                        <span className="text-[25px] text-[#686868] select-none">{minDuration}</span>
                                        <ChevronDown size={20} className={`text-black transition-transform ${openDropdown === 'min' ? 'rotate-180' : ''}`} />
                                    </div>
                                    {openDropdown === 'min' && (
                                        <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                            {['30 Minutes', '1 Hour', '2 Hours', '3 Hours', '4 Hours'].map(duration => (
                                                <div 
                                                    key={duration} 
                                                    onClick={() => { setMinDuration(duration); setOpenDropdown(null); }}
                                                    className="px-6 py-3 hover:bg-gray-100 cursor-pointer text-[20px] text-black"
                                                >
                                                    {duration}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[25px] font-medium text-[#686868]">Price per slot (₹)</label>
                                <input
                                    type="number"
                                    value={pricePerSlot}
                                    onChange={(e) => setPricePerSlot(e.target.value)}
                                    placeholder="Enter price"
                                    className="w-full border border-[#686868] rounded-[10px] h-[50px] px-4 bg-transparent text-[18px] text-black"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="useDifferentWeekendPricing"
                                    checked={useDifferentWeekendPricing}
                                    onChange={(e) => setUseDifferentWeekendPricing(e.target.checked)}
                                    className="w-4 h-4 text-black"
                                />
                                <label htmlFor="useDifferentWeekendPricing" className="text-[20px] font-medium text-[#686868]">
                                    Use different weekend pricing
                                </label>
                            </div>

                            {useDifferentWeekendPricing && (
                                <div className="space-y-4">
                                    <label className="text-[25px] font-medium text-[#686868]">Weekend price (₹)</label>
                                    <input
                                        type="number"
                                        value={weekendPrice}
                                        onChange={(e) => setWeekendPrice(e.target.value)}
                                        placeholder="Enter weekend price"
                                        className="w-full border border-[#686868] rounded-[10px] h-[50px] px-4 bg-transparent text-[18px] text-black"
                                    />
                                </div>
                            )}

                            {/* Added Plans Display */}
                            {pricingPlans.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[25px] font-medium text-black mb-4">Added Pricing Plans</h4>
                                    <div className="space-y-4">
                                        {pricingPlans.map((plan, idx) => (
                                            <div key={idx} className="border border-[#AEAEAE] rounded-[10px] p-4 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[25px] font-medium text-black">{plan.startTime} {startPeriod} - {plan.endTime} {endPeriod}</p>
                                                        <p className="text-[22px] font-medium text-[#E7C200]">₹{plan.price}</p>
                                                        {useDifferentWeekendPricing && plan.weekendPrice && (
                                                            <p className="text-[22px] font-medium text-[#E7C200]">₹{plan.weekendPrice} (Weekend)</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => removePricingPlan(idx)}
                                                        className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                                                    >
                                                        <Trash2 size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                            )}

                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={addPricingPlan}
                                    className="bg-black text-white rounded-[15px] px-8 h-[56px] flex items-center gap-2 active:scale-95 transition-all shadow-md"
                                >
                                    <span className="text-[24px] font-medium">ADD</span>
                                    <PlusCircle size={24} />
                                </button>
                            </div>
                        </div>
                    </section>
                    )}

                    {/* Footer Submit Button */}
                    <div className="pt-6 pb-12">
                        <button
                            onClick={handleSubmit}
                            disabled={submitLoading}
                            className="w-full bg-black text-white rounded-[15px] h-[80px] flex items-center justify-center text-[25px] font-semibold uppercase tracking-tight shadow-xl hover:bg-zinc-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitLoading ? 'Saving...' : 'Save and proceed'}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FormatPage;
