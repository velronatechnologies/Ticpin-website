'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    User,
    Link2,
    Check,
    X,
    ChevronDown,
    Contact,
    CreditCard,
    FileSpreadsheet,
    DoorOpen,
    QrCode,
    Edit,
    Trash2,
    Eye
} from 'lucide-react';
import { BookingData } from './types';

interface AttendeesTabProps {
    bookings: BookingData[];
    loadingBookings: boolean;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    handleExportCSV: () => void;
    listingName?: string;
}

interface VerificationLog {
    id: string;
    booking_id: string;
    user_name: string;
    user_email: string;
    booking_category: string;
    gate_entered: string;
    verified_by: string;
    status: string;
    booked_at: string;
    check_in_time_str?: string;
    check_out_time_str?: string;
}

interface UnverifiedBooking {
    booking_id: string;
    user_name: string;
    user_email: string;
    booking_category: string;
    status: string;
}

export default function AttendeesTab({
    bookings: propBookings,
    loadingBookings: propLoadingBookings,
    searchQuery: propSearchQuery,
    setSearchQuery: propSetSearchQuery,
    handleExportCSV: propHandleExportCSV,
    listingName
}: AttendeesTabProps) {
    // URL Context
    const [eventId, setEventId] = useState<string>('');

    // Fetch States
    const [checkedInLogs, setCheckedInLogs] = useState<VerificationLog[]>([]);
    const [unverifiedList, setUnverifiedList] = useState<UnverifiedBooking[]>([]);
    const [totalCheckedIn, setTotalCheckedIn] = useState(0);
    const [mainGateCount, setMainGateCount] = useState(0);
    const [gate2Count, setGate2Count] = useState(0);
    const [vipGateCount, setVipGateCount] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Search & Filter States
    const [searchVal, setSearchVal] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBookingDetails, setSelectedBookingDetails] = useState<VerificationLog | null>(null);

    // Verification modal states
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [inputBookingId, setInputBookingId] = useState('');
    const [verificationFeedback, setVerificationFeedback] = useState<{
        type: 'success' | 'warning' | 'error';
        message: string;
    } | null>(null);

    // Dropdown open states
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Filter Selection States
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedGate, setSelectedGate] = useState('All Gates');
    const [selectedVerifier, setSelectedVerifier] = useState('All Verifiers');
    const [selectedTime, setSelectedTime] = useState('All Time');
    const [selectedAmPm, setSelectedAmPm] = useState('Full Day');

    // Custom filter bounds
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // 12-Hour AM/PM Custom Hour filter states
    const [customStartHour, setCustomStartHour] = useState('06');
    const [customStartMin, setCustomStartMin] = useState('00');
    const [customStartAmPm, setCustomStartAmPm] = useState('AM');

    const [customEndHour, setCustomEndHour] = useState('11');
    const [customEndMin, setCustomEndMin] = useState('00');
    const [customEndAmPm, setCustomEndAmPm] = useState('PM');

    // Helper to compute minutes from midnight for 12-hour AM/PM inputs
    const getMinutesFromMidnight = (hourStr: string, minStr: string, ampm: string): number => {
        let hour = parseInt(hourStr, 10);
        const minutes = parseInt(minStr, 10);

        if (ampm === 'PM' && hour !== 12) {
            hour += 12;
        } else if (ampm === 'AM' && hour === 12) {
            hour = 0;
        }

        return hour * 60 + minutes;
    };

    // Load active event ID from window location search
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setEventId(params.get('id') || '');
        }
    }, []);

    // Main Fetch Function
    const fetchAttendees = useCallback(async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const startMinutes = getMinutesFromMidnight(customStartHour, customStartMin, customStartAmPm);
            const endMinutes = getMinutesFromMidnight(customEndHour, customEndMin, customEndAmPm);

            const isAllCategories = !selectedCategory || selectedCategory.toLowerCase().trim() === 'all' || selectedCategory.toLowerCase().trim() === 'all categories';
            const isAllGates = !selectedGate || selectedGate.toLowerCase().trim() === 'all' || selectedGate.toLowerCase().trim() === 'all gates';
            const isAllVerifiers = !selectedVerifier || selectedVerifier.toLowerCase().trim() === 'all' || selectedVerifier.toLowerCase().trim() === 'all verifiers';

            const queryParams = new URLSearchParams({
                eventId: eventId,
                query: searchVal,
                category: isAllCategories ? '' : selectedCategory,
                gate: isAllGates ? '' : selectedGate,
                verifier: isAllVerifiers ? '' : selectedVerifier,
                datePeriod: selectedTime,
                fromDate: customStartDate,
                toDate: customEndDate,
                timePeriod: selectedAmPm,
                startMinutes: String(startMinutes),
                endMinutes: String(endMinutes),
                page: String(currentPage),
                limit: String(itemsPerPage)
            });

            const res = await fetch(`/backend/api/organizer/overview/attendees?${queryParams.toString()}`);
            if (res.ok) {
                const result = await res.json();
                if (result.success && result.data) {
                    const d = result.data;
                    setCheckedInLogs(d.checkedIn || []);
                    setUnverifiedList(d.unverified || []);
                    setTotalCheckedIn(d.totalCheckedIn || 0);
                    setMainGateCount(d.mainGateCount || 0);
                    setGate2Count(d.gate2Count || 0);
                    setVipGateCount(d.vipGateCount || 0);
                    setTotalRecords(d.totalRecords || 0);
                    setTotalPages(d.totalPages || 1);
                }
            }
        } catch (err) {
            console.error('Error fetching attendees list:', err);
        } finally {
            setLoading(false);
        }
    }, [
        eventId, searchVal, selectedCategory, selectedGate, selectedVerifier,
        selectedTime, customStartDate, customEndDate, selectedAmPm,
        customStartHour, customStartMin, customStartAmPm,
        customEndHour, customEndMin, customEndAmPm,
        itemsPerPage, currentPage
    ]);

    // Triggers when page filters or search criteria change
    useEffect(() => {
        fetchAttendees();
    }, [fetchAttendees]);

    // Reset pagination to page 1 on search or filter change
    const resetPaginationAndFilters = () => {
        setCurrentPage(1);
    };

    // Action: Verify attendee online using the new API
    const handleVerifyAttendee = async () => {
        setVerificationFeedback(null);
        if (!inputBookingId.trim()) {
            setVerificationFeedback({ type: 'error', message: 'Please enter a valid Booking ID.' });
            return;
        }

        const cleanId = inputBookingId.trim().toUpperCase();

        try {
            const res = await fetch('/backend/api/organizer/overview/attendees/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bookingId: cleanId,
                    gate: 'Main Gate'
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setVerificationFeedback({
                    type: 'success',
                    message: `Successfully verified and checked in! Booking ID: ${cleanId}.`
                });
                setInputBookingId('');
                fetchAttendees();
            } else {
                setVerificationFeedback({
                    type: 'error',
                    message: data.error || 'Failed to verify booking ID.'
                });
            }
        } catch (err) {
            setVerificationFeedback({
                type: 'error',
                message: 'Error communicating with backend check-in services.'
            });
        }
    };

    // Export Filtered Checked-In Attendees to CSV
    const localExportCSV = () => {
        if (checkedInLogs.length === 0) return;
        const headers = ['Booking ID', 'Attendee Name', 'Email Address', 'Category', 'Gate Entered', 'Verified By', 'Status', 'Check-In Date/Time'];
        const rows = checkedInLogs.map(b => [
            b.booking_id,
            b.user_name,
            b.user_email,
            b.booking_category,
            b.gate_entered,
            b.verified_by,
            b.status,
            new Date(b.booked_at).toLocaleString()
        ]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `event_check_in_logs.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleDropdown = (dropdown: string) => {
        setActiveDropdown(prev => (prev === dropdown ? null : dropdown));
    };

    const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    const visibleLogs = checkedInLogs;

    return (
        <div className="space-y-6 text-[#1c1525] font-sans pb-6">

            {/* Section 1: Filters & Search Panel */}
            <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] relative z-30 space-y-4">

                {/* Row 1: Title and Main Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-[17px] font-extrabold text-[#1c1525]">Check-In Management</h2>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Attendee Check-In History Directory</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search name, email, booking ID..."
                                value={searchVal}
                                onChange={(e) => {
                                    setSearchVal(e.target.value);
                                    resetPaginationAndFilters();
                                }}
                                className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#AEAEAE] rounded-lg focus:outline-none focus:border-[#5331EA] text-slate-800 placeholder-slate-400 font-semibold"
                            />
                            <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>

                        {/* Verify Attendee Button */}
                        <button
                            onClick={() => {
                                setIsVerifyModalOpen(true);
                                setVerificationFeedback(null);
                                setInputBookingId('');
                            }}
                            className="h-10 px-5 bg-[#5331EA] hover:bg-[#4223ca] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
                        >
                            <QrCode size={14} />
                            <span>Verify Attendee</span>
                        </button>
                    </div>
                </div>

                {/* Row 2: Advanced Custom Multi-Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">

                    {/* 1. Ticket Category Filter */}
                    <div className="relative">
                        <span className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">Ticket Category</span>
                        <button
                            onClick={() => toggleDropdown('category')}
                            className="w-full h-9 px-3 border border-[#AEAEAE] bg-white rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 focus:outline-none"
                        >
                            <span>{selectedCategory}</span>
                            <ChevronDown size={13} className="text-slate-400" />
                        </button>
                        {activeDropdown === 'category' && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#AEAEAE] rounded-lg overflow-hidden z-40 text-xs text-slate-800 shadow-lg">
                                {(() => {
                                    const cats = new Set<string>();
                                    checkedInLogs.forEach(log => {
                                        if (log.booking_category) cats.add(log.booking_category);
                                    });
                                    unverifiedList.forEach(item => {
                                        if (item.booking_category) cats.add(item.booking_category);
                                    });
                                    return ['All Categories', ...Array.from(cats)];
                                })().map(cat => (
                                    <div
                                        key={cat}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setActiveDropdown(null);
                                            resetPaginationAndFilters();
                                        }}
                                        className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer font-semibold"
                                    >
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Gate Filter */}
                    <div className="relative">
                        <span className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">Gate Entry Point</span>
                        <button
                            onClick={() => toggleDropdown('gate')}
                            className="w-full h-9 px-3 border border-[#AEAEAE] bg-white rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 focus:outline-none"
                        >
                            <span>{selectedGate}</span>
                            <ChevronDown size={13} className="text-slate-400" />
                        </button>
                        {activeDropdown === 'gate' && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#AEAEAE] rounded-lg overflow-hidden z-40 text-xs text-slate-800 shadow-lg">
                                {['All Gates', 'Main Gate', 'Gate 1', 'Gate 2', 'VIP Gate'].map(gate => (
                                    <div
                                        key={gate}
                                        onClick={() => {
                                            setSelectedGate(gate);
                                            setActiveDropdown(null);
                                            resetPaginationAndFilters();
                                        }}
                                        className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer font-semibold"
                                    >
                                        {gate}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. Verifier Filter */}
                    <div className="relative">
                        <span className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">Gate Verifier</span>
                        <button
                            onClick={() => toggleDropdown('verifier')}
                            className="w-full h-9 px-3 border border-[#AEAEAE] bg-white rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 focus:outline-none"
                        >
                            <span>{selectedVerifier}</span>
                            <ChevronDown size={13} className="text-slate-400" />
                        </button>
                        {activeDropdown === 'verifier' && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#AEAEAE] rounded-lg overflow-hidden z-40 text-xs text-slate-800 shadow-lg">
                                {['All Verifiers', 'Verifier 1 (Bouncer)', 'Verifier 2 (Staff)', 'Verifier 3', 'Admin Staff'].map(v => (
                                    <div
                                        key={v}
                                        onClick={() => {
                                            setSelectedVerifier(v);
                                            setActiveDropdown(null);
                                            resetPaginationAndFilters();
                                        }}
                                        className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer font-semibold"
                                    >
                                        {v}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 4. Time Range Preset */}
                    <div className="relative">
                        <span className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">Date Range</span>
                        <button
                            onClick={() => toggleDropdown('time')}
                            className="w-full h-9 px-3 border border-[#AEAEAE] bg-white rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 focus:outline-none"
                        >
                            <span>{selectedTime}</span>
                            <ChevronDown size={13} className="text-slate-400" />
                        </button>
                        {activeDropdown === 'time' && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#AEAEAE] rounded-lg overflow-hidden z-40 text-xs text-slate-800 shadow-lg">
                                {['All Time', 'Today', 'Yesterday', 'Last Week', 'Custom Range'].map(t => (
                                    <div
                                        key={t}
                                        onClick={() => {
                                            setSelectedTime(t);
                                            setActiveDropdown(null);
                                            resetPaginationAndFilters();
                                        }}
                                        className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer font-semibold"
                                    >
                                        {t}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 5. AM/PM Session Filter */}
                    <div className="relative">
                        <span className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1">Time of Day (AM/PM)</span>
                        <button
                            onClick={() => toggleDropdown('ampm')}
                            className="w-full h-9 px-3 border border-[#AEAEAE] bg-white rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 focus:outline-none"
                        >
                            <span>{selectedAmPm}</span>
                            <ChevronDown size={13} className="text-slate-400" />
                        </button>
                        {activeDropdown === 'ampm' && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#AEAEAE] rounded-lg overflow-hidden z-40 text-xs text-slate-800 shadow-lg">
                                {['Full Day', 'AM (Before 12 PM)', 'PM (After 12 PM)', 'Custom Time Range'].map(ampmOpt => (
                                    <div
                                        key={ampmOpt}
                                        onClick={() => {
                                            setSelectedAmPm(ampmOpt);
                                            setActiveDropdown(null);
                                            resetPaginationAndFilters();
                                        }}
                                        className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer font-semibold"
                                    >
                                        {ampmOpt}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Row 3: Sub-Row for Custom Range Selection (Dates or Hours) */}
                {(selectedTime === 'Custom Range' || selectedAmPm === 'Custom Time Range') && (
                    <div className="flex flex-wrap items-center gap-6 pt-3.5 border-t border-slate-100 animate-fadeIn">
                        {selectedTime === 'Custom Range' && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">Custom Dates:</span>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => {
                                        setCustomStartDate(e.target.value);
                                        resetPaginationAndFilters();
                                    }}
                                    className="h-9 px-3 text-xs border border-[#AEAEAE] bg-white rounded-lg focus:outline-none text-slate-800 font-bold"
                                />
                                <span className="text-[10px] font-bold text-slate-400 uppercase font-semibold">to</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => {
                                        setCustomEndDate(e.target.value);
                                        resetPaginationAndFilters();
                                    }}
                                    className="h-9 px-3 text-xs border border-[#AEAEAE] bg-white rounded-lg focus:outline-none text-slate-800 font-bold"
                                />
                            </div>
                        )}

                        {selectedAmPm === 'Custom Time Range' && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">Custom Hours Range:</span>

                                {/* Start Time Selects (12 Hour format) */}
                                <div className="flex items-center gap-1 border border-[#AEAEAE] rounded-lg px-2 py-1 bg-white">
                                    <select
                                        value={customStartHour}
                                        onChange={(e) => { setCustomStartHour(e.target.value); resetPaginationAndFilters(); }}
                                        className="text-xs bg-transparent font-bold focus:outline-none text-slate-800 cursor-pointer"
                                    >
                                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-slate-400 font-bold">:</span>
                                    <select
                                        value={customStartMin}
                                        onChange={(e) => { setCustomStartMin(e.target.value); resetPaginationAndFilters(); }}
                                        className="text-xs bg-transparent font-bold focus:outline-none text-slate-800 cursor-pointer"
                                    >
                                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={customStartAmPm}
                                        onChange={(e) => { setCustomStartAmPm(e.target.value); resetPaginationAndFilters(); }}
                                        className="text-xs bg-transparent font-bold focus:outline-none text-[#5331EA] cursor-pointer ml-1"
                                    >
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>

                                <span className="text-[10px] font-bold text-slate-400 uppercase font-semibold">to</span>

                                {/* End Time Selects (12 Hour format) */}
                                <div className="flex items-center gap-1 border border-[#AEAEAE] rounded-lg px-2 py-1 bg-white">
                                    <select
                                        value={customEndHour}
                                        onChange={(e) => { setCustomEndHour(e.target.value); resetPaginationAndFilters(); }}
                                        className="text-xs bg-transparent font-bold focus:outline-none text-slate-800 cursor-pointer"
                                    >
                                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-slate-400 font-bold">:</span>
                                    <select
                                        value={customEndMin}
                                        onChange={(e) => { setCustomEndMin(e.target.value); resetPaginationAndFilters(); }}
                                        className="text-xs bg-transparent font-bold focus:outline-none text-slate-800 cursor-pointer"
                                    >
                                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={customEndAmPm}
                                        onChange={(e) => { setCustomEndAmPm(e.target.value); resetPaginationAndFilters(); }}
                                        className="text-xs bg-transparent font-bold focus:outline-none text-[#5331EA] cursor-pointer ml-1"
                                    >
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Section 2: Stats Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1 */}
                <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#D3CBF5]/30 text-[#5331EA] flex items-center justify-center shrink-0 border border-[#AEAEAE]/60">
                        <Contact size={20} />
                    </div>
                    <div>
                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtered Checked-In</span>
                        <span className="text-xl font-black text-slate-900">{totalCheckedIn}</span>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0AC655] flex items-center justify-center shrink-0 border border-emerald-200">
                        <DoorOpen size={20} />
                    </div>
                    <div>
                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Main Gate</span>
                        <span className="text-xl font-black text-[#0AC655]">{mainGateCount}</span>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#D3CBF5]/20 text-[#5331EA] flex items-center justify-center shrink-0 border border-[#AEAEAE]/60">
                        <DoorOpen size={20} />
                    </div>
                    <div>
                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gate 2</span>
                        <span className="text-xl font-black text-slate-900">{gate2Count}</span>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5331EA] flex items-center justify-center shrink-0 border border-purple-200">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">VIP Gate</span>
                        <span className="text-xl font-black text-[#5331EA]">{vipGateCount}</span>
                    </div>
                </div>
            </div>

            {/* Section 3: Main Attendees List (Data Table) */}
            <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE]">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[15.5px] font-black text-slate-900">Checked-In Attendees Directory</h2>
                        {(selectedCategory !== 'All Categories' || selectedGate !== 'All Gates' || selectedVerifier !== 'All Verifiers' || selectedTime !== 'All Time' || selectedAmPm !== 'Full Day') && (
                            <button
                                onClick={() => {
                                    setSelectedCategory('All Categories');
                                    setSelectedGate('All Gates');
                                    setSelectedVerifier('All Verifiers');
                                    setSelectedTime('All Time');
                                    setSelectedAmPm('Full Day');
                                    setCustomStartDate('');
                                    setCustomEndDate('');
                                    setCustomStartHour('06');
                                    setCustomStartMin('00');
                                    setCustomStartAmPm('AM');
                                    setCustomEndHour('11');
                                    setCustomEndMin('00');
                                    setCustomEndAmPm('PM');
                                    resetPaginationAndFilters();
                                }}
                                className="text-[10px] text-[#5331EA] font-bold hover:underline"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                        {/* In-Table Search Input */}
                        <div className="relative w-48 sm:w-56">
                            <input
                                type="text"
                                placeholder="Search attendees..."
                                value={searchVal}
                                onChange={(e) => {
                                    setSearchVal(e.target.value);
                                    resetPaginationAndFilters();
                                }}
                                className="w-full h-8 pl-8 pr-2.5 text-[11px] bg-slate-50 border border-[#AEAEAE] rounded-lg focus:outline-none focus:border-[#5331EA] text-slate-800 placeholder-slate-400 font-semibold"
                            />
                            <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
                        </div>


                        {/* Load Limit Selectors */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Load Limit:</span>
                            <button
                                onClick={() => {
                                    setItemsPerPage(100);
                                    resetPaginationAndFilters();
                                }}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded border ${
                                    itemsPerPage === 100
                                        ? 'bg-[#5331EA] text-white border-[#5331EA]'
                                        : 'bg-white hover:bg-slate-50 text-slate-600 border-[#AEAEAE]'
                                }`}
                            >
                                100
                            </button>
                            {totalRecords > 500 && (
                                <button
                                    onClick={() => {
                                        setItemsPerPage(500);
                                        resetPaginationAndFilters();
                                    }}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded border ${
                                        itemsPerPage === 500
                                            ? 'bg-[#5331EA] text-white border-[#5331EA]'
                                            : 'bg-white hover:bg-slate-50 text-slate-600 border-[#AEAEAE]'
                                    }`}
                                >
                                    500
                                </button>
                            )}
                        </div>

                        {/* Page-by-page Pagination Controls */}
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={safeCurrentPage === 1 || loading}
                                className="h-8 px-2.5 border border-[#AEAEAE] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-white"
                            >
                                Previous
                            </button>
                            <span className="px-1 text-slate-600 font-semibold">
                                Page <strong className="text-slate-900">{safeCurrentPage}</strong> of <strong className="text-slate-900">{Math.max(totalPages, 1)}</strong> (<strong className="text-slate-900">{visibleLogs.length}</strong> shown, <strong className="text-slate-900">{totalRecords}</strong> total matches)
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.max(totalPages, 1)))}
                                disabled={safeCurrentPage >= Math.max(totalPages, 1) || loading}
                                className="h-8 px-2.5 border border-[#AEAEAE] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-white"
                            >
                                Next
                            </button>
                        </div>

                        <button
                            onClick={localExportCSV}
                            className="h-8 px-3 border border-emerald-200 hover:bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                        >
                            <FileSpreadsheet size={13} />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f8f9fb] border-b border-[#AEAEAE] text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                                <th className="py-3 px-3 rounded-l-md">Name / Booking ID</th>
                                <th className="py-3 px-3">Email</th>
                                <th className="py-3 px-3">Event Name</th>
                                <th className="py-3 px-3">Ticket Category</th>
                                <th className="py-3 px-3">Gate Entered</th>
                                <th className="py-3 px-3">Verified By</th>
                                <th className="py-3 px-3">Check-In Time</th>
                                <th className="py-3 px-3">Check-Out Time</th>
                                <th className="py-3 px-3 text-center">Check-In Status</th>
                                <th className="py-3 px-3 text-center rounded-r-md w-[90px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#AEAEAE] text-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                                        Loading check-in list...
                                    </td>
                                </tr>
                            ) : visibleLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                                        No verified check-ins match the search criteria.
                                    </td>
                                </tr>
                            ) : (
                                visibleLogs.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="py-3 px-3 font-semibold">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-[#D3CBF5] text-[#5331EA] flex items-center justify-center font-bold text-xs shrink-0 border border-white/20">
                                                    {row.user_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-[12.5px] font-bold text-slate-900">{row.user_name}</div>
                                                    <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">ID: {row.booking_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-slate-700">{row.user_email}</td>
                                        <td className="py-3 px-3 font-semibold">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-[7px] text-white font-black shrink-0 border border-[#AEAEAE]">
                                                    TIC
                                                </div>
                                                <span className="text-[12px] font-bold text-slate-800">{listingName || 'Event'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 font-bold text-slate-700">{row.booking_category}</td>
                                        <td className="py-3 px-3 font-bold text-slate-600">
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-[#5331EA]"></span>
                                                {row.gate_entered}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-slate-500 font-semibold">{row.verified_by}</td>
                                        <td className="py-3 px-3 font-bold text-slate-600">
                                            {row.check_in_time_str || '—'}
                                        </td>
                                        <td className="py-3 px-3 font-bold text-slate-600">
                                            {row.check_out_time_str || '—'}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[9.5px] font-bold bg-[#0AC655]/10 text-[#0AC655] border border-[#0AC655]/30">
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => setSelectedBookingDetails(row)}
                                                    className="h-7 px-2.5 border border-[#AEAEAE] bg-white hover:bg-[#5331EA] hover:text-white hover:border-[#5331EA] text-[#5331EA] text-[10.5px] font-bold rounded-lg flex items-center gap-1 transition-all"
                                                    title="View Booking Details"
                                                >
                                                    <Eye size={12} />
                                                    <span>View Booking</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Verify Attendee Modal Overlay */}
            {isVerifyModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-[#AEAEAE] shadow-2xl">
                        {/* Header */}
                        <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center shrink-0">
                            <h3 className="text-sm font-black flex items-center gap-2">
                                <QrCode size={16} className="text-[#5331EA]" />
                                <span>Verify Attendee Check-In</span>
                            </h3>
                            <button
                                onClick={() => setIsVerifyModalOpen(false)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-slate-500 font-semibold">
                                Enter the ticket Booking ID below to check check-in status and verify access permissions.
                            </p>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#AEAEAE] uppercase tracking-wider">Booking ID</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputBookingId}
                                        onChange={(e) => setInputBookingId(e.target.value)}
                                        placeholder="e.g. TIC-9901-GA"
                                        className="flex-1 h-10 px-3 bg-white border border-[#AEAEAE] rounded-lg outline-none focus:border-[#5331EA] text-xs font-bold placeholder-slate-400 text-slate-800"
                                    />
                                    <button
                                        onClick={handleVerifyAttendee}
                                        className="h-10 px-4 bg-[#5331EA] hover:bg-[#4223ca] text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>

                            {/* Feedback messages */}
                            {verificationFeedback && (
                                <div className="mt-4">
                                    {verificationFeedback.type === 'success' && (
                                        <div className="p-3 bg-emerald-50 border border-[#0AC655]/30 rounded-lg text-[11.5px] font-bold text-[#0AC655] flex items-start gap-2">
                                            <Check size={16} className="shrink-0 mt-0.5" />
                                            <span>{verificationFeedback.message}</span>
                                        </div>
                                    )}
                                    {verificationFeedback.type === 'warning' && (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11.5px] font-bold text-[#D97706] flex items-start gap-2">
                                            <X size={16} className="shrink-0 mt-0.5" />
                                            <span>{verificationFeedback.message}</span>
                                        </div>
                                    )}
                                    {verificationFeedback.type === 'error' && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-[11.5px] font-bold text-[#ED4D1B] flex items-start gap-2">
                                            <X size={16} className="shrink-0 mt-0.5" />
                                            <span>{verificationFeedback.message}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Helpful guide to help tester test IDs */}
                            <div className="bg-slate-50 border border-[#AEAEAE] rounded-xl p-3 text-[10px] text-slate-600 font-semibold space-y-1">
                                <span className="font-bold text-slate-800 uppercase block tracking-wider">Testable Booking IDs for verification:</span>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    {unverifiedList.length > 0 ? (
                                        unverifiedList.slice(0, 5).map(b => (
                                            <li key={b.booking_id} className="font-mono">
                                                {b.booking_id} ({b.user_name} - {b.booking_category})
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-slate-400 italic">No remaining unverified bookings.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3.5 bg-slate-50 border-t border-[#AEAEAE] flex justify-end">
                            <button
                                onClick={() => setIsVerifyModalOpen(false)}
                                className="h-9 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Booking Details Modal Overlay */}
            {selectedBookingDetails && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-[#AEAEAE] shadow-2xl">
                        {/* Header */}
                        <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center shrink-0">
                            <h3 className="text-sm font-black flex items-center gap-2">
                                <Contact size={16} className="text-[#5331EA]" />
                                <span>Booking & Check-In Details</span>
                            </h3>
                            <button
                                onClick={() => setSelectedBookingDetails(null)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="w-12 h-12 rounded-full bg-[#D3CBF5] text-[#5331EA] flex items-center justify-center font-bold text-lg">
                                    {selectedBookingDetails.user_name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">{selectedBookingDetails.user_name}</h4>
                                    <p className="text-xs text-slate-500 font-semibold">{selectedBookingDetails.user_email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                <div>
                                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Booking ID</span>
                                    <span className="text-slate-900 font-bold">{selectedBookingDetails.booking_id}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Event Name</span>
                                    <span className="text-slate-900 font-bold">{listingName || 'Event'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Ticket Category</span>
                                    <span className="text-[#5331EA] font-extrabold">{selectedBookingDetails.booking_category}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Check-in Status</span>
                                    <span className="inline-block px-2 py-0.5 rounded text-[9.5px] bg-emerald-50 text-emerald-600 border border-emerald-200">
                                        {selectedBookingDetails.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Gate Entered</span>
                                    <span className="text-slate-700 font-bold">{selectedBookingDetails.gate_entered}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Verified By</span>
                                    <span className="text-slate-700 font-bold">{selectedBookingDetails.verified_by}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Check-in Time</span>
                                    <span className="text-slate-700 font-bold">{selectedBookingDetails.check_in_time_str || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Check-out Time</span>
                                    <span className="text-slate-700 font-bold">{selectedBookingDetails.check_out_time_str || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                            <button
                                onClick={() => setSelectedBookingDetails(null)}
                                className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
