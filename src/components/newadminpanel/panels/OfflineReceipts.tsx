'use client';

import React, { useState } from 'react';
import { FileText, Download, Check, X } from 'lucide-react';

const mockReceipts = [
  { id: 'REC-901', userName: 'Ramji B', venue: 'Elite Sports Arena', amount: 1200, taxInvoiceNum: 'TX-2026-9021', status: 'Pending Review', notes: 'Manual turf slot booking receipt' },
  { id: 'REC-442', userName: 'Alice Smith', venue: 'Sunburn Arena Guide', amount: 3000, taxInvoiceNum: 'TX-2026-4492', status: 'Approved', notes: 'Bulk student event passes receipt' },
];

export default function OfflineReceiptsPanel() {
  const [receipts, setReceipts] = useState(mockReceipts);

  const handleAction = (id: string, approve: boolean) => {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, status: approve ? 'Approved' : 'Rejected' } : r));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Offline Receipts</h1>
        <p className="text-zinc-500 text-sm">Review manual offline transaction records, verify tax invoice details, and issue digital tickets.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left text-zinc-500">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">Receipt ID</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Linked Venue</th>
              <th className="px-6 py-4">Gross Amount</th>
              <th className="px-6 py-4">Tax Invoice #</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {receipts.map(r => (
              <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-zinc-900 text-xs">{r.id}</td>
                <td className="px-6 py-4 text-zinc-700">{r.userName}</td>
                <td className="px-6 py-4 text-zinc-750">{r.venue}</td>
                <td className="px-6 py-4 text-zinc-900 font-bold">₹{r.amount}</td>
                <td className="px-6 py-4 text-zinc-650 font-mono text-xs">{r.taxInvoiceNum}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    r.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : r.status === 'Rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => alert(`Downloading PDF Invoice: ${r.taxInvoiceNum}`)}
                    className="p-1 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-650 transition-colors inline-flex items-center gap-1 text-xs"
                    title="Download GoFpdf Invoice"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  {r.status === 'Pending Review' && (
                    <>
                      <button 
                        onClick={() => handleAction(r.id, true)}
                        className="p-1 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors inline-flex items-center"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleAction(r.id, false)}
                        className="p-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors inline-flex items-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
