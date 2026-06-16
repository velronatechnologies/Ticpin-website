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

interface DayAvailability {
    day: string;
    date: string;
    openingTime: string;
    closingTime: string;
    price: string;
    openingPeriod: 'AM' | 'PM';
    closingPeriod: 'AM' | 'PM';
    minDuration: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_DAY_FORM = {
    openingHour: '09',
    openingMinute: '00',
    openingPeriod: 'AM' as const,
    closingHour: '10',
    closingMinute: '00',
    closingPeriod: 'PM' as const,
    minDuration: '1 Hour',
};

const FormatPage = () => {
    const router = useRouter();
    const [selectedFormat, setSelectedFormat] = useState('fixed');
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
    
    // Custom Availability State
    const [dayAvailabilities, setDayAvailabilities] = useState<DayAvailability[]>([]);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [selectedDate, setSelectedDate] = useState('');
    const [dayOpeningHour, setDayOpeningHour] = useState('09');
    const [dayOpeningMinute, setDayOpeningMinute] = useState('00');
    const [dayOpeningPeriod, setDayOpeningPeriod] = useState<'AM' | 'PM'>('AM');
    const [dayClosingHour, setDayClosingHour] = useState('10');
    const [dayClosingMinute, setDayClosingMinute] = useState('00');
    const [dayClosingPeriod, setDayClosingPeriod] = useState<'AM' | 'PM'>('PM');
    const [dayPrice, setDayPrice] = useState('');

    // Dropdown toggle states
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Form state for adding a new plan
    const [startHour, setStartHour] = useState('09');
    const [startMinute, setStartMinute] = useState('00');
    const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
    const [endHour, setEndHour] = useState('10');
    const [endMinute, setEndMinute] = useState('00');
    const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');
    
    const [minDuration, setMinDuration] = useState('1 Hour');
    const [pricePerSlot, setPricePerSlot] = useState('');
    const [weekendPrice, setWeekendPrice] = useState('');
    const [useDifferentWeekendPricing, setUseDifferentWeekendPricing] = useState(false);

    const [submitLoading, setSubmitLoading] = useState(false);
    const [venueName, setVenueName] = useState('');
    
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
            toast.warning('Please enter a price for the slot.');
            return;
        }

        const startTime = convert12To24(startHour, startPeriod);
        const endTime = convert12To24(endHour, endPeriod);

        // Fixed schedule allows only one global slot configuration.
        if (pricingPlans.length > 0) {
            toast.info('Fixed schedule supports one slot only. Existing slot has been updated.');
        }

        const newPlan: PricingPlan = {
            startTime,
            endTime,
            minDuration,
            price: pricePerSlot,
            weekendPrice: useDifferentWeekendPricing ? weekendPrice : pricePerSlot,
            useWeekendPricing: useDifferentWeekendPricing
        };

