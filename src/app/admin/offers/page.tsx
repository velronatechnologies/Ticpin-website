'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Users, Tag, Calendar } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Offer {
    id: string;
    user_id: string;
    code: string;
    discount: string;
    description: string;
    terms: string;
    expiry_date: string;
    is_active: boolean;
    created_at: string;
}

interface User {
    id: string;
    email: string;
    name: string;
    phone: string;
}

export default function AdminOffersPage() {
    const { isAdmin, isLoggedIn, token } = useStore();
    const router = useRouter();
    const { addToast } = useToast();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [formData, setFormData] = useState({
        user_id: '',
        code: '',
        discount: '',
        description: '',
        terms: '',
        expiry_date: '',
        is_active: true
    });

    useEffect(() => {
        if (!isLoggedIn || !isAdmin) {
            router.push('/');
            return;
        }
        fetchOffers();
        fetchUsers();
    }, [isLoggedIn, isAdmin, router]);

    const fetchOffers = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/offers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setOffers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingOffer
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/offers/${editingOffer.id}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/offers`;

        try {
            const response = await fetch(url, {
                method: editingOffer ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                addToast(editingOffer ? 'Offer updated successfully' : 'Offer created successfully', 'success');
                setShowModal(false);
                resetForm();
                fetchOffers();
            } else {
                addToast(data.message || 'Failed to save offer', 'error');
            }
        } catch (error) {
            addToast('Network error', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this offer?')) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/offers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                addToast('Offer deleted successfully', 'success');
                fetchOffers();
            } else {
                addToast(data.message || 'Failed to delete offer', 'error');
            }
        } catch (error) {
            addToast('Network error', 'error');
        }
    };

    const handleEdit = (offer: Offer) => {
        setEditingOffer(offer);
        setFormData({
            user_id: offer.user_id,
            code: offer.code,
            discount: offer.discount,
            description: offer.description,
            terms: offer.terms,
            expiry_date: offer.expiry_date ? offer.expiry_date.split('T')[0] : '',
            is_active: offer.is_active
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingOffer(null);
        setFormData({
            user_id: '',
            code: '',
            discount: '',
            description: '',
            terms: '',
            expiry_date: '',
            is_active: true
        });
    };

    const getUserById = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user ? `${user.name} (${user.email})` : userId;
    };

    if (!isLoggedIn || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900">Offer Management</h1>
                        <p className="text-zinc-500 mt-1">Create and manage user-specific offers</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                    >
                        <Plus size={20} /> Create Offer
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-zinc-300 border-t-black rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map((offer) => (
                            <div key={offer.id} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <Tag className="text-purple-600" size={20} />
                                        <span className="font-bold text-lg">{offer.code}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(offer)}
                                            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} className="text-zinc-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(offer.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} className="text-red-600" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-2xl font-bold text-purple-600">{offer.discount}</div>
                                    <p className="text-sm text-zinc-600">{offer.description}</p>
                                    
                                    <div className="pt-3 border-t border-zinc-100 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                                            <Users size={14} />
                                            <span className="truncate">{getUserById(offer.user_id)}</span>
                                        </div>
                                        {offer.expiry_date && (
                                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                                <Calendar size={14} />
                                                <span>{new Date(offer.expiry_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                            offer.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'
                                        }`}>
                                            {offer.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                            <h2 className="text-2xl font-bold mb-6">
                                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Select User</label>
                                    <select
                                        value={formData.user_id}
                                        onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                        required
                                    >
                                        <option value="">Choose a user...</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} - {user.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Offer Code</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="WELCOME50"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Discount</label>
                                        <input
                                            type="text"
                                            value={formData.discount}
                                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                            className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="50% OFF"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                        rows={3}
                                        placeholder="Special offer for valued customers"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Terms & Conditions</label>
                                    <textarea
                                        value={formData.terms}
                                        onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                        rows={2}
                                        placeholder="Valid for dining only"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={formData.expiry_date}
                                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-5 h-5 rounded border-zinc-300"
                                    />
                                    <label className="text-sm font-medium text-zinc-700">Active</label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 px-6 py-3 border border-zinc-300 rounded-xl font-medium hover:bg-zinc-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                                    >
                                        {editingOffer ? 'Update Offer' : 'Create Offer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
