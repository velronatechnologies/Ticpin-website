'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, Plus, Trash2, MapPin, Calendar,
    Clock, Image as ImageIcon, Users, Ticket,
    HelpCircle, FileText, Info,
    CheckCircle2, Upload
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';

function AdminCreateEventForm() {
    const { token } = useStore();
    const { addToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'Music',
        language: 'English',
        duration_minutes: 120,
        age_limit: 'All ages',
        description: '',
        short_description: '',
        start_datetime: '',
        end_datetime: '',
        price_start: 0,
        status: 'active',
        venue: {
            name: '',
            address: '',
            city: '',
            state: '',
            latitude: 0,
            longitude: 0,
            map_url: ''
        },
        images: {
            hero: '',
            poster: '',
            gallery: ['', '', ''] as string[]
        },
        artists: [{ name: '', role: '', image_url: '', description: '' }],
        tickets: [{ ticket_type: 'General', seat_type: 'standing', price: 0, total_quantity: 100, available_quantity: 100 }],
        faqs: [{ question: '', answer: '' }],
        terms_and_conditions: ['']
    });

    // Auto-generate slug from title
    useEffect(() => {
        if (formData.title && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: prev.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            }));
        }
    }, [formData.title]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: string, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            addToast('File is too large. Please upload an image less than 5MB.', 'error');
            return;
        }

        setUploading(target + (index !== undefined ? index : ''));
        const form = new FormData();
        form.append('file', file);
        form.append('folder', 'events');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: form
            });

            if (response.status === 413) {
                addToast('File is too large for the server.', 'error');
                return;
            }

            const data = await response.json();
            if (data.status === 200 && data.data.url) {
                if (target === 'hero') setFormData(prev => ({ ...prev, images: { ...prev.images, hero: data.data.url } }));
                else if (target === 'poster') setFormData(prev => ({ ...prev, images: { ...prev.images, poster: data.data.url } }));
                else if (target === 'gallery' && index !== undefined) {
                    const newGallery = [...formData.images.gallery];
                    newGallery[index] = data.data.url;
                    setFormData(prev => ({ ...prev, images: { ...prev.images, gallery: newGallery } }));
                } else if (target === 'artist' && index !== undefined) {
                    const newArtists = [...formData.artists];
                    newArtists[index].image_url = data.data.url;
                    setFormData(prev => ({ ...prev, artists: newArtists }));
                }
                addToast('Image uploaded successfully', 'success');
            } else {
                addToast(data.message || 'Upload failed', 'error');
            }
        } catch (error) { addToast('Upload error', 'error'); }
        finally { setUploading(null); }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/admin/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ...formData,
                    start_datetime: new Date(formData.start_datetime).toISOString(),
                    end_datetime: new Date(formData.end_datetime).toISOString(),
                })
            });
            if (response.ok) {
                addToast('Event created (Admin)!', 'success');
                router.push('/admin');
            } else {
                const data = await response.json();
                addToast(data.message || 'Error creating event', 'error');
            }
        } catch (error) { addToast('An error occurred', 'error'); }
        finally { setLoading(false); }
    };

    const addArtist = () => setFormData({ ...formData, artists: [...formData.artists, { name: '', role: '', image_url: '', description: '' }] });
    const removeArtist = (index: number) => setFormData({ ...formData, artists: formData.artists.filter((_, i) => i !== index) });
    const addTicket = () => setFormData({ ...formData, tickets: [...formData.tickets, { ticket_type: '', seat_type: 'standing', price: 0, total_quantity: 0, available_quantity: 0 }] });
    const removeTicket = (index: number) => setFormData({ ...formData, tickets: formData.tickets.filter((_, i) => i !== index) });
    const addFaq = () => setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] });
    const removeFaq = (index: number) => setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== index) });
    const addTerm = () => setFormData({ ...formData, terms_and_conditions: [...formData.terms_and_conditions, ''] });
    const removeTerm = (index: number) => setFormData({ ...formData, terms_and_conditions: formData.terms_and_conditions.filter((_, i) => i !== index) });

    const handleAutoFill = () => {
        const randomID = Math.floor(1000 + Math.random() * 9000);
        const now = new Date();
        const start = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

        setFormData({
            title: `Sunburn Festival Goa ${randomID}`,
            slug: `sunburn-goa-${randomID}`,
            category: 'Music',
            language: 'English & Hindi',
            duration_minutes: 240,
            age_limit: '18+ only',
            description: 'Sunburn is a commercial EDM Festival held in India. Asia\'s largest music festival.',
            short_description: 'Asia\'s largest EDM music festival is back!',
            start_datetime: start.toISOString().slice(0, 16),
            end_datetime: end.toISOString().slice(0, 16),
            price_start: 1999,
            status: 'active',
            venue: {
                name: 'Vagator Beach Grounds',
                address: 'Vagator, North Goa',
                city: 'Goa',
                state: 'Goa',
                latitude: 15.603,
                longitude: 73.7336,
                map_url: 'https://maps.app.goo.gl/vagator'
            },
            images: { hero: '', poster: '', gallery: ['', '', ''] },
            artists: [
                { name: 'Martin Garrix', role: 'Main Headliner', image_url: '', description: 'World #1 DJ 4 times.' },
                { name: 'DJ Snake', role: 'Special Guest', image_url: '', description: 'Pardon my French.' }
            ],
            tickets: [
                { ticket_type: 'General Access', seat_type: 'standing', price: 1999, total_quantity: 1000, available_quantity: 1000 },
                { ticket_type: 'VIP Lounge', seat_type: 'seating', price: 4999, total_quantity: 200, available_quantity: 200 },
                { ticket_type: 'Fan Pit', seat_type: 'standing', price: 7999, total_quantity: 50, available_quantity: 50 }
            ],
            faqs: [
                { question: 'Is alcohol allowed?', answer: 'No outside alcohol. Available at venue for 21+ only.' },
                { question: 'Is there an age limit?', answer: 'Yes, strictly 18+.' }
            ],
            terms_and_conditions: ['Tickets are non-refundable.', 'Valid ID proof is mandatory.', 'Zero tolerance for drugs.']
        });
        addToast('Form auto-filled with test data!', 'success');
    };

    return (
        <div className="min-h-screen bg-[#FBFBFF] font-[family-name:var(--font-anek-latin)]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900">Admin: Create Event</h1>
                        <p className="text-sm text-purple-600 font-medium">Auto-approved &bull; No organizer check</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={handleAutoFill} className="px-6 py-2.5 bg-zinc-100 text-zinc-900 font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                        <Plus className="rotate-45" size={18} />
                        Auto Fill (Test)
                    </button>
                    <button onClick={() => router.push('/admin')} className="px-6 py-2.5 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl transition-all">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="bg-[#5331EA] text-white px-8 py-2.5 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2">
                        {loading ? 'Publishing...' : 'Publish Event'}
                        <CheckCircle2 size={18} />
                    </button>
                </div>
            </header>

            <div className="max-w-[1000px] mx-auto py-12 px-6">
                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Basic Information */}
                    <Section icon={<FileText size={20} />} title="Basic Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField label="Event Title" value={formData.title} onChange={v => setFormData({ ...formData, title: v })} placeholder="eg. AR Rahman Live Concert" required />
                            <InputField label="Slug (URL)" value={formData.slug} onChange={v => setFormData({ ...formData, slug: v })} placeholder="ar-rahman-live" required />

                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full h-14 px-5 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium focus:outline-none focus:border-[#5331EA] focus:ring-4 focus:ring-[#5331EA]/5 transition-all outline-none"
                                >
                                    {['Music', 'Comedy', 'Theatre', 'Workshops', 'Sports', 'Food', 'Spirituality'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <InputField label="Language" value={formData.language} onChange={v => setFormData({ ...formData, language: v })} placeholder="eg. Tamil & English" />
                            <InputField label="Duration (Minutes)" type="number" value={formData.duration_minutes} onChange={v => setFormData({ ...formData, duration_minutes: Number(v) })} />
                            <InputField label="Age Limit" value={formData.age_limit} onChange={v => setFormData({ ...formData, age_limit: v })} placeholder="eg. 5+ years" />
                        </div>
                        <div className="mt-8 space-y-4">
                            <InputField label="Short Description" value={formData.short_description} onChange={v => setFormData({ ...formData, short_description: v })} placeholder="One line catchphrase..." />
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider">Full Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-40 p-5 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium focus:outline-none focus:border-[#5331EA] focus:ring-4 focus:ring-[#5331EA]/5 transition-all outline-none resize-none"
                                    placeholder="Tell participants what to expect..."
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Schedule & Timing */}
                    <Section icon={<Calendar size={20} />} title="Schedule & Timing">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField label="Start Date & Time" type="datetime-local" value={formData.start_datetime} onChange={v => setFormData({ ...formData, start_datetime: v })} required />
                            <InputField label="End Date & Time" type="datetime-local" value={formData.end_datetime} onChange={v => setFormData({ ...formData, end_datetime: v })} required />
                        </div>
                    </Section>

                    {/* Venue Details */}
                    <Section icon={<MapPin size={20} />} title="Venue Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField label="Venue Name" value={formData.venue.name} onChange={v => setFormData({ ...formData, venue: { ...formData.venue, name: v } })} placeholder="eg. Nehru Indoor Stadium" required />
                            <InputField label="Full Address" value={formData.venue.address} onChange={v => setFormData({ ...formData, venue: { ...formData.venue, address: v } })} placeholder="Full location string" required />
                            <InputField label="City" value={formData.venue.city} onChange={v => setFormData({ ...formData, venue: { ...formData.venue, city: v } })} placeholder="eg. Chennai" required />
                            <InputField label="Map Link" value={formData.venue.map_url} onChange={v => setFormData({ ...formData, venue: { ...formData.venue, map_url: v } })} placeholder="Google Maps URL" />
                        </div>
                    </Section>

                    {/* Event Creatives */}
                    <Section icon={<ImageIcon size={20} />} title="Event Creatives">
                        <p className="text-zinc-500 text-sm mb-6 -mt-4">Upload high-quality images to attract more attendees.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ImageUploadBox label="Hero Image (Wide)" value={formData.images.hero} onUpload={e => handleFileUpload(e, 'hero')} isUploading={uploading === 'hero'} />
                            <ImageUploadBox label="Poster Image (Portrait)" value={formData.images.poster} onUpload={e => handleFileUpload(e, 'poster')} isUploading={uploading === 'poster'} />
                        </div>
                        <div className="mt-8">
                            <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider mb-4 block">Gallery Images (3 Slots)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {formData.images.gallery.map((img, i) => (
                                    <ImageUploadBox key={i} value={img} onUpload={e => handleFileUpload(e, 'gallery', i)} isUploading={uploading === `gallery${i}`} />
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* Ticket Inventory */}
                    <Section icon={<Ticket size={20} />} title="Ticket Inventory">
                        <div className="space-y-6">
                            {formData.tickets.map((ticket, i) => (
                                <div key={i} className="bg-zinc-50 border border-zinc-200 p-6 rounded-3xl relative">
                                    <button type="button" onClick={() => removeTicket(i)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-zinc-200 text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <InputField label="Plan Name" value={ticket.ticket_type} onChange={v => {
                                            const t = [...formData.tickets]; t[i].ticket_type = v; setFormData({ ...formData, tickets: t });
                                        }} placeholder="eg. VIP Seating" />

                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-[#686868] uppercase tracking-wider">Seat Type</label>
                                            <select
                                                value={ticket.seat_type}
                                                onChange={e => {
                                                    const t = [...formData.tickets]; t[i].seat_type = e.target.value; setFormData({ ...formData, tickets: t });
                                                }}
                                                className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none"
                                            >
                                                <option value="standing">Standing</option>
                                                <option value="seating">Seating</option>
                                            </select>
                                        </div>

                                        <InputField label="Price (₹)" type="number" value={ticket.price} onChange={v => {
                                            const t = [...formData.tickets]; t[i].price = Number(v); setFormData({ ...formData, tickets: t });
                                        }} />

                                        <InputField label="Total Qty" type="number" value={ticket.total_quantity} onChange={v => {
                                            const t = [...formData.tickets]; t[i].total_quantity = Number(v); t[i].available_quantity = Number(v); setFormData({ ...formData, tickets: t });
                                        }} />
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addTicket} className="w-full py-6 border-2 border-dashed border-zinc-200 rounded-3xl text-zinc-400 font-bold hover:border-[#5331EA] hover:text-[#5331EA] transition-all flex items-center justify-center gap-2">
                                <Plus size={20} /> Add Another Ticket Type
                            </button>
                        </div>
                    </Section>

                    {/* Performing Artists */}
                    <Section icon={<Users size={20} />} title="Performing Artists">
                        <div className="space-y-6">
                            {formData.artists.map((artist, i) => (
                                <div key={i} className="bg-zinc-50 border border-zinc-200 p-6 rounded-3xl relative group">
                                    <button type="button" onClick={() => removeArtist(i)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-zinc-200 text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="w-32 h-32 shrink-0">
                                            <ImageUploadBox value={artist.image_url} onUpload={e => handleFileUpload(e, 'artist', i)} isUploading={uploading === `artist${i}`} />
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputField label="Artist Name" value={artist.name} onChange={v => {
                                                const a = [...formData.artists]; a[i].name = v; setFormData({ ...formData, artists: a });
                                            }} />
                                            <InputField label="Role" value={artist.role} onChange={v => {
                                                const a = [...formData.artists]; a[i].role = v; setFormData({ ...formData, artists: a });
                                            }} placeholder="Singer / DJ / Speaker" />
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[12px] font-bold text-[#686868] uppercase tracking-wider">Artist Bio</label>
                                                <textarea
                                                    value={artist.description}
                                                    onChange={e => {
                                                        const a = [...formData.artists]; a[i].description = e.target.value; setFormData({ ...formData, artists: a });
                                                    }}
                                                    className="w-full h-24 p-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addArtist} className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 font-bold hover:border-[#5331EA] hover:text-[#5331EA] transition-all flex items-center justify-center gap-2">
                                <Plus size={18} /> Add Artist
                            </button>
                        </div>
                    </Section>

                    {/* FAQs */}
                    <Section icon={<HelpCircle size={20} />} title="FAQs">
                        <div className="space-y-4">
                            {formData.faqs.map((faq, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="flex-1 space-y-4">
                                        <input value={faq.question} onChange={e => { const f = [...formData.faqs]; f[i].question = e.target.value; setFormData({ ...formData, faqs: f }); }} placeholder="Question" className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none" />
                                        <input value={faq.answer} onChange={e => { const f = [...formData.faqs]; f[i].answer = e.target.value; setFormData({ ...formData, faqs: f }); }} placeholder="Answer" className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none" />
                                    </div>
                                    <button type="button" onClick={() => removeFaq(i)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"><Trash2 size={20} /></button>
                                </div>
                            ))}
                            <button type="button" onClick={addFaq} className="text-[#5331EA] font-bold flex items-center gap-2 text-sm"><Plus size={16} /> Add FAQ</button>
                        </div>
                    </Section>

                    {/* Terms & Conditions */}
                    <Section icon={<Info size={20} />} title="Terms & Conditions">
                        <div className="space-y-4">
                            {formData.terms_and_conditions.map((term, i) => (
                                <div key={i} className="flex gap-4 items-center">
                                    <input value={term} onChange={e => { const t = [...formData.terms_and_conditions]; t[i] = e.target.value; setFormData({ ...formData, terms_and_conditions: t }); }} placeholder="Term..." className="flex-1 h-12 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none" />
                                    <button type="button" onClick={() => removeTerm(i)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"><Trash2 size={20} /></button>
                                </div>
                            ))}
                            <button type="button" onClick={addTerm} className="text-[#5331EA] font-bold flex items-center gap-2 text-sm"><Plus size={16} /> Add Term</button>
                        </div>
                    </Section>

                    {/* Submit Actions */}
                    <div className="pt-12 border-t flex flex-col items-center space-y-4">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full max-w-md h-16 bg-black text-white text-xl font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Publish Event Now'}
                        </button>
                        <p className="text-zinc-400 text-sm">Admin created events are auto-approved.</p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminCreateEventPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FBFBFF] flex items-center justify-center">Loading...</div>}>
            <AdminCreateEventForm />
        </Suspense>
    );
}

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        <section className="bg-white border border-zinc-200 shadow-sm rounded-[32px] overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
                <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-[#5331EA] shadow-sm">{icon}</div>
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">{title}</h3>
            </div>
            <div className="p-8">{children}</div>
        </section>
    );
}

function InputField({ label, value, onChange, type = "text", placeholder = "", required = false }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <input
                required={required}
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full h-14 px-5 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium focus:outline-none focus:border-[#5331EA] focus:ring-4 focus:ring-[#5331EA]/5 transition-all outline-none placeholder:text-zinc-300"
                placeholder={placeholder}
            />
        </div>
    );
}

function ImageUploadBox({ label, value, onUpload, isUploading }: { label?: string; value: string; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; isUploading: boolean }) {
    return (
        <div className="space-y-2 h-full">
            {label && <label className="text-[12px] font-bold text-[#686868] uppercase tracking-wider">{label}</label>}
            <div className="relative group aspect-video rounded-3xl border-2 border-dashed border-zinc-200 overflow-hidden flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-all">
                {value ? (
                    <>
                        <img src={value} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <label className="cursor-pointer bg-white text-black p-3 rounded-full hover:scale-110 transition-transform shadow-lg">
                                <Upload size={20} />
                                <input type="file" className="hidden" onChange={onUpload} accept="image/*" />
                            </label>
                        </div>
                    </>
                ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-6 text-center">
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#5331EA] border-t-transparent" />
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md mb-3 text-zinc-400">
                                    <Upload size={24} />
                                </div>
                                <p className="text-sm font-bold text-zinc-500">Click to upload</p>
                                <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">Max 5MB</p>
                            </>
                        )}
                        <input type="file" className="hidden" onChange={onUpload} accept="image/*" disabled={isUploading} />
                    </label>
                )}
            </div>
        </div>
    );
}