        setPricingPlans([newPlan]);
        // Reset form for next entry
        setPricePerSlot('');
        setWeekendPrice('');
    };

    // Calculate next 7 days starting from today
    useEffect(() => {
        const today = new Date();
        const next7Days: DayAvailability[] = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dayName = DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Convert Sunday=0 to Monday=0
            const dateStr = date.toISOString().split('T')[0];
            
            // Check if this day already exists in dayAvailabilities
            const existing = dayAvailabilities.find(d => d.day === dayName && d.date === dateStr);
            
            const newDay: DayAvailability = {
                day: dayName,
                date: dateStr,
                openingTime: existing?.openingTime || '',
                closingTime: existing?.closingTime || '',
                price: existing?.price || '',
                openingPeriod: existing?.openingPeriod || 'AM',
                closingPeriod: existing?.closingPeriod || 'PM',
                minDuration: existing?.minDuration || '1 Hour'
            };
            
            next7Days.push(newDay);
        }
        
        setDayAvailabilities(next7Days);
        if (next7Days.length > 0) {
            setSelectedDay(next7Days[0].day);
            setSelectedDate(next7Days[0].date);
        }
    }, []); // Only run once on mount

    const applyDaySelection = (day: string, date: string) => {
        setSelectedDay(day);
        setSelectedDate(date);
        const existing = dayAvailabilities.find(da => da.day === day && da.date === date);

        if (existing && existing.price) {
            const opening12 = convert24To12(existing.openingTime, '');
            const closing12 = convert24To12(existing.closingTime, '');
            setDayOpeningHour(opening12.hour);
            setDayOpeningMinute(opening12.minute);
            setDayOpeningPeriod(opening12.period as 'AM' | 'PM');
            setDayClosingHour(closing12.hour);
            setDayClosingMinute(closing12.minute);
            setDayClosingPeriod(closing12.period as 'AM' | 'PM');
            setDayPrice(existing.price);
            setMinDuration(existing.minDuration || DEFAULT_DAY_FORM.minDuration);
            return;
        }

        setDayOpeningHour(DEFAULT_DAY_FORM.openingHour);
        setDayOpeningMinute(DEFAULT_DAY_FORM.openingMinute);
        setDayOpeningPeriod(DEFAULT_DAY_FORM.openingPeriod);
        setDayClosingHour(DEFAULT_DAY_FORM.closingHour);
        setDayClosingMinute(DEFAULT_DAY_FORM.closingMinute);
        setDayClosingPeriod(DEFAULT_DAY_FORM.closingPeriod);
        setDayPrice('');
        setMinDuration(DEFAULT_DAY_FORM.minDuration);
    };

    // Helper function to convert 12-hour with AM/PM to 24-hour format
    const convert12To24 = (hour12: string, period: 'AM' | 'PM') => {
        let hour = parseInt(hour12);
        if (period === 'PM' && hour !== 12) {
            hour += 12;
        }
        if (period === 'AM' && hour === 12) {
            hour = 0;
        }
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    // Helper function to convert 24-hour time to 12-hour format
    const convert24To12 = (time24: string, period: string) => {
        const [hour, minute] = time24.split(':');
        let hour12 = parseInt(hour);
        let period12 = 'AM';
        
        if (hour12 >= 12) {
            hour12 = hour12 - 12;
            period12 = 'PM';
        }
        
        return {
            hour: hour12 === 0 ? '12' : hour12.toString().padStart(2, '0'),
            minute: minute,
            period: period12
        };
    };

    const addDayAvailability = () => {
        if (!dayPrice) {
            toast.warning('Please enter a price for this day.');
            return;
        }
        
        const openingTime = `${dayOpeningHour}:${dayOpeningMinute}`;
        const closingTime = `${dayClosingHour}:${dayClosingMinute}`;
        
        const updatedAvailabilities = dayAvailabilities.map(da => {
            if (da.day === selectedDay && da.date === selectedDate) {
                return {
                    ...da,
                    openingTime,
                    closingTime,
                    openingPeriod: dayOpeningPeriod,
                    closingPeriod: dayClosingPeriod,
                    price: dayPrice,
                    minDuration: minDuration
                };
            }
            return da;
        });
        
        setDayAvailabilities(updatedAvailabilities);
        toast.success(`Saved availability for ${selectedDay}`);
    };

    const removeDayAvailability = (day: string, date: string) => {
        const updatedAvailabilities = dayAvailabilities.map(da => {
            if (da.day === day && da.date === date) {
                return {
                    ...da,
                    openingTime: '',
                    closingTime: '',
                    price: '',
                    openingPeriod: 'AM' as 'AM' | 'PM',
                    closingPeriod: 'PM' as 'AM' | 'PM',
                    minDuration: DEFAULT_DAY_FORM.minDuration
                };
            }
            return da;
        });
        
        setDayAvailabilities(updatedAvailabilities as DayAvailability[]);
        if (day === selectedDay && date === selectedDate) {
            applyDaySelection(day, date);
        }
    };

    // Get used time slots to disable them in dropdowns
    const getUsedTimeSlots = () => {
        const usedSlots = new Set<string>();
        pricingPlans.forEach(plan => {
            usedSlots.add(plan.startTime);
            usedSlots.add(plan.endTime);
        });
        return usedSlots;
    };

    const isTimeSlotUsed = (time: string) => {
        return getUsedTimeSlots().has(time);
    };

    const removePricingPlan = (index: number) => {
        setPricingPlans(pricingPlans.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (selectedFormat === 'fixed' && pricingPlans.length === 0) {
            toast.warning('Please add at least one pricing plan for Fixed Schedule.');
            return;
        }
        if (selectedFormat === 'custom' && dayAvailabilities.filter(da => da.price).length < 7) {
            toast.warning('Please add custom availability for all 7 days.');
            return;
        }

        setSubmitLoading(true);
        try {
            // Construct the final data object using store values
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
                courts: store.courts.map(c => ({
                    name: c.name,
                    type: c.type,
                    price: parseFloat(c.price),
                    image_url: c.image_url
                })),
                event_instructions: store.playInstructions,
                youtube_video_url: store.youtubeVideoUrl,
                prohibited_items: store.prohibitedItems,
                faqs: store.faqs,
                payment: {
                    organizer_name: store.payment.organizerName,
                    gstin: store.payment.gstin,
                    account_number: store.payment.accountNumber,
                    ifsc: store.payment.ifsc,
                    account_type: store.payment.accountType,
                },
                points_of_contact: store.pocs,
                sales_notifications: store.salesNotifs,
                artist_name: '', 
                artist_image_url: '', 
                tickets_needed_for: 'person', 
                price_starts_from: store.courts.length > 0 ? Math.min(...store.courts.map(c => parseFloat(c.price) || 0)) : 0,
                pricing_format: selectedFormat,
                // Save both datasets; runtime applies only active pricing_format.
                pricing_plans: pricingPlans.map(p => ({
                    start_time: p.startTime,
                    end_time: p.endTime,
                    min_duration: p.minDuration,
                    price: parseFloat(p.price),
                    weekend_price: parseFloat(p.weekendPrice),
                    use_weekend_pricing: p.useWeekendPricing
                })),
                price_per_slot: pricingPlans.length > 0 ? Math.min(...pricingPlans.map(p => parseFloat(p.price))) : 0,
                custom_availabilities: dayAvailabilities.filter(da => da.price).map(da => ({
                    day: da.day,
                    date: da.date,
                    opening_time: da.openingTime,
                    closing_time: da.closingTime,
                    price: parseFloat(da.price),
                    min_duration: da.minDuration,
                    opening_period: da.openingPeriod,
                    closing_period: da.closingPeriod
                })),
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
                                    <p className="text-[22px] font-semibold text-black">Fixed schedule</p>
                                    <p className="text-[18px] text-[#686868]">For turfs with regular daily time slots</p>
                                </div>
                                <div className={`w-[28px] h-[28px] rounded-full border-2 flex items-center justify-center shrink-0 ml-4 transition-all ${selectedFormat === 'fixed' ? 'border-[#E7C200]' : 'border-[#AEAEAE]'}`}>
                                    {selectedFormat === 'fixed' && <div className="w-[16px] h-[16px] rounded-full bg-[#E7C200]" />}
                                </div>
                            </div>
                            <div
                                onClick={() => setSelectedFormat('custom')}
                                className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${selectedFormat === 'custom' ? 'bg-[#FFFCED]/40' : 'bg-white'}`}
                            >
                                <div>
                                    <p className="text-[22px] font-semibold text-black">Custom availability</p>
                                    <p className="text-[18px] text-[#686868]">For one-off or day-specific openings</p>
                                </div>
                                <div className={`w-[28px] h-[28px] rounded-full border-2 flex items-center justify-center shrink-0 ml-4 transition-all ${selectedFormat === 'custom' ? 'border-[#E7C200]' : 'border-[#AEAEAE]'}`}>
                                    {selectedFormat === 'custom' && <div className="w-[16px] h-[16px] rounded-full bg-[#E7C200]" />}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Fixed Schedule Section */}
                    {selectedFormat === 'fixed' && (
                        <section className="bg-white rounded-[15px] p-8 shadow-sm border border-zinc-100">
                            <h3 className="text-[30px] font-medium text-black mb-6">Add Slot / Pricing Plan</h3>
                            <div className="h-[1px] bg-[#AEAEAE] mb-8" />

                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[22px] font-medium text-[#686868]">Start time</label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-24">
                                                <div onClick={() => setOpenDropdown(openDropdown === 'startHour' ? null : 'startHour')} className="border border-[#686868] rounded-[10px] h-[54px] flex items-center justify-between px-4 cursor-pointer bg-transparent">
                                                    <span className="text-[20px] text-black font-medium">{startHour}</span>
                                                    <ChevronDown size={18} className={`text-black transition-transform ${openDropdown === 'startHour' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {openDropdown === 'startHour' && (
                                                    <div className="absolute top-full mt-1 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                                                            <div key={h} onClick={() => { setStartHour(h); setOpenDropdown(null); }} className="px-4 py-2 hover:bg-[#FFFCED] cursor-pointer text-[18px] text-black border-b border-zinc-50 last:border-0">{h}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="relative w-24">
                                                <div onClick={() => setOpenDropdown(openDropdown === 'startMinute' ? null : 'startMinute')} className="border border-[#686868] rounded-[10px] h-[54px] flex items-center justify-between px-4 cursor-pointer bg-transparent">
                                                    <span className="text-[20px] text-black font-medium">{startMinute}</span>
                                                    <ChevronDown size={18} className={`text-black transition-transform ${openDropdown === 'startMinute' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {openDropdown === 'startMinute' && (
                                                    <div className="absolute top-full mt-1 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                        {['00', '15', '30', '45'].map(m => (
                                                            <div key={m} onClick={() => { setStartMinute(m); setOpenDropdown(null); }} className="px-4 py-2 hover:bg-[#FFFCED] cursor-pointer text-[18px] text-black border-b border-zinc-50 last:border-0">{m}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex bg-[#F3F3F3] border border-[#686868] rounded-[10px] p-1 h-[54px]">
                                                {['AM', 'PM'].map(p => (
                                                    <button key={p} onClick={() => setStartPeriod(p as 'AM' | 'PM')} className={`px-4 rounded-[6px] text-[16px] font-bold transition-all ${startPeriod === p ? 'bg-white shadow-sm text-black' : 'text-[#686868]'}`}>{p}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[22px] font-medium text-[#686868]">End time</label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-24">
                                                <div onClick={() => setOpenDropdown(openDropdown === 'endHour' ? null : 'endHour')} className="border border-[#686868] rounded-[10px] h-[54px] flex items-center justify-between px-4 cursor-pointer bg-transparent">
                                                    <span className="text-[20px] text-black font-medium">{endHour}</span>
                                                    <ChevronDown size={18} className={`text-black transition-transform ${openDropdown === 'endHour' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {openDropdown === 'endHour' && (
                                                    <div className="absolute top-full mt-1 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                                                            <div key={h} onClick={() => { setEndHour(h); setOpenDropdown(null); }} className="px-4 py-2 hover:bg-[#FFFCED] cursor-pointer text-[18px] text-black border-b border-zinc-50 last:border-0">{h}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="relative w-24">
                                                <div onClick={() => setOpenDropdown(openDropdown === 'endMinute' ? null : 'endMinute')} className="border border-[#686868] rounded-[10px] h-[54px] flex items-center justify-between px-4 cursor-pointer bg-transparent">
                                                    <span className="text-[20px] text-black font-medium">{endMinute}</span>
                                                    <ChevronDown size={18} className={`text-black transition-transform ${openDropdown === 'endMinute' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {openDropdown === 'endMinute' && (
                                                    <div className="absolute top-full mt-1 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                        {['00', '15', '30', '45'].map(m => (
                                                            <div key={m} onClick={() => { setEndMinute(m); setOpenDropdown(null); }} className="px-4 py-2 hover:bg-[#FFFCED] cursor-pointer text-[18px] text-black border-b border-zinc-50 last:border-0">{m}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex bg-[#F3F3F3] border border-[#686868] rounded-[10px] p-1 h-[54px]">
                                                {['AM', 'PM'].map(p => (
                                                    <button key={p} onClick={() => setEndPeriod(p as 'AM' | 'PM')} className={`px-4 rounded-[6px] text-[16px] font-bold transition-all ${endPeriod === p ? 'bg-white shadow-sm text-black' : 'text-[#686868]'}`}>{p}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[25px] font-medium text-[#686868]">Minimum booking duration</label>
                                    <div className="relative w-full max-w-[360px]">
                                        <div onClick={() => setOpenDropdown(openDropdown === 'min' ? null : 'min')} className="border border-[#686868] rounded-[10px] h-[64px] flex items-center justify-between px-6 cursor-pointer bg-transparent">
                                            <span className="text-[25px] text-[#686868] select-none">{minDuration}</span>
                                            <ChevronDown size={20} className={`text-black transition-transform ${openDropdown === 'min' ? 'rotate-180' : ''}`} />
                                        </div>
                                        {openDropdown === 'min' && (
                                            <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 overflow-hidden">
                                                {['1 Hour', '2 Hours', '3 Hours'].map(dur => (
                                                    <div key={dur} onClick={() => { setMinDuration(dur); setOpenDropdown(null); }} className="px-6 py-3 hover:bg-[#FFFCED] cursor-pointer text-[20px] text-black border-b border-zinc-50 last:border-0">{dur}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[25px] font-medium text-[#686868]">Price per slot (₹)</label>
                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                            <input type="number" value={pricePerSlot} onChange={e => setPricePerSlot(e.target.value)} placeholder="Enter price" className="w-full bg-transparent outline-none text-[25px] text-[#686868] placeholder-[#AEAEAE]" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[20px] font-medium text-[#686868]">Payout (approx)</label>
                                        <div className="bg-[#FFFCED] border border-[#E7C200] rounded-[10px] h-[64px] flex items-center px-6">
                                            <span className="text-[25px] text-[#686868] truncate font-medium">₹ {pricePerSlot ? (parseFloat(pricePerSlot) * 0.9).toFixed(2) : '0.00'}<span className="text-[14px] ml-2 text-[#AEAEAE]">[AFTER TICPIN CHARGES]</span></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-[22px] font-medium text-black">Different pricing for weekends</span>
                                    <button type="button" onClick={() => setUseDifferentWeekendPricing(!useDifferentWeekendPricing)} className={`w-[40px] h-[20px] rounded-[26px] border border-[#686868] relative transition-colors ${useDifferentWeekendPricing ? 'bg-[#E7C200]' : 'bg-[#D9D9D9]'}`}>
                                        <div className={`absolute top-[-1px] w-[20px] h-[20px] rounded-full bg-white border border-[#686868] transition-all ${useDifferentWeekendPricing ? 'right-[-1px]' : 'left-[-1px]'}`} />
                                    </button>
                                </div>

                                {useDifferentWeekendPricing && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-4">
                                            <label className="text-[20px] font-medium text-[#686868]">Weekend price (₹)</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                                <input type="number" value={weekendPrice} onChange={e => setWeekendPrice(e.target.value)} placeholder="Enter weekend price" className="w-full bg-transparent outline-none text-[25px] text-[#686868] placeholder-[#AEAEAE]" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[20px] font-medium text-[#686868]">Payout (approx)</label>
                                            <div className="bg-[#FFFCED] border border-[#E7C200] rounded-[10px] h-[64px] flex items-center px-6">
                                                <span className="text-[25px] text-[#686868] truncate font-medium">₹ {weekendPrice ? (parseFloat(weekendPrice) * 0.9).toFixed(2) : '0.00'}<span className="text-[14px] ml-2 text-[#AEAEAE]">[AFTER TICPIN CHARGES]</span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center pt-8">
                                    <button onClick={addPricingPlan} className="bg-black text-white rounded-[10px] px-12 h-[54px] flex items-center gap-3 active:scale-95 transition-all shadow-md group">
                                        <span className="text-[22px] font-medium uppercase tracking-wide">{pricingPlans.length > 0 ? 'UPDATE' : 'ADD'}</span>
                                        <PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>

                                {/* List of Added Plans */}
                                {pricingPlans.length > 0 && (
                                    <div className="mt-12 space-y-4">
                                        <h4 className="text-[25px] font-medium text-black">Fixed Slot Configuration</h4>
                                        <div className="space-y-3">
                                            {pricingPlans.map((plan, idx) => {
                                                const start12 = convert24To12(plan.startTime, '');
                                                const end12 = convert24To12(plan.endTime, '');
                                                return (
                                                    <div key={idx} className="bg-[#F8F8F8] border border-[#AEAEAE] rounded-[10px] p-6 flex items-center justify-between">
                                                        <div className="flex gap-10">
                                                            <div>
                                                                <p className="text-[14px] text-[#686868] uppercase font-bold">Duration</p>
                                                                <p className="text-[22px] font-medium text-black">{start12.hour}:{start12.minute} {start12.period} - {end12.hour}:{end12.minute} {end12.period}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[14px] text-[#686868] uppercase font-bold">Min Booking</p>
                                                                <p className="text-[22px] font-medium text-black">{plan.minDuration}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[14px] text-[#686868] uppercase font-bold">Weekday Price</p>
                                                                <p className="text-[22px] font-medium text-[#E7C200]">₹{plan.price}</p>
                                                            </div>
                                                            {plan.useWeekendPricing && (
                                                                <div>
                                                                    <p className="text-[14px] text-[#686868] uppercase font-bold">Weekend Price</p>
                                                                    <p className="text-[22px] font-medium text-[#E7C200]">₹{plan.weekendPrice}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button onClick={() => removePricingPlan(idx)} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors">
                                                            <Trash2 size={24} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Custom Availability Section */}
                    {selectedFormat === 'custom' && (
                        <section className="bg-white rounded-[15px] p-8 shadow-sm border border-zinc-100 space-y-10">
                            {/* Set your time slots */}
                            <div className="space-y-6">
                                <h4 className="text-[30px] font-medium text-black">Set your time slots</h4>
                                <div className="h-[1px] bg-[#AEAEAE] w-full" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Select Day Dropdown */}
                                    <div className="space-y-2">
                                        <label className="text-[18px] font-medium text-[#686868]">Select day</label>
                                        <div className="relative w-full">
                                            <div onClick={() => setOpenDropdown(openDropdown === 'daySelect' ? null : 'daySelect')} className="border border-[#686868] rounded-[10px] h-[54px] flex items-center justify-between px-4 cursor-pointer bg-transparent">
                                                <span className="text-[18px] text-black font-medium">{selectedDay}</span>
                                                <ChevronDown size={20} className={`text-[#686868] transition-transform ${openDropdown === 'daySelect' ? 'rotate-180' : ''}`} />
                                            </div>
                                            {openDropdown === 'daySelect' && (
                                                <div className="absolute top-full mt-1 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[300px] overflow-y-auto">
                                                    {dayAvailabilities.map((dayAvail) => (
                                                        <div key={dayAvail.date} onClick={() => { 
                                                            applyDaySelection(dayAvail.day, dayAvail.date);
                                                            setOpenDropdown(null); 
                                                        }} className="px-4 py-3 hover:bg-[#FFFCED] cursor-pointer text-[18px] text-black border-b border-zinc-50 last:border-0">{dayAvail.day} - {dayAvail.date}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Opening Time */}
                                    <div className="space-y-2">
                                        <label className="text-[18px] font-medium text-[#686868]">Opening time</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <div onClick={() => setOpenDropdown(openDropdown === 'openHour' ? null : 'openHour')} className="border border-[#686868] rounded-[10px] h-[54px] flex items-center justify-between px-3 cursor-pointer">
                                                    <span className="text-[18px] font-medium">{dayOpeningHour}:{dayOpeningMinute}</span>
                                                    <ChevronDown size={16} />
                                                </div>
                                                {openDropdown === 'openHour' && (
                                                    <div className="absolute top-full mt-1 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                                                            <div key={h} onClick={() => { setDayOpeningHour(h); setOpenDropdown(null); }} className="px-3 py-2 hover:bg-[#FFFCED] cursor-pointer">{h}:00</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex bg-[#F3F3F3] border border-[#686868] rounded-[10px] p-1 h-[54px]">
                                                {['AM', 'PM'].map(p => (
                                                    <button key={p} onClick={() => setDayOpeningPeriod(p as 'AM' | 'PM')} className={`px-3 rounded-[6px] text-[14px] font-bold ${dayOpeningPeriod === p ? 'bg-white shadow-sm text-black' : 'text-[#686868]'}`}>{p}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Closing Time */}
                                    <div className="space-y-2">
                                        <label className="text-[18px] font-medium text-[#686868]">Closing time</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <div onClick={() => setOpenDropdown(openDropdown === 'closeHour' ? null : 'closeHour')} className="border border-[#686868] rounded-[10px] h-[54px] flex items-center justify-between px-3 cursor-pointer">
                                                    <span className="text-[18px] font-medium">{dayClosingHour}:{dayClosingMinute}</span>
                                                    <ChevronDown size={16} />
                                                </div>
                                                {openDropdown === 'closeHour' && (
                                                    <div className="absolute top-full mt-1 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                                                            <div key={h} onClick={() => { setDayClosingHour(h); setOpenDropdown(null); }} className="px-3 py-2 hover:bg-[#FFFCED] cursor-pointer">{h}:00</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex bg-[#F3F3F3] border border-[#686868] rounded-[10px] p-1 h-[54px]">
                                                {['AM', 'PM'].map(p => (
                                                    <button key={p} onClick={() => setDayClosingPeriod(p as 'AM' | 'PM')} className={`px-3 rounded-[6px] text-[14px] font-bold ${dayClosingPeriod === p ? 'bg-white shadow-sm text-black' : 'text-[#686868]'}`}>{p}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Add Slot / Pricing Plan */}
                            <div className="space-y-6">
                                <h4 className="text-[30px] font-medium text-black">Add Slot / Pricing Plan</h4>
                                <div className="h-[1px] bg-[#AEAEAE] w-full" />
                                <div className="space-y-6">
                                    <div className="relative w-full max-w-[360px]">
                                        <label className="text-[18px] font-medium text-[#686868] mb-2 block">Minimum booking duration</label>
                                        <div onClick={() => setOpenDropdown(openDropdown === 'minCustom' ? null : 'minCustom')} className="border border-[#686868] rounded-[10px] h-[54px] flex items-center justify-between px-4 cursor-pointer bg-transparent">
                                            <span className="text-[18px] text-[#686868]">{minDuration}</span>
                                            <ChevronDown size={20} className={`text-[#686868] transition-transform ${openDropdown === 'minCustom' ? 'rotate-180' : ''}`} />
                                        </div>
                                        {openDropdown === 'minCustom' && (
                                            <div className="absolute top-full mt-1 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 overflow-hidden">
                                                {['1 Hour', '2 Hours', '3 Hours'].map(dur => (
                                                    <div key={dur} onClick={() => { setMinDuration(dur); setOpenDropdown(null); }} className="px-4 py-3 hover:bg-[#FFFCED] cursor-pointer text-[18px] text-black border-b border-zinc-50 last:border-0">{dur}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[18px] font-medium text-[#686868]">Price per slot (₹)</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[54px] flex items-center px-4">
                                                <input type="number" value={dayPrice} onChange={e => setDayPrice(e.target.value)} placeholder="Enter price" className="w-full bg-transparent outline-none text-[18px] text-black" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[18px] font-medium text-[#686868]">Payout (approx)</label>
                                            <div className="bg-[#FFFCED]/50 border border-[#E7C200] rounded-[10px] h-[54px] flex items-center px-4">
                                                <span className="text-[18px] text-[#686868] truncate font-medium">₹ {dayPrice ? (parseFloat(dayPrice) * 0.9).toFixed(2) : '0.00'}<span className="text-[12px] ml-2 text-[#AEAEAE] font-normal">[AFTER TICPIN CHARGES]</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-4">
                                        <button onClick={addDayAvailability} className="bg-black text-white rounded-[10px] px-12 h-[54px] flex items-center gap-3 active:scale-95 transition-all shadow-md group">
                                            <span className="text-[22px] font-medium uppercase tracking-wide">ADD</span>
                                            <PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Added List for Custom */}
                            {dayAvailabilities.filter(da => da.price).length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[25px] font-medium text-black">Added Custom Availability</h4>
                                    <div className="space-y-3">
                                        {dayAvailabilities.filter(da => da.price).map((da, idx) => (
                                            <div key={idx} className="bg-[#F8F8F8] border border-[#AEAEAE] rounded-[10px] p-6 flex items-center justify-between">
                                                <div className="flex gap-10">
                                                    <div>
                                                        <p className="text-[14px] text-[#686868] uppercase font-bold">Date</p>
                                                        <p className="text-[22px] font-medium text-black">{da.day}, {da.date}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] text-[#686868] uppercase font-bold">Time</p>
                                                        <p className="text-[22px] font-medium text-black">{da.openingTime} {da.openingPeriod} - {da.closingTime} {da.closingPeriod}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] text-[#686868] uppercase font-bold">Price</p>
                                                        <p className="text-[22px] font-medium text-[#E7C200]">₹{da.price}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeDayAvailability(da.day, da.date)} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors">
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Submit for review button */}
                    <div className="pt-10">
                        <button
                            onClick={handleSubmit}
                            disabled={submitLoading}
                            className="w-full bg-black text-white h-[64px] rounded-[10px] text-[25px] font-medium flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {submitLoading ? 'Submitting...' : 'Submit for review'}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FormatPage;
