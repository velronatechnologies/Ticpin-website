'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, CheckCircle, FileText, Loader2, Sparkles, AlertCircle, 
    Search, Filter, MapPin, DollarSign, ShieldAlert, Check, 
    LayoutDashboard, Ticket, Utensils, Gamepad2 
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';

interface Item {
    id: string;
    name: string;
}

interface Booking {
    id: string;
    booking_id: string;
    user_email: string;
    user_name: string;
    user_phone: string;
    booked_at: string;
    event_name: string;
    ticket_price: number;
    order_amount?: number;
    platform_fee: number;
    cgst: number;
    sgst: number;
    igst: number;
    total_gst: number;
    total_payable: number;
    organizer_state: string;
    status: string;
    receipt_verification_status: string;
}

export default function ReceiptVerificationPage() {
    const [category, setCategory] = useState<'events' | 'dining' | 'play'>('events');
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [stateFilter, setStateFilter] = useState<string>('all');
    const [limitFilter, setLimitFilter] = useState<number>(20);

    // Fetch items when category changes
    useEffect(() => {
        const fetchItems = async () => {
            setLoadingItems(true);
            setSelectedItemId(null);
            setBookings([]);
            setError(null);
            setSearchQuery('');
            setStatusFilter('all');
            setStateFilter('all');
            setLimitFilter(20);
            try {
                const res = await adminApi.getReceiptVerificationItems(category);
                // Ensure item list unique by id to avoid duplicate React key errors
                const uniqueRes = res.filter((item, idx, self) => 
                    self.findIndex(t => t.id === item.id) === idx
                );
                setItems(uniqueRes);
                if (uniqueRes.length > 0) {
                    setSelectedItemId(uniqueRes[0].id);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load items');
            } finally {
                setLoadingItems(false);
            }
        };
        fetchItems();
    }, [category]);

    // Fetch bookings when selected item changes
    useEffect(() => {
        if (!selectedItemId) return;
        const fetchBookings = async () => {
            setLoadingBookings(true);
            setError(null);
            try {
                const res = await adminApi.getReceiptVerificationBookings(category, selectedItemId);
                setBookings(res);
            } catch (err: any) {
                setError(err.message || 'Failed to load bookings');
            } finally {
                setLoadingBookings(false);
            }
        };
        fetchBookings();
    }, [category, selectedItemId]);

    const handleApprove = async (bookingId: string) => {
        setActionLoading(bookingId);
        setError(null);
        setMessage(null);
        try {
            const res = await adminApi.approveReceiptVerification(category, bookingId);
            setMessage(res.message);
            // Refresh bookings to reflect new status
            if (selectedItemId) {
                const resBookings = await adminApi.getReceiptVerificationBookings(category, selectedItemId);
                setBookings(resBookings);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to approve booking');
        } finally {
            setActionLoading(null);
        }
    };

    // Calculate dynamic stats
    const totalBookingsCount = bookings.length;
    const pendingCount = bookings.filter(b => b.receipt_verification_status !== 'approved').length;
    const approvedCount = bookings.filter(b => b.receipt_verification_status === 'approved').length;
    const totalCollectedAmt = bookings
        .filter(b => b.receipt_verification_status === 'approved')
        .reduce((sum, b) => sum + (b.total_payable || 0), 0);

    // Extract unique organizer states from loaded bookings
    const uniqueStates = Array.from(
        new Set(bookings.map(b => b.organizer_state).filter(Boolean))
    );

    // Apply active filter logic client-side
    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch = 
            booking.booking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.user_phone.toLowerCase().includes(searchQuery.toLowerCase());

        const isApproved = booking.receipt_verification_status === 'approved';
        const matchesStatus = 
            statusFilter === 'all' ||
            (statusFilter === 'approved' && isApproved) ||
            (statusFilter === 'pending' && !isApproved);

        const matchesState = 
            stateFilter === 'all' ||
            booking.organizer_state === stateFilter;

        return matchesSearch && matchesStatus && matchesState;
    });

    const displayedBookings = filteredBookings.slice(0, limitFilter);

    const categoryIcons = {
        events: Ticket,
        dining: Utensils,
        play: Gamepad2
    };

    return (
        <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans text-black">
            {/* Sidebar - Left panel */}
            <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col h-full shrink-0">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-zinc-200">
                    <div className="flex items-center gap-2">
                        <Sparkles size={20} className="text-black" />
                        <span className="font-bold text-lg tracking-tight">Tickpin Admin</span>
                    </div>
                </div>

                {/* Navigation links */}
                <div className="px-4 py-4 flex flex-col gap-1 border-b border-zinc-200">
                    <Link 
                        href="/admin" 
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:text-black hover:bg-zinc-50 transition-colors"
                    >
                        <LayoutDashboard size={18} className="text-zinc-500" />
                        <span>Dashboard Home</span>
                    </Link>
                </div>

                {/* Category selectors */}
                <div className="px-4 py-4 border-b border-zinc-200">
                    <p className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Categories</p>
                    <div className="flex flex-col gap-1">
                        {(['events', 'dining', 'play'] as const).map((cat) => {
                            const Icon = categoryIcons[cat];
                            const isActive = category === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                        isActive 
                                            ? 'bg-zinc-100 text-black font-semibold' 
                                            : 'text-zinc-600 hover:text-black hover:bg-zinc-50/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className={isActive ? 'text-black' : 'text-zinc-400'} />
                                        <span className="capitalize">{cat}</span>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Active items / listings list */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    <p className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Active {category}
                    </p>
                    {loadingItems ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-zinc-400" size={24} />
                        </div>
                    ) : items.length === 0 ? (
                        <p className="px-3 text-xs text-zinc-400 italic">
                            No active {category} bookings found.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedItemId(item.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate ${
                                        selectedItemId === item.id
                                            ? 'bg-zinc-100 text-black font-medium'
                                            : 'text-zinc-600 hover:text-black hover:bg-zinc-50/30'
                                    }`}
                                >
                                    {item.name || 'Unnamed Item'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Pane - Right Panel */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Main Content Header */}
                <header className="bg-white border-b border-zinc-200 px-8 py-6 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-black tracking-tight">
                            Receipt Verification Pipeline
                        </h1>
                        <p className="text-xs text-zinc-500 mt-1">
                            Enforces state-accurate GST invoicing upon approval. Item-by-item verification.
                        </p>
                    </div>
                </header>

                {/* Notifications & Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Alerts */}
                    {message && (
                        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-white px-5 py-4 rounded-xl shadow-sm">
                            <CheckCircle className="text-white shrink-0" size={20} />
                            <span className="text-sm font-medium">{message}</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-900 px-5 py-4 rounded-xl shadow-sm">
                            <AlertCircle className="text-red-600 shrink-0" size={20} />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {/* Stats Dashboard Row */}
                    {selectedItemId && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Bookings</p>
                                    <h3 className="text-2xl font-black text-black mt-1">{totalBookingsCount}</h3>
                                </div>
                                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-500 border border-zinc-200">
                                    <FileText size={18} />
                                </div>
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pending Approval</p>
                                    <h3 className="text-2xl font-black text-black mt-1">{pendingCount}</h3>
                                </div>
                                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-500 border border-zinc-200">
                                    <ShieldAlert size={18} />
                                </div>
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Verified & Sent</p>
                                    <h3 className="text-2xl font-black text-black mt-1">{approvedCount}</h3>
                                </div>
                                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-500 border border-zinc-200">
                                    <CheckCircle size={18} />
                                </div>
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Revenue</p>
                                    <h3 className="text-2xl font-black text-black mt-1">₹{totalCollectedAmt.toFixed(2)}</h3>
                                </div>
                                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-500 border border-zinc-200">
                                    <DollarSign size={18} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter and Search Bar */}
                    {selectedItemId && (
                        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                    <Search size={16} />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by ID, name, email or phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 rounded-xl outline-none text-sm text-black font-medium transition-all"
                                />
                            </div>

                            {/* Dropdowns */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Status Filter */}
                                <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-1 bg-white">
                                    <Filter size={12} className="text-zinc-500" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e: any) => setStatusFilter(e.target.value)}
                                        className="bg-transparent text-xs font-semibold text-zinc-700 outline-none cursor-pointer py-1.5 pr-2"
                                    >
                                        <option value="all">All Verification</option>
                                        <option value="pending">Pending Only</option>
                                        <option value="approved">Approved Only</option>
                                    </select>
                                </div>

                                {/* Supply State Filter */}
                                <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-1 bg-white">
                                    <MapPin size={12} className="text-zinc-500" />
                                    <select
                                        value={stateFilter}
                                        onChange={(e) => setStateFilter(e.target.value)}
                                        className="bg-transparent text-xs font-semibold text-zinc-700 outline-none cursor-pointer py-1.5 pr-2"
                                    >
                                        <option value="all">All Supply States</option>
                                        {uniqueStates.map(state => (
                                            <option key={state} value={state}>{state || 'N/A'}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Limit Filter */}
                                <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-1 bg-white">
                                    <Filter size={12} className="text-zinc-500" />
                                    <select
                                        value={limitFilter}
                                        onChange={(e) => setLimitFilter(Number(e.target.value))}
                                        className="bg-transparent text-xs font-semibold text-zinc-700 outline-none cursor-pointer py-1.5 pr-2"
                                    >
                                        <option value={20}>Top 20 Bookings</option>
                                        <option value={40}>Top 40 Bookings</option>
                                        <option value={50}>Top 50 Bookings</option>
                                        <option value={100}>Top 100 Bookings</option>
                                        <option value={300}>Top 300 Bookings</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bookings Area */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-black">
                                Bookings List
                            </h2>
                            {selectedItemId && (
                                <span className="text-xs bg-zinc-100 text-zinc-800 font-semibold px-3 py-1 rounded-full border border-zinc-200">
                                    Showing {Math.min(limitFilter, filteredBookings.length)} of {filteredBookings.length} {filteredBookings.length === 1 ? 'Booking' : 'Bookings'}
                                </span>
                            )}
                        </div>

                        {loadingBookings ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white border border-zinc-200 rounded-2xl">
                                <Loader2 className="animate-spin text-zinc-400 w-8 h-8 mb-4" />
                                <p className="text-zinc-500 text-sm">Loading bookings details...</p>
                            </div>
                        ) : !selectedItemId ? (
                            <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl">
                                <p className="text-zinc-500 text-sm">Please select an item from the left panel to load bookings.</p>
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl">
                                <p className="text-zinc-500 text-sm">No bookings matching selected filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {displayedBookings.map((booking) => {
                                    const isApproved = booking.receipt_verification_status === 'approved';
                                    return (
                                        <div 
                                            key={booking.id}
                                            className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 flex flex-col justify-between gap-6"
                                        >
                                            <div className="space-y-4">
                                                {/* Card Header Info */}
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs text-zinc-400 font-semibold uppercase">
                                                            ID: {booking.booking_id}
                                                        </p>
                                                        <h3 className="font-bold text-base text-black">
                                                            {booking.user_name}
                                                        </h3>
                                                    </div>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                                                        isApproved 
                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                                            : 'bg-amber-50 text-amber-800 border-amber-200'
                                                    }`}>
                                                        {booking.receipt_verification_status || 'Pending'}
                                                    </span>
                                                </div>

                                                <div className="border-t border-zinc-100 pt-3 space-y-2 text-xs text-zinc-600">
                                                    <p><span className="text-zinc-400 font-medium">Email:</span> {booking.user_email}</p>
                                                    <p><span className="text-zinc-400 font-medium">Phone:</span> {booking.user_phone}</p>
                                                    <p><span className="text-zinc-400 font-medium">Date:</span> {new Date(booking.booked_at).toLocaleString()}</p>
                                                    <p className="flex items-center gap-1.5">
                                                        <span className="text-zinc-400 font-medium">Place of Supply:</span> 
                                                        <span className="bg-zinc-100 text-zinc-800 text-[10px] px-2 py-0.5 rounded-md font-bold border border-zinc-200">{booking.organizer_state || 'N/A'}</span>
                                                    </p>
                                                </div>

                                                {/* Pricing / GST Box */}
                                                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2 text-[11px]">
                                                    <div className="flex justify-between text-zinc-800">
                                                        <span>Ticket Price / Order Amt:</span>
                                                        <span className="font-semibold">₹{(booking.ticket_price || booking.order_amount || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-zinc-800">
                                                        <span>Platform Fee (6%):</span>
                                                        <span className="font-semibold">₹{booking.platform_fee?.toFixed(2)}</span>
                                                    </div>
                                                    <div className="border-t border-zinc-200/50 my-1"></div>
                                                    <div className="flex justify-between text-zinc-600">
                                                        <span>CGST (9%):</span>
                                                        <span>₹{booking.cgst?.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-zinc-600">
                                                        <span>SGST (9%):</span>
                                                        <span>₹{booking.sgst?.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-zinc-600">
                                                        <span>IGST (18%):</span>
                                                        <span>₹{booking.igst?.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-zinc-600 font-semibold">
                                                        <span>Total GST:</span>
                                                        <span>₹{booking.total_gst?.toFixed(2)}</span>
                                                    </div>
                                                    <div className="border-t border-zinc-200/50 my-1"></div>
                                                    <div className="flex justify-between text-black font-black text-xs">
                                                        <span>Total Payable:</span>
                                                        <span>₹{booking.total_payable?.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <a 
                                                        href={`/backend/api/admin/receipt-verification/receipt/${category}/${booking.id}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-xs rounded-lg border border-zinc-200 transition-colors"
                                                    >
                                                        <FileText size={13} className="text-zinc-500" />
                                                        Receipt PDF
                                                    </a>
                                                    <a 
                                                        href={`/backend/api/admin/receipt-verification/invoice/${category}/${booking.id}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-xs rounded-lg border border-zinc-200 transition-colors"
                                                    >
                                                        <FileText size={13} className="text-zinc-500" />
                                                        Invoice PDF
                                                    </a>
                                                </div>
                                                
                                                {!isApproved ? (
                                                    <button
                                                        onClick={() => handleApprove(booking.id)}
                                                        disabled={actionLoading !== null}
                                                        className="w-full py-2.5 bg-black hover:bg-zinc-900 disabled:bg-zinc-400 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {actionLoading === booking.id ? (
                                                            <>
                                                                <Loader2 className="animate-spin w-3.5 h-3.5" />
                                                                Processing Approval...
                                                            </>
                                                        ) : (
                                                            'Approve & Send Documents'
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 text-[11px] font-bold">
                                                        <CheckCircle size={14} className="text-zinc-600" />
                                                        Verified & Dispatched
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
