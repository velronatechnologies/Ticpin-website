'use client';

import React, { useState } from 'react';
import { Plus, Tag, RefreshCw, Trash2 } from 'lucide-react';

const mockCoupons = [
  { id: 'cop-1', code: 'TICKPIN50', discountType: 'percentage', discountValue: 10, maxUses: 500, usedCount: 142, status: 'Active', validUntil: '2026-08-31' },
  { id: 'cop-2', code: 'WELCOME100', discountType: 'flat', discountValue: 100, maxUses: 1000, usedCount: 890, status: 'Active', validUntil: '2026-12-31' },
  { id: 'cop-3', code: 'MONSOON20', discountType: 'percentage', discountValue: 20, maxUses: 100, usedCount: 100, status: 'Exhausted', validUntil: '2026-06-15' },
];

export default function DiscountCouponsPanel() {
  const [coupons, setCoupons] = useState(mockCoupons);
  const [showAdd, setShowAdd] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [value, setValue] = useState(10);
  const [maxUses, setMaxUses] = useState(500);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    const newCoupon = {
      id: `cop-${Date.now()}`,
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(value),
      maxUses: Number(maxUses),
      usedCount: 0,
      status: 'Active',
      validUntil: '2026-12-31'
    };

    setCoupons([newCoupon, ...coupons]);
    setShowAdd(false);
    setCode('');
  };

  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Discount Coupons</h1>
          <p className="text-zinc-500 text-sm">Configure platform-wide promotional codes, set use limits, and track usage rates.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4">
          <h3 className="font-bold text-zinc-900 text-sm">Create New Promo Coupon</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Promo Code</label>
              <input 
                type="text" 
                placeholder="e.g. FIFTYPERCENT"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Type</label>
              <select 
                value={discountType}
                onChange={e => setDiscountType(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Cash (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Discount value</label>
              <input 
                type="number" 
                value={value}
                onChange={e => setValue(Number(e.target.value))}
                min="1"
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1 uppercase">Max Uses</label>
              <input 
                type="number" 
                value={maxUses}
                onChange={e => setMaxUses(Number(e.target.value))}
                min="1"
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">Generate Code</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-xs font-semibold transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left text-zinc-500">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">Promo Code</th>
              <th className="px-6 py-4">Discount Value</th>
              <th className="px-6 py-4">Usage Rate</th>
              <th className="px-6 py-4">Expiry Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {coupons.map(c => (
              <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-zinc-950 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-500" />
                  {c.code}
                </td>
                <td className="px-6 py-4 text-zinc-700">
                  {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-zinc-100 rounded-full h-2.5 max-w-[120px]">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (c.usedCount / c.maxUses) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">{c.usedCount} / {c.maxUses} Uses</span>
                </td>
                <td className="px-6 py-4 text-zinc-400">{c.validUntil}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => deleteCoupon(c.id)}
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
