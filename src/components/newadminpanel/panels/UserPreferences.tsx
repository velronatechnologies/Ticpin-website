'use client';

import React from 'react';
import { Heart, Star, Compass, Play } from 'lucide-react';

const mockLikes = [
  { id: 'fav-1', name: 'Elite Sports Arena', category: 'Play', totalLikes: 420, rating: 4.8 },
  { id: 'fav-2', name: 'Gourmet Chinese Restaurant', category: 'Dining', totalLikes: 298, rating: 4.5 },
  { id: 'fav-3', name: 'Sunburn Arena Guide', category: 'Events', totalLikes: 890, rating: 4.9 },
  { id: 'fav-4', name: 'PlayOn Football Turf', category: 'Play', totalLikes: 154, rating: 4.2 },
];

export default function UserPreferencesPanel() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">User Preferences</h1>
        <p className="text-zinc-500 text-sm">Aggregated view of platform-wide user engagement, listing most saved turfs, restaurants, and event guides.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Liked Venues */}
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            <h3 className="font-semibold text-zinc-900">Popular Venues (Saved count)</h3>
          </div>
          <div className="space-y-3">
            {mockLikes.map(l => (
              <div key={l.id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-zinc-800">{l.name}</p>
                  <span className="text-xs text-zinc-400">{l.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-zinc-900">{l.totalLikes} saves</p>
                  <div className="flex items-center justify-end text-xs text-amber-500 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-current" /> {l.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Search Metrics */}
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Compass className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-zinc-900">Trending Category Search Terms</h3>
          </div>
          <div className="space-y-3 text-sm text-zinc-700">
            <div className="flex justify-between items-center">
              <span>1. Football Turf Booking</span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">1,248 queries</span>
            </div>
            <div className="flex justify-between items-center">
              <span>2. Dinner buffet offers</span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">982 queries</span>
            </div>
            <div className="flex justify-between items-center">
              <span>3. Live Concert tickets</span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">894 queries</span>
            </div>
            <div className="flex justify-between items-center">
              <span>4. Badminton courts near me</span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">720 queries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
