'use client';

import React, { useState } from 'react';
import { DollarSign, ShieldAlert, CheckCircle2 } from 'lucide-react';

const mockPayouts = [
  { id: 'pay-1', orgName: 'Elite Sports Arena', pendingBookingsCount: 14, grossAmount: 16800, bankAcc: '918273645512', ifsc: 'HDFC0001234' },
  { id: 'pay-2', orgName: 'Grand Hyatt Dining', pendingBookingsCount: 8, grossAmount: 28000, bankAcc: '10029384756', ifsc: 'SBIN0000840' },
];

export default function PayoutSettlementsPanel() {
  const [payouts, setPayouts] = useState(mockPayouts);

  const processSettlement = (id: string, orgName: string, netPayout: number) => {
    setPayouts(prev => prev.filter(p => p.id !== id));
    alert(`Settled payout for ${orgName}. Net Amount: ₹${netPayout.toFixed(2)} transfer initiated to linked bank account!`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Payout Settlements</h1>
        <p className="text-zinc-500 text-sm">Review pending bookings, calculate the platform's 5% commission, and mark settlements as paid.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {payouts.length === 0 ? (
          <div className="p-8 text-center bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-zinc-800">All Payouts Settled</h3>
            <p className="text-zinc-500 text-sm">There are no pending organizer payouts left to process.</p>
          </div>
        ) : (
          payouts.map(p => {
            const commission = p.grossAmount * 0.05;
            const netPayout = p.grossAmount - commission;

            return (
              <div key={p.id} className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-zinc-900 text-lg">{p.orgName}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Acc: {p.bankAcc} | IFSC: {p.ifsc}</p>
                  </div>
                  <button 
                    onClick={() => processSettlement(p.id, p.orgName, netPayout)}
                    className="w-full md:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    Approve & Payout ₹{netPayout.toLocaleString('en-IN')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 text-sm">
                  <div>
                    <span className="text-zinc-400 text-xs">Unsettled Bookings</span>
                    <p className="font-bold text-zinc-800 mt-0.5">{p.pendingBookingsCount} Bookings</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-xs">Gross Revenue</span>
                    <p className="font-bold text-zinc-800 mt-0.5">₹{p.grossAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-xs">Platform Commission (5%)</span>
                    <p className="font-bold text-amber-600 mt-0.5">₹{commission.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-xs font-semibold text-emerald-600">Net Payable Amount</span>
                    <p className="font-bold text-emerald-600 mt-0.5 text-base">₹{netPayout.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
