'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Filter, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight, 
    Eye,
    Gamepad2,
    Ticket,
    Utensils,
    Building2,
    ArrowRight,
    MapPin,
    Calendar,
    Search,
    Inbox
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface PayoutRequest {
    organizer_id: string;
    organizer_name: string;
    organizer_email: string;
    status: string;
    totalAmount: number;
    netPayout: number;
    booking_count: number;
    requested_at: string;
}

interface Organizer {
    id: string;
    name: string;
    email: string;
}

interface Item {
    id: string;
    name: string;
}

interface AdminPayoutsClientProps {
    initialPayouts: PayoutRequest[];
    initialTotal: number;
    initialOrganizers: Organizer[];
}

type Step = 'categories' | 'organizers' | 'items' | 'detail';

export default function AdminPayoutsClient({ initialPayouts, initialTotal, initialOrganizers }: AdminPayoutsClientProps) {
    const router = useRouter();
    
    // Step management
    const [step, setStep] = useState<Step>('categories');
    const [selectedCategory, setSelectedCategory] = useState<'play' | 'event' | 'dining'>('play');
    const [selectedOrg, setSelectedOrg] = useState<Organizer | null>(null);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    // Data states
    const [organizers, setOrganizers] = useState<Organizer[]>(initialOrganizers);
    const [items, setItems] = useState<Item[]>([]);
    const [orgPayoutSummary, setOrgPayoutSummary] = useState<PayoutRequest | null>(null);
    const [orgBookings, setOrgBookings] = useState<any[]>([]);
    
    // UI states
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);
    
    // Filters
    const [dateFilter, setDateFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const getID = (id: any): string => {
        if (typeof id === 'string') return id;
        if (id?.$oid) return id.$oid;
        return String(id);
    };

    // Step 2: Fetch all organizers for the category
    const fetchOrganizers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/backend/api/admin/payouts/organizers?vertical=${selectedCategory}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setOrganizers(data.organizers || []);
            }
        } catch (err) {
            console.error('Fetch organizers error:', err);
            // Don't show toast for "not found" unless it's a real 500 error
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Fetch all items for the organizer
    const fetchItems = async (org: Organizer) => {
        setLoading(true);
        setSelectedOrg(org);
        try {
            const res = await fetch(`/backend/api/admin/payouts/items?organizer_id=${getID(org.id)}&category=${selectedCategory}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setStep('items');
            }
        } catch (err) {
            console.error('Fetch items error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Step 4: Fetch bookings for the selected item (and organizer)
    const fetchBookings = async (item: Item | null) => {
        if (!selectedOrg) return;
        setLoading(true);
        setSelectedItem(item);
        try {
            const params = new URLSearchParams();
            params.append('organizer_id', getID(selectedOrg.id));
            if (item) params.append('item_id', item.id);
            params.append('category', selectedCategory);
            params.append('date_filter', dateFilter);
            if (dateFilter === 'custom' && startDate && endDate) {
                params.append('start_date', startDate);
                params.append('end_date', endDate);
            }

            const res = await fetch(`/backend/api/admin/payouts/breakdown?${params.toString()}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setOrgBookings(data.bookings || []);
                
                // Calculate summary from filtered bookings
                const totalAmount = (data.bookings || []).reduce((sum: number, b: any) => sum + (b.grand_total || 0), 0);
                const netPayout = (data.bookings || []).reduce((sum: number, b: any) => sum + (b.net_payout || 0), 0);
                
                setOrgPayoutSummary({
                    organizer_id: getID(selectedOrg.id),
                    organizer_name: selectedOrg.name,
                    organizer_email: selectedOrg.email,
                    status: (data.bookings && data.bookings.length > 0) ? (data.bookings[0].payout_status || 'pending_approval') : 'none',
                    totalAmount,
                    netPayout,
                    booking_count: (data.bookings || []).length,
                    requested_at: ''
                });
                setStep('detail');
            }
        } catch (err) {
            console.error('Fetch bookings error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (step === 'organizers') fetchOrganizers();
    }, [selectedCategory, step]);

    useEffect(() => {
        if (step === 'detail') fetchBookings(selectedItem);
    }, [dateFilter, startDate, endDate]);

    const handleProcessPayout = async (action: 'approve' | 'reject', reason?: string) => {
        if (!selectedOrg) return;
        setProcessing(getID(selectedOrg.id));
        try {
            const res = await fetch('/backend/api/admin/payouts/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    organizer_id: getID(selectedOrg.id),
                    action,
                    reason
                })
            });

            if (res.ok) {
                toast.success(`Payout ${action}ed successfully`);
                setStep('organizers');
                setSelectedOrg(null);
                setSelectedItem(null);
            } else {
                const data = await res.json();
                toast.error(data.error || `Failed to ${action} payout`);
            }
        } catch (err) {
            toast.error(`Error processing payout`);
        } finally {
            setProcessing(null);
        }
    };

    const goBack = () => {
        if (step === 'detail') setStep('items');
        else if (step === 'items') setStep('organizers');
        else if (step === 'organizers') setStep('categories');
        else router.back();
    };

    const filteredOrganizers = (organizers || []).filter(o => 
        o.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        o.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f8f9fa] p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center gap-6 mb-12">
                    <button 
                        onClick={goBack}
                        className="p-4 bg-white rounded-2xl border border-zinc-200 hover:border-black transition-all shadow-sm group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            {selectedCategory === 'play' && <Gamepad2 className="text-emerald-500" size={24} />}
                            {selectedCategory === 'event' && <Ticket className="text-blue-500" size={24} />}
                            {selectedCategory === 'dining' && <Utensils className="text-orange-500" size={24} />}
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                {step === 'categories' ? 'System' : selectedCategory} Payouts
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-black leading-none">
                            {step === 'categories' ? 'Select Category' : 
                             step === 'organizers' ? 'Choose Organizer' :
                             step === 'items' ? 'Select Activity' :
                             'Payout Settlement'}
                        </h1>
                    </div>
                </div>

                {/* Step 1: Categories */}
                {step === 'categories' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { id: 'play', name: 'Play', icon: <Gamepad2 size={44} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { id: 'event', name: 'Events', icon: <Ticket size={44} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { id: 'dining', name: 'Dining', icon: <Utensils size={44} />, color: 'text-orange-600', bg: 'bg-orange-50' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.id as any);
                                    setStep('organizers');
                                }}
                                className="group p-10 rounded-[48px] bg-white border-2 border-transparent hover:border-black transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2 flex flex-col items-center gap-8"
                            >
                                <div className={`w-28 h-28 rounded-[36px] flex items-center justify-center ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                                    {cat.icon}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-3xl font-black text-black mb-2">{cat.name}</h3>
                                    <p className="text-zinc-400 font-bold">Review and settle {cat.id} earnings</p>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                                    <ArrowRight size={24} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 2: Organizers */}
                {step === 'organizers' && (
                    <div className="space-y-6">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Search organizers by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-16 pr-8 py-5 bg-white rounded-3xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black font-bold text-lg shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="h-40 bg-zinc-100 rounded-[40px] animate-pulse" />
                                ))
                            ) : filteredOrganizers.length === 0 ? (
                                <div className="col-span-full py-32 bg-white rounded-[48px] border border-zinc-100 flex flex-col items-center justify-center gap-4">
                                    <div className="p-6 bg-zinc-50 rounded-full text-zinc-300">
                                        <Inbox size={64} />
                                    </div>
                                    <h3 className="text-2xl font-black text-black">No Organizers Found</h3>
                                    <p className="text-zinc-400 font-bold">Try searching for a different name or email</p>
                                </div>
                            ) : (
                                filteredOrganizers.map((org) => (
                                    <button
                                        key={getID(org.id)}
                                        onClick={() => fetchItems(org)}
                                        className="p-8 bg-white rounded-[40px] border border-zinc-200 hover:border-black transition-all shadow-sm flex flex-col gap-6 text-left group"
                                    >
                                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                                            <Building2 size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-black truncate">{org.name}</h3>
                                            <p className="text-zinc-400 font-bold text-sm truncate">{org.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-black font-black text-sm">
                                            View Activities <ArrowRight size={16} />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Items (Venues/Events) */}
                {step === 'items' && (
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm flex items-center gap-6">
                            <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-black">{selectedOrg?.name}</h2>
                                <p className="text-zinc-400 font-bold">{selectedOrg?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* All Items Option */}
                            <button
                                onClick={() => fetchBookings(null)}
                                className="p-8 bg-black text-white rounded-[40px] border-2 border-black hover:shadow-2xl transition-all flex flex-col gap-6 text-left"
                            >
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <Filter size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black truncate">All Activities</h3>
                                    <p className="text-white/60 font-bold text-sm">View all bookings for this organizer</p>
                                </div>
                                <div className="flex items-center gap-2 font-black text-sm">
                                    Continue <ArrowRight size={16} />
                                </div>
                            </button>

                            {items.length === 0 && !loading && (
                                <div className="col-span-1 md:col-span-2 p-8 bg-zinc-50 rounded-[40px] border border-zinc-200 border-dashed flex flex-col items-center justify-center gap-3">
                                    <p className="text-zinc-400 font-black">No specific venues found</p>
                                    <p className="text-zinc-400 text-xs font-bold">Use "All Activities" above</p>
                                </div>
                            )}

                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => fetchBookings(item)}
                                    className="p-8 bg-white rounded-[40px] border border-zinc-200 hover:border-black transition-all shadow-sm flex flex-col gap-6 text-left group"
                                >
                                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                                        <MapPin size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-black truncate">{item.name}</h3>
                                        <p className="text-zinc-400 font-bold text-sm">Specific {selectedCategory} item</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-black font-black text-sm">
                                        View Payouts <ArrowRight size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Final Payout Detail */}
                {step === 'detail' && orgPayoutSummary && (
                    <div className="space-y-8">
                        {/* Summary Header */}
                        <div className="bg-white p-10 rounded-[48px] border border-zinc-200 shadow-sm space-y-10">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center text-black">
                                        {selectedItem ? <MapPin size={32} /> : <Building2 size={32} />}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-black">{selectedItem?.name || selectedOrg?.name}</h3>
                                        <p className="text-zinc-400 font-bold text-lg">{selectedItem ? `Venue of ${selectedOrg?.name}` : 'All Activities'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-center md:text-right">
                                        <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">Bookings</p>
                                        <p className="text-4xl font-black text-black">{orgPayoutSummary.booking_count}</p>
                                    </div>
                                    <div className="h-16 w-[1px] bg-zinc-100" />
                                    <div className="text-center md:text-right">
                                        <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">Settlement</p>
                                        <p className="text-4xl font-black text-[#5331EA]">₹{(orgPayoutSummary.netPayout || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-zinc-100 w-full" />

                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                {/* Time Filters */}
                                <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-2xl">
                                    {['all', 'today', 'week', 'month', 'custom'].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setDateFilter(f)}
                                            className={`px-6 py-3 rounded-xl font-black text-sm capitalize transition-all
                                                ${dateFilter === f ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:text-black'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>

                                {dateFilter === 'custom' && (
                                    <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-2xl">
                                        <input 
                                            type="date" 
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="bg-transparent font-black text-sm px-3 focus:outline-none"
                                        />
                                        <span className="text-zinc-300 font-black">→</span>
                                        <input 
                                            type="date" 
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="bg-transparent font-black text-sm px-3 focus:outline-none"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleProcessPayout('approve')}
                                        disabled={!!processing || orgBookings.length === 0}
                                        className="px-12 py-5 bg-black text-white rounded-full font-black text-xl hover:shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {processing ? 'Processing...' : 'Confirm Payout'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const r = prompt('Reason for rejection?');
                                            if (r) handleProcessPayout('reject', r);
                                        }}
                                        disabled={!!processing || orgBookings.length === 0}
                                        className="px-8 py-5 bg-white text-red-600 border-2 border-red-100 rounded-full font-black text-xl hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Booking List */}
                        <div className="bg-white rounded-[48px] border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="px-10 py-8 border-b border-zinc-100 flex justify-between items-center">
                                <h3 className="font-black text-black uppercase tracking-widest text-sm flex items-center gap-2">
                                    <Calendar size={18} /> Detailed Bookings
                                </h3>
                                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider border border-blue-100">
                                    {orgBookings.length} results
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-zinc-50/50">
                                        <tr>
                                            <th className="px-10 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Booking ID</th>
                                            <th className="px-10 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">User</th>
                                            <th className="px-10 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Grand Total</th>
                                            <th className="px-10 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Net Payout</th>
                                            <th className="px-10 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {orgBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-10 py-32 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-4 text-zinc-400">
                                                        <Inbox size={48} className="text-zinc-200" />
                                                        <p className="text-xl font-black">No Payouts Found</p>
                                                        <p className="text-sm font-bold">There are no bookings pending settlement for this selection.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            orgBookings.map((b) => (
                                                <tr key={b._id} className="hover:bg-zinc-50/50 transition-colors">
                                                    <td className="px-10 py-8 font-black text-black">
                                                        {(b.booking_id || b._id).toString().slice(-8).toUpperCase()}
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="font-bold text-zinc-900">{b.user_name || 'Guest User'}</div>
                                                        <div className="text-xs font-bold text-zinc-400">{new Date(b.booked_at).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right font-bold text-zinc-900">₹{b.grand_total.toLocaleString()}</td>
                                                    <td className="px-10 py-8 text-right font-black text-[#5331EA] text-lg">₹{b.net_payout?.toFixed(2) || '0.00'}</td>
                                                    <td className="px-10 py-8">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                            b.payout_status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                                            b.payout_status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                            {b.payout_status === 'pending_approval' ? 'Pending' : b.payout_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
