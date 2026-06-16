'use client';

import { ChevronLeft, ChevronDown, Plus, Minus, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MobilePlayReview from './MobilePlayReview';

interface MobilePlayBookingProps {
    venue: {
        id: number | string;
        title: string;
        location: string;
    };
}

export default function MobilePlayBooking({ venue }: MobilePlayBookingProps) {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState('01');
    const [duration, setDuration] = useState(1);
    const [selectedSlots, setSelectedSlots] = useState<string[]>(['3 - 4 PM']);
    const [step, setStep] = useState(1);

    if (step === 2) {
        return <MobilePlayReview venue={venue} onBack={() => setStep(1)} />;
    }

    const dates = [
        { day: '01', label: 'Fri' },
        { day: '02', label: 'Sat' },
        { day: '03', label: 'Sun' },
        { day: '04', label: 'Mon' },
        { day: '05', label: 'Tue' },
        { day: '06', label: 'Wed' },
    ];

    const timeSlots = [
        { time: '3 - 4 PM', availability: '1 turf' },
        { time: '4 - 5 PM', availability: '1 turf' },
        { time: '5 - 6 PM', availability: '1 turf' },
        { time: '6 - 7 PM', availability: '1 turf' },
    ];

    return (
        <div className="md:hidden fixed inset-0 z-[120] bg-white font-sans overflow-y-auto pb-24" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
            {/* Header */}
            <header className="relative w-full h-[80px] bg-white border-b border-zinc-100 flex items-center px-4 shrink-0">
                <button 
                    onClick={() => router.back()}
                    className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-100"
                >
                    <ChevronLeft size={18} className="text-black" />
                </button>
                
                <div className="flex-1 flex flex-col items-center mr-[31px]">
                    <h1 className="text-[20px] font-semibold text-black uppercase tracking-tight">{`{SPORT NAME}`}</h1>
                    <p className="text-[10px] font-medium text-[#686868] uppercase">{venue.title}</p>
                </div>
            </header>

            <main className="px-5 py-4 space-y-8">
                {/* Date Selector Section - Compacted as requested */}
                <div className="flex items-center gap-3">
                    {/* Vertical Month Label in Compact Box */}
                    <div className="flex items-center justify-center w-[30px] h-[55px] bg-[#D9D9D9] rounded-[10px] shrink-0">
                        <span className="text-[13px] font-regular text-black transform -rotate-90 uppercase tracking-wider leading-none" style={{ fontFamily: 'Anek Latin' }}>MAY</span>
                    </div>

                    {/* Compact Dates Row with Dividers */}
                    <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
                        {dates.map((date, index) => (
                            <div key={date.day} className="flex items-center">
                                <div 
                                    onClick={() => setSelectedDate(date.day)}
                                    className={`flex flex-col items-center justify-center w-[49px] h-[55px] rounded-[13px] shrink-0 transition-all cursor-pointer ${selectedDate === date.day ? 'bg-black text-white' : 'bg-transparent text-black'}`}
                                >
                                    <span className="text-[20px] font-semibold leading-none">{date.day}</span>
                                    <span className={`text-[12px] font-normal mt-0.5 ${selectedDate === date.day ? 'text-white' : 'text-[#686868]'}`}>
                                        {date.label}
                                    </span>
                                </div>
                                {index < dates.length - 1 && (
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
                            <button onClick={() => setDuration(Math.max(1, duration - 1))} className="text-white text-[15px]">-</button>
                            <span className="text-white text-[18px] font-medium">{duration} hr</span>
                            <button onClick={() => setDuration(duration + 1)} className="text-white text-[15px]">+</button>
                        </div>
                    </div>
                </div>

                {/* Time Slots Section */}
                <div className="space-y-4 mt-[-16px]">
                    <h2 className="text-[18px] font-medium text-black">Time slots available</h2>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                        {timeSlots.map((slot) => (
                            <div 
                                key={slot.time}
                                onClick={() => {
                                    if (selectedSlots.includes(slot.time)) {
                                        setSelectedSlots(selectedSlots.filter(s => s !== slot.time));
                                    } else {
                                        setSelectedSlots([...selectedSlots, slot.time]);
                                    }
                                }}
                                className={`h-[61px] border rounded-[15px] flex flex-col items-center justify-center transition-all cursor-pointer ${selectedSlots.includes(slot.time) ? 'border-black bg-black/5' : 'border-[#E1E1E1] bg-white'}`}
                            >
                                <span className="text-[15px] font-normal text-black">{slot.time}</span>
                                <span className="text-[13px] font-normal text-[#686868]">{slot.availability}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Available Courts Section */}
                <div className="space-y-4">
                    <h2 className="text-[18px] font-medium text-black">Available courts</h2>
                    <div className="relative w-full p-4 border border-[#E1E1E1] rounded-[15px] flex gap-4">
                        <div className="w-[117px] h-[66px] bg-[#D9D9D9] rounded-[15px] overflow-hidden shrink-0">
                            <img src="/login/banner.jpeg" className="w-full h-full object-cover" alt="court" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-[15px] font-medium text-black uppercase leading-tight">{`{COURT TYPE}`}</h3>
                                <p className="text-[12px] font-medium text-[#686868]">{`{COURT OPTIONS}`}</p>
                            </div>
                            <p className="text-[12px] font-medium text-black uppercase tracking-tight">{`{PRICE FOR SELECTED DURATION}`}</p>
                        </div>
                        {/* Checkbox placeholder */}
                        <div className="absolute top-4 right-4 w-[21px] h-[21px] bg-[#D9D9D9] rounded-[4px] flex items-center justify-center">
                            <Check size={14} className="text-white" />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] h-[83px] bg-[#F5F5F5] rounded-[40px] flex items-center justify-between px-6 z-[130] shadow-lg border border-zinc-200">
                <div className="flex flex-col">
                    <span className="text-[18px] font-medium text-black" style={{ fontFamily: 'Anek Latin' }}>{selectedSlots.length} turf selected</span>
                    <span className="text-[15px] font-normal text-[#686868]" style={{ fontFamily: 'Anek Latin' }}>{selectedSlots[0] || 'Select a slot'}</span>
                </div>
                <button 
                    onClick={() => setStep(2)}
                    className="w-[150px] h-[51px] bg-black text-white rounded-[40px] font-medium text-[18px] flex items-center justify-center active:scale-95 transition-all"
                    style={{ fontFamily: 'Anek Latin' }}
                >
                    Proceed
                </button>
            </div>
        </div>
    );
}
