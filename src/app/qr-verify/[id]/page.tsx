'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, AlertCircle, Calendar, MapPin, Ticket, Clock, ArrowLeft, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';

export default function QRVerifyPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        async function fetchBookingDetails() {
            try {
                setLoading(true);
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
                const response = await fetch(`${backendUrl}/api/bookings/public/${id}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Invalid ticket: This booking ID was not found in our records.");
                    }
                    throw new Error("Failed to load booking verification details.");
                }

                const data = await response.json();
                setBooking(data);
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        }

        fetchBookingDetails();
    }, [id]);

    // Mask sensitive details to prevent exposing user data to third party scanner apps
    const maskEmail = (email: string) => {
        if (!email) return 'N/A';
        const parts = email.split('@');
        if (parts.length !== 2) return email;
        const name = parts[0];
        const domain = parts[1];
        if (name.length <= 2) return `${name[0]}***@${domain}`;
        return `${name.substring(0, 2)}***${name.charAt(name.length - 1)}@${domain}`;
    };

    const maskPhone = (phone: string) => {
        if (!phone) return 'N/A';
        const cleanPhone = phone.trim();
        if (cleanPhone.length < 4) return '*******';
        return `${cleanPhone.substring(0, 3)}*****${cleanPhone.substring(cleanPhone.length - 2)}`;
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] text-black font-sans pb-16">
            {/* Top Premium Purple Header */}
            <div className="w-full bg-[#0A0132] border-b border-white/10 shadow-md py-5 px-6 sticky top-0 z-50">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => router.push('/')}
                        className="text-white hover:text-white/80 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 height-4" /> Home
                    </button>
                    <img 
                        src="https://raw.githubusercontent.com/ramji2311/tailwind-tsx-replica/main/ticpin-logo-black.png" 
                        alt="TICPIN" 
                        className="h-6 brightness-0 invert" 
                    />
                    <div className="w-16"></div> {/* Spacer for symmetry */}
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 mt-8">
                {loading ? (
                    <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 text-center shadow-lg flex flex-col items-center justify-center min-h-[300px]">
                        <div className="w-12 h-12 border-4 border-[#5331EA] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Verifying Ticket Booking...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-lg">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                            <XCircle className="w-9 h-9" />
                        </div>
                        <h2 className="text-xl font-bold text-red-600 mb-3">Verification Failed</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
                        <Link 
                            href="/"
                            className="inline-flex items-center justify-center w-full py-3 px-4 bg-[#0A0132] hover:bg-[#5331EA] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                            Return to Homepage
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Verification Status Card */}
                        <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden shadow-lg">
                            <div className="p-6 text-center border-b border-[#F2F2F2]">
                                {booking.status === 'booked' || booking.status === 'confirmed' ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-sm relative">
                                            <CheckCircle2 className="w-10 h-10 animate-pulse" />
                                            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
                                        </div>
                                        <h2 className="text-2xl font-black text-emerald-600 tracking-tight">✓ TICKET VERIFIED</h2>
                                        <p className="text-gray-400 text-xs mt-1 font-semibold tracking-wider uppercase">Official Booking Status: Active</p>
                                    </div>
                                ) : booking.status === 'cancelled' || booking.status === 'refunded' ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                                            <XCircle className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-2xl font-black text-rose-600 tracking-tight">✗ TICKET CANCELLED</h2>
                                        <p className="text-gray-400 text-xs mt-1 font-semibold tracking-wider uppercase">Official Booking Status: Cancelled</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                                            <AlertCircle className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-2xl font-black text-amber-600 tracking-tight">✗ STATUS PENDING</h2>
                                        <p className="text-gray-400 text-xs mt-1 font-semibold tracking-wider uppercase">Official Booking Status: {booking.status}</p>
                                    </div>
                                )}
                            </div>

                            {/* Main Details Body */}
                            <div className="p-6 space-y-5">
                                {/* Booking Id */}
                                <div className="flex justify-between items-center bg-[#F8F9FA] rounded-xl px-4 py-3 border border-[#F2F2F2]">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID</span>
                                    <span className="font-mono font-bold text-[#5331EA] text-sm bg-[#5331EA]/10 px-2.5 py-1 rounded-md">#{booking.id}</span>
                                </div>

                                {/* Event Info Row */}
                                <div className="flex items-start gap-4">
                                    {booking.event_image_url ? (
                                        <img 
                                            src={booking.event_image_url} 
                                            alt={booking.event_name} 
                                            className="w-20 h-20 rounded-xl object-cover border border-[#EBEBEB] flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-gradient-to-br from-[#AC9BF7] to-[#5331EA] rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                                            TICPIN
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-[#5331EA] tracking-wider uppercase bg-[#5331EA]/10 px-2 py-0.5 rounded-full">{booking.type}</span>
                                        <h3 className="font-bold text-lg text-black leading-snug pt-1">{booking.event_name}</h3>
                                    </div>
                                </div>

                                <hr className="border-[#EBEBEB]" />

                                {/* Booking details grid */}
                                <div className="space-y-4 text-sm font-medium">
                                    <div className="flex items-start gap-3.5">
                                        <Calendar className="w-4 h-4 text-[#5331EA] mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Date & Time</p>
                                            <p className="text-gray-900 mt-0.5">{booking.date} | {booking.time}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5">
                                        <MapPin className="w-4 h-4 text-[#5331EA] mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Location / Venue</p>
                                            <p className="text-gray-900 mt-0.5">{booking.venue_name}</p>
                                            {booking.venue_address && (
                                                <p className="text-gray-500 text-xs mt-0.5 font-normal leading-relaxed">{booking.venue_address}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5">
                                        <Ticket className="w-4 h-4 text-[#5331EA] mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Tickets / Quantity</p>
                                            {Array.isArray(booking.tickets) ? (
                                                <div className="space-y-1 mt-1">
                                                    {booking.tickets.map((t: any, index: number) => (
                                                        <div key={index} className="bg-[#F8F9FA] rounded-md px-2.5 py-1 text-xs text-gray-700 flex justify-between gap-6 border border-[#F2F2F2]">
                                                            <span>{t.category || 'Standard'}</span>
                                                            <span className="font-bold">x {t.quantity || 1}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-900 mt-0.5">1 Ticket</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-[#EBEBEB]" />

                                {/* Privacy Protection Customer Segment */}
                                <div className="bg-[#0A0132]/5 rounded-2xl p-4 border border-[#0A0132]/10 space-y-3">
                                    <div className="flex items-center gap-2 text-[#0A0132] font-extrabold text-xs tracking-wider uppercase">
                                        <ShieldCheck className="w-4.5 h-4.5 text-[#5331EA]" />
                                        <span>Masked Booking Contact</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-700">
                                        <div>
                                            <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Email Address</p>
                                            <p className="text-black font-semibold mt-0.5 overflow-hidden text-ellipsis">{maskEmail(booking.user_email)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Phone Number</p>
                                            <p className="text-black font-semibold mt-0.5">{maskPhone(booking.user_phone)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Back home action button */}
                        <div className="text-center">
                            <Link 
                                href="/" 
                                className="inline-flex items-center gap-2 text-sm text-[#5331EA] hover:text-[#0A0132] font-bold transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Go back to Ticpin Homepage
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
