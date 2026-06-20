'use client';

import React, { useState } from 'react';
import { Ticket, Plus, ShieldAlert, Award, Star } from 'lucide-react';

const mockPasses = [
  { id: 'pass-1', userName: 'Ramji B', passType: 'Gold Pass', balanceTurf: 4, balanceDining: 2, status: 'Active', expiry: '2026-12-31' },
  { id: 'pass-2', userName: 'John Doe', passType: 'Silver Pass', balanceTurf: 2, balanceDining: 0, status: 'Active', expiry: '2026-09-15' },
  { id: 'pass-3', userName: 'Alice Smith', passType: 'Platinum Pass', balanceTurf: 10, balanceDining: 5, status: 'Expired', expiry: '2026-05-10' },
];

export default function TicpassManagementPanel() {
  const [passes, setPasses] = useState(mockPasses);
  const [showAdd, setShowAdd] = useState(false);

  // Add mock variables for creation form
  const [newUserName, setNewUserName] = useState('');
  const [newPassType, setNewPassType] = useState('Gold Pass');
  const [newTurfs, setNewTurfs] = useState(4);
  const [newDining, setNewDining] = useState(2);

  const handleCreatePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const newPass = {
      id: `pass-${Date.now()}`,
      userName: newUserName,
      passType: newPassType,
      balanceTurf: Number(newTurfs),
      balanceDining: Number(newDining),
      status: 'Active',
      expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setPasses([newPass, ...passes]);
    setShowAdd(false);
    setNewUserName('');
  };

  const revokePass = (id: string) => {
    setPasses(prev => prev.map(p => p.id === id ? { ...p, status: 'Revoked' } : p));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Ticpass Management</h1>
          <p className="text-zinc-500 text-sm">Issue new membership passes, renew voucher counts, or revoke subscription models.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Issue Ticket Pass
        </button>
      </div>

      {/* Issuing Form modal/view */}
      {showAdd && (
        <form onSubmit={handleCreatePass} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4">
          <h3 className="font-bold text-zinc-900 text-sm">Issue New Ticpass Membership</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">User Name</label>
              <input 
                type="text" 
                placeholder="e.g. John Doe"
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Pass Tier</label>
              <select 
                value={newPassType}
                onChange={e => setNewPassType(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Gold Pass">Gold Pass</option>
                <option value="Silver Pass">Silver Pass</option>
                <option value="Platinum Pass">Platinum Pass</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Turf Voucher Balance</label>
              <input 
                type="number" 
                value={newTurfs}
                onChange={e => setNewTurfs(Number(e.target.value))}
                min="0"
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Dining Voucher Balance</label>
              <input 
                type="number" 
                value={newDining}
                onChange={e => setNewDining(Number(e.target.value))}
                min="0"
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">Create Pass</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-xs font-semibold transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Grid of active passes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {passes.map(p => (
          <div key={p.id} className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 p-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : p.status === 'Expired' ? 'bg-zinc-100 text-zinc-500' : 'bg-red-50 text-red-700'
              }`}>
                {p.status}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-950 text-amber-400 rounded-lg">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">{p.userName}</h3>
                <p className="text-xs text-zinc-500">{p.passType}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-100">
              <div>
                <span className="text-zinc-400">Turf Balance</span>
                <p className="font-bold text-zinc-800 text-sm mt-0.5">{p.balanceTurf} Vouchers</p>
              </div>
              <div>
                <span className="text-zinc-400">Dining Balance</span>
                <p className="font-bold text-zinc-800 text-sm mt-0.5">{p.balanceDining} Vouchers</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-zinc-400">Expires: {p.expiry}</span>
              {p.status === 'Active' && (
                <button 
                  onClick={() => revokePass(p.id)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
