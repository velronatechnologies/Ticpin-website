'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Ticket, Calendar, MapPin, Clock, CheckCircle2 } from 'lucide-react';

interface PublicTicketClientProps {
    booking: any;
    origin: string;
}

export default function PublicTicketClient({ booking, origin }: PublicTicketClientProps) {
    const ticketUrl = `${origin}/ticket/${booking.id}`;

    return (
        <div className="min-h-screen bg-[#F5F5F5] py-8 px-4 font-[family-name:var(--font-anek-latin)]">
            <div className="max-w-[800px] mx-auto bg-white rounded-[24px] border border-zinc-200 overflow-hidden shadow-2xl animate-in fade-in duration-500">
                {/* Branded Header */}
                <div className="bg-[#E7C200] py-8 px-6 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-zinc-950 font-black text-4xl tracking-[0.2em] uppercase">TICPIN</span>
                        <div className="mt-2 text-zinc-800 font-bold text-sm tracking-widest bg-white/20 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
                            OFFICIAL TICKET
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-10 space-y-10">
                    {/* Confirmation Status */}
                    <div className="flex items-center gap-4 text-green-600">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={28} strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900">Verification Success</h2>
                            <p className="font-medium text-zinc-500 uppercase">This booking is valid and confirmed</p>
                        </div>
                    </div>

                    {/* Event Detail Card */}
                    <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 flex flex-col md:flex-row gap-6 hover:bg-zinc-100 transition-colors">
                        <div className="w-full md:w-[240px] h-[160px] relative rounded-xl overflow-hidden shadow-lg border border-white">
                            <img 
                                src={booking.eventImageUrl || 'https://res.cloudinary.com/dt9vkv9as/image/upload/v1741270000/placeholder-yellow.png'} 
                                className="w-full h-full object-cover"
                                alt={booking.eventName}
                            />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <h3 className="text-2xl font-black text-zinc-900 uppercase leading-none mb-2">{booking.eventName}</h3>
                            <div className="flex items-start gap-2 text-zinc-500">
                                <MapPin size={18} className="mt-1 shrink-0" />
                                <p className="font-medium tracking-tight uppercase">{booking.venueAddress || booking.venueName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border-2 border-zinc-100 rounded-2xl p-5 shadow-sm">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Booking ID</p>
                            <p className="text-2xl font-black text-zinc-900 tracking-wider uppercase">{booking.id}</p>
                        </div>
                        <div className="bg-white border-2 border-zinc-100 rounded-2xl p-5 shadow-sm">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-2xl font-black text-green-600 uppercase">CONFIRMED</p>
                            </div>
                        </div>
                        <div className="bg-white border-2 border-zinc-100 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                                <Calendar className="text-zinc-600" size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Date</p>
                                <p className="text-lg font-bold text-zinc-900 uppercase">
                                    {booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white border-2 border-zinc-100 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                                <Clock className="text-zinc-600" size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Time & Duration</p>
                                <p className="text-lg font-bold text-zinc-900 uppercase">{booking.time} {booking.duration ? `(${booking.duration * 30} mins)` : ''}</p>
                            </div>
                        </div>
                    </div>

                    {/* QR Verification Section */}
                    <div className="text-center bg-zinc-950 rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <div className="inline-block p-4 bg-white rounded-3xl mb-6 shadow-[0_0_50px_rgba(255,184,0,0.3)]">
                                <QRCodeCanvas value={ticket.qr_payload || ticketUrl} size={200} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-white font-black text-xl tracking-[0.2em] uppercase">VERIFIED TICKET</p>
                                <p className="text-zinc-500 text-sm font-medium">Scan results in authentic TICPIN system verification</p>
                            </div>
                        </div>
                    </div>

                    {/* User Info Footnote */}
                    <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">Customer Details</p>
                            <p className="text-[15px] font-bold text-zinc-600 uppercase tracking-tight">{booking.userName} • {booking.userPhone}</p>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Verified via</p>
                            <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-4 w-auto opacity-40 mx-auto md:ml-auto md:mr-0" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 text-center">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">© 2026 TICPIN TECHNOLOGIES PRIVATE LIMITED • All Rights Reserved</p>
            </div>
        </div>
    );
}
