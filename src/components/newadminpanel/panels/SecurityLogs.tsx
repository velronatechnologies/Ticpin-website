'use client';

import React from 'react';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';

const mockLogs = [
  { id: 'log-1', action: 'ADMIN_LOGIN_SUCCESS', details: 'Admin login from 192.168.1.1', status: 'success', time: '2026-06-20 23:22:15' },
  { id: 'log-2', action: 'ORGANIZER_DELETE_PLAY', details: 'Deleted Play Turf id ply-4', status: 'success', time: '2026-06-20 23:01:40' },
  { id: 'log-3', action: 'RATE_LIMIT_BLOCK', details: 'Blocked OTP spam attempts from IP: 14.139.128.2', status: 'blocked', time: '2026-06-20 22:50:12' },
  { id: 'log-4', action: 'INVALID_WEBHOOK_SIGNATURE', details: 'Rejected fake Razorpay webhook trigger', status: 'failure', time: '2026-06-20 22:12:04' },
];

export default function SecurityLogsPanel() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Security Audit Logs</h1>
        <p className="text-zinc-500 text-sm">Immutable security audit trails monitoring API authorization events, admin creations, and blocked IP traffic.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left text-zinc-500">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">Event Type</th>
              <th className="px-6 py-4">Event Details</th>
              <th className="px-6 py-4">Security Level</th>
              <th className="px-6 py-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {mockLogs.map(l => (
              <tr key={l.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-zinc-950 text-xs">
                  {l.action}
                </td>
                <td className="px-6 py-4 text-zinc-700">{l.details}</td>
                <td className="px-6 py-4">
                  {l.status === 'success' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                      <CheckCircle className="w-3.5 h-3.5" /> Normal
                    </span>
                  ) : l.status === 'blocked' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700">
                      <AlertCircle className="w-3.5 h-3.5" /> Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700">
                      <AlertCircle className="w-3.5 h-3.5" /> Critical Fail
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{l.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
