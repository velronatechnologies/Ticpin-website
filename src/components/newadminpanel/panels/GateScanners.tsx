'use client';

import React, { useState } from 'react';
import { ShieldCheck, Plus, Key, RefreshCw } from 'lucide-react';

const mockScanners = [
  { id: 'scn-1', venue: 'Elite Sports Arena', key: 'VKEY_ELITE_9281', name: 'South Gate 1', active: true },
  { id: 'scn-2', venue: 'Sunburn Arena Guide', key: 'VKEY_SUNB_1102', name: 'Main VIP Gate', active: true },
  { id: 'scn-3', venue: 'Grand Hyatt Buffet', key: 'VKEY_HYAT_4492', name: 'Front Desk', active: false },
];

export default function GateScannersPanel() {
  const [scanners, setScanners] = useState(mockScanners);

  const toggleStatus = (id: string) => {
    setScanners(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const regenerateKey = (id: string) => {
    const randomKey = 'VKEY_' + Math.random().toString(36).substring(2, 6).toUpperCase() + '_' + Math.floor(1000 + Math.random() * 9000);
    setScanners(prev => prev.map(s => s.id === id ? { ...s, key: randomKey } : s));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Gate Scanners</h1>
          <p className="text-zinc-500 text-sm">Create and authorize scanner accounts (Verifiers) for physical ticket validation at the venue gates.</p>
        </div>
        <button 
          onClick={() => alert('Adding scanner accounts...')}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Provision Scanner
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left text-zinc-500">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">Scanner Gate</th>
              <th className="px-6 py-4">Linked Venue</th>
              <th className="px-6 py-4">Verification Token / Key</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {scanners.map(s => (
              <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-zinc-900">{s.name}</td>
                <td className="px-6 py-4 text-zinc-700">{s.venue}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded border border-zinc-200">
                      {s.key}
                    </span>
                    <button 
                      onClick={() => regenerateKey(s.id)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
                      title="Regenerate Key"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {s.active ? 'Authorized' : 'Suspended'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => toggleStatus(s.id)}
                    className={`px-2 py-1 rounded border text-xs font-semibold transition-colors ${
                      s.active 
                        ? 'border-red-100 text-red-600 hover:bg-red-50' 
                        : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {s.active ? 'Revoke Access' : 'Authorize Access'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
