'use client';

import React, { useState } from 'react';
import { Check, X, FileText, Image as ImageIcon, ExternalLink, Shield } from 'lucide-react';

const mockKycRequests = [
  { 
    id: 'kyc-1', 
    orgName: 'Sunburn Arena Guide', 
    pan: 'ABCDE1234F', 
    panName: 'SUNBURN ENTERTAINMENT', 
    bankAcc: '918273645512', 
    ifsc: 'HDFC0001234', 
    gst: '27ABCDE1234F1Z5', 
    docUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500', 
    status: 'pending' 
  },
  { 
    id: 'kyc-2', 
    orgName: 'Gourmet Catering Group', 
    pan: 'XYZPW9876Q', 
    panName: 'GOURMET CATERERS LLP', 
    bankAcc: '10029384756', 
    ifsc: 'SBIN0000840', 
    gst: '29XYZPW9876Q1ZC', 
    docUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500', 
    status: 'pending' 
  }
];

export default function KYCApprovalsPanel() {
  const [requests, setRequests] = useState(mockKycRequests);
  const [activeRequest, setActiveRequest] = useState<any>(null);

  const handleAction = (id: string, approve: boolean) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setActiveRequest(null);
    alert(approve ? 'KYC Approved Successfully!' : 'KYC Request Rejected.');
  };

  return (
    <div className="flex relative h-full animate-fade-in">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">KYC & Approvals</h1>
          <p className="text-zinc-500 text-sm">Review submitted PAN details, GST registration certificates, and bank account setups for organizer payouts.</p>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-center bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-zinc-800">All caught up!</h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto">There are no pending KYC registration reviews at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map(r => (
              <div 
                key={r.id}
                onClick={() => setActiveRequest(r)}
                className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Pending Approval</span>
                  <h3 className="font-semibold text-zinc-900">{r.orgName}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 mt-2">
                    <p><span className="font-medium text-zinc-700">PAN:</span> {r.pan}</p>
                    <p><span className="font-medium text-zinc-700">IFSC:</span> {r.ifsc}</p>
                    <p><span className="font-medium text-zinc-700">GST:</span> {r.gst || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => handleAction(r.id, true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => handleAction(r.id, false)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide Over Inspect Panel */}
      {activeRequest && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-zinc-200 z-50 p-6 space-y-6 overflow-y-auto transform transition-transform duration-300">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">Verify Documents</h2>
            <button onClick={() => setActiveRequest(null)} className="text-zinc-400 hover:text-zinc-600">Close</button>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-zinc-400 uppercase">PAN Name (Matches Bank)</span>
              <p className="font-semibold text-zinc-900">{activeRequest.panName}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 uppercase">PAN Card Number</span>
              <p className="font-mono text-zinc-800">{activeRequest.pan}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 uppercase">GSTIN Number</span>
              <p className="font-mono text-zinc-800">{activeRequest.gst}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 uppercase">Bank Account Number</span>
              <p className="font-mono text-zinc-800">{activeRequest.bankAcc}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 uppercase">IFSC Code</span>
              <p className="font-mono text-zinc-800">{activeRequest.ifsc}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-zinc-400 uppercase block">PAN Attachment Upload</span>
              <div className="border border-zinc-200 rounded-xl overflow-hidden relative group">
                <img 
                  src={activeRequest.docUrl} 
                  alt="PAN Document Preview"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <a href={activeRequest.docUrl} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-zinc-950 flex items-center gap-1.5 text-xs font-semibold shadow">
                    <ExternalLink className="w-4 h-4" /> Open Fullscreen
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex gap-2">
            <button 
              onClick={() => handleAction(activeRequest.id, true)}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4.5 h-4.5" /> Approve KYC
            </button>
            <button 
              onClick={() => handleAction(activeRequest.id, false)}
              className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-4.5 h-4.5" /> Reject Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
