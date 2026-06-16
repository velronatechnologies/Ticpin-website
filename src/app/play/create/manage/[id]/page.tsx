'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Info, PlusCircle, Trash2, ChevronDown, Clock, Wallet } from 'lucide-react';
import { playApi } from '@/lib/api/play';
import { toast } from '@/components/ui/Toast';

const ManageVenuePage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [venue, setVenue] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [venueFormat, setVenueFormat] = useState('Fixed schedule');
    
    // Fixed Schedule State
    const [timeHour, setTimeHour] = useState('09');
    const [timeMinute, setTimeMinute] = useState('00');
    const [timePeriod, setTimePeriod] = useState('AM');
    const [closeHour, setCloseHour] = useState('10');
    const [closeMinute, setCloseMinute] = useState('00');
    const [closePeriod, setClosePeriod] = useState('PM');
    const [minBookingDuration, setMinBookingDuration] = useState('60');
    const [pricePerSlot, setPricePerSlot] = useState('');

    // Custom Availability State
    const [customSlots, setCustomSlots] = useState<any[]>([]);
    const [newSlot, setNewSlot] = useState({ 
        day: '', 
        openHour: '09', 
        openMinute: '00', 
        openPeriod: 'AM', 
        closeHour: '10', 
        closeMinute: '00', 
        closePeriod: 'PM',
        minBookingDuration: '60',
        pricePerSlot: ''
    });

    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        const fetchVenue = async () => {
            try {
                const data = await playApi.getByID(id);
                setVenue(data);
                if (data.venue_format) setVenueFormat(String(data.venue_format));
            } catch (err) {
                toast.error('Failed to load venue details');
                router.push('/organizer/dashboard?category=play');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchVenue();
    }, [id, router]);

    const handleAddCustomSlot = () => {
        if (!newSlot.day || !newSlot.pricePerSlot) {
            toast.warning('Please fill all slot details');
            return;
        }
        setCustomSlots([...customSlots, newSlot]);
        setNewSlot({ 
            day: '', 
            openHour: '09', 
            openMinute: '00', 
            openPeriod: 'AM', 
            closeHour: '10', 
            closeMinute: '00', 
            closePeriod: 'PM',
            minBookingDuration: '60',
            pricePerSlot: ''
        });
    };

    const removeCustomSlot = (idx: number) => {
        setCustomSlots(customSlots.filter((_, i) => i !== idx));
    };

    const calculatePayout = (price: string) => {
        const p = parseFloat(price);
        if (isNaN(p)) return '0.00';
        // Simulating some platform fee (e.g. 5%)
        return (p * 0.95).toFixed(2);
    };

    const handleSubmit = async () => {
        setSubmitLoading(true);
        try {
            const payload: any = {
                venue_format: venueFormat,
                status: 'pending' // Or 'review' if that's the next step
            };

            if (venueFormat === 'Fixed schedule') {
                payload.openingTime = `${timeHour}:${timeMinute} ${timePeriod}`;
                payload.closingTime = `${closeHour}:${closeMinute} ${closePeriod}`;
                payload.time = `${payload.openingTime} - ${payload.closingTime}`;
                payload.priceStartsFrom = parseFloat(pricePerSlot) || 0;
                // You might want to update the first court's price or similar based on backend logic
            } else {
                // Custom slots handling - might need backend support for slot-specific pricing
                payload.custom_slots = customSlots;
                if (customSlots.length > 0) {
                    payload.priceStartsFrom = Math.min(...customSlots.map(s => parseFloat(s.pricePerSlot) || 999999));
                }
            }

            await playApi.update(id, payload);
            toast.success('Venue configuration saved! Submitted for review.');
            router.push('/organizer/dashboard?category=play');
        } catch (err: any) {
            toast.error(err.message || 'Update failed');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white overflow-x-hidden">
            <div className="w-full" style={{ zoom: '0.70' }}>
                <div className="max-w-[1920px] mx-auto px-10 pt-20">
                    {/* Header */}
                    <div className="mb-12 flex items-center gap-4">
                        <button onClick={() => router.back()} className="hover:bg-black/5 p-2 rounded-full transition-colors">
                            <ChevronLeft size={40} />
                        </button>
                        <div>
                            <h1 className="text-[40px] font-medium leading-[44px] text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Manage your venue
                            </h1>
                            <p className="text-[25px] font-medium leading-[28px] text-[#686868] mt-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                {venue?.name || 'Loading venue...'}
                            </p>
                        </div>
                    </div>
                    <div className="w-[1800px] h-[1.5px] bg-gray-400 mt-[-20px] ml-[25px] mb-12"></div>

                    <div className="max-w-[1400px] mx-auto space-y-12 pb-24">
                        {/* Format Selection */}
                        <section className="bg-white rounded-[15px] p-10 border border-white">
                            <h2 className="text-[30px] font-medium text-black mb-6">Choose the format *</h2>
                            <div className="flex gap-8">
                                {[
                                    { id: 'Fixed schedule', label: 'Fixed schedule', desc: 'Set a standard opening and closing time for your venue every day.' },
                                    { id: 'Custom availability', label: 'Custom availability', desc: 'Define unique slots and pricing for different days or times.' }
                                ].map((format) => (
                                    <div 
                                        key={format.id}
                                        onClick={() => setVenueFormat(format.id)}
                                        className={`flex-1 p-8 rounded-[20px] border-2 cursor-pointer transition-all ${venueFormat === format.id ? 'border-[#E7C200] bg-yellow-50/30' : 'border-[#AEAEAE] hover:border-[#E7C200]/50'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[25px] font-bold text-black">{format.label}</span>
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${venueFormat === format.id ? 'border-[#E7C200] bg-[#E7C200]' : 'border-[#AEAEAE]'}`}>
                                                {venueFormat === format.id && <div className="w-3 h-3 bg-white rounded-full" />}
                                            </div>
                                        </div>
                                        <p className="text-[18px] text-[#686868] leading-tight">{format.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Timing Section */}
                        <section className="bg-white rounded-[15px] p-10 border border-white space-y-10">
                            <h2 className="text-[30px] font-medium text-black">Set your time slots</h2>
                            
                            {venueFormat === 'Fixed schedule' ? (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-2 gap-20">
                                        {/* Opening Time */}
                                        <div className="space-y-4">
                                            <label className="text-[22px] font-medium text-black flex items-center gap-2">
                                                <Clock size={24} className="text-[#E7C200]" /> Opening time
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1 border border-[#686868] rounded-[10px] h-[70px] flex items-center px-4">
                                                    <select value={timeHour} onChange={e => setTimeHour(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px] text-black">
                                                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                                                    </select>
                                                    <ChevronDown size={24} className="absolute right-4 pointer-events-none" />
                                                </div>
                                                <span className="text-[30px] font-bold">:</span>
                                                <div className="relative flex-1 border border-[#686868] rounded-[10px] h-[70px] flex items-center px-4">
                                                    <select value={timeMinute} onChange={e => setTimeMinute(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px] text-black">
                                                        {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <ChevronDown size={24} className="absolute right-4 pointer-events-none" />
                                                </div>
                                                <div className="flex border border-[#686868] rounded-[10px] h-[70px] overflow-hidden">
                                                    {['AM', 'PM'].map(p => (
                                                        <button key={p} onClick={() => setTimePeriod(p)} className={`w-[80px] text-[22px] font-bold ${timePeriod === p ? 'bg-[#FFFCED] text-black' : 'text-[#AEAEAE]'}`}>{p}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Closing Time */}
                                        <div className="space-y-4">
                                            <label className="text-[22px] font-medium text-black flex items-center gap-2">
                                                <Clock size={24} className="text-[#E7C200]" /> Closing time
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1 border border-[#686868] rounded-[10px] h-[70px] flex items-center px-4">
                                                    <select value={closeHour} onChange={e => setCloseHour(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px] text-black">
                                                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                                                    </select>
                                                    <ChevronDown size={24} className="absolute right-4 pointer-events-none" />
                                                </div>
                                                <span className="text-[30px] font-bold">:</span>
                                                <div className="relative flex-1 border border-[#686868] rounded-[10px] h-[70px] flex items-center px-4">
                                                    <select value={closeMinute} onChange={e => setCloseMinute(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px] text-black">
                                                        {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <ChevronDown size={24} className="absolute right-4 pointer-events-none" />
                                                </div>
                                                <div className="flex border border-[#686868] rounded-[10px] h-[70px] overflow-hidden">
                                                    {['AM', 'PM'].map(p => (
                                                        <button key={p} onClick={() => setClosePeriod(p)} className={`w-[80px] text-[22px] font-bold ${closePeriod === p ? 'bg-[#FFFCED] text-black' : 'text-[#AEAEAE]'}`}>{p}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <h3 className="text-[25px] font-bold text-black mb-8">Add Slot / Pricing Plan</h3>
                                        <div className="grid grid-cols-2 gap-20">
                                            <div className="space-y-4">
                                                <label className="text-[22px] font-medium text-black">Minimum booking duration (mins)</label>
                                                <div className="relative border border-[#686868] rounded-[10px] h-[70px] flex items-center px-6">
                                                    <select value={minBookingDuration} onChange={e => setMinBookingDuration(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px] text-black">
                                                        <option value="30">30 mins</option>
                                                        <option value="60">60 mins</option>
                                                        <option value="90">90 mins</option>
                                                        <option value="120">120 mins</option>
                                                    </select>
                                                    <ChevronDown size={24} className="absolute right-6 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[22px] font-medium text-black">Price per slot (₹)</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="border border-[#686868] rounded-[10px] h-[70px] flex items-center px-6">
                                                        <input type="number" value={pricePerSlot} onChange={e => setPricePerSlot(e.target.value)} placeholder="0.00" className="w-full bg-transparent outline-none text-[25px] text-black" />
                                                    </div>
                                                    <div className="bg-[#F5F5F5] rounded-[10px] h-[70px] flex flex-col justify-center px-6">
                                                        <span className="text-[14px] text-[#686868]">Payout [AFTER CHARGES]</span>
                                                        <span className="text-[20px] font-bold text-black">₹ {calculatePayout(pricePerSlot)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[20px] font-medium text-black">Select day</label>
                                            <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-4">
                                                <select value={newSlot.day} onChange={e => setNewSlot({...newSlot, day: e.target.value})} className="w-full appearance-none bg-transparent outline-none text-[20px]">
                                                    <option value="">Select day</option>
                                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                                <ChevronDown size={20} className="absolute right-4 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[20px] font-medium text-black">Opening time</label>
                                            <div className="flex gap-2">
                                                <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex-1 flex items-center px-4">
                                                    <select value={newSlot.openHour} onChange={e => setNewSlot({...newSlot, openHour: e.target.value})} className="w-full appearance-none bg-transparent outline-none text-[20px]">
                                                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex border border-[#686868] rounded-[10px] h-[64px] overflow-hidden">
                                                    {['AM', 'PM'].map(p => (
                                                        <button key={p} onClick={() => setNewSlot({...newSlot, openPeriod: p})} className={`w-[50px] text-[16px] font-bold ${newSlot.openPeriod === p ? 'bg-[#FFFCED]' : ''}`}>{p}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[20px] font-medium text-black">Closing time</label>
                                            <div className="flex gap-2">
                                                <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex-1 flex items-center px-4">
                                                    <select value={newSlot.closeHour} onChange={e => setNewSlot({...newSlot, closeHour: e.target.value})} className="w-full appearance-none bg-transparent outline-none text-[20px]">
                                                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex border border-[#686868] rounded-[10px] h-[64px] overflow-hidden">
                                                    {['AM', 'PM'].map(p => (
                                                        <button key={p} onClick={() => setNewSlot({...newSlot, closePeriod: p})} className={`w-[50px] text-[16px] font-bold ${newSlot.closePeriod === p ? 'bg-[#FFFCED]' : ''}`}>{p}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-20">
                                        <div className="space-y-4">
                                            <label className="text-[22px] font-medium text-black">Minimum booking duration (mins)</label>
                                            <div className="relative border border-[#686868] rounded-[10px] h-[70px] flex items-center px-6">
                                                <select value={newSlot.minBookingDuration} onChange={e => setNewSlot({...newSlot, minBookingDuration: e.target.value})} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                    <option value="30">30 mins</option>
                                                    <option value="60">60 mins</option>
                                                </select>
                                                <ChevronDown size={24} className="absolute right-6 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[22px] font-medium text-black">Price per slot (₹)</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="border border-[#686868] rounded-[10px] h-[70px] flex items-center px-6">
                                                    <input type="number" value={newSlot.pricePerSlot} onChange={e => setNewSlot({...newSlot, pricePerSlot: e.target.value})} placeholder="0.00" className="w-full bg-transparent outline-none text-[25px]" />
                                                </div>
                                                <div className="bg-[#F5F5F5] rounded-[10px] h-[70px] flex flex-col justify-center px-6">
                                                    <span className="text-[14px] text-[#686868]">Payout [AFTER CHARGES]</span>
                                                    <span className="text-[20px] font-bold text-black">₹ {calculatePayout(newSlot.pricePerSlot)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <button 
                                            onClick={handleAddCustomSlot}
                                            className="bg-black text-white h-[60px] px-12 rounded-[15px] flex items-center gap-3 active:scale-95 transition-transform"
                                        >
                                            <span className="text-[25px] font-medium">ADD</span>
                                            <PlusCircle size={28} />
                                        </button>
                                    </div>

                                    {customSlots.length > 0 && (
                                        <div className="space-y-4">
                                            {customSlots.map((slot, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-[#F5F5F5] rounded-[15px] p-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[22px] font-bold text-black">{slot.day}</span>
                                                        <span className="text-[18px] text-[#686868]">{slot.openHour}:{slot.openMinute} {slot.openPeriod} - {slot.closeHour}:{slot.closeMinute} {slot.closePeriod}</span>
                                                    </div>
                                                    <div className="flex items-center gap-12">
                                                        <div className="text-right">
                                                            <span className="block text-[14px] text-[#686868]">Price</span>
                                                            <span className="text-[22px] font-bold text-black">₹ {slot.pricePerSlot}</span>
                                                        </div>
                                                        <button onClick={() => removeCustomSlot(idx)} className="text-red-500 hover:text-red-700 transition-colors">
                                                            <Trash2 size={28} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Submit */}
                        <div className="flex flex-col items-center gap-4 pt-10">
                            <div className="bg-[#FFFCED] border border-[#686868]/30 rounded-[10px] p-4 flex items-center gap-3 w-full">
                                <Info size={40} className="text-black/50 shrink-0" />
                                <span className="text-[19px] font-medium text-black">Almost there! Once submitted, our team will review your venue and get it live within 24-48 hours.</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitLoading}
                                className="w-full h-[80px] bg-black text-white rounded-[20px] text-[30px] font-medium active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {submitLoading ? 'Submitting...' : 'Submit for review'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageVenuePage;
