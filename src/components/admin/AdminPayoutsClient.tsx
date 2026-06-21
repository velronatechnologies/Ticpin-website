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
    const [step, setStep] = useState<Step>('organizers');
    const [selectedCategory, setSelectedCategory] = useState<'play' | 'event' | 'dining'>('play');
    const [selectedOrg, setSelectedOrg] = useState<Organizer | null>(null);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

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
                
                // Pre-select all pending bookings
                const pendingBookings = (data.bookings || [])
                    .filter((b: any) => b.payout_status === 'pending_approval' || !b.payout_status)
                    .map((b: any) => b.id);
                setSelectedBookings(pendingBookings);
                
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

    const handleProcessPayout = async (action: 'approve' | 'reject', reason?: string, utr?: string) => {
        if (!selectedOrg) return;
        setProcessing(getID(selectedOrg.id));
        try {
            const res = await fetch('/backend/api/admin/payouts/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    organizer_id: getID(selectedOrg.id),
                    item_id: selectedItem?.id || '',
                    category: selectedCategory,
                    selected_booking_ids: selectedBookings,
                    action,
                    reason,
                    utr_number: utr || ''
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

    const isApprovedOrRejected = orgPayoutSummary?.status === 'approved' || orgPayoutSummary?.status === 'rejected';

    const selectedAmount = orgBookings
        .filter(b => selectedBookings.includes(b.id))
        .reduce((sum, b) => sum + (b.net_payout || 0), 0);

    const toggleBookingSelection = (id: string) => {
        if (selectedBookings.includes(id)) {
            setSelectedBookings(selectedBookings.filter(bId => bId !== id));
        } else {
            setSelectedBookings([...selectedBookings, id]);
        }
    };

    const toggleAllBookings = () => {
        const pendingBookings = orgBookings.filter(b => b.payout_status === 'pending_approval' || !b.payout_status);
        if (selectedBookings.length === pendingBookings.length && pendingBookings.length > 0) {
            setSelectedBookings([]);
        } else {
            setSelectedBookings(pendingBookings.map(b => b.id));
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-[family-name:var(--font-anek-latin)]">
            {/* Header */}
            <header className="w-full h-[75px] bg-white border-b border-[#D9D9D9] flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            if (step === 'detail') setStep('items');
                            else if (step === 'items') setStep('organizers');
                            else router.push('/admin');
                        }} 
                        className="p-2"
                    >
                        <ChevronLeft size={24} className="text-black" />
                    </button>
                    <h1 className="text-[20px] font-semibold text-black">
                        Admin Payouts
                    </h1>
                </div>
                <div className="relative w-[120px] h-[30px]">
                    <img src="/ticpin-logo-black.png" alt="TICPIN" className="object-contain w-full h-full" />
                </div>
            </header>

            {/* Category Tabs */}
            {(step === 'organizers' || step === 'items') && (
                <div className="bg-white border-b border-[#E5E5E5]">
                    <div className="max-w-[1440px] mx-auto flex">
                        {[
                            { id: 'dining', title: 'Dining Payouts', icon: <Utensils size={20} /> },
                            { id: 'event', title: 'Event Payouts', icon: <Ticket size={20} /> },
                            { id: 'play', title: 'Play Payouts', icon: <Gamepad2 size={20} /> },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.id as any);
                                    setSelectedOrg(null);
                                    setStep('organizers');
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 border-b-2 transition-colors ${
                                    selectedCategory === cat.id
                                        ? "border-[#5331EA] text-[#5331EA] bg-[#5331EA]/5"
                                        : "border-transparent text-[#686868] hover:bg-[#F5F5F5]"
                                }`}
                            >
                                {cat.icon}
                                <span className="text-[14px] font-medium">{cat.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-[1440px] mx-auto p-4 pb-20 mt-4">
                {/* Step 2: Organizers */}
                {step === 'organizers' && (
                    <div className="space-y-6">
                        <div className="bg-white border-b border-[#E5E5E5] px-4 py-3 rounded-[16px] flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 w-full max-w-md">
                                <Search className="text-[#686868]" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search organizers by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full text-[14px] bg-transparent focus:outline-none"
                                />
                            </div>
                            <div className="text-[12px] text-[#999]">
                                {filteredOrganizers.length} organizer{filteredOrganizers.length !== 1 ? 's' : ''} found
                            </div>
                        </div>

                        <div className="grid gap-3">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="h-20 bg-white rounded-[16px] border border-[#E5E5E5] animate-pulse" />
                                ))
                            ) : filteredOrganizers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                                    <Inbox size={48} className="text-[#D9D9D9] mb-4" />
                                    <h3 className="text-[18px] text-[#686868]">No Organizers Found</h3>
                                    <p className="text-[14px] text-[#999] mt-2">Try searching for a different name or email</p>
                                </div>
                            ) : (
                                filteredOrganizers.map((org) => (
                                    <div
                                        key={getID(org.id)}
                                        onClick={() => fetchItems(org)}
                                        className="bg-white rounded-[16px] p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow border border-[#E5E5E5]"
                                    >
                                        <div className="w-[50px] h-[50px] bg-[#5331EA]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Building2 size={24} className="text-[#5331EA]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[16px] font-semibold text-black truncate">{org.name}</h3>
                                            <p className="text-[12px] text-[#686868] truncate">{org.email}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="flex items-center gap-1 text-[13px] font-medium text-[#5331EA]">
                                                View Activities <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Items (Venues/Events) */}
                {step === 'items' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-[16px] p-6 border border-[#E5E5E5] flex items-center gap-4 mb-6">
                            <div className="w-[50px] h-[50px] bg-[#5331EA]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <Building2 size={24} className="text-[#5331EA]" />
                            </div>
                            <div>
                                <h2 className="text-[20px] font-semibold text-black">{selectedOrg?.name}</h2>
                                <p className="text-[14px] text-[#686868]">{selectedOrg?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div
                                onClick={() => fetchBookings(null)}
                                className="bg-[#5331EA] text-white rounded-[16px] p-6 border border-[#5331EA] cursor-pointer hover:shadow-lg transition-shadow"
                            >
                                <div className="w-[40px] h-[40px] bg-white/20 rounded-full flex items-center justify-center mb-4">
                                    <Filter size={20} />
                                </div>
                                <h3 className="text-[18px] font-semibold mb-1">All Activities</h3>
                                <p className="text-white/80 text-[13px] mb-4">View all bookings for this organizer</p>
                                <div className="flex items-center gap-1 text-[13px] font-medium">
                                    Continue <ArrowRight size={14} />
                                </div>
                            </div>

                            {items.length === 0 && !loading && (
                                <div className="col-span-1 md:col-span-2 p-6 bg-white rounded-[16px] border border-[#E5E5E5] border-dashed flex flex-col items-center justify-center text-center">
                                    <p className="text-[#686868] font-medium">No specific venues found</p>
                                    <p className="text-[#999] text-[12px] mt-1">Use "All Activities" above</p>
                                </div>
                            )}

                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => fetchBookings(item)}
                                    className="bg-white rounded-[16px] p-6 border border-[#E5E5E5] cursor-pointer hover:border-[#5331EA] hover:shadow-md transition-all"
                                >
                                    <div className="w-[40px] h-[40px] bg-[#5331EA]/10 rounded-full flex items-center justify-center mb-4 text-[#5331EA]">
                                        <MapPin size={20} />
                                    </div>
                                    <h3 className="text-[16px] font-semibold text-black mb-1 truncate">{item.name}</h3>
                                    <p className="text-[#686868] text-[12px] mb-4">Specific {selectedCategory} item</p>
                                    <div className="flex items-center gap-1 text-[13px] font-medium text-[#5331EA]">
                                        View Payouts <ArrowRight size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Final Payout Detail */}
                {step === 'detail' && orgPayoutSummary && (
                    <div className="space-y-6">
                        {/* Summary Header */}
                        <div className="bg-white p-8 rounded-[16px] border border-[#E5E5E5]">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-[60px] h-[60px] bg-[#5331EA]/10 rounded-full flex items-center justify-center text-[#5331EA]">
                                        {selectedItem ? <MapPin size={28} /> : <Building2 size={28} />}
                                    </div>
                                    <div>
                                        <h3 className="text-[24px] font-semibold text-black">{selectedItem?.name || selectedOrg?.name}</h3>
                                        <p className="text-[14px] text-[#686868]">{selectedItem ? `Venue of ${selectedOrg?.name}` : 'All Activities'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-center md:text-right">
                                        <p className="text-[12px] text-[#999] font-medium uppercase mb-1">Selected</p>
                                        <p className="text-[28px] font-bold text-black">{selectedBookings.length} <span className="text-[16px] text-[#999] font-medium">/ {orgBookings.length}</span></p>
                                    </div>
                                    <div className="h-10 w-[1px] bg-[#E5E5E5]" />
                                    <div className="text-center md:text-right">
                                        <p className="text-[12px] text-[#999] font-medium uppercase mb-1">Settlement</p>
                                        <p className="text-[28px] font-bold text-[#5331EA]">₹{selectedAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-[#E5E5E5] w-full mb-8" />

                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                {/* Time Filters */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] text-[#686868] font-medium">Filter by date:</span>
                                    <select
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="px-3 py-1.5 border border-[#E5E5E5] rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#5331EA]"
                                    >
                                        {['all', 'today', 'week', 'month', 'custom'].map((f) => (
                                            <option key={f} value={f}>
                                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {dateFilter === 'custom' && (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="date" 
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="border border-[#E5E5E5] rounded-lg text-[13px] px-3 py-1.5 focus:outline-none focus:border-[#5331EA]"
                                        />
                                        <span className="text-[#999]">→</span>
                                        <input 
                                            type="date" 
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="border border-[#E5E5E5] rounded-lg text-[13px] px-3 py-1.5 focus:outline-none focus:border-[#5331EA]"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            if (selectedBookings.length === 0) return toast.error('Please select at least one booking to settle');
                                            const utr = prompt(`You are about to settle ${selectedBookings.length} bookings. Please enter the Bank UTR ID:`);
                                            if (utr) handleProcessPayout('approve', '', utr);
                                        }}
                                        disabled={!!processing || selectedBookings.length === 0 || orgBookings.length === 0}
                                        className={`px-6 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                                            (orgPayoutSummary.status === 'approved' && selectedBookings.length === 0)
                                                ? 'bg-[#10B981] text-white' 
                                                : 'bg-[#5331EA] text-white hover:bg-[#4529c9]'
                                        } disabled:opacity-50`}
                                    >
                                        {processing ? 'Processing...' : (orgPayoutSummary.status === 'approved' && selectedBookings.length === 0) ? 'Confirmed' : 'Confirm Payout'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedBookings.length === 0) return toast.error('Please select at least one booking to reject');
                                            const r = prompt(`Reason for rejecting ${selectedBookings.length} bookings?`);
                                            if (r) handleProcessPayout('reject', r);
                                        }}
                                        disabled={!!processing || selectedBookings.length === 0 || orgBookings.length === 0}
                                        className={`px-6 py-2.5 rounded-lg text-[14px] font-medium transition-colors border ${
                                            orgPayoutSummary.status === 'rejected'
                                                ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]'
                                                : 'bg-white text-[#DC2626] border-[#DC2626] hover:bg-[#FEF2F2]'
                                        } disabled:opacity-50`}
                                    >
                                        {orgPayoutSummary.status === 'rejected' ? 'Rejected' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Booking List */}
                        <div className="bg-white rounded-[16px] border border-[#E5E5E5] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#E5E5E5] flex justify-between items-center bg-white">
                                <h3 className="font-semibold text-black text-[16px]">Detailed Bookings</h3>
                                <span className="px-3 py-1 bg-[#5331EA]/10 text-[#5331EA] rounded-full text-[12px] font-medium">
                                    {orgBookings.length} results
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F9FAFB]">
                                        <tr>
                                            <th className="px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedBookings.length > 0 && selectedBookings.length === orgBookings.filter(b => b.payout_status === 'pending_approval' || !b.payout_status).length}
                                                    onChange={toggleAllBookings}
                                                    className="w-4 h-4 rounded border-[#D9D9D9] text-[#5331EA] focus:ring-[#5331EA] cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-[12px] font-medium text-[#686868] uppercase">Booking ID</th>
                                            <th className="px-6 py-4 text-[12px] font-medium text-[#686868] uppercase">User</th>
                                            <th className="px-6 py-4 text-[12px] font-medium text-[#686868] uppercase text-right">Grand Total</th>
                                            <th className="px-6 py-4 text-[12px] font-medium text-[#686868] uppercase text-right">Net Payout</th>
                                            <th className="px-6 py-4 text-[12px] font-medium text-[#686868] uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E5E5]">
                                        {orgBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-2 text-[#999]">
                                                        <Inbox size={32} className="text-[#D9D9D9]" />
                                                        <p className="text-[16px] font-medium text-[#686868]">No Payouts Found</p>
                                                        <p className="text-[13px]">There are no bookings pending settlement for this selection.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            orgBookings.map((b) => (
                                                <tr key={b.id} className={`hover:bg-[#F9FAFB] transition-colors ${selectedBookings.includes(b.id) ? 'bg-[#5331EA]/5' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedBookings.includes(b.id)}
                                                            onChange={() => toggleBookingSelection(b.id)}
                                                            disabled={b.payout_status === 'approved' || b.payout_status === 'rejected'}
                                                            className="w-4 h-4 rounded border-[#D9D9D9] text-[#5331EA] focus:ring-[#5331EA] cursor-pointer disabled:opacity-50"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-black text-[14px]">
                                                        {(b.booking_id || b.id).toString().slice(-8).toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-black text-[14px]">{b.user_name || 'Guest User'}</div>
                                                        <div className="text-[12px] text-[#999]">{new Date(b.booked_at).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-black text-[14px]">₹{b.grand_total.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right font-semibold text-[#5331EA] text-[14px]">₹{b.net_payout?.toFixed(2) || '0.00'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                                                            b.payout_status === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
                                                            b.payout_status === 'rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                                                            'bg-[#FEF3C7] text-[#92400E]'
                                                        }`}>
                                                            {b.payout_status === 'pending_approval' ? 'Pending' : (b.payout_status ? b.payout_status.charAt(0).toUpperCase() + b.payout_status.slice(1) : 'Pending')}
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
