'use client';

import React, { useState } from 'react';
import { Plus, Percent, Trash2 } from 'lucide-react';

const mockOffers = [
  { id: 'off-1', name: 'Elite Turf Monsoon Discount', targetType: 'Play', targetId: 'ply-1', discountPct: 15, validUntil: '2026-07-31', active: true },
  { id: 'off-2', name: 'Hyatt Dinner Buffet Early Bird', targetType: 'Dining', targetId: 'din-1', discountPct: 10, validUntil: '2026-08-15', active: true },
];

export default function DynamicOffersPanel() {
  const [offers, setOffers] = useState(mockOffers);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState('Play');
  const [discountPct, setDiscountPct] = useState(15);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newOffer = {
      id: `off-${Date.now()}`,
      name,
      targetType,
      targetId: 'ply-1',
      discountPct: Number(discountPct),
      validUntil: '2026-09-30',
      active: true
    };

    setOffers([newOffer, ...offers]);
    setShowAdd(false);
    setName('');
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dynamic Offers</h1>
          <p className="text-zinc-500 text-sm">Create and configure dynamic % offers mapped to specific venue listings or events.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4">
          <h3 className="font-bold text-zinc-900 text-sm">Create Entity-Specific Offer</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Offer Name</label>
              <input 
                type="text" 
                placeholder="e.g. Weekend Special"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Vertical Target</label>
              <select 
                value={targetType}
                onChange={e => setTargetType(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Play">Play (Turfs)</option>
                <option value="Dining">Dining</option>
                <option value="Events">Events</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Discount Percentage (%)</label>
              <input 
                type="number" 
                value={discountPct}
                onChange={e => setDiscountPct(Number(e.target.value))}
                min="1"
                max="100"
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">Publish Offer</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-xs font-semibold transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left text-zinc-500">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">Offer Name</th>
              <th className="px-6 py-4">Target Category</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4">Valid Until</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {offers.map(o => (
              <tr key={o.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-zinc-950 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  {o.name}
                </td>
                <td className="px-6 py-4 text-zinc-700">{o.targetType}</td>
                <td className="px-6 py-4 text-emerald-600 font-bold">{o.discountPct}% Off</td>
                <td className="px-6 py-4 text-zinc-400">{o.validUntil}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    o.active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {o.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => deleteOffer(o.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
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
