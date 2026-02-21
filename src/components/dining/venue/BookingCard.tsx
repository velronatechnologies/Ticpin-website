'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Loader2, Calendar, Users, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';
import { bookingApi } from '@/lib/api';
import AuthModal from '@/components/modals/AuthModal';

interface BookingCardProps {
    venue: any;
}

export default function BookingCard({ venue }: BookingCardProps) {
    const { isLoggedIn, userId } = useStore();
    const { addToast } = useToast();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedGuests, setSelectedGuests] = useState('2');
    const [selectedTime, setSelectedTime] = useState('');

    // Generate next 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            value: d.toISOString().split('T')[0],
            label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
        };
    });

    // Default time slots
    const defaultTimeSlots = ["12:00 PM", "01:00 PM", "02:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"];
    const timeSlots = venue?.booking_settings?.time_slots || defaultTimeSlots;

    useEffect(() => {
        if (dates.length > 0) setSelectedDate(dates[0].value);
        if (timeSlots.length > 0) setSelectedTime(timeSlots[0]);
    }, [venue]);

    const handleBook = async () => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const bookingData = {
                restaurant_id: venue.id,
                restaurant_name: venue.name,
                date: selectedDate,
                time_slot: selectedTime,
                guest_count: parseInt(selectedGuests),
                guest_name: userId || "Guest User",
                special_request: ""
            };

            const response = await bookingApi.createDiningBooking(bookingData);
            if (response.success) {
                addToast(`Table reserved successfully!`, 'success');
            } else {
                addToast(response.message || "Failed to reserve table", 'error');
            }
        } catch (error) {
            addToast("An error occurred. Please try again.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full md:w-[392px] h-auto bg-white border border-[#d9d9d9] rounded-[24px] shadow-sm p-[24px] flex flex-col overflow-visible">
            {/* Title */}
            <h3 className="text-[32px] font-medium text-black leading-normal tracking-tight mb-6">Book a table</h3>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-x-4 mb-4">
                {/* Date Input */}
                <div className="space-y-1">
                    <label className="text-[20px] font-medium text-[#666666]/80 leading-none block">Date</label>
                    <div className="relative">
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full h-[40px] px-3 bg-white rounded-[12px] border border-[#d9d9d9] text-[15px] text-zinc-900 font-medium appearance-none cursor-pointer focus:outline-none"
                        >
                            {dates.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-900 pointer-events-none" />
                    </div>
                </div>

                {/* Guests Input */}
                <div className="space-y-1">
                    <label className="text-[20px] font-medium text-[#666666]/80 leading-none block">Guests</label>
                    <div className="relative">
                        <select
                            value={selectedGuests}
                            onChange={(e) => setSelectedGuests(e.target.value)}
                            className="w-full h-[40px] px-3 bg-white rounded-[12px] border border-[#d9d9d9] text-[15px] text-zinc-900 font-medium appearance-none cursor-pointer focus:outline-none"
                        >
                            {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                                <option key={n} value={n}>{n} guests</option>
                            ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-900 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
                <button
                    onClick={handleBook}
                    disabled={isSubmitting}
                    className="w-full h-[48px] bg-black text-white rounded-[12px] text-[18px] font-semibold flex items-center justify-center active:scale-[0.98] disabled:bg-zinc-800"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        'Book a table'
                    )}
                </button>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
}