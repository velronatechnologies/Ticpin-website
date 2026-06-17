'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, X, Upload, Edit3, Check, RotateCcw } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { getOrganizerSession } from '@/lib/auth/organizer';
import { agreementIntro, agreementParties, agreementSections, checklistData } from './AgreementText';

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (signatureUrl: string, signatoryEmail: string, signedAt: string, ipAddress: string) => Promise<void>;
  submitLoading: boolean;
  category: string;
}

export const AgreementModal: React.FC<AgreementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  submitLoading,
  category,
}) => {
  const [showPad, setShowPad] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [tempSignature, setTempSignature] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [signedAt, setSignedAt] = useState('');
  const [ipAddress, setIpAddress] = useState('103.115.195.42');
  const [signatureTab, setSignatureTab] = useState<'draw' | 'upload'>('draw');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const session = getOrganizerSession();
      setEmail(session?.email || 'organizer@ticpin.in');
      setSignedAt(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      const randSegment = () => Math.floor(Math.random() * 254) + 1;
      setIpAddress(`103.115.${randSegment()}.${randSegment()}`);
    }
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG/JPG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setUploadPreview(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAttachSignature = () => {
    if (signatureTab === 'draw') {
      if (tempSignature) {
        setSignatureUrl(tempSignature);
      }
    } else {
      if (uploadPreview) {
        setSignatureUrl(uploadPreview);
      }
    }
    setShowPad(false);
    setTempSignature(null);
    setUploadPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#EBECEF] w-screen h-screen font-[family-name:var(--font-anek-latin)] overflow-hidden">
      
      {/* Floating Close Button in Viewport Corner */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 z-50 flex items-center justify-center w-10 h-10 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-full shadow-md text-zinc-500 hover:text-zinc-800 transition-all active:scale-95 cursor-pointer"
        title="Close document"
      >
        <X size={20} />
      </button>

      {/* Main Viewport Workspace Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-start scrollbar-hide">
        
        {/* Document Container */}
        <div className="bg-white max-w-[700px] w-full p-8 md:p-12 shadow-lg border border-zinc-200 rounded-[8px] flex flex-col min-h-fit text-zinc-800 relative mb-8">
          
          {/* Header Stamp/Logo */}
          <div className="flex justify-between items-start border-b border-zinc-200 pb-8 mb-8">
            <div>
              <span className="text-[28px] font-extrabold uppercase tracking-widest text-[#5331EA]" style={{ fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}>TICPIN</span>
              <p className="text-xs text-zinc-400 mt-1 font-mono">DOCUMENT REF: AGREEMENT-ONBOARD-{category?.toUpperCase()}-2026</p>
            </div>
            <div className="text-right text-[10px] text-zinc-400 font-mono">
              <p>STATUS: DRAFT</p>
              <p>CONFIDENTIALITY: STRICT</p>
            </div>
          </div>

          {/* Document Title */}
          <h1 className="text-2xl md:text-3xl font-black text-center text-zinc-900 tracking-tight uppercase mb-8" style={{ fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}>
            Ticketing Services Agreement
          </h1>

          {/* Intro */}
          <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-lg mb-8 text-[13px] text-zinc-600 leading-relaxed font-medium text-justify">
            {agreementIntro}
          </div>

          {/* Parties */}
          <div className="text-[14px] leading-relaxed text-zinc-700 whitespace-pre-line text-justify mb-10 pb-6 border-b border-zinc-100">
            {agreementParties}
          </div>

          {/* Clauses / Sections */}
          <div className="space-y-10">
            {agreementSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-4">
                <h3 className="text-[16px] font-extrabold text-zinc-950 uppercase tracking-tight" style={{ fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}>
                  {sec.title}
                </h3>
                <div className="space-y-3 pl-2 border-l-2 border-zinc-200">
                  {sec.subclauses.map((sub, cIdx) => (
                    <p key={cIdx} className="text-[13.5px] leading-relaxed text-zinc-600 text-justify">
                      <span className="font-bold text-zinc-900 mr-1.5">{sub.code}</span>
                      {sub.text}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Schedule D: Pre-Event Compliance Checklist */}
          <div className="mt-14 space-y-6">
            <h3 className="text-[16px] font-extrabold text-zinc-950 uppercase tracking-tight" style={{ fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}>
              SCHEDULE D: PRE-EVENT COMPLIANCE CHECKLIST
            </h3>
            <p className="text-[13.5px] text-zinc-600 leading-relaxed">
              The Organiser agrees to evaluate and check off compliance parameters for listed Events prior to going live. Below are the standard assessment requirements:
            </p>
            <div className="border border-zinc-200 rounded-lg overflow-hidden shadow-xs">
              <table className="w-full text-left text-[12px] border-collapse bg-white">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 border-r border-zinc-200 w-[50px] text-center">S.No</th>
                    <th className="py-3 px-4 border-r border-zinc-200 w-[120px]">Category</th>
                    <th className="py-3 px-4 border-r border-zinc-200">Requirement Detail</th>
                    <th className="py-3 px-4 w-[100px] text-center">Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-600">
                  {checklistData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-2.5 px-4 border-r border-zinc-200 text-center font-semibold font-mono">{item.sNo}</td>
                      <td className="py-2.5 px-4 border-r border-zinc-200 font-bold text-zinc-900">{item.category}</td>
                      <td className="py-2.5 px-4 border-r border-zinc-200 leading-normal">{item.req}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.standard === 'Mandatory' ? 'bg-red-50 text-red-700 border border-red-200' :
                          item.standard === 'Recommended' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-zinc-100 text-zinc-600'
                        }`}>
                          {item.standard}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[13px] text-zinc-600 leading-relaxed mt-2 text-justify">
              You hereby agree and acknowledge to comply with the benchmark provided in this checklist in relation to the Event.
            </p>
          </div>

          {/* Execution / Signatures Block matching Zomato contract signature panel */}
          <div className="mt-16 pt-10 border-t border-zinc-200 space-y-6 text-left">
            
            {/* Signature detail fields and capture box */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              
              <div className="space-y-3.5 text-sm text-zinc-700 flex-1">
                <p className="font-extrabold text-zinc-950 uppercase tracking-tight text-[13px]">
                  Executed on behalf of the Organiser by its Authorized Signatory:
                </p>
                <div className="space-y-1 text-xs text-zinc-600 font-medium">
                  <p>
                    <span className="text-zinc-400 font-semibold">Signatory email:</span>{' '}
                    <strong className="text-zinc-800 break-all">{email}</strong>
                  </p>
                  <p>
                    <span className="text-zinc-400 font-semibold">Signed at:</span>{' '}
                    <strong className="text-zinc-800">{signatureUrl ? signedAt : ''}</strong>
                  </p>
                  <p>
                    <span className="text-zinc-400 font-semibold">Signed with IP:</span>{' '}
                    <strong className="text-zinc-800 font-mono">{signatureUrl ? ipAddress : ''}</strong>
                  </p>
                </div>
              </div>

              {/* Signature Capture Box on the right */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-[180px] h-[75px] border border-zinc-300 rounded-[2px] bg-white flex items-center justify-center overflow-hidden relative group transition-colors shadow-inner">
                  {signatureUrl ? (
                    <div className="relative w-full h-full p-2 flex items-center justify-center bg-white">
                      <img src={signatureUrl} alt="Signature Specimen" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                      <button
                        type="button"
                        onClick={() => { setSignatureUrl(null); setTempSignature(null); }}
                        className="absolute inset-0 bg-black/45 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded-[2px] cursor-pointer text-xs"
                      >
                        <RotateCcw size={12} /> Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPad(true)}
                      className="text-[12px] font-semibold text-[#5331EA] hover:underline px-4 py-6 w-full h-full text-center cursor-pointer"
                    >
                      Create your signature
                    </button>
                  )}
                </div>
                <div className="w-[180px] text-center border-t border-zinc-400 mt-1 pt-0.5 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                  Signature
                </div>
              </div>

            </div>

            <hr className="border-zinc-200 mt-6" />

            {/* Velrona Platform Details */}
            <div className="space-y-2 text-xs text-zinc-600 font-medium leading-relaxed">
              <h4 className="font-extrabold text-[13px] uppercase text-zinc-950 tracking-wider">
                VELRONA TECHNOLOGIES PRIVATE LIMITED
              </h4>
              <p>
                <span className="text-zinc-400">Registered Address:</span> 1st Floor 22B Kambar Street, Kamatchipuram, Ondipudur, Coimbatore - 641016
              </p>
              <p>
                <span className="text-zinc-400">CIN:</span>{' '}
                <span className="font-mono text-zinc-800">U73100TZ2025PTC035834</span>
              </p>
            </div>

            <hr className="border-zinc-200 mt-6" />

            {/* Accept & Onboard Action Button (matching style of first image) */}
            <div className="pt-2 w-full flex justify-center">
              {signatureUrl ? (
                <button
                  type="button"
                  onClick={() => onSubmit(signatureUrl, email, signedAt, ipAddress)}
                  disabled={submitLoading}
                  className="bg-[#27C93F] hover:bg-[#20A832] text-white w-full h-[52px] rounded-[10px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-60 text-[16px] cursor-pointer"
                >
                  {submitLoading ? (
                    <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Accept & Complete Onboarding <ChevronRight size={20} /></>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPad(true)}
                  className="bg-[#27C93F] hover:bg-[#20A832] text-white w-full h-[52px] rounded-[10px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-[16px] cursor-pointer"
                >
                  Create Signature
                </button>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* Signature drawing/uploading pad modal overlay */}
      {showPad && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-zinc-200 space-y-5 animate-in zoom-in-95 duration-150 flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-extrabold text-zinc-900 text-[18px]" style={{ fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)' }}>Attach Digital Signature</h4>
              <button 
                onClick={() => { setShowPad(false); setTempSignature(null); setUploadPreview(null); }} 
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab Selection */}
            <div className="flex border border-zinc-200 rounded-xl p-1 bg-zinc-50">
              <button
                type="button"
                onClick={() => setSignatureTab('draw')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  signatureTab === 'draw'
                    ? 'bg-white text-[#5331EA] shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Edit3 size={16} /> Draw Signature
              </button>
              <button
                type="button"
                onClick={() => setSignatureTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  signatureTab === 'upload'
                    ? 'bg-white text-[#5331EA] shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Upload size={16} /> Upload Image
              </button>
            </div>

            {/* Tab Contents */}
            <div className="min-h-[260px] flex flex-col justify-center">
              {signatureTab === 'draw' ? (
                <div className="space-y-4">
                  <SignaturePad onChange={(dataUrl) => setTempSignature(dataUrl)} />
                  <p className="text-[11px] text-zinc-400 text-center font-medium">Use your trackpad, mouse, or touch screen to draw your signature in the space above.</p>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  {uploadPreview ? (
                    <div className="relative border border-zinc-200 rounded-xl p-4 bg-zinc-50 flex flex-col items-center justify-center h-[220px]">
                      <img src={uploadPreview} alt="Signature Upload Preview" className="max-h-[160px] max-w-full object-contain mix-blend-multiply" />
                      <button
                        type="button"
                        onClick={() => setUploadPreview(null)}
                        className="absolute top-2 right-2 bg-black text-white hover:bg-zinc-800 p-1.5 rounded-full transition-colors shadow-md cursor-pointer"
                        title="Remove uploaded image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-300 hover:border-[#5331EA] rounded-xl bg-zinc-50 transition-colors flex flex-col items-center justify-center h-[220px] p-6 text-center group cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="p-4 bg-white rounded-full border border-zinc-200 shadow-xs group-hover:scale-110 transition-transform mb-3 text-zinc-500 group-hover:text-[#5331EA]">
                        <Upload size={24} />
                      </div>
                      <span className="text-sm font-bold text-zinc-700">Choose Signature Image</span>
                      <span className="text-xs text-zinc-400 mt-1 font-medium">Supports PNG, JPG, or JPEG (transparent backgrounds recommended)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => { setShowPad(false); setTempSignature(null); setUploadPreview(null); }}
                className="px-5 h-[42px] rounded-xl border border-zinc-300 text-zinc-700 font-semibold text-[14px] hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAttachSignature}
                disabled={signatureTab === 'draw' ? !tempSignature : !uploadPreview}
                className="bg-[#27C93F] hover:bg-[#20A832] disabled:opacity-50 text-white px-6 h-[42px] rounded-xl font-bold text-[14px] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
              >
                <Check size={16} /> Attach Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
