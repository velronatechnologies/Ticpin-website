'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Check, X, Building2, User, Mail, Phone, Calendar, CreditCard, Receipt, Eye } from 'lucide-react';

interface EventPoster {
    id: string;
    user_id: string;
    organization_details: {
        category: string;
        pan: string;
        pan_name: string;
        pan_image: string;
    };
    gst_details: {
        has_gst: boolean;
        gstin: string;
    };
    bank_details: {
        account_holder_name: string;
        account_number: string;
        ifsc_code: string;
        bank_name: string;
        branch_name: string;
    };
    status: string;
    created_at: string;
    backup_contact: {
        name: string;
        email: string;
        phone: string;
    };
}

export default function AdminEventPostersPage() {
    const { token } = useStore();
    const [posters, setPosters] = useState<EventPoster[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeStatus, setActiveStatus] = useState('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<EventPoster | null>(null);

    const tabs = [
        { id: 'all', label: 'All Requests' },
        { id: 'pending', label: 'Pending', type: 'status' },
        { id: 'play', label: 'Play', type: 'category' },
        { id: 'dining', label: 'Dining', type: 'category' },
        { id: 'creator', label: 'Events', type: 'category' },
    ];

    const fetchPosters = async (category = activeCategory, status = activeStatus) => {
        if (!token) {
            setError('You must be logged in to access this page.');
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/admin/partners`);
            if (category !== 'all') {
                url.searchParams.append('category', category);
            }
            if (status !== 'all') {
                url.searchParams.append('status', status);
            }

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 403) {
                setError('Access denied. Please try logging in again.');
                setLoading(false);
                return;
            }

            const data = await response.json();
            if (data.status === 200) {
                setPosters(data.data.items || []);
            } else {
                setError(data.message || 'Failed to fetch verification requests');
            }
        } catch (error) {
            console.error('Error fetching posters:', error);
            setError('Connection error. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosters(activeCategory, activeStatus);
    }, [token, activeCategory, activeStatus]);

    const handleAction = async (id: string, status: string) => {
        if (!confirm(`Are you sure you want to ${status} this request?`)) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/admin/partners/${id}/approve?status=${status}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                fetchPosters();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const startEditing = (poster: EventPoster) => {
        setEditingId(poster.id);
        setEditForm(JSON.parse(JSON.stringify(poster))); // Deep clone
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm(null);
    };

    const handleSave = async () => {
        if (!editForm || !editingId) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/admin/partners/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                setEditingId(null);
                setEditForm(null);
                fetchPosters();
            } else {
                alert('Failed to save changes');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error connecting to server');
        }
    };

    const updateNestedField = (path: string, value: any) => {
        if (!editForm) return;
        const newForm = { ...editForm };
        const keys = path.split('.');
        let current: any = newForm;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setEditForm(newForm);
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 p-8 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-zinc-900">Organizer Verifications</h1>
                        <p className="text-zinc-500 font-medium tracking-tight">Manage and approve partner requests</p>
                    </div>
                    <div className="flex gap-4">
                        <span className="bg-white px-4 py-2 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 shadow-sm">
                            Total: {posters.length}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1.5 bg-zinc-200/50 w-fit rounded-2xl border border-zinc-200">
                    {tabs.map((tab) => {
                        const isActive = (tab.id === 'all' && activeCategory === 'all' && activeStatus === 'all') ||
                            (tab.type === 'category' && activeCategory === tab.id && activeStatus === 'all') ||
                            (tab.type === 'status' && activeStatus === tab.id && activeCategory === 'all');

                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.id === 'all') {
                                        setActiveCategory('all');
                                        setActiveStatus('all');
                                    } else if (tab.type === 'category') {
                                        setActiveCategory(tab.id);
                                        setActiveStatus('all');
                                    } else if (tab.type === 'status') {
                                        setActiveStatus(tab.id);
                                        setActiveCategory('all');
                                    }
                                }}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-800'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {error ? (
                        <div className="p-20 text-center bg-white rounded-3xl border border-red-200">
                            <p className="text-red-500 text-lg mb-2">Error</p>
                            <p className="text-zinc-600 font-medium">{error}</p>
                            <button
                                onClick={() => fetchPosters()}
                                className="mt-6 px-6 py-2 bg-black text-white rounded-xl text-sm font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : posters.length > 0 ? (
                        posters.map((poster) => (
                            <div key={poster.id} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row justify-between gap-8">
                                    <div className="space-y-6 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${poster.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                poster.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {poster.status}
                                            </div>
                                            <div className="text-zinc-400 text-sm flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(poster.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {/* Organization */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between gap-2 text-zinc-400">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 size={16} />
                                                        <span className="text-xs font-bold uppercase">Organization</span>
                                                    </div>
                                                    {poster.organization_details.pan_image && (
                                                        <a
                                                            href={poster.organization_details.pan_image}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 hover:bg-zinc-100 rounded-lg text-[#5331EA] transition-colors flex items-center gap-1.5"
                                                            title="View PAN Card"
                                                        >
                                                            <Eye size={14} />
                                                            <span className="text-[10px] font-bold uppercase">View PAN</span>
                                                        </a>
                                                    )}
                                                </div>
                                                {editingId === poster.id ? (
                                                    <div className="space-y-3">
                                                        <input
                                                            value={editForm?.organization_details.pan_name}
                                                            onChange={(e) => updateNestedField('organization_details.pan_name', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 focus:bg-white transition-colors"
                                                            placeholder="Company Name"
                                                        />
                                                        <input
                                                            value={editForm?.organization_details.pan}
                                                            onChange={(e) => updateNestedField('organization_details.pan', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-zinc-50 focus:bg-white transition-colors"
                                                            placeholder="PAN Number"
                                                        />
                                                        <select
                                                            value={editForm?.organization_details.category}
                                                            onChange={(e) => updateNestedField('organization_details.category', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 focus:bg-white transition-colors"
                                                        >
                                                            <option value="play">Play Venue</option>
                                                            <option value="dining">Dining Outlet</option>
                                                            <option value="creator">Creator/Events</option>
                                                            <option value="individual">Individual</option>
                                                            <option value="company">Company</option>
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="font-bold text-zinc-900">{poster.organization_details.pan_name}</p>
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-zinc-500">Category: {poster.organization_details.category}</p>
                                                            <p className="text-sm text-zinc-500 font-mono">PAN: {poster.organization_details.pan}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* GST Details */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-zinc-400">
                                                    <Receipt size={16} />
                                                    <span className="text-xs font-bold uppercase">GST Details</span>
                                                </div>
                                                {editingId === poster.id ? (
                                                    <div className="space-y-3">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={editForm?.gst_details.has_gst}
                                                                onChange={(e) => updateNestedField('gst_details.has_gst', e.target.checked)}
                                                                className="rounded border-zinc-300"
                                                            />
                                                            <span className="text-sm font-medium">Has GST</span>
                                                        </label>
                                                        {editForm?.gst_details.has_gst && (
                                                            <input
                                                                value={editForm?.gst_details.gstin}
                                                                onChange={(e) => updateNestedField('gst_details.gstin', e.target.value)}
                                                                className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-zinc-50 focus:bg-white transition-colors"
                                                                placeholder="GSTIN"
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-sm font-medium text-zinc-900">
                                                            Status: {poster.gst_details.has_gst ? 'Registered' : 'Not Registered'}
                                                        </p>
                                                        {poster.gst_details.has_gst && (
                                                            <p className="text-sm text-zinc-500 font-mono">GSTIN: {poster.gst_details.gstin}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bank Details */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-zinc-400">
                                                    <CreditCard size={16} />
                                                    <span className="text-xs font-bold uppercase">Bank Account</span>
                                                </div>
                                                {editingId === poster.id ? (
                                                    <div className="space-y-3">
                                                        <input
                                                            value={editForm?.bank_details.account_holder_name}
                                                            onChange={(e) => updateNestedField('bank_details.account_holder_name', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 focus:bg-white transition-colors"
                                                            placeholder="Account Holder Name"
                                                        />
                                                        <input
                                                            value={editForm?.bank_details.bank_name}
                                                            onChange={(e) => updateNestedField('bank_details.bank_name', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 focus:bg-white transition-colors"
                                                            placeholder="Bank Name"
                                                        />
                                                        <input
                                                            value={editForm?.bank_details.account_number}
                                                            onChange={(e) => updateNestedField('bank_details.account_number', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-zinc-50 focus:bg-white transition-colors"
                                                            placeholder="Account Number"
                                                        />
                                                        <input
                                                            value={editForm?.bank_details.ifsc_code}
                                                            onChange={(e) => updateNestedField('bank_details.ifsc_code', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-zinc-50 focus:bg-white transition-colors"
                                                            placeholder="IFSC Code"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-zinc-900">{poster.bank_details.account_holder_name}</p>
                                                        <p className="text-sm text-zinc-500">{poster.bank_details.bank_name}</p>
                                                        <p className="text-sm text-zinc-600 font-mono">{poster.bank_details.account_number}</p>
                                                        <p className="text-xs text-zinc-400 font-mono">IFSC: {poster.bank_details.ifsc_code}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contact */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-zinc-400">
                                                    <User size={16} />
                                                    <span className="text-xs font-bold uppercase">Back up Contact</span>
                                                </div>
                                                {editingId === poster.id ? (
                                                    <div className="space-y-3">
                                                        <input
                                                            value={editForm?.backup_contact.name}
                                                            onChange={(e) => updateNestedField('backup_contact.name', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 focus:bg-white transition-colors"
                                                            placeholder="Contact Name"
                                                        />
                                                        <input
                                                            value={editForm?.backup_contact.email}
                                                            onChange={(e) => updateNestedField('backup_contact.email', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 focus:bg-white transition-colors"
                                                            placeholder="Contact Email"
                                                        />
                                                        <input
                                                            type="tel"
                                                            value={editForm?.backup_contact.phone}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '');
                                                                if (val.length <= 10) updateNestedField('backup_contact.phone', val);
                                                            }}
                                                            maxLength={10}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 focus:bg-white transition-colors"
                                                            placeholder="Contact Phone (10 digits)"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-zinc-900">{poster.backup_contact.name || 'No Name Provided'}</p>
                                                        <p className="text-sm flex items-center gap-2 text-zinc-600">
                                                            <Mail size={14} /> {poster.backup_contact.email}
                                                        </p>
                                                        <p className="text-sm flex items-center gap-2 text-zinc-600">
                                                            <Phone size={14} /> {poster.backup_contact.phone || 'N/A'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* User ID */}
                                            <div className="space-y-2">
                                                <span className="text-xs font-bold text-zinc-400 uppercase">User Association</span>
                                                <p className="text-sm text-zinc-500 truncate">ID: {poster.user_id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {editingId === poster.id ? (
                                        <div className="flex flex-row lg:flex-col gap-3 justify-center lg:justify-start lg:min-w-[160px]">
                                            <button
                                                onClick={handleSave}
                                                className="flex-1 bg-black text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold transition-all hover:scale-[1.02] active:scale-95"
                                            >
                                                <Check size={20} /> Save Changes
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="flex-1 bg-zinc-100 text-zinc-600 rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold transition-all hover:bg-zinc-200"
                                            >
                                                <X size={20} /> Cancel
                                            </button>
                                        </div>
                                    ) : poster.status === 'pending' && (
                                        <div className="flex flex-row lg:flex-col gap-3 justify-center lg:justify-start lg:min-w-[160px]">
                                            <button
                                                onClick={() => startEditing(poster)}
                                                className="flex-1 bg-zinc-900 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold transition-all hover:bg-zinc-800"
                                            >
                                                Edit details
                                            </button>
                                            <button
                                                onClick={() => handleAction(poster.id, 'approved')}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold transition-colors"
                                            >
                                                <Check size={20} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(poster.id, 'rejected')}
                                                className="flex-1 bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-500 rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold transition-colors"
                                            >
                                                <X size={20} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center bg-white rounded-3xl border border-zinc-200">
                            <p className="text-zinc-500 text-lg">No verification requests found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
