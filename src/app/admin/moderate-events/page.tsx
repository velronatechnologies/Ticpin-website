'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Check, X, Calendar, MapPin, Clock, Tag, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface Event {
    id: string;
    organizer_id: string;
    title: string;
    category: string;
    status: string;
    start_datetime: string;
    price_start: number;
    venue: {
        name: string;
        city: string;
    };
    images: {
        hero: string;
    };
    artists: { name: string; role: string }[];
}

export default function ModerateEventsPage() {
    const { token } = useStore();
    const { addToast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; id: string; reason: string }>({
        isOpen: false,
        id: '',
        reason: ''
    });

    const fetchEvents = async () => {
        if (!token) {
            setError('You must be logged in to access this page.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await eventsApi.getAll(100, '', '', '', '', true, 'pending');
            if (response.success && response.data) {
                setEvents(response.data.items || []);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchEvents();
        }
    }, [token]);

    const handleAction = async (id: string, status: string, reason?: string) => {
        if (status === 'rejected' && !reason) {
            setRejectionModal({ isOpen: true, id, reason: '' });
            return;
        }

        if (!confirm(`Are you sure you want to ${status} this event?`)) return;

        try {
            const response = await eventsApi.approve(id, status, reason);
            if (response.success) {
                addToast(`Event ${status === 'active' ? 'approved' : 'rejected'} successfully`, 'success');
                setRejectionModal({ isOpen: false, id: '', reason: '' });
                fetchEvents();
            } else {
                addToast(response.message || `Failed to ${status} event`, 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            addToast('An error occurred', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this event? This action cannot be undone.')) return;

        try {
            const response = await eventsApi.adminDelete(id);
            if (response.success) {
                addToast('Event deleted successfully', 'success');
                fetchEvents();
            } else {
                addToast(response.message || 'Failed to delete event', 'error');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            addToast('An error occurred', 'error');
        }
    };

    if (loading) return <div className="p-20 text-center">Loading pending events...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 p-8 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-zinc-900">Event Moderation</h1>
                        <p className="text-zinc-500 font-medium">Review and approve pending event submissions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <div key={event.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row">
                                <div className="w-full md:w-64 h-48 md:h-auto relative bg-zinc-100">
                                    <img src={event.images?.hero || '/placeholder.jpg'} alt={event.title} className="w-full h-full object-cover" />
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${event.status === 'pending' ? 'bg-amber-500 text-white' :
                                        event.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                        {event.status}
                                    </div>
                                </div>

                                <div className="flex-1 p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900">{event.title}</h3>
                                            <div className="flex items-center gap-4 mt-2 text-zinc-500 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Tag size={14} />
                                                    {event.category}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {event.venue?.name}, {event.venue?.city}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-zinc-900">₹{event.price_start}</p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase">Starting Price</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 py-4 border-y border-zinc-100">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Date & Time</p>
                                            <div className="flex items-center gap-2 text-zinc-700 font-medium">
                                                <Calendar size={16} />
                                                {new Date(event.start_datetime).toLocaleDateString()}
                                                <Clock size={16} className="ml-2" />
                                                {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Artists</p>
                                            <p className="text-zinc-700 font-medium">
                                                {event.artists?.length > 0 ? event.artists.map(a => a.name).join(', ') : 'No artists listed'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap justify-between items-center pt-2 gap-4">
                                        <div className="flex items-center gap-4">
                                            <a href={`/events/${event.id}`} target="_blank" className="text-[#5331EA] text-sm font-bold flex items-center gap-1 hover:underline">
                                                <ExternalLink size={14} /> Preview Page
                                            </a>
                                            <a href={`/admin/edit-event/${event.id}`} className="text-zinc-600 text-sm font-bold flex items-center gap-1 hover:underline">
                                                <Edit2 size={14} /> Edit
                                            </a>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="text-red-500 text-sm font-bold flex items-center gap-1 hover:underline"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                        <div className="flex gap-3">
                                            {event.status !== 'active' && (
                                                <button
                                                    onClick={() => handleAction(event.id, 'active')}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                                                >
                                                    <Check size={18} /> Approve
                                                </button>
                                            )}
                                            {event.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleAction(event.id, 'rejected')}
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
                            <p className="text-zinc-500 text-lg">No pending events found.</p>
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
                            <p className="text-zinc-500">Please provide a reason why this event is being rejected. This will be visible to the organizer.</p>
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
