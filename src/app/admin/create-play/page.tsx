'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, Plus, Trash2, MapPin,
    Clock, Image as ImageIcon,
    HelpCircle, FileText, Info,
    CheckCircle2, Upload
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';

const MAJOR_CITIES = [
    'Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad',
    'Kolkata', 'Pune', 'Ahmedabad', 'Coimbatore', 'Madurai', 'Trichy'
];

function AdminCreatePlayVenueForm() {
    const { token } = useStore();
    const { addToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        status: 'active',
        about: '',
        short_about: '',
        duration_per_slot_minutes: 60,
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
            promo: '',
            gallery: ['', '', ''] as string[]
        },
        play_options: [{ sport: '', court_type: '', surface: '', price_per_slot: 0 }],
        slot_settings: {
            slot_duration_minutes: 60,
            open_time: '06:00',
            close_time: '23:00',
            max_days_advance_booking: 7,
            total_courts: 1
        },
        faqs: [{ question: '', answer: '' }],
        terms_and_conditions: ['']
    });

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
                if (target === 'hero') setFormData(prev => ({ ...prev, images: { ...prev.images, hero: data.data.url } }));
                else if (target === 'promo') setFormData(prev => ({ ...prev, images: { ...prev.images, promo: data.data.url } }));
                else if (target === 'gallery' && index !== undefined) {
                    const newGallery = [...formData.images.gallery];
                    newGallery[index] = data.data.url;
                    setFormData(prev => ({ ...prev, images: { ...prev.images, gallery: newGallery } }));
                }
                addToast('Image uploaded', 'success');
            }
        } catch (err) { addToast('Upload failed', 'error'); }
        finally { setUploading(null); }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        try {
            // Clean up sport sentinel + validate
            const cleanOptions = formData.play_options.map((opt: any) => ({ ...opt, sport: opt.sport === '_other_' ? '' : opt.sport }));
            if (cleanOptions.some((opt: any) => !opt.sport)) {
                addToast('Please enter a sport name for all play options', 'error');
                setLoading(false);
                return;
            }
            const submitData = { ...formData, play_options: cleanOptions };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/admin/play`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(submitData)
            });
            if (response.ok) {
                addToast('Play venue created (Admin)!', 'success');
                router.push('/admin');
            } else {
                const data = await response.json();
                addToast(data.message || 'Error creating venue', 'error');
            }
        } catch (err) { addToast('Error creating venue', 'error'); }
        finally { setLoading(false); }
    };

    const addFaq = () => setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] });
    const removeFaq = (index: number) => setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== index) });
    const addTerm = () => setFormData({ ...formData, terms_and_conditions: [...formData.terms_and_conditions, ''] });
    const removeTerm = (index: number) => setFormData({ ...formData, terms_and_conditions: formData.terms_and_conditions.filter((_, i) => i !== index) });

    const handleAutoFill = () => {
        const randomID = Math.floor(1000 + Math.random() * 9000);
        setFormData({
            name: `Turf Arena Chennai ${randomID}`,
            slug: `turf-arena-chennai-${randomID}`,
            status: 'active',
            about: 'Premium sports complex featuring world-class artificial turf grounds, floodlit courts, and professional-grade facilities. Perfect for weekend matches, corporate tournaments, and casual games. We offer football, cricket, and badminton across multiple courts with excellent amenities.',
            short_about: 'Premium multi-sport turf arena with floodlit courts',
            duration_per_slot_minutes: 60,
            location: {
                venue_name: 'Turf Arena Sports Complex',
                address: '45, OMR Road, Thoraipakkam',
                city: 'Chennai',
                state: 'Tamil Nadu',
                latitude: 12.9352,
                longitude: 80.2330,
                map_url: 'https://maps.app.goo.gl/turfArenaChennai'
            },
            images: {
                hero: '',
                promo: '',
                gallery: ['', '', '']
            },
            play_options: [
                { sport: 'Football', court_type: '5v5', surface: 'Artificial Grass', price_per_slot: 1500 },
                { sport: 'Football', court_type: '7v7', surface: 'Artificial Grass', price_per_slot: 2500 },
                { sport: 'Cricket', court_type: 'Net Practice', surface: 'Synthetic Mat', price_per_slot: 800 },
                { sport: 'Badminton', court_type: 'Indoor Court', surface: 'Wooden', price_per_slot: 600 }
            ],
            slot_settings: {
                slot_duration_minutes: 60,
                open_time: '06:00',
                close_time: '23:00',
                max_days_advance_booking: 7,
                total_courts: 1
            },
            faqs: [
                { question: 'Is parking available?', answer: 'Yes, free parking for up to 30 vehicles.' },
                { question: 'Do you provide sports equipment?', answer: 'Footballs are provided free. Cricket bats available for rent at \u20b9100/session.' }
            ],
            terms_and_conditions: [
                'Shoes with metal studs are not allowed on artificial turf.',
                'Cancellations must be made at least 4 hours before the slot.',
                'No refund for no-shows.'
            ]
        });
        addToast('Form auto-filled with test data!', 'success');
    };

    return (
        <div className="min-h-screen bg-[#FBFBFF] font-[family-name:var(--font-anek-latin)]">
            <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900">Admin: Create Play Venue</h1>
                        <p className="text-sm text-emerald-600 font-medium">Auto-approved &bull; No organizer check</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={handleAutoFill} className="px-6 py-2.5 bg-zinc-100 text-zinc-900 font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                        <Plus className="rotate-45" size={18} />
                        Auto Fill (Test)
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-black text-white px-8 py-2.5 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Publish Venue'}
                        <CheckCircle2 size={18} />
                    </button>
                </div>
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
                        {formData.play_options.map((opt, i) => (
                            <div key={i} className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider">Sport *</label>
                                    <select
                                        value={['Cricket','Football','Pickleball','Tennis','Badminton','Table Tennis','Basketball'].includes(opt.sport) ? opt.sport : opt.sport === '' ? '' : '_other_'}
                                        onChange={e => {
                                            const opts = [...formData.play_options];
                                            (opts[i] as any).sport = e.target.value === '_other_' ? '_other_' : e.target.value;
                                            setFormData({ ...formData, play_options: opts });
                                        }}
                                        className="w-full h-14 px-5 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium outline-none focus:border-black transition-all"
                                    >
                                        <option value="">Select Sport</option>
                                        {['Cricket', 'Football', 'Pickleball', 'Tennis', 'Badminton', 'Table Tennis', 'Basketball'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                        <option value="_other_">Other (specify below)</option>
                                    </select>
                                    {(opt.sport === '_other_' || (opt.sport !== '' && !['Cricket','Football','Pickleball','Tennis','Badminton','Table Tennis','Basketball'].includes(opt.sport))) && (
                                        <input
                                            type="text"
                                            placeholder="Enter sport name (e.g. Volleyball, Kabaddi)"
                                            value={opt.sport === '_other_' ? '' : opt.sport}
                                            onChange={e => {
                                                const opts = [...formData.play_options];
                                                opts[i].sport = e.target.value;
                                                setFormData({ ...formData, play_options: opts });
                                            }}
                                            className="w-full h-14 px-5 mt-2 bg-white border border-zinc-200 rounded-2xl text-[16px] font-medium outline-none focus:border-black transition-all"
                                        />
                                    )}
                                </div>
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
                                    <button onClick={() => setFormData({ ...formData, play_options: formData.play_options.filter((_, idx) => idx !== i) })} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-zinc-200 text-red-500 rounded-full flex items-center justify-center shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={() => setFormData({ ...formData, play_options: [...formData.play_options, { sport: '', court_type: '', surface: '', price_per_slot: 0 }] })} className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 font-bold hover:text-black hover:border-black transition-all">
                            + Add Sport Option
                        </button>
                    </div>
                </Section>

                {/* Slot Settings */}
                <Section icon={<Clock size={20} />} title="Slot Settings">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Opening Time" type="time" value={formData.slot_settings.open_time} onChange={v => setFormData({ ...formData, slot_settings: { ...formData.slot_settings, open_time: v } })} />
                        <InputField label="Closing Time" type="time" value={formData.slot_settings.close_time} onChange={v => setFormData({ ...formData, slot_settings: { ...formData.slot_settings, close_time: v } })} />
                        <InputField label="Total Courts / Lanes" type="number" value={String(formData.slot_settings.total_courts ?? 1)} onChange={v => setFormData({ ...formData, slot_settings: { ...formData.slot_settings, total_courts: Math.max(1, parseInt(v) || 1) } })} placeholder="e.g. 3" />
                    </div>
                </Section>

                <Section icon={<ImageIcon size={20} />} title="Gallery">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUploadBox label="Hero Image" value={formData.images.hero} onUpload={e => handleFileUpload(e, 'hero')} isUploading={uploading === 'hero'} />
                        <ImageUploadBox label="Promo Image" value={formData.images.promo} onUpload={e => handleFileUpload(e, 'promo')} isUploading={uploading === 'promo'} />
                        <div className="md:col-span-2 space-y-4">
                            <label className="text-[14px] font-bold text-[#686868] uppercase tracking-wider block">Gallery Images (3 Slots)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {formData.images.gallery.map((img, i) => (
                                    <ImageUploadBox key={i} value={img} onUpload={e => handleFileUpload(e, 'gallery', i)} isUploading={uploading === `gallery${i}`} />
                                ))}
                            </div>
                        </div>
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
                                <button onClick={() => removeFaq(i)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"><Trash2 size={20} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addFaq} className="text-black font-bold flex items-center gap-2 text-sm"><Plus size={16} /> Add FAQ</button>
                    </div>
                </Section>

                {/* Terms & Conditions */}
                <Section icon={<Info size={20} />} title="Terms & Conditions">
                    <div className="space-y-4">
                        {formData.terms_and_conditions.map((term, i) => (
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

export default function AdminCreatePlayPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FBFBFF] flex items-center justify-center">Loading...</div>}>
            <AdminCreatePlayVenueForm />
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
