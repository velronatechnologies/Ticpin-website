'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft, Plus, Trash2, MapPin,
    Clock, Image as ImageIcon,
    HelpCircle, FileText, Info,
    CheckCircle2, Upload
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';
import { playApi } from '@/lib/api';

const MAJOR_CITIES = [
    'Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad',
    'Kolkata', 'Pune', 'Ahmedabad', 'Coimbatore', 'Madurai', 'Trichy'
];

function AdminEditPlayVenueForm() {
    const { token } = useStore();
    const { addToast } = useToast();
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchVenue();
        }
    }, [id]);

    const fetchVenue = async () => {
        setLoading(true);
        const response = await playApi.getById(id as string);
        if (response.success && response.data) {
            // Ensure gallery has at least 3 slots
            const venueData = response.data;
            if (!venueData.images.gallery) venueData.images.gallery = ['', '', ''];
            while (venueData.images.gallery.length < 3) venueData.images.gallery.push('');

            setFormData(venueData);
        } else {
            addToast('Failed to fetch venue details', 'error');
            router.push('/admin/edit-play');
        }
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: string, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(target + (index !== undefined ? index : ''));
        const form = new FormData();
        form.append('file', file);
        form.append('folder', 'play');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: form
            });
            const data = await response.json();
            if (data.status === 200 && data.data.url) {
                if (target === 'hero') setFormData((prev: any) => ({ ...prev, images: { ...prev.images, hero: data.data.url } }));
                else if (target === 'promo') setFormData((prev: any) => ({ ...prev, images: { ...prev.images, promo: data.data.url } }));
                else if (target === 'gallery' && index !== undefined) {
                    const newGallery = [...formData.images.gallery];
                    newGallery[index] = data.data.url;
                    setFormData((prev: any) => ({ ...prev, images: { ...prev.images, gallery: newGallery } }));
                }
                addToast('Image uploaded', 'success');
            }
        } catch (err) { addToast('Upload failed', 'error'); }
        finally { setUploading(null); }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setSaving(true);
        try {
            const response = await playApi.adminUpdate(id as string, formData);
            if (response.success) {
                addToast('Play venue updated successfully!', 'success');
                router.push('/admin/edit-play');
            } else {
                addToast(response.message || 'Error updating venue', 'error');
            }
        } catch (err) { addToast('Error updating venue', 'error'); }
        finally { setSaving(false); }
    };

    const addFaq = () => setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] });
    const removeFaq = (index: number) => setFormData({ ...formData, faqs: formData.faqs.filter((_: any, i: number) => i !== index) });
    const addTerm = () => setFormData({ ...formData, terms_and_conditions: [...formData.terms_and_conditions, ''] });
    const removeTerm = (index: number) => setFormData({ ...formData, terms_and_conditions: formData.terms_and_conditions.filter((_: any, i: number) => i !== index) });

    if (loading) {
        return <div className="min-h-screen bg-[#FBFBFF] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>;
    }

    if (!formData) return null;

    return (
        <div className="min-h-screen bg-[#FBFBFF] font-[family-name:var(--font-anek-latin)]">
            <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/edit-play')} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900">Edit Play Venue</h1>
                        <p className="text-sm text-emerald-600 font-medium">{formData.name}</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    {saving ? 'Updating...' : 'Save Changes'}
                    <CheckCircle2 size={18} />
                </button>
            </header>

            <div className="max-w-[1000px] mx-auto py-12 px-6 space-y-12">
                {/* Venue Information */}
                <Section icon={<FileText size={20} />} title="Venue Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Venue Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} placeholder="eg. Turf Arena Chennai" required />
                        <InputField label="Slug" value={formData.slug} onChange={v => setFormData({ ...formData, slug: v })} placeholder="turf-arena-chennai" required />
                        <div className="md:col-span-2">
                            <InputField label="Short About" value={formData.short_about} onChange={v => setFormData({ ...formData, short_about: v })} placeholder="One line summary..." />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider">About Venue</label>
                            <textarea
                                value={formData.about}
                                onChange={e => setFormData({ ...formData, about: e.target.value })}
                                className="w-full h-32 p-4 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium outline-none focus:border-black transition-all"
                            />
                        </div>
                    </div>
                </Section>

                {/* Location */}
                <Section icon={<MapPin size={20} />} title="Location">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Location Name" value={formData.location.venue_name} onChange={v => setFormData({ ...formData, location: { ...formData.location, venue_name: v } })} placeholder="eg. Turf Arena OMR" />
                        <InputField label="Address" value={formData.location.address} onChange={v => setFormData({ ...formData, location: { ...formData.location, address: v } })} placeholder="Full descriptive address..." />
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider">City *</label>
                            <select
                                value={formData.location.city}
                                onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                className="w-full h-14 px-5 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium outline-none focus:border-black transition-all"
                            >
                                <option value="">Select City</option>
                                {MAJOR_CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                                <option value="Other">Other (Enter below)</option>
                            </select>
                            {formData.location.city === 'Other' && (
                                <input
                                    type="text"
                                    placeholder="Enter custom city"
                                    onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                    className="w-full h-14 px-5 mt-2 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium outline-none focus:border-black transition-all"
                                />
                            )}
                        </div>
                        <InputField label="Map URL" value={formData.location.map_url} onChange={v => setFormData({ ...formData, location: { ...formData.location, map_url: v } })} placeholder="Google Maps link" />
                    </div>
                </Section>

                {/* Play Options */}
                <Section icon={<Plus size={20} />} title="Play Options (Sports)">
                    <div className="space-y-6">
                        {formData.play_options?.map((opt: any, i: number) => (
                            <div key={i} className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                                <InputField label="Sport" value={opt.sport} onChange={v => {
                                    const opts = [...formData.play_options]; opts[i].sport = v; setFormData({ ...formData, play_options: opts });
                                }} placeholder="eg. Football" />
                                <InputField label="Type" value={opt.court_type} onChange={v => {
                                    const opts = [...formData.play_options]; opts[i].court_type = v; setFormData({ ...formData, play_options: opts });
                                }} placeholder="eg. 5v5" />
                                <InputField label="Surface" value={opt.surface} onChange={v => {
                                    const opts = [...formData.play_options]; opts[i].surface = v; setFormData({ ...formData, play_options: opts });
                                }} placeholder="Artificial Grass" />
                                <InputField label="Price (₹)" type="number" value={opt.price_per_slot} onChange={v => {
                                    const opts = [...formData.play_options]; opts[i].price_per_slot = Number(v); setFormData({ ...formData, play_options: opts });
                                }} />
                                {i > 0 && (
                                    <button onClick={() => setFormData({ ...formData, play_options: formData.play_options.filter((_: any, idx: number) => idx !== i) })} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-zinc-200 text-red-500 rounded-full flex items-center justify-center shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={() => setFormData({ ...formData, play_options: [...(formData.play_options || []), { sport: '', court_type: '', surface: '', price_per_slot: 0 }] })} className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 font-bold hover:text-black hover:border-black transition-all">
                            + Add Sport Option
                        </button>
                    </div>
                </Section>

                {/* Slot Settings */}
                <Section icon={<Clock size={20} />} title="Slot Settings">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Opening Time" type="time" value={formData.slot_settings?.open_time} onChange={v => setFormData({ ...formData, slot_settings: { ...formData.slot_settings, open_time: v } })} />
                        <InputField label="Closing Time" type="time" value={formData.slot_settings?.close_time} onChange={v => setFormData({ ...formData, slot_settings: { ...formData.slot_settings, close_time: v } })} />
                    </div>
                </Section>

                {/* Gallery */}
                <Section icon={<ImageIcon size={20} />} title="Gallery">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUploadBox label="Hero Image" value={formData.images?.hero} onUpload={e => handleFileUpload(e, 'hero')} isUploading={uploading === 'hero'} />
                        <ImageUploadBox label="Promo Image" value={formData.images?.promo} onUpload={e => handleFileUpload(e, 'promo')} isUploading={uploading === 'promo'} />
                    </div>
                </Section>

                {/* FAQs */}
                <Section icon={<HelpCircle size={20} />} title="FAQs">
                    <div className="space-y-4">
                        {formData.faqs?.map((faq: any, i: number) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="flex-1 space-y-4">
                                    <input value={faq.question} onChange={e => { const f = [...formData.faqs]; f[i].question = e.target.value; setFormData({ ...formData, faqs: f }); }} placeholder="Question" className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none" />
                                    <input value={faq.answer} onChange={e => { const f = [...formData.faqs]; f[i].answer = e.target.value; setFormData({ ...formData, faqs: f }); }} placeholder="Answer" className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none" />
                                </div>
                                <button onClick={() => removeFaq(i)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"><Trash2 size={20} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addFaq} className="text-black font-bold flex items-center gap-2 text-sm"><Plus size={16} /> Add FAQ</button>
                    </div>
                </Section>

                {/* Terms & Conditions */}
                <Section icon={<Info size={20} />} title="Terms & Conditions">
                    <div className="space-y-4">
                        {formData.terms_and_conditions?.map((term: string, i: number) => (
                            <div key={i} className="flex gap-4 items-center">
                                <input value={term} onChange={e => { const t = [...formData.terms_and_conditions]; t[i] = e.target.value; setFormData({ ...formData, terms_and_conditions: t }); }} placeholder="Term..." className="flex-1 h-12 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none" />
                                <button onClick={() => removeTerm(i)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"><Trash2 size={20} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addTerm} className="text-black font-bold flex items-center gap-2 text-sm"><Plus size={16} /> Add Term</button>
                    </div>
                </Section>
            </div>
        </div>
    );
}

export default function AdminEditPlayPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FBFBFF] flex items-center justify-center">Loading...</div>}>
            <AdminEditPlayVenueForm />
        </Suspense>
    );
}

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        <section className="bg-white border border-zinc-200 shadow-sm rounded-[32px] overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
                <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">{icon}</div>
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">{title}</h3>
            </div>
            <div className="p-8">{children}</div>
        </section>
    );
}

function InputField({ label, value, onChange, type = "text", placeholder = "", required = false }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider">{label} {required && '*'}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-14 px-5 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium outline-none focus:border-black transition-all" placeholder={placeholder} />
        </div>
    );
}

function ImageUploadBox({ label, value, onUpload, isUploading }: { label?: string; value: string; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; isUploading: boolean }) {
    return (
        <div className="space-y-2">
            {label && <label className="text-[12px] font-bold text-[#686868] uppercase tracking-wider">{label}</label>}
            <div className="relative aspect-video rounded-3xl border-2 border-dashed border-zinc-200 overflow-hidden flex flex-col items-center justify-center bg-zinc-50">
                {value ? <img src={value} className="w-full h-full object-cover" alt="" /> : (
                    <label className="cursor-pointer p-6 flex flex-col items-center">
                        <Upload size={24} className="text-zinc-400 mb-2" />
                        <span className="text-sm font-bold text-zinc-500">Upload</span>
                        <input type="file" className="hidden" onChange={onUpload} accept="image/*" />
                    </label>
                )}
                {isUploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center">Uploading...</div>}
            </div>
        </div>
    );
}
