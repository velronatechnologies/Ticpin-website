'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft, Plus, Trash2, MapPin,
    Clock, Image as ImageIcon,
    HelpCircle, FileText, Info, Coffee,
    CheckCircle2, Upload
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';
import { diningApi } from '@/lib/api';

const MAJOR_CITIES = [
    'Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad',
    'Kolkata', 'Pune', 'Ahmedabad', 'Coimbatore', 'Madurai', 'Trichy'
];

function AdminEditDiningForm() {
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
        const response = await diningApi.getById(id as string);
        if (response.success && response.data) {
            const data = response.data;
            // Ensure necessary arrays exist
            if (!data.images.gallery) data.images.gallery = ['', '', ''];
            if (!data.menu_images) data.menu_images = ['', ''];
            if (!data.offers) data.offers = [];
            if (!data.facilities) data.facilities = [];
            if (!data.seating_types) data.seating_types = [];
            if (!data.faqs) data.faqs = [];
            if (!data.terms_and_conditions) data.terms_and_conditions = [];

            setFormData(data);
        } else {
            addToast('Failed to fetch outlet details', 'error');
            router.push('/admin/edit-dining');
        }
        setLoading(false);
    };

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
                if (target === 'hero') setFormData((prev: any) => ({ ...prev, images: { ...prev.images, hero: data.data.url } }));
                else if (target === 'gallery' && index !== undefined) {
                    const newGallery = [...formData.images.gallery];
                    newGallery[index] = data.data.url;
                    setFormData((prev: any) => ({ ...prev, images: { ...prev.images, gallery: newGallery } }));
                } else if (target === 'menu' && index !== undefined) {
                    const newMenu = [...formData.menu_images];
                    newMenu[index] = data.data.url;
                    setFormData((prev: any) => ({ ...prev, menu_images: newMenu }));
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
            const response = await diningApi.adminUpdate(id as string, formData);
            if (response.success) {
                addToast('Dining outlet updated successfully!', 'success');
                router.push('/admin/edit-dining');
            } else {
                addToast(response.message || 'Error updating outlet', 'error');
            }
        } catch (err) { addToast('Error updating outlet', 'error'); }
        finally { setSaving(false); }
    };

    const addFaq = () => setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] });
    const removeFaq = (index: number) => setFormData({ ...formData, faqs: formData.faqs.filter((_: any, i: number) => i !== index) });
    const addTerm = () => setFormData({ ...formData, terms_and_conditions: [...formData.terms_and_conditions, ''] });
    const removeTerm = (index: number) => setFormData({ ...formData, terms_and_conditions: formData.terms_and_conditions.filter((_: any, i: number) => i !== index) });
    const addOffer = () => setFormData({ ...formData, offers: [...formData.offers, { title: '', code: '', description: '' }] });
    const removeOffer = (index: number) => setFormData({ ...formData, offers: formData.offers.filter((_: any, i: number) => i !== index) });

    if (loading) {
        return <div className="min-h-screen bg-[#FBFBFF] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>;
    }

    if (!formData) return null;

    return (
        <div className="min-h-screen bg-[#FBFBFF] font-[family-name:var(--font-anek-latin)]">
            <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/edit-dining')} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900">Edit Dining Outlet</h1>
                        <p className="text-sm text-amber-600 font-medium">{formData.name}</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-amber-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-amber-700 hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    {saving ? 'Updating...' : 'Save Changes'}
                    <CheckCircle2 size={18} />
                </button>
            </header>

            <div className="max-w-[1000px] mx-auto py-12 px-6 space-y-12">
                {/* Outlet Information */}
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

                {/* Contact & Location */}
                <Section icon={<MapPin size={20} />} title="Contact & Location">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Public Phone" value={formData.contact?.phone} onChange={v => setFormData({ ...formData, contact: { ...formData.contact, phone: v } })} />
                        <InputField label="Public Email" value={formData.contact?.email} onChange={v => setFormData({ ...formData, contact: { ...formData.contact, email: v } })} />
                        <InputField label="Location Name" value={formData.location?.venue_name} onChange={v => setFormData({ ...formData, location: { ...formData.location, venue_name: v } })} />
                        <InputField label="Address" value={formData.location?.address} onChange={v => setFormData({ ...formData, location: { ...formData.location, address: v } })} />
                        <div className="space-y-2">
                            <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider">City *</label>
                            <select
                                value={formData.location?.city}
                                onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                className="w-full h-14 px-5 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium outline-none focus:border-black transition-all"
                            >
                                <option value="">Select City</option>
                                {MAJOR_CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <InputField label="State" value={formData.location?.state} onChange={v => setFormData({ ...formData, location: { ...formData.location, state: v } })} />
                        <InputField label="Map URL" value={formData.location?.map_url} onChange={v => setFormData({ ...formData, location: { ...formData.location, map_url: v } })} />
                    </div>
                </Section>

                {/* Timing */}
                <Section icon={<Clock size={20} />} title="Timing & Rating">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Opening Time" type="time" value={formData.opening_time} onChange={v => setFormData({ ...formData, opening_time: v })} />
                        <InputField label="Closing Time" type="time" value={formData.closing_time} onChange={v => setFormData({ ...formData, closing_time: v })} />
                        <InputField label="Rating" type="number" value={formData.rating} onChange={v => setFormData({ ...formData, rating: Number(v) })} />
                    </div>
                </Section>

                {/* Seating & Tables */}
                <Section icon={<Plus size={20} />} title="Seating & Tables">
                    <div className="space-y-6">
                        {formData.seating_types?.map((st: any, i: number) => (
                            <div key={i} className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                                <InputField label="Type" value={st.type} onChange={v => {
                                    const types = [...formData.seating_types]; types[i].type = v; setFormData({ ...formData, seating_types: types });
                                }} placeholder="eg. Indoor" />
                                <InputField label="Total Tables" type="number" value={st.total_tables} onChange={v => {
                                    const types = [...formData.seating_types]; types[i].total_tables = Number(v); setFormData({ ...formData, seating_types: types });
                                }} />
                                <InputField label="Available" type="number" value={st.available_tables} onChange={v => {
                                    const types = [...formData.seating_types]; types[i].available_tables = Number(v); setFormData({ ...formData, seating_types: types });
                                }} />
                                <InputField label="Capacity/Table" type="number" value={st.capacity_per_table} onChange={v => {
                                    const types = [...formData.seating_types]; types[i].capacity_per_table = Number(v); setFormData({ ...formData, seating_types: types });
                                }} />
                                {i > 0 && (
                                    <button onClick={() => setFormData({ ...formData, seating_types: formData.seating_types.filter((_: any, idx: number) => idx !== i) })} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-zinc-200 text-red-500 rounded-full flex items-center justify-center shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={() => setFormData({ ...formData, seating_types: [...(formData.seating_types || []), { type: '', total_tables: 10, available_tables: 10, capacity_per_table: 4 }] })} className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 font-bold hover:text-black hover:border-black transition-all">
                            + Add Seating Type
                        </button>
                    </div>
                </Section>

                {/* Offers */}
                <Section icon={<Info size={20} />} title="Offers">
                    <div className="space-y-6">
                        {formData.offers?.map((offer: any, i: number) => (
                            <div key={i} className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                                <InputField label="Title" value={offer.title} onChange={v => {
                                    const o = [...formData.offers]; o[i].title = v; setFormData({ ...formData, offers: o });
                                }} placeholder="eg. 20% Off" />
                                <InputField label="Code" value={offer.code} onChange={v => {
                                    const o = [...formData.offers]; o[i].code = v; setFormData({ ...formData, offers: o });
                                }} placeholder="FLAT20" />
                                <InputField label="Description" value={offer.description} onChange={v => {
                                    const o = [...formData.offers]; o[i].description = v; setFormData({ ...formData, offers: o });
                                }} placeholder="Min order 500" />
                                {i > 0 && (
                                    <button onClick={() => removeOffer(i)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-zinc-200 text-red-500 rounded-full flex items-center justify-center shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={addOffer} className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 font-bold hover:text-black hover:border-black transition-all">
                            + Add Offer
                        </button>
                    </div>
                </Section>

                {/* Facilities */}
                <Section icon={<FileText size={20} />} title="Facilities">
                    <div className="space-y-4">
                        {formData.facilities?.map((facility: string, i: number) => (
                            <div key={i} className="flex gap-4 items-center">
                                <input value={facility} onChange={e => { const f = [...formData.facilities]; f[i] = e.target.value; setFormData({ ...formData, facilities: f }); }} placeholder="Facility..." className="flex-1 h-12 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none" />
                                <button onClick={() => setFormData({ ...formData, facilities: formData.facilities.filter((_: any, idx: number) => idx !== i) })} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"><Trash2 size={20} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setFormData({ ...formData, facilities: [...(formData.facilities || []), ''] })} className="text-black font-bold flex items-center gap-2 text-sm"><Plus size={16} /> Add Facility</button>
                    </div>
                </Section>

                {/* Gallery */}
                <Section icon={<ImageIcon size={20} />} title="Menu & Atmosphere">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUploadBox label="Hero Image" value={formData.images?.hero} onUpload={e => handleFileUpload(e, 'hero')} isUploading={uploading === 'hero'} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {formData.images?.gallery.map((img: string, i: number) => (
                            <ImageUploadBox key={i} label={`Gallery ${i + 1}`} value={img} onUpload={e => handleFileUpload(e, 'gallery', i)} isUploading={uploading === `gallery${i}`} />
                        ))}
                    </div>
                    <h4 className="text-sm font-bold text-zinc-500 mt-8 mb-4">Menu Images</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formData.menu_images?.map((img: string, i: number) => (
                            <ImageUploadBox key={i} label={`Menu ${i + 1}`} value={img} onUpload={e => handleFileUpload(e, 'menu', i)} isUploading={uploading === `menu${i}`} />
                        ))}
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

export default function AdminEditDiningPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FBFBFF] flex items-center justify-center">Loading...</div>}>
            <AdminEditDiningForm />
        </Suspense>
    );
}

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        <section className="bg-white border border-zinc-200 shadow-sm rounded-[32px] overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
                <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">{icon}</div>
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
            <div className="relative group aspect-video rounded-3xl border-2 border-dashed border-zinc-200 overflow-hidden flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-all">
                {value ? (
                    <>
                        <img src={value} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white text-zinc-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                                <Upload size={16} /> Change Image
                                <input type="file" className="hidden" onChange={onUpload} accept="image/*" disabled={isUploading} />
                            </label>
                        </div>
                    </>
                ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-6">
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-400 border-t-transparent" />
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md mb-3 text-zinc-400">
                                    <Upload size={24} />
                                </div>
                                <span className="text-sm font-bold text-zinc-500">Click to upload</span>
                                <span className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">Max 5MB</span>
                            </>
                        )}
                        <input type="file" className="hidden" onChange={onUpload} accept="image/*" disabled={isUploading} />
                    </label>
                )}
                {isUploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-600 border-t-transparent" />
                    </div>
                )}
            </div>
        </div>
    );
}
