'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, MessageSquare, User, X, XCircle, Download, Check, MapPin, Navigation, RefreshCw, Ticket, PlayCircle, Utensils, ChevronLeft } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useUserSession } from '@/lib/auth/user';
import { bookingApi } from '@/lib/api/booking';
import { profileApi } from '@/lib/api/profile';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeCanvas } from 'qrcode.react';

export default function BookingDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params?.id as string;
    const session = useUserSession();
    const ticketRef = useRef<HTMLDivElement>(null);

    const [hasCheckedSession, setHasCheckedSession] = useState(false);
    const [booking, setBooking] = useState<any>(null);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelStep, setCancelStep] = useState<'reason' | 'donation' | 'success'>('reason');
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [donationChoice, setDonationChoice] = useState<'full_refund' | 'full_donate' | 'split' | null>(null);
    const [splitAmount, setSplitAmount] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCheckedSession(true);
        }, 150);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!hasCheckedSession) return;
        if (!session) {
            router.replace('/bookings');
        }
    }, [hasCheckedSession, session, router]);

    const reasons = [
        "Plan change",
        "Found a better offer elsewhere",
        "Booked by mistake",
        "Others"
    ];

    const bookingTotal = booking?.grand_total ?? booking?.order_amount ?? 0;

    const openCancelModal = () => {
        setCancelStep('reason');
        setSelectedReason(null);
        setDonationChoice(null);
        setSplitAmount('');
        setIsCancelModalOpen(true);
    };

    const handleCancelSubmit = async () => {
        if (!selectedReason || !booking || !donationChoice) return;
        setCancelling(true);

        let donationAmount = 0;
        if (donationChoice === 'full_donate') {
            donationAmount = bookingTotal;
        } else if (donationChoice === 'split') {
            const refundAmt = parseFloat(splitAmount);
            if (isNaN(refundAmt) || refundAmt < 0 || refundAmt > bookingTotal) {
                alert(`Please enter a valid refund amount between ₹0 and ₹${bookingTotal}`);
                setCancelling(false);
                return;
            }
            donationAmount = bookingTotal - refundAmt;
        }

        try {
            await bookingApi.cancelBooking(booking.id, booking.type || 'play', selectedReason, donationAmount);
            // Refresh booking data
            const res = await fetch(`/backend/api/bookings/${bookingId}${session?.id ? `?user_id=${session.id}` : ''}`, {
                credentials: 'include',
            });
            const data = await res.json();
            setBooking(data);
            setCancelStep('success');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    useEffect(() => {
        if (bookingId) {
            setLoading(true);
            fetch(`/backend/api/bookings/${bookingId}${session?.id ? `?user_id=${session.id}` : ''}`, {
                credentials: 'include',
            })
                .then(res => res.ok ? res.json() : Promise.reject('Failed to load booking'))
                .then(data => {
                    setBooking(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.toString());
                    setLoading(false);
                });
        }
    }, [bookingId, session]);

    // Fetch profile photo for the logged‑in user
    useEffect(() => {
        if (session?.id) {
            profileApi.getProfile(session.id).then(p => {
                if (p?.profilePhoto) setProfilePhoto(p.profilePhoto);
            }).catch(err => console.error('Failed to fetch profile:', err));
        }
    }, [session]);

    const handleDownloadBill = async () => {
        if (!ticketRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#F5F5F5',
                width: 800,
                windowWidth: 800,
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
            pdf.save(`TICPIN_Ticket_${booking?.booking_id || bookingId}.pdf`);
        } catch (err) {
            console.error('PDF generation error:', err);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading || !hasCheckedSession || !session) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <XCircle size={60} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Booking not found</h2>
                <p className="text-[#686868] mb-6">{error || 'The requested booking details could not be loaded.'}</p>
                <button onClick={() => router.push('/bookings')} className="px-8 py-3 bg-black text-white rounded-xl">
                    Back to Bookings
                </button>
            </div>
        );
    }

    const isCancelled = booking.status === 'cancelled' || booking.status === 'refunded';
    const isRefunded = booking.status === 'refunded';

    // Check if booking date is expired
    const isExpired = booking.date ? new Date(booking.date).getTime() < new Date().setHours(0, 0, 0, 0) : false;

    return (
        <div className={`bg-white font-[family-name:var(--font-anek-latin)] relative pb-0 ${(isCancelModalOpen) ? 'overflow-hidden' : ''}`}>
            <style>{`
                body {
                    background-color: white !important;
                }
            `}</style>
            {/* Header */}
            <header className="h-16 md:h-20 w-full bg-white border-b border-[#D9D9D9] flex items-center px-4 md:px-10 lg:px-[37px] sticky top-0 z-50">
                <div className="flex items-center gap-4 md:gap-10">
                    <button
                        onClick={() => router.push('/bookings')}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-[#D9D9D9] rounded-full hover:bg-zinc-50 transition-colors"
                    >
                        <ChevronLeft size={24} className="text-black" />
                    </button>

                    <Link href="/">
                        <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-6 md:h-7 w-auto" />
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {/* Divider Line */}
                        <div className="w-[1.5px] h-8 bg-[#AEAEAE] mx-1" />

                        <div className="flex items-center gap-6">
                            {/* Venue Thumbnail */}
                            <div className="w-[85px] h-[48px] bg-zinc-100 rounded-[10px] overflow-hidden flex items-center justify-center">
                                {(booking.event_image_url || booking.venue_image_url || booking.play_image || booking.image_url) ? (
                                    <img src={booking.event_image_url || booking.venue_image_url || booking.play_image || booking.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <MapPin size={24} className="text-zinc-400" />
                                )}
                            </div>

                            <div className="flex flex-col justify-center">
                                <h2 className="text-[18px] font-medium text-black leading-tight uppercase tracking-tight">
                                    {booking.event_name || booking.venue_name}
                                </h2>
                                <p className="text-[15px] font-medium text-[#686868] leading-tight uppercase tracking-tight mt-0.5">
                                    {booking.venue_address?.split(',')[0]}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[787px] mx-auto px-4 mt-4 md:mt-8 pb-0 mb-0 space-y-6">

                {/* Main Booking Card (Confirm/Cancel state) */}
                <div className="relative bg-white border-[0.5px] border-[#686868] rounded-[25px] overflow-hidden">
                    {/* Gradient Background Overlay */}
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

                    <div className="relative pt-4 pb-8 px-7 md:pt-4 md:pb-10 md:px-11 space-y-1">
                        {/* Header Box */}
                        <div className="flex flex-row items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-[28px] md:text-[34px] font-semibold text-black leading-none">
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
                                <p className="text-[17px] font-medium text-[#686868] mt-1">
                                    {isRefunded ? 'Refund has been processed' :
                                        isCancelled ? 'The refund if any will be processed soon' :
                                            isExpired ? 'This booking has passed and is no longer active' :
                                                'Reach the venue 10 mins before your slot'}
                                </p>
                            </div>

                            {/* Compact QR Code positioned on the right corner straight to green tick */}
                            {(booking.type === 'event' || (booking.type !== 'play' && booking.type !== 'dining')) && !isCancelled && !isExpired && !isRefunded && (
                                <div className="flex flex-col items-center justify-center p-3 bg-[#EBEBEB] border border-[#686868]/30 rounded-[16px] shrink-0 w-[150px] h-[150px] select-none">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/qr-verify/${booking.booking_id || booking.id}` : '')}`}
                                        alt="Ticket QR Code"
                                        className="w-[110px] h-[110px] object-contain"
                                    />
                                    <p className="text-[10px] font-extrabold text-black uppercase tracking-widest text-center mt-2.5" style={{ fontFamily: 'Anek Latin' }}>Scan to Verify</p>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-[0.5px] bg-[#686868] w-1/2" />

                        {/* Turf Image */}
                        {booking.type === 'play' && (booking.event_image_url || booking.venue_image_url || booking.play_image || booking.image_url) && (
                            <div className="w-full h-[200px] md:h-[250px] rounded-[15px] overflow-hidden">
                                <img
                                    src={booking.event_image_url || booking.venue_image_url || booking.play_image || booking.image_url}
                                    alt="Turf"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* <div className="h-[0.5px] bg-[#686868] w-full" /> */}

                        {/* Booking Details Grid */}
                        <div className="flex flex-col md:flex-row justify-between items-stretch gap-0 !mt-4">
                            <div className="flex-grow space-y-4">
                                {/* Date & Time */}
                                <div className="space-y-1">
                                    <p className="text-[17px] font-medium text-[#686868] leading-none">Date & Time</p>
                                    <p className="text-[20px] font-medium text-black uppercase">
                                        {new Date(booking.date || Date.now()).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} | {booking.time || booking.time_slot}
                                    </p>
                                </div>

                                <div className="h-[0.5px] bg-[#686868] w-full" />

                                {/* Play duration / Capacity */}
                                <div className="space-y-1">
                                    <p className="text-[17px] font-medium text-[#686868] leading-none">
                                        {booking.type === 'play' ? 'Play duration' : booking.type === 'dining' ? 'Guests' : 'Quantity'}
                                    </p>
                                    <p className="text-[20px] font-medium text-black uppercase">
                                        {booking.type === 'play' ? `${booking.duration ? (booking.duration * 30) : '60'} mins` :
                                            booking.type === 'dining' ? `${booking.guests} Guests` :
                                                `${booking.tickets?.reduce((acc: number, t: any) => acc + (t.quantity || 0), 0) || 1} tickets`}
                                    </p>
                                </div>

                                <div className="h-[0.5px] bg-[#686868] w-full" />

                                {/* Location */}
                                <div className="space-y-1 relative pr-12">
                                    <p className="text-[17px] font-medium text-[#686868] leading-none">Location</p>
                                    <p className="text-[20px] font-medium text-black uppercase leading-tight">
                                        {booking.venue_address || booking.event_location || 'Venue Location'}
                                    </p>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-zinc-100 rounded-full">
                                        <Navigation size={20} className="text-black" />
                                    </div>
                                </div>

                                <div className="h-[0.5px] bg-[#686868] w-full" />

                                {/* Offer */}
                                <div className="space-y-1">
                                    <p className="text-[17px] font-medium text-[#686868] leading-none">Discount</p>
                                    <p className="text-[20px] font-medium text-black uppercase">
                                        {booking.ticpass_applied ? `Ticpass Applied - ₹${booking.discount_amount} off` :
                                            booking.offer_id ? `Offer Applied - ₹${booking.discount_amount} off` :
                                                booking.coupon_code ? `Coupon: ${booking.coupon_code} - ₹${booking.discount_amount} off` :
                                                    booking.grand_total === 0 ? 'Total Free' :
                                                        booking.discount_amount > 0 ? `₹${booking.discount_amount} Savings` : 'No offer applied'}
                                    </p>
                                </div>

                                {/* Cancel Link */}
                                <div className="pt-2">
                                    {!isCancelled && !isExpired && (
                                        <button
                                            onClick={openCancelModal}
                                            className="text-[22px] font-semibold text-[#ED4D1B] border-b-2 border-dotted border-[#ED4D1B] leading-none"
                                        >
                                            Cancel booking
                                        </button>
                                    )}
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

                {/* User Details Section */}
                <div className="space-y-6">
                    <h2 className="text-[25px] font-semibold text-black px-1">Your details</h2>

                    <div className="bg-white border-[0.5px] border-[#686868] rounded-[25px] p-8 md:p-10 flex items-center gap-6">
                        <div className="w-[60px] h-[60px] flex items-center justify-center bg-[#E1E1E1] rounded-full overflow-hidden">
                            {profilePhoto ? (
                                <Image src={profilePhoto} alt="Profile" width={60} height={60} className="object-cover" />
                            ) : (
                                <User size={32} className="text-[#686868]" />
                            )}
                        </div>
                        <div className="space-y-1 overflow-hidden">
                            <p className="text-[20px] font-medium text-black uppercase leading-none truncate">{booking.user_name}</p>
                            <p className="text-[20px] font-medium text-[#686868] uppercase leading-none mt-1">{booking.user_phone}</p>
                        </div>
                    </div>

                    <div className="px-1 space-y-1">
                        <p className="text-[17px] font-medium text-[#686868]">Booking ID: {booking.booking_id || booking.id?.slice(-8).toUpperCase()}</p>
                        <p className="text-[17px] font-medium text-[#686868]">Booking date: {new Date(booking.created_at || booking.date).toLocaleDateString('en-IN')}</p>
                    </div>
                </div>

                {/* Terms & Conditions Box */}
                <div className="bg-[#E1E1E1] rounded-[25px] p-8 md:p-10">
                    <h2 className="text-[25px] font-semibold text-black mb-4">Terms & Conditions</h2>
                    <ul className="space-y-2 text-[#686868] text-[16px]">
                        <li>• Please arrive 10 minutes before the scheduled time.</li>
                        <li>• Carry a valid ID proof for verification at the venue.</li>
                        <li>• Cancellation policies apply as per the vendor's terms.</li>
                        <li>• Tickets are non-transferable unless specified otherwise.</li>
                    </ul>
                </div>

                {/* Chat with Support Box */}
                <Link href="/chat-support" className="bg-white border-[0.5px] border-[#686868] rounded-[25px] p-8 flex items-center gap-6 cursor-pointer hover:bg-zinc-50 transition-colors mb-0">
                    <div className="w-[56px] h-[56px] flex items-center justify-center bg-black rounded-full text-white">
                        <MessageSquare size={28} />
                    </div>
                    <h3 className="text-[25px] font-semibold text-black">Chat with support</h3>
                </Link>
            </main>

            {/* HIDDEN PREMIUM TICKET FOR PDF DOWNLOAD */}
            <div className="opacity-0 pointer-events-none absolute -left-[9999px]">
                <div ref={ticketRef} id="hidden-ticket-capture" style={{ width: '595px', height: '842px', background: '#f5f5f5', padding: '0', fontFamily: 'Anek Latin, Arial, sans-serif', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                    {/* Gray Container */}
                    <div style={{ width: '500px', background: '#EBEBEB', borderRadius: '15px', border: '1px solid #ffffff', overflow: 'hidden', marginRight: '0', marginTop: '20px', marginBottom: '0' }}>
                        {/* Yellow Header */}
                        <div style={{ background: '#E7C200', padding: '8px 16px' }}>
                            <span style={{ color: '#000000', fontWeight: 900, fontSize: '14px', letterSpacing: '1px' }}>TICPIN</span>
                        </div>

                        {/* Gray Content Body */}
                        <div style={{ padding: '16px' }}>
                            {/* Heading */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '20px', fontWeight: 600, color: '#000000' }}>Play booking confirmed</span>
                                <span style={{ display: 'inline-block', width: '18px', height: '18px', background: '#0AC655', borderRadius: '50%', color: '#fff', textAlign: 'center', lineHeight: '18px', fontSize: '12px', marginLeft: '8px' }}>✓</span>
                            </div>

                            <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 500, color: '#686868', lineHeight: '16px' }}>
                                Booking Date: {new Date(booking.date || Date.now()).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}, {booking.time || booking.time_slot}
                            </p>

                            {/* Play Card Box */}
                            <div style={{ background: '#ffffff', borderRadius: '10px', marginBottom: '12px', padding: '10px', display: 'flex', gap: '10px' }}>
                                <div style={{ width: '120px', height: '68px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                                    {(booking.event_image_url || booking.venue_image_url || booking.play_image || booking.image_url) ? (
                                        <img src={booking.event_image_url || booking.venue_image_url || booking.play_image || booking.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', backgroundColor: '#FFEF9A' }}></div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 6px 0', fontWeight: 600, fontSize: '14px', color: '#000000', lineHeight: '18px' }}>{booking.event_name || booking.venue_name}</p>
                                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#686868', lineHeight: '16px' }}>{booking.venue_address || booking.event_location || 'Venue Location'}</p>
                                </div>
                            </div>

                            {/* Details Card Box */}
                            <div style={{ background: '#ffffff', borderRadius: '10px', marginBottom: '12px', padding: '14px' }}>
                                <p style={{ margin: '0 0 2px 0', fontSize: '11px', fontWeight: 500, color: '#686868', lineHeight: '14px' }}>Booking ID</p>
                                <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 500, color: '#000000', lineHeight: '16px' }}>{booking.booking_id || booking.id?.slice(-8).toUpperCase()}</p>

                                <div style={{ borderTop: '1px solid #D9D9D9', margin: '8px 0 12px 0' }}></div>

                                <p style={{ margin: '0 0 2px 0', fontSize: '11px', fontWeight: 500, color: '#686868', lineHeight: '14px' }}>Date & Time</p>
                                <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 500, color: '#000000', lineHeight: '16px' }}>
                                    {new Date(booking.date || Date.now()).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} | {booking.time || booking.time_slot}
                                </p>

                                <p style={{ margin: '0 0 2px 0', fontSize: '11px', fontWeight: 500, color: '#686868', lineHeight: '14px' }}>Play duration</p>
                                <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 500, color: '#000000', lineHeight: '16px' }}>
                                    {booking.type === 'play' ? `${booking.duration ? (booking.duration * 30) : '60'} mins` :
                                        booking.type === 'dining' ? `${booking.guests} Guests` :
                                            `${booking.tickets?.reduce((acc: number, t: any) => acc + (t.quantity || 0), 0) || 1} tickets`}
                                </p>

                                <p style={{ margin: '0 0 2px 0', fontSize: '11px', fontWeight: 500, color: '#686868', lineHeight: '14px' }}>Location</p>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#000000', lineHeight: '16px' }}>{booking.venue_address || booking.event_location || 'Venue Location'}</p>

                                {(booking.ticpass_applied || booking.offer_id || booking.coupon_code) && (
                                    <>
                                        <div style={{ borderTop: '1px solid #D9D9D9', margin: '8px 0 12px 0' }}></div>
                                        <p style={{ margin: '0 0 2px 0', fontSize: '11px', fontWeight: 500, color: '#686868', lineHeight: '14px' }}>Discount</p>
                                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#000000', lineHeight: '16px' }}>
                                            {booking.ticpass_applied ? `Ticpass Applied - ₹${booking.discount_amount} off` :
                                                booking.offer_id ? `Offer Applied - ₹${booking.discount_amount} off` :
                                                    booking.coupon_code ? `Coupon: ${booking.coupon_code} - ₹${booking.discount_amount} off` :
                                                        booking.grand_total === 0 ? 'Total Free' : ''}
                                        </p>
                                    </>
                                )}
                            </div>

                            <p style={{ fontSize: '11px', fontWeight: 500, color: '#686868', margin: '12px 0 12px 0', lineHeight: '14px' }}>
                                To access your booking, please sign in to your <span style={{ color: '#5331EA', fontWeight: 600 }}>Ticpin</span> account with {booking.user_phone}
                            </p>

                            <p style={{ fontWeight: 600, fontSize: '14px', color: '#000000', marginBottom: '8px', lineHeight: '18px' }}>Notes</p>

                            {/* Notes Box */}
                            <div style={{ background: '#ffffff', borderRadius: '10px', padding: '12px' }}>
                                <div style={{ display: 'flex', marginBottom: '8px' }}>
                                    <div style={{ width: '18px', paddingTop: '2px' }}>
                                        <div style={{ width: '6px', height: '6px', border: '2px solid #E7C200', boxSizing: 'border-box', transform: 'rotate(-45deg)' }}></div>
                                    </div>
                                    <p style={{ fontSize: '11px', fontWeight: 500, color: '#686868', lineHeight: '14px', margin: 0 }}>
                                        Please arrive 10 minutes before the scheduled time for your slot booking.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', marginBottom: '8px' }}>
                                    <div style={{ width: '18px', paddingTop: '2px' }}>
                                        <div style={{ width: '6px', height: '6px', border: '2px solid #E7C200', boxSizing: 'border-box', transform: 'rotate(-45deg)' }}></div>
                                    </div>
                                    <p style={{ fontSize: '11px', fontWeight: 500, color: '#686868', lineHeight: '14px', margin: 0 }}>
                                        Your booking time is strictly reserved, late arrivals may result in reduced playtime.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', marginBottom: '8px' }}>
                                    <div style={{ width: '18px', paddingTop: '2px' }}>
                                        <div style={{ width: '6px', height: '6px', border: '2px solid #E7C200', boxSizing: 'border-box', transform: 'rotate(-45deg)' }}></div>
                                    </div>
                                    <p style={{ fontSize: '11px', fontWeight: 500, color: '#686868', lineHeight: '14px', margin: 0 }}>
                                        Ensure you vacate the turf on or before your end time to avoid inconvenience to the next booking
                                    </p>
                                </div>
                                <p style={{ margin: '12px 0 0 0', fontSize: '10px', fontWeight: 500, color: '#686868', lineHeight: '14px' }}>
                                    See you there!<br />
                                    Team <span style={{ color: '#5331EA', fontWeight: 600 }}>Ticpin</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancellation Modal Overlay */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop with Blur */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
                        onClick={() => !cancelling && setIsCancelModalOpen(false)}
                    />

                    {/* Modal Content Wrapper */}
                    <div className={`relative animate-in zoom-in-95 duration-500 ${cancelStep === 'donation' ? 'max-w-[850px]' : 'max-w-[700px]'} w-full`}>
                        <div className="relative w-full bg-white rounded-[26px] border border-[#AEAEAE] overflow-hidden">

                            {cancelStep === 'reason' ? (
                                <>
                                    {/* Modal Header (Step 1) */}
                                    <div className="flex items-center justify-between p-6 md:p-8 border-b-[0.5px] border-[#AEAEAE]">
                                        <h2 className="text-[24px] md:text-[28px] font-semibold text-black">Booking cancellation request</h2>
                                        <button
                                            onClick={() => setIsCancelModalOpen(false)}
                                            className="text-black hover:opacity-70"
                                        >
                                            <X size={28} strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    {/* Modal Body (Step 1) */}
                                    <div className="p-6 md:p-10 space-y-8">
                                        <div className="space-y-4">
                                            <p className="text-[17px] font-medium text-[#686868]">Select your reason here</p>

                                            <div className="flex flex-wrap gap-4">
                                                {reasons.map((reason) => (
                                                    <button
                                                        key={reason}
                                                        onClick={() => setSelectedReason(reason)}
                                                        className={`px-6 py-2 rounded-[25px] border text-[17px] font-medium transition-all ${selectedReason === reason
                                                            ? 'bg-black text-white border-black'
                                                            : 'bg-white text-black border-[#AEAEAE] hover:border-black'
                                                            }`}
                                                    >
                                                        {reason}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-[0.5px] border-t border-[#AEAEAE] border-dashed w-full" />

                                        <button
                                            onClick={() => setCancelStep('donation')}
                                            disabled={!selectedReason}
                                            className={`w-full h-[51px] rounded-[15px] text-[23px] font-semibold transition-all flex items-center justify-center ${selectedReason
                                                ? 'bg-black text-white'
                                                : 'bg-[#AEAEAE] text-white/70 cursor-not-allowed'
                                                }`}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </>
                            ) : cancelStep === 'donation' ? (
                                <>
                                    {/* Modal Header (Step 2) */}
                                    <div className="flex items-center justify-between p-6 md:p-8">
                                        <h2 className="text-[25px] md:text-[28px] font-semibold text-black">Booking cancellation confirmed</h2>
                                        <button
                                            onClick={() => {
                                                setIsCancelModalOpen(false);
                                                setCancelStep('reason');
                                            }}
                                            className="text-black hover:opacity-70"
                                        >
                                            <X size={28} strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-[0.5px] border-t border-[#686868] border-dashed w-full" />

                                    {/* Modal Body (Step 2) */}
                                    <div className="p-6 md:p-8 space-y-8">
                                        <p className="text-[17px] font-medium text-[#686868]">Would you like to support a cause with your refund?</p>

                                        {/* Options Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                            {/* Option 1: Full Refund */}
                                            <div
                                                onClick={() => { setDonationChoice('full_refund'); setSplitAmount(''); }}
                                                className={`relative group cursor-pointer p-5 rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${donationChoice === 'full_refund'
                                                    ? 'border-[#2F834E] bg-[#2F834E]/5'
                                                    : 'border-[#AEAEAE] hover:border-[#2F834E]/50'
                                                    }`}
                                            >
                                                <div className="absolute top-4 left-4">
                                                    <div className={`w-5 h-5 rounded-[5px] border flex items-center justify-center transition-colors ${donationChoice === 'full_refund' ? 'bg-[#2F834E] border-[#2F834E]' : 'border-[#2F834E]'
                                                        }`}>
                                                        {donationChoice === 'full_refund' && <CheckCircle size={14} className="text-white" />}
                                                    </div>
                                                </div>

                                                <div className="w-[58px] h-[58px] bg-[#65B54E]/20 rounded-full flex items-center justify-center mb-4">
                                                    <img src="/cancel popup/Vector.svg" alt="Wallet" className="w-[35px] h-[35px]" />
                                                </div>

                                                <h3 className="text-[17px] font-medium text-black">Get full refund</h3>
                                                <p className="text-[9px] font-medium text-[#686868] mt-2 max-w-[140px]">Refund ₹{bookingTotal.toLocaleString('en-IN')} will be sent to your original payment method.</p>

                                                <div className="mt-auto pt-6 w-full border-t border-dashed border-[#686868]">
                                                    <p className="text-[9px] font-medium text-[#686868]">You get</p>
                                                    <p className="text-[17px] font-semibold text-[#2F834E]">₹{bookingTotal.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>

                                            {/* Option 2: Donate All */}
                                            <div
                                                onClick={() => { setDonationChoice('full_donate'); setSplitAmount(''); }}
                                                className={`relative group cursor-pointer p-5 rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${donationChoice === 'full_donate'
                                                    ? 'border-[#DB5244] bg-[#DB5244]/5'
                                                    : 'border-[#AEAEAE] hover:border-[#DB5244]/50'
                                                    }`}
                                            >
                                                <div className="absolute top-4 left-4">
                                                    <div className={`w-5 h-5 rounded-[5px] border flex items-center justify-center transition-colors ${donationChoice === 'full_donate' ? 'bg-[#DB5244] border-[#DB5244]' : 'border-[#DB5244]'
                                                        }`}>
                                                        {donationChoice === 'full_donate' && <CheckCircle size={14} className="text-white" />}
                                                    </div>
                                                </div>

                                                <div className="w-[58px] h-[58px] bg-[#ED4D1B]/25 rounded-full flex items-center justify-center mb-4">
                                                    <img src="/cancel popup/Donate 1.svg" alt="Donate" className="w-[35px] h-[29px]" />
                                                </div>

                                                <h3 className="text-[17px] font-medium text-black">Donate my refund</h3>
                                                <p className="text-[9px] font-medium text-[#686868] mt-2 max-w-[140px]">Donate ₹{bookingTotal.toLocaleString('en-IN')} to support verified NGOs and create impact</p>

                                                <div className="mt-auto pt-6 w-full border-t border-dashed border-[#686868]">
                                                    <p className="text-[9px] font-medium text-[#686868]">You donate</p>
                                                    <p className="text-[17px] font-semibold text-[#DB5244]">₹{bookingTotal.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>

                                            {/* Option 3: Split */}
                                            <div
                                                onClick={() => setDonationChoice('split')}
                                                className={`relative group cursor-pointer p-5 rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${donationChoice === 'split'
                                                    ? 'border-[#5331EA] bg-[#5331EA]/5'
                                                    : 'border-[#AEAEAE] hover:border-[#5331EA]/50'
                                                    }`}
                                            >
                                                <div className="absolute top-4 left-4">
                                                    <div className={`w-5 h-5 rounded-[5px] border flex items-center justify-center transition-colors ${donationChoice === 'split' ? 'bg-[#5331EA] border-[#5331EA]' : 'border-[#5331EA]'
                                                        }`}>
                                                        {donationChoice === 'split' && <CheckCircle size={14} className="text-white" />}
                                                    </div>
                                                </div>

                                                <div className="w-[58px] h-[58px] bg-[#5331EA]/20 rounded-full flex items-center justify-center mb-4 shrink-0">
                                                    <img src="/cancel popup/Heart Handshake 1.svg" alt="Split" className="w-[35px] h-[33px]" />
                                                </div>

                                                <h3 className="text-[17px] font-medium text-black leading-tight mb-1">Split refund & donation</h3>
                                                <p className="text-[9px] font-medium text-[#686868] mt-1 max-w-[145px]">Choose how much you want to donate and get the rest as refund.</p>

                                                <div className="mt-auto pt-6 w-full border-t border-dashed border-[#686868]">
                                                    <p className="text-[9px] font-medium text-[#686868] mb-1">You get / You donate</p>
                                                    <button className="text-[15px] font-medium text-[#5331EA] hover:underline flex items-center justify-center gap-1 mx-auto">
                                                        Choose amount
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Split Amount Input Section */}
                                        {donationChoice === 'split' && (
                                            <div className="mt-4 flex flex-col items-center animate-in fade-in slide-in-from-top-4">
                                                <label className="text-[14px] font-medium text-[#686868] mb-2">Enter refund amount (Max ₹{bookingTotal})</label>
                                                <div className="relative w-[300px]">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-semibold">₹</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={bookingTotal}
                                                        step="1"
                                                        value={splitAmount}
                                                        onChange={e => setSplitAmount(e.target.value)}
                                                        placeholder={`${bookingTotal}`}
                                                        className="w-full border-2 border-[#AEAEAE] rounded-[12px] pl-8 pr-4 py-2 text-[16px] font-semibold text-black focus:outline-none focus:border-black transition-colors"
                                                    />
                                                </div>
                                                {splitAmount !== '' && !isNaN(parseFloat(splitAmount)) && (
                                                    <p className="text-[13px] font-medium text-black mt-2 bg-zinc-100 px-4 py-1.5 rounded-full">
                                                        Refund: ₹{Math.max(0, parseFloat(splitAmount) || 0).toLocaleString('en-IN')}
                                                        <span className="mx-2 text-[#AEAEAE]">|</span>
                                                        Donation: <span className="text-[#ED4D1B]">₹{Math.max(0, bookingTotal - (parseFloat(splitAmount) || 0)).toLocaleString('en-IN')}</span>
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Security/Partners Section */}
                                        <div className="border border-[#AEAEAE] rounded-[15px] p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img src="/cancel popup/FAV Icon New 1 1.svg" alt="Impact" className="w-[38px] h-[38px]" />
                                                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-medium text-black">
                                                    <img src="/cancel popup/lock.svg" alt="Secure" className="w-5 h-5" />
                                                    <span>100% secure donations • Verified NGO partners • Transparent impact</span>
                                                </div>
                                            </div>
                                            <Link href="#" className="text-[9px] md:text-[10px] font-medium text-[#5331EA] underline text-center">
                                                Learn more about our donation program
                                            </Link>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={handleCancelSubmit}
                                            disabled={!donationChoice || cancelling || (donationChoice === 'split' && !splitAmount)}
                                            className={`w-full h-[51px] bg-black text-white rounded-[15px] text-[23px] font-semibold transition-all hover:bg-zinc-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {cancelling ? (
                                                <RefreshCw className="animate-spin" size={24} />
                                            ) : (
                                                'Submit'
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Modal Header (Success Step) */}
                                    <div className="flex items-center justify-between p-6 md:p-8">
                                        <h2 className="text-[24px] md:text-[26px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Cancellation Request Successful</h2>
                                        <button
                                            onClick={() => {
                                                setIsCancelModalOpen(false);
                                                setCancelStep('reason');
                                            }}
                                            className="text-black hover:opacity-70 cursor-pointer"
                                        >
                                            <X size={28} strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-[0.5px] border-t border-[#686868]/20 w-full" />

                                    {/* Modal Body (Success Step) */}
                                    <div className="p-6 md:p-8 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                                        {/* Elegant Refund Success Icon */}
                                        <div className="w-[76px] h-[76px] bg-[#EAFDF1] rounded-full flex items-center justify-center border border-[#65B54E]/30 shrink-0">
                                            <CheckCircle className="w-[44px] h-[44px] text-[#0AC655]" />
                                        </div>

                                        <div className="space-y-3 max-w-[480px]">
                                            <h3 className="text-[22px] font-bold text-[#0AC655] uppercase tracking-wider" style={{ fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}>Refund Initiated!</h3>
                                            <p className="text-[16px] text-[#686868] font-medium leading-relaxed" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                Once cancellation is done, the refund amount will be credited back to your original payment method within <span className="font-bold text-black text-[17px]">12-24 hours</span>.
                                            </p>
                                        </div>

                                        {/* Premium Styled Refund Summary Card */}
                                        <div 
                                            className="w-full border-[0.5px] border-[#686868]/30 rounded-[20px] p-5 space-y-3.5 shadow-sm"
                                            style={{ background: 'radial-gradient(52.97% 102.98% at 0% -7.55%, #EAFDF1 0%, #FFFFFF 100%)' }}
                                        >
                                            <div className="flex justify-between items-center text-[15px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                <span>Total booking amount</span>
                                                <span className="text-black font-semibold">₹{bookingTotal.toLocaleString('en-IN')}</span>
                                            </div>
                                            {donationChoice === 'full_donate' ? (
                                                <div className="flex justify-between items-center text-[15px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                    <span>Donation to NGO partner</span>
                                                    <span className="text-[#DB5244] font-semibold">₹{bookingTotal.toLocaleString('en-IN')}</span>
                                                </div>
                                            ) : donationChoice === 'split' ? (
                                                <>
                                                    <div className="flex justify-between items-center text-[15px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                        <span>Donation to NGO partner</span>
                                                        <span className="text-[#DB5244] font-semibold">₹{(bookingTotal - (parseFloat(splitAmount) || 0)).toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[16px] font-semibold text-[#0AC655] pt-3.5 border-t border-dashed border-[#AEAEAE]/50" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                        <span>Estimated Refund</span>
                                                        <span>₹{Math.max(0, parseFloat(splitAmount) || 0).toLocaleString('en-IN')}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex justify-between items-center text-[16px] font-semibold text-[#0AC655] pt-3.5 border-t border-dashed border-[#AEAEAE]/50" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                    <span>Estimated Refund</span>
                                                    <span>₹{bookingTotal.toLocaleString('en-IN')}</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => {
                                                setIsCancelModalOpen(false);
                                                setCancelStep('reason');
                                            }}
                                            className="w-full h-[48px] bg-black text-white rounded-[10px] text-[18px] font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center shadow-md shadow-black/10 cursor-pointer uppercase tracking-wider"
                                            style={{ fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}
                                        >
                                            Done
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
