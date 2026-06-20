'use client';

import React from 'react';
import { FileText, Download, Eye, FileCheck, HelpCircle } from 'lucide-react';

const mockAgreements = [
  { id: 'agr-1', orgName: 'Elite Sports Arena', version: 'v1.4', status: 'Signed', signedAt: '2026-04-12', docType: 'Standard Turf Agreement' },
  { id: 'agr-2', orgName: 'Grand Hyatt Dining', version: 'v2.0', status: 'Signed', signedAt: '2026-05-02', docType: 'Restaurant Partnership Contract' },
  { id: 'agr-3', orgName: 'Sunburn Arena Guide', version: 'v1.1', status: 'Draft Sent', signedAt: 'Pending Signature', docType: 'Ticketing Service Agreement' },
];

export default function AgreementsPanel() {
  const triggerDownload = (name: string) => {
    alert(`Downloading Agreement PDF for: ${name}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Agreements & Contracts</h1>
          <p className="text-zinc-500 text-sm">Download or review the generated PDF agreements for all active vendor partnerships.</p>
        </div>
        <button 
          onClick={() => alert('Generating new contract template...')}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition-colors shadow-sm"
        >
          Draft New Agreement
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left text-zinc-500">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">Organizer</th>
              <th className="px-6 py-4">Contract Type</th>
              <th className="px-6 py-4">Version</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Signed/Sent Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {mockAgreements.map(a => (
              <tr key={a.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-zinc-900">{a.orgName}</td>
                <td className="px-6 py-4 text-zinc-700">{a.docType}</td>
                <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{a.version}</td>
                <td className="px-6 py-4">
                  {a.status === 'Signed' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      <FileCheck className="w-3.5 h-3.5" /> {a.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                      <HelpCircle className="w-3.5 h-3.5" /> {a.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-zinc-400">{a.signedAt}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => alert('Viewing document layout editor...')}
                    className="p-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => triggerDownload(a.orgName)}
                    className="p-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
