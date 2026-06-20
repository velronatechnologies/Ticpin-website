'use client';

import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, Radio, CheckCircle, AlertTriangle } from 'lucide-react';

const mockBlockedIps = [
  { ip: '14.139.128.2', reason: 'OTP request burst spam', hitsBlocked: 42, lastAttempt: '22:50:12' },
  { ip: '192.168.42.100', reason: 'Brute force admin login trial', hitsBlocked: 110, lastAttempt: '23:14:02' },
];

export default function RateLimitsPanel() {
  const [blocked, setBlocked] = useState(mockBlockedIps);

  const clearBlock = (ip: string) => {
    setBlocked(prev => prev.filter(b => b.ip !== ip));
    alert(`IP: ${ip} has been unblocked from the rate limit tracker.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">API Rate Limits & Traffic</h1>
          <p className="text-zinc-500 text-sm">Live network monitoring showing rate limit tracking entries and blocked IP addresses.</p>
        </div>
        <button 
          onClick={() => alert('Refreshing rates...')}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Logs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Cards */}
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <span className="text-zinc-500 text-sm font-medium">Total Rate-Limit Blocks</span>
          <h3 className="text-2xl font-bold text-zinc-900 mt-2">152 Blocks</h3>
          <p className="text-xs text-zinc-400 mt-1">Accumulated across past 24 hrs</p>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <span className="text-zinc-500 text-sm font-medium">Spam OTP Shield</span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">Enabled</h3>
          <p className="text-xs text-emerald-650 font-semibold mt-1">10 attempts per IP cooldown</p>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <span className="text-zinc-500 text-sm font-medium">Active IP Tracker Entries</span>
          <h3 className="text-2xl font-bold text-zinc-900 mt-2">42 IPs</h3>
          <p className="text-xs text-zinc-400 mt-1">Currently tracked inside memory cache</p>
        </div>
      </div>

      {/* Blocked IP Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-zinc-500" />
          <span className="font-semibold text-zinc-700 text-sm">Actively Blocked IP Registries</span>
        </div>
        <table className="w-full text-sm text-left text-zinc-500">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">IP Address</th>
              <th className="px-6 py-4">Violation Details</th>
              <th className="px-6 py-4">Blocked Request Hits</th>
              <th className="px-6 py-4">Blocked At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-sans">
            {blocked.map(b => (
              <tr key={b.ip} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-zinc-950 text-xs">{b.ip}</td>
                <td className="px-6 py-4 text-zinc-700">{b.reason}</td>
                <td className="px-6 py-4 font-bold text-red-600">{b.hitsBlocked} hits</td>
                <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{b.lastAttempt}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => clearBlock(b.ip)}
                    className="px-2.5 py-1 text-xs font-semibold border border-emerald-100 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    Unblock IP
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
