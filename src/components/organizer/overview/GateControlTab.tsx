'use client';

import React from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { BookingData, Verifier } from './types';

interface GateControlTabProps {
  bookings: BookingData[];
  liveStats: { totalBooked: number; totalCheckedIn: number; cancelledTickets: number };
  newVerifierPhone: string;
  setNewVerifierPhone: (val: string) => void;
  newVerifierGate: string;
  setNewVerifierGate: (val: string) => void;
  verifierError: string;
  verifierSuccess: string;
  handleAddVerifier: (e: React.FormEvent) => Promise<void>;
  loadingVerifiers: boolean;
  verifiers: Verifier[];
  handleDeleteVerifier: (phone: string) => Promise<void>;
}

export default function GateControlTab({
  bookings,
  liveStats,
  newVerifierPhone,
  setNewVerifierPhone,
  newVerifierGate,
  setNewVerifierGate,
  verifierError,
  verifierSuccess,
  handleAddVerifier,
  loadingVerifiers,
  verifiers,
  handleDeleteVerifier
}: GateControlTabProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-semibold text-black">Gate & Entry Control</h1>
        <p className="text-zinc-500 mt-1">Configure bouncers, gate staff and monitor entry progress.</p>
      </div>

      {/* Check in Stats */}
      <div className="bg-white rounded-2xl p-6 border border-[#aeaeae] shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-black">Live Check-in Progress</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-zinc-50 rounded-xl">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Booked</p>
            <p className="text-2xl font-bold text-black mt-1">{liveStats.totalBooked || bookings.length}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl">
            <p className="text-emerald-800 text-xs font-bold uppercase tracking-wider">Checked-In</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {liveStats.totalCheckedIn || bookings.filter(b => b.status === 'checked_in').length}
            </p>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl">
            <p className="text-rose-800 text-xs font-bold uppercase tracking-wider">Cancelled</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">
              {liveStats.cancelledTickets || bookings.filter(b => b.status === 'cancelled').length}
            </p>
          </div>
        </div>
      </div>

      {/* Add Verifier form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white rounded-2xl p-6 border border-[#aeaeae] shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <UserPlus size={20} className="text-[#5331EA]" /> Register Gate Staff
          </h3>
          
          <form onSubmit={handleAddVerifier} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500">Bouncer/Staff Mobile</label>
              <input
                type="tel"
                value={newVerifierPhone}
                onChange={(e) => setNewVerifierPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full h-[48px] px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#5331EA] text-black"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500">Gate Name / Point</label>
              <input
                type="text"
                value={newVerifierGate}
                onChange={(e) => setNewVerifierGate(e.target.value)}
                placeholder="e.g. Gate 1, VIP Entry"
                className="w-full h-[48px] px-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#5331EA] text-black"
              />
            </div>

            {verifierError && (
              <p className="text-sm font-semibold text-red-500">{verifierError}</p>
            )}
            {verifierSuccess && (
              <p className="text-sm font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">{verifierSuccess}</p>
            )}

            <button
              type="submit"
              className="w-full h-[48px] bg-black hover:bg-zinc-900 text-white rounded-xl font-medium transition-all shadow-sm"
            >
              Generate Staff Password Key
            </button>
          </form>
        </div>

        {/* Verifier List */}
        <div className="bg-white rounded-2xl p-6 border border-[#aeaeae] shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-black">Active Staff Register</h3>
          
          {loadingVerifiers ? (
            <p className="text-zinc-500 text-center py-6">Loading staff list...</p>
          ) : verifiers.length === 0 ? (
            <p className="text-zinc-400 text-center py-6">No gate staff registered yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {verifiers.map((v, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-black">{v.phone}</p>
                    <p className="text-xs text-zinc-400">Assigned Gate: {v.gate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {v.password && (
                      <span className="font-mono text-sm bg-zinc-100 px-2 py-1 rounded text-zinc-700">
                        Key: {v.password}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteVerifier(v.phone)}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
