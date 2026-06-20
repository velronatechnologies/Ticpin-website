'use client';

import React, { useState, useEffect } from 'react';
import { Server, Database, RefreshCw, Cpu, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StatusPanel() {
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshStatus = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Live Platform Status</h1>
          <p className="text-zinc-500 text-sm">Real-time health indicator for databases, cache, and system lock managers.</p>
        </div>
        <button 
          onClick={refreshStatus}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      {/* Node Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* API Server */}
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Server className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${pulse ? 'animate-ping' : ''}`}></span>
              Active
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">Go Fiber Backend</h3>
            <p className="text-xs text-zinc-500">Instance-01 (South India Region)</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-xs">
            <div>
              <span className="text-zinc-400">Response Time</span>
              <p className="font-medium text-zinc-900">14 ms</p>
            </div>
            <div>
              <span className="text-zinc-400">Uptime</span>
              <p className="font-medium text-zinc-900">99.98%</p>
            </div>
          </div>
        </div>

        {/* Redis Cache */}
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${pulse ? 'animate-ping' : ''}`}></span>
              Healthy
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">Azure Redis Cache</h3>
            <p className="text-xs text-zinc-500">Ticpinnew.southindia.redis.azure.net</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-xs">
            <div>
              <span className="text-zinc-400">Memory Usage</span>
              <p className="font-medium text-zinc-900">1.2 MB / 250 MB</p>
            </div>
            <div>
              <span className="text-zinc-400">Active Slot Locks</span>
              <p className="font-medium text-zinc-900">18 Locks</p>
            </div>
          </div>
        </div>

        {/* PostgreSQL Database */}
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Database className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${pulse ? 'animate-ping' : ''}`}></span>
              Connected
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">PostgreSQL DB</h3>
            <p className="text-xs text-zinc-500">Pooling: pgxpool v5</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-xs">
            <div>
              <span className="text-zinc-400">Open Connections</span>
              <p className="font-medium text-zinc-900">14 / 100 max</p>
            </div>
            <div>
              <span className="text-zinc-400">Slow Queries (24h)</span>
              <p className="font-medium text-amber-600">3 warnings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time locks and resource monitor */}
      <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
        <h3 className="font-semibold text-zinc-900 mb-4">Active Slot Locks (Redis Mutex)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-zinc-500">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50">
              <tr>
                <th className="px-4 py-3">Lock Key</th>
                <th className="px-4 py-3">Resource Type</th>
                <th className="px-4 py-3">Acquired At</th>
                <th className="px-4 py-3">TTL Remaining</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-zinc-900">lock:play:court:3342:18-20</td>
                <td className="px-4 py-3">Play Turf Slot</td>
                <td className="px-4 py-3">23:43:12</td>
                <td className="px-4 py-3">82s</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">Holding</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-zinc-900">lock:event:ticket:vip:889</td>
                <td className="px-4 py-3">VIP Ticket Purchase</td>
                <td className="px-4 py-3">23:44:01</td>
                <td className="px-4 py-3">14s</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">Holding</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-zinc-900">lock:dining:table:12:t4</td>
                <td className="px-4 py-3">Dining Reservation</td>
                <td className="px-4 py-3">23:44:45</td>
                <td className="px-4 py-3">294s</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">Committed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
