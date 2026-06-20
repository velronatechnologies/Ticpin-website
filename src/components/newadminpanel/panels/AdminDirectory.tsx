'use client';

import React, { useState } from 'react';
import { Plus, Shield, UserX, UserCheck } from 'lucide-react';

const mockAdmins = [
  { id: 'adm-1', name: 'Super Admin', email: 'admin@ticpin.com', isSuper: true, role: 'All Access', active: true },
  { id: 'adm-2', name: 'Support Rep 1', email: 'support@ticpin.com', isSuper: false, role: 'Support & Tickets', active: true },
  { id: 'adm-3', name: 'Finance Auditor', email: 'payouts@ticpin.com', isSuper: false, role: 'Payouts & Financials', active: true },
];

export default function AdminDirectoryPanel() {
  const [admins, setAdmins] = useState(mockAdmins);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Support & Tickets');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newAdmin = {
      id: `adm-${Date.now()}`,
      name,
      email,
      isSuper: false,
      role,
      active: true
    };

    setAdmins([...admins, newAdmin]);
    setShowAdd(false);
    setName('');
    setEmail('');
  };

  const toggleStatus = (id: string) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Admin Directory</h1>
          <p className="text-zinc-500 text-sm">Create, edit, and revoke access for internal staff members to govern platform features.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Provision Staff
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4">
          <h3 className="font-bold text-zinc-900 text-sm">Provision Staff Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Staff Name</label>
              <input 
                type="text" 
                placeholder="e.g. John Support"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-850 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Email Address</label>
              <input 
                type="email" 
                placeholder="e.g. rep@ticpin.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-850 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Role Scope</label>
              <select 
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-850 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Support & Tickets">Support & Tickets Only</option>
                <option value="Payouts & Financials">Payouts & Financials Only</option>
                <option value="Inventory Listing Manager">Inventory Listing Manager</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">Grant Access</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-xs font-semibold transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left text-zinc-500">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">Staff Member</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role Access Scope</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {admins.map(a => (
              <tr key={a.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-zinc-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  {a.name}
                </td>
                <td className="px-6 py-4 text-zinc-700">{a.email}</td>
                <td className="px-6 py-4 text-zinc-900 font-medium">{a.role}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    a.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {a.active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {!a.isSuper && (
                    <button 
                      onClick={() => toggleStatus(a.id)}
                      className={`px-2 py-1 rounded border text-xs font-semibold transition-colors ${
                        a.active 
                          ? 'border-red-100 text-red-600 hover:bg-red-50' 
                          : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {a.active ? 'Revoke Access' : 'Restore Access'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
