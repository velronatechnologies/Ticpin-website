'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { adminApi, OrganizerListItem, OrganizerDetail } from '@/lib/api/admin';
import { toast } from '@/components/ui/Toast';
import {
    CheckCircle, XCircle, Clock, ChevronRight, User,
    RefreshCw, Trash2, ArrowLeft, Edit3, Save, XCircle as DiscardIcon, Check,
    Utensils, Music, Gamepad2, Shield, Search, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';

interface AdminOrganizersClientProps {
    initialOrganizers: OrganizerListItem[];
    initialTotal: number;
    initialPages: number;
}

type Tab = 'pending' | 'approved' | 'all';

function OrganizerDetailView({ organizerId, onClose, onStatusChange }: {
    organizerId: string;
    onClose: () => void;
    onStatusChange: () => void;
}) {
    const router = useRouter();
    const [detail, setDetail] = useState<OrganizerDetail | null>(null);
    const [editedDetail, setEditedDetail] = useState<OrganizerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedOk, setSavedOk] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'play' | 'dining' | 'events'>('play');

    useEffect(() => {
        adminApi.getOrganizerDetail(organizerId)
            .then(d => { setDetail(d); setEditedDetail(d); })
            .catch(() => { toast.error('Failed to load details'); })
            .finally(() => setLoading(false));
    }, [organizerId]);

    const handleStatusUpdate = async (category: string, status: 'approved' | 'rejected' | 'pending') => {
        if (!detail) return;
        setUpdating(category);
        try {
            await adminApi.updateCategoryStatus(organizerId, category, status, rejectionReason || undefined);
            setDetail(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    organizer: {
                        ...prev.organizer,
                        categoryStatus: { ...prev.organizer.categoryStatus, [category]: status },
                    },
                };
            });
            setShowRejectInput(null);
            setRejectionReason('');
            onStatusChange();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const handleFieldChange = (path: string, value: string) => {
        setEditedDetail(prev => {
            if (!prev) return prev;
            const keys = path.split('.');
            const newObj = structuredClone(prev) as any;
            let cur = newObj;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!cur[keys[i]]) cur[keys[i]] = {};
                cur = cur[keys[i]];
            }
            cur[keys[keys.length - 1]] = value;
            return newObj;
        });
    };

    const handleSave = async () => {
        if (!editedDetail) return;
        setIsSaving(true);
        try {
            await adminApi.updateOrganizer(organizerId, editedDetail);
            setDetail(editedDetail);
            setIsEditMode(false);
            setSavedOk(true);
            setTimeout(() => setSavedOk(false), 2500);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Save failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setEditedDetail(detail);
        setIsEditMode(false);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#F3F0FF]">
                <RefreshCw className="animate-spin text-[#AC9BF7]" size={48} />
            </div>
        );
    }

    if (!detail || !editedDetail) return null;
    const org = editedDetail.organizer;
    const profile = editedDetail.profile;

    const orgFields = [
        { label: 'Email', path: 'organizer.email', value: org.email || '' },
        { label: 'Created At', value: org.createdAt ? new Date(org.createdAt).toLocaleString('en-IN') : 'N/A', readOnly: true },
        { label: 'Profile Name', path: 'profile.name', value: profile?.name || '' },
        { label: 'Phone', path: 'profile.phone', value: profile?.phone || '' },
        { label: 'DOB', path: 'profile.dob', value: (profile as any)?.dob || '' },
        { label: 'Gender', path: 'profile.gender', value: (profile as any)?.gender || '' },
        { label: 'Address', path: 'profile.address', value: profile?.address || '' },
        { label: 'City / District', path: 'profile.district', value: profile?.district || '' },
        { label: 'State', path: 'profile.state', value: profile?.state || '' },
        { label: 'Country', path: 'profile.country', value: profile?.country || '' },
        { label: 'Preferred Language', path: 'profile.preferredLanguage', value: (profile as any)?.preferredLanguage || '' },
    ];

    const renderField = (row: { label: string; path?: string; value: string; readOnly?: boolean }) => {
        if (row.readOnly || !isEditMode) {
            return (
                <span className={`text-[16px] font-semibold ${row.value ? 'text-black' : 'text-zinc-400'} break-all text-right max-w-[240px]`}>
                    {row.value || '—'}
                </span>
            );
        }
        return (
            <input
                value={row.value}
                onChange={e => row.path && handleFieldChange(row.path, e.target.value)}
                className="text-[15px] font-semibold bg-[#F3F0FF] border border-[#AC9BF7]/50 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#5331EA] text-right w-full"
                placeholder={row.label}
            />
        );
    };

    return (
        <div className="fixed inset-0 z-[70] bg-[#F3F0FF] h-screen overflow-hidden flex flex-col">
            <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col p-8">
                <div className="mb-6 flex justify-between items-start">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-4">
                            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                                <ArrowLeft size={32} />
                            </button>
                            <h1 className="text-[40px] font-semibold text-black leading-tight">Admin Panel</h1>
                        </div>
                        <div className="w-16 h-1 bg-black mt-2 ml-14" />
                        <h2 className="text-[28px] font-medium text-black mt-3 ml-14">Organizer Moderation</h2>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                        {savedOk && (
                            <span className="flex items-center gap-1.5 text-green-600 font-bold text-[15px] bg-green-50 px-4 py-2 rounded-xl">
                                <Check size={18} /> Saved!
                            </span>
                        )}
                        {!isEditMode ? (
                            <button
                                onClick={() => setIsEditMode(true)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5331EA] text-white font-bold hover:bg-[#4020C9] transition-all shadow-sm"
                            >
                                <Edit3 size={18} /> Edit Details
                            </button>
                        ) : (
                            <>
                                <button onClick={handleDiscard}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-600 font-bold hover:bg-white transition-all">
                                    <DiscardIcon size={18} /> Discard
                                </button>
                                <button onClick={handleSave} disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white font-bold hover:bg-zinc-800 transition-all disabled:opacity-50">
                                    <Save size={18} /> {isSaving ? 'Saving…' : 'Save'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-[40px] shadow-sm p-12 flex gap-10 overflow-hidden">
                    <div className="w-1/4 flex flex-col">
                        <div className="bg-[#EEEDFC] rounded-[30px] flex-1 flex flex-col items-center p-10 shadow-inner overflow-y-auto">
                            <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 overflow-hidden flex-shrink-0 relative">
                                {profile?.profilePhoto ? (
                                    <Image src={profile.profilePhoto} alt="Profile" fill className="object-cover" />
                                ) : (
                                    <User size={72} className="text-[#AC9BF7]" />
                                )}
                            </div>
                            <h3 className="text-[22px] font-bold text-black text-center break-words w-full leading-tight">
                                {profile?.name || 'NAME NOT SET'}
                            </h3>
                            <p className="text-[16px] text-[#686868] mt-1 break-all text-center w-full">{org.email}</p>
                            
                            <div className="mt-8 pt-6 border-t border-black/10 w-full space-y-4">
                                <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 text-center">Category Moderation</p>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { id: 'play', label: 'Play', icon: Gamepad2 },
                                        { id: 'events', label: 'Events', icon: Music },
                                        { id: 'dining', label: 'Dining', icon: Utensils },
                                    ].map((cat) => {
                                        const status = (org.categoryStatus as any)?.[cat.id];
                                        const isActive = activeCategory === cat.id;
                                        const hasApplied = detail.setups?.some(s => s.category.toLowerCase() === cat.id.toLowerCase());
                                        const Icon = cat.icon;

                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveCategory(cat.id as any)}
                                                className={`group relative flex items-center gap-4 p-4 rounded-[20px] border-2 transition-all duration-300
                                                    ${isActive
                                                        ? 'bg-[#5331EA] border-[#5331EA] shadow-lg scale-[1.02]'
                                                        : 'bg-white/50 border-black/5 hover:border-[#AC9BF7]/30 hover:bg-white'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                                                    ${isActive ? 'bg-white/20 text-white' : 'bg-[#EEEDFC] text-[#5331EA]'}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="flex flex-col items-start overflow-hidden">
                                                    <span className={`text-[15px] font-bold transition-colors ${isActive ? 'text-white' : 'text-black'}`}>
                                                        {cat.label}
                                                    </span>
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors
                                                        ${!hasApplied ? (isActive ? 'text-white/60' : 'text-zinc-400') :
                                                            status === 'approved' ? (isActive ? 'text-green-300' : 'text-green-600') :
                                                                status === 'rejected' ? (isActive ? 'text-red-300' : 'text-red-500') :
                                                                    (isActive ? 'text-orange-300' : 'text-orange-500')}`}>
                                                        {!hasApplied ? 'Not Applied' : (status || 'Pending')}
                                                    </span>
                                                </div>
                                                {isActive && <div className="absolute right-4 w-2 h-2 rounded-full bg-white animate-pulse" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-3/4 flex flex-col overflow-y-auto px-4">
                        <div className="mb-8">
                            <h4 className="text-[20px] font-bold text-black uppercase tracking-wider mb-4">Account Details</h4>
                            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                                {orgFields.map((row, i) => (
                                    <div key={i} className={`flex flex-col border-b pb-1.5 ${isEditMode && !row.readOnly ? 'border-[#AC9BF7]/50' : 'border-[#AEAEAE]'}`}>
                                        <span className="text-[14px] font-medium text-[#686868]">{row.label}</span>
                                        <div className="mt-0.5 flex justify-between items-center">{renderField(row)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {(() => {
                            const setupIdx = detail.setups?.findIndex(s => s.category.toLowerCase() === activeCategory.toLowerCase());
                            const setup = (setupIdx !== undefined && setupIdx !== -1) ? detail.setups[setupIdx] : null;

                            if (!setup) {
                                return (
                                    <div className="flex-1 flex items-center justify-center flex-col py-20 bg-[#F8F7FF] rounded-[30px] border-2 border-dashed border-[#EEEDFC]">
                                        <p className="text-[24px] font-bold text-black uppercase tracking-tight">Not Applied Yet</p>
                                        <p className="text-[16px] text-zinc-500 mt-2 max-w-sm text-center">
                                            This organizer has not submitted an application for the <span className="font-bold text-[#5331EA]">{activeCategory.toUpperCase()}</span> category.
                                        </p>
                                    </div>
                                );
                            }

                            return (
                                <div key={setup.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="text-[24px] font-bold text-black uppercase tracking-tight">{activeCategory} Application</h4>
                                        <span className={`px-6 py-2 rounded-full text-[15px] font-bold border-2 ${detail.organizer.categoryStatus?.[setup.category] === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-orange-50 text-orange-700'}`}>
                                            {detail.organizer.categoryStatus?.[setup.category]?.toUpperCase() || 'PENDING'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                        {[
                                            { label: 'Bank Account No.', path: `setups.${setupIdx}.bankAccountNo`, value: setup.bankAccountNo },
                                            { label: 'Bank Name', path: `setups.${setupIdx}.bankName`, value: setup.bankName },
                                            { label: 'IFSC Code', path: `setups.${setupIdx}.bankIfsc`, value: setup.bankIfsc },
                                            { label: 'Account Holder', path: `setups.${setupIdx}.accountHolder`, value: setup.accountHolder },
                                            { label: 'GST Number', path: `setups.${setupIdx}.gstNumber`, value: setup.gstNumber },
                                            { label: 'PAN Card No.', path: `setups.${setupIdx}.pan`, value: setup.pan },
                                            { label: 'PAN Name', path: `setups.${setupIdx}.panName`, value: setup.panName },
                                            { label: 'Phone', path: `setups.${setupIdx}.phone`, value: setup.phone },
                                        ].map((row, i) => (
                                            <div key={i} className="flex flex-col border-b pb-2 border-[#EEEDFC]">
                                                <span className="text-[14px] font-semibold text-zinc-400 uppercase tracking-wider">{row.label}</span>
                                                <div className="mt-1 flex justify-between items-center">{renderField(row as any)}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-[#EEEDFC] flex gap-4 justify-end">
                                        {showRejectInput === setup.id ? (
                                            <div className="flex flex-1 gap-4 items-center">
                                                <input
                                                    type="text"
                                                    placeholder="Reason..."
                                                    className="flex-1 h-14 px-6 rounded-2xl border-2 border-red-100"
                                                    value={rejectionReason}
                                                    onChange={e => setRejectionReason(e.target.value)}
                                                />
                                                <button onClick={() => handleStatusUpdate(setup.category, 'rejected')} className="h-14 px-8 rounded-2xl bg-red-600 text-white font-bold">Confirm</button>
                                                <button onClick={() => setShowRejectInput(null)} className="text-zinc-400 font-bold">Back</button>
                                            </div>
                                        ) : (
                                            <>
                                                <button onClick={() => handleStatusUpdate(setup.category, 'approved')} className="h-14 px-10 rounded-2xl bg-green-500 text-white font-bold hover:scale-105 transition-transform">Approve</button>
                                                <button onClick={() => setShowRejectInput(setup.id)} className="h-14 px-10 rounded-2xl bg-red-50 text-red-600 font-bold">Reject</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminOrganizersClient({ initialOrganizers, initialTotal, initialPages }: AdminOrganizersClientProps) {
    const router = useRouter();
    const [organizers, setOrganizers] = useState<OrganizerListItem[]>(initialOrganizers);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialPages);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('pending');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchOrganizers = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            const statusFilter = activeTab === 'all' ? undefined : activeTab;
            const data = await adminApi.listOrganizers(pageNum, 50, statusFilter);
            setOrganizers(data.organizers || []);
            setTotalPages(data.pages || 1);
            setPage(pageNum);
        } catch (err) {
            toast.error('Failed to load organizers');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchOrganizers(1);
    }, [activeTab, fetchOrganizers]);

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this organizer?')) return;
        try {
            await adminApi.deleteOrganizer(id);
            fetchOrganizers(page);
            toast.success('Organizer deleted');
        } catch {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-[family-name:var(--font-anek-latin)]" style={{ zoom: 0.85 }}>
            <header className="w-full h-[100px] bg-white border-b border-zinc-100 flex items-center justify-between px-10 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="font-bold text-2xl tracking-tighter">TICPIN Admin</button>
                </div>
                <div className="flex-1 max-w-md mx-8 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by email..." 
                        className="w-full pl-10 pr-4 py-2 bg-zinc-100 rounded-full focus:outline-none focus:ring-2 focus:ring-black/5"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchOrganizers(1)}
                    />
                </div>
            </header>

            <main className="flex-1 max-w-[1440px] mx-auto w-full px-10 py-12">
                <h1 className="text-[40px] font-semibold text-black mb-10">Organizer Management</h1>

                <div className="bg-white rounded-[30px] border border-zinc-200 shadow-sm p-12 min-h-[600px] flex flex-col">
                    <div className="flex justify-center mb-10">
                        <div className="bg-zinc-100 p-1 rounded-2xl flex w-[500px]">
                            {[
                                { key: 'pending', label: 'Needs Approval' },
                                { key: 'approved', label: 'Approved' },
                                { key: 'all', label: 'View All' }
                            ].map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key as Tab)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === tab.key ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-32"><RefreshCw size={48} className="animate-spin text-zinc-300" /></div>
                    ) : organizers.length === 0 ? (
                        <div className="text-center py-32 text-zinc-400 font-medium text-xl">No organizers found.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {organizers.map(org => (
                                <div key={org.id} className="group bg-zinc-50 rounded-3xl p-6 flex items-center justify-between border border-transparent hover:border-zinc-200 transition-all hover:bg-white hover:shadow-md">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <User size={32} className="text-zinc-300" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-black uppercase">{org.email}</h3>
                                            <p className="text-sm text-zinc-400 mt-1">Joined {new Date(org.createdAt).toLocaleDateString()}</p>
                                            <div className="flex gap-2 mt-3">
                                                {Object.entries(org.categoryStatus || {}).map(([cat, status]) => (
                                                    <span key={cat} className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {cat}: {status}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => handleDelete(org.id)} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                                            <Trash2 size={22} />
                                        </button>
                                        <button onClick={() => setSelectedId(org.id)} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-all">
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-6 mt-10 pt-10 border-t border-zinc-100">
                            <button onClick={() => fetchOrganizers(page - 1)} disabled={page === 1} className="px-6 py-2 rounded-xl border border-zinc-200 font-bold disabled:opacity-30 flex items-center gap-2"><ChevronLeft size={18}/> Previous</button>
                            <span className="flex items-center font-bold">Page {page} of {totalPages}</span>
                            <button onClick={() => fetchOrganizers(page + 1)} disabled={page === totalPages} className="px-6 py-2 rounded-xl border border-zinc-200 font-bold disabled:opacity-30 flex items-center gap-2">Next <ChevronRightIcon size={18}/></button>
                        </div>
                    )}
                </div>
            </main>

            {selectedId && <OrganizerDetailView organizerId={selectedId} onClose={() => setSelectedId(null)} onStatusChange={() => fetchOrganizers(page)} />}
        </div>
    );
}
