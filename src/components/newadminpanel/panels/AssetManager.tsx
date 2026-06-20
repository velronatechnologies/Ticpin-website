'use client';

import React, { useState } from 'react';
import { Eye, ExternalLink, Image as ImageIcon, Video, Trash } from 'lucide-react';

const mockAssets = [
  { id: 'ast-1', name: 'elite_sports_banner.jpg', type: 'image', size: '242 KB', url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500', date: '2026-06-20' },
  { id: 'ast-2', name: 'concert_teaser.mp4', type: 'video', size: '14.2 MB', url: '#', date: '2026-06-19' },
  { id: 'ast-3', name: 'gourmet_hyatt_dish.jpg', type: 'image', size: '124 KB', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500', date: '2026-06-20' },
];

export default function AssetManagerPanel() {
  const [assets, setAssets] = useState(mockAssets);

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Asset Manager</h1>
        <p className="text-zinc-500 text-sm">Review uploaded images and multimedia promotional banners hosted on Cloudinary or local CDNs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assets.map(a => (
          <div key={a.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            {a.type === 'image' ? (
              <div className="h-40 relative group overflow-hidden bg-zinc-100">
                <img src={a.url} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <a href={a.url} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-zinc-950 flex items-center gap-1 text-xs font-semibold shadow">
                    <ExternalLink className="w-4 h-4" /> Full View
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-40 bg-zinc-950 flex items-center justify-center text-zinc-400">
                <div className="text-center">
                  <Video className="w-10 h-10 mx-auto text-zinc-650" />
                  <span className="text-[10px] mt-1 block">Video Teaser File</span>
                </div>
              </div>
            )}

            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-zinc-900 text-sm truncate max-w-[80%]" title={a.name}>
                  {a.name}
                </h3>
                <span className="text-[10px] text-zinc-400 font-mono">{a.size}</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-xs text-zinc-400">
                <span>Uploaded: {a.date}</span>
                <button 
                  onClick={() => deleteAsset(a.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 border border-red-100 rounded-lg transition-colors"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
