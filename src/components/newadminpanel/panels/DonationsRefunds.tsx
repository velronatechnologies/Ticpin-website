'use client';

import React from 'react';
import { Heart, RefreshCcw, DollarSign } from 'lucide-react';

const mockDonations = [
  { id: 'don-1', userName: 'Ramji B', venue: 'Elite Sports Arena', refundAmount: 1200, donatedAmount: 120, destination: 'Sports Development Trust', date: '2026-06-18' },
  { id: 'don-2', userName: 'John Doe', venue: 'Smash Badminton Club', refundAmount: 400, donatedAmount: 40, destination: 'Prime Minister Relief Fund', date: '2026-06-19' },
  { id: 'don-3', userName: 'Alice Smith', venue: 'The Leela Dining', refundAmount: 2500, donatedAmount: 250, destination: 'Akshaya Patra Foundation', date: '2026-06-20' },
];

export default function DonationsRefundsPanel() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Donations & Refunds</h1>
          <p className="text-zinc-500 text-sm">Track cancellations, refund disbursements, and user-initiated charitable donations from refunded tickets.</p>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start text-zinc-500 text-sm font-medium">
            <span>Total Refunds Disbursed</span>
            <RefreshCcw className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 mt-2">₹1,48,290</h3>
          <p className="text-xs text-zinc-400 mt-1">Processed within 3-5 bank business days</p>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start text-zinc-500 text-sm font-medium">
            <span>Aggregated Donations</span>
            <Heart className="w-5 h-5 text-red-500 fill-current" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 mt-2">₹14,829</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">10% average user donation rate</p>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start text-zinc-500 text-sm font-medium">
            <span>Active Charity Partners</span>
            <Heart className="w-5 h-5 text-zinc-400" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 mt-2">4 Funds</h3>
          <p className="text-xs text-zinc-400 mt-1">Directly integrated at checkout</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left text-zinc-500">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Cancelled Venue</th>
              <th className="px-6 py-4">Gross Refund</th>
              <th className="px-6 py-4">Donation Share</th>
              <th className="px-6 py-4">Destination Fund</th>
              <th className="px-6 py-4">Date processed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {mockDonations.map(d => (
              <tr key={d.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-zinc-900">{d.userName}</td>
                <td className="px-6 py-4 text-zinc-750">{d.venue}</td>
                <td className="px-6 py-4 text-zinc-900 font-medium">₹{d.refundAmount}</td>
                <td className="px-6 py-4 text-red-650 font-bold">₹{d.donatedAmount}</td>
                <td className="px-6 py-4 text-zinc-700 font-medium">{d.destination}</td>
                <td className="px-6 py-4 text-zinc-400">{d.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
