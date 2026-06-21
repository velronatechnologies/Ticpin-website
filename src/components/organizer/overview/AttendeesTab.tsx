'use client';

import React, { useState, useEffect } from 'react';
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
}

interface VerificationLog {
    id: string;
    booking_id: string;
    user_name: string;
    user_email: string;
    booking_category: string;
    gate_entered: string;
    verified_by: string;
    status: 'Checked-in';
    booked_at: string;
}

// Programmatic generator to produce 300 fallback mock logs spanning different dates and times
const generateMockLogs = (): VerificationLog[] => {
    const categories = ['General Admission', 'VIP Pass', 'Early Bird', 'TechNova Special'];
    const gates = ['Main Gate', 'Gate 2', 'VIP Gate'];
    const verifiers = ['Verifier 1 (Bouncer)', 'Verifier 2 (Staff)', 'Admin Staff', 'Verifier 3'];
    const names = [
        'Aravv G', 'Aniksha Senthil', 'Dharun Balaji', 'Ramji Balasubramaniyan', 'Dharun Balaji 2', 'Dharun S',
        'John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown', 'Charlie Davis', 'Eva Elks',
        'Frank Miller', 'Grace Wilson', 'Henry Taylor', 'Ivy Thomas', 'Jack Jackson', 'Kate White',
        'Liam Harris', 'Mia Martin', 'Noah Thompson', 'Olivia Garcia', 'Peter Martinez', 'Quinn Robinson',
        'Ryan Clark', 'Sophia Rodriguez', 'Thomas Lewis', 'Ursula Lee', 'Victor Walker', 'Wendy Hall',
        'Xavier Allen', 'Yasmine Young', 'Zachary King'
    ];
    const emails = ['aravinthrajan7708@gmail.com', 'anikshasenthilkumar@gmail.com', 'dharunbalaji@velrona.com', 'ramjlb231f@gmail.com', 'kannandharun1615@gmail.com'];

    const logs: VerificationLog[] = [];
    const fixedLogs: VerificationLog[] = [
        { id: 'B-1001', booking_id: 'TIC-7401-VI', user_name: 'Aravv G', user_email: 'aravinthrajan7708@gmail.com', booking_category: 'VIP Pass', gate_entered: 'Main Gate', verified_by: 'Verifier 1 (Bouncer)', status: 'Checked-in', booked_at: '2026-06-21T06:15:00Z' },
        { id: 'B-1002', booking_id: 'TIC-7402-GA', user_name: 'Aniksha Senthil', user_email: 'anikshasenthilkumar@gmail.com', booking_category: 'General Admission', gate_entered: 'Gate 2', verified_by: 'Verifier 2 (Staff)', status: 'Checked-in', booked_at: '2026-06-21T14:18:00Z' },
        { id: 'B-1003', booking_id: 'TIC-7403-EB', user_name: 'Dharun Balaji', user_email: 'dharunbalaji@velrona.com', booking_category: 'Early Bird', gate_entered: 'Main Gate', verified_by: 'Verifier 1 (Bouncer)', status: 'Checked-in', booked_at: '2026-06-20T10:20:00Z' },
        { id: 'B-1004', booking_id: 'TIC-7404-GA', user_name: 'Ramji Balasubramaniyan', user_email: 'ramjib2311@gmail.com', booking_category: 'General Admission', gate_entered: 'VIP Gate', verified_by: 'Admin Staff', status: 'Checked-in', booked_at: '2026-06-20T21:22:00Z' },
        { id: 'B-1005', booking_id: 'TIC-7405-GA', user_name: 'Dharun Balaji 2', user_email: 'kannandharun1615@gmail.com', booking_category: 'General Admission', gate_entered: 'Gate 1', verified_by: 'Verifier 3', status: 'Checked-in', booked_at: '2026-06-18T11:25:00Z' },
        { id: 'B-1006', booking_id: 'TIC-7406-EB', user_name: 'Dharun S', user_email: 'kannandharun1615@gmail.com', booking_category: 'Early Bird', gate_entered: 'Main Gate', verified_by: 'Verifier 1 (Bouncer)', status: 'Checked-in', booked_at: '2026-06-11T16:28:00Z' }
    ];

    logs.push(...fixedLogs);

    // Generate up to 1314 items
    for (let i = 7; i <= 1314; i++) {
        const name = names[i % names.length] + ' ' + String.fromCharCode(65 + (i % 26));
        const email = `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
        const category = categories[i % categories.length];
        const gate = gates[i % gates.length];
        const verifier = verifiers[i % verifiers.length];
        
        let bookedDate = new Date();
        if (i % 4 === 1) {
            bookedDate.setDate(bookedDate.getDate() - 1);
        } else if (i % 4 === 2) {
            bookedDate.setDate(bookedDate.getDate() - 5);
        } else if (i % 4 === 3) {
            bookedDate.setDate(bookedDate.getDate() - 15);
        }
        
        bookedDate.setHours(6 + (i % 16), (i * 7) % 60, 0);

        logs.push({
            id: `B-${1000 + i}`,
            booking_id: `TIC-${7400 + i}-${category.slice(0,2).toUpperCase()}`,
            user_name: name,
            user_email: email,
            booking_category: category,
            gate_entered: gate,
            verified_by: verifier,
            status: 'Checked-in',
            booked_at: bookedDate.toISOString()
        });
    }
    return logs;
};

const initialFallbackLogs = generateMockLogs();

const initialUnverifiedBookings = [
    { booking_id: 'TIC-9901-GA', user_name: 'Suresh Kumar', user_email: 'suresh@gmail.com', booking_category: 'General Admission', status: 'Booked' },
    { booking_id: 'TIC-9902-VI', user_name: 'Vijay Raghavan', user_email: 'vijay@gmail.com', booking_category: 'VIP Pass', status: 'Booked' },
    { booking_id: 'TIC-9903-EB', user_name: 'Karthik Raja', user_email: 'karthik@gmail.com', booking_category: 'Early Bird', status: 'Booked' }
];

export default function AttendeesTab({
    bookings,
    loadingBookings,
    searchQuery: externalSearchQuery,
    setSearchQuery: setExternalSearchQuery,
    handleExportCSV
}: AttendeesTabProps) {
    // Search & Load Limit States
    const [searchVal, setSearchVal] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(100);
    const [baseLimit, setBaseLimit] = useState(100);
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

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, selectedCategory, selectedGate, selectedVerifier, selectedTime, selectedAmPm, searchVal, customStartDate, customEndDate, customStartHour, customStartMin, customStartAmPm, customEndHour, customEndMin, customEndAmPm]);

    // Primary data states
    const [localCheckedInLogs, setLocalCheckedInLogs] = useState<VerificationLog[]>(() => {
        const backendCheckedIn = bookings
            .filter(b => b.status === 'Checked-in' || b.status === 'verified')
            .map((b, idx) => ({
                id: b.id,
                booking_id: b.booking_id,
                user_name: b.user_name,
                user_email: b.user_email,
                booking_category: (b.booking_category && b.booking_category !== 'event') ? b.booking_category : (b.tickets?.[0]?.category || 'General Admission'),
                gate_entered: idx % 3 === 0 ? 'Main Gate' : idx % 3 === 1 ? 'Gate 2' : 'VIP Gate',
                verified_by: idx % 3 === 0 ? 'Verifier 1 (Bouncer)' : idx % 3 === 1 ? 'Verifier 2 (Staff)' : 'Admin Staff',
                status: 'Checked-in' as const,
                booked_at: b.booked_at
            }));

        return backendCheckedIn.length > 0 ? backendCheckedIn : initialFallbackLogs;
    });

    const [localUnverified, setLocalUnverified] = useState(initialUnverifiedBookings);

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

    // Action: Verify attendee via modal
    const handleVerifyAttendee = () => {
        setVerificationFeedback(null);
        if (!inputBookingId.trim()) {
            setVerificationFeedback({ type: 'error', message: 'Please enter a valid Booking ID.' });
            return;
        }

        const cleanId = inputBookingId.trim().toUpperCase();

        // Check if already checked in
        const alreadyCheckedIn = localCheckedInLogs.find(log => log.booking_id.toUpperCase() === cleanId);
        if (alreadyCheckedIn) {
            setVerificationFeedback({
                type: 'warning',
                message: `Already verified! Checked in at ${alreadyCheckedIn.gate_entered} by ${alreadyCheckedIn.verified_by}. No need to verify again.`
            });
            return;
        }

        // Check if unverified
        const matchingUnverified = localUnverified.find(b => b.booking_id.toUpperCase() === cleanId);
        if (matchingUnverified) {
            const newLog: VerificationLog = {
                id: `B-${Date.now()}`,
                booking_id: matchingUnverified.booking_id,
                user_name: matchingUnverified.user_name,
                user_email: matchingUnverified.user_email,
                booking_category: matchingUnverified.booking_category,
                gate_entered: 'Main Gate',
                verified_by: 'Verifier 1 (Bouncer)',
                status: 'Checked-in',
                booked_at: new Date().toISOString()
            };

            setLocalCheckedInLogs(prev => [newLog, ...prev]);
            setLocalUnverified(prev => prev.filter(b => b.booking_id.toUpperCase() !== cleanId));

            setVerificationFeedback({
                type: 'success',
                message: `Successfully verified and checked in! Name: ${matchingUnverified.user_name}, Category: ${matchingUnverified.booking_category}.`
            });
            setInputBookingId('');
        } else {
            setVerificationFeedback({
                type: 'error',
                message: 'Invalid Booking ID. No booking record found.'
            });
        }
    };

    // Perform dynamic filtering based on all criteria
    const filteredLogs = localCheckedInLogs.filter(b => {
        const searchLower = searchVal.toLowerCase();
        const matchesSearch =
            b.user_name.toLowerCase().includes(searchLower) ||
            b.booking_id.toLowerCase().includes(searchLower) ||
            b.user_email.toLowerCase().includes(searchLower) ||
            b.booking_category.toLowerCase().includes(searchLower) ||
            b.gate_entered.toLowerCase().includes(searchLower) ||
            b.verified_by.toLowerCase().includes(searchLower) ||
            b.status.toLowerCase().includes(searchLower) ||
            new Date(b.booked_at).toLocaleString().toLowerCase().includes(searchLower);

        // 2. Ticket Category filter
        const matchesCategory =
            selectedCategory === 'All Categories' ? true : b.booking_category === selectedCategory;

        // 3. Gate filter
        const matchesGate =
            selectedGate === 'All Gates' ? true : b.gate_entered === selectedGate;

        // 4. Verifier filter
        const matchesVerifier =
            selectedVerifier === 'All Verifiers' ? true : b.verified_by === selectedVerifier;

        // 5. Time range filter (Date based)
        let matchesTime = true;
        if (selectedTime !== 'All Time') {
            const logDate = new Date(b.booked_at);
            const now = new Date();

            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfYesterday.getDate() - 1);
            const startOfLastWeek = new Date(startOfToday);
            startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

            if (selectedTime === 'Today') {
                matchesTime = logDate >= startOfToday;
            } else if (selectedTime === 'Yesterday') {
                matchesTime = logDate >= startOfYesterday && logDate < startOfToday;
            } else if (selectedTime === 'Last Week') {
                matchesTime = logDate >= startOfLastWeek;
            } else if (selectedTime === 'Custom Range') {
                if (customStartDate && customEndDate) {
                    const customStart = new Date(customStartDate);
                    customStart.setHours(0, 0, 0, 0);
                    const customEnd = new Date(customEndDate);
                    customEnd.setHours(23, 59, 59, 999);
                    matchesTime = logDate >= customStart && logDate <= customEnd;
                }
            }
        }

        // 6. AM/PM or Custom Hours range filter
        if (matchesTime && selectedAmPm !== 'Full Day') {
            const logDate = new Date(b.booked_at);
            const hour = logDate.getHours();
            const minutes = logDate.getMinutes();
            const totalMinutes = hour * 60 + minutes;

            if (selectedAmPm === 'AM (Before 12 PM)') {
                matchesTime = hour < 12;
            } else if (selectedAmPm === 'PM (After 12 PM)') {
                matchesTime = hour >= 12;
            } else if (selectedAmPm === 'Custom Time Range') {
                const startTotal = getMinutesFromMidnight(customStartHour, customStartMin, customStartAmPm);
                const endTotal = getMinutesFromMidnight(customEndHour, customEndMin, customEndAmPm);
                matchesTime = totalMinutes >= startTotal && totalMinutes <= endTotal;
            }
        }

        return matchesSearch && matchesCategory && matchesGate && matchesVerifier && matchesTime;
    });

    // Capped by load limit (100 or 500), then paged by 20 rows
    const loadedLogs = filteredLogs.slice(0, itemsPerPage);
    const PAGE_SIZE = 20;
    const totalPages = Math.ceil(loadedLogs.length / PAGE_SIZE) || 1;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const visibleLogs = loadedLogs.slice(startIndex, startIndex + PAGE_SIZE);

    const remainingMatchedCount = filteredLogs.length - loadedLogs.length;

    // Statistics counters
    const totalCheckedIn = filteredLogs.length;
    const mainGateCount = filteredLogs.filter(b => b.gate_entered === 'Main Gate').length;
    const gate2Count = filteredLogs.filter(b => b.gate_entered === 'Gate 2').length;
    const vipGateCount = filteredLogs.filter(b => b.gate_entered === 'VIP Gate').length;

    const toggleDropdown = (dropdown: string) => {
        setActiveDropdown(prev => (prev === dropdown ? null : dropdown));
    };

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
                                    setCurrentPage(1);
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
                                {['All Categories', 'VIP Pass', 'General Admission', 'Early Bird'].map(cat => (
                                    <div
                                        key={cat}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setActiveDropdown(null);
                                            setCurrentPage(1);
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
                                            setCurrentPage(1);
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
                                            setCurrentPage(1);
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
                                            setCurrentPage(1);
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
                                            setCurrentPage(1);
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
                                        setCurrentPage(1);
                                    }}
                                    className="h-9 px-3 text-xs border border-[#AEAEAE] bg-white rounded-lg focus:outline-none text-slate-800 font-bold"
                                />
                                <span className="text-[10px] font-bold text-slate-400 uppercase font-semibold">to</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => {
                                        setCustomEndDate(e.target.value);
                                        setCurrentPage(1);
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
                                        onChange={(e) => { setCustomStartHour(e.target.value); setCurrentPage(1); }}
                                        className="text-xs bg-transparent font-bold focus:outline-none text-slate-800 cursor-pointer"
                                    >
                                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-slate-400 font-bold">:</span>
                                    <select
                                        value={customStartMin}
                                        onChange={(e) => { setCustomStartMin(e.target.value); setCurrentPage(1); }}
                                        className="text-xs bg-transparent font-bold focus:outline-none text-slate-800 cursor-pointer"
                                    >
                                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={customStartAmPm}
                                        onChange={(e) => { setCustomStartAmPm(e.target.value); setCurrentPage(1); }}
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
                                        onChange={(e) => { setCustomEndHour(e.target.value); setCurrentPage(1); }}
                                        className="text-xs bg-transparent font-bold focus:outline-none text-slate-800 cursor-pointer"
                                    >
                                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-slate-400 font-bold">:</span>
                                    <select
                                        value={customEndMin}
                                        onChange={(e) => { setCustomEndMin(e.target.value); setCurrentPage(1); }}
                                        className="text-xs bg-transparent font-bold focus:outline-none text-slate-800 cursor-pointer"
                                    >
                                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={customEndAmPm}
                                        onChange={(e) => { setCustomEndAmPm(e.target.value); setCurrentPage(1); }}
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
                                    setCurrentPage(1);
                                }}
                                className="w-full h-8 pl-8 pr-2.5 text-[11px] bg-slate-50 border border-[#AEAEAE] rounded-lg focus:outline-none focus:border-[#5331EA] text-slate-800 placeholder-slate-400 font-semibold"
                            />
                            <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
                        </div>


                        {/* Load Limit Selectors */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Load Limit:</span>
                            {[100, 500].map(size => (
                                <button
                                    key={size}
                                    onClick={() => {
                                        setBaseLimit(size);
                                        setItemsPerPage(size);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded border ${
                                        baseLimit === size
                                            ? 'bg-[#5331EA] text-white border-[#5331EA]'
                                            : 'bg-white hover:bg-slate-50 text-slate-600 border-[#AEAEAE]'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}

                            {/* Load Next Chunks Button */}
                            {remainingMatchedCount > 0 && (
                                <button
                                    onClick={() => {
                                        const amountToLoad = Math.min(baseLimit, remainingMatchedCount);
                                        setItemsPerPage(prev => prev + amountToLoad);
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-black rounded border border-[#5331EA] bg-[#5331EA]/10 hover:bg-[#5331EA]/20 text-[#5331EA] transition-all flex items-center gap-1"
                                    title={`Load Next ${Math.min(baseLimit, remainingMatchedCount)} matching attendees`}
                                >
                                    <span>Load Next {Math.min(baseLimit, remainingMatchedCount)}</span>
                                </button>
                            )}
                        </div>

                        {/* Page-by-page Pagination Controls */}
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="h-8 px-2.5 border border-[#AEAEAE] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-white"
                            >
                                Previous
                            </button>
                            <span className="px-1 text-slate-600 font-semibold">
                                Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong> (<strong className="text-slate-900">{loadedLogs.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, loadedLogs.length)}</strong> of <strong className="text-slate-900">{loadedLogs.length}</strong> loaded)
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="h-8 px-2.5 border border-[#AEAEAE] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-white"
                            >
                                Next
                            </button>
                        </div>

                        <button
                            onClick={handleExportCSV}
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
                                <th className="py-3 px-3 text-center">Check-In Status</th>
                                <th className="py-3 px-3 text-center rounded-r-md w-[90px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#AEAEAE] text-slate-800">
                            {loadingBookings ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                                        Loading check-in list...
                                    </td>
                                </tr>
                            ) : visibleLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
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
                                                <span className="text-[12px] font-bold text-slate-800">TechNova</span>
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
                                    {localUnverified.map(b => (
                                        <li key={b.booking_id} className="font-mono">
                                            {b.booking_id} ({b.user_name} - {b.booking_category})
                                        </li>
                                    ))}
                                    <li className="font-mono text-slate-400">
                                        TIC-7401-VI (Already Checked-in example)
                                    </li>
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
                                    <span className="text-slate-900 font-bold">TechNova</span>
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
                                <div className="col-span-2">
                                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Check-in Time</span>
                                    <span className="text-slate-700 font-bold">
                                        {new Date(selectedBookingDetails.booked_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                        {' @ '}
                                        {new Date(selectedBookingDetails.booked_at).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: true
                                        })}
                                    </span>
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
