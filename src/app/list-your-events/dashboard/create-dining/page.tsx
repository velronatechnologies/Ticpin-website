'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronLeft, Plus, Trash2, MapPin,
    Clock, Image as ImageIcon,
    HelpCircle, FileText, Info,
    CheckCircle2, Upload, X, Coffee
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';

export default function CreateDiningVenuePage() {
    const { token, organizerCategory } = useStore();
    const { addToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            router.push('/list-your-events');
            return;
        }
        if (organizerCategory === 'dining' || organizerCategory === 'individual' || organizerCategory === 'company' || organizerCategory === 'creator') {
            // Authorized
        } else if (organizerCategory) {
            addToast(`Access restricted. You are a ${organizerCategory} organizer.`, 'error');
            router.push('/list-your-events/dashboard');
        }
    }, [token, router]);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        status: 'active',
        description: '',
        short_description: '',
        rating: 4.5,
        is_open: true,
        opening_time: '11:00',
        closing_time: '23:00',
        contact: {
            phone: '',
            email: ''
        },
        location: {
            venue_name: '',
            address: '',
            city: '',
            state: '',
            latitude: 0,
            longitude: 0,
            map_url: ''
        },
        images: {
            hero: '',
            gallery: ['', '', ''] as string[]
        },
        menu_images: ['', ''] as string[],
        offers: [{ title: '', code: '', description: '' }],
        facilities: ['AC', 'Parking', 'WiFi'],
        seating_types: [{ type: 'Indoor', total_tables: 10, available_tables: 10, capacity_per_table: 4 }],
        booking_settings: {
            advance_booking_days: 7,
            time_slots: ['12:00', '13:00', '19:00', '20:00'],
            average_dining_duration_minutes: 90
        },
        faqs: [{ question: '', answer: '' }],
        terms_and_conditions: ['']
    });

    const searchParams = useSearchParams();
    const editId = searchParams.get('id');

    useEffect(() => {
        if (editId && token) {
            const fetchVenue = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/dining/id/${editId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.status === 200 || data.success) {
                        setFormData(data.data);
                    }
                } catch (error) {
                    addToast('Failed to load dining data', 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchVenue();
        }
    }, [editId, token]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: string, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(target + (index !== undefined ? index : ''));
        const form = new FormData();
        form.append('file', file);
        form.append('folder', 'dining');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: form
            });
            const data = await response.json();
            if (data.status === 200 && data.data.url) {
                if (target === 'hero') setFormData(prev => ({ ...prev, images: { ...prev.images, hero: data.data.url } }));
                else if (target === 'gallery' && index !== undefined) {
                    const newGallery = [...formData.images.gallery];
                    newGallery[index] = data.data.url;
                    setFormData(prev => ({ ...prev, images: { ...prev.images, gallery: newGallery } }));
                } else if (target === 'menu' && index !== undefined) {
                    const newMenu = [...formData.menu_images];
                    newMenu[index] = data.data.url;
                    setFormData(prev => ({ ...prev, menu_images: newMenu }));
                }
                addToast('Image uploaded', 'success');
            }
        } catch (err) { addToast('Upload failed', 'error'); }
        finally { setUploading(null); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editId
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/dining/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/dining`;
            const method = editId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                addToast(editId ? 'Outlet updated!' : 'Outlet created!', 'success');
                router.push('/list-your-events/dashboard');
            } else {
                const data = await response.json();
                addToast(data.message || 'Error saving outlet', 'error');
            }
        } catch (err) { addToast('Error saving outlet', 'error'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#FBFBFF] font-[family-name:var(--font-anek-latin)]">
            <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900">{editId ? 'Edit Dining Outlet' : 'List New Dining Outlet'}</h1>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-black text-white px-8 py-2.5 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    {loading ? 'Saving...' : 'Publish Outlet'}
                    <CheckCircle2 size={18} />
                </button>
            </header>

            <div className="max-w-[1000px] mx-auto py-12 px-6 space-y-12">
                <Section icon={<Coffee size={20} />} title="Outlet Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Restaurant Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} placeholder="eg. The Grand Buffet" required />
                        <InputField label="Slug" value={formData.slug} onChange={v => setFormData({ ...formData, slug: v })} placeholder="grand-buffet" required />
                        <div className="md:col-span-2 space-y-2">
                            <InputField label="Short Catchphrase" value={formData.short_description} onChange={v => setFormData({ ...formData, short_description: v })} placeholder="Premium dining experience..." />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full h-32 p-4 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium outline-none focus:border-black transition-all"
                            />
                        </div>
                    </div>
                </Section>

                <Section icon={<MapPin size={20} />} title="Contact & Location">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Public Phone" value={formData.contact.phone} onChange={v => setFormData({ ...formData, contact: { ...formData.contact, phone: v } })} />
                        <InputField label="Public Email" value={formData.contact.email} onChange={v => setFormData({ ...formData, contact: { ...formData.contact, email: v } })} />
                        <InputField label="Address" value={formData.location.address} onChange={v => setFormData({ ...formData, location: { ...formData.location, address: v } })} />
                        <InputField label="City" value={formData.location.city} onChange={v => setFormData({ ...formData, location: { ...formData.location, city: v } })} />
                    </div>
                </Section>

                <Section icon={<Plus size={20} />} title="Seating & Tables">
                    <div className="space-y-6">
                        {formData.seating_types.map((st, i) => (
                            <div key={i} className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                                <InputField label="Type" value={st.type} onChange={v => {
                                    const types = [...formData.seating_types];
                                    types[i].type = v;
                                    setFormData({ ...formData, seating_types: types });
                                }} placeholder="eg. Indoor" />
                                <InputField label="Total Tables" type="number" value={st.total_tables} onChange={v => {
                                    const types = [...formData.seating_types];
                                    types[i].total_tables = Number(v);
                                    setFormData({ ...formData, seating_types: types });
                                }} />
                                <InputField label="Capacity/Table" type="number" value={st.capacity_per_table} onChange={v => {
                                    const types = [...formData.seating_types];
                                    types[i].capacity_per_table = Number(v);
                                    setFormData({ ...formData, seating_types: types });
                                }} />
                                {i > 0 && (
                                    <button onClick={() => setFormData({ ...formData, seating_types: formData.seating_types.filter((_, idx) => idx !== i) })} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-zinc-200 text-red-500 rounded-full flex items-center justify-center shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>

                <Section icon={<ImageIcon size={20} />} title="Menu & Atmosphere">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUploadBox label="Hero Image" value={formData.images.hero} onUpload={e => handleFileUpload(e, 'hero')} isUploading={uploading === 'hero'} />
                        <div className="space-y-4">
                            <label className="text-[12px] font-bold text-[#686868] uppercase tracking-wider">Menu Cards</label>
                            <div className="grid grid-cols-2 gap-4">
                                {formData.menu_images.map((img, i) => (
                                    <ImageUploadBox key={i} value={img} onUpload={e => handleFileUpload(e, 'menu', i)} isUploading={uploading === `menu${i}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        <section className="bg-white border border-zinc-200 shadow-sm rounded-[32px] overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
                <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-[#5331EA] shadow-sm">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">{title}</h3>
            </div>
            <div className="p-8">{children}</div>
        </section>
    );
}

