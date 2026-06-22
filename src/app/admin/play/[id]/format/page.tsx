'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, PlusCircle, Trash2, X, ArrowLeft, Edit2 } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui/Toast';
import { adminApi } from '@/lib/api/admin';

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

const AdminFormatPage = () => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const mode = searchParams.get('mode') || 'view'; // initial mode from query
    
    const [selectedFormat, setSelectedFormat] = useState('fixed');
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
    const [dayAvailabilities, setDayAvailabilities] = useState<DayAvailability[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isViewMode, setIsViewMode] = useState(mode === 'view');
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
    const [openDropdown, setOpenDropdown] = useState<'start' | 'end' | 'min' | null>(null);

    // Form state for adding a new plan
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [minDuration, setMinDuration] = useState('1 Hour');
    const [pricePerSlot, setPricePerSlot] = useState('');
    const [weekendPrice, setWeekendPrice] = useState('');
    const [useDifferentWeekendPricing, setUseDifferentWeekendPricing] = useState(false);

    useEffect(() => {
        const loadExistingData = async () => {
            try {
                const data: any = await adminApi.getPlayById(id);
                if (data.pricing_format) {
                    setSelectedFormat(data.pricing_format);
                }
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

                    // Pre-fill input fields for the first slot
                    const plan = singlePlan[0];
                    setStartTime(plan.startTime);
                    setEndTime(plan.endTime);
                    setMinDuration(plan.minDuration);
                    setPricePerSlot(plan.price);
                    setWeekendPrice(plan.weekendPrice);
                    setUseDifferentWeekendPricing(plan.useWeekendPricing);
                }
                const today = new Date();
                const next7Days: DayAvailability[] = [];
                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    const dayName = DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1];
                    const dateStr = date.toISOString().split('T')[0];
                    const existingData = data.custom_availabilities?.find((da: any) => da.day === dayName);
                    next7Days.push({
                        day: dayName,
                        date: dateStr,
                        openingTime: existingData ? existingData.opening_time : '',
                        closingTime: existingData ? existingData.closing_time : '',
                        price: existingData ? existingData.price.toString() : '',
                        openingPeriod: existingData ? (existingData.opening_period || 'AM') : 'AM',
                        closingPeriod: existingData ? (existingData.closing_period || 'PM') : 'PM',
                        minDuration: existingData ? (existingData.min_duration || '1 Hour') : '1 Hour'
                    });
                }
                setDayAvailabilities(next7Days);
                if (next7Days.length > 0) {
                    setSelectedDay(next7Days[0].day);
                    setSelectedDate(next7Days[0].date);
                }
            } catch (err) {
                toast.error('Failed to load existing data');
                router.push('/admin/play');
            } finally {
                setLoading(false);
            }
        };
        loadExistingData();
    }, [id, router]);

    const addPricingPlan = () => {
        if (!pricePerSlot) {
            toast.warning('Please enter a price for the slot.');
            return;
        }

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

    const convert24To12 = (time24: string) => {
        const [hour, minute] = time24.split(':');
        let hour12 = parseInt(hour, 10);
        let period12 = 'AM';
        if (hour12 >= 12) {
            hour12 = hour12 - 12;
            period12 = 'PM';
        }
        return {
            hour: hour12 === 0 ? '12' : hour12.toString().padStart(2, '0'),
            minute: minute || '00',
            period: period12
        };
    };

    const applyDaySelection = (day: string, date: string) => {
        setSelectedDay(day);
        setSelectedDate(date);
        const existing = dayAvailabilities.find(da => da.day === day && da.date === date);
        if (existing && existing.price) {
            const opening12 = convert24To12(existing.openingTime);
            const closing12 = convert24To12(existing.closingTime);
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
                    minDuration
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
        setDayAvailabilities(updatedAvailabilities);
        if (day === selectedDay && date === selectedDate) {
            applyDaySelection(day, date);
        }
    };

    const handleSubmit = async () => {
        if (isViewMode) {
            toast.info('View mode - changes cannot be saved');
            return;
        }

        if (selectedFormat === 'fixed' && pricingPlans.length === 0) {
            toast.warning('Please add at least one pricing plan.');
            return;
        }
        if (selectedFormat === 'custom' && dayAvailabilities.filter(da => da.price).length < 7) {
            toast.warning('Please add custom availability for all 7 days.');
            return;
        }

        setSubmitLoading(true);
        try {
            await adminApi.updatePlay(id, {
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
                    closing_period: da.closingPeriod,
                })),
                price_per_slot: pricingPlans.length > 0 ? Math.min(...pricingPlans.map(p => parseFloat(p.price))) : 0
            } as any);
            
            toast.success('Pricing updated successfully!');
            setTimeout(() => router.push(`/admin/play?id=${id}`), 2000);
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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => router.back()}
                                    className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors"
                                >
                                    <ArrowLeft size={24} />
                                    <span className="text-[20px] font-medium">Back</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-4 py-2 rounded-full text-[16px] font-medium ${isViewMode ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                    {isViewMode ? 'View Mode' : 'Edit Mode'}
                                </span>
                                <button
                                    onClick={() => setIsViewMode(!isViewMode)}
                                    className="flex items-center gap-2 bg-black text-white px-6 h-10 rounded-[12px] text-[16px] font-medium hover:bg-zinc-800 transition-colors"
                                >
                                    <Edit2 size={18} />
                                    {isViewMode ? 'Edit Pricing' : 'View Mode'}
                                </button>
                                {!isViewMode && (
                                    <button
                                        onClick={() => router.push(`/admin/play?id=${id}`)}
                                        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                                    >
                                        <Edit2 size={20} />
                                        <span className="text-[16px] font-medium">Edit Details</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <h1 className="text-[40px] font-medium text-black">
                            {isViewMode ? 'View Pricing Format' : 'Edit Pricing Format'}
                        </h1>
                        <p className="text-[25px] font-medium text-[#686868]">
                            {isViewMode ? 'View the pricing format and plans for this venue' : 'Update the pricing format and plans for this venue'}
                        </p>
                        <div className="h-[1.5px] bg-[#AEAEAE] w-full" />
                    </div>

                    {/* Format Selection Card */}
                    <section className="bg-white rounded-[15px] p-8 shadow-sm border border-zinc-100">
                        <h3 className="text-[30px] font-medium text-black mb-6">
                            Choose the format <span className="text-[#E7C200]">*</span>
                        </h3>
                        <div className="h-[1px] bg-[#AEAEAE] mb-8" />

                        <div className={`border border-[#AEAEAE] rounded-[10px] overflow-hidden ${isViewMode ? 'opacity-75' : ''}`}>
                            <div
                                onClick={!isViewMode ? () => setSelectedFormat('fixed') : undefined}
                                className={`p-6 flex items-center justify-between ${!isViewMode ? 'cursor-pointer' : ''} border-b border-[#AEAEAE] transition-colors ${selectedFormat === 'fixed' ? 'bg-[#FFFCED]/40' : 'bg-white'}`}
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
                                onClick={!isViewMode ? () => setSelectedFormat('custom') : undefined}
                                className={`p-6 flex items-center justify-between ${!isViewMode ? 'cursor-pointer' : ''} transition-colors ${selectedFormat === 'custom' ? 'bg-[#FFFCED]/40' : 'bg-white'}`}
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

                    {/* Multiple Pricing Plans Card */}
                    {selectedFormat === 'fixed' && (
                    <section className="bg-white rounded-[15px] p-8 shadow-sm border border-zinc-100">
                        <h3 className="text-[30px] font-medium text-black mb-6">Pricing Plans</h3>
                        <div className="h-[1px] bg-[#AEAEAE] mb-8" />

                        <div className="space-y-10">
                            {!isViewMode && (
                                <>
                                    {/* Input Form for a New Slot */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[25px] font-medium text-[#686868]">Start time</label>
                                            <div className="relative w-full">
                                                <div 
                                                    onClick={() => setOpenDropdown(openDropdown === 'start' ? null : 'start')}
                                                    className="border border-[#686868] rounded-[10px] h-[64px] flex items-center justify-between px-6 cursor-pointer bg-transparent"
                                                >
                                                    <span className="text-[25px] text-[#686868] select-none">{startTime}</span>
                                                    <ChevronDown size={20} className={`text-black transition-transform ${openDropdown === 'start' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {openDropdown === 'start' && (
                                                    <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[300px] overflow-y-auto">
                                                        {Array.from({ length: 24 }).map((_, i) => {
                                                            const time = `${i.toString().padStart(2, '0')}:00`;
                                                            return (
                                                                <div 
                                                                    key={time} 
                                                                    onClick={() => { setStartTime(time); setOpenDropdown(null); }}
                                                                    className="px-6 py-3 hover:bg-gray-100 cursor-pointer text-[20px] text-black"
                                                                >
                                                                    {time}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[25px] font-medium text-[#686868]">End time</label>
                                            <div className="relative w-full">
                                                <div 
                                                    onClick={() => setOpenDropdown(openDropdown === 'end' ? null : 'end')}
                                                    className="border border-[#686868] rounded-[10px] h-[64px] flex items-center justify-between px-6 cursor-pointer bg-transparent"
                                                >
                                                    <span className="text-[25px] text-[#686868] select-none">{endTime}</span>
                                                    <ChevronDown size={20} className={`text-black transition-transform ${openDropdown === 'end' ? 'rotate-180' : ''}`} />
                                                </div>
                                                {openDropdown === 'end' && (
                                                    <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[300px] overflow-y-auto">
                                                        {Array.from({ length: 24 }).map((_, i) => {
                                                            const time = `${i.toString().padStart(2, '0')}:00`;
                                                            return (
                                                                <div 
                                                                    key={time} 
                                                                    onClick={() => { setEndTime(time); setOpenDropdown(null); }}
                                                                    className="px-6 py-3 hover:bg-gray-100 cursor-pointer text-[20px] text-black"
                                                                >
                                                                    {time}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
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
                                </>
                            )}

                        </div>
                    </section>
                    )}

                    {selectedFormat === 'custom' && (
                        <section className="bg-white rounded-[15px] p-8 shadow-sm border border-zinc-100 space-y-8">
                            <h3 className="text-[30px] font-medium text-black">Custom Availability</h3>
                            <div className="h-[1px] bg-[#AEAEAE]" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[18px] font-medium text-[#686868]">Select Day</label>
                                    <div className="relative">
                                        <div
                                            onClick={() => setOpenDropdown(openDropdown === 'start' ? null : 'start')}
                                            className="border border-[#686868] rounded-[10px] h-[54px] flex items-center justify-between px-4 cursor-pointer"
                                        >
                                            <span className="text-[18px]">{selectedDay}</span>
                                            <ChevronDown size={18} />
                                        </div>
                                        {openDropdown === 'start' && (
                                            <div className="absolute top-full mt-1 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[260px] overflow-y-auto">
                                                {dayAvailabilities.map(dayAvail => (
                                                    <div
                                                        key={dayAvail.date}
                                                        onClick={() => { applyDaySelection(dayAvail.day, dayAvail.date); setOpenDropdown(null); }}
                                                        className="px-4 py-3 hover:bg-[#FFFCED] cursor-pointer flex items-center justify-between"
                                                    >
                                                        <span>{dayAvail.day}</span>
                                                        <span className="text-[14px] text-[#686868]">{dayAvail.date}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[18px] font-medium text-[#686868]">Opening time</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={`${dayOpeningHour}:${dayOpeningMinute}`}
                                            onChange={e => {
                                                const match = e.target.value.match(/^(\d{1,2}):(\d{2})$/);
                                                if (!match) return;
                                                const hour = Math.min(12, Math.max(1, parseInt(match[1], 10)));
                                                const minute = Math.min(59, Math.max(0, parseInt(match[2], 10)));
                                                setDayOpeningHour(hour.toString().padStart(2, '0'));
                                                setDayOpeningMinute(minute.toString().padStart(2, '0'));
                                            }}
                                            className="border border-[#686868] rounded-[10px] h-[54px] px-4 w-full"
                                        />
                                        <div className="flex bg-[#F3F3F3] border border-[#686868] rounded-[10px] p-1 h-[54px]">
                                            {['AM', 'PM'].map(p => (
                                                <button key={p} type="button" onClick={() => setDayOpeningPeriod(p as 'AM' | 'PM')} className={`px-3 rounded-[6px] text-[14px] font-bold ${dayOpeningPeriod === p ? 'bg-white shadow-sm text-black' : 'text-[#686868]'}`}>{p}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[18px] font-medium text-[#686868]">Closing time</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={`${dayClosingHour}:${dayClosingMinute}`}
                                            onChange={e => {
                                                const match = e.target.value.match(/^(\d{1,2}):(\d{2})$/);
                                                if (!match) return;
                                                const hour = Math.min(12, Math.max(1, parseInt(match[1], 10)));
                                                const minute = Math.min(59, Math.max(0, parseInt(match[2], 10)));
                                                setDayClosingHour(hour.toString().padStart(2, '0'));
                                                setDayClosingMinute(minute.toString().padStart(2, '0'));
                                            }}
                                            className="border border-[#686868] rounded-[10px] h-[54px] px-4 w-full"
                                        />
                                        <div className="flex bg-[#F3F3F3] border border-[#686868] rounded-[10px] p-1 h-[54px]">
                                            {['AM', 'PM'].map(p => (
                                                <button key={p} type="button" onClick={() => setDayClosingPeriod(p as 'AM' | 'PM')} className={`px-3 rounded-[6px] text-[14px] font-bold ${dayClosingPeriod === p ? 'bg-white shadow-sm text-black' : 'text-[#686868]'}`}>{p}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!isViewMode && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[18px] font-medium text-[#686868]">Minimum booking duration</label>
                                        <div className="relative">
                                            <div
                                                onClick={() => setOpenDropdown(openDropdown === 'min' ? null : 'min')}
                                                className="border border-[#686868] rounded-[10px] h-[54px] flex items-center justify-between px-4 cursor-pointer"
                                            >
                                                <span>{minDuration}</span>
                                                <ChevronDown size={18} />
                                            </div>
                                            {openDropdown === 'min' && (
                                                <div className="absolute top-full mt-1 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50">
                                                    {['1 Hour', '2 Hours', '3 Hours'].map(dur => (
                                                        <div key={dur} onClick={() => { setMinDuration(dur); setOpenDropdown(null); }} className="px-4 py-3 hover:bg-[#FFFCED] cursor-pointer">{dur}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[18px] font-medium text-[#686868]">Price (₹)</label>
                                        <input type="number" value={dayPrice} onChange={e => setDayPrice(e.target.value)} className="border border-[#686868] rounded-[10px] h-[54px] px-4 w-full" />
                                    </div>
                                    <div className="md:col-span-2 flex justify-center">
                                        <button onClick={addDayAvailability} className="bg-black text-white rounded-[12px] px-10 h-[52px] flex items-center gap-2">
                                            <PlusCircle size={20} /> {dayAvailabilities.find(da => da.day === selectedDay && da.date === selectedDate)?.price ? 'Update Day' : 'Add Day'}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </section>
                    )}

                    {/* Footer Submit Button */}
                    <div className="pt-6 pb-12">
                        {!isViewMode && (
                            <button
                                onClick={handleSubmit}
                                disabled={submitLoading}
                                className="w-full bg-black text-white rounded-[15px] h-[80px] flex items-center justify-center text-[25px] font-semibold uppercase tracking-tight shadow-xl hover:bg-zinc-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default function Page() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <AdminFormatPage />
        </React.Suspense>
    );
}
