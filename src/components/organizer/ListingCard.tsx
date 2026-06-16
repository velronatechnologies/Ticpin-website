'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Clock, CheckCircle, XCircle, AlertCircle, ImageOff, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export interface Listing {
    id: string;
    name: string;
    category?: string;
    sub_category?: string;
    city?: string;
    status?: string;
    portrait_image_url?: string;
    landscape_image_url?: string;
    createdAt?: string;
    [key: string]: unknown;
}

interface ListingCardProps {
    listing: Listing;
    vertical: 'events' | 'dining' | 'play';
    onDelete: (id: string) => Promise<void>;
    accentColor: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
    pending: { label: 'Under review', bg: 'bg-[#F9C9A9]/50', text: 'text-[#C2410C]', icon: Clock },
    approved: { label: 'Live', bg: 'bg-[#BBF7D0]', text: 'text-[#166534]', icon: CheckCircle },
    rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

export default function ListingCard({ listing, vertical, onDelete }: ListingCardProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const status = listing.status ?? 'pending';
    const statusCfg = STATUS_CONFIG[status] ?? { label: status, bg: 'bg-zinc-100', text: 'text-zinc-600', icon: AlertCircle };

    const handleEdit = () => {
        router.push(`/${vertical}/edit/${listing.id}`);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirmDelete) { setConfirmDelete(true); return; }
        setDeleting(true);
        try {
            await onDelete(listing.id);
        } catch {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <div className="bg-white rounded-[15px] p-8 flex flex-col md:flex-row gap-10 h-auto md:h-[240px] relative items-center border border-[#aeaeae]">
            {/* Image (16:9 aspect) */}
            <div className="w-full md:w-[240px] h-[135px] bg-[rgba(255,241,168,0.3)] rounded-[20px] overflow-hidden shrink-0 relative flex flex-col items-center justify-center border border-[#aeaeae]">
                {listing.portrait_image_url || listing.landscape_image_url ? (
                    <Image
                        src={listing.landscape_image_url || listing.portrait_image_url || ''}
                        alt={listing.name}
                        fill
                        className="object-cover transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-black/50 text-center p-3">
                        <span className="text-[15px] font-semibold" style={{ fontFamily: 'Anek Latin' }}>{`{EVENT POSTER}`}</span>
                        <span className="text-[11px] font-medium" style={{ fontFamily: 'Anek Latin' }}>16:9 aspect ratio</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col justify-center py-0.5 gap-3">
                <div className="space-y-0.5">
                    <h3 className="text-[24px] md:text-[28px] font-medium text-black leading-tight 
                    " style={{ fontFamily: 'Anek Latin' }}>
                        {listing.name || '{PLAY NAME}'}
                    </h3>
                    <p className="text-[18px] md:text-[20px] font-medium text-black/70 " style={{ fontFamily: 'Anek Latin' }}>
                        {listing.city || '{LOCATION}'}
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <button
                        onClick={handleEdit}
                        className="bg-black text-white px-6 h-[44px] md:h-[48px] rounded-[15px] flex items-center gap-2 text-[16px] font-medium transition-all"
                    >
                        <Settings size={18} className="text-white" />
                        <span style={{ fontFamily: 'Anek Latin' }}>Manage {vertical}</span>
                    </button>

                    {confirmDelete ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="h-[44px] md:h-[48px] px-6 rounded-[15px] bg-red-500 text-white text-[15px] font-bold"
                            >
                                {deleting ? '...' : 'Confirm'}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                                className="h-[44px] md:h-[48px] w-[44px] md:w-[48px] rounded-[15px] border border-zinc-200 text-zinc-500 flex items-center justify-center"
                            >
                                <XCircle size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleDelete}
                            className="w-[44px] md:w-[48px] h-[44px] md:h-[48px] rounded-[15px] flex items-center justify-center text-red-300 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="md:absolute top-8 right-8">
                <div
                    className={`px-5 py-1.5 rounded-[12px] text-[14px] md:text-[18px] font-semibold min-w-[90px] md:min-w-[70px] h-[48px] flex items-center justify-center text-center ${status === 'pending' ? 'bg-[#F9C9A9] text-black' : 'bg-[#65B54E]/50 text-black'}`}
                    style={{ fontFamily: 'Anek Latin' }}
                >
                    {status === 'pending' ? 'Under review' : 'Live'}
                </div>
            </div>
        </div>
    );
}

function isDateToday(dateStr?: string) {
    if (!dateStr) return false;
    try {
        const d = new Date(dateStr);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    } catch { return false; }
}
