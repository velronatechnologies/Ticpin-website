'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, Key } from 'lucide-react';

const mockLogs = [
  { id: 'log-1', orgName: 'Elite Sports Arena', changeType: 'Phone Updated', oldValue: '+91 9000000000', newValue: '+91 9876543210', changedBy: 'admin (system)', time: '2026-06-19 14:02:18' },
  { id: 'log-2', orgName: 'Sunburn Arena Guide', changeType: 'Email Updated', oldValue: 'info@sunburn.in', newValue: 'events@sunburn.in', changedBy: 'organizer (self)', time: '2026-06-19 15:43:55' },
  { id: 'log-3', orgName: 'PlayOn Football Turf', changeType: 'PAN Updated', oldValue: 'AAAPB1234Z', newValue: 'AAAPB9999Z', changedBy: 'admin (support)', time: '2026-06-20 09:12:04' },
];

export default function CredentialLogsPanel() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Credential & Security Logs</h1>
        <p className="text-zinc-500 text-sm">Security audit logs tracking all critical modifications to organizer logins, emails, phones, and bank details.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-zinc-500" />
          <span className="font-semibold text-zinc-700 text-sm">Organizer Security Event Stream</span>
        </div>
        <div className="divide-y divide-zinc-100">
          {mockLogs.map(l => (
            <div key={l.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-zinc-50/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 text-sm">{l.orgName}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700">
                    <Key className="w-3 h-3" /> {l.changeType}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Changed from <span className="font-mono text-zinc-700">{l.oldValue}</span> to <span className="font-mono text-zinc-700">{l.newValue}</span>
                </p>
              </div>
              <div className="text-right text-xs text-zinc-400">
                <p>By: <span className="font-semibold text-zinc-600">{l.changedBy}</span></p>
                <p className="mt-1">{l.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
