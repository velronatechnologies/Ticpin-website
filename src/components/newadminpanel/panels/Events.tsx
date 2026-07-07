'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Edit2, Save, X, Eye, Calendar, MapPin, Tag } from 'lucide-react';
import { newAdminApi } from '@/lib/api/admin';

export default function EventsPanel() {
  const [events, setEvents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [formState, setFormState] = useState<any>({
    name: '',
    description: '',
    category: '',
    sub_category: '',
    date: '',
    time: '',
    duration: '',
    city: '',
    venue_name: '',
    venue_address: '',
    google_map_link: '',
    instagram_link: '',
    portrait_image_url: '',
    landscape_image_url: '',
    card_video_url: '',
    price_starts_from: 0,
    status: 'pending',
    total_tickets_available: 0,
    is_sales_paused: false,
    is_canceled: false,
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await newAdminApi.listEvents(page, limit, search);
      setEvents(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelectEvent = async (id: string) => {
    try {
      const data = await newAdminApi.getEvent(id);
      setActiveEvent(data);
      // Format date for datetime-local or date input
      const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
      setFormState({
        ...data,
        date: formattedDate,
      });
      setIsEditing(false);
      setIsCreating(false);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch event details');
    }
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setActiveEvent(null);
    setIsEditing(false);
    setFormState({
      name: '',
      description: '',
      category: 'Music',
      sub_category: '',
      date: new Date().toISOString().split('T')[0],
      time: '18:00',
      duration: '3 hours',
      city: 'Coimbatore',
      venue_name: '',
      venue_address: '',
      google_map_link: '',
      instagram_link: '',
      portrait_image_url: '',
      landscape_image_url: '',
      card_video_url: '',
      price_starts_from: 0,
      status: 'pending',
      total_tickets_available: 100,
      is_sales_paused: false,
      is_canceled: false,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formState,
        price_starts_from: parseFloat(formState.price_starts_from) || 0,
        total_tickets_available: parseInt(formState.total_tickets_available) || 0,
        // Wrap date in standard ISO string
        date: formState.date ? new Date(formState.date).toISOString() : new Date().toISOString(),
      };

      if (isCreating) {
        await newAdminApi.createEvent(payload);
        alert('Event listing created successfully');
        setIsCreating(false);
      } else {
        await newAdminApi.updateEvent(activeEvent.id, payload);
        alert('Event listing updated successfully');
        setIsEditing(false);
        handleSelectEvent(activeEvent.id);
      }
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to save event');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this event listing?')) return;
    try {
      await newAdminApi.deleteEvent(id);
      alert('Event deleted successfully');
      if (activeEvent?.id === id) setActiveEvent(null);
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  return (
    <div className="flex relative h-full animate-fade-in gap-6">
      {/* List Panel */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Events Directory</h1>
            <p className="text-zinc-500 text-sm">Super admin control over ticket listings, pricing, and system properties.</p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>

        {/* Filter search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search events by name or venue..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-zinc-800"
          />
        </div>

        {error && <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl border border-red-200">{error}</div>}

        {/* Table View */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-sm text-zinc-400">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-400">No events found.</div>
          ) : (
            <table className="w-full text-sm text-left text-zinc-500">
              <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4">Event Info</th>
                  <th className="px-6 py-4">City / Venue</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {events.map(e => (
                  <tr 
                    key={e.id} 
                    onClick={() => handleSelectEvent(e.id)}
                    className="hover:bg-zinc-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-zinc-900">
                      <div>{e.name}</div>
                      <span className="text-[10px] text-indigo-650 font-normal">{e.category}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-700">
                      <div>{e.city}</div>
                      <div className="text-[10px] text-zinc-400">{e.venue_name}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-700">
                      <div>{e.date ? new Date(e.date).toLocaleDateString() : 'N/A'}</div>
                      <div className="text-[10px] text-zinc-400">{e.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        e.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={evt => handleDelete(e.id, evt)}
                        className="p-1.5 rounded-lg border border-red-100 text-red-650 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex justify-between items-center text-xs text-zinc-500 pt-2">
          <span>Showing {events.length} of {total} events</span>
          <div className="flex items-center gap-2">
            <button 
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              disabled={page * limit >= total}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Editor Panel on the right */}
      {(activeEvent || isCreating) && (
        <div className="w-[450px] bg-white border border-zinc-200 rounded-2xl p-6 shadow-md overflow-y-auto max-h-[85vh] animate-fade-in shrink-0 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">
              {isCreating ? 'Create Event' : isEditing ? 'Edit Event Details' : 'View Event'}
            </h2>
            <button onClick={() => { setActiveEvent(null); setIsCreating(false); }} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-zinc-500">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block uppercase tracking-wider mb-1">Event Name</label>
                <input 
                  type="text"
                  required
                  disabled={!isEditing && !isCreating}
                  value={formState.name}
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required
                  disabled={!isEditing && !isCreating}
                  value={formState.description}
                  onChange={e => setFormState({ ...formState, description: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 h-24 disabled:bg-zinc-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Category</label>
                  <input 
                    type="text"
                    required
                    disabled={!isEditing && !isCreating}
                    value={formState.category}
                    onChange={e => setFormState({ ...formState, category: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1">Subcategory</label>
                  <input 
                    type="text"
                    disabled={!isEditing && !isCreating}
                    value={formState.sub_category || ''}
                    onChange={e => setFormState({ ...formState, sub_category: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Date</label>
                  <input 
                    type="date"
                    required
                    disabled={!isEditing && !isCreating}
                    value={formState.date}
                    onChange={e => setFormState({ ...formState, date: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1">Time</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 18:00"
                    disabled={!isEditing && !isCreating}
                    value={formState.time}
                    onChange={e => setFormState({ ...formState, time: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1">Duration</label>
                  <input 
                    type="text"
                    disabled={!isEditing && !isCreating}
                    value={formState.duration || ''}
                    onChange={e => setFormState({ ...formState, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1">City</label>
                  <input 
                    type="text"
                    required
                    disabled={!isEditing && !isCreating}
                    value={formState.city}
                    onChange={e => setFormState({ ...formState, city: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1">Venue Name</label>
                  <input 
                    type="text"
                    required
                    disabled={!isEditing && !isCreating}
                    value={formState.venue_name}
                    onChange={e => setFormState({ ...formState, venue_name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Venue Address</label>
                <input 
                  type="text"
                  disabled={!isEditing && !isCreating}
                  value={formState.venue_address || ''}
                  onChange={e => setFormState({ ...formState, venue_address: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Price starts from (₹)</label>
                  <input 
                    type="number"
                    required
                    disabled={!isEditing && !isCreating}
                    value={formState.price_starts_from}
                    onChange={e => setFormState({ ...formState, price_starts_from: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1">Total Tickets</label>
                  <input 
                    type="number"
                    disabled={!isEditing && !isCreating}
                    value={formState.total_tickets_available}
                    onChange={e => setFormState({ ...formState, total_tickets_available: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Status</label>
                  <select
                    disabled={!isEditing && !isCreating}
                    value={formState.status}
                    onChange={e => setFormState({ ...formState, status: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                  >
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 justify-center pt-4">
                  <label className="flex items-center gap-2 text-zinc-800 cursor-pointer">
                    <input 
                      type="checkbox"
                      disabled={!isEditing && !isCreating}
                      checked={formState.is_sales_paused}
                      onChange={e => setFormState({ ...formState, is_sales_paused: e.target.checked })}
                      className="rounded text-indigo-650"
                    />
                    <span>Sales Paused</span>
                  </label>
                  <label className="flex items-center gap-2 text-zinc-800 cursor-pointer">
                    <input 
                      type="checkbox"
                      disabled={!isEditing && !isCreating}
                      checked={formState.is_canceled}
                      onChange={e => setFormState({ ...formState, is_canceled: e.target.checked })}
                      className="rounded text-indigo-650"
                    />
                    <span>Canceled</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Portrait Image URL</label>
                <input 
                  type="text"
                  disabled={!isEditing && !isCreating}
                  value={formState.portrait_image_url || ''}
                  onChange={e => setFormState({ ...formState, portrait_image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Landscape Image URL</label>
                <input 
                  type="text"
                  disabled={!isEditing && !isCreating}
                  value={formState.landscape_image_url || ''}
                  onChange={e => setFormState({ ...formState, landscape_image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 disabled:bg-zinc-50"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex gap-2">
              {!isEditing && !isCreating ? (
                <button 
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit Event
                </button>
              ) : (
                <>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (isCreating) setIsCreating(false);
                      else setIsEditing(false);
                    }}
                    className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
