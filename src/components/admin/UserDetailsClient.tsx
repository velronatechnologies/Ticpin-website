'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, X, Edit2, Check, X as XIcon } from 'lucide-react';
import { getBookingStatus, getBookingStatusStyles } from '@/lib/utils/booking-status';
import { toast } from '@/components/ui/Toast';

interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    profilePhoto?: string;
    createdAt: string;
    bookings?: Array<any>;
}

interface UserDetailsClientProps {
    initialUser: User;
    activeTab: 'Overview' | 'Bookings' | 'Ticlists' | 'Activity' | 'Offers';
    userId: string;
}

export default function UserDetailsClient({ initialUser, activeTab, userId }: UserDetailsClientProps) {
    const router = useRouter();
    const [user, setUser] = useState<User>(initialUser);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(initialUser.name);
    const [editPhone, setEditPhone] = useState(initialUser.phone);
    const [bookingFilter, setBookingFilter] = useState<'all' | 'dining' | 'event' | 'play'>('all');
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    const tabs = ['Overview', 'Bookings', 'Ticlists', 'Activity'];

    const handleTabClick = (tab: string) => {
        const routeMap: Record<string, string> = {
            'Overview': '/admin/user-details-view',
            'Bookings': '/admin/user-details-bookings',
            'Ticlists': '/admin/user-details-ticlists',
            'Activity': '/admin/user-details-activity'
        };
        router.push(`${routeMap[tab]}?id=${userId}`);
    };

    const saveEdit = async () => {
        try {
            const res = await fetch(`/backend/api/admin/users/${userId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, phone: editPhone }),
            });
            if (res.ok) {
                setUser(prev => ({ ...prev, name: editName, phone: editPhone }));
                setEditing(false);
                toast.success('User updated successfully');
            }
        } catch {
            toast.error('Failed to update user');
        }
    };

    const filteredBookings = (user.bookings || []).filter(b => 
        bookingFilter === 'all' || b.type === bookingFilter
    );

    const memberSince = new Date(user.createdAt).getFullYear();

    return (
        <div className="bg-[#ECE8FD] rounded-[32px] p-6 md:p-12 lg:p-14 min-h-[600px] flex flex-col items-center justify-center font-[family-name:var(--font-anek-latin)]">
            <div className="w-full max-w-[1440px] px-4">
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <h1 className="text-[40px] font-bold text-black uppercase tracking-tight">Admin Terminal</h1>
                        <div className="w-24 h-1 bg-[#5331EA] mt-1 shadow-[0_0_10px_rgba(83,49,234,0.3)]"></div>
                        <h2 className="text-[20px] font-bold text-[#5331EA] mt-6 uppercase tracking-widest">{activeTab} // {user.name}</h2>
                    </div>
                    <div className="flex bg-white/50 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-sm">
                        {tabs.map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => handleTabClick(tab)}
                                className={`px-6 py-2 text-[14px] font-bold uppercase tracking-wider transition-all duration-300 rounded-full ${
                                    activeTab === tab 
                                        ? 'bg-[#5331EA] text-white shadow-lg' 
                                        : 'text-zinc-500 hover:text-black hover:bg-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[40px] shadow-2xl p-10 min-h-[550px] relative border border-zinc-100 flex flex-col md:flex-row gap-12 overflow-hidden">
                    {/* Left Profile Section */}
                    <div className="w-full md:w-[350px] flex flex-col items-center pt-8 border-b md:border-b-0 md:border-r border-zinc-100 pb-12 md:pb-0">
                        <div className="w-48 h-48 bg-zinc-50 rounded-full mb-8 overflow-hidden relative border-4 border-[#ECE8FD] shadow-inner flex items-center justify-center">
                            {user.profilePhoto ? (
                                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-[#5331EA] text-6xl font-bold uppercase">{user.name[0]}</div>
                            )}
                        </div>
                        
                        <div className="text-center mb-10 w-full px-4">
                            <h3 className="text-[28px] font-bold text-black uppercase truncate tracking-tight">{user.name}</h3>
                            <p className="text-[18px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">{user.phone}</p>
                            {user.email && (
                                <p className="text-[14px] font-medium text-zinc-400 mt-2 lowercase opacity-70 underline decoration-zinc-200">{user.email}</p>
                            )}
                        </div>

                        <div className="px-6 py-3 bg-[#ECE8FD] rounded-2xl flex items-center justify-center border border-[#5331EA]/10">
                            <span className="text-[14px] font-bold text-[#5331EA] uppercase tracking-widest leading-none">Member Since {memberSince}</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 pt-8">
                        {activeTab === 'Overview' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-[24px] font-bold text-black uppercase tracking-tight">System Identity</h3>
                                    <button 
                                        onClick={() => setEditing(!editing)} 
                                        className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-[#5331EA] uppercase hover:bg-[#5331EA]/5 rounded-full transition-all tracking-widest"
                                    >
                                        {editing ? <><XIcon size={14} /> Cancel</> : <><Edit2 size={14} /> Override</>}
                                    </button>
                                </div>

                                {!editing ? (
                                    <div className="space-y-4 max-w-md">
                                        {[
                                            { label: 'Network ID', value: user.id },
                                            { label: 'Alias', value: user.name },
                                            { label: 'Secure Line', value: user.phone },
                                            { label: 'E-Correspondence', value: user.email || 'NOT PROVIDED' },
                                            { label: 'Provisioned', value: new Date(user.createdAt).toLocaleDateString() }
                                        ].map((item, idx) => (
                                            <div key={idx} className="group">
                                                <div className="flex items-center py-3">
                                                    <span className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest w-40">{item.label}</span>
                                                    <span className="text-[14px] font-bold text-black uppercase truncate">{item.value}</span>
                                                </div>
                                                <div className="h-[1px] bg-zinc-100 w-full group-last:hidden"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-w-md animate-in fade-in zoom-in-95 duration-200">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Alias / Name</label>
                                            <input 
                                                value={editName} 
                                                onChange={e => setEditName(e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-[14px] font-bold outline-none focus:border-[#5331EA] transition-all uppercase" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Secure Line / Phone</label>
                                            <input 
                                                value={editPhone} 
                                                onChange={e => setEditPhone(e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-[14px] font-bold outline-none focus:border-[#5331EA] transition-all uppercase" 
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button onClick={saveEdit} className="bg-black text-white px-8 py-3 rounded-2xl text-[13px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2">
                                                <Check size={16} /> Save Changes
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'Bookings' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-[24px] font-bold text-black uppercase tracking-tight">Transaction History</h3>
                                    <div className="flex gap-2 p-1 bg-zinc-50 rounded-xl border border-zinc-200">
                                        {['all', 'dining', 'event', 'play'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setBookingFilter(f as any)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    bookingFilter === f ? 'bg-white text-[#5331EA] shadow-sm shadow-[#5331EA]/10' : 'text-zinc-400 hover:text-zinc-600'
                                                }`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar" style={{ maxHeight: '350px' }}>
                                    {filteredBookings.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-100">
                                            <p className="text-[14px] font-bold text-zinc-300 uppercase tracking-widest">No active transactions found</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-zinc-100">
                                                    <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Entry</th>
                                                    <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                                                    <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                                                    <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Provisioned</th>
                                                    <th className="py-4 text-right"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-50">
                                                {filteredBookings.map((b, idx) => (
                                                    <tr key={idx} className="group hover:bg-zinc-50/50 transition-all cursor-default">
                                                        <td className="py-4 pr-4">
                                                            <div className="text-[14px] font-bold text-black uppercase truncate max-w-[200px]">{b.entityName}</div>
                                                            <div className="text-[9px] font-bold text-zinc-300 uppercase tracking-tighter">{b.type}</div>
                                                        </td>
                                                        <td className="py-4 text-[14px] font-bold text-zinc-600">₹{b.amount || '0'}</td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getBookingStatusStyles(getBookingStatus({ ...b, date: b.bookingDate }))}`}>
                                                                {getBookingStatus({ ...b, date: b.bookingDate })}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-[12px] font-bold text-zinc-400 uppercase">{new Date(b.bookingDate).toLocaleDateString()}</td>
                                                        <td className="py-4 text-right">
                                                            <button 
                                                                onClick={() => { setSelectedBooking(b); setShowModal(true); }}
                                                                className="p-2 hover:bg-[#5331EA] hover:text-white rounded-full transition-all text-zinc-300 active:scale-90"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}

                        {(activeTab === 'Ticlists' || activeTab === 'Activity') && (
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                                    <XIcon size={32} className="text-zinc-200" strokeWidth={3} />
                                </div>
                                <h3 className="text-[18px] font-bold text-zinc-300 uppercase tracking-widest">No detailed {activeTab} data available</h3>
                                <p className="text-[11px] font-medium text-zinc-300 uppercase mt-2">Enhanced activity tracking coming soon</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Dots (Visual placeholder from original) */}
                    <div className="absolute left-1/2 bottom-8 -translate-x-1/2 flex gap-3">
                        <div className={`w-2 h-2 rounded-full ${activeTab === 'Overview' ? 'bg-[#5331EA]' : 'bg-zinc-200'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${activeTab === 'Bookings' ? 'bg-[#5331EA]' : 'bg-zinc-200'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${activeTab === 'Ticlists' ? 'bg-[#5331EA]' : 'bg-zinc-200'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${activeTab === 'Activity' ? 'bg-[#5331EA]' : 'bg-zinc-200'}`}></div>
                    </div>

                    <div className="absolute right-10 bottom-8">
                        <button 
                            onClick={() => {
                                const nextMap: any = { 'Overview': 'Bookings', 'Bookings': 'Ticlists', 'Ticlists': 'Activity', 'Activity': 'Overview' };
                                handleTabClick(nextMap[activeTab]);
                            }}
                            className="bg-black text-white px-8 py-3 rounded-2xl text-[14px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                        >
                            Next Module
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-10 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-[#5331EA] uppercase tracking-[0.2em] mb-1">Detailed Record</p>
                                    <h2 className="text-3xl font-bold text-black uppercase tracking-tight">{selectedBooking.entityName}</h2>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-zinc-200 rounded-full transition-colors"><X size={24} /></button>
                            </div>
                        </div>
                        
                        <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-10 mb-10">
                                {[
                                    { label: 'Network Integrity', value: getBookingStatus({ ...selectedBooking, date: selectedBooking.bookingDate }), isStatus: true },
                                    { label: 'Fiscal Amount', value: selectedBooking.amount ? `₹${selectedBooking.amount}` : '—' },
                                    { label: 'Provisioned Date', value: new Date(selectedBooking.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
                                    { label: 'System Timestamp', value: new Date(selectedBooking.createdAt).toLocaleString() }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-1">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.label}</p>
                                        {item.isStatus ? (
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getBookingStatusStyles(item.value)}`}>
                                                {item.value}
                                            </span>
                                        ) : (
                                            <p className="text-lg font-bold text-black uppercase">{item.value}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-3">Raw Metadata Buffer</h4>
                                <div className="bg-zinc-50 rounded-2xl p-6 font-mono text-[12px] text-zinc-500 leading-relaxed overflow-x-auto border border-zinc-100">
                                    {selectedBooking.metadata ? (
                                        <div className="space-y-3">
                                            {Object.entries(selectedBooking.metadata).map(([key, value]) => {
                                                if (key === '_id' || key === 'userId') return null;
                                                return (
                                                    <div key={key} className="flex border-b border-zinc-100/50 last:border-0 pb-2">
                                                        <span className="w-40 shrink-0 text-zinc-400 font-bold uppercase tracking-tighter">{key}:</span>
                                                        <span className="text-black font-bold break-all">{JSON.stringify(value)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="italic text-zinc-400 uppercase">NO EXTRA DATA BUFFERS FOUND</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-zinc-50/50 border-t border-zinc-100 flex justify-end">
                            <button onClick={() => setShowModal(false)} className="px-12 py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all text-sm shadow-lg active:scale-95">Close Terminal</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{customScrollbarStyle}</style>
        </div>
    );
}

const customScrollbarStyle = `
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #E5E0FC;
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #5331EA;
    }
`;
