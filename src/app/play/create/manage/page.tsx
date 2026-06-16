'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ArrowLeft, PlusCircle, Trash2, Clock, Calendar } from 'lucide-react';
import { useCreatePlayStore } from '@/store/useCreatePlayStore';
import { toast } from '@/components/ui/Toast';
import { playApi } from '@/lib/api/play';

const TimeSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const times = [];
    for (let i = 0; i < 24; i++) {
        const hourInput = i;
        const ampm = hourInput >= 12 ? 'PM' : 'AM';
        const displayHour = hourInput % 12 || 12;
        const hStr = displayHour.toString().padStart(2, '0');
        times.push(`${hStr}:00 ${ampm}`);
        times.push(`${hStr}:30 ${ampm}`);
    }

    return (
        <div className="relative">
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none bg-white border border-[#686868] rounded-[10px] h-[64px] px-6 text-[22px] outline-none text-black"
            >
                <option value="">Select time</option>
                {times.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={24} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    );
};

const ManagePlaySlotsPage = () => {
    const router = useRouter();
    const { 
        venueName, venueFormat, slotConfig, 
        weekdaySchedules, isWeekendPricingDifferent, weekendPrice, weekendSchedules,
        updateField, updateSlotConfig, updateSchedule, addSchedule, removeSchedule,
        reset
    } = useCreatePlayStore();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!venueName) {
            router.push('/play/create');
        }
    }, [venueName, router]);

    const handleSave = async () => {
        if (!venueFormat) {
            toast.warning('Please select a format.');
            return;
        }

        const numericPrice = parseFloat(slotConfig.price) || 0;
        if (numericPrice <= 0) {
            toast.warning('Please specify a valid price per slot.');
            return;
        }

        setLoading(true);
        try {
            const state = useCreatePlayStore.getState();
            
            const payload = {
                name: state.venueName,
                venueName: state.venueName,
                venueAddress: state.venueAddress,
                instagram_link: state.instagramLink,
                googleMapLink: state.googleMapLink,
                description: state.description,
                portrait_imageUrl: state.portraitUrl,
                landscape_imageUrl: state.landscapeUrl,
                secondary_banner_url: state.secondaryBannerUrl,
                card_video_url: state.videoUrl,
                galleryUrls: state.galleryUrls,
                category: state.selections.category,
                sub_category: state.selections.subCategory,
                city: state.selections.city,
                guide: state.guide,
                courts: state.courts.map(c => ({
                    ...c,
                    price: parseFloat(c.price as any) || 0
                })),
                points_of_contact: state.pocs,
                sales_notifications: state.salesNotifs,
                payment: {
                    organizer_name: state.payment.organizerName,
                    gstin: state.payment.gstin,
                    account_number: state.payment.accountNumber,
                    ifsc: state.payment.ifsc,
                    account_type: state.payment.accountType
                },
                event_instructions: state.playInstructions,
                youtube_video_url: state.youtubeVideoUrl,
                prohibited_items: state.prohibitedItems,
                faqs: state.faqs,
                cancellation_policy: state.cancellationPolicy,
                venue_format: state.venueFormat === 'fixed' ? 'Fixed schedule' : 'Custom availability',
                slot_duration: parseInt(state.slotConfig.duration) || 0,
                min_booking_duration: parseInt(state.slotConfig.minDuration) || 0,
                price_per_slot: numericPrice,
                weekday_schedules: state.weekdaySchedules,
                weekend_schedules: state.isWeekendPricingDifferent ? state.weekendSchedules : state.weekdaySchedules,
                is_weekend_pricing_different: state.isWeekendPricingDifferent,
                weekend_price: state.isWeekendPricingDifferent ? parseFloat(state.weekendPrice) || 0 : numericPrice,
                date: new Date(),
                time: state.weekdaySchedules[0]?.openTime || "09:00 AM"
            };

            await playApi.create(payload);
            toast.success('Venue created and submitted for review!');
            reset();
            router.push('/play');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create venue');
        } finally {
            setLoading(false);
        }
    };

    const payout = (parseFloat(slotConfig.price) || 0) * 0.90;
    const weekendPayout = (parseFloat(weekendPrice) || 0) * 0.90;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white overflow-x-hidden">
            <div className="w-full" style={{ zoom: '0.70' }}>
                <div className="max-w-[1920px] mx-auto px-10 pt-20">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-[18px] text-zinc-500 hover:text-black mb-10">
                        <ArrowLeft size={20} /> Back
                    </button>

                    <h1 className="text-[40px] font-medium leading-[44px] text-black mb-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        Manage slots & timings
                    </h1>
                    <p className="text-[25px] font-medium text-[#686868] mb-12">Only a few steps left to get your play venue live on Ticpin!</p>

                    <div className="space-y-10">
                        {/* Format Selection */}
                        <section className="bg-white rounded-[15px] p-10">
                            <h2 className="text-[30px] font-medium text-black mb-8">Choose the format <span className="text-[#E7C200]">*</span></h2>
                            <div className="grid grid-cols-2 gap-10">
                                <div 
                                    onClick={() => updateField('venueFormat', 'fixed')}
                                    className={`relative p-8 rounded-[15px] border-[2px] cursor-pointer transition-all ${venueFormat === 'fixed' ? 'border-[#E7C200] bg-[rgba(255,241,168,0.15)]' : 'border-[#AEAEAE]'}`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-[12px] flex items-center justify-center ${venueFormat === 'fixed' ? 'bg-[#E7C200]' : 'bg-[#F2F2F2]'}`}>
                                            <Clock size={32} strokeWidth={1.5} className={venueFormat === 'fixed' ? 'text-black' : 'text-[#686868]'} />
                                        </div>
                                        <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${venueFormat === 'fixed' ? 'border-[#FFEF96]' : 'border-[#AEAEAE]'}`}>
                                            {venueFormat === 'fixed' && <div className="w-[12px] h-[12px] rounded-full bg-[#E7C200]" />}
                                        </div>
                                    </div>
                                    <h3 className="text-[28px] font-bold text-black mb-3 italic tracking-wide uppercase">Fixed schedule</h3>
                                    <p className="text-[18px] text-[#AEAEAE] font-medium leading-relaxed">Price remains constant for a fixed slot duration. (e.g. 1 hour, 2 hours)</p>
                                </div>

                                <div 
                                    onClick={() => updateField('venueFormat', 'custom')}
                                    className={`relative p-8 rounded-[15px] border-[2px] cursor-pointer transition-all ${venueFormat === 'custom' ? 'border-[#E7C200] bg-[rgba(255,241,168,0.15)]' : 'border-[#AEAEAE]'}`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-[12px] flex items-center justify-center ${venueFormat === 'custom' ? 'bg-[#E7C200]' : 'bg-[#F2F2F2]'}`}>
                                            <Calendar size={32} strokeWidth={1.5} className={venueFormat === 'custom' ? 'text-black' : 'text-[#686868]'} />
                                        </div>
                                        <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${venueFormat === 'custom' ? 'border-[#FFEF96]' : 'border-[#AEAEAE]'}`}>
                                            {venueFormat === 'custom' && <div className="w-[12px] h-[12px] rounded-full bg-[#E7C200]" />}
                                        </div>
                                    </div>
                                    <h3 className="text-[28px] font-bold text-black mb-3 italic tracking-wide uppercase">Custom availability</h3>
                                    <p className="text-[18px] text-[#AEAEAE] font-medium leading-relaxed">Users can choose their own slot duration based on their needs.</p>
                                </div>
                            </div>
                        </section>

                        {venueFormat && (
                            <>
                                {/* Time Slots / Customer Availability */}
                                <section className="bg-white rounded-[15px] p-10">
                                    <h2 className="text-[30px] font-medium text-black mb-2">Set your time slots</h2>
                                    <p className="text-[20px] text-[#AEAEAE] mb-8">Set the customer availability for your play venue.</p>
                                    <div className="w-full h-[1px] bg-[#AEAEAE] mb-10" />

                                    {venueFormat === 'fixed' ? (
                                        <div className="grid grid-cols-2 gap-12">
                                            <div className="space-y-3">
                                                <label className="text-[20px] font-medium text-[#686868]">Opening time</label>
                                                <TimeSelect 
                                                    value={weekdaySchedules[0]?.openTime || ''} 
                                                    onChange={val => updateSchedule('weekday', 0, { openTime: val })} 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[20px] font-medium text-[#686868]">Closing time</label>
                                                <TimeSelect 
                                                    value={weekdaySchedules[0]?.closeTime || ''} 
                                                    onChange={val => updateSchedule('weekday', 0, { closeTime: val })} 
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {weekdaySchedules.map((schedule, idx) => (
                                                <div key={idx} className="grid grid-cols-3 gap-6 items-end">
                                                    <div className="space-y-3">
                                                        <label className="text-[20px] font-medium text-[#686868]">Select day</label>
                                                        <div className="relative">
                                                            <select 
                                                                value={schedule.day || ''}
                                                                onChange={e => updateSchedule('weekday', idx, { day: e.target.value })}
                                                                className="w-full appearance-none bg-white border border-[#686868] rounded-[10px] h-[64px] px-6 text-[22px] outline-none text-black"
                                                            >
                                                                <option value="">Select day</option>
                                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Everyday', 'Weekdays', 'Weekends'].map(d => (
                                                                    <option key={d} value={d}>{d}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown size={24} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[20px] font-medium text-[#686868]">Opening time</label>
                                                        <TimeSelect value={schedule.openTime} onChange={val => updateSchedule('weekday', idx, { openTime: val })} />
                                                    </div>
                                                    <div className="space-y-3 flex items-center gap-4">
                                                        <div className="flex-1 space-y-3">
                                                            <label className="text-[20px] font-medium text-[#686868]">Closing time</label>
                                                            <TimeSelect value={schedule.closeTime} onChange={val => updateSchedule('weekday', idx, { closeTime: val })} />
                                                        </div>
                                                        {weekdaySchedules.length > 1 && (
                                                            <button onClick={() => removeSchedule('weekday', idx)} className="mt-8 text-red-500 p-2 hover:bg-red-50 rounded-lg">
                                                                <Trash2 size={24} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => addSchedule('weekday')} className="flex items-center gap-2 text-[22px] font-bold text-black mt-4">
                                                ADD <PlusCircle size={24} />
                                            </button>
                                        </div>
                                    )}
                                </section>

                                {/* Slot Configuration / Pricing */}
                                <section className="bg-white rounded-[15px] p-10">
                                    <h2 className="text-[30px] font-medium text-black mb-8">Add Slot / Pricing Plan</h2>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[20px] font-medium text-[#686868]">Minimum booking duration</label>
                                            <div className="relative">
                                                <select 
                                                    value={slotConfig.minDuration}
                                                    onChange={e => updateSlotConfig({ minDuration: e.target.value })}
                                                    className="w-full appearance-none bg-white border border-[#686868] rounded-[10px] h-[64px] px-6 text-[22px] outline-none text-black"
                                                >
                                                    <option value="30">30 mins</option>
                                                    <option value="60">60 mins</option>
                                                    <option value="90">90 mins</option>
                                                    <option value="120">120 mins</option>
                                                </select>
                                                <ChevronDown size={24} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[20px] font-medium text-[#686868]">Price per slot (₹)</label>
                                            <div className="flex gap-6">
                                                <div className="flex-1 border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                                    <input 
                                                        type="number" 
                                                        value={slotConfig.price}
                                                        onChange={e => updateSlotConfig({ price: e.target.value })}
                                                        placeholder="Enter amount"
                                                        className="w-full bg-transparent outline-none text-[22px] text-black placeholder-[#AEAEAE]"
                                                    />
                                                </div>
                                                <div className="w-[180px] bg-zinc-50 border border-[#686868] rounded-[10px] h-[64px] flex flex-col justify-center px-4">
                                                    <span className="text-[12px] font-bold text-black uppercase tracking-tight">[ AFTER CHARGES ]</span>
                                                    <span className="text-[22px] font-bold text-[#686868]">₹ {payout.toFixed(0)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-2 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div 
                                                    onClick={() => updateField('isWeekendPricingDifferent', !isWeekendPricingDifferent)}
                                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer ${isWeekendPricingDifferent ? 'bg-[#E7C200] border-[#E7C200]' : 'border-[#686868]'}`}
                                                >
                                                    {isWeekendPricingDifferent && <span className="text-black font-bold text-[14px]">✓</span>}
                                                </div>
                                                <span className="text-[20px] font-medium text-black">Different pricing for weekdays / weekends?</span>
                                            </div>

                                            {isWeekendPricingDifferent && (
                                                <div className="grid grid-cols-2 gap-12 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="space-y-4">
                                                        <label className="text-[20px] font-medium text-[#686868]">Weekend Price (₹)</label>
                                                        <div className="flex gap-6">
                                                            <div className="flex-1 border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                                                <input 
                                                                    type="number" 
                                                                    value={weekendPrice}
                                                                    onChange={e => updateField('weekendPrice', e.target.value)}
                                                                    placeholder="Enter weekend price"
                                                                    className="w-full bg-transparent outline-none text-[22px] text-black placeholder-[#AEAEAE]"
                                                                />
                                                            </div>
                                                            <div className="w-[180px] bg-zinc-50 border border-[#686868] rounded-[10px] h-[64px] flex flex-col justify-center px-4">
                                                                <span className="text-[12px] font-bold text-black uppercase tracking-tight">[ AFTER CHARGES ]</span>
                                                                <span className="text-[22px] font-bold text-[#686868]">₹ {weekendPayout.toFixed(0)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}

                        <div className="flex flex-col items-center gap-6 mt-12 pb-20">
                            <button
                                onClick={handleSave}
                                disabled={loading || !venueFormat}
                                className="bg-black text-white w-full py-5 rounded-[15px] text-[28px] font-medium transition-all active:scale-[0.98] disabled:opacity-50"
                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                            >
                                {loading ? 'Saving...' : 'Submit for review'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagePlaySlotsPage;
