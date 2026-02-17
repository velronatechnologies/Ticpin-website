'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutGrid, Search, Edit2, MapPin, ChevronLeft } from 'lucide-react';
import { playApi } from '@/lib/api';

export default function AdminManagePlay() {
    const [venues, setVenues] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        setIsLoading(true);
        const response = await playApi.getAll(100);
        if (response.success && response.data) {
            setVenues(response.data.items || []);
        }
        setIsLoading(false);
    };

    const filteredVenues = venues.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-zinc-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link href="/admin" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all mb-2">
                            <ChevronLeft size={16} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-zinc-900">Manage Play Venues</h1>
                        <p className="text-zinc-500 font-medium">Edit or delete existing sports venues</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search venues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-3 w-full md:w-80 bg-white border border-zinc-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVenues.length > 0 ? (
                            filteredVenues.map((venue) => (
                                <div key={venue.id} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    <div className="h-48 relative bg-zinc-100">
                                        <img
                                            src={venue.images?.hero || '/placeholder.jpg'}
                                            alt={venue.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-600">
                                            {venue.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900 line-clamp-1">{venue.name}</h3>
                                            <div className="flex items-center gap-1.5 text-zinc-500 text-sm mt-1">
                                                <MapPin size={14} />
                                                <span>{venue.location.city}, {venue.location.state}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            <Link
                                                href={`/admin/edit-play/${venue.id}`}
                                                className="flex-1 bg-emerald-600 text-white h-12 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-emerald-700 transition-all shadow-sm"
                                            >
                                                <Edit2 size={18} /> Edit Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-300">
                                <p className="text-zinc-500 font-medium text-lg">No venues found matching your search</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
