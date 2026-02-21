'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Database, Edit2, Trash2, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const COLLECTIONS = [
    { name: 'users', label: 'Users', icon: '👤' },
    { name: 'partners', label: 'Partners', icon: '🤝' },
    { name: 'offers', label: 'Offers', icon: '🎁' },
    { name: 'play_venues', label: 'Play Venues', icon: '⚽' },
    { name: 'dining_venues', label: 'Dining Venues', icon: '🍽️' },
    { name: 'events', label: 'Events', icon: '🎉' },
    { name: 'play_bookings', label: 'Play Bookings', icon: '📅' },
    { name: 'dining_bookings', label: 'Dining Bookings', icon: '🍴' },
];

export default function DatabaseEditorPage() {
    const { isAdmin, isLoggedIn, token } = useStore();
    const router = useRouter();
    const { addToast } = useToast();
    const [selectedCollection, setSelectedCollection] = useState('');
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState<any>(null);
    const [jsonData, setJsonData] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const [editMode, setEditMode] = useState<'form' | 'json'>('form');
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && (!isLoggedIn || !isAdmin)) {
            router.push('/');
        }
    }, [isMounted, isLoggedIn, isAdmin, router]);

    const fetchCollection = async (collectionName: string) => {
        setLoading(true);
        setSelectedCollection(collectionName);
        
        try {
            let endpoint = '';
            switch (collectionName) {
                case 'users':
                    endpoint = '/api/v1/users';
                    break;
                case 'partners':
                    endpoint = '/api/v1/admin/partners';
                    break;
                case 'offers':
                    endpoint = '/api/v1/offers';
                    break;
                case 'play_venues':
                    endpoint = '/api/v1/play';
                    break;
                case 'dining_venues':
                    endpoint = '/api/v1/dining';
                    break;
                case 'events':
                    endpoint = '/api/v1/events';
                    break;
                case 'play_bookings':
                    endpoint = '/api/v1/bookings?type=play';
                    break;
                case 'dining_bookings':
                    endpoint = '/api/v1/bookings?type=dining';
                    break;
                default:
                    addToast('Collection not supported yet', 'warning');
                    setLoading(false);
                    return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            console.log(`Fetching ${collectionName}:`, data);
            
            if (data.success || data.status === 200) {
                // Handle different response structures
                let docs;
                if (data.data) {
                    // Check if data has items property (paginated responses)
                    if (Array.isArray(data.data.items)) {
                        docs = data.data.items;
                    } 
                    // Check if data is directly an array
                    else if (Array.isArray(data.data)) {
                        docs = data.data;
                    }
                    // Single object response
                    else {
                        docs = [data.data];
                    }
                } else {
                    docs = [];
                }
                
                console.log(`${collectionName} documents:`, docs);
                setDocuments(docs);
            } else {
                addToast(data.message || 'Failed to fetch data', 'error');
                setDocuments([]);
            }
        } catch (error) {
            console.error('Error fetching collection:', error);
            addToast('Network error', 'error');
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (doc: any) => {
        setEditingDoc(doc);
        setFormData(doc);
        setJsonData(JSON.stringify(doc, null, 2));
        setEditMode('form');
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const dataToSave = editMode === 'json' ? JSON.parse(jsonData) : formData;
            
            // Determine the update endpoint based on collection
            let endpoint = '';
            let method = 'PUT';
            
            switch (selectedCollection) {
                case 'offers':
                    endpoint = `/api/v1/offers/${editingDoc.id}`;
                    break;
                case 'play_venues':
                    endpoint = `/api/v1/admin/play/${editingDoc.id}`;
                    break;
                case 'dining_venues':
                    endpoint = `/api/v1/admin/dining/${editingDoc.id}`;
                    break;
                case 'events':
                    endpoint = `/api/v1/admin/events/${editingDoc.id}`;
                    break;
                case 'partners':
                    endpoint = `/api/v1/admin/partners/${editingDoc.id}`;
                    break;
                case 'users':
                    endpoint = `/api/v1/users/${editingDoc.id}`;
                    break;
                default:
                    addToast('Update not supported for this collection', 'warning');
                    return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSave)
            });

            const data = await response.json();
            if (data.success || data.status === 200) {
                addToast('Document updated successfully', 'success');
                setShowModal(false);
                fetchCollection(selectedCollection);
            } else {
                addToast(data.message || 'Failed to update document', 'error');
            }
        } catch (error: any) {
            addToast(error.message || 'Invalid data or network error', 'error');
        }
    };

    const handleDelete = async (doc: any) => {
        if (!confirm(`Are you sure you want to delete this ${selectedCollection.slice(0, -1)}?`)) return;

        try {
            let endpoint = '';
            switch (selectedCollection) {
                case 'offers':
                    endpoint = `/api/v1/offers/${doc.id}`;
                    break;
                case 'bookings':
                    endpoint = `/api/v1/bookings/${doc.id}`;
                    break;
                default:
                    addToast('Delete not supported for this collection', 'warning');
                    return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                addToast('Document deleted successfully', 'success');
                fetchCollection(selectedCollection);
            } else {
                addToast(data.message || 'Failed to delete document', 'error');
            }
        } catch (error) {
            addToast('Network error', 'error');
        }
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="inline-block w-8 h-8 border-4 border-zinc-300 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isLoggedIn || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Database size={32} className="text-purple-600" />
                        <h1 className="text-3xl font-bold text-zinc-900">Database Editor</h1>
                    </div>
                    <p className="text-zinc-500">View and manage all database collections</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
                    {COLLECTIONS.map((collection) => (
                        <button
                            key={collection.name}
                            onClick={() => fetchCollection(collection.name)}
                            className={`p-4 rounded-xl border-2 transition-all text-center ${
                                selectedCollection === collection.name
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-zinc-200 bg-white hover:border-purple-300'
                            }`}
                        >
                            <div className="text-3xl mb-2">{collection.icon}</div>
                            <div className="text-xs font-medium text-zinc-700">{collection.label}</div>
                        </button>
                    ))}
                </div>

                {selectedCollection && (
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold capitalize">{selectedCollection.replace('_', ' ')}</h2>
                            <button
                                onClick={() => fetchCollection(selectedCollection)}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
                            >
                                <RefreshCw size={16} /> Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block w-8 h-8 border-4 border-zinc-300 border-t-purple-600 rounded-full animate-spin"></div>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500">
                                No documents found in this collection
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider">Key Fields</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-zinc-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200">
                                        {documents.map((doc, index) => {
                                            const keyFields = ['name', 'email', 'phone', 'title', 'code', 'venue_name', 'status', 'category'];
                                            const displayKeys = keyFields.filter(key => doc[key]);
                                            
                                            return (
                                                <tr key={doc.id || index} className="hover:bg-purple-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-mono text-zinc-900 font-medium">
                                                                {(doc.id || 'N/A').slice(0, 8)}...
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            {displayKeys.slice(0, 2).map(key => (
                                                                <div key={key} className="flex items-center gap-2">
                                                                    <span className="text-xs font-semibold text-zinc-500 capitalize min-w-[60px]">
                                                                        {key}:
                                                                    </span>
                                                                    <span className="text-sm text-zinc-900 font-medium truncate max-w-[200px]">
                                                                        {typeof doc[key] === 'boolean' ? (doc[key] ? '✓' : '✗') : doc[key]}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {displayKeys.length === 0 && (
                                                                <span className="text-xs text-zinc-400 italic">No key fields</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {Object.keys(doc).slice(0, 4).map(key => (
                                                                <span 
                                                                    key={key}
                                                                    className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-xs font-medium"
                                                                >
                                                                    {key}
                                                                </span>
                                                            ))}
                                                            {Object.keys(doc).length > 4 && (
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                                                                    +{Object.keys(doc).length - 4} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(doc)}
                                                                className="flex items-center gap-1 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-all font-medium text-sm"
                                                            >
                                                                <Edit2 size={14} />
                                                                Edit
                                                            </button>
                                                            {(selectedCollection === 'offers' || selectedCollection.includes('booking')) && (
                                                                <button
                                                                    onClick={() => handleDelete(doc)}
                                                                    className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all font-medium text-sm"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {showModal && editingDoc && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl max-w-5xl w-full my-8 shadow-2xl">
                            {/* Header */}
                            <div className="border-b border-zinc-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-zinc-900">
                                        Edit {selectedCollection.replace('_', ' ').replace(/s$/, '')}
                                    </h2>
                                    <div className="flex items-center gap-2 bg-zinc-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setEditMode('form')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                                editMode === 'form'
                                                    ? 'bg-white text-zinc-900 shadow-sm'
                                                    : 'text-zinc-600 hover:text-zinc-900'
                                            }`}
                                        >
                                            Form View
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditMode('json');
                                                setJsonData(JSON.stringify(formData, null, 2));
                                            }}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                                editMode === 'json'
                                                    ? 'bg-white text-zinc-900 shadow-sm'
                                                    : 'text-zinc-600 hover:text-zinc-900'
                                            }`}
                                        >
                                            JSON View
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-zinc-500">ID: <span className="font-mono">{editingDoc.id}</span></p>
                            </div>

                            {/* Content */}
                            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                                {editMode === 'form' ? (
                                    <div className="space-y-4">
                                        {Object.entries(formData).map(([key, value]) => {
                                            if (key === 'id') return null;
                                            
                                            const isBoolean = typeof value === 'boolean';
                                            const isNumber = typeof value === 'number';
                                            const isDate = key.includes('date') || key.includes('at') || key.includes('_at');
                                            const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
                                            const isArray = Array.isArray(value);
                                            
                                            return (
                                                <div key={key} className="space-y-2">
                                                    <label className="block text-sm font-semibold text-zinc-700 capitalize">
                                                        {key.replace(/_/g, ' ')}
                                                    </label>
                                                    
                                                    {isBoolean ? (
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData[key]}
                                                                onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                                                                className="w-5 h-5 rounded border-zinc-300 text-purple-600 focus:ring-2 focus:ring-purple-600"
                                                            />
                                                            <span className="text-sm text-zinc-600">
                                                                {formData[key] ? 'Enabled' : 'Disabled'}
                                                            </span>
                                                        </div>
                                                    ) : isObject ? (
                                                        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
                                                            <pre className="text-xs text-zinc-600 overflow-x-auto">
                                                                {JSON.stringify(value, null, 2)}
                                                            </pre>
                                                            <button
                                                                onClick={() => {
                                                                    const newValue = prompt('Edit JSON:', JSON.stringify(value, null, 2));
                                                                    if (newValue) {
                                                                        try {
                                                                            setFormData({ ...formData, [key]: JSON.parse(newValue) });
                                                                        } catch (e) {
                                                                            addToast('Invalid JSON', 'error');
                                                                        }
                                                                    }
                                                                }}
                                                                className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                                                            >
                                                                Edit JSON
                                                            </button>
                                                        </div>
                                                    ) : isArray ? (
                                                        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
                                                            <pre className="text-xs text-zinc-600 overflow-x-auto">
                                                                {JSON.stringify(value, null, 2)}
                                                            </pre>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type={isNumber ? 'number' : isDate ? 'datetime-local' : 'text'}
                                                            value={
                                                                isDate && value 
                                                                    ? new Date(value as string).toISOString().slice(0, 16)
                                                                    : (value as string | number)
                                                            }
                                                            onChange={(e) => {
                                                                let newValue: any = e.target.value;
                                                                if (isNumber) newValue = parseFloat(newValue) || 0;
                                                                if (isDate) newValue = new Date(newValue).toISOString();
                                                                setFormData({ ...formData, [key]: newValue });
                                                            }}
                                                            className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div>
                                        <textarea
                                            value={jsonData}
                                            onChange={(e) => setJsonData(e.target.value)}
                                            className="w-full h-[500px] px-4 py-3 border border-zinc-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                            spellCheck={false}
                                        />
                                        <button
                                            onClick={() => {
                                                try {
                                                    const parsed = JSON.parse(jsonData);
                                                    setFormData(parsed);
                                                    addToast('JSON validated successfully', 'success');
                                                } catch (e) {
                                                    addToast('Invalid JSON format', 'error');
                                                }
                                            }}
                                            className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                                        >
                                            Validate JSON
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-zinc-200 p-6 flex gap-3 bg-zinc-50 rounded-b-2xl">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditMode('form');
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-zinc-300 rounded-xl font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-600/30"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
