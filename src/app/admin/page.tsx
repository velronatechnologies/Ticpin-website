'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Users, Plus, LayoutGrid, UtensilsCrossed, Calendar, Edit2, Tag, Database } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { isAdmin, isLoggedIn, token } = useStore();
    const router = useRouter();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (!isLoggedIn || !isAdmin) {
            router.push('/');
        } else {
            // Fetch pending count
            const fetchPendingCount = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/admin/partners?status=pending&limit=100`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.status === 200) {
                        setPendingCount(data.data.items?.length || 0);
                    }
                } catch (e) {
                    console.error('Failed to fetch pending count', e);
                }
            };
            fetchPendingCount();
        }
    }, [isLoggedIn, isAdmin, router, token]);

    if (!isLoggedIn || !isAdmin) return null;
    return (
        <div className="min-h-screen bg-zinc-50 p-8 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-zinc-900">Admin Dashboard</h1>
                    <p className="text-zinc-500 font-medium">Manage listings and partner verifications</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/create-play" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <LayoutGrid size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Create Play Venue</h3>
                                <p className="text-sm text-zinc-500">Add a sports turf or arena</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold group-hover:gap-3 transition-all">
                            <Plus size={16} /> Create Now
                        </div>
                    </Link>

                    <Link href="/admin/create-dining" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                <UtensilsCrossed size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Create Dining Outlet</h3>
                                <p className="text-sm text-zinc-500">Add a restaurant or buffet</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-amber-600 text-sm font-bold group-hover:gap-3 transition-all">
                            <Plus size={16} /> Create Now
                        </div>
                    </Link>

                    <Link href="/admin/create-event" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Create Event</h3>
                                <p className="text-sm text-zinc-500">Add a concert, show or meetup</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-purple-600 text-sm font-bold group-hover:gap-3 transition-all">
                            <Plus size={16} /> Create Now
                        </div>
                    </Link>
                </div>

                <div className="space-y-1 pt-4">
                    <h2 className="text-2xl font-bold text-zinc-900">Manage Listings</h2>
                    <p className="text-zinc-500 font-medium">Update or modify your existing active listings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/edit-play" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Edit2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Edit Play Venues</h3>
                                <p className="text-sm text-zinc-500">Modify turfs & arenas</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/edit-dining" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all text-left">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <Edit2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Edit Dining Outlets</h3>
                                <p className="text-sm text-zinc-500">Modify restaurants</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/edit-event" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all text-left">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Edit2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Edit Events</h3>
                                <p className="text-sm text-zinc-500">Modify concerts & shows</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Admin Tools */}
                <div className="space-y-1 pt-4">
                    <h2 className="text-2xl font-bold text-zinc-900">Admin Tools</h2>
                    <p className="text-zinc-500 font-medium">Advanced management and configuration</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/admin/offers" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-pink-300 transition-all text-left">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                                <Tag size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Manage Offers</h3>
                                <p className="text-sm text-zinc-500">Assign user-specific deals</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/database" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Edit Database</h3>
                                <p className="text-sm text-zinc-500">View & modify collections</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/event-posters" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all text-left relative">
                        {pendingCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce shadow-lg">
                                {pendingCount} PENDING
                            </span>
                        )}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Organizer Verifications</h3>
                                <p className="text-sm text-zinc-500">Manage partner requests</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/moderate-events" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all text-left">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Moderate Events</h3>
                                <p className="text-sm text-zinc-500">Approve organizer events</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/moderate-play" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <LayoutGrid size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Moderate Play</h3>
                                <p className="text-sm text-zinc-500">Approve play venues</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/moderate-dining" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all text-left">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <UtensilsCrossed size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Moderate Dining</h3>
                                <p className="text-sm text-zinc-500">Approve dining outlets</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Management Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/admin/event-posters" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Organizer Verifications</h3>
                                <p className="text-sm text-zinc-500">Manage and approve partner requests</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
