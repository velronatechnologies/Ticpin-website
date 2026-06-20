'use client';

import React, { useState } from 'react';
import { Database, Search, Edit2, Play, Table, AlertTriangle, ShieldCheck } from 'lucide-react';

const mockCollections = [
  { name: 'users', count: 20482 },
  { name: 'organizers', count: 124 },
  { name: 'bookings', count: 8522 },
  { name: 'events', count: 48 },
  { name: 'plays', count: 96 },
  { name: 'dinings', count: 52 },
  { name: 'coupons', count: 32 },
  { name: 'dynamic_offers', count: 12 },
];

const mockUsersData = [
  { _id: '6a005caf54c59a0a4aded3ac', username: 'ramjib2311', email: 'ramjib2311@gmail.com', role: 'Author', google_auth: false, country: 'India', created_at: '2026-05-10T23:43:51Z' },
  { _id: '6a005caf7707328e1fedcd2b', username: 'geniral.kpriet', email: 'geniral.kpriet@gmail.com', role: 'Author', google_auth: false, country: 'India', created_at: '2026-06-01T12:12:04Z' },
  { _id: '6a005caf882b227222dfa4f0', username: 'ramjib929', email: 'ramjib929@gmail.com', role: 'Author', google_auth: false, country: 'India', created_at: '2026-06-15T09:40:18Z' },
  { _id: '6a005caf8a339f8863c7c272', username: 'admin', email: 'icius2026@icius.org', role: 'Admin', google_auth: false, country: 'India', created_at: '2026-05-01T10:00:00Z' },
];

export default function DatabaseEditorPanel() {
  const [activeCollection, setActiveCollection] = useState('users');
  const [searchEmail, setSearchEmail] = useState('');
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>(mockUsersData);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setDocs(prev => prev.map(d => d._id === editingDoc._id ? editingDoc : d));
    setEditingDoc(null);
    alert('Document successfully updated!');
  };

  return (
    <div className="flex relative h-full animate-fade-in gap-6">
      {/* Sidebar Collections */}
      <div className="w-64 border border-zinc-200 bg-white rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
          <Database className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-zinc-950 text-sm">Collections</h3>
        </div>
        <div className="space-y-1 overflow-y-auto max-h-[480px]">
          {mockCollections.map(c => (
            <button 
              key={c.name}
              onClick={() => setActiveCollection(c.name)}
              className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeCollection === c.name ? 'bg-indigo-50 text-indigo-750' : 'text-zinc-650 hover:bg-zinc-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5" />
                {c.name}
              </span>
              <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full font-mono">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Editor */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Database Editor</h1>
            <p className="text-zinc-500 text-sm">Direct, real-time CRUD access to raw PostgreSQL schemas and locks.</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Danger Mode: Live Write Enabled
            </span>
          </div>
        </div>

        {/* Filter / Search inside table */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder={`Query ${activeCollection} collection...`}
            value={searchEmail}
            onChange={e => setSearchEmail(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-zinc-800"
          />
        </div>

        {/* Table data */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left text-zinc-500">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-4 py-3">_id</th>
                <th className="px-4 py-3">username</th>
                <th className="px-4 py-3">email</th>
                <th className="px-4 py-3">role</th>
                <th className="px-4 py-3">google auth</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-sans">
              {docs.filter(d => d.email.toLowerCase().includes(searchEmail.toLowerCase())).map(d => (
                <tr key={d._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{d._id}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-950">{d.username}</td>
                  <td className="px-4 py-3 text-zinc-800">{d.email}</td>
                  <td className="px-4 py-3">{d.role}</td>
                  <td className="px-4 py-3 text-xs">{d.google_auth ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => setEditingDoc(d)}
                      className="p-1 border border-indigo-250 text-indigo-600 rounded hover:bg-indigo-50 transition-colors text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over document editor */}
      {editingDoc && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-zinc-200 z-50 p-6 space-y-6 overflow-y-auto transform transition-transform duration-300">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">Edit Document</h2>
            <button onClick={() => setEditingDoc(null)} className="text-zinc-400 hover:text-zinc-600">Cancel</button>
          </div>
          
          <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-250">
            Edits are saved field-by-field. Invalid values may trigger schema integrity validation fails in Go backend.
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">_ID (Read Only)</label>
              <input type="text" value={editingDoc._id} readOnly className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-500 font-mono focus:outline-none" />
            </div>
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">USERNAME</label>
              <input 
                type="text" 
                value={editingDoc.username}
                onChange={e => setEditingDoc({ ...editingDoc, username: e.target.value })}
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">EMAIL</label>
              <input 
                type="email" 
                value={editingDoc.email}
                onChange={e => setEditingDoc({ ...editingDoc, email: e.target.value })}
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">COUNTRY</label>
              <input 
                type="text" 
                value={editingDoc.country}
                onChange={e => setEditingDoc({ ...editingDoc, country: e.target.value })}
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">ROLE</label>
              <select 
                value={editingDoc.role}
                onChange={e => setEditingDoc({ ...editingDoc, role: e.target.value })}
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg bg-white text-zinc-850 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Admin">Admin</option>
                <option value="Author">Author</option>
                <option value="Reviewer">Reviewer</option>
              </select>
            </div>

            <button type="submit" className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-lg shadow transition-colors">
              Save Document Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
