'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Plus, BookOpen, User } from 'lucide-react';

export default function EventOrganizerDashboard() {
    const { isLoggedIn, isOrganizer, organizerCategory, userId } = useStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn || !isOrganizer || (organizerCategory !== 'event' && organizerCategory !== 'individual' && organizerCategory !== 'creator')) {
            router.push('/list-your-events');
        }
    }, [isLoggedIn, isOrganizer, organizerCategory, router]);

    if (!isLoggedIn || !isOrganizer) return null;

    return (
        <div className="min-h-screen bg-zinc-50 p-8 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-zinc-900">Event Organizer Dashboard</h1>
                        <p className="text-zinc-500 font-medium">Manage your concerts, shows and ticket sales</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-600 flex items-center gap-2">
                        <User size={16} /> ID: {userId.slice(-6)}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/event-organizer/add" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Create Event</h3>
                                <p className="text-sm text-zinc-500">List a new concert or show</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/event-organizer/list" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">My Events</h3>
                                <p className="text-sm text-zinc-500">Edit and manage listings</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/event-organizer/bookings" className="group bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Registrations</h3>
                                <p className="text-sm text-zinc-500">View ticket sales & guests</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
