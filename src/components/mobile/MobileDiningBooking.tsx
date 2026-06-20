'use client';

import { ChevronLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { TicpinPass } from '@/lib/api/pass';

interface RealDining {
    id: string;
    name: string;
    city?: string;
    price_starts_from?: number;
    time?: string;
}

interface Offer {
    id: string;
    title: string;
    description?: string;
    image?: string;
    discount_type: 'percent' | 'flat';
    discount_value: number;
    valid_until: string;
}

interface MobileDiningBookingProps {
    venue: RealDining;
    nextDays: Array<{ key: string; label: number; day: string; month: string; fullDate: Date }>;
    selectedDate: { key: string; label: number; day: string; month: string; fullDate: Date };
    setSelectedDate: (date: any) => void;
    guests: number;
    setGuests: (guests: number) => void;
    showCustomGuest: boolean;
    setShowCustomGuest: (show: boolean) => void;
    customGuests: string;
    setCustomGuests: (val: string) => void;
    handleCustomGuest: () => void;
    selectedPeriod: 'morning' | 'noon' | 'evening' | 'night';
    setSelectedPeriod: (period: 'morning' | 'noon' | 'evening' | 'night') => void;
    selectedSlot: string | null;
    handleSlotClick: (slot: string) => Promise<void>;
    offers: Offer[];
    selectedOfferId: string | null;
    setSelectedOfferId: (id: string | null) => void;
    selectedOfferType: 'regular' | 'offers';
    setSelectedOfferType: (type: 'regular' | 'offers') => void;
    usePass: boolean;
    setUsePass: (usePass: boolean) => void;
    pass: TicpinPass | null;
    handleBooking: () => void;
}

export default function MobileDiningBooking({
    venue,
    nextDays,
    selectedDate,
    setSelectedDate,
    guests,
    setGuests,
    showCustomGuest,
    setShowCustomGuest,
    customGuests,
    setCustomGuests,
    handleCustomGuest,
    selectedPeriod,
    setSelectedPeriod,
    selectedSlot,
    handleSlotClick,
    offers,
    selectedOfferId,
    setSelectedOfferId,
    selectedOfferType,
    setSelectedOfferType,
    usePass,
    setUsePass,
    pass,
    handleBooking
}: MobileDiningBookingProps) {
    const router = useRouter();

    const slots = useMemo(() => {
        const periods = {
            morning: { start: 8 * 60, end: 12 * 60 },
            noon: { start: 12 * 60, end: 16 * 60 },
            evening: { start: 16 * 60, end: 20 * 60 },
            night: { start: 20 * 60, end: 23 * 60 + 45 }
        };
        const range = periods[selectedPeriod];
        const result = [];
        for (let t = range.start; t <= range.end; t += 15) {
            const h = Math.floor(t / 60);
            const m = t % 60;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            const timeStr = `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
            result.push(timeStr);
        }
        return result;
    }, [selectedPeriod]);

    return (
        <div className="md:hidden fixed inset-0 z-[120] bg-white font-sans overflow-y-auto pb-28" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
            {/* Header */}
            <header className="relative w-full h-[80px] bg-white border-b border-zinc-100 flex items-center px-4 shrink-0">
                <div className="flex-1 flex flex-col items-center">
                    <h1 className="text-[20px] font-semibold text-black uppercase tracking-tight">Book a table</h1>
                    <p className="text-[10px] font-medium text-[#686868] uppercase truncate max-w-[200px]">{venue.name}</p>
                </div>
            </header>

            <main className="px-5 py-4 space-y-6">
                {/* Date Selector Section */}
                <div className="space-y-3">
                    <h2 className="text-[18px] font-semibold text-black tracking-tight uppercase">SELECT DATE</h2>
                    <div className="flex items-center gap-3">
                        {/* Month Indicator */}
                        <div className="flex items-center justify-center w-[30px] h-[55px] bg-[#D9D9D9] rounded-[10px] shrink-0">
                            <span className="text-[13px] font-semibold text-black transform -rotate-90 uppercase tracking-wider leading-none">
                                {selectedDate.month.toUpperCase()}
                            </span>
                        </div>

                        {/* Next Days list */}
                        <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide py-1">
                            {nextDays.map((d, index) => (
                                <div key={d.key} className="flex items-center">
                                    <button
                                        onClick={() => setSelectedDate(d)}
                                        className={`flex flex-col items-center justify-center w-[49px] h-[55px] rounded-[13px] shrink-0 transition-all cursor-pointer outline-none ${selectedDate.key === d.key ? 'bg-black text-white' : 'bg-transparent text-black'}`}
                                    >
                                        <span className="text-[20px] font-bold leading-none">{d.label}</span>
                                        <span className={`text-[12px] font-semibold mt-0.5 ${selectedDate.key === d.key ? 'text-white' : 'text-[#686868]'}`}>
                                            {d.day}
                                        </span>
                                    </button>
                                    {index < nextDays.length - 1 && (
                                        <div className="w-[1px] h-[11px] bg-[#AEAEAE] mx-0.5 shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Guests Selector Section */}
                <div className="space-y-3">
                    <h2 className="text-[18px] font-semibold text-black tracking-tight uppercase">SELECT NUMBER OF GUESTS</h2>
                    {!showCustomGuest ? (
                        <div className="w-full h-[60px] border border-[#E1E1E1] rounded-[15px] flex items-center px-4 bg-white relative">
                            <select
                                className="w-full h-full bg-transparent appearance-none font-semibold text-[18px] text-black outline-none cursor-pointer"
                                value={guests > 10 ? 'more' : guests}
                                onChange={(e) => {
                                    if (e.target.value === 'more') {
                                        setShowCustomGuest(true);
                                    } else {
                                        setGuests(Number(e.target.value));
                                    }
                                }}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                                ))}
                                <option value="more">More...</option>
                            </select>
                        </div>
                    ) : (
                        <div className="flex items-center w-full gap-3 border border-[#E1E1E1] rounded-[15px] p-3 bg-white">
                            <input
                                type="number"
                                placeholder="Number of guests"
                                className="flex-1 bg-transparent border-none outline-none text-[18px] font-semibold"
                                value={customGuests}
                                onChange={(e) => setCustomGuests(e.target.value)}
                                min="1"
                                autoFocus
                            />
                            <button
                                onClick={handleCustomGuest}
                                className="bg-black text-white px-4 py-1.5 rounded-[8px] text-[14px] font-bold"
                            >
                                Set
                            </button>
                            <button
                                onClick={() => setShowCustomGuest(false)}
                                className="text-[#686868] text-[14px] font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Period & Slots Section */}
                <div className="space-y-4">
                    <h2 className="text-[18px] font-semibold text-black tracking-tight uppercase">AVAILABLE TIME SLOTS</h2>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
                        {[
                            { id: 'morning', label: 'Morning' },
                            { id: 'noon', label: 'Noon' },
                            { id: 'evening', label: 'Evening' },
                            { id: 'night', label: 'Night' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPeriod(p.id as any)}
                                className={`px-4 h-[36px] rounded-[18px] flex items-center justify-center cursor-pointer transition-colors uppercase text-[13px] font-bold ${selectedPeriod === p.id ? 'bg-[#D9D9D9] text-black' : 'bg-white border border-[#D9D9D9] text-[#686868]'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1 mt-2">
                        {slots.map((slot) => {
                            const isSelected = selectedSlot === slot;
                            return (
                                <button
                                    key={slot}
                                    onClick={() => handleSlotClick(slot)}
                                    className={`h-[56px] border rounded-[12px] flex items-center justify-center font-bold text-[14px] transition-all outline-none ${isSelected ? 'border-black bg-black text-white' : 'border-[#E1E1E1] bg-white text-black'}`}
                                >
                                    {slot}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Available Offers Section */}
                <div className="space-y-4">
                    <h2 className="text-[18px] font-semibold text-black tracking-tight uppercase">AVAILABLE OFFERS</h2>
                    <div className="space-y-3">
                        {offers.map((offer) => {
                            const isSelected = selectedOfferId === offer.id;
                            return (
                                <div
                                    key={offer.id}
                                    onClick={() => {
                                        setSelectedOfferId(offer.id);
                                        setSelectedOfferType('offers');
                                    }}
                                    className={`p-4 border rounded-[15px] bg-white cursor-pointer transition-all flex flex-col ${isSelected ? 'border-black bg-zinc-50' : 'border-[#E1E1E1]'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-[16px] text-black uppercase truncate max-w-[200px]">
                                            {offer.title}
                                        </span>
                                        <div className={`w-5 h-5 rounded-full border-2 border-zinc-300 flex items-center justify-center ${isSelected ? 'bg-black border-black' : 'bg-transparent'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-3 items-center">
                                        {offer.image && (
                                            <img src={offer.image} alt={offer.title} className="w-16 h-16 rounded-[10px] object-cover shrink-0" />
                                        )}
                                        <div>
                                            <p className="text-[15px] font-bold text-[#5331EA] uppercase">
                                                {offer.discount_type === 'percent' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                                            </p>
                                            <p className="text-[12px] text-[#686868] line-clamp-2 mt-1 leading-tight">{offer.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Regular Booking Option */}
                        <div
                            onClick={() => {
                                setSelectedOfferType('regular');
                                setSelectedOfferId(null);
                            }}
                            className={`p-4 border rounded-[15px] bg-white cursor-pointer transition-all flex flex-col ${selectedOfferType === 'regular' ? 'border-black bg-zinc-50' : 'border-[#E1E1E1]'}`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-[16px] text-black uppercase">Regular Booking</span>
                                <div className={`w-5 h-5 rounded-full border-2 border-zinc-300 flex items-center justify-center ${selectedOfferType === 'regular' ? 'bg-black border-black' : 'bg-transparent'}`}>
                                    {selectedOfferType === 'regular' && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                            </div>
                            <p className="text-[12px] text-[#686868] mt-2 leading-tight">Standard table reservation. No special offers included at this time.</p>
                        </div>
                    </div>
                </div>

                {/* Ticpin Pass Benefits */}
                {pass && pass.benefits?.dining_vouchers?.remaining > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-[15px] p-4 flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-amber-900">Ticpin Pass Active</h4>
                                <p className="text-[11px] text-amber-700 font-medium">
                                    Apply your ₹{pass.benefits.dining_vouchers.value_each || 250} dining voucher
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setUsePass(!usePass)}
                            className={`px-4 h-[32px] rounded-[8px] text-[12px] font-bold transition-all ${usePass ? 'bg-amber-600 text-white' : 'bg-white text-amber-600 border border-amber-300'}`}
                        >
                            {usePass ? 'Applied' : 'Apply'}
                        </button>
                    </div>
                )}
            </main>

            {/* Footer Bar */}
            <div className="fixed bottom-0 left-0 w-full h-[88px] bg-[#EFEFEF] flex items-center justify-between px-6 z-[130] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-zinc-200">
                <div className="flex flex-col">
                    <span className="text-[18px] font-bold text-black leading-none">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                    <span className="text-[11px] font-semibold text-[#686868] uppercase tracking-wider mt-0.5">{selectedSlot || 'Select a slot'}</span>
                </div>
                <button
                    onClick={handleBooking}
                    disabled={!selectedSlot}
                    className="w-[148px] h-[44px] bg-black text-white rounded-[14px] font-bold text-[15px] flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
                >
                    Book Slots
                </button>
            </div>
        </div>
    );
}
