'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useUserSession, getUserSession } from '@/lib/auth/user';
import { getOrganizerSession, clearOrganizerSession } from '@/lib/auth/organizer';
import AuthModal from '@/components/modals/AuthModal';
import OrganizerLogoutModal from '@/components/modals/OrganizerLogoutModal';
import { toast } from '@/components/ui/Toast';
import { passApi, TicpinPass } from '@/lib/api/pass';
import { Zap, ShieldCheck } from 'lucide-react';
import { useSlotLock } from '@/hooks/useSlotLock';

// Navbar Components
import LocationSelector from '@/components/layout/Navbar/LocationSelector';
import UserMenu from '@/components/layout/Navbar/UserMenu';
import ProfileDrawer from '@/components/layout/Navbar/ProfileDrawer';
const LocationModal = dynamic(() => import('@/components/modals/LocationModal'), { ssr: false });

// Stores
import { useLocationStore } from '@/store/useLocationStore';
import { useIdentityStore } from '@/store/useIdentityStore';

interface Court {
    id: string;
    name: string;
    type: string;
    price: number;
    image_url?: string;
}

interface RealPlay {
    id: string;
    name: string;
    city?: string;
    venue_name?: string;
    sub_category?: string;
    time?: string;
    opening_time?: string;
    closing_time?: string;
    price_starts_from?: number;
    courts?: Court[];
    pricing_format?: 'fixed' | 'custom';
    pricing_plans?: Array<{
        start_time: string;
        end_time: string;
        min_duration?: string;
        price: number;
        weekend_price?: number;
        use_weekend_pricing?: boolean;
    }>;
    custom_availabilities?: Array<{
        day: string;
        date?: string;
        opening_time: string;
        closing_time: string;
        opening_period?: 'AM' | 'PM';
        closing_period?: 'AM' | 'PM';
        price: number;
        min_duration?: string;
    }>;
}

// Slots are generated dynamically from venue opening/closing time — no static list needed.

/** Parse "09:00 AM" / "9:00 PM" / "09:00" (24-hr) → minutes since midnight.
 *  Returns NaN on any failure so callers can fall back safely. */
const parseTime = (timeStr: string): number => {
    if (!timeStr) return NaN;
    const s = timeStr.trim();

    // More flexible regex validation - allows single digit hours
    if (!/^\d{1,2}:\d{2}(\s*[AP]M)?$/i.test(s)) {
        return NaN; // Invalid format
    }

    // "09:00 AM" / "9:00 pm"
    const ampm = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampm) {
        let h = parseInt(ampm[1], 10);
        const m = parseInt(ampm[2], 10);
        const p = ampm[3].toUpperCase();

        // Validate hour range (0-23 for input, will be converted)
        if (h < 0 || h > 23 || m < 0 || m > 59) return NaN;

        if (p === 'PM' && h !== 12) h += 12;
        if (p === 'AM' && h === 12) h = 0;
        return h * 60 + m;
    }
    // "09:00" (24-hr)
    const h24 = s.match(/^(\d{1,2}):(\d{2})$/);
    if (h24) {
        const h = parseInt(h24[1], 10);
        const m = parseInt(h24[2], 10);

        // Validate 24-hour range
        if (h < 0 || h > 23 || m < 0 || m > 59) return NaN;

        return h * 60 + m;
    }
    return NaN;
};

/**
 * Parse the start time (minutes) of a backend slot string.
 * Handles "09:00 AM - 09:30 AM" format (both halves have AM/PM).
 */
const parseSlotStartMin = (slot: string): number => {
    const firstPart = slot.split(/\s*-\s*/)[0].trim();
    return parseTime(firstPart);
};

const to24HourTime = (time: string, period?: 'AM' | 'PM'): string => {
    if (!period) return time;
    const [hRaw, mRaw] = (time || '').split(':');
    let h = Number(hRaw);
    const m = mRaw ?? '00';
    if (Number.isNaN(h)) return time;
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
};

const formatDateSimple = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
};

const formatTimeSimple = (mins: number, showPeriod = true) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    let displayH = h % 12 || 12;
    return `${displayH}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''}${showPeriod ? period : ''}`;
};



function getNextDays(count = 7) {
    const days = [];
    const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const today = new Date();

    for (let i = 0; i < count; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);

        // Build date key using local time components to avoid UTC conversion
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const key = `${year}-${month}-${day}`;

        days.push({
            key: key,
            label: String(d.getDate()).padStart(2, '0'),
            day: DAYS[d.getDay()],
            month: MONTHS[d.getMonth()],
        });
    }
    return days;
}

// ─── Time-period definitions ─────────────────────────────────────────────────
const PERIODS = [
    { id: 'morning', label: 'Morning', min: 0 * 60, max: 12 * 60 },
    { id: 'evening', label: 'Evening', min: 12 * 60, max: 24 * 60 },
] as const;



