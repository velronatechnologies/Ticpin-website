'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, MapPin, Calendar, Clock, Image as ImageIcon, Users, Ticket, HelpCircle, FileText } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface EventFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function EventForm({ onClose, onSuccess }: EventFormProps) {
    const { token } = useStore();
    const [loading, setLoading] = useState(false);

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
        status: 'pending',
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
            gallery: [] as string[]
        },
        artists: [{
            name: '', role: '', image_url: '', description: '',
            genre: '', is_verified: false, rating: 4.8, review_count: 0,
            events_hosted: 0, location: '', contact_email: '', contact_phone: '',
            experience_years: 0, specialties: [] as string[], follower_count: 0,
            social_links: ['']
        }],
        tickets: [{ ticket_type: 'General', seat_type: 'standing', price: 0, total_quantity: 100, available_quantity: 100 }],
        faqs: [{ question: '', answer: '' }],
        terms_and_conditions: ['']
    });

    const [expandedArtists, setExpandedArtists] = useState<number[]>([]);

    const toggleArtistExpansion = (index: number) => {
        setExpandedArtists(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/v1/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    start_datetime: new Date(formData.start_datetime).toISOString(),
                    end_datetime: new Date(formData.end_datetime).toISOString(),
                    artists: formData.artists.map(a => ({
                        ...a,
                        specialties: typeof a.specialties === 'string' ? (a.specialties as string).split(',').map(s => s.trim()) : a.specialties,
                        social_links: a.social_links.filter(link => link.trim() !== '')
                    }))
                })
            });
            if (response.ok) {
                onSuccess();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const addArtist = () => setFormData({
        ...formData,
        artists: [...formData.artists, {
            name: '', role: '', image_url: '', description: '',
            genre: '', is_verified: false, rating: 4.8, review_count: 0,
            events_hosted: 0, location: '', contact_email: '', contact_phone: '',
            experience_years: 0, specialties: [] as string[], follower_count: 0,
            social_links: ['']
        }]
    });
    const removeArtist = (index: number) => {
        setFormData({ ...formData, artists: formData.artists.filter((_, i) => i !== index) });
        setExpandedArtists(prev => prev.filter(i => i !== index));
    };

    const addTicket = () => setFormData({ ...formData, tickets: [...formData.tickets, { ticket_type: '', seat_type: 'standing', price: 0, total_quantity: 0, available_quantity: 0 }] });
    const removeTicket = (index: number) => setFormData({ ...formData, tickets: formData.tickets.filter((_, i) => i !== index) });

    const addFaq = () => setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] });
    const removeFaq = (index: number) => setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== index) });

    const addTerm = () => setFormData({ ...formData, terms_and_conditions: [...formData.terms_and_conditions, ''] });
    const removeTerm = (index: number) => setFormData({ ...formData, terms_and_conditions: formData.terms_and_conditions.filter((_, i) => i !== index) });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-zinc-50">
                    <h2 className="text-2xl font-bold text-zinc-900">Create New Event</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                        <X size={24} className="text-zinc-500" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-12">
                    {/* Basic Info */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-zinc-400 border-b pb-2">
                            <FileText size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Basic Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600">Event Title</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" placeholder="eg. AR Rahman Live" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600">Slug (URL)</label>
                                <input required type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" placeholder="eg. ar-rahman-live" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600">Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none">
                                    <option>Music</option>
                                    <option>Comedy</option>
                                    <option>Sports</option>
                                    <option>Workshops</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600">Language</label>
                                <input type="text" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" placeholder="eg. Tamil / English" />
                            </div>
                        </div>
                    </section>

                    {/* Schedule */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-zinc-400 border-b pb-2">
                            <Calendar size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Schedule & Pricing</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600">Start Date & Time</label>
                                <input required type="datetime-local" value={formData.start_datetime} onChange={e => setFormData({ ...formData, start_datetime: e.target.value })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600">End Date & Time</label>
                                <input required type="datetime-local" value={formData.end_datetime} onChange={e => setFormData({ ...formData, end_datetime: e.target.value })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600">Starting Price</label>
                                <input required type="number" value={formData.price_start} onChange={e => setFormData({ ...formData, price_start: Number(e.target.value) })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" />
                            </div>
                        </div>
                    </section>

                    {/* Venue */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-zinc-400 border-b pb-2">
                            <MapPin size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Venue Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <input type="text" placeholder="Venue Name" value={formData.venue.name} onChange={e => setFormData({ ...formData, venue: { ...formData.venue, name: e.target.value } })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <input type="text" placeholder="Full Address" value={formData.venue.address} onChange={e => setFormData({ ...formData, venue: { ...formData.venue, address: e.target.value } })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <input type="text" placeholder="City" value={formData.venue.city} onChange={e => setFormData({ ...formData, venue: { ...formData.venue, city: e.target.value } })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <input type="text" placeholder="Map URL" value={formData.venue.map_url} onChange={e => setFormData({ ...formData, venue: { ...formData.venue, map_url: e.target.value } })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" />
                            </div>
                        </div>
                    </section>

                    {/* Images */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-zinc-400 border-b pb-2">
                            <ImageIcon size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Images (Upload logic not yet implemented - use URLs)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600">Hero Image URL</label>
                                <input type="text" value={formData.images.hero} onChange={e => setFormData({ ...formData, images: { ...formData.images, hero: e.target.value } })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" placeholder="https://..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600">Poster Image URL</label>
                                <input type="text" value={formData.images.poster} onChange={e => setFormData({ ...formData, images: { ...formData.images, poster: e.target.value } })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" placeholder="https://..." />
                            </div>
                        </div>
                    </section>

                    {/* Descriptions */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-zinc-400 border-b pb-2">
                            <FileText size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Descriptions</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600">Short Description</label>
                                <input type="text" value={formData.short_description} onChange={e => setFormData({ ...formData, short_description: e.target.value })} className="w-full h-12 px-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600">Full Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-32 p-4 bg-zinc-50 border rounded-xl focus:border-[#5331EA] outline-none resize-none" />
                            </div>
                        </div>
                    </section>

                    {/* Artists */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Users size={18} />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Artists / Performers</h3>
                            </div>
                            <button type="button" onClick={addArtist} className="text-[#5331EA] flex items-center gap-1 text-sm font-bold hover:underline">
                                <Plus size={16} /> Add Artist
                            </button>
                        </div>
                        <div className="space-y-6">
                            {formData.artists.map((artist, index) => (
                                <div key={index} className="p-6 bg-zinc-50 border rounded-2xl relative space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-zinc-900">Artist #{index + 1}</h4>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleArtistExpansion(index)}
                                                className="text-sm text-zinc-500 hover:text-[#5331EA] font-medium"
                                            >
                                                {expandedArtists.includes(index) ? 'Collapse' : 'Add More Details'}
                                            </button>
                                            {formData.artists.length > 1 && (
                                                <button type="button" onClick={() => removeArtist(index)} className="text-zinc-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Artist Name"
                                            value={artist.name}
                                            onChange={e => {
                                                const newArtists = [...formData.artists];
                                                newArtists[index].name = e.target.value;
                                                setFormData({ ...formData, artists: newArtists });
                                            }}
                                            className="h-12 px-4 bg-white border rounded-xl focus:border-[#5331EA] outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Role (eg. Singer, Lead Artist)"
                                            value={artist.role}
                                            onChange={e => {
                                                const newArtists = [...formData.artists];
                                                newArtists[index].role = e.target.value;
                                                setFormData({ ...formData, artists: newArtists });
                                            }}
                                            className="h-12 px-4 bg-white border rounded-xl focus:border-[#5331EA] outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Artist Image URL"
                                            value={artist.image_url}
                                            onChange={e => {
                                                const newArtists = [...formData.artists];
                                                newArtists[index].image_url = e.target.value;
                                                setFormData({ ...formData, artists: newArtists });
                                            }}
                                            className="h-12 px-4 bg-white border rounded-xl focus:border-[#5331EA] outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Genre (eg. Rock, Jazz, Techno)"
                                            value={artist.genre}
                                            onChange={e => {
                                                const newArtists = [...formData.artists];
                                                newArtists[index].genre = e.target.value;
                                                setFormData({ ...formData, artists: newArtists });
                                            }}
                                            className="h-12 px-4 bg-white border rounded-xl focus:border-[#5331EA] outline-none"
                                        />
                                    </div>

                                    {expandedArtists.includes(index) && (
                                        <div className="space-y-4 pt-4 border-t border-zinc-200 animate-in fade-in slide-in-from-top-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Location</label>
                                                    <input type="text" placeholder="eg. Mumbai" value={artist.location} onChange={e => { const a = [...formData.artists]; a[index].location = e.target.value; setFormData({ ...formData, artists: a }); }} className="w-full h-11 px-4 bg-white border rounded-lg text-sm" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Followers</label>
                                                    <input type="number" placeholder="eg. 5000" value={artist.follower_count} onChange={e => { const a = [...formData.artists]; a[index].follower_count = Number(e.target.value); setFormData({ ...formData, artists: a }); }} className="w-full h-11 px-4 bg-white border rounded-lg text-sm" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Experience (Years)</label>
                                                    <input type="number" placeholder="eg. 5" value={artist.experience_years} onChange={e => { const a = [...formData.artists]; a[index].experience_years = Number(e.target.value); setFormData({ ...formData, artists: a }); }} className="w-full h-11 px-4 bg-white border rounded-lg text-sm" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Contact Email</label>
                                                    <input type="email" placeholder="artist@example.com" value={artist.contact_email} onChange={e => { const a = [...formData.artists]; a[index].contact_email = e.target.value; setFormData({ ...formData, artists: a }); }} className="w-full h-11 px-4 bg-white border rounded-lg text-sm" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Contact Phone</label>
                                                    <input type="text" placeholder="+91 ..." value={artist.contact_phone} onChange={e => { const a = [...formData.artists]; a[index].contact_phone = e.target.value; setFormData({ ...formData, artists: a }); }} className="w-full h-11 px-4 bg-white border rounded-lg text-sm" />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Specialties (eg. DJ, Live Vocals - comma separated)</label>
                                                <input
                                                    type="text"
                                                    placeholder="eg. Live Band, Wedding Sets"
                                                    value={Array.isArray(artist.specialties) ? artist.specialties.join(', ') : artist.specialties}
                                                    onChange={e => {
                                                        const a = [...formData.artists];
                                                        a[index].specialties = e.target.value.split(',').map(s => s.trim());
                                                        setFormData({ ...formData, artists: a });
                                                    }}
                                                    className="w-full h-11 px-4 bg-white border rounded-lg text-sm"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Social Links (One per line)</label>
                                                <textarea
                                                    placeholder="https://instagram.com/..."
                                                    value={artist.social_links.join('\n')}
                                                    onChange={e => {
                                                        const a = [...formData.artists];
                                                        a[index].social_links = e.target.value.split('\n');
                                                        setFormData({ ...formData, artists: a });
                                                    }}
                                                    className="w-full h-24 p-4 bg-white border rounded-lg text-sm resize-none"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Verified & Stats</label>
                                                <div className="flex items-center gap-6 p-3 bg-white border rounded-lg">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={artist.is_verified} onChange={e => { const a = [...formData.artists]; a[index].is_verified = e.target.checked; setFormData({ ...formData, artists: a }); }} className="w-4 h-4 rounded text-[#5331EA]" />
                                                        <span className="text-sm font-medium">Verified Profile</span>
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-zinc-500">Rating:</span>
                                                        <input type="number" step="0.1" value={artist.rating} onChange={e => { const a = [...formData.artists]; a[index].rating = Number(e.target.value); setFormData({ ...formData, artists: a }); }} className="w-16 h-8 px-2 border rounded text-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <textarea
                                        placeholder="Artist Short Bio"
                                        value={artist.description}
                                        onChange={e => {
                                            const newArtists = [...formData.artists];
                                            newArtists[index].description = e.target.value;
                                            setFormData({ ...formData, artists: newArtists });
                                        }}
                                        className="w-full h-24 p-4 bg-white border rounded-xl focus:border-[#5331EA] outline-none resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </form>

                {/* Footer */}
                <div className="p-6 border-t bg-zinc-50 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 font-bold text-zinc-500 hover:text-zinc-700">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#5331EA] text-white px-10 py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </div>
        </div>
    );
}
