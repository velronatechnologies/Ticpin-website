'use client';

import React from 'react';
import { TrendingUp, Users, DollarSign, Ticket, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const salesData = [
  { name: 'Jan', revenue: 4000, bookings: 240 },
  { name: 'Feb', revenue: 5000, bookings: 300 },
  { name: 'Mar', revenue: 6000, bookings: 350 },
  { name: 'Apr', revenue: 5500, bookings: 310 },
  { name: 'May', revenue: 7000, bookings: 400 },
  { name: 'Jun', revenue: 9000, bookings: 520 },
  { name: 'Jul', revenue: 12000, bookings: 680 },
];

export default function OverviewPanel() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard Overview</h1>
          <p className="text-zinc-500 text-sm">Real-time revenue, bookings and platform health metrics.</p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-sm font-medium">Total Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-900">₹4,82,450</h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5% from last month
            </span>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-sm font-medium">Active Bookings</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-900">1,248</h3>
            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-1">
              <Activity className="w-3.5 h-3.5" /> 84 slots locked today
            </span>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-sm font-medium">New Organizers</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-900">42</h3>
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1 mt-1">
              +4 pending KYC reviews
            </span>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-sm font-medium">Avg Ticket Value</span>
            <div className="p-2 bg-zinc-50 text-zinc-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-900">₹1,250</h3>
            <span className="text-xs text-zinc-500 mt-1 block">
              Stabilized over events & plays
            </span>
          </div>
        </div>
      </div>

      {/* Chart Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-zinc-900 mb-4">Revenue Trend (₹)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-zinc-900 mb-4">Monthly Bookings Volume</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
