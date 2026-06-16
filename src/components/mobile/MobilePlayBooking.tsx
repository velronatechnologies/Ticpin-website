'use client';

import { ChevronLeft, Plus, Minus, Check, Clock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { TicpinPass } from '@/lib/api/pass';

interface Court {
    id: string;
    name: string;
    type: string;
    price: number;
    image_url?: string;
}

interface RealPlay {
    id: string;
    name: string;
    city?: string;
    venue_name?: string;
    sub_category?: string;
    time?: string;
    opening_time?: string;
    closing_time?: string;
    price_starts_from?: number;
    courts?: Court[];
}

interface MobilePlayBookingProps {
    venue: RealPlay;
    dates: Array<{ key: string; label: string; day: string; month: string }>;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    duration: number;
    setDuration: (duration: number) => void;
    blockSlots: Array<{ label: string; startMin: number; endMin: number }>;
    selectedSlot: string | null;
    setSelectedSlot: (slot: string | null) => void;
    courts: Court[];
    selectedCourtIds: string[];
    toggleCourt: (uniqueId: string) => Promise<void>;
    effectiveDurationLabel: string;
    effectiveDurationSlots: number;
    resolveEffectiveHourlyPrice: (slotStartMin?: number) => number | null;
    handleBooking: () => void;
    usePass: boolean;
    setUsePass: (usePass: boolean) => void;
    pass: TicpinPass | null;
}

export default function MobilePlayBooking({
    venue,
    dates,
    selectedDate,
    setSelectedDate,
    duration,
    setDuration,
    blockSlots,
    selectedSlot,
    setSelectedSlot,
    courts,
    selectedCourtIds,
    toggleCourt,
    effectiveDurationLabel,
    effectiveDurationSlots,
    resolveEffectiveHourlyPrice,
    handleBooking,
    usePass,
    setUsePass,
    pass
}: MobilePlayBookingProps) {
    const router = useRouter();

    const selectedBlock = blockSlots.find(b => b.label === selectedSlot);
    const hourlyPrice = resolveEffectiveHourlyPrice(selectedBlock?.startMin);

    const formattedDates = useMemo(() => {
        return dates.map(d => ({
            day: d.label, // "01", "02"
            label: d.day, // "Fri", "Sat"
            key: d.key   // "2026-05-23"
        }));
    }, [dates]);

    return (
        <div className="md:hidden fixed inset-0 z-[120] bg-white font-sans overflow-y-auto pb-28" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
            {/* Header */}
            <header className="relative w-full h-[80px] bg-white border-b border-zinc-100 flex items-center px-4 shrink-0">
                <button
                    onClick={() => router.back()}
                    className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-100"
                >
                    <ChevronLeft size={18} className="text-black" />
                </button>

                <div className="flex-1 flex flex-col items-center mr-[31px]">
                    <h1 className="text-[20px] font-semibold text-black uppercase tracking-tight">{venue.sub_category || 'Book Turf'}</h1>
                    <p className="text-[10px] font-medium text-[#686868] uppercase truncate max-w-[200px]">{venue.name}</p>
                </div>
            </header>

            <main className="px-5 py-4 space-y-6">
                {/* Date Selector Section */}
                <div className="flex items-center gap-3">
                    {/* Vertical Month Label in Compact Box */}
                    <div className="flex items-center justify-center w-[30px] h-[55px] bg-[#D9D9D9] rounded-[10px] shrink-0">
                        <span className="text-[13px] font-semibold text-black transform -rotate-90 uppercase tracking-wider leading-none" style={{ fontFamily: 'Anek Latin' }}>
                            {dates[0]?.month || 'MAY'}
                        </span>
                    </div>

                    {/* Compact Dates Row with Dividers */}
                    <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide py-1">
                        {formattedDates.map((date, index) => (
                            <div key={date.key} className="flex items-center">
                                <button
                                    onClick={() => setSelectedDate(date.key)}
                                    className={`flex flex-col items-center justify-center w-[49px] h-[55px] rounded-[13px] shrink-0 transition-all cursor-pointer outline-none ${selectedDate === date.key ? 'bg-black text-white' : 'bg-transparent text-black'}`}
                                >
                                    <span className="text-[20px] font-bold leading-none">{date.day}</span>
                                    <span className={`text-[12px] font-semibold mt-0.5 ${selectedDate === date.key ? 'text-white' : 'text-[#686868]'}`}>
                                        {date.label}
                                    </span>
                                </button>
                                {index < formattedDates.length - 1 && (
                                    <div className="w-[1px] h-[11px] bg-[#AEAEAE] mx-0.5 shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Duration Section */}
                <div className="space-y-4">
                    <div className="w-full h-[93px] border border-[#E1E1E1] rounded-[15px] flex items-center justify-between px-6">
                        <span className="text-[18px] font-medium text-black">Duration</span>
                        <div className="w-[129px] h-[32px] bg-black rounded-[3px] flex items-center justify-between px-3">
                            <button
                                onClick={() => setDuration(Math.max(2, duration - 2))}
                                className="text-white text-[18px] font-bold active:scale-125 transition-transform px-1"
                            >
                                -
                            </button>
                            <span className="text-white text-[15px] font-medium">{duration * 0.5} hr</span>
                            <button
                                onClick={() => setDuration(duration + 2)}
                                className="text-white text-[18px] font-bold active:scale-125 transition-transform px-1"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Time Slots Section */}
                <div className="space-y-4 mt-[-16px]">
                    <h2 className="text-[18px] font-semibold text-black tracking-tight">Time slots available</h2>
                    {blockSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-3 max-h-[220px] overflow-y-auto pr-1">
                            {blockSlots.map((slot) => {
                                const isSelected = selectedSlot === slot.label;
                                return (
                                    <button
                                        key={slot.label}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedSlot(null);
                                            } else {
                                                setSelectedSlot(slot.label);
                                            }
                                        }}
                                        className={`h-[61px] border rounded-[15px] flex flex-col items-center justify-center transition-all outline-none ${isSelected ? 'border-black bg-black text-white' : 'border-[#E1E1E1] bg-white text-black'}`}
                                    >
                                        <span className="text-[14px] font-semibold">{slot.label}</span>
                                        <span className={`text-[11px] font-medium ${isSelected ? 'text-zinc-300' : 'text-[#686868]'}`}>available</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center py-6 text-zinc-500 font-medium">No slots available for this date/duration.</p>
                    )}
                </div>

                {/* Available Courts Section */}
                {selectedSlot && (
                    <div className="space-y-4">
                        <h2 className="text-[18px] font-semibold text-black tracking-tight">Available courts</h2>
                        <div className="space-y-3">
                            {courts.map((court, idx) => {
                                const uniqueId = `${court.id}-${idx}`;
                                const isSelected = selectedCourtIds.includes(uniqueId);
                                const pricePerHour = hourlyPrice ?? court.price;
                                const actualPrice = Math.round(pricePerHour * effectiveDurationSlots / 2);

                                return (
                                    <div
                                        key={uniqueId}
                                        onClick={() => toggleCourt(uniqueId)}
                                        className={`relative w-full p-4 border rounded-[15px] flex gap-4 cursor-pointer transition-all active:scale-[0.98] ${
                                            isSelected ? 'border-black bg-black/5' : 'border-[#E1E1E1] bg-white'
                                        }`}
                                    >
                                        <div className="w-[100px] h-[60px] bg-[#D9D9D9] rounded-[10px] overflow-hidden shrink-0">
                                            <img
                                                src={court.image_url || "/login/banner.jpeg"}
                                                className="w-full h-full object-cover"
                                                alt={court.name}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between min-w-0 pr-6">
                                            <div>
                                                <h3 className="text-[15px] font-bold text-black uppercase leading-tight truncate">{court.name}</h3>
                                                <p className="text-[12px] font-medium text-[#686868] truncate">{court.type}</p>
                                            </div>
                                            <p className="text-[12px] font-bold text-black uppercase tracking-tight">
                                                ₹{actualPrice} for {effectiveDurationLabel}
                                            </p>
                                        </div>
                                        <div className={`absolute top-4 right-4 w-[21px] h-[21px] rounded-[4px] flex items-center justify-center border transition-all ${
                                            isSelected ? 'bg-black border-black' : 'bg-transparent border-[#AEAEAE]'
                                        }`}>
                                            {isSelected && <Check size={14} className="text-white" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Ticpin Pass Benefits */}
                {pass && pass.benefits?.turf_bookings?.remaining > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-[15px] p-4 flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-amber-900">Ticpin Pass Active</h4>
                                <p className="text-[11px] text-amber-700 font-medium">
                                    {pass.benefits.turf_bookings.remaining} free bookings left
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setUsePass(!usePass)}
                            className={`px-4 h-[32px] rounded-[8px] text-[12px] font-bold transition-all ${
                                usePass ? 'bg-amber-600 text-white' : 'bg-white text-amber-600 border border-amber-300'
                            }`}
                        >
                            {usePass ? 'Applied' : 'Apply'}
                        </button>
                    </div>
                )}

                {/* Price summary */}
                {selectedCourtIds.length > 0 && (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-[15px] p-4 space-y-2">
                        {selectedCourtIds.map(uid => {
                            const court = courts.find((c, idx) => `${c.id}-${idx}` === uid);
                            if (!court) return null;
                            const linePrice = Math.round((hourlyPrice ?? court.price) * effectiveDurationSlots / 2);
                            return (
                                <div key={uid} className="flex justify-between text-[14px]">
                                    <span className="text-[#686868] font-medium">{court.name} ({effectiveDurationLabel})</span>
                                    <span className={`font-semibold ${usePass ? 'text-zinc-400 line-through' : 'text-black'}`}>₹{linePrice}</span>
                                </div>
                            );
                        })}
                        <div className="border-t border-zinc-200 pt-2 flex justify-between text-[16px] font-bold">
                            <span>Total Amount</span>
                            <span className={usePass ? 'text-green-600' : 'text-black'}>
                                ₹{usePass ? 0 : selectedCourtIds.reduce((sum, uid) => {
                                    const court = courts.find((c, idx) => `${c.id}-${idx}` === uid);
                                    return sum + Math.round((hourlyPrice ?? court?.price ?? 0) * effectiveDurationSlots / 2);
                                }, 0)}
                            </span>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] h-[83px] bg-[#F5F5F5] rounded-[40px] flex items-center justify-between px-6 z-[130] shadow-lg border border-zinc-200">
                <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-[16px] font-bold text-black truncate">{selectedCourtIds.length} turf selected</span>
                    <span className="text-[12px] font-medium text-[#686868] truncate">{selectedSlot || 'Select a slot'}</span>
                </div>
                <button
                    onClick={handleBooking}
                    disabled={selectedCourtIds.length === 0}
                    className="w-[130px] h-[51px] bg-black text-white rounded-[40px] font-bold text-[16px] flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
                    style={{ fontFamily: 'Anek Latin' }}
                >
                    Proceed
                </button>
            </div>
        </div>
    );
}