export default function PlayBookPage() {
    const router = useRouter();
    const params = useParams();
    const venueName = params?.name as string;
    const session = useUserSession();
    const organizerSession = getOrganizerSession();

    const [venue, setVenue] = useState<RealPlay | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

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
            router.push(`/play/${venueName}`);
        }
    };

    const dates = getNextDays(7);
    const [selectedDate, setSelectedDate] = useState(dates[0].key);
    const [duration, setDuration] = useState(1);
    const { locks, timeRemaining, lockSlot, unlockSlot, unlockAll, lockKey } = useSlotLock('play');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [slotOffset, setSlotOffset] = useState(0);

    const [selectedCourtIds, setSelectedCourtIds] = useState<string[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [activePeriod, setActivePeriod] = useState<string>('morning');
    const [pass, setPass] = useState<TicpinPass | null>(null);
    const [usePass, setUsePass] = useState(false);

    // Navbar State
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const [authView, setAuthView] = useState<'number' | 'otp' | 'profile' | 'location'>('number');
    const profileRef = useRef<HTMLDivElement>(null);
    const togglingCourtsRef = useRef<Set<string>>(new Set());
    const bookingInProgressRef = useRef(false);

    const { currentLocation, setLocation, clearLocation } = useLocationStore();
    const { userSession, logoutUser, logoutOrganizer, sync: syncAuth } = useIdentityStore();

    useEffect(() => {
        syncAuth();
    }, [syncAuth]);

    const handleProfileClick = () => {
        if (organizerSession || userSession) {
            setIsProfileDrawerOpen(!isProfileDrawerOpen);
        } else {
            setAuthView('number');
            setShowAuthModal(true);
        }
    };

    const handleUserLogout = () => {
        logoutUser();
        setIsProfileMenuOpen(false);
        router.push('/');
    };

    const handleOrganizerLogoutInternal = () => {
        logoutOrganizer();
        setIsProfileMenuOpen(false);
        router.push('/');
    };



    const isWindowAvailable = (courtName: string, startMin: number, endMin: number): boolean => {
        for (const booked of bookedSlots) {
            const pipeIdx = booked.lastIndexOf('|');
            if (pipeIdx === -1) continue;
            const slotStr = booked.substring(0, pipeIdx);
            const bCourtName = booked.substring(pipeIdx + 1);
            if (bCourtName !== courtName) continue;

            // Parse start minute of booked 30-min slot
            const bStart = parseSlotStartMin(slotStr);
            if (isNaN(bStart)) continue;

            // Calculate the end time of the booked slot (assuming 30-min slots as per backend)
            const bEnd = bStart + 30;

            // Check for any overlap: [startMin, endMin) overlaps [bStart, bEnd)
            // Overlap condition: startMin < bEnd AND bStart < endMin
            if (startMin < bEnd && bStart < endMin) return false;
        }
        return true;
    };

    // Fetch venue
    useEffect(() => {
        if (!venueName) return;
        const decodedVenueName = decodeURIComponent(venueName);
        fetch(`/backend/api/play/${encodeURIComponent(decodedVenueName)}`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Venue not found');
                return res.json();
            })
            .then((data: RealPlay) => {
                if (!data || !data.id) throw new Error('Invalid venue data');
                setVenue(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Venue fetch error:", err);
                setVenue(null);
                setLoading(false);
            });
    }, [venueName]);

    // Fetch pass
    useEffect(() => {
        if (session?.id) {
            passApi.getActivePass(session.id).then(setPass).catch(() => setPass(null));
        }
    }, [session?.id]);

    // Fetch booked slots whenever venue or date changes
    useEffect(() => {
        if (!venueName || !selectedDate) return;
        setLoadingSlots(true);
        // Clear slot, court, and period tab when date changes
        setSelectedSlot(null);
        setSelectedCourtIds([]);
        setActivePeriod('morning');
        setSlotOffset(0);
        const decodedVenueName = decodeURIComponent(venueName);
        fetch(`/backend/api/play/${encodeURIComponent(decodedVenueName)}/booked-slots?date=${selectedDate}${lockKey ? `&lock_key=${lockKey}` : ''}`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) return { booked_slots: [] };
                return res.json();
            })
            .then(data => {
                setBookedSlots(Array.isArray(data.booked_slots) ? data.booked_slots : []);
            })
            .catch(() => setBookedSlots([]))
            .finally(() => setLoadingSlots(false));
    }, [venueName, selectedDate, lockKey]);

    const toggleCourt = async (uniqueId: string) => {
        if (!selectedSlot || !venue) return;
        if (togglingCourtsRef.current.has(uniqueId)) return;
        togglingCourtsRef.current.add(uniqueId);

        try {
            const court = courts?.find((c, idx) => `${c.id}-${idx}` === uniqueId);
            if (!court) return;

            const backendSlot = blockSlots.find(b => b.label === selectedSlot)
                ? `${formatTime(blockSlots.find(b => b.label === selectedSlot)!.startMin)} - ${formatTime(blockSlots.find(b => b.label === selectedSlot)!.startMin + 30)}`
                : selectedSlot;

            if (selectedCourtIds.includes(uniqueId)) {
                // Deselect and Unlock
                const success = await unlockSlot(venue.id, selectedDate, backendSlot, court.name);
                if (success !== false) {
                    setSelectedCourtIds(prev => prev.filter(id => id !== uniqueId));
                }
            } else {
                // Select and Lock
                // If we are about to exceed 2 courts, explicitly unlock the oldest one first
                if (selectedCourtIds.length >= 2) {
                    const oldestId = selectedCourtIds[0];
                    const oldestCourt = courts?.find((c, idx) => `${c.id}-${idx}` === oldestId);
                    if (oldestCourt) {
                        await unlockSlot(venue.id, selectedDate, backendSlot, oldestCourt.name);
                    }
                }

                await lockSlot(venue.id, selectedDate, backendSlot, court.name);

                setSelectedCourtIds(prev => {
                    if (prev.length >= 2) return [...prev.slice(1), uniqueId];
                    return [...prev, uniqueId];
                });
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to lock this court. It might be taken.');
        } finally {
            togglingCourtsRef.current.delete(uniqueId);
        }
    };

    // When duration changes, reset both selections (availability window changes)
    useEffect(() => {
        // Unlock any active locks when clearing selections due to duration change
        if (venue && selectedSlot && selectedCourtIds.length > 0) {
            const backendSlot = blockSlots.find(b => b.label === selectedSlot)
                ? `${formatTime(blockSlots.find(b => b.label === selectedSlot)!.startMin)} - ${formatTime(blockSlots.find(b => b.label === selectedSlot)!.startMin + 30)}`
                : selectedSlot;

            selectedCourtIds.forEach(uid => {
                const court = courts?.find((c, idx) => `${c.id}-${idx}` === uid);
                if (court) unlockSlot(venue.id, selectedDate, backendSlot, court.name);
            });
        }
        setSelectedSlot(null);
        setSelectedCourtIds([]);
    }, [duration]);

    // Converts minutes-since-midnight → "HH:MM AM/PM" — identical rule to backend formatTimeMins.
    // h >= 12 → PM  (so 12:00 noon = PM, 00:00 midnight = AM)
    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const period = h >= 12 ? 'PM' : 'AM';
        let displayH = h % 12;
        if (displayH === 0) displayH = 12;
        return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
    };

    const getSelectedDateMeta = () => {
        const d = new Date(selectedDate + 'T00:00:00');
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        return { dayName, isWeekend };
    };

    interface TimeRange {
        start: number;
        end: number;
        price?: number;
    }

    // Derive opening/closing minutes using schedule priority:
    // custom (selected day) > fixed plans > legacy timings.
    const resolveVenueTimes = (): TimeRange[] => {
        const { dayName } = getSelectedDateMeta();
        const FALLBACK = [{ start: 6 * 60, end: 22 * 60 }];

        if (venue?.pricing_format === 'custom') {
            const customDates = venue?.custom_availabilities?.filter(ca => ca.date && ca.date === selectedDate) ?? [];
            const customDays = venue?.custom_availabilities?.filter(ca => !ca.date && ca.day === dayName) ?? [];

            // Priority: specific date matches first, otherwise day-of-week matches
            const matchingAvailabilities = customDates.length > 0 ? customDates : customDays;

            if (matchingAvailabilities.length > 0) {
                return matchingAvailabilities.map(ca => ({
                    start: parseTime(to24HourTime(ca.opening_time, ca.opening_period)),
                    end: parseTime(to24HourTime(ca.closing_time, ca.closing_period)),
                    price: ca.price > 0 ? ca.price : undefined
                })).filter(r => !isNaN(r.start) && !isNaN(r.end) && r.end > r.start);
            }
        }

        if (venue?.pricing_format === 'fixed' && venue?.pricing_plans && venue.pricing_plans.length > 0) {
            const { isWeekend } = getSelectedDateMeta();
            return venue.pricing_plans.map(p => {
                const price = (isWeekend && p.use_weekend_pricing && (p.weekend_price ?? 0) > 0)
                    ? p.weekend_price
                    : (p.price > 0 ? p.price : undefined);
                return {
                    start: parseTime(p.start_time),
                    end: parseTime(p.end_time),
                    price
                };
            }).filter(r => !isNaN(r.start) && !isNaN(r.end) && r.end > r.start);
        }

        // Fallback to legacy fields
        const s1 = parseTime(venue?.opening_time ?? '');
        const e1 = parseTime(venue?.closing_time ?? '');
        if (!isNaN(s1) && !isNaN(e1) && e1 > s1) return [{ start: s1, end: e1 }];

        const t = venue?.time ?? '';
        if (t) {
            const sep = t.includes(' - ') ? ' - ' : '-';
            const parts = t.split(sep);
            if (parts.length >= 2) {
                const s2 = parseTime(parts[0].trim());
                const e2 = parseTime(parts[parts.length - 1].trim());
                if (!isNaN(s2) && !isNaN(e2) && e2 > s2) return [{ start: s2, end: e2 }];
            }
        }
        return FALLBACK;
    };

    const resolveEffectiveHourlyPrice = (slotStartMin?: number): number | null => {
        if (slotStartMin === undefined) {
            // Fallback for initial UI before slot selection
            const ranges = resolveVenueTimes();
            return ranges.find(r => (r.price ?? 0) > 0)?.price ?? null;
        }

        const ranges = resolveVenueTimes();
        const matchingRange = ranges.find(r => slotStartMin >= r.start && slotStartMin < r.end);
        return matchingRange?.price ?? null;
    };

    // duration is in 30-min units: 1=30min, 2=1hr, 3=1.5hr, etc.
    const durationMins = duration * 30;
    const durationLabel = (() => {
        const total = durationMins;
        const hrs = Math.floor(total / 60);
        const mins = total % 60;
        if (hrs === 0) return `${mins} min`;
        if (mins === 0) return `${hrs} hr`;
        return `${hrs} hr ${mins} min`;
    })();

    const generateBlockSlots = (): { label: string; startMin: number; endMin: number }[] => {
        const ranges = resolveVenueTimes();
        const blocks: { label: string; startMin: number; endMin: number }[] = [];

        // Get current time in minutes for filtering past slots
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const isToday = selectedDate === now.toISOString().split('T')[0];

        ranges.forEach(({ start: venueStart, end: venueEnd }) => {
            const scheduleDuration = venueEnd - venueStart;
            const hasSingleConfiguredSlot = scheduleDuration > 0 && scheduleDuration <= 240;
            let current = venueStart;

            if (hasSingleConfiguredSlot) {
                if (!isToday || venueStart >= currentMinutes) {
                    blocks.push({
                        label: `${formatTime(venueStart)} - ${formatTime(venueEnd)}`,
                        startMin: venueStart,
                        endMin: venueEnd,
                    });
                }
                return;
            }

            while (current + durationMins <= venueEnd) {
                const end = current + durationMins;
                // Skip past slots if booking for today
                if (!isToday || current >= currentMinutes) {
                    blocks.push({
                        label: `${formatTime(current)} - ${formatTime(end)}`,
                        startMin: current,
                        endMin: end,
                    });
                }
                current += 30; // step every 30 min
            }
        });

        // Sort by start time in case ranges were added out of order
        return blocks.sort((a, b) => a.startMin - b.startMin);
    };

    const blockSlots = generateBlockSlots();
    const selectedBlock = blockSlots.find(b => b.label === selectedSlot);
    const effectiveDurationSlots = selectedBlock
        ? Math.max(1, Math.round((selectedBlock.endMin - selectedBlock.startMin) / 30))
        : duration;
    const effectiveDurationMins = effectiveDurationSlots * 30;
    const effectiveDurationLabel = (() => {
        const hrs = Math.floor(effectiveDurationMins / 60);
        const mins = effectiveDurationMins % 60;
        if (hrs === 0) return `${mins} min`;
        if (mins === 0) return `${hrs} hr`;
        return `${hrs} hr ${mins} min`;
    })();

    // ── Hour label helper (e.g. "9 AM", "12 PM") — same h >= 12 → PM rule as formatTime ──
    const hourLabel = (h: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const display = h % 12 || 12;
        return `${display} ${period}`;
    };

    // ── Period filtering + hourly grouping ───────────────────────────────────
    const activePeriodDef = PERIODS.find(p => p.id === activePeriod) ?? PERIODS[0];
    const periodSlots = blockSlots.filter(
        b => b.startMin >= activePeriodDef.min && b.startMin < activePeriodDef.max
    );
    // Map hour → slots[]
    const hourGroupMap = new Map<number, typeof blockSlots>();
    periodSlots.forEach(b => {
        const h = Math.floor(b.startMin / 60);
        if (!hourGroupMap.has(h)) hourGroupMap.set(h, []);
        hourGroupMap.get(h)!.push(b);
    });
    const hourGroups = [...hourGroupMap.entries()].sort((a, b) => a[0] - b[0]);

    const courts = venue?.courts ?? [];

    // 1. Selection Maintenance: Restore selections from active database locks
    useEffect(() => {
        if (!venue || locks.length === 0) return;

        // Find locks for this specific venue and date
        const currentVenueLocks = locks.filter(l =>
            l.reference_id === venue.id &&
            l.date === selectedDate
        );

        if (currentVenueLocks.length > 0) {
            // All locks for a 'play' session share the same time slot label
            // The backend stores it like "08:00 AM - 08:30 AM"

            const firstLock = currentVenueLocks[0];

            // Map the backend format "08:00 AM - 08:30 AM" back to our simplified label
            // by finding the matching block slot. Regenerate blockSlots here to avoid
            // infinite loop from blockSlots being recreated every render.
            const currentBlockSlots = generateBlockSlots();
            const startStr = firstLock.slot.split(' - ')[0]; // "08:00 AM"
            const matchedBlock = currentBlockSlots.find(b => formatTime(b.startMin) === startStr);

            if (matchedBlock) {
                setSelectedSlot(matchedBlock.label);

                // Map court names back to our uniqueId format "${court.id}-${idx}"
                const matchedCourtIds = currentVenueLocks.map(lock => {
                    const idx = courts?.findIndex(c => c.name === lock.court_name);
                    if (idx !== undefined && idx !== -1) {
                        return `${courts[idx].id}-${idx}`;
                    }
                    return null;
                }).filter(id => id !== null) as string[];

                setSelectedCourtIds(matchedCourtIds);
            }
        }
    }, [venue, locks, selectedDate]); // courts is derived from venue, so no need to include it

    const doBooking = (v: RealPlay) => {
        const effectiveHourlyPrice = resolveEffectiveHourlyPrice(selectedBlock?.startMin);
        const tickets = selectedCourtIds.map(uid => {
            const court = courts.find((c, idx) => `${c.id}-${idx}` === uid);
            const pricePerHour = effectiveHourlyPrice ?? court?.price ?? v.price_starts_from ?? 500;
            // price is stored per-hour; duration is in 30-min units → actual cost = price × (duration/2)
            const actualPrice = Math.round(pricePerHour * effectiveDurationSlots / 2);
            return {
                category: court?.name ?? 'Court',
                name: `${court?.name ?? 'Court'} — ${court?.type ?? ''}`,
                price: actualPrice,
                quantity: 1,
            };
        });
        const totalPrice = tickets.reduce((s, t) => s + t.price, 0);
        // backendSlot = the 30-min start slot sent to and stored by the backend
        // displaySlot = the full user-selected duration span shown in the review page
        const backendSlot = selectedBlock
            ? `${formatTime(selectedBlock.startMin)} - ${formatTime(selectedBlock.startMin + 30)}`
            : selectedSlot;
        const displaySlot = selectedSlot ?? backendSlot; // full span e.g. "09:00 AM - 10:00 AM"
        const cartItem = {
            eventId: v.id,
            eventName: v.name,
            city: v.city ?? '',
            type: 'play',
            date: selectedDate,
            slot: backendSlot,       // used by backend for booking & overlap check
            display_slot: displaySlot, // shown to user in review / confirmation
            duration: effectiveDurationSlots,       // in 30-min units; used by backend for index expansion
            tickets,
            totalPrice,
            use_pass: usePass,
            pass_id: pass?.id
        };

        // Safely store cart with error handling
        try {
            sessionStorage.setItem('ticpin_cart', JSON.stringify(cartItem));
        } catch (error) {
            console.error('Failed to store cart data:', error);
            toast.error('Unable to proceed with booking. Please try again.');
            return;
        }

        router.push(`/play/${encodeURIComponent(venueName)}/book/review`);
    };

    const handleBooking = () => {
        if (!venue) return;
        if (bookingInProgressRef.current) return;

        if (!session) { setShowAuthModal(true); return; }
        if (selectedCourtIds.length === 0) { toast.warning('Please select at least one court.'); return; }
        if (!selectedSlot) { toast.warning('Please select a time slot.'); return; }

        bookingInProgressRef.current = true;
        doBooking(venue);
        // Reset after navigation completes (router.push is fire-and-forget)
        setTimeout(() => { bookingInProgressRef.current = false; }, 2000);
    };

    const handleOrganizerLogout = () => {
        clearOrganizerSession();
        // Show user auth modal after organizer logout
        setShowAuthModal(true);
    };

    if (loading || isAuthChecking || (!session?.id && !getUserSession())) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-[#E7C200] border-t-transparent rounded-full animate-spin" />
                <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} initialView={authView} />
            </div>
        );
    }
    if (!venue) return <div className="text-center py-20 text-zinc-500">Venue not found</div>;

    const curMonth = dates[0].month;

    return (
        <div
            className="h-screen w-full flex flex-col overflow-hidden"
            style={{ background: "linear-gradient(180deg, #FFF7CD -50%, #FFFFFF 55%)" }}
        >
            <header className="fixed top-0 left-0 z-50 w-full border-b border-zinc-200 h-[80px] bg-white flex items-center">
                <div className="w-full flex items-center justify-between px-[37px]">
                    <div className="flex items-center min-w-max">
                        <Link href="/" className="border-r border-zinc-200 pr-3 md:pr-6 flex items-center">
                            <Image
                                src="/ticpin-logo-black.png"
                                alt="TicPin Logo"
                                width={159}
                                height={28}
                                className="h-4 md:h-7 w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6 justify-end">
                        <LocationSelector
                            location={currentLocation}
                            onOpenModal={() => setIsLocationOpen(true)}
                            onClear={clearLocation}
                        />
                        <div
                            onClick={() => router.push('/play')}
                            className="hidden lg:block w-5 h-5 cursor-pointer"
                            style={{
                                backgroundColor: '#E7C200',
                                maskImage: 'url(/search.svg)', WebkitMaskImage: 'url(/search.svg)',
                                maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center', WebkitMaskPosition: 'center',
                                maskSize: 'contain', WebkitMaskSize: 'contain'
                            }}
                        />
                        <div ref={profileRef}>
                            <UserMenu
                                session={organizerSession}
                                userSession={userSession}
                                isMenuOpen={isProfileMenuOpen}
                                onToggleMenu={handleProfileClick}
                                onUserLogout={handleUserLogout}
                                onOrganizerLogout={handleOrganizerLogoutInternal}
                                onOpenProfile={() => { }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Spacer for fixed header */}
            <div className="h-[100px] shrink-0" />

            <div className="flex-1 overflow-y-auto w-full flex flex-col items-center custom-scrollbar">
                <main className="w-full max-w-[850px] px-4 py-4">
                    {/* ── Main white card ── */}
                    <div className="bg-white rounded-[30px] shadow-sm border border-zinc-100 overflow-hidden">

                        {/* ── Venue header ── */}
                        <div className="px-6 md:px-8 pt-6 pb-3">
                            <h1
                                className="text-[24px] md:text-[28px] font-medium text-black leading-tight"
                                style={{ fontFamily: 'var(--font-anek-latin)' }}
                            >
                                {venue.name}
                            </h1>
                            <p className="text-[14px] md:text-[16px] font-medium text-[#686868] mt-0.5 leading-[1.6]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                {venue.sub_category ?? 'Multi-sports'}
                                {venue.city ? <>&nbsp;&nbsp;{venue.city}</> : null}
                            </p>
                        </div>

                        <div className="px-6 md:px-8 pb-8 space-y-0">

                            <div className="flex items-center gap-4 pt-1 pb-2">
                                <h2
                                    className="text-[20px] md:text-[24px] font-medium text-black leading-[2.0] whitespace-nowrap uppercase"
                                    style={{ fontFamily: "'Anek Tamil Medium', sans-serif" }}
                                >
                                    SELECT DATE &amp; TIME
                                </h2>
                                <div className="flex-1 h-[1px] bg-[#AEAEAE]/30 mt-1" />
                            </div>

                            <div className="flex items-center gap-2 flex-wrap pb-4">
                                {/* Month pill */}
                                <div
                                    className="flex items-center justify-center bg-[#D9D9D9] rounded-[15px] shrink-0"
                                    style={{ width: 53, height: 66 }}
                                >
                                    <span
                                        className="text-[24px] font-medium text-black"
                                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: "'Anek Tamil Medium', sans-serif" }}
                                    >
                                        {curMonth}
                                    </span>
                                </div>

                                {dates.map((d) => (
                                    <button
                                        key={d.key}
                                        onClick={() => setSelectedDate(d.key)}
                                        className={`flex flex-col items-center justify-center rounded-[15px] shrink-0 transition-all duration-150 ${selectedDate === d.key
                                            ? 'bg-black text-white'
                                            : 'text-black'
                                            }`}
                                        style={{ width: 53, height: 66, border: "0.5px solid #aeaeae" }}

                                    >
                                        <span
                                            className="text-[28px] md:text-[33px] font-medium leading-none "
                                            style={{ fontFamily: "'Anek Tamil Medium', sans-serif" }}
                                        >
                                            {d.label}
                                        </span>
                                        <span className={`text-[12px] font-medium mt-[-3px] ${selectedDate === d.key ? 'text-white/80' : 'text-black/60'}`} style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                            {d.day}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 pt-4 pb-3">
                                <h2
                                    className="text-[20px] md:text-[24px] font-medium text-black leading-[2.0] whitespace-nowrap uppercase"
                                    style={{ fontFamily: "'Anek Tamil Medium', sans-serif" }}
                                >
                                    DURATION
                                </h2>
                                <div className="flex-1 h-[1px] bg-[#AEAEAE]/30 mt-1" />
                            </div>

                            <div className="pb-4">
                                <div
                                    className="inline-flex items-center border-[0.5px] border-[#686868] rounded-[15px] overflow-hidden"
                                    style={{ width: 132, height: 66 }}
                                >
                                    <button
                                        onClick={() => setDuration(d => Math.max(1, d - 1))}
                                        className="flex-1 h-full text-[35px] font-medium text-black flex items-center justify-center"
                                        style={{ fontFamily: "'Anek Tamil Medium', sans-serif" }}
                                    >
                                        −
                                    </button>
                                    <div className="flex-[1.5] h-full flex items-center justify-center">
                                        <span
                                            className="text-[20px] md:text-[24px] font-medium text-black whitespace-nowrap"
                                            style={{ fontFamily: "'Anek Tamil Medium', sans-serif" }}
                                        >
                                            {durationLabel}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setDuration(d => Math.min(16, d + 1))}
                                        className="flex-1 h-full text-[35px] font-medium text-black flex items-center justify-center"
                                        style={{ fontFamily: "'Anek Tamil Medium', sans-serif" }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Status banners */}
                            {!loadingSlots && (() => {
                                const ranges = resolveVenueTimes();
                                const venueEnd = Math.max(...ranges.map(r => r.end), 0);
                                const now = new Date();
                                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                                const isToday = selectedDate === now.toISOString().split('T')[0];
                                const isClosedNow = isToday && currentMinutes >= venueEnd;
                                const totalSlots = blockSlots.length;
                                const freeSlots = courts.length === 0 ? totalSlots : blockSlots.filter(b =>
                                    courts.some(c => isWindowAvailable(c.name, b.startMin, b.endMin))
                                ).length;

                                if (isClosedNow) return (
                                    <div className="bg-red-50 border border-red-100 rounded-[15px] p-4 text-center mb-4">
                                        <p className="text-red-700 font-bold text-[18px] uppercase tracking-wide">Venue is currently closed</p>
                                        <p className="text-red-600 text-[14px] mt-1">Please select another date.</p>
                                    </div>
                                );
                                if (isToday && totalSlots === 0) return (
                                    <div className="bg-zinc-50 border border-zinc-200 rounded-[15px] p-4 text-center mb-4">
                                        <p className="text-zinc-700 font-bold text-[18px] uppercase tracking-wide">No more slots today</p>
                                    </div>
                                );
                                if (totalSlots > 0 && freeSlots === 0) return (
                                    <div className="bg-orange-50 border border-orange-100 rounded-[15px] p-4 text-center mb-4">
                                        <p className="text-orange-700 font-bold text-[18px] uppercase tracking-wide">Fully Booked</p>
                                    </div>
                                );
                                return null;
                            })()}

                            <div className="w-full border border-[#AEAEAE] rounded-full p-1 flex mb-6">
                                {PERIODS.map((p) => {
                                    const isActive = activePeriod === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setActivePeriod(p.id);
                                                setSlotOffset(0);
                                                setSelectedSlot(null);
                                                setSelectedCourtIds([]);
                                            }}
                                            className={`flex-1 py-2 text-[16px] md:text-[20px] font-medium rounded-full transition-all duration-200 ${isActive
                                                ? 'bg-black text-white shadow-sm'
                                                : 'text-[#686868] hover:text-black'
                                                }`}
                                            style={{ fontFamily: "'Anek Tamil Medium', sans-serif" }}
                                        >
                                            {p.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Slot chips header stays padded */}
                            <div className="flex items-center gap-4 pt-4 pb-1">
                                <h2
                                    className="text-[20px] md:text-[24px] font-medium text-black leading-[1.2] whitespace-nowrap uppercase"
                                    style={{ fontFamily: "'Anek Tamil Medium'" }}
                                >
                                    AVAILABLE TIME SLOTS
                                </h2>
                                <div className="flex-1 h-[1px] bg-[#AEAEAE]/30 mt-1" />
                            </div>
                        </div>

                        {/* Full-width Slots Section with edge-to-edge arrows */}
                        <div className="pb-2">
                            {loadingSlots ? (
                                <div className="px-6 md:px-8 flex items-center gap-2 text-[12px] text-zinc-400 py-1">
                                    <div className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                                    Checking availability…
                                </div>
                            ) : periodSlots.length === 0 ? (
                                <p className="px-6 md:px-8 text-[#686868] text-[13px] py-1">No slots available for this period.</p>
                            ) : (
                                <div className="relative w-full">
                                    {/* Left Arrow - Only show when selected */}
                                    {selectedSlot && periodSlots.length > 5 && (
                                        <button
                                            onClick={() => {
                                                setSlotOffset(prev => Math.max(0, prev - 5));
                                            }}
                                            disabled={slotOffset === 0}
                                            className={`absolute left-0 top-0 z-10 w-10 h-[66px] flex items-center justify-center bg-white/80 backdrop-blur-sm border-r border-y border-zinc-200 rounded-r-[15px] transition-colors ${slotOffset === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-zinc-100'}`}
                                        >
                                            <ChevronLeft size={24} className="text-[#686868]" />
                                        </button>
                                    )}

                                    <div
                                        className={`flex items-center gap-2 ${!selectedSlot ? 'justify-start flex-wrap px-6 md:px-8' : 'justify-center flex-nowrap overflow-x-auto px-6 md:px-8'}`}
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                                    >
                                        <style dangerouslySetInnerHTML={{ __html: `.flex-nowrap::-webkit-scrollbar { display: none; }` }} />
                                        {(selectedSlot ? periodSlots.slice(slotOffset, slotOffset + 5) : periodSlots).map((b, i) => {
                                            const isSelected = selectedSlot === b.label;
                                            const hasFreeCourt = courts.length === 0 ? true : courts.some(c => isWindowAvailable(c.name, b.startMin, b.endMin));

                                            return (
                                                <div key={i} className="relative shrink-0">
                                                    <button
                                                        disabled={!hasFreeCourt}
                                                        onClick={() => {
                                                            if (hasFreeCourt) {
                                                                if (isSelected) {
                                                                    setSelectedSlot(null);
                                                                    setSelectedCourtIds([]);
                                                                    setSlotOffset(0);
                                                                } else {
                                                                    // Only change offset if it's the very first selection
                                                                    if (!selectedSlot) {
                                                                        const idx = periodSlots.findIndex(s => s.label === b.label);
                                                                        setSlotOffset(Math.max(0, idx - 2));
                                                                    }
                                                                    setSelectedSlot(b.label);
                                                                    setSelectedCourtIds([]);
                                                                }
                                                            }
                                                        }}
                                                        className={`relative inline-flex items-center justify-center rounded-[15px] border transition-all duration-150 shrink-0 ${!hasFreeCourt
                                                            ? 'border-[#aeaeae] cursor-not-allowed'
                                                            : isSelected
                                                                ? 'bg-black text-white border-[#686868]'
                                                                : 'bg-white text-black border-[#aeaeae] hover:border-[#aeaeae]'
                                                            }`}
                                                        style={{ width: 132, height: 66, fontFamily: "'Anek Tamil Medium', sans-serif" }}
                                                    >
                                                        <span className="text-[20px] md:text-[24px] font-medium uppercase">
                                                            {formatTimeSimple(b.startMin, false)}-{formatTimeSimple(b.endMin, true)}
                                                        </span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Right Arrow - Only show when selected */}
                                    {selectedSlot && periodSlots.length > 5 && (
                                        <button
                                            onClick={() => {
                                                setSlotOffset(prev => Math.min(periodSlots.length - 5, prev + 5));
                                            }}
                                            disabled={slotOffset >= periodSlots.length - 5}
                                            className={`absolute right-0 top-0 z-10 w-10 h-[66px] flex items-center justify-center bg-white/80 backdrop-blur-sm border-l border-y border-zinc-200 rounded-l-[15px] transition-colors ${slotOffset >= periodSlots.length - 5 ? 'opacity-0 pointer-events-none' : 'hover:bg-zinc-100'}`}
                                        >
                                            <ChevronRight size={24} className="text-[#686868]" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="px-6 md:px-8 pb-8 space-y-0">



                            {selectedSlot && (
                                <>
                                    <div className="pt-4 pb-3">
                                        <h2
                                            className="text-[20px] md:text-[24px] font-medium text-black leading-[1.5]"
                                            style={{ fontFamily: "'Anek Tamil Medium'" }}
                                        >
                                            AVAILABLE COURTS
                                        </h2>
                                    </div>

                                    {loadingSlots ? (
                                        <div className="flex items-center gap-2 text-[12px] text-zinc-400 pb-4">
                                            <div className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" /> Checking availability…
                                        </div>
                                    ) : courts.length === 0 ? (
                                        <p className="text-[#686868] text-[13px] pb-4">No courts configured for this venue.</p>
                                    ) : (
                                        <div className="space-y-3 pb-4">
                                            {courts.map((court, index) => {
                                                const uniqueId = `${court.id}-${index}`;
                                                const selBlock = blockSlots.find(b => b.label === selectedSlot);
                                                const isAvailable = selBlock ? isWindowAvailable(court.name, selBlock.startMin, selBlock.endMin) : false;
                                                const isSelected = selectedCourtIds.includes(uniqueId);
                                                const remainingCount = blockSlots.filter(b => isWindowAvailable(court.name, b.startMin, b.endMin)).length;
                                                const linePrice = Math.round((resolveEffectiveHourlyPrice() ?? court.price) * effectiveDurationSlots / 2);

                                                return (
                                                    <div
                                                        key={uniqueId}
                                                        onClick={() => isAvailable && toggleCourt(uniqueId)}
                                                        className={`flex items-center gap-4 rounded-[12px] transition-all duration-150 ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    >
                                                        {/* Court image */}
                                                        <div className="relative rounded-[12px] overflow-hidden shrink-0 bg-[#D9D9D9] flex items-center justify-center" style={{ width: 145, height: 82 }}>
                                                            {court.image_url ? (
                                                                <Image src={court.image_url} alt={court.name} fill sizes="145px" className="object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3a2fc7,#5b4de8 60%,#7c6ff5)' }}>
                                                                    <span className="text-white font-black text-xs tracking-tight" style={{ fontFamily: 'var(--font-anek-latin)' }}>TICPIN</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Court info */}
                                                        <div className="flex-1 space-y-0">
                                                            <p className="text-[18px] md:text-[20px] font-semibold text-black leading-[1.4] uppercase" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                                {court.name}
                                                            </p>
                                                            <p className="text-[14px] md:text-[16px] font-medium text-[#686868] leading-[1.4] uppercase" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                                {court.type}
                                                            </p>
                                                            <div className="pt-2">
                                                                <p className="text-[16px] md:text-[18px] font-semibold text-black leading-[1.4] uppercase inline-block" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                                    ₹{resolveEffectiveHourlyPrice() ?? court.price}
                                                                    <span className="text-[12px] font-normal text-[#686868]"> / hr</span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Checkbox */}
                                                        <div
                                                            className={`shrink-0 flex items-center justify-center rounded-[6px] border-2 transition-all duration-150 ${isSelected ? 'bg-black border-black' : 'bg-white border-[#686868]'}`}
                                                            style={{ width: 28, height: 28 }}
                                                        >
                                                            {isSelected && (
                                                                <svg width="12" height="10" viewBox="0 0 16 13" fill="none">
                                                                    <path d="M1.5 6.5L5.5 10.5L14.5 1.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Ticpass Apply */}
                                    {pass && pass.benefits.turf_bookings.remaining > 0 && (
                                        <section className="bg-amber-50 rounded-[20px] p-6 border border-amber-200 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                                                    <Zap size={24} fill="currentColor" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-amber-900">Ticpin Pass Active</h3>
                                                    <p className="text-sm text-amber-700 font-medium">Use 1 of your {pass.benefits.turf_bookings.remaining} free bookings</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setUsePass(!usePass)}
                                                className={`px-6 h-11 rounded-xl font-bold transition-all ${usePass
                                                    ? 'bg-amber-600 text-white shadow-inner'
                                                    : 'bg-white text-amber-600 border border-amber-300 hover:bg-amber-100'
                                                    }`}
                                            >
                                                {usePass ? 'Pass Applied' : 'Apply Pass'}
                                            </button>
                                        </section>
                                    )}

                                    {/* Price summary */}
                                    {selectedCourtIds.length > 0 && (
                                        <section className="bg-zinc-50 rounded-[14px] p-4 border border-zinc-200 space-y-1">
                                            {selectedCourtIds.map(uid => {
                                                const court = courts.find((c, idx) => `${c.id}-${idx}` === uid);
                                                if (!court) return null;
                                                const linePrice = Math.round((resolveEffectiveHourlyPrice() ?? court.price) * effectiveDurationSlots / 2);
                                                return (
                                                    <div key={uid} className="flex justify-between text-[15px]">
                                                        <span className="text-black font-medium">{court.name} × {effectiveDurationLabel}</span>
                                                        <span className={`font-semibold ${usePass ? 'text-zinc-400 line-through decoration-red-500' : 'text-black'}`}>₹{linePrice}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="border-t border-zinc-300 pt-2 mt-2 flex justify-between text-[16px] font-bold">
                                                <span>Total</span>
                                                <span className="flex items-center gap-2">
                                                    {usePass && (
                                                        <span className="text-[12px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded tracking-widest uppercase">
                                                            PASS APPLIED
                                                        </span>
                                                    )}
                                                    <span className={usePass ? 'text-green-600' : ''}>
                                                        ₹{usePass ? 0 : selectedCourtIds.reduce((s, uid) => {
                                                            const court = courts.find((c, idx) => `${c.id}-${idx}` === uid);
                                                            return s + Math.round((resolveEffectiveHourlyPrice() ?? court?.price ?? 0) * effectiveDurationSlots / 2);
                                                        }, 0)}
                                                    </span>
                                                </span>
                                            </div>
                                        </section>
                                    )}

                                    {/* ── BOOK SLOTS CTA ─────────── */}
                                    <div className="border-t border-[#686868]/30 pt-4">
                                        <button
                                            onClick={handleBooking}
                                            disabled={selectedCourtIds.length === 0}
                                            className="w-full bg-black text-white rounded-[6px] transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                                            style={{ height: 40 }}
                                        >
                                            <span
                                                style={{ fontFamily: "'Anek Tamil Medium', sans-serif", fontWeight: 500, fontSize: 25, lineHeight: '1', display: 'inline-block', transform: 'scaleY(1.1)' }}
                                                className="uppercase text-white"
                                            >
                                                BOOK SLOTS
                                            </span>
                                        </button>
                                        {selectedCourtIds.length === 0 && (
                                            <p className="text-center text-[16px] text-[#686868] mt-2"
                                                style={{ fontFamily: 'var(--font-anek-tamil)' }}
                                            >
                                                Select a court to continue
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <ProfileDrawer
                isOpen={isProfileDrawerOpen}
                onClose={() => setIsProfileDrawerOpen(false)}
                userSession={userSession}
                session={organizerSession}
                onUserLogout={handleUserLogout}
                onOrganizerLogout={handleOrganizerLogoutInternal}
                router={router}
            />

            <AuthModal
                isOpen={showAuthModal}
                onClose={handleAuthModalClose}
                initialView={authView}
            />

            <LocationModal
                isOpen={isLocationOpen}
                onClose={() => setIsLocationOpen(false)}
                onSelect={setLocation}
            />

            <style>{`
                @font-face {
                    font-family: 'Anek Tamil Bold';
                    src: url('/AnekTamil_Condensed-Bold.ttf') format('truetype');
                    font-weight: bold;
                    font-style: normal;
                }

                @font-face {
                    font-family: 'Anek Tamil Medium';
                    src: url('/AnekTamil_Condensed-Medium.ttf') format('truetype');
                    font-weight: 500;
                    font-style: normal;
                }

                @import url('https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;500;600;700;800&family=Anek+Tamil+Condensed:wght@400;500;600;700&display=swap');
                
                :root {
                    --font-anek-latin: 'Anek Latin', sans-serif;
                    --font-anek-tamil: 'Anek Tamil Condensed', sans-serif;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d1d1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a1a1a1;
                }
            `}</style>
        </div>
    );
}
