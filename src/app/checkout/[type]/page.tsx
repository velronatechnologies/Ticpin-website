'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';
import { playApi, diningApi } from '@/lib/api';

interface Ticket {
    id: string;
    name: string;
    seat_type?: string;
    price: number;
    description: string[];
    quantity: number;
    available?: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const { checkoutData, setCheckoutData, location: storeLocation } = useStore();
    const { addToast } = useToast();

    const bookingType = params.type as string;

    const [tickets, setTickets] = useState<Ticket[]>([]);

    // Play-specific state
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [duration, setDuration] = useState(1);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedCourts, setSelectedCourts] = useState<string[]>([]);
    const [venueSlotSettings, setVenueSlotSettings] = useState<{ open_time: string; close_time: string; slot_duration_minutes: number } | null>(null);
    const [venue, setVenue] = useState<any>(null);
    const [selectedGuests, setSelectedGuests] = useState(2);
    const [mealTab, setMealTab] = useState<'lunch' | 'dinner'>('lunch');

    // Fetch venue settings
    useEffect(() => {
        if (bookingType === 'play' && checkoutData?.id) {
            playApi.getById(checkoutData.id).then(res => {
                if (res.success && res.data) {
                    setVenue(res.data);
                    if (res.data.slot_settings) {
                        setVenueSlotSettings(res.data.slot_settings);
                    }
                }
            }).catch(() => { });
        } else if (bookingType === 'dining' && checkoutData?.id) {
            diningApi.getById(checkoutData.id!).then(res => {
                if (res.success && res.data) {
                    setVenue(res.data);
                }
            }).catch(() => { });
        }
    }, [bookingType, checkoutData?.id]);

    useEffect(() => {
        if (checkoutData && checkoutData.tickets) {
            setTickets(checkoutData.tickets);
        } else if (bookingType !== 'dining') { // Only redirect if not dining and no tickets
            router.push('/');
        }
    }, [checkoutData, router, bookingType]);

    const handleQuantityChange = (ticketId: string, quantity: number) => {
        const ticket = tickets.find(t => t.id === ticketId);
        const max = ticket?.available ?? Infinity;
        setTickets(tickets.map(t =>
            t.id === ticketId ? { ...t, quantity: Math.min(max, Math.max(0, quantity)) } : t
        ));
    };

    const totalAmount = tickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
    const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0);

    const handleAddToCart = () => {
        if (totalTickets === 0) {
            addToast('Please select at least one ticket', 'error');
            return;
        }
        if (!checkoutData) return;
        setCheckoutData({ ...checkoutData, tickets, bookingType });
        router.push(`/checkout/${bookingType}/billing`);
    };

    // Play flow "Book Slots" (final step)
    const handlePlayBooking = () => {
        if (selectedCourts.length === 0) {
            addToast('Please select at least one court', 'error');
            return;
        }
        if (!selectedSlot) {
            addToast('Please select a time slot', 'error');
            return;
        }

        // Map selected courts to tickets
        const selectedTickets = tickets.filter(t => selectedCourts.includes(t.id)).map(t => ({
            ...t,
            quantity: 1
        }));

        if (!checkoutData) return;
        setCheckoutData({
            ...checkoutData,
            tickets: selectedTickets,
            date: `2024-03-${selectedDate.toString().padStart(2, '0')}`, // Mock date
            timeSlot: selectedSlot,
            bookingType
        });
        router.push(`/checkout/${bookingType}/billing`);
    };

    const handleDiningBooking = () => {
        if (!selectedSlot) {
            addToast('Please select a time slot', 'error');
            return;
        }
        if (!checkoutData) return;

        setCheckoutData({
            ...checkoutData,
            date: `2024-03-${selectedDate.toString().padStart(2, '0')}`,
            timeSlot: selectedSlot,
            bookingType,
            tickets: [{
                id: 'table',
                name: 'Table Booking',
                price: 0,
                quantity: selectedGuests,
                description: [`Time: ${selectedSlot}`]
            }]
        });
        router.push(`/checkout/${bookingType}/billing`);
    };

    if (tickets.length === 0 && !venue) {
        return (
            <div
                className="h-screen flex items-center justify-center text-xl font-semibold bg-white"
                style={{ fontFamily: 'var(--font-anek-latin)' }}
            >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mr-3"></div>
                Loading...
            </div>
        );
    }

    const dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            day: d.getDate(),
            label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        };
    });

    // ── COMMON HEADER ──
    const Header = () => (
        <header className="h-[90px] md:h-[114px] bg-white flex items-center shadow-sm border-b border-zinc-100 flex-shrink-0">
            <div className="max-w-[1440px] w-full mx-auto px-6 md:px-10 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                    <button onClick={() => router.back()} className="hover:opacity-70 transition-opacity">
                        <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-8 md:h-10 w-auto" />
                    </button>
                    <div className="h-8 w-[1px] bg-[#AEAEAE] hidden md:block" />
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                    <div className="flex items-center gap-1 md:gap-2">
                        <img src="/loc.png" alt="" className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-base md:text-xl font-medium text-black truncate max-w-[120px] md:max-w-none" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            {storeLocation ? storeLocation.split(',')[0].trim() : 'Set Location'}
                        </span>
                    </div>
                    <button className="p-2 hidden md:block">
                        <img src="/search.svg" alt="search" className="w-5 h-5 md:w-6 md:h-6" style={{ filter: 'invert(1)' }} />
                    </button>
                    <div className="w-[40px] h-[40px] md:w-[51px] md:h-[51px] bg-[#E1E1E1] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </div>
            </div>
        </header>
    );

    // ── PLAY CHECKOUT VIEW ──
    if (bookingType === 'play') {
        const timeSlots = venueSlotSettings ? (() => {
            const settings = venueSlotSettings;
            const [openH, openM] = settings.open_time.split(':').map(Number);
            const [closeH, closeM] = settings.close_time.split(':').map(Number);
            const durMin = settings.slot_duration_minutes || 60;
            const slots: string[] = [];
            let cur = openH * 60 + (openM || 0);
            const end = closeH * 60 + (closeM || 0);
            while (cur + durMin <= end) {
                const fmt = (mins: number) => {
                    const h = Math.floor(mins / 60);
                    const m = mins % 60;
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
                    return m === 0 ? `${h12} ${ampm}` : `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
                };
                slots.push(`${fmt(cur)} - ${fmt(cur + durMin)}`);
                cur += durMin;
            }
            return slots;
        })() : ['12 - 1 PM', '1 - 2 PM', '2 - 3 PM', '3 - 4 PM', '4 - 5 PM'];

        return (
            <div className="h-screen flex flex-col overflow-hidden bg-white">
                <Header />
                <main className="flex-1 overflow-y-auto" style={{ background: 'linear-gradient(180deg, #FFF7CD -100%, #FFFFFF 100%)' }}>
                    <div className="max-w-[1000px] mx-auto bg-white rounded-[30px] my-6 p-6 md:p-10 shadow-sm font-[family-name:var(--font-anek-latin)]">
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-[36px] font-semibold text-black leading-tight">
                                {checkoutData?.name || "Turf Name"}
                            </h1>
                            <p className="text-lg md:text-xl font-medium text-[#686868]">
                                Play options &bull; {checkoutData?.sport || "Sport"}
                            </p>
                        </div>

                        <div className="space-y-10">
                            <section>
                                <h2 className="text-[24px] font-medium text-black mb-3" style={{ fontFamily: 'var(--font-anek-tamil)' }}>
                                    SELECT DATE & TIME
                                </h2>
                                <div className="h-[0.5px] w-full bg-[#AEAEAE] mb-5" />
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    <div className="flex flex-col items-center justify-center min-w-[60px] h-[55px] bg-[#D9D9D9] rounded-xl text-black font-medium text-[14px]">
                                        MONTH
                                    </div>
                                    {dates.map((d) => (
                                        <button
                                            key={d.day}
                                            onClick={() => setSelectedDate(d.day)}
                                            className={`flex flex-col items-center justify-center min-w-[60px] h-[55px] rounded-xl transition-all ${selectedDate === d.day ? 'bg-black text-white' : 'bg-white border border-[#686868] text-black'
                                                }`}
                                        >
                                            <span className="text-lg font-semibold leading-none">{d.day}</span>
                                            <span className="text-[12px] mt-1">{d.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h2 className="text-[24px] font-medium text-black mb-3" style={{ fontFamily: 'var(--font-anek-tamil)' }}>
                                    DURATION
                                </h2>
                                <div className="h-[0.5px] w-full bg-[#AEAEAE] mb-5" />
                                <div className="flex items-center justify-between w-[120px] h-[48px] border border-[#686868] rounded-xl px-4">
                                    <button onClick={() => setDuration(Math.max(1, duration - 1))} className="text-xl font-medium">-</button>
                                    <span className="text-lg font-semibold">{duration} hr</span>
                                    <button onClick={() => setDuration(duration + 1)} className="text-xl font-medium">+</button>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-[24px] font-medium text-black mb-3" style={{ fontFamily: 'var(--font-anek-tamil)' }}>
                                    AVAILABLE TIME SLOTS
                                </h2>
                                <div className="h-[0.5px] w-full bg-[#AEAEAE] mb-5" />
                                <div className="flex flex-wrap gap-3">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`h-[48px] px-6 flex items-center justify-center border rounded-xl text-base md:text-lg font-medium transition-all ${selectedSlot === slot ? 'bg-black text-white border-black' : 'bg-white border-[#686868] text-[#686868]'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h2 className="text-[24px] font-medium text-black mb-3" style={{ fontFamily: 'var(--font-anek-tamil)' }}>
                                    AVAILABLE COURTS
                                </h2>
                                <div className="h-[0.5px] w-full bg-[#AEAEAE] mb-5" />
                                <div className="space-y-4">
                                    {(tickets.length > 0 ? tickets : [
                                        { id: '1', name: 'Standard Court', price: 1200, description: ['Indoor Hardwood'] },
                                        { id: '2', name: 'Premium Court', price: 1800, description: ['Glass Squash Court'] }
                                    ]).map((ticket: any) => (
                                        <div key={ticket.id} className="flex items-center gap-4 md:gap-6 p-4 rounded-2xl border border-[#AEAEAE] bg-zinc-50/30">
                                            <div className="w-[100px] h-[75px] md:w-[140px] md:h-[100px] rounded-xl overflow-hidden relative bg-zinc-100 flex-shrink-0">
                                                <img src="/login/banner.jpeg" alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl md:text-2xl font-semibold text-black truncate">{ticket.name}</h3>
                                                <p className="text-sm md:text-base font-medium text-[#686868]">{ticket.description?.[0] || "Standard Facility"}</p>
                                                <p className="text-lg md:text-xl font-semibold text-black mt-1">₹{ticket.price.toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (selectedCourts.includes(ticket.id)) {
                                                        setSelectedCourts(selectedCourts.filter(id => id !== ticket.id));
                                                    } else {
                                                        setSelectedCourts([...selectedCourts, ticket.id]);
                                                    }
                                                }}
                                                className={`w-10 h-10 md:w-12 md:h-12 border-2 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${selectedCourts.includes(ticket.id) ? 'bg-black border-black text-white' : 'border-[#686868]'
                                                    }`}
                                            >
                                                {selectedCourts.includes(ticket.id) && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>

                <div className="h-[100px] md:h-[120px] bg-[#2A2A2A] flex items-center justify-between px-6 md:px-14 flex-shrink-0 text-white">
                    <div>
                        <p className="text-xl md:text-2xl font-semibold">
                            {selectedCourts.length} Court{selectedCourts.length !== 1 ? 's' : ''} selected
                        </p>
                        <p className="text-sm md:text-base opacity-70 mt-1 uppercase tracking-wider">
                            {selectedSlot || 'SELECT SLOT'} &bull; {duration} HR
                        </p>
                    </div>
                    <button
                        onClick={handlePlayBooking}
                        className="h-[56px] md:h-[64px] px-8 md:px-12 bg-white text-black rounded-lg text-xl md:text-2xl font-semibold uppercase transition-all active:scale-[0.98]"
                        style={{ fontFamily: 'var(--font-anek-tamil)' }}
                    >
                        BOOK SLOTS
                    </button>
                </div>
            </div>
        );
    }

    // ── DINING CHECKOUT VIEW ──
    if (bookingType === 'dining') {
        const slots = venue?.booking_settings?.time_slots || ['12:00', '13:00', '14:00', '15:00', '19:00', '20:00', '21:00'];
        const lunchSlots = slots.filter((s: string) => parseInt(s.split(':')[0]) < 17);
        const dinnerSlots = slots.filter((s: string) => parseInt(s.split(':')[0]) >= 17);
        const visibleSlots = mealTab === 'lunch' ? lunchSlots : dinnerSlots;

        const formatTime = (t: string) => {
            const [hStr, mStr] = t.split(':');
            let h = parseInt(hStr);
            const ampm = h >= 12 ? 'PM' : 'AM';
            if (h > 12) h -= 12;
            if (h === 0) h = 12;
            return `${h}:${mStr || '00'} ${ampm}`;
        };

        return (
            <div className="h-screen flex flex-col overflow-hidden bg-white">
                <Header />
                <main className="flex-1 overflow-y-auto" style={{ background: 'linear-gradient(180deg, #ECE8FD 0%, #FFFFFF 100%)' }}>
                    <div className="max-w-[1000px] mx-auto bg-white rounded-[30px] my-6 p-6 md:p-10 shadow-sm font-[family-name:var(--font-anek-latin)]">
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-[36px] font-semibold text-black leading-tight">
                                Book a table
                            </h1>
                            <p className="text-lg md:text-xl font-medium text-[#686868]">
                                {venue?.name || "Restaurant Name"}
                            </p>
                        </div>

                        <div className="space-y-10">
                            <section>
                                <h2 className="text-[24px] font-medium text-black mb-3" style={{ fontFamily: 'var(--font-anek-tamil)' }}>
                                    SELECT DATE & TIME
                                </h2>
                                <div className="h-[0.5px] w-full bg-[#AEAEAE] mb-5" />
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    <div className="flex flex-col items-center justify-center min-w-[60px] h-[55px] bg-[#D9D9D9] rounded-xl text-black font-medium text-[12px] flex-shrink-0">
                                        MONTH
                                    </div>
                                    {dates.map((d) => (
                                        <button
                                            key={d.day}
                                            onClick={() => setSelectedDate(d.day)}
                                            className={`flex flex-col items-center justify-center min-w-[60px] h-[55px] rounded-xl transition-all flex-shrink-0 ${selectedDate === d.day ? 'bg-black text-white' : 'bg-white border border-[#686868] text-black'
                                                }`}
                                        >
                                            <span className="text-lg font-semibold leading-none">{d.day}</span>
                                            <span className="text-[12px] mt-1">{d.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h2 className="text-[24px] font-medium text-black mb-3" style={{ fontFamily: 'var(--font-anek-tamil)' }}>
                                    SELECT NUMBER OF GUESTS
                                </h2>
                                <div className="h-[0.5px] w-full bg-[#AEAEAE] mb-5" />
                                <div className="relative max-w-[320px]">
                                    <select
                                        value={selectedGuests}
                                        onChange={(e) => setSelectedGuests(Number(e.target.value))}
                                        className="w-full h-14 pl-5 pr-12 rounded-xl border border-[#686868] text-xl font-medium appearance-none bg-white outline-none cursor-pointer"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map(n => (
                                            <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" size={24} />
                                </div>
                            </section>

                            <section>
                                <h2 className="text-[24px] font-medium text-black mb-3" style={{ fontFamily: 'var(--font-anek-tamil)' }}>
                                    AVAILABLE TIME SLOTS
                                </h2>
                                <div className="h-[0.5px] w-full bg-[#AEAEAE] mb-5" />

                                <div className="flex gap-3 mb-6">
                                    {(['lunch', 'dinner'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setMealTab(tab)}
                                            className={`px-8 h-10 rounded-full text-lg font-medium transition-all ${mealTab === tab ? 'bg-[#D9D9D9] text-black' : 'bg-white border border-[#686868] text-[#686868]'
                                                }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {visibleSlots.length > 0 ? visibleSlots.map((slot: string) => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(formatTime(slot))}
                                            className={`min-w-[130px] h-[66px] flex flex-col items-center justify-center border rounded-xl transition-all ${selectedSlot === formatTime(slot) ? 'bg-[#D9D9D9] border-transparent' : 'bg-white border-[#686868]'
                                                }`}
                                        >
                                            <span className="text-xl md:text-2xl font-medium text-black">{formatTime(slot)}</span>
                                            <span className="text-[12px] text-[#5331EA] font-semibold leading-none mt-1">OFFERS</span>
                                        </button>
                                    )) : (
                                        <p className="text-lg text-zinc-400 font-medium">No {mealTab} slots available for this date.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>

                <div className="h-[100px] md:h-[120px] bg-[#2A2A2A] flex items-center justify-between px-6 md:px-14 flex-shrink-0 text-white">
                    <div>
                        <p className="text-xl md:text-2xl font-semibold">
                            {selectedGuests} {selectedGuests === 1 ? 'Guest' : 'Guests'}
                        </p>
                        <p className="text-sm md:text-base opacity-70 mt-1 uppercase tracking-wider">
                            {selectedSlot || 'SELECT TIME SLOT'} &bull; MAR {selectedDate}
                        </p>
                    </div>
                    <button
                        onClick={handleDiningBooking}
                        className="h-[56px] md:h-[64px] px-8 md:px-12 bg-white text-black rounded-lg text-xl md:text-2xl font-semibold uppercase transition-all active:scale-[0.98]"
                        style={{ fontFamily: 'var(--font-anek-tamil)' }}
                    >
                        BOOK A TABLE
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen pb-[180px]"
            style={{ background: 'linear-gradient(180deg, #ECE8FD 0%, #FFFFFF 100%)' }}
        >
            {/* ── HERO / HEADER ── */}
            <header className="w-full bg-white" style={{ minHeight: '114px' }}>
                <div className="relative mx-auto flex h-[114px] max-w-[1440px] items-center justify-between px-[37px]">
                    {/* Wordmark */}
                    <span
                        className="text-[28px] font-bold tracking-tight select-none"
                        style={{ fontFamily: 'var(--font-anek-latin)', fontWeight: 700 }}
                    >
                        TICPIN
                    </span>

                    {/* Event info — centred absolutely */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p
                            className="text-[30px] font-semibold leading-tight text-black"
                            style={{ fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}
                        >
                            {checkoutData?.name ?? '{EVENT NAME}'}
                        </p>
                        {checkoutData?.date && (
                            <p
                                className="text-[20px] font-medium mt-0.5"
                                style={{ fontFamily: 'var(--font-anek-latin)', color: '#686868', fontWeight: 500 }}
                            >
                                {checkoutData.date}
                                {checkoutData.timeSlot ? ` | ${checkoutData.timeSlot}` : ''}
                            </p>
                        )}
                    </div>

                    {/* Profile circle */}
                    <div
                        className="flex items-center justify-center rounded-full"
                        style={{ width: 51, height: 51, background: '#E1E1E1', flexShrink: 0 }}
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                            />
                            <circle cx="12" cy="7" r="4" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </header>

            {/* ── PAGE CONTENT ── */}
            <div className="mx-auto max-w-[1440px] px-[37px]">
                {/* CHOOSE TICKETS heading */}
                <h2
                    className="mt-[66px] mb-[24px] text-[40px] font-semibold leading-[1] text-black"
                    style={{ fontFamily: 'var(--font-anek-tamil)' }}
                >
                    CHOOSE TICKETS
                </h2>

                {/* ── TICKET CARDS ── */}
                <div className="space-y-5">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="w-full bg-white"
                            style={{
                                border: '0.5px solid #AEAEAE',
                                borderRadius: 15,
                                minHeight: 200,
                            }}
                        >
                            {/* Top row: names + buttons */}
                            <div className="flex items-start justify-between px-[29px] pt-[30px]">
                                {/* Left: phase | category */}
                                <div className="flex items-center gap-0 flex-1 min-w-0">
                                    <span
                                        className="text-[30px] font-semibold text-black leading-tight whitespace-nowrap"
                                        style={{ fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}
                                    >
                                        {ticket.name}
                                    </span>

                                    {ticket.seat_type && (
                                        <>
                                            {/* vertical separator */}
                                            <div
                                                className="mx-[18px] self-stretch"
                                                style={{ width: 2, background: '#000', minHeight: 33, borderRadius: 1 }}
                                            />
                                            <span
                                                className="text-[30px] font-semibold text-black leading-tight whitespace-nowrap"
                                                style={{ fontFamily: 'var(--font-anek-latin)', fontWeight: 600 }}
                                            >
                                                {ticket.seat_type}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Right: ADD btn stacked above qty selector */}
                                <div className="flex flex-col gap-[8px] ml-6 flex-shrink-0">
                                    {/* ADD button (gray) */}
                                    <button
                                        onClick={() => handleQuantityChange(ticket.id, ticket.quantity + 1)}
                                        className="flex items-center justify-center transition-colors"
                                        style={{
                                            width: 108,
                                            height: 47,
                                            background: '#D9D9D9',
                                            borderRadius: 7,
                                            fontFamily: 'var(--font-anek-tamil)',
                                            fontSize: 35,
                                            fontWeight: 500,
                                            color: '#000',
                                            lineHeight: 1,
                                        }}
                                    >
                                        ADD
                                    </button>

                                    {/* Quantity selector (black) */}
                                    <div
                                        className="flex items-center justify-between"
                                        style={{
                                            width: 108,
                                            height: 47,
                                            background: '#000',
                                            borderRadius: 7,
                                            padding: '0 6px',
                                        }}
                                    >
                                        <button
                                            onClick={() => handleQuantityChange(ticket.id, ticket.quantity - 1)}
                                            className="flex items-center justify-center"
                                            style={{
                                                fontFamily: 'var(--font-anek-tamil)',
                                                fontSize: 35,
                                                fontWeight: 500,
                                                color: '#FFFFFF',
                                                lineHeight: 1,
                                                width: 28,
                                                paddingBottom: 2,
                                            }}
                                        >
                                            −
                                        </button>
                                        <span
                                            style={{
                                                fontFamily: 'var(--font-anek-tamil)',
                                                fontSize: 35,
                                                fontWeight: 500,
                                                color: '#FFFFFF',
                                                lineHeight: 1,
                                                minWidth: 20,
                                                textAlign: 'center',
                                            }}
                                        >
                                            {ticket.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(ticket.id, ticket.quantity + 1)}
                                            className="flex items-center justify-center"
                                            style={{
                                                fontFamily: 'var(--font-anek-tamil)',
                                                fontSize: 35,
                                                fontWeight: 500,
                                                color: '#FFFFFF',
                                                lineHeight: 1,
                                                width: 28,
                                                paddingBottom: 2,
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="px-[29px] mt-[12px]">
                                <span
                                    className="text-[40px] font-medium"
                                    style={{ fontFamily: 'var(--font-anek-latin)', color: '#686868', fontWeight: 500, lineHeight: 1.1 }}
                                >
                                    ₹{ticket.price.toLocaleString()}
                                </span>
                            </div>

                            {/* Horizontal divider */}
                            <div
                                className="mx-auto mt-[14px]"
                                style={{ width: 'calc(100% - 58px)', height: 1, background: '#686868', opacity: 0.4 }}
                            />

                            {/* Description bullets */}
                            {ticket.description && ticket.description.length > 0 ? (
                                <div className="px-[29px] pb-[20px] mt-[10px]">
                                    {ticket.description.map((desc, idx) => (
                                        <p
                                            key={idx}
                                            className="text-[15px] font-medium"
                                            style={{ fontFamily: 'var(--font-anek-latin)', color: '#686868', fontWeight: 500, lineHeight: '16px' }}
                                        >
                                            • {desc}
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-[29px] pb-[20px] mt-[10px]">
                                    <p
                                        className="text-[15px] font-medium"
                                        style={{ fontFamily: 'var(--font-anek-latin)', color: '#686868', fontWeight: 500, lineHeight: '16px' }}
                                    >
                                        • This ticket grants entry to one individual only.
                                    </p>
                                    <p
                                        className="text-[15px] font-medium mt-[2px]"
                                        style={{ fontFamily: 'var(--font-anek-latin)', color: '#686868', fontWeight: 500, lineHeight: '16px' }}
                                    >
                                        • This is a standing section.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FIXED BOTTOM BAR ── */}
            <div
                className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-[37px]"
                style={{ height: 180, background: '#2A2A2A' }}
            >
                {/* Left: price + ticket count */}
                <div>
                    <p
                        className="text-[40px] font-medium leading-tight"
                        style={{ fontFamily: 'var(--font-anek-latin)', color: '#FFFFFF', fontWeight: 500 }}
                    >
                        ₹{totalAmount.toLocaleString()}
                    </p>
                    <p
                        className="text-[25px] font-medium mt-1"
                        style={{ fontFamily: 'var(--font-anek-latin)', color: '#FFFFFF', fontWeight: 500 }}
                    >
                        {totalTickets} TICKET{totalTickets !== 1 ? 'S' : ''}
                    </p>
                </div>

                {/* Right: ADD TO CART button */}
                <button
                    onClick={handleAddToCart}
                    disabled={totalTickets === 0}
                    className="flex items-center justify-center transition-opacity disabled:opacity-40"
                    style={{
                        width: 191,
                        height: 73,
                        background: '#FFFFFF',
                        borderRadius: 7,
                        fontFamily: 'var(--font-anek-tamil)',
                        fontSize: 30,
                        fontWeight: 500,
                        color: '#000000',
                        letterSpacing: 0,
                        lineHeight: 1,
                    }}
                >
                    ADD TO CART
                </button>
            </div>
        </div>
    );
}
