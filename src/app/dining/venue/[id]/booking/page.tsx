'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, ChevronDown } from 'lucide-react';
import { diningApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';

export default function DiningBookingPage() {
    const router = useRouter();
    const params = useParams();
    const venueId = params.id as string;
    const { setCheckoutData, isLoggedIn, location: storeLocation } = useStore();
    const { addToast } = useToast();

    const [venue, setVenue] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Generate next 14 days
    const dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateNum = d.getDate();
        return {
            value: d.toISOString().split('T')[0],
            day: dayName,
            date: dateNum,
        };
    });

    const [selectedDate, setSelectedDate] = useState(dates[0].value);
    const [selectedGuests, setSelectedGuests] = useState(2);
    const [selectedTime, setSelectedTime] = useState('');
    const [mealTab, setMealTab] = useState<'lunch' | 'dinner'>('lunch');
    const [selectedOffer, setSelectedOffer] = useState<number | null>(0);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        const fetchVenue = async () => {
            setIsLoading(true);
            try {
                const response = await diningApi.getById(venueId);
                if (response.success && response.data) {
                    setVenue(response.data);
                    const slots = response.data?.booking_settings?.time_slots || [];
                    if (slots.length > 0) setSelectedTime(slots[0]);
                }
            } catch {
                addToast('Failed to load venue', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        if (venueId) fetchVenue();
    }, [venueId]);

    const allTimeSlots: string[] = venue?.booking_settings?.time_slots || [
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '19:00', '20:00', '21:00', '22:00'
    ];

    const lunchSlots = allTimeSlots.filter(t => {
        const h = parseInt(t.split(':')[0]);
        return h >= 11 && h < 16;
    });
    const dinnerSlots = allTimeSlots.filter(t => {
        const h = parseInt(t.split(':')[0]);
        return h >= 16;
    });

    const visibleSlots = mealTab === 'lunch' ? lunchSlots : dinnerSlots;
    const displayedSlots = showMore ? visibleSlots : visibleSlots.slice(0, 8);

    const formatTime = (t: string) => {
        const [hStr, mStr] = t.split(':');
        let h = parseInt(hStr);
        const m = mStr || '00';
        const ampm = h >= 12 ? 'PM' : 'AM';
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return `${h}:${m} ${ampm}`;
    };

    const offers: any[] = venue?.offers || [];
    // Always show "Regular Table Reservation" as last tab
    const offerTabs = [
        ...offers,
        { title: 'Regular Table Reservation', code: '', description: 'No cover charge required', offer_image: '', _isRegular: true }
    ];

    const handleBookSlots = () => {
        if (!isLoggedIn) {
            addToast('Please log in to book', 'error');
            return;
        }
        if (!selectedTime) {
            addToast('Please select a time slot', 'error');
            return;
        }
        const selectedOfferObj = selectedOffer !== null ? offerTabs[selectedOffer] : null;
        setCheckoutData({
            id: venue.id,
            name: venue.name,
            date: selectedDate,
            timeSlot: selectedTime,
            bookingType: 'dining',
            tickets: [{
                id: 'table',
                name: 'Table Booking',
                price: 0,
                quantity: selectedGuests,
                description: [
                    selectedOfferObj && !selectedOfferObj._isRegular ? `Offer: ${selectedOfferObj.title}` : 'Regular Table Reservation',
                    `Time: ${formatTime(selectedTime)}`,
                    `Date: ${selectedDate}`,
                ],
            }]
        });
        router.push('/checkout/dining/billing');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #ECE8FD 0%, #FFFFFF 100%)' }}>
                <Loader2 className="animate-spin text-purple-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-[160px]" style={{ background: 'linear-gradient(180deg, #ECE8FD 0%, #FFFFFF 100%)' }}>
            {/* Header */}
            <header className="w-full bg-white" style={{ minHeight: '114px' }}>
                <div className="relative mx-auto flex h-[114px] max-w-[1440px] items-center justify-between px-[37px]">
                    {/* TICPIN Wordmark */}
                    <span
                        style={{ fontFamily: 'var(--font-anek-latin)', fontWeight: 700, fontSize: 28 }}
                        className="cursor-pointer select-none"
                        onClick={() => router.push('/')}
                    >
                        TICPIN
                    </span>
                    {/* Location center */}
                    <div className="flex items-center gap-2">
                        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                        <span style={{ fontFamily: 'var(--font-anek-latin)', fontWeight: 500, fontSize: 20, color: '#000' }}>
                            {storeLocation || 'Location'}
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Search icon */}
                        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#E7C200" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        {/* Profile circle */}
                        <div style={{ width: 51, height: 51, background: '#E1E1E1', borderRadius: '50%' }} />
                    </div>
                </div>
            </header>

            {/* Main Card */}
            <div className="mx-auto mt-[76px] px-4" style={{ maxWidth: 1278 }}>
                <div className="bg-white rounded-[30px] px-[80px] py-[42px]" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>

                    {/* Title */}
                    <h1 style={{ fontFamily: 'var(--font-anek-latin)', fontWeight: 500, fontSize: 40, color: '#000', lineHeight: '44px' }}>
                        Book a table
                    </h1>
                    <p style={{ fontFamily: 'var(--font-anek-latin)', fontWeight: 500, fontSize: 25, color: '#686868', marginTop: 4 }}>
                        {venue?.name}
                    </p>

                    {/* Divider */}
                    <div style={{ height: '0.5px', background: '#AEAEAE', margin: '24px 0' }} />

                    {/* SELECT DATE & TIME */}
                    <h2 style={{ fontFamily: 'var(--font-anek-tamil)', fontWeight: 500, fontSize: 30, color: '#000' }}>
                        SELECT DATE &amp; TIME
                    </h2>
                    <div className="flex gap-3 mt-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                        {dates.map(d => {
                            const isSelected = d.value === selectedDate;
                            return (
                                <button
                                    key={d.value}
                                    onClick={() => setSelectedDate(d.value)}
                                    style={{
                                        minWidth: 66,
                                        height: 66,
                                        borderRadius: 15,
                                        background: isSelected ? '#000' : '#FFFFFF',
                                        border: isSelected ? 'none' : '0.5px solid #686868',
                                        flexShrink: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span style={{ fontFamily: 'var(--font-anek-tamil)', fontWeight: 500, fontSize: 14, color: isSelected ? '#fff' : '#686868' }}>
                                        {d.day}
                                    </span>
                                    <span style={{ fontFamily: 'var(--font-anek-tamil)', fontWeight: 500, fontSize: 22, color: isSelected ? '#fff' : '#000', lineHeight: 1.2 }}>
                                        {d.date}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div style={{ height: '0.5px', background: '#AEAEAE', margin: '28px 0' }} />

                    {/* SELECT NUMBER OF GUESTS */}
                    <h2 style={{ fontFamily: 'var(--font-anek-tamil)', fontWeight: 500, fontSize: 30, color: '#000' }}>
                        SELECT NUMBER OF GUESTS
                    </h2>
                    <div className="relative mt-4" style={{ maxWidth: 360 }}>
                        <select
                            value={selectedGuests}
                            onChange={e => setSelectedGuests(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                height: 55,
                                paddingLeft: 20,
                                paddingRight: 44,
                                borderRadius: 11,
                                border: '0.5px solid #686868',
                                fontFamily: 'var(--font-anek-tamil)',
                                fontWeight: 500,
                                fontSize: 22,
                                color: '#000',
                                background: '#fff',
                                appearance: 'none',
                                cursor: 'pointer',
                                outline: 'none',
                            }}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map(n => (
                                <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                            ))}
                        </select>
                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black" />
                    </div>

                    {/* Divider */}
                    <div style={{ height: '0.5px', background: '#AEAEAE', margin: '28px 0' }} />

                    {/* AVAILABLE TIME SLOTS */}
                    <h2 style={{ fontFamily: 'var(--font-anek-tamil)', fontWeight: 500, fontSize: 30, color: '#000' }}>
                        AVAILABLE TIME SLOTS
                    </h2>

                    {/* Lunch / Dinner tabs */}
                    <div className="flex gap-3 mt-4">
                        {(['lunch', 'dinner'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setMealTab(tab); setShowMore(false); }}
                                style={{
                                    height: 41,
                                    paddingInline: 24,
                                    borderRadius: 25,
                                    background: mealTab === tab ? '#D9D9D9' : '#fff',
                                    border: mealTab === tab ? 'none' : '0.5px solid #686868',
                                    fontFamily: 'var(--font-anek-tamil)',
                                    fontWeight: 500,
                                    fontSize: 20,
                                    color: '#000',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Time slot grid */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        {displayedSlots.length === 0 ? (
                            <p style={{ fontFamily: 'var(--font-anek-latin)', color: '#686868', fontSize: 18 }}>
                                No {mealTab} slots available
                            </p>
                        ) : (
                            displayedSlots.map(slot => {
                                const isSelected = slot === selectedTime;
                                return (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedTime(slot)}
                                        style={{
                                            minWidth: 132,
                                            height: 66,
                                            borderRadius: 15,
                                            background: isSelected ? '#D9D9D9' : '#fff',
                                            border: isSelected ? 'none' : '0.5px solid #686868',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <span style={{ fontFamily: 'var(--font-anek-tamil)', fontWeight: 500, fontSize: 24, color: '#000' }}>
                                            {formatTime(slot)}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-anek-tamil)', fontWeight: 500, fontSize: 13, color: '#5331EA', lineHeight: 1 }}>
                                            OFFERS
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {visibleSlots.length > 8 && (
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="flex items-center gap-1 mt-4 mx-auto"
                            style={{ fontFamily: 'var(--font-anek-tamil)', fontWeight: 500, fontSize: 18, color: '#000' }}
                        >
                            {showMore ? 'Show less' : 'View all available slots'}
                            <ChevronDown size={18} style={{ transform: showMore ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                        </button>
                    )}

                    {/* Divider */}
                    <div style={{ height: '0.5px', background: '#AEAEAE', margin: '28px 0' }} />

                    {/* AVAILABLE OFFERS */}
                    <h2 style={{ fontFamily: 'var(--font-anek-tamil)', fontWeight: 500, fontSize: 30, color: '#000' }}>
                        AVAILABLE OFFERS
                    </h2>
                    <p style={{ fontFamily: 'var(--font-anek-latin)', fontWeight: 500, fontSize: 20, color: '#686868', marginTop: 4 }}>
                        Choose one dining offer to continue
                    </p>

                    {/* Offer tabs */}
                    <div className="flex gap-4 mt-6 flex-wrap">
                        {offerTabs.map((offer, idx) => {
                            const isActive = selectedOffer === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedOffer(idx)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: 477,
                                        maxWidth: '100%',
                                        borderRadius: 30,
                                        border: isActive ? 'none' : '0.5px solid #686868',
                                        overflow: 'hidden',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        position: 'relative',
                                    }}
                                >
                                    {/* Tab header */}
                                    <div style={{
                                        height: 55,
                                        background: isActive ? '#AC9BF7' : '#D9D9D9',
                                        borderRadius: '30px 30px 0 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        paddingInline: 28,
                                        justifyContent: 'space-between',
                                    }}>
                                        <span style={{
                                            fontFamily: 'var(--font-anek-latin)',
                                            fontWeight: 500,
                                            fontSize: 22,
                                            color: '#000',
                                        }}>
                                            {offer._isRegular ? 'Regular Table Reservation' : offer.title}
                                        </span>
                                        {/* Radio dot */}
                                        <span style={{
                                            width: 18, height: 18,
                                            borderRadius: '50%',
                                            border: isActive ? '3px solid #5331EA' : '2px solid #fff',
                                            background: isActive ? '#fff' : 'transparent',
                                            display: 'inline-block',
                                            flexShrink: 0,
                                        }} />
                                    </div>

                                    {/* Offer body */}
                                    <div style={{ minHeight: 120, padding: '16px 28px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {offer._isRegular ? (
                                            /* Regular table - show a placeholder dining image */
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 110, height: 98, borderRadius: 12, background: '#F3F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#AC9BF7" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                                                </div>
                                                <p style={{ fontFamily: 'var(--font-anek-latin)', fontSize: 18, color: '#686868', fontWeight: 500 }}>
                                                    No cover charge required
                                                </p>
                                            </div>
                                        ) : offer.offer_image ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
                                                <div style={{ position: 'relative', width: '100%', height: 140, borderRadius: 12, overflow: 'hidden' }}>
                                                    <Image src={offer.offer_image} alt={offer.title} fill style={{ objectFit: 'cover' }} />
                                                </div>
                                                {offer.description && (
                                                    <p style={{ fontFamily: 'var(--font-anek-latin)', fontSize: 18, color: '#686868', fontWeight: 500 }}>
                                                        {offer.description}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            /* Offer without image - show gradient placeholder */
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    width: 288, height: 120, borderRadius: 12,
                                                    background: 'linear-gradient(105.73deg, #866BFF -160.73%, #BDB1F3 93.19%)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <span style={{ fontFamily: 'var(--font-anek-tamil)', fontSize: 24, color: '#fff', fontWeight: 600 }}>
                                                        {offer.code || 'OFFER'}
                                                    </span>
                                                </div>
                                                {offer.description && (
                                                    <p style={{ fontFamily: 'var(--font-anek-latin)', fontSize: 18, color: '#686868', fontWeight: 500 }}>
                                                        {offer.description}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: '#686868', margin: '36px 0 24px' }} />

                </div>
            </div>

            {/* Fixed Bottom Bar */}
            <div
                className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-[60px]"
                style={{ height: 120, background: '#2A2A2A', zIndex: 50 }}
            >
                <div>
                    <p style={{ fontFamily: 'var(--font-anek-latin)', color: '#FFFFFF', fontSize: 30, fontWeight: 600 }}>
                        {selectedGuests} {selectedGuests === 1 ? 'Guest' : 'Guests'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-anek-latin)', color: '#FFFFFF', fontSize: 20, fontWeight: 400, opacity: 0.8 }}>
                        {selectedTime ? formatTime(selectedTime) : 'Select a time slot'} &nbsp;·&nbsp; {selectedDate}
                    </p>
                </div>
                <button
                    onClick={handleBookSlots}
                    style={{
                        width: 191,
                        height: 73,
                        background: '#FFFFFF',
                        borderRadius: 7,
                        fontFamily: 'var(--font-anek-tamil)',
                        fontSize: 30,
                        fontWeight: 500,
                        color: '#000',
                        border: 'none',
                        cursor: 'pointer',
                        letterSpacing: '0.02em',
                    }}
                >
                    BOOK SLOTS
                </button>
            </div>
        </div>
    );
}
