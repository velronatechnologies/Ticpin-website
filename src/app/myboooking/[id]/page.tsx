'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, RefreshCw, Ticket, X, MessageCircle, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useUserSession, clearUserSession } from '@/lib/auth/user';
import { bookingApi } from '@/lib/api/booking';
import { profileApi } from '@/lib/api/profile';

function BookingDetailsContent() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.id as string;
    const session = useUserSession();

    useEffect(() => {
        const checkDesktop = () => {
            if (window.innerWidth >= 768) {
                document.cookie = "device_view=desktop; path=/; max-age=31536000";
                const search = window.location.search || '';
                router.replace(`/bookings/${bookingId}${search}`);
            } else {
                document.cookie = "device_view=mobile; path=/; max-age=31536000";
            }
        };
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, [router, bookingId]);

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    // Modal state
    const [isBillDetailsOpen, setIsBillDetailsOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const reasons = [
        "Plan change",
        "Found a better offer elsewhere",
        "Booked by mistake",
        "Others",
    ];

    const fetchBookingDetails = useCallback(async () => {
        if (!bookingId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await bookingApi.getMobileBookingDetails(bookingId, session?.id);
            setBooking(data);
        } catch (err: any) {
            console.error('Failed to fetch mobile booking details:', err);
            if (err.message === 'UNAUTHORIZED') {
                clearUserSession();
                router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                return;
            }
            setError(err.message || 'Failed to load booking details.');
        } finally {
            setLoading(false);
        }
    }, [bookingId, session?.id, router]);

    useEffect(() => {
        if (session?.id) {
            fetchBookingDetails();
        } else {
            setLoading(false);
        }
    }, [session?.id, fetchBookingDetails]);

    useEffect(() => {
        if (!loading && !session) {
            router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
    }, [loading, session, router]);

    // Fetch profile photo
    useEffect(() => {
        if (session?.id) {
            profileApi
                .getProfile(session.id)
                .then((p) => {
                    if (p?.profilePhoto) setProfilePhoto(p.profilePhoto);
                })
                .catch((err) => console.error("Failed to fetch profile:", err));
        }
    }, [session]);

    const formatPrice = (val: any) => {
        const num = Number(val || 0);
        return num.toLocaleString('en-IN');
    };

    const formatDisplayDate = (value?: string, fallback?: string) => {
        const raw = value || fallback;
        if (!raw) return "Date TBA";
        const parsed = new Date(raw);
        if (isNaN(parsed.getTime())) return raw;
        return parsed.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const formatBookingDate = (value?: string, fallback?: string) => {
        const raw = value || fallback;
        if (!raw) return "Date unavailable";
        const parsed = new Date(raw);
        if (isNaN(parsed.getTime())) return raw;
        return parsed.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatDisplayTime = (value?: string) => {
        const raw = (value || "").trim();
        if (!raw) return "TBA";

        const formatSingleTime = (part: string) => {
            const timePart = part.trim();
            if (!timePart) return "";
            const layouts = [/^(\d{1,2}):(\d{2})$/, /^(\d{1,2}):(\d{2}):(\d{2})$/];
            for (const layout of layouts) {
                const match = timePart.match(layout);
                if (match) {
                    const hours = Number(match[1]);
                    const minutes = Number(match[2]);
                    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
                        const date = new Date();
                        date.setHours(hours, minutes, 0, 0);
                        return date
                            .toLocaleTimeString("en-IN", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })
                            .toUpperCase();
                    }
                }
            }
            return timePart;
        };

        if (raw.includes("-")) {
            return raw.split("-").map(formatSingleTime).filter(Boolean).join(" - ");
        }

        return formatSingleTime(raw);
    };

    const handleCancelSubmit = async () => {
        if (!selectedReason || !booking) return;
        setCancelling(true);
        try {
            await bookingApi.cancelBooking(
                booking.id,
                booking.type || "play",
                selectedReason,
                0
            );
            setIsCancelModalOpen(false);
            await fetchBookingDetails();
        } catch (err: any) {
            alert(err.message || 'Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
                <RefreshCw className="animate-spin text-zinc-400 mb-3" size={36} />
                <p className="text-zinc-500 text-sm">Loading ticket details...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
                <AlertCircle className="text-red-500 mb-3" size={48} />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Ticket</h2>
                <p className="text-zinc-500 text-sm mb-6 max-w-sm">{error || "This booking details could not be found."}</p>
                <Link href="/myboooking" className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold">
                    Go Back to Bookings
                </Link>
            </div>
        );
    }

    const isCancelled = booking.status === "cancelled" || booking.status === "refunded";
    const isExpired = booking.date
        ? new Date(booking.date).getTime() < new Date().setHours(0, 0, 0, 0)
        : false;

    // Determine Status Styling
    let radialGradientString = 'radial-gradient(805.65% 34.86% at 50% 5.31%, #D6FAE5 0%, #FFFFFF 100%)';
    let statusHeading = 'Booking confirmed!';
    let statusIcon = (
        <svg width="61" height="61" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
            <circle cx="30.5" cy="30.5" r="30.5" fill="#0AC655"/>
            <path d="M20 31L27 38L41 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    if (isCancelled) {
        radialGradientString = 'radial-gradient(805.65% 34.86% at 50% 5.31%, #FFD6D6 0%, #FFFFFF 100%)';
        statusHeading = 'Booking cancelled';
        statusIcon = (
            <svg width="61" height="61" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                <circle cx="30.5" cy="30.5" r="30.5" fill="#EF4444"/>
                <path d="M21 21L40 40M40 21L21 40" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        );
    } else if (isExpired) {
        radialGradientString = 'radial-gradient(805.65% 34.86% at 50% 5.31%, #FFE4CC 0%, #FFFFFF 100%)';
        statusHeading = 'Booking expired';
        statusIcon = (
            <svg width="61" height="61" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                <circle cx="30.5" cy="30.5" r="30.5" fill="#D97706"/>
                <path d="M30.5 18V36M30.5 44H30.51" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        );
    }

    const bookingTotal = booking.grand_total ?? booking.order_amount ?? 0;
    const orderAmountValue = Number(booking.order_amount || 0);
    const bookingFeeValue = Number(booking.booking_fee || 0);
    const basePlatformFee = bookingFeeValue > 0 ? bookingFeeValue / 1.18 : 0;
    const gstOnFee = bookingFeeValue - basePlatformFee;
    const donationValue = Number(booking.donation_amount || 0);
    const discountValue = Number(booking.discount_amount || 0);

    const displayName = booking.event_name || booking.venue_name || 'Booking';
    const displayDate = formatDisplayDate(booking.date, booking.booked_at);
    const displayTime = formatDisplayTime(booking.time);
    const displayDateTime = `${displayDate} | ${displayTime}`;
    const displayLocation = booking.venue_address || booking.address || booking.city || "Venue Location";

    const displayTicketSummary = Array.isArray(booking.tickets) && booking.tickets.length > 0
        ? booking.tickets.map((t: any) => `${t.category || "Ticket"} - ${t.quantity || 1}`).join(", ")
        : "Ticket - 1";

    const displayQuantity = booking.type === "play"
        ? `${booking.duration ? booking.duration * 30 : "60"} mins`
        : booking.type === "dining"
            ? `${booking.tickets?.[0]?.quantity || 1} guests`
            : displayTicketSummary;

    const displayBillValue = bookingTotal === 0 ? "FREE" : `₹${formatPrice(Number(bookingTotal || 0))}`;
    const displayUserName = booking.user_name || session?.name || "User";
    const displayUserPhone = booking.user_phone || session?.phone || "N/A";
    const displayUserEmail = booking.user_email || session?.email || "";
    const displayBookingDate = formatBookingDate(booking.booked_at);
    const imageSrc = booking.play_image || booking.event_image_url || booking.venue_image_url || null;

    return (
        <div className="min-h-screen pb-20 font-[family-name:var(--font-anek-latin)]" style={{ background: radialGradientString, fontFamily: "'Anek Latin', sans-serif" }}>
            
            {/* Header: Circle wrapper matching Ellipse 1 (31px x 31px) */}
            <header className="sticky top-0 z-40 flex items-center h-14 px-6 justify-between bg-transparent">
                <button 
                    onClick={() => router.back()} 
                    className="w-[31px] h-[31px] rounded-full flex items-center justify-center active:opacity-60 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.1)' }}
                >
                    <ArrowLeft size={16} className="text-black" />
                </button>
                <span className="text-[15px] font-bold text-black uppercase tracking-[0.1em]">TICKET DETAILS</span>
                <div className="w-[31px]" />
            </header>

            <main className="px-6 flex flex-col items-center pt-4 space-y-6">
                
                {/* 1. Status Check and Icon */}
                <div className="text-center space-y-2">
                    {statusIcon}
                    <h1 className="text-[22px] font-semibold text-black leading-[24px]">
                        {statusHeading}
                    </h1>
                </div>

                {/* 2. Top Event Badge & Info Block (w-[334px] matching list) */}
                <div className="flex gap-4 items-center w-[334px]">
                    {/* Rectangle 131: image box */}
                    <div 
                        className="w-[89px] h-[119px] bg-[#BDB1F3] rounded-[15px] overflow-hidden shrink-0 flex items-center justify-center border border-zinc-200"
                    >
                        {imageSrc ? (
                            <img src={imageSrc} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <Ticket size={24} className="text-white/40" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        {/* {NAME} */}
                        <h2 className="text-[18px] font-medium text-black truncate leading-[20px]">
                            {displayName}
                        </h2>
                        {/* {Location} */}
                        <p className="text-[12px] font-medium text-[#686868] mt-1.5 leading-[13px]">
                            {displayLocation}
                        </p>
                    </div>
                </div>

                {/* 3. Rectangle 546: Date & Time Box (w-[334px] h-[88px]) */}
                <div 
                    className="w-[334px] bg-white border border-[#D9D9D9] rounded-[10px] px-4 py-3.5 flex flex-col justify-between"
                    style={{ height: '88px' }}
                >
                    {/* {DATE | TIME} */}
                    <span className="text-[15px] font-medium text-black leading-[16px] truncate">
                        {displayDateTime}
                    </span>

                    {/* Divider Line 210 */}
                    <div className="border-t border-[#AEAEAE] w-full" />

                    {/* {NO.OF TICKETS} */}
                    <span className="text-[15px] font-medium text-black leading-[16px] truncate">
                        {displayQuantity}
                    </span>
                </div>

                {/* 4. Rectangle 547: TICKETS QR Section (w-[334px] h-[230px]) */}
                {!isCancelled && !isExpired && (
                    <div className="w-[334px] bg-white border border-[#D9D9D9] rounded-[10px] py-5 flex flex-col items-center justify-center space-y-4" style={{ height: '230px' }}>
                        <h3 className="text-[18px] font-medium text-black uppercase tracking-[0.1em] leading-[20px]">
                            TICKETS
                        </h3>

                        {/* Rectangle 548: QR wrapper (w-[146px] h-[146px]) */}
                        <div className="w-[146px] h-[146px] bg-[#D9D9D9] rounded-[10px] p-1.5 flex items-center justify-center">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(booking.booking_id || booking.id)}`} 
                                alt="Entry QR" 
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                )}

                {/* 5. Rectangle 549: ORDER DETAILS Box (w-[334px] h-[148px]) */}
                <div className="space-y-2.5">
                    <h3 className="text-[18px] font-medium text-black uppercase tracking-[0.1em] leading-[20px] text-center">
                        ORDER DETAILS
                    </h3>

                    <div className="w-[334px] bg-white border border-[#D9D9D9] rounded-[10px] px-5 py-4 flex flex-col justify-between" style={{ height: '148px' }}>
                        {/* Invoice & Total bill */}
                        <div className="flex gap-3 items-start cursor-pointer hover:opacity-85" onClick={() => setIsBillDetailsOpen(true)}>
                            {/* invoice icon wrapper */}
                            <div className="w-6 h-6 shrink-0 flex items-center justify-center bg-[#F5F5F5] rounded-md">
                                <span className="text-black font-semibold text-sm">₹</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-medium text-black leading-[16px]">
                                    Total bill: {displayBillValue}
                                </p>
                                <p className="text-[12px] font-normal text-[#686868] mt-0.5 leading-[13px]">
                                    Incl. taxes & fees
                                </p>
                            </div>
                        </div>

                        {/* Line 212 */}
                        <div className="border-t border-[#AEAEAE] w-full" />

                        {/* User credentials */}
                        <div>
                            <p className="text-[15px] font-normal text-black leading-[16px] truncate">
                                Invoice sent to {displayUserName}
                            </p>
                            <p className="text-[12px] font-normal text-[#686868] mt-0.5 whitespace-pre-line leading-[14px]">
                                {displayUserPhone}
                                {displayUserEmail ? ` · ${displayUserEmail}` : ''}
                            </p>
                        </div>
                    </div>

                    <div className="text-[12px] font-medium text-[#686868] space-y-1 mt-2.5 px-1 uppercase leading-[13px] text-center w-[334px]">
                        <p>Booking ID: {booking.booking_id || booking.id}</p>
                        <p>Booking Date: {displayBookingDate}</p>
                    </div>
                </div>

                {/* 6. Cancel Booking Option */}
                {!isCancelled && !isExpired && (
                    <div className="text-center pt-2">
                        <button 
                            onClick={() => {
                                setSelectedReason(null);
                                setIsCancelModalOpen(true);
                            }}
                            className="text-[15px] font-semibold text-[#ED4D1B] underline leading-[16px] uppercase tracking-wide"
                        >
                            Cancel booking
                        </button>
                    </div>
                )}

                {/* 7. Rectangle 550: NEED HELP WITH BOOKING Box (w-[334px] h-[114px]) */}
                <div className="space-y-2.5">
                    <h3 className="text-[18px] font-medium text-black uppercase tracking-[0.1em] leading-[20px] text-center">
                        NEED HELP WITH BOOKING
                    </h3>

                    <div className="w-[334px] bg-white border border-[#D9D9D9] rounded-[10px] px-5 py-4 flex flex-col justify-between" style={{ height: '114px' }}>
                        {/* Chat Link */}
                        <Link href="/chat-support" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                            <MessageCircle size={20} className="text-black shrink-0" />
                            <span className="text-[15px] font-medium text-black leading-[16px]">
                                Chat with support
                            </span>
                        </Link>

                        {/* Line 213 */}
                        <div className="border-t border-[#AEAEAE] w-full" />

                        {/* Terms link */}
                        <Link href="/terms" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                            <FileText size={20} className="text-black shrink-0" />
                            <span className="text-[15px] font-medium text-black leading-[16px]">
                                Terms and conditions
                            </span>
                        </Link>
                    </div>
                </div>

            </main>

            {/* A. Bill Details Overlay */}
            {isBillDetailsOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsBillDetailsOpen(false)} />
                    <div className="relative w-full max-w-[420px] bg-white rounded-t-[20px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Bill details</h3>
                            <button onClick={() => setIsBillDetailsOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-800" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {orderAmountValue > 0 && (
                                <div className="flex justify-between text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                    <span>Ticket Value</span>
                                    <span>₹{formatPrice(orderAmountValue)}</span>
                                </div>
                            )}
                            {bookingFeeValue > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-semibold text-gray-900 uppercase tracking-wide">
                                        <span>Convenience Fee</span>
                                        <span>₹{formatPrice(bookingFeeValue)}</span>
                                    </div>
                                    <div className="pl-3 space-y-1.5 border-l-2 border-gray-100">
                                        <div className="flex justify-between text-[12px] font-semibold text-gray-400 uppercase tracking-wide">
                                            <span>Base Fee</span>
                                            <span>₹{formatPrice(basePlatformFee)}</span>
                                        </div>
                                        <div className="flex justify-between text-[12px] font-semibold text-gray-400 uppercase tracking-wide">
                                            <span>GST (18%)</span>
                                            <span>₹{formatPrice(gstOnFee)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {discountValue > 0 && (
                                <div className="flex justify-between text-sm font-bold text-green-600 uppercase tracking-wide">
                                    <span>Discounts</span>
                                    <span>-₹{formatPrice(discountValue)}</span>
                                </div>
                            )}
                            {donationValue > 0 && (
                                <div className="flex justify-between text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                    <span>Donations</span>
                                    <span>₹{formatPrice(donationValue)}</span>
                                </div>
                            )}

                            <div className="h-[1px] bg-gray-100 my-4" />

                            <div className="flex justify-between text-base font-bold text-gray-950 uppercase tracking-wider">
                                <span>Grand Total</span>
                                <span>₹{formatPrice(bookingTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* B. Cancellation Modal Overlay */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => !cancelling && setIsCancelModalOpen(false)} />
                    
                    <div className="relative w-full max-w-[360px] bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-black uppercase text-gray-900 tracking-tight">Cancel Ticket</h3>
                            <button onClick={() => setIsCancelModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors" disabled={cancelling}>
                                <X className="w-5 h-5 text-gray-800" />
                            </button>
                        </div>

                        <p className="text-[13px] text-gray-500 mb-5 leading-snug">
                            Please select a reason to submit your booking cancellation request.
                        </p>

                        <div className="flex flex-col gap-2.5 mb-6">
                            {reasons.map((reason) => (
                                <button
                                    key={reason}
                                    onClick={() => setSelectedReason(reason)}
                                    className={`w-full py-3 px-4 rounded-xl text-[13px] font-bold uppercase tracking-wider text-left border-2 transition-all ${
                                        selectedReason === reason
                                            ? "bg-black text-white border-black shadow-sm"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleCancelSubmit}
                            disabled={!selectedReason || cancelling}
                            className={`w-full py-3.5 rounded-xl text-[14px] font-bold uppercase tracking-wider transition-all flex items-center justify-center ${
                                selectedReason && !cancelling
                                    ? "bg-black text-white hover:opacity-90 shadow-md"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {cancelling ? <RefreshCw className="animate-spin text-zinc-500" size={18} /> : "Confirm Cancellation"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MyBookingDetailsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <BookingDetailsContent />
        </Suspense>
    );
}
