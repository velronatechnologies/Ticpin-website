'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Award, Layers } from 'lucide-react';

const velocityData = [
  { tier: 'Early Bird', sold: 480, total: 500, rate: '96% (Fastest)' },
  { tier: 'General Adm.', sold: 1200, total: 2000, rate: '60%' },
  { tier: 'VIP Access', sold: 88, total: 100, rate: '88% (High Velocity)' },
  { tier: 'Group Passes', sold: 40, total: 100, rate: '40%' },
];

export default function SalesVelocityPanel() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Sales Velocity & Inventory</h1>
        <p className="text-zinc-500 text-sm">Visual metrics mapping exactly which ticket tiers are selling out the fastest across event listings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-semibold text-zinc-900">Ticket Tier Allocation vs Sold</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="tier" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sold" fill="#6366f1" name="Tickets Sold" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#e4e4e7" name="Total Allocated" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Layers className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-zinc-900">Velocity Indicators</h3>
          </div>
          
          <div className="space-y-4 font-sans text-xs">
            {velocityData.map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-bold text-zinc-900">
                  <span>{d.tier}</span>
                  <span className="text-indigo-600">{d.rate}</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${(d.sold / d.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-zinc-400">{d.sold} / {d.total} units sold</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
