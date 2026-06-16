'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, PlusCircle, Trash2, X, ArrowLeft, Edit2 } from 'lucide-react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { toast } from '@/components/ui/Toast';
import { playApi } from '@/lib/api/play';

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

const EditFormatPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [selectedFormat, setSelectedFormat] = useState('fixed');
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
    const [existingPricingPlans, setExistingPricingPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isViewMode, setIsViewMode] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalData, setOriginalData] = useState<any>(null);
    
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

    // Form state for adding a new plan (12-hour format with AM/PM)
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

    // Helper to convert 12-hour to 24-hour format
    const convert12To24 = (hour: string, period: string) => {
        let h = parseInt(hour);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return `${String(h).padStart(2, '0')}:00`;
    };

    useEffect(() => {
        const loadExistingData = async () => {
            try {
                const data = await playApi.getByID(id) as any;
                if (data.pricing_format) {
                    setSelectedFormat(data.pricing_format);
                }
                
                // Store original data for change detection
                setOriginalData({
                    pricing_format: data.pricing_format,
                    pricing_plans: data.pricing_plans || [],
                    custom_availabilities: data.custom_availabilities || []
                });
                if (data.pricing_plans && data.pricing_plans.length > 0) {
                    const formattedPlans = data.pricing_plans.map((plan: any) => ({
                        startTime: plan.start_time,
                        endTime: plan.end_time,
                        minDuration: plan.min_duration,
                        price: plan.price.toString(),
                        weekendPrice: plan.weekend_price.toString(),
                        useWeekendPricing: plan.use_weekend_pricing
                    }));
                    const singlePlan = formattedPlans.slice(0, 1);
                    setPricingPlans(singlePlan);
                    setExistingPricingPlans(singlePlan);

                    // Pre-fill input fields for the first slot
                    const plan = singlePlan[0];
                    const start12 = convert24To12(plan.startTime, '');
                    const end12 = convert24To12(plan.endTime, '');
                    
                    setStartHour(start12.hour);
                    setStartMinute(start12.minute);
                    setStartPeriod(start12.period as 'AM' | 'PM');
                    setEndHour(end12.hour);
                    setEndMinute(end12.minute);
                    setEndPeriod(end12.period as 'AM' | 'PM');
                    setMinDuration(plan.minDuration);
                    setPricePerSlot(plan.price);
                    setWeekendPrice(plan.weekendPrice);
                    setUseDifferentWeekendPricing(plan.useWeekendPricing);
                }
                // Always initialize 7-day calendar first
                const today = new Date();
                const next7Days: DayAvailability[] = [];
                
                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    const dayName = DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1];
                    const dateStr = date.toISOString().split('T')[0];
                    
                    // Check if there's existing data for this day
                    const existingData = data.custom_availabilities?.find((da: any) => da.day === dayName);
                    
                    const newDay: DayAvailability = {
                        day: dayName,
                        date: dateStr,
                        openingTime: existingData ? existingData.opening_time : '',
                        closingTime: existingData ? existingData.closing_time : '',
                        price: existingData ? existingData.price.toString() : '',
                        openingPeriod: existingData ? (existingData.opening_period || 'AM') : 'AM',
                        closingPeriod: existingData ? (existingData.closing_period || 'PM') : 'PM',
                        minDuration: existingData ? (existingData.min_duration || '1 Hour') : '1 Hour'
                    };
                    
                    next7Days.push(newDay);
                }
                
                setDayAvailabilities(next7Days);
                if (next7Days.length > 0) {
                    setSelectedDay(next7Days[0].day);
                    setSelectedDate(next7Days[0].date);
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : '';
                // Check if play not found (404) - redirect to 404 page
                if (errorMsg.toLowerCase().includes('not found') || errorMsg.includes('404')) {
                    notFound();
                    return;
                }
                toast.error('Failed to load existing data');
                router.push(`/play/edit/${id}`);
            } finally {
                setLoading(false);
            }
        };
        loadExistingData();
    }, [id, router]);

    // Check if any changes have been made
    const checkChanges = useCallback(() => {
        if (!originalData) return;

        const currentData = {
            pricing_format: selectedFormat,
            pricing_plans: pricingPlans.map(p => ({
                start_time: p.startTime,
                end_time: p.endTime,
                min_duration: p.minDuration,
                price: parseFloat(p.price),
                weekend_price: parseFloat(p.weekendPrice),
                use_weekend_pricing: p.useWeekendPricing
            })),
            custom_availabilities: dayAvailabilities.filter(da => da.price).map(da => ({
                day: da.day,
                date: da.date,
                opening_time: da.openingTime,
                closing_time: da.closingTime,
                price: parseFloat(da.price),
                min_duration: da.minDuration,
                opening_period: da.openingPeriod,
                closing_period: da.closingPeriod
            }))
        };

        const hasFieldChanges = JSON.stringify(originalData) !== JSON.stringify(currentData);
        setHasChanges(hasFieldChanges);
    }, [originalData, selectedFormat, pricingPlans, dayAvailabilities]);

    // Update hasChanges whenever any field changes
    useEffect(() => {
        checkChanges();
    }, [checkChanges]);

    const addPricingPlan = () => {
        if (!pricePerSlot) {
            toast.warning('Please enter a price for the slot.');
            return;
        }

        // Convert 12-hour to 24-hour format
        const startTime24 = convert12To24(startHour, startPeriod);
        const endTime24 = convert12To24(endHour, endPeriod);

        if (pricingPlans.length > 0) {
            toast.info('Fixed schedule supports one slot only. Existing slot has been updated.');
        }

        const newPlan: PricingPlan = {
            startTime: startTime24,
            endTime: endTime24,
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

    const applyDaySelection = (day: string, date: string) => {
        setSelectedDay(day);
        setSelectedDate(date);
        const existing = dayAvailabilities.find(da => da.day === day && da.date === date);

        if (existing && existing.price) {
            const opening12 = convert24To12(existing.openingTime, existing.openingPeriod || 'AM');
            const closing12 = convert24To12(existing.closingTime, existing.closingPeriod || 'PM');
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
            await playApi.update(id, {
                pricing_format: selectedFormat,
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
                }))
            });
            
            toast.success('Pricing updated successfully!');
            
            // Update original data to reflect saved state
            setOriginalData({
                pricing_format: selectedFormat,
                pricing_plans: pricingPlans.map(p => ({
                    start_time: p.startTime,
                    end_time: p.endTime,
                    min_duration: p.minDuration,
                    price: parseFloat(p.price),
                    weekend_price: parseFloat(p.weekendPrice),
                    use_weekend_pricing: p.useWeekendPricing
                })),
                custom_availabilities: dayAvailabilities.filter(da => da.price).map(da => ({
                    day: da.day,
                    date: da.date,
                    opening_time: da.openingTime,
                    closing_time: da.closingTime,
                    price: parseFloat(da.price),
                    min_duration: da.minDuration,
                    opening_period: da.openingPeriod,
                    closing_period: da.closingPeriod
                }))
            });
            setHasChanges(false);
            
            setTimeout(() => router.push('/organizer/dashboard?category=play'), 2000);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Update failed.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white flex flex-col font-[var(--font-anek-latin)] overflow-x-hidden">
            <div className="w-full">
                <main className="max-w-[1440px] mx-auto px-[33px] py-[40px] space-y-10">

                    {/* Header Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.push(`/play/edit/${id}`)}
                                className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors"
                            >
                                <ArrowLeft size={24} />
                                <span className="text-[20px] font-medium">Back to Details</span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <h1 className="text-[40px] font-medium text-black">
                                {isViewMode ? 'View Pricing Format' : 'Edit Pricing Format'}
                            </h1>
                            <div className="flex items-center gap-4">
                                {isViewMode && hasChanges && (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitLoading}
                                        className="flex items-center gap-2 bg-[#E7C200] text-black px-6 h-10 rounded-[12px] text-[16px] font-medium hover:bg-[#d6b300] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitLoading ? 'Updating...' : 'UPDATE'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsViewMode(!isViewMode)}
                                    className="flex items-center gap-2 bg-black text-white px-6 h-10 rounded-[12px] text-[16px] font-medium hover:bg-zinc-800 transition-colors"
                                >
                                    <Edit2 size={18} />
                                    {isViewMode ? 'Edit Pricing' : 'View Mode'}
                                </button>
                                {isViewMode && (
                                    <button
                                        onClick={() => router.push(`/play/edit/${id}/manage`)}
                                        className="flex items-center gap-2 bg-[#E7C200] text-black px-6 h-10 rounded-[12px] text-[16px] font-medium hover:bg-[#d6b300] transition-colors"
                                    >
                                        Next: Manage
                                        <ChevronDown size={18} className="rotate-270" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-[25px] font-medium text-[#686868]">
                            {isViewMode ? 'Overview of your venue pricing schedule and availability.' : 'Update the pricing format and plans for your venue.'}
                        </p>
                        <div className="h-[1.5px] bg-[#AEAEAE] w-full" />
                    </div>

                    {/* Format Selection Card */}
                    <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                        <h3 className="text-[30px] font-medium text-black mb-6">
                            Selected format <span className="text-[#E7C200]">*</span>
                        </h3>
                        <div className="h-[1px] bg-[#AEAEAE] mb-8" />

                        {isViewMode ? (
                            <div className="bg-[#FFFCED]/20 border border-[#E7C200] rounded-[10px] p-6">
                                <p className="text-[25px] font-semibold text-black capitalize">{selectedFormat} Schedule</p>
                                <p className="text-[20px] text-[#686868] mt-1">
                                    {selectedFormat === 'fixed' 
                                        ? 'Regular daily time slots for all days.' 
                                        : 'Custom availability for specific dates or one-off openings.'}
                                </p>
                            </div>
                        ) : (
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
                        )}
                    </section>

                    {/* Multiple Pricing Plans Card - Fixed Schedule */}
                    {selectedFormat === 'fixed' && (
                        <section className="bg-white rounded-[15px] p-8 shadow-sm border border-zinc-100">
                            <h3 className="text-[30px] font-medium text-black mb-6">Add Slot / Pricing Plan</h3>
                            <div className="h-[1px] bg-[#AEAEAE] mb-8" />

                            <div className="space-y-10">
                            {/* Input Form for a New Slot */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[25px] font-medium text-[#686868]">Start time</label>
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
                                    <label className="text-[25px] font-medium text-[#686868]">End time</label>
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
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'min' ? null : 'min')}
                                        className="border border-[#686868] rounded-[10px] h-[64px] flex items-center justify-between px-6 cursor-pointer bg-transparent"
                                    >
                                        <span className="text-[25px] text-[#686868] select-none">{minDuration}</span>
                                        <ChevronDown size={20} className={`text-black transition-transform ${openDropdown === 'min' ? 'rotate-180' : ''}`} />
                                    </div>
                                    {openDropdown === 'min' && (
                                        <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[300px] overflow-y-auto">
                                            {['1 Hour', '2 Hours', '3 Hours'].map(dur => (
                                                <div 
                                                    key={dur} 
                                                    onClick={() => { setMinDuration(dur); setOpenDropdown(null); }}
                                                    className="px-6 py-3 hover:bg-gray-100 cursor-pointer text-[20px] text-black"
                                                >
                                                    {dur}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[25px] font-medium text-[#686868]">Price per slot (₹)</label>
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input
                                            type="number"
                                            value={pricePerSlot}
                                            onChange={e => setPricePerSlot(e.target.value)}
                                            placeholder="Enter price"
                                            className="w-full bg-transparent outline-none text-[25px] text-[#686868] placeholder-[#AEAEAE]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[20px] font-medium text-[#686868]">Payout (approx)</label>
                                    <div className="bg-[#FFFCED] border border-[#E7C200] rounded-[10px] h-[64px] flex items-center px-6">
                                        <span className="text-[25px] text-[#686868] truncate font-medium">
                                            ₹ {pricePerSlot ? (parseFloat(pricePerSlot) * 0.9).toFixed(2) : '0.00'}
                                            <span className="text-[14px] ml-2 text-[#AEAEAE]">[AFTER TICPIN CHARGES]</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-[22px] font-medium text-black">Different pricing for weekends</span>
                                <button
                                    type="button"
                                    onClick={() => setUseDifferentWeekendPricing(!useDifferentWeekendPricing)}
                                    className={`w-[40px] h-[20px] rounded-[26px] border border-[#686868] relative transition-colors ${useDifferentWeekendPricing ? 'bg-[#E7C200]' : 'bg-[#D9D9D9]'}`}
                                >
                                    <div className={`absolute top-[-1px] w-[20px] h-[20px] rounded-full bg-white border border-[#686868] transition-all ${useDifferentWeekendPricing ? 'right-[-1px]' : 'left-[-1px]'}`} />
                                </button>
                            </div>

                            {useDifferentWeekendPricing && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-4">
                                        <label className="text-[20px] font-medium text-[#686868]">Weekend price (₹)</label>
                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                            <input
                                                type="number"
                                                value={weekendPrice}
                                                onChange={e => setWeekendPrice(e.target.value)}
                                                placeholder="Enter weekend price"
                                                className="w-full bg-transparent outline-none text-[25px] text-[#686868] placeholder-[#AEAEAE]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[20px] font-medium text-[#686868]">Payout (approx)</label>
                                        <div className="bg-[#FFFCED] border border-[#E7C200] rounded-[10px] h-[64px] flex items-center px-6">
                                            <span className="text-[25px] text-[#686868] truncate font-medium">
                                                ₹ {weekendPrice ? (parseFloat(weekendPrice) * 0.9).toFixed(2) : '0.00'}
                                                <span className="text-[14px] ml-2 text-[#AEAEAE]">[AFTER TICPIN CHARGES]</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={addPricingPlan}
                                    className="bg-black text-white rounded-[15px] px-12 h-[64px] flex items-center gap-3 active:scale-95 transition-all shadow-md group"
                                >
                                    <span className="text-[30px] font-medium">{pricingPlans.length > 0 ? 'UPDATE SLOT' : 'ADD SLOT'}</span>
                                    <PlusCircle size={28} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>

                        </div>
                    </section>
                    )}

                    {/* Custom Availability Section */}
                    {selectedFormat === 'custom' && (
                        <section className="bg-white rounded-[15px] p-8 shadow-sm border border-zinc-100">
                            <h3 className="text-[30px] font-medium text-black mb-6">Custom Availability</h3>
                            <div className="h-[1px] bg-[#AEAEAE] mb-8" />

                            {/* Day Selector */}
                            <div className="mb-8">
                                <label className="text-[20px] font-medium text-[#686868] mb-2 block">Select Day</label>
                                <div className="relative w-full max-w-md">
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'daySelect' ? null : 'daySelect')}
                                        className="border border-[#686868] rounded-[10px] h-[64px] flex items-center justify-between px-6 cursor-pointer bg-transparent"
                                    >
                                        <span className="text-[22px] text-black select-none">{selectedDay}</span>
                                        <ChevronDown size={20} className={`text-black transition-transform ${openDropdown === 'daySelect' ? 'rotate-180' : ''}`} />
                                    </div>
                                    {openDropdown === 'daySelect' && (
                                        <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[300px] overflow-y-auto">
                                            {dayAvailabilities.map((dayAvail) => (
                                                <div 
                                                    key={dayAvail.date}
                                                    onClick={() => { 
                                                        applyDaySelection(dayAvail.day, dayAvail.date);
                                                        setOpenDropdown(null); 
                                                    }}
                                                    className="px-6 py-3 hover:bg-gray-100 cursor-pointer text-[20px] text-black flex items-center justify-between"
                                                >
                                                    <span>{dayAvail.day}</span>
                                                    <span className="text-[16px] text-[#686868]">{dayAvail.date}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selected Day Details */}
                            {(() => {
                                const selectedDayData = dayAvailabilities.find(da => da.day === selectedDay && da.date === selectedDate);
                                if (!selectedDayData) return null;
                                
                                return (
                                    <div className="border border-[#AEAEAE] rounded-[10px] p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[25px] font-medium text-black">{selectedDay}</p>
                                                <p className="text-[18px] text-[#686868]">{selectedDayData.date}</p>
                                            </div>
                                            {selectedDayData.price && (
                                                <button
                                                    onClick={() => removeDayAvailability(selectedDay, selectedDate)}
                                                    className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Opening Time */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[18px] font-medium text-[#686868]">Opening Hour</label>
                                                <div className="relative w-full">
                                                    <div 
                                                        onClick={() => setOpenDropdown(openDropdown === 'openHour' ? null : 'openHour')}
                                                        className="border border-[#686868] rounded-[10px] h-[50px] flex items-center justify-between px-4 cursor-pointer bg-transparent"
                                                    >
                                                        <span className="text-[18px] text-black select-none">{dayOpeningHour}</span>
                                                        <ChevronDown size={18} />
                                                    </div>
                                                    {openDropdown === 'openHour' && (
                                                        <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(hour => (
                                                                <div 
                                                                    key={hour} 
                                                                    onClick={() => { setDayOpeningHour(hour); setOpenDropdown(null); }}
                                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[18px] text-black"
                                                                >
                                                                    {hour}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[18px] font-medium text-[#686868]">Opening Minute</label>
                                                <div className="relative w-full">
                                                    <div 
                                                        onClick={() => setOpenDropdown(openDropdown === 'openMinute' ? null : 'openMinute')}
                                                        className="border border-[#686868] rounded-[10px] h-[50px] flex items-center justify-between px-4 cursor-pointer bg-transparent"
                                                    >
                                                        <span className="text-[18px] text-black select-none">{dayOpeningMinute}</span>
                                                        <ChevronDown size={18} />
                                                    </div>
                                                    {openDropdown === 'openMinute' && (
                                                        <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(minute => (
                                                                <div 
                                                                    key={minute} 
                                                                    onClick={() => { setDayOpeningMinute(minute); setOpenDropdown(null); }}
                                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[18px] text-black"
                                                                >
                                                                    {minute}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[18px] font-medium text-[#686868]">Opening Period</label>
                                                <div className="flex border border-[#686868] rounded-[10px] h-[50px] overflow-hidden">
                                                    {['AM', 'PM'].map(period => (
                                                        <button
                                                            key={period}
                                                            type="button"
                                                            onClick={() => setDayOpeningPeriod(period as 'AM' | 'PM')}
                                                            className={`flex-1 text-[18px] font-semibold transition-colors ${dayOpeningPeriod === period ? 'bg-[#FFFCED] text-black' : 'bg-transparent text-[#686868] hover:bg-zinc-100'}`}
                                                        >
                                                            {period}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Closing Time */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[18px] font-medium text-[#686868]">Closing Hour</label>
                                                <div className="relative w-full">
                                                    <div 
                                                        onClick={() => setOpenDropdown(openDropdown === 'closeHour' ? null : 'closeHour')}
                                                        className="border border-[#686868] rounded-[10px] h-[50px] flex items-center justify-between px-4 cursor-pointer bg-transparent"
                                                    >
                                                        <span className="text-[18px] text-black select-none">{dayClosingHour}</span>
                                                        <ChevronDown size={18} />
                                                    </div>
                                                    {openDropdown === 'closeHour' && (
                                                        <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(hour => (
                                                                <div 
                                                                    key={hour} 
                                                                    onClick={() => { setDayClosingHour(hour); setOpenDropdown(null); }}
                                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[18px] text-black"
                                                                >
                                                                    {hour}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[18px] font-medium text-[#686868]">Closing Minute</label>
                                                <div className="relative w-full">
                                                    <div 
                                                        onClick={() => setOpenDropdown(openDropdown === 'closeMinute' ? null : 'closeMinute')}
                                                        className="border border-[#686868] rounded-[10px] h-[50px] flex items-center justify-between px-4 cursor-pointer bg-transparent"
                                                    >
                                                        <span className="text-[18px] text-black select-none">{dayClosingMinute}</span>
                                                        <ChevronDown size={18} />
                                                    </div>
                                                    {openDropdown === 'closeMinute' && (
                                                        <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(minute => (
                                                                <div 
                                                                    key={minute} 
                                                                    onClick={() => { setDayClosingMinute(minute); setOpenDropdown(null); }}
                                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[18px] text-black"
                                                                >
                                                                    {minute}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[18px] font-medium text-[#686868]">Closing Period</label>
                                                <div className="flex border border-[#686868] rounded-[10px] h-[50px] overflow-hidden">
                                                    {['AM', 'PM'].map(period => (
                                                        <button
                                                            key={period}
                                                            type="button"
                                                            onClick={() => setDayClosingPeriod(period as 'AM' | 'PM')}
                                                            className={`flex-1 text-[18px] font-semibold transition-colors ${dayClosingPeriod === period ? 'bg-[#FFFCED] text-black' : 'bg-transparent text-[#686868] hover:bg-zinc-100'}`}
                                                        >
                                                            {period}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Minimum Booking Duration */}
                                        <div className="space-y-2">
                                            <label className="text-[18px] font-medium text-[#686868]">Minimum booking duration</label>
                                            <div className="relative w-full max-w-[360px]">
                                                <div 
                                                    onClick={() => setOpenDropdown(openDropdown === 'minDuration' ? null : 'minDuration')}
                                                    className="border border-[#686868] rounded-[10px] h-[50px] flex items-center justify-between px-4 cursor-pointer bg-transparent"
                                                >
                                                    <span className="text-[18px] text-[#686868] select-none">{minDuration}</span>
                                                    <ChevronDown size={18} />
                                                </div>
                                                {openDropdown === 'minDuration' && (
                                                    <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                                        {['1 Hour', '2 Hours', '3 Hours'].map(dur => (
                                                            <div 
                                                                key={dur} 
                                                                onClick={() => { setMinDuration(dur); setOpenDropdown(null); }}
                                                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-[18px] text-black"
                                                            >
                                                                {dur}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="space-y-2">
                                            <label className="text-[18px] font-medium text-[#686868]">Price (₹)</label>
                                            <input
                                                type="number"
                                                value={dayPrice}
                                                onChange={(e) => setDayPrice(e.target.value)}
                                                placeholder="Enter price"
                                                className="w-full border border-[#686868] rounded-[10px] h-[50px] px-4 bg-transparent text-[18px] text-black"
                                            />
                                        </div>


                                        <div className="flex justify-center pt-4">
                                            <button
                                                onClick={addDayAvailability}
                                                className="bg-black text-white rounded-[15px] px-8 h-[56px] flex items-center gap-2 active:scale-95 transition-all shadow-md"
                                            >
                                                <span className="text-[24px] font-medium">{selectedDayData.price ? 'UPDATE' : 'ADD'}</span>
                                                <PlusCircle size={24} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </section>
                    )}

                    {/* Footer Submit Button */}
                    <div className="flex gap-4 pb-20">
                        {isViewMode ? (
                            <button
                                onClick={() => router.push('/organizer/dashboard?category=play')}
                                className="bg-black text-white px-12 h-14 rounded-[12px] text-[20px] font-medium hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
                            >
                                Finish & Go to Dashboard
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitLoading}
                                className="bg-black text-white px-12 h-14 rounded-[12px] text-[20px] font-medium hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {submitLoading ? 'Saving...' : 'Save & Finish'}
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EditFormatPage;