interface InputFieldProps {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
}

function InputField({ label, value, onChange, type = "text", placeholder = "", required = false }: InputFieldProps) {
    return (
        <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider">{label} {required && '*'}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full h-14 px-5 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium outline-none focus:border-black transition-all"
                placeholder={placeholder}
            />
        </div>
    );
}

interface ImageUploadBoxProps {
    label?: string;
    value: string;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
}

function ImageUploadBox({ label, value, onUpload, isUploading }: ImageUploadBoxProps) {
    return (
        <div className="space-y-2">
            {label && <label className="text-[12px] font-bold text-[#686868] uppercase tracking-wider">{label}</label>}
            <div className="relative aspect-video rounded-3xl border-2 border-dashed border-zinc-200 overflow-hidden flex flex-col items-center justify-center bg-zinc-50">
                {value ? (
                    <img src={value} className="w-full h-full object-cover" />
                ) : (
                    <label className="cursor-pointer p-6 flex flex-col items-center">
                        <Upload size={24} className="text-zinc-400 mb-2" />
                        <span className="text-sm font-bold text-zinc-500">Upload</span>
                        <input type="file" className="hidden" onChange={onUpload} />
                    </label>
                )}
                {isUploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center">Loading...</div>}
            </div>
        </div>
    );
}
