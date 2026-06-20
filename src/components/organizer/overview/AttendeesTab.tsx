'use client';

import React from 'react';
import { FileSpreadsheet, Search } from 'lucide-react';
import { BookingData } from './types';

interface AttendeesTabProps {
  bookings: BookingData[];
  loadingBookings: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  handleExportCSV: () => void;
}

export default function AttendeesTab({
  bookings,
  loadingBookings,
  searchQuery,
  setSearchQuery,
  handleExportCSV
}: AttendeesTabProps) {
  // Filter bookings locally based on the search query
  const filteredBookings = bookings.filter(b => 
    b.booking_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.user_phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black">Guest Directory</h1>
          <p className="text-zinc-500 mt-1">Manage guest records and check ticket statuses.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={bookings.length === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet size={18} /> Export to CSV
          </button>
        </div>
      </div>

      {/* Search inputs */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search bookings by ID, Customer Name, Email or Mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-[52px] bg-white rounded-xl pl-12 pr-6 border border-[#aeaeae] outline-none shadow-sm focus:border-purple-600 text-black placeholder-zinc-400"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-[#aeaeae] overflow-hidden shadow-sm">
        {loadingBookings ? (
          <div className="p-12 text-center text-zinc-500 font-medium">Loading attendees data...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 font-medium">No booking matches found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Tiers & Count</th>
                  <th className="px-6 py-4 text-right">Order value</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-[14px]">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4.5 font-mono font-bold text-zinc-700">
                      #{b.booking_id}
                    </td>
                    <td className="px-6 py-4.5">
                      <p className="font-semibold text-black">{b.user_name}</p>
                      <p className="text-zinc-400 text-xs">{b.user_email}</p>
                      <p className="text-zinc-400 text-xs">{b.user_phone}</p>
                    </td>
                    <td className="px-6 py-4.5">
                      <p className="font-semibold text-zinc-800">
                        {b.tickets?.[0]?.category || 'General Admission'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Qty: {b.tickets?.[0]?.quantity || 1}
                      </p>
                    </td>
                    <td className="px-6 py-4.5 text-right font-bold text-black">
                      ₹{b.grand_total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        b.status === 'confirmed' || b.status === 'booked' || b.status === 'checked_in'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {b.status === 'checked_in' ? 'checked in' : b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-zinc-400">
                      {new Date(b.booked_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
