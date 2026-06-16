'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Minus, Plus, ChevronLeft } from 'lucide-react';
import { useUserSession, getUserSession } from '@/lib/auth/user';
import AuthModal from '@/components/modals/AuthModal';
import { toast } from '@/components/ui/Toast';
import { passApi, TicpinPass } from '@/lib/api/pass';
import { Zap } from 'lucide-react';
import { useSlotLock } from '@/hooks/useSlotLock';
import MobileDiningBooking from '@/components/mobile/MobileDiningBooking';


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

const DiningBooking: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const name = params?.name ?? '';

    // Generate next 3 days for date selection
    const getNextDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 2; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push({
                key: date.getDate().toString(),
                label: date.getDate(),
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                fullDate: date
            });
        }
        return days;
    };

    const [venue, setVenue] = useState<RealDining | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'noon' | 'evening' | 'night'>('noon');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const { lockSlot, unlockSlot } = useSlotLock('dining');
    const [selectedOfferType, setSelectedOfferType] = useState<'regular' | 'offers'>('offers');
    const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<any>(getNextDays()[0]);
    const [guests, setGuests] = useState(1);
    const [customGuests, setCustomGuests] = useState('');
    const [showCustomGuest, setShowCustomGuest] = useState(false);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [nextDays] = useState(getNextDays());
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const session = useUserSession();
    const [pass, setPass] = useState<TicpinPass | null>(null);
    const [usePass, setUsePass] = useState(false);

    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (session?.id) {
            passApi.getActivePass(session.id)
                .then(setPass)
                .catch(console.error);
        }
    }, [session?.id]);


    useEffect(() => {
        const activeSession = getUserSession();
        if (!activeSession) {
            setShowAuthModal(true);
        }
        setIsAuthChecking(false);
    }, []);

    const handleAuthModalClose = () => {
        setShowAuthModal(false);
        const activeSession = getUserSession();
        if (!activeSession) {
            router.push(`/dining/venue/${name}`);
        }
    };

    useEffect(() => {
        if (!name || typeof name !== 'string') return;
        fetch(`/backend/api/dining/${encodeURIComponent(name)}`, { credentials: 'include' })
            .then(r => r.json())
            .then((data: RealDining) => {
                setVenue(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [name]);

    useEffect(() => {
        if (!name || typeof name !== 'string') return;
        fetch(`/backend/api/dining/${encodeURIComponent(name)}/offers`, { credentials: 'include' })
            .then(r => r.json())
            .then((data: Offer[]) => {
                const arr = Array.isArray(data) ? data : [];
                setOffers(arr);
                if (arr.length > 0 && !selectedOfferId) {
                    setSelectedOfferId(arr[0].id);
                    setSelectedOfferType('offers');
                } else if (arr.length === 0) {
                    setSelectedOfferType('regular');
                }
            })
            .catch(() => setOffers([]));
    }, [name]);

    const handleGuestChange = (delta: number) => {
        const newGuests = Math.max(1, Math.min(10, guests + delta));
        setGuests(newGuests);
        setShowCustomGuest(false);
        setCustomGuests('');
    };

    const handleCustomGuest = () => {
        const num = parseInt(customGuests);
        if (!isNaN(num) && num >= 1) {
            setGuests(num);
            setShowCustomGuest(false);
            setCustomGuests('');
        }
    };

    const handleBooking = () => {
        if (!session) {
            setShowAuthModal(true);
            return;
        }

        if (!venue || !selectedSlot) {
            toast.warning('Please select a time slot');
            return;
        }

        const cartItem = {
            eventId: venue.id,
            eventName: venue.name,
            city: venue.city || 'Bangalore',
            type: 'dining',
            date: selectedDate.fullDate.toISOString().split('T')[0],
            timeSlot: selectedSlot,
            guests: guests,
            offerId: selectedOfferId,
            offerType: selectedOfferType,
            tickets: [
                {
                    name: `Table Reservation (${guests} Guests)`,
                    price: venue.price_starts_from || 0,
                    quantity: 1
                }
            ],
            totalPrice: (venue.price_starts_from || 0) * guests,
            use_pass: usePass,
            pass_id: pass?.id
        };

        sessionStorage.setItem('dining_cart', JSON.stringify(cartItem));
        router.push(`/dining/venue/${encodeURIComponent(String(name))}/book/review`);
    };

    const handleSlotClick = async (slot: string) => {
        if (!venue) return;
        
        const dateStr = selectedDate.fullDate.toISOString().split('T')[0];
        
        if (selectedSlot === slot) {
            // Deselect
            await unlockSlot(venue.id, dateStr, slot);
            setSelectedSlot(null);
            return;
        }

        if (selectedSlot) {
            await unlockSlot(venue.id, dateStr, selectedSlot);
        }

        try {
            await lockSlot(venue.id, dateStr, slot);
            setSelectedSlot(slot);
        } catch (err: any) {
            toast.error(err.message || 'Slot is currently unavailable');
        }
    };

    if (loading || isAuthChecking || (!session?.id && !getUserSession())) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-[#7B2FF7] border-t-transparent rounded-full animate-spin" />
                <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} />
            </div>
        );
    }

    if (!venue) return <div className="text-center py-20">Restaurant not found</div>;

    if (mounted && isMobile) {
        return (
            <MobileDiningBooking
                venue={venue}
                nextDays={nextDays}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                guests={guests}
                setGuests={setGuests}
                showCustomGuest={showCustomGuest}
                setShowCustomGuest={setShowCustomGuest}
                customGuests={customGuests}
                setCustomGuests={setCustomGuests}
                handleCustomGuest={handleCustomGuest}
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
                selectedSlot={selectedSlot}
                handleSlotClick={handleSlotClick}
                offers={offers}
                selectedOfferId={selectedOfferId}
                setSelectedOfferId={setSelectedOfferId}
                selectedOfferType={selectedOfferType}
                setSelectedOfferType={setSelectedOfferType}
                usePass={usePass}
                setUsePass={setUsePass}
                pass={pass}
                handleBooking={handleBooking}
            />
        );
    }


    const offsetX = 80;
    const offsetY = 180;

    return (
        <div className="w-full flex flex-col items-center bg-[#ECE8FD] min-h-screen py-10 overflow-x-auto">
            <div
                className="relative bg-white rounded-[30px] shadow-[0px_4px_24px_rgba(0,0,0,0.05)] shrink-0 overflow-hidden"
                style={{ width: '1278px', height: '1350px' }}
            >
                <h1
                    className="absolute font-medium text-[40px] leading-[44px] text-black uppercase"
                    style={{ left: `${120 - offsetX}px`, top: `${222 - offsetY}px`, fontFamily: 'var(--font-anek-latin)' }}
                >
                    Book a table
                </h1>

                <p
                    className="absolute font-medium text-[25px] leading-[200%] text-[#686868] uppercase"
                    style={{ left: `${121 - offsetX}px`, top: `${259 - offsetY}px`, fontFamily: 'var(--font-anek-latin)' }}
                >
                    {venue.name}
                </p>

                <h2
                    className="absolute font-anek-condensed font-medium text-[30px] leading-[200%] text-black uppercase"
                    style={{ left: `${121 - offsetX}px`, top: `${317 - offsetY}px` }}
                >
                    SELECT DATE & TIME
                </h2>

                <div
                    className="absolute h-[0px] border-[0.5px] border-[#AEAEAE]"
                    style={{ width: '1050px', left: `${308 - offsetX}px`, top: `${345 - offsetY}px` }}
                />

                <div
                    className="absolute w-[53px] h-[66px] bg-[#D9D9D9] rounded-[15px] flex items-center justify-center"
                    style={{ left: `${134 - offsetX}px`, top: `${386 - offsetY}px` }}
                >
                    <span className="font-anek-condensed font-medium text-[20px] text-black rotate-[-90deg]">{selectedDate.month.toUpperCase()}</span>
                </div>

                {nextDays.map((d, i) => (
                    <div
                        key={d.key}
                        className={`absolute w-[53px] h-[66px] rounded-[15px] flex flex-col items-center justify-center pt-1 cursor-pointer transition-all ${selectedDate.key === d.key ? 'bg-black' : 'bg-white border-[0.5px] border-[#686868]'}`}
                        style={{ left: `${(197 + (i * 63)) - offsetX}px`, top: `${386 - offsetY}px` }}
                        onClick={() => setSelectedDate(d)}
                    >
                        <span className={`font-anek-condensed font-medium text-[30px] leading-none ${selectedDate.key === d.key ? 'text-white' : 'text-black'}`}>{d.label}</span>
                        <span className={`font-medium text-[15px] ${selectedDate.key === d.key ? 'text-white' : 'text-[#686868]'}`} style={{ fontFamily: 'var(--font-anek-latin)' }}>{d.day}</span>
                    </div>
                ))}

                <h2
                    className="absolute font-anek-condensed font-medium text-[30px] leading-[200%] text-black uppercase"
                    style={{ left: `${121 - offsetX}px`, top: `${473 - offsetY}px` }}
                >
                    SELECT NUMBER OF GUESTS
                </h2>

                <div
                    className="absolute h-[0px] border-[0.5px] border-[#AEAEAE]"
                    style={{ width: '989px', left: `${369 - offsetX}px`, top: `${501 - offsetY}px` }}
                />

                <div
                    className="absolute h-[66px] border-[0.5px] border-[#686868] rounded-[15px] bg-white flex items-center px-6 transition-all"
                    style={{ left: `${132 - offsetX}px`, top: `${546 - offsetY}px`, width: showCustomGuest ? '500px' : '396px' }}
                >
                    {!showCustomGuest ? (
                        <select
                            className="w-full h-full bg-transparent appearance-none font-medium text-[25px] text-black outline-none cursor-pointer"
                            style={{ fontFamily: 'var(--font-anek-latin)' }}
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
                    ) : (
                        <div className="flex items-center w-full gap-4">
                            <input
                                type="number"
                                placeholder="Number of guests"
                                className="flex-1 bg-transparent border-none outline-none text-[25px] font-medium"
                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                                value={customGuests}
                                onChange={(e) => setCustomGuests(e.target.value)}
                                min="1"
                                autoFocus
                            />
                            <button
                                onClick={handleCustomGuest}
                                className="bg-black text-white px-4 py-1 rounded-[8px] text-[18px] font-medium"
                            >
                                Set
                            </button>
                            <button
                                onClick={() => setShowCustomGuest(false)}
                                className="text-[#686868] text-[18px]"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <h2
                    className="absolute font-anek-condensed font-medium text-[30px] leading-[200%] text-black uppercase"
                    style={{ left: `${121 - offsetX}px`, top: `${632 - offsetY}px` }}
                >
                    AVAILABLE TIME SLOTS
                </h2>

                <div
                    className="absolute h-[0px] border-[0.5px] border-[#AEAEAE]"
                    style={{ width: '1025px', left: `${333 - offsetX}px`, top: `${661 - offsetY}px` }}
                />

                <div className="absolute flex gap-4" style={{ left: `${121 - offsetX}px`, top: `${701 - offsetY}px` }}>
                    {[
                        { id: 'morning', label: 'Morning', min: 6 * 60, max: 12 * 60 },
                        { id: 'noon', label: 'Noon', min: 12 * 60, max: 17 * 60 },
                        { id: 'evening', label: 'Evening', min: 17 * 60, max: 21 * 60 },
                        { id: 'night', label: 'Night', min: 21 * 60, max: 25 * 60 },
                    ].map((p) => (
                        <div
                            key={p.id}
                            className={`px-6 h-[41px] rounded-[25px] flex items-center justify-center cursor-pointer transition-colors uppercase ${selectedPeriod === p.id ? 'bg-[#D9D9D9]' : 'bg-white border border-[#D9D9D9]'}`}
                            onClick={() => setSelectedPeriod(p.id as any)}
                        >
                            <span className="font-medium text-[20px] text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>{p.label}</span>
                        </div>
                    ))}
                </div>

                {/* Dynamic Slots Grid */}
                <div 
                    className="absolute grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4" 
                    style={{ left: `${121 - offsetX}px`, top: `${766 - offsetY}px`, width: '1050px' }}
                >
                    {(() => {
                        const periods = {
                            morning: { start: 8 * 60, end: 12 * 60 },
                            noon: { start: 12 * 60, end: 16 * 60 },
                            evening: { start: 16 * 60, end: 20 * 60 },
                            night: { start: 20 * 60, end: 23 * 60 + 45 }
                        };
                        const range = periods[selectedPeriod];
                        const slots = [];
                        for (let t = range.start; t <= range.end; t += 15) {
                            const h = Math.floor(t / 60);
                            const m = t % 60;
                            const ampm = h >= 12 ? 'PM' : 'AM';
                            const displayH = h % 12 || 12;
                            const timeStr = `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
                            slots.push(timeStr);
                        }
                        return slots.map(slot => (
                            <TimeSlot 
                                key={slot}
                                time={slot} 
                                active={selectedSlot === slot} 
                                onClick={() => handleSlotClick(slot)} 
                            />
                        ));
                    })()}
                </div>

                <h2
                    className="absolute font-anek-condensed font-medium text-[30px] leading-[200%] text-black uppercase"
                    style={{ left: `${117 - offsetX}px`, top: `${1018 - offsetY}px` }}
                >
                    AVAILABLE OFFERS
                </h2>

                <div
                    className="absolute h-[0px] border-[0.5px] border-[#AEAEAE]"
                    style={{ width: '1062px', left: `${302 - offsetX}px`, top: `${1047 - offsetY}px` }}
                />

                <div className="absolute flex gap-8 items-start" style={{ left: `${117 - offsetX}px`, top: `${1100 - offsetY}px` }}>
                    {/* Offers List */}
                    <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide max-w-[1100px]">
                        {offers.length > 0 ? (
                            offers.map((offer) => (
                                <div
                                    key={offer.id}
                                    className={`w-[477px] h-[254px] border-[0.5px] rounded-[30px] overflow-hidden bg-white cursor-pointer transition-all flex-shrink-0 flex flex-col ${selectedOfferId === offer.id ? 'border-black shadow-lg scale-[1.02]' : 'border-[#686868] shadow-sm'}`}
                                    onClick={() => {
                                        setSelectedOfferId(offer.id);
                                        setSelectedOfferType('offers');
                                    }}
                                >
                                    <div className={`h-[55px] flex items-center justify-between px-8 transition-colors ${selectedOfferId === offer.id ? 'bg-[#AC9BF7]' : 'bg-[#D9D9D9]'}`}>
                                        <span className="font-medium text-[20px] text-black uppercase truncate max-w-[300px]">{offer.title}</span>
                                        <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${selectedOfferId === offer.id ? 'bg-black' : 'bg-transparent'}`}>
                                            {selectedOfferId === offer.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                    <div className="p-6 flex gap-6 h-full items-center">
                                        {offer.image && (
                                            <div className="w-[120px] h-[120px] rounded-[15px] overflow-hidden bg-zinc-100 flex-shrink-0 relative">
                                                <Image src={offer.image} alt={offer.title} fill className="object-cover" />
                                            </div>
                                        )}
                                        <div className="flex flex-col flex-1">
                                            <p className="text-[18px] font-bold text-black uppercase">
                                                {offer.discount_type === 'percent' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                                            </p>
                                            <p className="text-[#686868] text-[15px] mt-2 line-clamp-2 leading-tight">{offer.description || 'Special booking offer available at venue.'}</p>
                                            <p className="text-[12px] text-[#AEAEAE] mt-auto font-medium">VALID UNTIL {new Date(offer.valid_until).toLocaleDateString().toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : null}

                        {/* Regular Booking Option */}
                        <div
                            className={`w-[477px] h-[254px] border-[0.5px] rounded-[30px] overflow-hidden bg-white cursor-pointer transition-all flex-shrink-0 ${selectedOfferType === 'regular' ? 'border-black shadow-lg' : 'border-[#686868] shadow-sm'}`}
                                onClick={() => {
                                    setSelectedOfferType('regular');
                                    setSelectedOfferId(null);
                                }}
                        >
                            <div className={`h-[55px] flex items-center justify-between px-8 transition-colors ${selectedOfferType === 'regular' ? 'bg-[#AC9BF7]' : 'bg-[#D9D9D9]'}`}>
                                <span className="font-medium text-[25px] text-black">Regular Booking</span>
                                <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${selectedOfferType === 'regular' ? 'bg-black' : 'bg-transparent'}`}>
                                    {selectedOfferType === 'regular' && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                            </div>
                            <div className="p-8">
                                <p className="text-[#686868] text-lg leading-tight">Standard table reservation. No special offers included at this time.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ticpass Apply */}
                {pass && pass.benefits.dining_vouchers.remaining > 0 && (
                    <div className="absolute w-[1181px] bg-[#FFF8E6] border border-[#FFD980] rounded-[20px] p-6 flex items-center justify-between"
                         style={{ left: `${130 - offsetX}px`, top: `${1350 - offsetY}px` }}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#F59E0B] rounded-xl flex items-center justify-center text-white">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#92400E]">Ticpin Pass Member</h3>
                                <p className="text-sm text-[#B45309]">Apply your ₹{pass.benefits.dining_vouchers.value_each || 250} dining voucher</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setUsePass(!usePass)}
                            className={`px-8 h-12 rounded-xl font-bold transition-all ${
                                usePass 
                                ? 'bg-[#D97706] text-white' 
                                : 'bg-white text-[#D97706] border border-[#FCD34D] hover:bg-[#FEF3C7]'
                            }`}
                        >
                            {usePass ? 'Voucher Applied' : 'Apply Voucher'}
                        </button>
                    </div>
                )}

                <button
                    className="absolute w-[1181px] h-[60px] bg-black rounded-[15px] flex items-center justify-center hover:opacity-90 active:scale-[0.99] transition-all"
                    style={{ left: `${130 - offsetX}px`, top: `${1440 - offsetY}px` }}
                    onClick={handleBooking}
                >
                    <span className="font-anek-condensed font-medium text-[40px] text-white uppercase transform scale-y-125">BOOK SLOTS</span>
                </button>
            </div>

            {/* Bottom Offers Info (Only if offers exist and none selected yet, or just as info) */}
            {offers.length > 0 && (
                <div className="w-full max-w-[1278px] mt-8 bg-white rounded-[20px] p-8 space-y-4 shadow-[0px_4px_24px_rgba(0,0,0,0.05)]">
                    <h2 className="text-[24px] font-semibold text-black uppercase" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                        Featured Offers
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {offers.map((offer, idx) => (
                            <div key={idx} className={`flex items-center gap-4 p-4 border rounded-[15px] transition-all ${selectedOfferId === offer.id ? 'bg-[#F5F3FF] border-[#7B2FF7]' : 'bg-white border-[#E5E5E5]'}`}>
                                {offer.image && (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                                        <Image src={offer.image} alt={offer.title} fill className="object-cover" />
                                    </div>
                                )}
                                <div className="flex-grow">
                                    <p className="text-[16px] font-semibold text-black uppercase">{offer.title}</p>
                                    <p className="text-[13px] text-[#686868]">
                                        {offer.discount_type === 'percent' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedOfferId(offer.id);
                                        setSelectedOfferType('offers');
                                        window.scrollTo({ top: 1000, behavior: 'smooth' });
                                    }}
                                    className={`px-6 py-2 rounded-lg font-bold text-[12px] uppercase transition-all ${selectedOfferId === offer.id ? 'bg-[#7B2FF7] text-white' : 'bg-zinc-100 text-black'}`}
                                >
                                    {selectedOfferId === offer.id ? 'SELECTED' : 'SELECT'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AuthModal
                isOpen={showAuthModal}
                onClose={handleAuthModalClose}
                onSuccess={() => {
                    setShowAuthModal(false);
                    handleBooking();
                }}
            />
        </div>
    );
};

const TimeSlot = ({ time, active = false, onClick }: { time: string, active?: boolean, onClick?: () => void }) => (
    <div
        className={`w-full h-[66px] rounded-[15px] border-[0.5px] flex flex-col items-center justify-center cursor-pointer transition-all ${active ? 'bg-black text-white border-transparent shadow-md scale-[1.02]' : 'border-[#686868] bg-white hover:border-black'}`}
        onClick={onClick}
    >
        <span className={`font-anek-condensed font-medium text-[22px] leading-none ${active ? 'text-white' : 'text-black'}`}>{time}</span>
    </div>
);

export default DiningBooking;