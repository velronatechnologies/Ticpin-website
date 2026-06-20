'use client';

import React, { useState } from 'react';
import { Send, Bell, User, Users } from 'lucide-react';

const mockBroadcasts = [
  { id: 'not-1', title: 'Monsoon Turf Tournaments Active!', targetType: 'all_users', sentAt: '2026-06-20 12:00', status: 'Sent' },
  { id: 'not-2', title: 'Action Required: Verify KYC bank details', targetType: 'all_organizers', sentAt: '2026-06-19 15:30', status: 'Sent' },
];

export default function PushNotificationsPanel() {
  const [broadcasts, setBroadcasts] = useState(mockBroadcasts);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState('all_users');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setLoading(true);
    setTimeout(() => {
      const newBroadcast = {
        id: `not-${Date.now()}`,
        title,
        targetType,
        sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Sent'
      };

      setBroadcasts([newBroadcast, ...broadcasts]);
      setTitle('');
      setBody('');
      setLoading(false);
      alert('Broadcast Notification Dispatched Successfully!');
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Send form */}
      <div className="lg:col-span-2 p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Compose Broadcast Notification</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Send a real-time push notification or system alert to platform users.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Target Audience</label>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setTargetType('all_users')}
                className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 font-semibold text-xs transition-colors ${
                  targetType === 'all_users' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-zinc-200 text-zinc-650 hover:bg-zinc-50'
                }`}
              >
                <Users className="w-4 h-4" /> All Users
              </button>
              <button 
                type="button" 
                onClick={() => setTargetType('all_organizers')}
                className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 font-semibold text-xs transition-colors ${
                  targetType === 'all_organizers' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-zinc-200 text-zinc-650 hover:bg-zinc-50'
                }`}
              >
                <User className="w-4 h-4" /> All Organizers
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Notification Title</label>
            <input 
              type="text" 
              placeholder="e.g. Monsoon Tournament registrations are open!"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Alert message body</label>
            <textarea 
              rows={4}
              placeholder="Provide clean markdown details about the push alert or voucher rules..."
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Broadcasting...' : 'Broadcast Message Now'}
          </button>
        </form>
      </div>

      {/* History panel */}
      <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Broadcast History</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Logs of recent platform announcements dispatched.</p>
        </div>

        <div className="divide-y divide-zinc-100">
          {broadcasts.map(b => (
            <div key={b.id} className="py-3 space-y-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-zinc-800 text-sm line-clamp-1">{b.title}</h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">{b.status}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{b.targetType === 'all_users' ? 'All Users' : 'All Organizers'}</span>
                <span>{b.sentAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
