'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Check, X, MapPin, UtensilsCrossed, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DiningVenue {
    id: string;
    organizer_id: string;
    name: string;
    slug: string;
    status: string;
    description: string;
    location: {
        venue_name: string;
        city: string;
    };
    images: {
        hero: string;
    };
    seating_types: { type: string; price?: number }[];
}

export default function ModerateDiningPage() {
    const { token, isAdmin, isLoggedIn } = useStore();
    const router = useRouter();
    const [venues, setVenues] = useState<DiningVenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; id: string; reason: string }>({
        isOpen: false,
        id: '',
        reason: ''
    });

    const fetchVenues = async () => {
        if (!token) {
            setError('You must be logged in to access this page.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/dining?limit=50&all=true&status=pending`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.status === 200) {
                setVenues(data.data.items || []);
            }
        } catch (error) {
            console.error('Error fetching venues:', error);
            setError('Failed to fetch venues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoggedIn || !isAdmin) {
            router.push('/');
            return;
        }
        if (token) {
            fetchVenues();
        }
    }, [token]);

    const handleAction = async (id: string, status: string, reason?: string) => {
        if (status === 'rejected' && !reason) {
            setRejectionModal({ isOpen: true, id, reason: '' });
            return;
        }

        if (!confirm(`Are you sure you want to ${status} this dining outlet?`)) return;

        try {
            const params = new URLSearchParams({ status });
            if (reason) params.append('reason', reason);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/admin/dining/${id}/approve?${params.toString()}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setRejectionModal({ isOpen: false, id: '', reason: '' });
                fetchVenues();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this dining outlet? This action cannot be undone.')) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/admin/dining/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                fetchVenues();
            } else {
                console.error('Error deleting dining venue');
            }
        } catch (error) {
            console.error('Error deleting venue:', error);
        }
    };

    if (loading) return <div className="p-20 text-center">Loading pending dining outlets...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 p-8 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-zinc-900">Dining Moderation</h1>
                        <p className="text-zinc-500 font-medium">Review and approve pending dining outlet submissions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {venues.length > 0 ? (
                        venues.map((venue) => (
                            <div key={venue.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row">
                                <div className="w-full md:w-64 h-48 md:h-auto relative bg-zinc-100">
                                    <img src={venue.images?.hero || '/placeholder.jpg'} alt={venue.name} className="w-full h-full object-cover" />
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${venue.status === 'pending' ? 'bg-amber-500 text-white' :
                                        venue.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                        {venue.status}
                                    </div>
                                </div>

                                <div className="flex-1 p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900">{venue.name}</h3>
                                            <div className="flex items-center gap-4 mt-2 text-zinc-500 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <UtensilsCrossed size={14} />
                                                    Dining Outlet
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {venue.location?.venue_name}, {venue.location?.city}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col py-4 border-y border-zinc-100 gap-2">
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Description</p>
                                        <p className="text-sm text-zinc-600 line-clamp-2">{venue.description}</p>
                                    </div>

                                    <div className="flex flex-wrap justify-between items-center pt-2 gap-4">
                                        <div className="flex items-center gap-4">
                                            <a href={`/dining/venue/${venue.id}`} target="_blank" className="text-amber-600 text-sm font-bold flex items-center gap-1 hover:underline">
                                                <ExternalLink size={14} /> Preview Page
                                            </a>
                                            <a href={`/admin/edit-dining/${venue.id}`} className="text-zinc-600 text-sm font-bold flex items-center gap-1 hover:underline">
                                                <Edit2 size={14} /> Edit
                                            </a>
                                            <button
                                                onClick={() => handleDelete(venue.id)}
                                                className="text-red-500 text-sm font-bold flex items-center gap-1 hover:underline"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                        <div className="flex gap-3">
                                            {venue.status !== 'active' && (
                                                <button
                                                    onClick={() => handleAction(venue.id, 'active')}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                                                >
                                                    <Check size={18} /> Approve
                                                </button>
                                            )}
                                            {venue.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleAction(venue.id, 'rejected')}
                                                    className="bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-500 px-6 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                                                >
                                                    <X size={18} /> Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center bg-white rounded-3xl border border-zinc-200">
                            <p className="text-zinc-500 text-lg">No pending dining outlets found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Rejection Modal */}
            {rejectionModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-zinc-900">Reason for Rejection</h3>
                            <p className="text-zinc-500">Please provide a reason why this dining outlet is being rejected. This will be visible to the organizer.</p>
                        </div>
                        <textarea
                            value={rejectionModal.reason}
                            onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Type reason here..."
                            className="w-full h-32 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-red-500 transition-all font-medium"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRejectionModal({ isOpen: false, id: '', reason: '' })}
                                className="flex-1 px-6 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(rejectionModal.id, 'rejected', rejectionModal.reason)}
                                disabled={!rejectionModal.reason.trim()}
                                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
