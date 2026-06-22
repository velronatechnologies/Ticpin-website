'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    CheckCircle, MessageSquare, User, X, XCircle, Download, Check, 
    MapPin, Navigation, RefreshCw, Ticket, PlayCircle, Utensils, 
    ChevronLeft, Calendar, Clock, Users, FileText
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { bookingApi } from '@/lib/api/booking';
import { profileApi } from '@/lib/api/profile';
import { useUserSession } from '@/lib/auth/user';
import { toast } from '@/components/ui/Toast';

interface BookingDetailsClientProps {
    initialBooking: any;
}

export default function BookingDetailsClient({ initialBooking }: BookingDetailsClientProps) {
    const router = useRouter();
    const session = useUserSession();
    const ticketRef = useRef<HTMLDivElement>(null);

    const [booking, setBooking] = useState<any>(initialBooking);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [donationStep, setDonationStep] = useState<'reason' | 'donate'>('reason');
    const [donationType, setDonationType] = useState<'full' | 'partial' | 'none' | null>(null);
    const [customDonationAmount, setCustomDonationAmount] = useState<number>(0);
    const [cancelling, setCancelling] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const reasons = [
        "Plan change",
        "Found a better offer elsewhere",
        "Booked by mistake",
        "Others"
    ];

    const paidAmount = (() => {
        const direct = Number(
            booking.grandTotal ??
            booking.grand_total ??
            booking.amount ??
            booking.orderAmount ??
            booking.order_amount ??
            booking.totalAmount ??
            booking.total_amount ??
            NaN
        );
        if (!Number.isNaN(direct) && direct > 0) return direct;
        if (Array.isArray(booking.tickets)) {
            const ticketTotal = booking.tickets.reduce((sum: number, t: any) => {
                const qty = Number(t?.quantity ?? 1) || 1;
                const price = Number(t?.price ?? 0) || 0;
                return sum + price * qty;
            }, 0);
            if (ticketTotal > 0) return ticketTotal;
        }
        return 0;
    })();
    const shouldShowDonationOptions = paidAmount >= 2;

    useEffect(() => {
        const userIdToFetch = booking?.user_id || booking?.userId;
        if (userIdToFetch) {
            profileApi.getProfile(userIdToFetch).then(p => {
                if (p?.profilePhoto) setProfilePhoto(p.profilePhoto);
            }).catch(err => console.error('Failed to fetch profile:', err));
        }
    }, [booking?.userId, booking?.user_id]);

    const handleReasonSelect = (reason: string) => {
        setSelectedReason(reason);
        handleCancelSubmit(reason, 0);
    };

    const handleCancelSubmit = async (reasonOverride?: string, donationAmountOverride?: number) => {
        const reason = reasonOverride || selectedReason;
        if (!reason || !booking) return;
        
        let finalDonationAmount = donationAmountOverride !== undefined ? donationAmountOverride : 0;
        if (donationAmountOverride === undefined && donationStep === 'donate') {
            if (donationType === 'full') {
                finalDonationAmount = paidAmount;
            } else if (donationType === 'partial') {
                finalDonationAmount = customDonationAmount;
            }
        }

        if (finalDonationAmount < 0) finalDonationAmount = 0;
        if (finalDonationAmount > paidAmount) finalDonationAmount = paidAmount;

        const previousBooking = { ...booking };

        // Optimistic UI Toast notifications
        if (finalDonationAmount > 0) {
            const refundAmount = paidAmount - finalDonationAmount;
            toast.success(`Thank you for your donation of ₹${finalDonationAmount}! Refund of ₹${refundAmount.toFixed(2)} will be processed shortly.`);
        } else {
            toast.success('Booking cancelled successfully. Refund will be processed shortly.');
        }

        // Optimistic UI state updates & modal close
        setIsCancelModalOpen(false);
        setDonationStep('reason');
        setSelectedReason(null);
        setDonationType(null);
        setCustomDonationAmount(0);
        setBooking((prev: any) => prev ? { ...prev, status: 'cancelled' } : null);

        try {
            await bookingApi.cancelBooking(booking.id, booking.type || booking.category || 'play', reason, finalDonationAmount);
            
            // Refresh booking data in the background
            const updatedData = await bookingApi.getBookingDetails(booking.id, session?.id);
            setBooking(updatedData);
        } catch (err) {
            // Rollback UI
            setBooking(previousBooking);
            toast.error(err instanceof Error ? err.message : 'Failed to cancel booking');
        }
    };

    const handleDownloadTicket = async () => {
        if (!ticketRef.current) return;
        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#F5F5F5',
                width: 595, // A4 width in px at 72dpi
                windowWidth: 595,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`TICPIN_Ticket_${booking.booking_id || booking.bookingId || booking.id}.pdf`);
        } catch (err) {
            console.error('PDF generation error:', err);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const isCancelled = booking.status === 'cancelled' || booking.status === 'refunded';
    const isRefunded = booking.status === 'refunded';
    const bookingDate = new Date(booking.date || Date.now());
    const isExpired = bookingDate.getTime() < new Date().setHours(0, 0, 0, 0);
    const venueImage = booking.eventImageUrl || booking.venueImageUrl || booking.playImage || booking.imageUrl || booking.eventImage || booking.venueImage || null;

    return (
        <div className={`bg-white font-[family-name:var(--font-anek-latin)] relative pb-6 ${isCancelModalOpen ? 'overflow-hidden' : ''}`}>
            <header className="h-16 md:h-20 w-full bg-white border-b border-[#D9D9D9] flex items-center px-4 md:px-10 lg:px-[37px] sticky top-0 z-50">
                <div className="flex items-center gap-4 md:gap-10">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-[#D9D9D9] rounded-full hover:bg-zinc-50 transition-colors"
                    >
                        <ChevronLeft size={24} className="text-black" />
                    </button>
                    <Link href="/">
                        <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-6 md:h-7 w-auto" />
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <div className="w-[1.5px] h-8 bg-[#AEAEAE] mx-1" />
                        <div className="flex items-center gap-6">
                            <div className="w-[85px] h-[48px] bg-[#FFEF9A] rounded-[10px] overflow-hidden flex items-center justify-center">
                                {venueImage ? (
                                    <img src={venueImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <MapPin size={24} className="text-black/10" />
                                )}
                            </div>
                            <div className="flex flex-col justify-center">
                                <h2 className="text-[18px] font-medium text-black leading-tight uppercase tracking-tight truncate max-w-[200px]">
                                    {booking.eventName || booking.event_name || booking.venueName || booking.venue_name || booking.title}
                                </h2>
                                <p className="text-[15px] font-medium text-[#686868] leading-tight uppercase tracking-tight mt-0.5 truncate max-w-[200px]">
                                    {booking.address?.split(',')[0] || booking.venueAddress?.split(',')[0] || booking.venue_address?.split(',')[0] || booking.city}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[787px] mx-auto px-4 mt-6 md:mt-[45px] space-y-6">
                <div className="relative bg-white border-[0.5px] border-[#686868] rounded-[25px] overflow-hidden">
                    <div
                        className="absolute inset-0 pointer-events-none opacity-100 transition-colors duration-500"
                        style={{
                            background: isCancelled
                                ? 'radial-gradient(52.97% 102.98% at 0% -7.55%, #FFD6D6 0%, #FFFFFF 100%)'
                                : isExpired
                                ? 'radial-gradient(52.97% 102.98% at 0% -7.55%, #FFE4CC 0%, #FFFFFF 100%)'
                                : 'radial-gradient(52.97% 102.98% at 0% -7.55%, #D6FAE5 0%, #FFFFFF 100%)'
                        }}
                    />

                    <div className="relative p-7 md:p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-[28px] md:text-[34px] font-semibold text-black leading-none uppercase">
                                        {isRefunded ? 'Booking refunded' : isCancelled ? 'Booking cancelled' : isExpired ? 'Booking expired' : 'Booking confirmed'}
                                    </h1>
                                    <div className="w-8 h-8 md:w-[38px] md:h-[38px] flex-shrink-0">
                                        {isCancelled ? (
                                            <XCircle className="w-full h-full text-red-500" />
                                        ) : isExpired ? (
                                            <XCircle className="w-full h-full text-orange-500" />
                                        ) : (
                                            <CheckCircle className="w-full h-full text-[#009133]" />
                                        )}
                                    </div>
                                </div>
                                <p className="text-[17px] font-medium text-[#686868] mt-2">
                                    {isRefunded ? 'Refund has been processed' :
                                     isCancelled ? 'The refund if any will be processed soon' :
                                     isExpired ? 'This booking has passed and is no longer active' :
                                     'Reach the venue 10 mins before your slot'}
                                </p>
                            </div>
                        </div>

                        <div className="h-[0.5px] bg-[#686868] w-full" />

                        {venueImage && (
                            <div className="w-full h-[200px] md:h-[250px] rounded-[15px] overflow-hidden">
                                <img src={venueImage} alt="Venue" className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="h-[0.5px] bg-[#686868] w-full" />

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[17px] font-medium text-[#686868] leading-none">Date & Time</p>
                                <p className="text-[20px] font-medium text-black uppercase">
                                    {bookingDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} | {booking.time || booking.timeSlot || booking.time_slot || booking.slot}
                                </p>
                            </div>

                            <div className="h-[0.5px] bg-[#686868] w-full" />

                            <div className="space-y-1">
                                <p className="text-[17px] font-medium text-[#686868] leading-none">
                                    {(booking.type || booking.category) === 'play' ? 'Play duration' : (booking.type || booking.category) === 'dining' ? 'Guests' : 'Quantity'}
                                </p>
                                <p className="text-[20px] font-medium text-black uppercase">
                                    {(booking.type || booking.category) === 'play' ? `${booking.duration ? (booking.duration * 30) : '60'} mins` :
                                        (booking.type || booking.category) === 'dining' ? `${booking.guests} Guests` :
                                            `${booking.tickets?.reduce((acc: number, t: any) => acc + (t.quantity || 0), 0) || 1} tickets`}
                                </p>
                            </div>

                            <div className="h-[0.5px] bg-[#686868] w-full" />

                            <div className="space-y-1 relative pr-12">
                                <p className="text-[17px] font-medium text-[#686868] leading-none">Location</p>
                                <p className="text-[20px] font-medium text-black uppercase leading-tight">
                                    {booking.venueAddress || booking.venue_address || booking.address || booking.eventLocation || booking.event_location || booking.city || 'Venue Location'}
                                </p>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-zinc-100 rounded-full">
                                    <Navigation size={20} className="text-black" />
                                </div>
                            </div>

                            <div className="h-[0.5px] bg-[#686868] w-full" />

                            <div className="space-y-1">
                                <p className="text-[17px] font-medium text-[#686868] leading-none">Discount</p>
                                <p className="text-[20px] font-medium text-black uppercase">
                                    {booking.ticpassApplied || booking.ticpass_applied ? `Ticpass Applied - ₹${booking.discountAmount || booking.discount_amount} off` :
                                        booking.offerId || booking.offer_id ? `Offer Applied - ₹${booking.discountAmount || booking.discount_amount} off` :
                                        booking.couponCode || booking.coupon_code ? `Coupon: ${booking.couponCode || booking.coupon_code} - ₹${booking.discountAmount || booking.discount_amount} off` :
                                        (booking.grandTotal ?? booking.grand_total) === 0 ? 'Total Free' :
                                        (booking.discountAmount || booking.discount_amount) > 0 ? `₹${booking.discountAmount || booking.discount_amount} Savings` : 'No offer applied'}
                                </p>
                            </div>

                            <div className="pt-4 flex flex-wrap gap-6 items-center">
                                {!isCancelled && !isExpired && (
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => setIsCancelModalOpen(true)}
                                            className="text-[22px] font-semibold text-[#ED4D1B] underline underline-offset-4 decoration-1"
                                        >
                                            Cancel booking
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={handleDownloadTicket}
                                    disabled={downloading}
                                    className="text-[22px] font-semibold text-black underline underline-offset-4 decoration-1 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {downloading ? 'Downloading...' : 'Download Ticket'}
                                    <Download size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-[25px] font-semibold text-black px-1 uppercase">Your details</h2>
                    <div className="bg-white border-[0.5px] border-[#686868] rounded-[25px] p-8 md:p-10 flex items-center gap-6">
                        <div className="w-[60px] h-[60px] flex items-center justify-center bg-[#E1E1E1] rounded-full overflow-hidden">
                            {profilePhoto ? (
                                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={32} className="text-[#686868]" />
                            )}
                        </div>
                        <div className="space-y-1 overflow-hidden">
                            <p className="text-[20px] font-medium text-black uppercase leading-none truncate">{booking.user_name || booking.userName || 'Guest'}</p>
                            <p className="text-[20px] font-medium text-[#686868] uppercase leading-none mt-1">{booking.user_phone || booking.userPhone || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="px-1 space-y-1">
                        <p className="text-[17px] font-medium text-[#686868]">Booking ID: {booking.booking_id || booking.bookingId || booking.id?.slice(-8).toUpperCase()}</p>
                        <p className="text-[17px] font-medium text-[#686868]">Booking date: {new Date(booking.createdAt || booking.created_at || booking.date).toLocaleDateString('en-IN')}</p>
                    </div>
                </div>

                <div className="bg-[#E1E1E1] rounded-[25px] p-8 md:p-10">
                    <h2 className="text-[25px] font-semibold text-black mb-4 uppercase">Terms & Conditions</h2>
                    <ul className="space-y-2 text-[#686868] text-[16px]">
                        <li>• Please arrive 10 minutes before the scheduled time.</li>
                        <li>• Carry a valid ID proof for verification at the venue.</li>
                        <li>• Cancellation policies apply as per the vendor's terms.</li>
                        <li>• Tickets are non-transferable unless specified otherwise.</li>
                    </ul>
                </div>

                <Link href="/chat-support" className="bg-white border-[0.5px] border-[#686868] rounded-[20px] p-4 md:p-8 flex items-center gap-4 md:gap-6 cursor-pointer hover:bg-zinc-50 transition-colors">
                    <div className="w-[36px] h-[36px] md:w-[56px] md:h-[56px] flex items-center justify-center bg-black rounded-full text-white shrink-0">
                        <MessageSquare size={18} className="md:w-7 md:h-7" />
                    </div>
                    <h3 className="text-[16px] md:text-[25px] font-semibold text-black uppercase">Chat with support</h3>
                </Link>
            </main>

            {/* Hidden Ticket for PDF generation */}
            <div className="opacity-0 pointer-events-none absolute -left-[9999px] top-0">
                <div ref={ticketRef} style={{ width: '595px', height: '842px', background: '#f5f5f5', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '500px', background: '#EBEBEB', borderRadius: '15px', overflow: 'hidden', border: '1px solid #D9D9D9' }}>
                        <div style={{ background: '#E7C200', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'black', fontWeight: 900, fontSize: '18px', letterSpacing: '1px' }}>TICPIN</span>
                            <span style={{ color: 'black', fontWeight: 600, fontSize: '14px' }}>CONFIRMED</span>
                        </div>
                        <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                <span style={{ fontSize: '24px', fontWeight: 700, color: 'black' }}>{booking.eventName || booking.event_name || booking.venueName || booking.venue_name || booking.title}</span>
                                <div style={{ width: '24px', height: '24px', background: '#0AC655', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✓</div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#686868', marginBottom: '4px' }}>DATE & TIME</div>
                                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{bookingDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    <div style={{ fontSize: '14px' }}>{booking.time || booking.timeSlot || booking.time_slot || booking.slot}</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#686868', marginBottom: '4px' }}>LOCATION</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{booking.venueAddress || booking.venue_address || booking.city}</div>
                                </div>
                            </div>
                            <div style={{ borderTop: '1px dashed #D9D9D9', padding: '15px 0', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#686868' }}>BOOKING ID</div>
                                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{booking.booking_id || booking.bookingId || booking.id?.slice(-8).toUpperCase()}</div>
                                </div>
                                <QRCodeCanvas value={booking.qr_payload || booking.booking_id || booking.bookingId || booking.id} size={80} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancellation Modal */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => !cancelling && setIsCancelModalOpen(false)} />
                    <div className={`relative w-full bg-white rounded-[25px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ${donationStep === 'donate' ? 'max-w-[980px]' : 'max-w-[760px]'}`}>
                        <div className="flex items-center justify-between p-6 md:p-8 border-b border-[#AEAEAE]">
                            <h2 className="text-[24px] md:text-[28px] font-semibold text-black">Booking cancellation confirmed</h2>
                            <button onClick={() => !cancelling && setIsCancelModalOpen(false)} className="text-black hover:opacity-70"><X size={28} /></button>
                        </div>
                        <div className="p-6 md:p-10 space-y-8">
                            {donationStep === 'reason' ? (
                                <div className="space-y-6">
                                    <p className="text-[17px] font-medium text-[#686868] uppercase">Select your reason here</p>
                                    <div className="flex flex-wrap gap-4">
                                        {reasons.map((reason) => (
                                            <button
                                                key={reason}
                                                onClick={() => handleReasonSelect(reason)}
                                                className="px-6 py-3 rounded-[25px] border border-[#AEAEAE] text-[17px] font-medium hover:bg-zinc-50"
                                            >
                                                {reason}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-[17px] font-medium text-[#686868]">REASON: {selectedReason}</p>
                                    <div className="h-[0.5px] border-t border-[#AEAEAE] border-dashed w-full" />
                                    <p className="text-[22px] font-bold text-black">Would you like to support a cause with your refund?</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button 
                                            onClick={() => setDonationType('none')} 
                                            className={`relative p-5 border-2 rounded-[20px] text-left transition-all ${donationType === 'none' ? 'border-[#05A45E] bg-[#F4FFF9]' : 'border-[#05A45E] hover:bg-[#F4FFF9]'}`}
                                        >
                                            <div className={`absolute top-3 left-3 w-4 h-4 rounded-[6px] border ${donationType === 'none' ? 'bg-white border-[#05A45E]' : 'border-[#05A45E]'}`} />
                                            <div className="w-14 h-14 bg-[#CFF0DD] rounded-full mb-4 flex items-center justify-center text-[#05A45E]">
                                                <Check size={22} />
                                            </div>
                                            <h3 className="font-bold text-[30px] leading-none mb-2 text-black">Get full refund</h3>
                                            <p className="text-[14px] text-[#686868] mb-3">Refund {paidAmount.toFixed(0)} will be sent to your original payment method.</p>
                                            <div className="border-t border-dashed border-[#AEAEAE] pt-2">
                                                <p className="text-[12px] text-[#686868]">You get</p>
                                                <p className="text-[34px] font-bold text-[#05A45E]">₹{paidAmount.toFixed(0)}</p>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => setDonationType('full')} 
                                            className={`relative p-5 border-2 rounded-[20px] text-left transition-all ${donationType === 'full' ? 'border-[#F04438] bg-[#FFF8F7]' : 'border-[#F04438] hover:bg-[#FFF8F7]'}`}
                                        >
                                            <div className={`absolute top-3 left-3 w-4 h-4 rounded-[6px] border ${donationType === 'full' ? 'bg-white border-[#F04438]' : 'border-[#F04438]'}`} />
                                            <div className="w-14 h-14 bg-red-100 rounded-full mb-4 flex items-center justify-center text-red-500 text-2xl">
                                                ❤️
                                            </div>
                                            <h3 className="font-bold text-[30px] leading-none mb-2 text-black">Donate my refund</h3>
                                            <p className="text-sm text-[#686868] mb-4">Donates to support verified NGOs and create impact.</p>
                                            <div className="border-t border-dashed border-[#AEAEAE] pt-2">
                                                <p className="text-[12px] text-[#686868]">You donate</p>
                                                <p className="text-[34px] font-bold text-[#ED4D1B]">₹{paidAmount.toFixed(0)}</p>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => setDonationType('partial')} 
                                            className={`relative p-5 border-2 rounded-[20px] text-left transition-all ${donationType === 'partial' ? 'border-[#7F56D9] bg-[#F9F5FF]' : 'border-[#7F56D9] hover:bg-[#F9F5FF]'}`}
                                        >
                                            <div className={`absolute top-3 left-3 w-4 h-4 rounded-[6px] border ${donationType === 'partial' ? 'bg-white border-[#7F56D9]' : 'border-[#7F56D9]'}`} />
                                            <div className="w-14 h-14 bg-purple-100 rounded-full mb-4 flex items-center justify-center text-purple-500 text-2xl">
                                                🎁
                                            </div>
                                            <h3 className="font-bold text-[30px] leading-none mb-2 text-black">Split refund & donation</h3>
                                            <p className="text-sm text-[#686868] mb-4">Choose how much you want to donate and get rest as refund.</p>
                                            <div className="border-t border-dashed border-[#AEAEAE] pt-2">
                                                <p className="text-[12px] text-[#686868]">Choose amount</p>
                                                <p className="text-[30px] font-bold text-[#7F56D9]">₹{customDonationAmount > 0 ? customDonationAmount.toFixed(0) : '0'}</p>
                                            </div>
                                        </button>
                                    </div>
                                    {donationType === 'partial' && (
                                        <div className="bg-zinc-50 p-6 rounded-xl animate-in slide-in-from-top-2 duration-300">
                                            <p className="font-bold mb-4 text-black">Enter donation amount (max: ₹{Math.max(0, paidAmount).toFixed(0)})</p>
                                            <div className="flex gap-6 items-center">
                                                <div className="flex-1">
                                                    <input 
                                                        type="number" 
                                                        value={customDonationAmount || ''} 
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value) || 0;
                                                            const max = Math.max(0, paidAmount);
                                                            const bounded = val > max ? max : val;
                                                            setCustomDonationAmount(bounded < 0 ? 0 : bounded);
                                                        }} 
                                                        className="w-full p-4 border-2 border-[#D9D9D9] rounded-xl text-[20px] font-bold focus:outline-none focus:border-purple-500"
                                                        placeholder="Enter amount"
                                                        max={Math.max(0, paidAmount)}
                                                    />
                                                </div>
                                                <div className="text-right min-w-[150px]">
                                                    <p className="text-sm text-[#686868]">REFUND AMOUNT</p>
                                                    <p className="text-2xl font-bold text-[#0AC655]">₹{Math.max(0, paidAmount - (customDonationAmount || 0)).toFixed(0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            onClick={() => setDonationStep('reason')} 
                                            className="flex-1 h-14 border-2 border-black rounded-full font-bold text-[18px] hover:bg-zinc-50 transition-colors"
                                        >
                                            BACK
                                        </button>
                                        <button 
                                            onClick={() => handleCancelSubmit()} 
                                            disabled={
                                                !donationType ||
                                                cancelling ||
                                                (donationType === 'partial' && customDonationAmount <= 0)
                                            }
                                            className="flex-1 h-14 bg-black text-white rounded-full font-bold text-[18px] disabled:opacity-50 transition-all"
                                        >
                                            {cancelling ? <RefreshCw className="animate-spin mx-auto" size={24} /> : 'SUBMIT REQUEST'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Legacy Donate Modal removed: donation handled inside cancellation flow */}
        </div>
    );
}
