'use client';

import React, { useState } from 'react';
import { Search, Filter, HelpCircle, FileCheck, CheckCircle } from 'lucide-react';

const mockBookings = [
  { id: 'TXN-9021', userName: 'Ramji B', venue: 'Elite Sports Arena', bookingType: 'Play', amount: 1200, status: 'completed', date: '2026-06-20 18:22' },
  { id: 'TXN-1102', userName: 'John Doe', venue: 'Grand Hyatt Dining', bookingType: 'Dining', amount: 3500, status: 'completed', date: '2026-06-20 19:40' },
  { id: 'TXN-4492', userName: 'Alice Smith', venue: 'Sunburn Arena Guide', bookingType: 'Events', amount: 3000, status: 'refunded', date: '2026-06-19 12:15' },
  { id: 'TXN-8842', userName: 'Bob Johnson', venue: 'PlayOn Football Turf', bookingType: 'Play', amount: 1200, status: 'pending', date: '2026-06-20 23:10' },
];

export default function BookingsMasterPanel() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filtered = mockBookings.filter(b => {
    const matchesSearch = b.id.toLowerCase().includes(search.toLowerCase()) || b.userName.toLowerCase().includes(search.toLowerCase()) || b.venue.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || b.bookingType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">All Bookings Master</h1>
          <p className="text-zinc-500 text-sm">Unified booking grid tracking all Event, Play (Turf), and Dining reservations made across the app.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search by transaction ID, customer name, venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-zinc-800"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 border border-zinc-200 rounded-xl text-sm bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Types</option>
            <option value="Play">Play (Turfs)</option>
            <option value="Dining">Dining</option>
            <option value="Events">Events</option>
          </select>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left text-zinc-500">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Linked Venue</th>
              <th className="px-6 py-4">Booking vertical</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Payment status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map(b => (
              <tr key={b.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-zinc-950 text-xs">{b.id}</td>
                <td className="px-6 py-4 text-zinc-900">{b.userName}</td>
                <td className="px-6 py-4 text-zinc-700">{b.venue}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-700 rounded-full text-xs font-semibold">
                    {b.bookingType}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-900 font-bold">₹{b.amount}</td>
                <td className="px-6 py-4 text-zinc-400">{b.date}</td>
                <td className="px-6 py-4">
                  {b.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Successful
                    </span>
                  ) : b.status === 'refunded' ? (
                    <span className="inline-flex items-center gap-1 text-zinc-500 text-xs font-semibold">
                      Refunded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold">
                      Pending Approval
                    </span>
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
