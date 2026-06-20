'use client';

import React, { useState } from 'react';
import { Search, ShieldAlert, Filter, UserCheck, UserX } from 'lucide-react';

const mockOrganizers = [
  { id: 'org-1', name: 'Elite Sports Arena', email: 'contact@elitesports.com', phone: '+91 9876543210', category: 'Play', verified: true, joined: '2026-04-12' },
  { id: 'org-2', name: 'Grand Hyatt Dining', email: 'reservations@hyattindia.com', phone: '+91 9999888877', category: 'Dining', verified: true, joined: '2026-05-01' },
  { id: 'org-3', name: 'Sunburn Arena Guide', email: 'events@sunburn.in', phone: '+91 8888777766', category: 'Events', verified: false, joined: '2026-06-18' },
  { id: 'org-4', name: 'PlayOn Football Turf', email: 'bookings@playonturf.in', phone: '+91 7777666655', category: 'Play', verified: true, joined: '2026-06-19' },
];

export default function OrganizerDirectoryPanel() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [organizers, setOrganizers] = useState(mockOrganizers);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  const toggleVerify = (id: string) => {
    setOrganizers(prev => prev.map(o => o.id === id ? { ...o, verified: !o.verified } : o));
    if (selectedOrg && selectedOrg.id === id) {
      setSelectedOrg((prev: any) => ({ ...prev, verified: !prev.verified }));
    }
  };

  const filtered = organizers.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || o.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex relative h-full animate-fade-in">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Organizer Directory</h1>
          <p className="text-zinc-500 text-sm">View, inspect, and manage verified and pending vendor accounts.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-zinc-800"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-zinc-200 rounded-xl text-sm bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Events">Events</option>
              <option value="Play">Play (Turfs)</option>
              <option value="Dining">Dining</option>
            </select>
          </div>
        </div>

        {/* Directory Grid/Table */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left text-zinc-500">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4">Organizer Name</th>
                <th className="px-6 py-4">Contact info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(o => (
                <tr 
                  key={o.id}
                  onClick={() => setSelectedOrg(o)}
                  className="hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-zinc-900">{o.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <p className="text-zinc-700">{o.email}</p>
                      <p className="text-zinc-400">{o.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 rounded-full text-xs font-medium">
                      {o.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {o.verified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold">
                        Pending KYC
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{o.joined}</td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleVerify(o.id)}
                      className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        o.verified 
                          ? 'border-red-100 text-red-600 hover:bg-red-50' 
                          : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {o.verified ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide Over Inspect Panel */}
      {selectedOrg && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-zinc-200 z-50 p-6 space-y-6 transform transition-transform duration-300">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">Inspect Organizer</h2>
            <button onClick={() => setSelectedOrg(null)} className="text-zinc-400 hover:text-zinc-600">Close</button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400 uppercase">Organizer Name</span>
              <p className="font-semibold text-zinc-900">{selectedOrg.name}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 uppercase">Category Vertical</span>
              <p className="text-zinc-800">{selectedOrg.category}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 uppercase">Email Address</span>
              <p className="text-zinc-800">{selectedOrg.email}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 uppercase">Mobile Number</span>
              <p className="text-zinc-800">{selectedOrg.phone}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 uppercase">Date Onboarded</span>
              <p className="text-zinc-800">{selectedOrg.joined}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 uppercase">Status</span>
              <div className="mt-1">
                {selectedOrg.verified ? (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">Verified Vendor</span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">Pending Verification</span>
                )}
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-zinc-100 space-y-2">
            <button 
              onClick={() => toggleVerify(selectedOrg.id)}
              className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedOrg.verified 
                  ? 'bg-red-50 hover:bg-red-100 text-red-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              {selectedOrg.verified ? 'Revoke Verification' : 'Verify Account Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
