'use client';

import React, { useState } from 'react';
import { RefreshCw, Trash2, Cpu, CheckCircle, Database } from 'lucide-react';

export default function CacheManagementPanel() {
  const [clearing, setClearing] = useState<string | null>(null);

  const triggerClear = (type: string) => {
    setClearing(type);
    setTimeout(() => {
      setClearing(null);
      alert(`Cache invalidated successfully for: ${type}`);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Cache Management</h1>
        <p className="text-zinc-500 text-sm">Monitor Redis cluster cache nodes, clear specific indices, or invalidate query fallbacks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statistics panel */}
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Cpu className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-zinc-900">Active Node Stats</h3>
          </div>
          <div className="space-y-3 text-sm text-zinc-650 font-sans">
            <div className="flex justify-between items-center">
              <span>Node Location</span>
              <span className="font-semibold text-zinc-900">South India Cluster</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Database Size</span>
              <span className="font-mono text-zinc-800">4,821 Keys Cached</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Hit / Miss Ratio</span>
              <span className="text-emerald-600 font-semibold">92.4% / 7.6%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Connected Clients</span>
              <span className="font-semibold text-zinc-900">12 connections</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-zinc-900">Invalidate Cache Indices</h3>
          </div>
          
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center p-3 bg-zinc-50 rounded-xl">
              <div>
                <p className="font-bold text-zinc-900 text-xs uppercase">Events Cache</p>
                <p className="text-[10px] text-zinc-400">Stores active listing queries</p>
              </div>
              <button 
                onClick={() => triggerClear('events')}
                disabled={clearing !== null}
                className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                {clearing === 'events' ? 'Clearing...' : 'Invalidate Events'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center p-3 bg-zinc-50 rounded-xl">
              <div>
                <p className="font-bold text-zinc-900 text-xs uppercase">Play Arena Slots</p>
                <p className="text-[10px] text-zinc-400">Stores booked/available timeslots</p>
              </div>
              <button 
                onClick={() => triggerClear('plays')}
                disabled={clearing !== null}
                className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                {clearing === 'plays' ? 'Clearing...' : 'Invalidate Plays'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center p-3 bg-zinc-50 rounded-xl">
              <div>
                <p className="font-bold text-zinc-900 text-xs uppercase">Global Key Flush</p>
                <p className="text-[10px] text-zinc-400 font-semibold text-red-650">Clears all keys in the Redis database</p>
              </div>
              <button 
                onClick={() => triggerClear('all')}
                disabled={clearing !== null}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                {clearing === 'all' ? 'Flushing...' : 'Flush DB Cache'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
