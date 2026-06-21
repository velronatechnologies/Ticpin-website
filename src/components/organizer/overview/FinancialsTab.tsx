'use client';
import React, { useState, useEffect } from 'react';
import { IndianRupee, ArrowRight, CheckCircle2, AlertCircle, Clock, Check, X } from 'lucide-react';
import { BookingData } from './types';

interface FinancialsTabProps {
  bookings: BookingData[];
  selectedBookings: string[];
  setSelectedBookings: React.Dispatch<React.SetStateAction<string[]>>;
  triggeringPayout: boolean;
  payoutMessage: string;
  handleTriggerPayout: () => Promise<void>;
}

export default function FinancialsTab({
  bookings,
  selectedBookings,
  setSelectedBookings,
  triggeringPayout,
  payoutMessage,
  handleTriggerPayout
}: FinancialsTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [previousDeposit, setPreviousDeposit] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    let available = 0;
    let previous = 0;
    bookings.forEach(b => {
      if (b.payout_status === 'none' || !b.payout_status) {
        available += b.net_payout || (b.grand_total * 0.95);
      }
      if (b.payout_status === 'approved') {
        previous += b.net_payout || (b.grand_total * 0.95);
      }
    });
    setAvailableBalance(available);
    setPreviousDeposit(previous);
  }, [bookings]);

  const onEnableNow = async () => {
    await handleTriggerPayout();
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-[family-name:var(--font-inter)]">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payouts</h1>
        <p className="text-sm text-slate-500 mt-1">Review your settlement balances and trigger instant payouts.</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Settlement ending</p>
          <p className="mt-1 opacity-90">Domestic payments will settle after 2 days. International payments will settle after 7 days.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Available Balance Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Available Balance</h3>
            <div className="mt-2 text-3xl font-bold text-slate-800">₹ {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-slate-400 mt-1">As of {new Date().toLocaleDateString()}</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            disabled={availableBalance === 0 || triggeringPayout}
            className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Get instant settlement
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Total Settlement Today Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Settlement Today</h3>
          <div className="mt-2 text-3xl font-bold text-slate-800">₹ 0.00</div>
          <p className="text-xs text-slate-400 mt-1">To be deposited before 9:00 PM</p>
        </div>

        {/* Previous Settlement Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Previous Settlement</h3>
          <div className="mt-2 text-3xl font-bold text-emerald-600">₹ {previousDeposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <p className="text-xs text-slate-400 mt-1">Successfully deposited to your bank account.</p>
        </div>
      </div>

      {payoutMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={18} />
          {payoutMessage}
        </div>
      )}

      {/* Settlements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="border-b border-slate-200">
          <div className="flex gap-6 px-6 pt-4">
            <button className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-3">Settlements</button>
            <button className="text-sm font-semibold text-slate-500 hover:text-slate-700 pb-3">Ondemand Settlements</button>
          </div>
        </div>
        
        <div className="p-4 border-b border-slate-100 flex items-center gap-6 overflow-x-auto text-sm font-medium text-slate-600">
          {['All', 'Created', 'Processed', 'Failed', 'Initiated'].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? "px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-semibold" : "px-3 py-1 hover:text-slate-800"}
            >
              {filter}
            </button>
          ))}
        </div>

        {bookings.filter(b => {
          if (activeFilter === 'All') return true;
          if (activeFilter === 'Created') return b.payout_status === 'pending_approval';
          if (activeFilter === 'Processed') return b.payout_status === 'approved';
          if (activeFilter === 'Failed') return b.payout_status === 'rejected';
          if (activeFilter === 'Initiated') return b.payout_status === 'none' || !b.payout_status;
          return true;
        }).length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-medium whitespace-nowrap">Created on</th>
                  <th className="px-6 py-3 font-medium whitespace-nowrap">Settlement ID</th>
                  <th className="px-6 py-3 font-medium whitespace-nowrap">UTR number</th>
                  <th className="px-6 py-3 font-medium text-right whitespace-nowrap">Net settlement</th>
                  <th className="px-6 py-3 font-medium whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.filter(b => {
                  if (activeFilter === 'All') return true;
                  if (activeFilter === 'Created') return b.payout_status === 'pending_approval';
                  if (activeFilter === 'Processed') return b.payout_status === 'approved';
                  if (activeFilter === 'Failed') return b.payout_status === 'rejected';
                  if (activeFilter === 'Initiated') return b.payout_status === 'none' || !b.payout_status;
                  return true;
                }).map((b) => {
                  const isProcessed = b.payout_status === 'approved';
                  const isFailed = b.payout_status === 'rejected';
                  const isCreated = b.payout_status === 'pending_approval';
                  
                  const mappedStatus = isProcessed ? 'Processed' : isFailed ? 'Failed' : isCreated ? 'Created' : 'Available';
                  
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {new Date(b.booked_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                      </td>
                      <td className="px-6 py-4 font-medium text-blue-600 cursor-pointer hover:underline whitespace-nowrap">
                        {b.settlement_id ? b.settlement_id : `setl_${b.booking_id.toLowerCase().slice(-8)}`}
                      </td>
                      <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                        {b.utr_number ? b.utr_number : (isProcessed ? 'Processing...' : '-')}
                      </td>
                      <td className="px-6 py-4 text-right font-medium whitespace-nowrap">
                        ₹{(b.net_payout || b.grand_total * 0.95).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 font-medium
                          ${isProcessed ? 'text-emerald-600' : 
                            isFailed ? 'text-red-600' : 
                            isCreated ? 'text-amber-600' :
                            'text-slate-600'}`}>
                          {isProcessed && <CheckCircle2 size={14} className="text-emerald-500 fill-emerald-100" />}
                          {isFailed && <X size={14} className="bg-red-100 rounded-full text-red-600 p-0.5" />}
                          {isCreated && <Clock size={14} className="text-amber-500" />}
                          {mappedStatus}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settlement Cycle Change Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Review settlement cycle change</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <p>You are opting in for instant settlements. By enabling this, all available payments will be settled immediately to your linked bank account.</p>
              
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Fee Structure</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-600">
                  <span>Fee per payment</span>
                  <span>1.0%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST</span>
                  <span>0.5%</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800">
                  <span>Total fee (incl. GST)</span>
                  <span>1.5%</span>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500">I agree to the revised pricing for instant settlements.</p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={onEnableNow}
                disabled={triggeringPayout}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {triggeringPayout ? 'Processing...' : 'Enable Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
