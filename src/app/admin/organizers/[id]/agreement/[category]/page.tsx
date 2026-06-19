'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    FileText, AlertTriangle, CheckCircle, Clock, ExternalLink,
    ArrowLeft, RefreshCw, ShieldCheck, User, Calendar, Globe,
    Download, Eye, EyeOff,
} from 'lucide-react';
import { getOrganizerSession } from '@/lib/auth/organizer';

interface SetupData {
    id: string;
    category: string;
    signature?: string;
    signatoryEmail?: string;
    signedAt?: string;
    signedIP?: string;
    agreementPdfUrl?: string;
    orgType?: string;
    pan?: string;
    panName?: string;
}

interface OrganizerData {
    id: string;
    email: string;
    name?: string;
}

export default function AgreementViewerPage() {
    const params = useParams();
    const router = useRouter();
    const organizerId = params.id as string;
    const category = params.category as string;

    const [organizer, setOrganizer] = useState<OrganizerData | null>(null);
    const [setup, setSetup] = useState<SetupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPDF, setShowPDF] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfSrc, setPdfSrc] = useState('');
    const [authChecked, setAuthChecked] = useState(false);

    // Auth guard — admin only
    useEffect(() => {
        const session = getOrganizerSession();
        if (!session?.isAdmin) {
            router.replace('/list-your-events/Login');
            return;
        }
        setAuthChecked(true);
    }, [router]);

    useEffect(() => {
        if (!authChecked || !organizerId || !category) return;
        loadData();
    }, [authChecked, organizerId, category]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/backend/api/admin/organizers/${organizerId}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to load organizer');
            const data = await res.json();

            setOrganizer(data.organizer || data);

            const matchedSetup = (data.setups || []).find(
                (s: SetupData) => s.category.toLowerCase() === category.toLowerCase()
            );
            setSetup(matchedSetup || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const openAgreementPDF = async () => {
        setPdfLoading(true);
        setShowPDF(false);

        // If a Cloudinary URL is stored, open it directly
        if (setup?.agreementPdfUrl) {
            window.open(setup.agreementPdfUrl, '_blank', 'noopener,noreferrer');
            setPdfLoading(false);
            return;
        }

        // Otherwise use the backend generate-on-demand endpoint (streams PDF bytes)
        const url = `/backend/api/admin/organizers/${organizerId}/agreement/${category}`;
        setPdfSrc(url);
        setShowPDF(true);
        setPdfLoading(false);
    };

    const downloadPDF = () => {
        const url = setup?.agreementPdfUrl
            || `/backend/api/admin/organizers/${organizerId}/agreement/${category}`;
        const a = document.createElement('a');
        a.href = url;
        a.download = `agreement_${organizerId}_${category}.pdf`;
        a.target = '_blank';
        a.click();
    };

    const formatDate = (iso?: string) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
        });
    };

    if (!authChecked) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F0FF] flex items-center justify-center">
                <RefreshCw className="animate-spin text-[#AC9BF7]" size={48} />
            </div>
        );
    }

    if (error && !organizer) {
        return (
            <div className="min-h-screen bg-[#F3F0FF] flex items-center justify-center">
                <div className="text-center bg-white rounded-3xl p-12 shadow-sm">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/admin/organizers')}
                        className="px-6 py-3 bg-[#5331EA] text-white rounded-2xl font-bold hover:bg-[#4020C9] transition-all"
                    >
                        ← Back to Organizers
                    </button>
                </div>
            </div>
        );
    }

    const isSigned = !!setup?.signature;
    const hasStoredPDF = !!setup?.agreementPdfUrl;

    return (
        <div className="min-h-screen bg-[#F3F0FF] py-10" style={{ zoom: 0.9 }}>
            <div className="max-w-4xl mx-auto px-6">

                {/* ── Header ── */}
                <div className="bg-white rounded-[32px] shadow-sm p-8 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/admin/organizers')}
                                className="p-2 hover:bg-[#EEEDFC] rounded-full transition-colors"
                            >
                                <ArrowLeft size={28} />
                            </button>
                            <div>
                                <h1 className="text-[28px] font-bold text-black flex items-center gap-3"
                                    style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                    <FileText className="text-[#5331EA]" size={28} />
                                    Agreement Document
                                </h1>
                                <p className="text-[15px] text-[#686868] mt-1">
                                    <span className="font-bold text-black capitalize">{category}</span> category
                                    &nbsp;·&nbsp;
                                    <span className="font-mono text-sm">{organizer?.email}</span>
                                </p>
                            </div>
                        </div>

                        {/* Status badge */}
                        {isSigned ? (
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-[#D1FAE5] rounded-2xl border-2 border-green-200">
                                <CheckCircle size={18} className="text-green-600" />
                                <span className="text-[14px] font-bold text-green-700 uppercase tracking-wider">Signed</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-[#FFF3CD] rounded-2xl border-2 border-yellow-200">
                                <Clock size={18} className="text-yellow-600" />
                                <span className="text-[14px] font-bold text-yellow-700 uppercase tracking-wider">Not Signed</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Setup Not Found ── */}
                {!setup && (
                    <div className="bg-white rounded-[32px] p-16 flex flex-col items-center text-center shadow-sm">
                        <div className="w-20 h-20 bg-[#EEEDFC] rounded-full flex items-center justify-center mb-6">
                            <FileText size={40} className="text-[#AC9BF7] opacity-50" />
                        </div>
                        <p className="text-[22px] font-bold text-black">No Setup Found</p>
                        <p className="text-[15px] text-[#686868] mt-2 max-w-sm">
                            This organizer has not submitted a{' '}
                            <span className="font-bold text-[#5331EA] capitalize">{category}</span>{' '}
                            application yet.
                        </p>
                    </div>
                )}

                {setup && (
                    <>
                        {/* ── Signatory Details ── */}
                        <div className="bg-white rounded-[32px] shadow-sm p-8 mb-6">
                            <h2 className="text-[18px] font-bold text-black mb-6 uppercase tracking-wider">
                                Signatory Details
                            </h2>

                            {!isSigned ? (
                                <div className="flex items-center gap-3 p-5 bg-[#FFF9EC] border-2 border-yellow-200 rounded-2xl">
                                    <AlertTriangle size={22} className="text-yellow-500 flex-shrink-0" />
                                    <p className="text-[15px] text-yellow-800 font-semibold">
                                        This organizer has not signed the agreement yet.
                                        The agreement will be generated once they complete the onboarding process.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        {
                                            icon: <User size={18} className="text-[#5331EA]" />,
                                            label: 'Signatory Email',
                                            value: setup.signatoryEmail || organizer?.email || '—',
                                        },
                                        {
                                            icon: <Calendar size={18} className="text-[#5331EA]" />,
                                            label: 'Signed At',
                                            value: formatDate(setup.signedAt),
                                        },
                                        {
                                            icon: <Globe size={18} className="text-[#5331EA]" />,
                                            label: 'IP Address',
                                            value: setup.signedIP || '—',
                                        },
                                        {
                                            icon: <ShieldCheck size={18} className="text-[#5331EA]" />,
                                            label: 'Storage',
                                            value: hasStoredPDF ? 'Cloudinary (Permanent)' : 'Generated on demand',
                                        },
                                    ].map((item, i) => (
                                        <div key={i} className="flex flex-col gap-1 border-b border-[#EEEDFC] pb-4">
                                            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#686868] uppercase tracking-wider">
                                                {item.icon}
                                                {item.label}
                                            </div>
                                            <span className="text-[16px] font-bold text-black break-all">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Actions ── */}
                        {isSigned && (
                            <div className="bg-white rounded-[32px] shadow-sm p-8 mb-6">
                                <h2 className="text-[18px] font-bold text-black mb-6 uppercase tracking-wider">
                                    Document Actions
                                </h2>

                                <div className="flex flex-wrap gap-4">
                                    {/* View / Open PDF */}
                                    <button
                                        onClick={openAgreementPDF}
                                        disabled={pdfLoading}
                                        className="flex items-center gap-3 px-8 py-4 bg-[#5331EA] text-white rounded-2xl font-bold text-[16px] hover:bg-[#4020C9] transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {pdfLoading ? (
                                            <RefreshCw size={20} className="animate-spin" />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                        {hasStoredPDF ? 'Open Stored PDF' : 'View Agreement PDF'}
                                    </button>

                                    {/* Inline preview toggle (only for stream endpoint) */}
                                    {!hasStoredPDF && (
                                        <button
                                            onClick={() => {
                                                if (showPDF) {
                                                    setShowPDF(false);
                                                } else {
                                                    setPdfSrc(`/backend/api/admin/organizers/${organizerId}/agreement/${category}`);
                                                    setShowPDF(true);
                                                }
                                            }}
                                            className="flex items-center gap-3 px-8 py-4 bg-[#EEEDFC] text-[#5331EA] rounded-2xl font-bold text-[16px] hover:bg-[#E0DCFC] transition-all"
                                        >
                                            {showPDF ? <EyeOff size={20} /> : <Eye size={20} />}
                                            {showPDF ? 'Hide Preview' : 'Inline Preview'}
                                        </button>
                                    )}

                                    {/* Download */}
                                    <button
                                        onClick={downloadPDF}
                                        className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-[#AC9BF7] text-[#5331EA] rounded-2xl font-bold text-[16px] hover:bg-[#EEEDFC] transition-all"
                                    >
                                        <Download size={20} />
                                        Download PDF
                                    </button>
                                </div>

                                {/* Cloudinary URL indicator */}
                                {hasStoredPDF && (
                                    <div className="mt-6 p-4 bg-[#D1FAE5] border border-green-200 rounded-2xl flex items-start gap-3">
                                        <ShieldCheck size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[14px] font-bold text-green-800">
                                                Permanently stored on Cloudinary
                                            </p>
                                            <p className="text-[13px] text-green-700 mt-0.5 break-all">
                                                {setup.agreementPdfUrl}
                                            </p>
                                            <a
                                                href={setup.agreementPdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 mt-2 text-[13px] font-bold text-green-700 underline underline-offset-2 hover:text-green-900"
                                            >
                                                <ExternalLink size={14} />
                                                Open direct link
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Inline PDF Preview ── */}
                        {showPDF && pdfSrc && (
                            <div className="bg-white rounded-[32px] shadow-sm p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-[18px] font-bold text-black uppercase tracking-wider">
                                        Agreement Preview
                                    </h2>
                                    <button
                                        onClick={() => setShowPDF(false)}
                                        className="p-2 hover:bg-[#EEEDFC] rounded-full transition-colors"
                                    >
                                        <EyeOff size={20} className="text-[#686868]" />
                                    </button>
                                </div>

                                <div className="border-2 border-[#EEEDFC] rounded-2xl overflow-hidden">
                                    <iframe
                                        src={pdfSrc}
                                        title={`Agreement PDF — ${category}`}
                                        className="w-full"
                                        style={{ height: '75vh' }}
                                    />
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-[13px] text-[#686868]">
                                    <ShieldCheck size={16} className="text-[#5331EA]" />
                                    <span>Admin-only view. Do not share this URL.</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
