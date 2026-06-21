'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  User,
  ChevronDown,
  Trash2,
  DoorOpen,
  Edit,
  Users,
  Gauge,
  ClipboardList,
  ShieldAlert,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  CheckCircle
} from 'lucide-react';
import { BookingData, Verifier, Gate } from './types';

interface GateControlTabProps {
  bookings: BookingData[];
  liveStats: { totalBooked: number; totalCheckedIn: number; cancelledTickets: number };
  newVerifierName: string;
  setNewVerifierName: (val: string) => void;
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
  handleUpdateVerifier: (originalPhone: string, newPhone: string, name: string, gate: string) => Promise<void>;
  gates: Gate[];
  newGateName: string;
  setNewGateName: (val: string) => void;
  handleCreateGate: (e: React.FormEvent) => Promise<void>;
  handleDeleteGate: (id: string) => Promise<void>;
  loadingGates: boolean;
}

interface GateLog {
  id: string;
  time: string;
  subtext: string;
  user: string;
  userId: string;
  event: string;
  staff: string;
  gate: string;
  status: string;
  detail: string;
  imageBg: string;
  check_in_time_str?: string;
  check_out_time_str?: string;
}

interface FlowIssue {
  id: string;
  user: string;
  event: string;
  reason: string;
  assignedVerifier: string;
  action: string;
  imageBg: string;
}

export default function GateControlTab({
  bookings,
  liveStats,
  newVerifierName,
  setNewVerifierName,
  newVerifierPhone,
  setNewVerifierPhone,
  newVerifierGate,
  setNewVerifierGate,
  verifierError,
  verifierSuccess,
  handleAddVerifier,
  loadingVerifiers,
  verifiers,
  handleDeleteVerifier,
  handleUpdateVerifier,
  gates,
  newGateName,
  setNewGateName,
  handleCreateGate,
  handleDeleteGate,
  loadingGates
}: GateControlTabProps) {
  const [isGateDropdownOpen, setIsGateDropdownOpen] = useState(false);
  const [selectedGate, setSelectedGate] = useState('All Gates');
  
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  
  const [searchVal, setSearchVal] = useState('');
  
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyBookingId, setVerifyBookingId] = useState('');
  const [verifyingStatus, setVerifyingStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [verifyMessage, setVerifyMessage] = useState('');

  // Edit Verifier State
  const [editingVerifierPhone, setEditingVerifierPhone] = useState<string | null>(null);
  const [editVerifierName, setEditVerifierName] = useState('');
  const [editVerifierPhoneInput, setEditVerifierPhoneInput] = useState('');
  const [editVerifierGate, setEditVerifierGate] = useState('');

  // Items load limits & page states
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [baseLimit, setBaseLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [flowItemsPerPage, setFlowItemsPerPage] = useState(10);
  const [flowBaseLimit, setFlowBaseLimit] = useState(10);
  const [flowCurrentPage, setFlowCurrentPage] = useState(1);

  const updateLogGate = async (logId: string, currentGate: string) => {
    const nextGate = window.prompt('Enter a new gate name for this log:', currentGate)?.trim();
    if (!nextGate || nextGate === currentGate) return;

    try {
      const res = await fetch(`/backend/api/organizer/overview/gatecontrol/logs/${encodeURIComponent(logId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, gate: nextGate })
      });
      const data = await res.json();
      if (!res.ok) {
        window.alert(data.error || 'Failed to update gate log.');
        return;
      }
      fetchGateData();
    } catch (err) {
      window.alert('Network error updating gate log.');
    }
  };

  const deleteLog = async (logId: string) => {
    if (!window.confirm('Delete this gate log entry?')) return;

    try {
      const res = await fetch(`/backend/api/organizer/overview/gatecontrol/logs/${encodeURIComponent(logId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });
      const data = await res.json();
      if (!res.ok) {
        window.alert(data.error || 'Failed to delete gate log.');
        return;
      }
      fetchGateData();
    } catch (err) {
      window.alert('Network error deleting gate log.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddVerifier(e);
  };

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchVal, selectedGate, selectedStatus, itemsPerPage]);

  const [localLogs, setLocalLogs] = useState<GateLog[]>([]);
  const [localIssues, setLocalIssues] = useState<FlowIssue[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalIssues, setTotalIssues] = useState(0);
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState<string>('');
  
  const [stats, setStats] = useState({
      totalGates: 0,
      activeStaff: 0,
      peakVelocity: '0/hr',
      totalEntries: 0,
      issuesCount: 0
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        setEventId(params.get('id') || '');
    }
  }, []);

  const fetchGateData = React.useCallback(async () => {
      if (!eventId) return;
      setLoading(true);
      try {
          const isAllGates = !selectedGate || selectedGate.toLowerCase().trim() === 'all' || selectedGate.toLowerCase().trim() === 'all gates';
          const isAllStatuses = !selectedStatus || selectedStatus.toLowerCase().trim() === 'all' || selectedStatus.toLowerCase().trim() === 'all statuses';

          const queryParams = new URLSearchParams({
              eventId,
              query: searchVal,
              gate: isAllGates ? '' : selectedGate,
              status: isAllStatuses ? '' : selectedStatus,
              page: String(currentPage),
              limit: String(Math.max(itemsPerPage, flowItemsPerPage))
          });
          const res = await fetch(`/backend/api/organizer/overview/gatecontrol?${queryParams.toString()}`);
          if (res.ok) {
              const result = await res.json();
              if (result.success && result.data) {
                  const d = result.data;
                  setLocalLogs(d.logs || []);
                  setLocalIssues(d.issues || []);
                  setTotalRecords(d.totalRecords || 0);
                  setTotalIssues(d.totalIssues || 0);
                  setStats({
                      totalGates: d.totalGates || 0,
                      activeStaff: d.activeStaff || 0,
                      peakVelocity: d.peakVelocity || '0/hr',
                      totalEntries: d.totalEntries || 0,
                      issuesCount: d.issuesCount || 0
                  });
              }
          }
      } catch (err) {
          console.error("Failed to fetch gate control data", err);
      } finally {
          setLoading(false);
      }
  }, [eventId, searchVal, selectedGate, selectedStatus, itemsPerPage, flowItemsPerPage, currentPage]);

  React.useEffect(() => {
      fetchGateData();
  }, [fetchGateData]);

  const safeCurrentPage = Math.max(1, currentPage);
  const visibleLogs = localLogs;

  // Flow Issues states & calculations (unchanged)
  const FLOW_PAGE_SIZE = 10;
  const flowTotalPages = Math.ceil(localIssues.length / FLOW_PAGE_SIZE) || 1;
  const safeFlowCurrentPage = Math.max(1, Math.min(flowCurrentPage, flowTotalPages));
  const flowStartIndex = (safeFlowCurrentPage - 1) * FLOW_PAGE_SIZE;
  const visibleIssues = localIssues.slice(flowStartIndex, flowStartIndex + FLOW_PAGE_SIZE);

  const flowRemainingMatchedCount = totalIssues - localIssues.length;

  return (
    <div className="space-y-6 text-[#1c1525] font-sans pb-6">
      
      {/* Section 1: Top Actions & Filters Panel */}
      <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] relative z-30">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div className="w-full lg:flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Title */}
            <div className="flex items-center">
              <h2 className="text-[17px] font-extrabold text-[#111827]">Gate Performance Filtering</h2>
            </div>

            {/* Select Gate Custom Dropdown */}
            <div className="relative">
              <span className="block text-[10.5px] font-bold text-slate-500 uppercase mb-1">Select Gate</span>
              <button
                onClick={() => {
                  setIsGateDropdownOpen(!isGateDropdownOpen);
                  setIsStatusDropdownOpen(false);
                }}
                className="w-full h-10 px-3 border border-[#AEAEAE] bg-white rounded-lg flex items-center justify-between text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#5331EA]"
              >
                <span>{selectedGate}</span>
                <ChevronDown size={14} className="text-slate-400 shrink-0" />
              </button>
              {isGateDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#AEAEAE] rounded-lg overflow-hidden z-40 text-xs text-slate-800 shadow-lg">
                  {['All Gates', ...gates.map(gate => gate.name)].map((g, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedGate(g);
                        setIsGateDropdownOpen(false);
                      }}
                      className="px-3.5 py-2.5 hover:bg-slate-50 cursor-pointer font-semibold"
                    >
                      {g}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Select Status Custom Dropdown */}
            <div className="relative">
              <span className="block text-[10.5px] font-bold text-slate-500 uppercase mb-1">Select Entry Status</span>
              <button
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsGateDropdownOpen(false);
                }}
                className="w-full h-10 px-3 border border-[#AEAEAE] bg-white rounded-lg flex items-center justify-between text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#5331EA]"
              >
                <span>{selectedStatus}</span>
                <ChevronDown size={14} className="text-slate-400 shrink-0" />
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#AEAEAE] rounded-lg overflow-hidden z-40 text-xs text-slate-800 shadow-lg">
                  {['All Statuses', 'Checked In', 'Checked Out', 'Blocked: Duplicate', 'Blocked: Canceled', 'Manual Verification'].map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedStatus(s);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="px-3.5 py-2.5 hover:bg-slate-50 cursor-pointer font-semibold"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div>
              <span className="block text-[10.5px] font-bold text-slate-500 uppercase mb-1">Search Logs</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Staff, Gates, Booking IDs..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#AEAEAE] rounded-lg focus:outline-none focus:border-[#5331EA] text-slate-800 placeholder-slate-400 font-semibold"
                />
                <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Action Button: Manual Verify User */}
          <div className="w-full lg:w-auto flex shrink-0 justify-end">
            <button
              onClick={() => setIsVerifyModalOpen(true)}
              className="h-10 px-5 bg-[#0AC655] hover:bg-[#08a647] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm w-full sm:w-auto"
            >
              <Check size={14} />
              <span>Manual Check-in</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#D3CBF5]/30 text-[#5331EA] flex items-center justify-center shrink-0 border border-[#AEAEAE]/60">
            <DoorOpen size={18} className="text-slate-500" />
          </div>
          <div>
            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Total Gates</span>
            <span className="text-xl font-black text-slate-900 font-sans">{stats.totalGates}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#0AC655]/10 text-[#0AC655] flex items-center justify-center shrink-0 border border-[#0AC655]/30">
            <Users size={18} />
          </div>
          <div>
            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Active Staff</span>
            <span className="text-xl font-black text-[#0AC655]">{stats.activeStaff}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#D97706]/10 text-[#D97706] flex items-center justify-center shrink-0 border border-[#D97706]/30">
            <Gauge size={18} />
          </div>
          <div>
            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Peak Velocity</span>
            <span className="text-xl font-black text-[#D97706]">{stats.peakVelocity}</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#5331EA]/10 text-[#5331EA] flex items-center justify-center shrink-0 border border-[#5331EA]/30">
            <ClipboardList size={18} />
          </div>
          <div>
            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Total Entries</span>
            <span className="text-xl font-black text-slate-900">{stats.totalEntries.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#ED4D1B]/10 text-[#ED4D1B] flex items-center justify-center shrink-0 border border-[#ED4D1B]/30">
            <ShieldAlert size={18} />
          </div>
          <div>
            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Issues</span>
            <span className="text-xl font-black text-[#ED4D1B]">{stats.issuesCount}</span>
          </div>
        </div>
      </div>

      {/* Section 2.4: Gates Management CRUD */}
      <div className="bg-white rounded-[15px] p-8 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[22px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
            Event Gates <span style={{ color: '#5331EA' }}>*</span>
          </h2>
        </div>
        <p className="text-[14px] font-medium text-[#686868] mb-5" style={{ fontFamily: 'var(--font-anek-latin)' }}>
          Create entry points first — verifiers will be assigned to these gates.
        </p>
        <div className="w-full h-[1px] bg-[#AEAEAE] mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Gate Form */}
          <div className="lg:col-span-1 space-y-4">
            <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
              Gate Name <span style={{ color: '#5331EA' }}>*</span>
            </label>
            <form onSubmit={handleCreateGate} className="space-y-4">
              <input
                type="text"
                value={newGateName}
                onChange={(e) => setNewGateName(e.target.value)}
                placeholder="e.g. Main Entry, VIP Gate 1"
                className="w-full h-[56px] px-5 bg-transparent border border-[#686868] rounded-[10px] outline-none focus:border-[#5331EA] text-[16px] font-medium text-black placeholder-[#AEAEAE]"
                style={{ fontFamily: 'var(--font-anek-latin)' }}
                required
              />
              <button
                type="submit"
                disabled={loadingGates || !newGateName.trim()}
                className="w-full h-[52px] bg-black hover:bg-zinc-800 disabled:bg-[#AEAEAE] text-white text-[15px] font-medium rounded-[10px] flex items-center justify-center gap-2 transition-all"
                style={{ fontFamily: 'var(--font-anek-latin)' }}
              >
                {loadingGates ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={18} />}
                Create Gate
              </button>
            </form>
          </div>

          {/* Registered Gates */}
          <div className="lg:col-span-2 space-y-3">
            <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
              Registered Gates
            </label>
            {gates.length === 0 ? (
              <div className="border border-[#AEAEAE] border-dashed rounded-[10px] p-8 flex flex-col items-center justify-center text-[#AEAEAE] bg-white mt-1">
                <DoorOpen size={36} className="mb-3 opacity-40" />
                <p className="text-[14px] font-medium italic text-center" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                  No gates created yet. Add your first gate.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 mt-1">
                {gates.map((g) => (
                  <div key={g.id} className="flex items-center gap-2 bg-white border border-[#686868] pl-4 pr-2 py-2 rounded-[10px] text-[14px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                    <DoorOpen size={14} className="text-[#5331EA]" />
                    <span>{g.name}</span>
                    <button
                      onClick={() => handleDeleteGate(g.id)}
                      className="w-6 h-6 flex items-center justify-center text-[#AEAEAE] hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-1"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2.5: Verifiers Management CRUD */}
      <div className="bg-white rounded-[15px] p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[22px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
            Gate Verifiers <span style={{ color: '#5331EA' }}>*</span>
          </h2>
        </div>
        <p className="text-[14px] font-medium text-[#686868] mb-5" style={{ fontFamily: 'var(--font-anek-latin)' }}>
          Register staff who will scan and validate tickets at each gate entry point.
        </p>
        <div className="w-full h-[1px] bg-[#AEAEAE] mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Register Verifier Form */}
          <div className="lg:col-span-1 space-y-4">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Verifier Name */}
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                  Verifier Name <span style={{ color: '#5331EA' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newVerifierName}
                  onChange={(e) => setNewVerifierName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full h-[56px] px-5 bg-transparent border border-[#686868] rounded-[10px] outline-none focus:border-[#5331EA] text-[16px] font-medium text-black placeholder-[#AEAEAE]"
                  style={{ fontFamily: 'var(--font-anek-latin)' }}
                  required
                />
              </div>

              {/* Verifier Mobile with India Flag */}
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                  Mobile Number <span style={{ color: '#5331EA' }}>*</span>
                </label>
                <div className="flex items-stretch border border-[#686868] rounded-[10px] overflow-hidden focus-within:border-[#5331EA] transition-colors h-[56px]">
                  <div className="flex items-center gap-2 px-4 bg-[#F7F7F7] border-r border-[#686868] shrink-0">
                    <span className="text-[20px]">🇮🇳</span>
                    <span className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={newVerifierPhone}
                    onChange={(e) => setNewVerifierPhone(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 px-4 bg-transparent outline-none text-[16px] font-medium text-black placeholder-[#AEAEAE]"
                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                    required
                  />
                </div>
              </div>

              {/* Gate Dropdown */}
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                  Assign to Gate <span style={{ color: '#5331EA' }}>*</span>
                </label>
                <div className="relative">
                  <select
                    value={newVerifierGate}
                    onChange={(e) => setNewVerifierGate(e.target.value)}
                    className="w-full h-[56px] px-5 bg-transparent border border-[#686868] rounded-[10px] outline-none focus:border-[#5331EA] text-[16px] font-medium text-black appearance-none cursor-pointer"
                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                    required
                  >
                    <option value="" disabled>Select a gate</option>
                    {gates.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#686868] pointer-events-none" size={20} />
                </div>
                {gates.length === 0 && (
                  <p className="text-[11px] text-[#ED4D1B]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                    ⚠ Create a gate above before registering verifiers.
                  </p>
                )}
              </div>

              {/* Feedback Messages */}
              {verifierError && (
                <p className="text-[12px] font-medium text-[#ED4D1B] bg-red-50 border border-red-200 p-3 rounded-[10px] flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {verifierError}
                </p>
              )}
              {verifierSuccess && (
                <p className="text-[12px] font-medium text-[#0AC655] bg-emerald-50 border border-emerald-200 p-3 rounded-[10px] flex items-center gap-2">
                  <Check size={14} />
                  {verifierSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={loadingVerifiers || gates.length === 0}
                className="w-full h-[52px] bg-black hover:bg-zinc-800 disabled:bg-[#AEAEAE] text-white text-[15px] font-medium rounded-[10px] flex items-center justify-center gap-2 transition-all"
                style={{ fontFamily: 'var(--font-anek-latin)' }}
              >
                {loadingVerifiers ? <RefreshCw className="animate-spin" size={16} /> : <UserPlus size={18} />}
                Register &amp; Send Passcode
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <label className="text-[14px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
              Registered Active Verifiers
            </label>
            {verifiers.length === 0 ? (
              <div className="border border-[#AEAEAE] border-dashed rounded-[10px] p-10 flex flex-col items-center justify-center text-[#AEAEAE] bg-white mt-1">
                <Users size={36} className="mb-3 opacity-40" />
                <p className="text-[14px] font-medium italic text-center" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                  No gate verifiers currently registered.
                </p>
              </div>
            ) : (
              <div className="border border-[#686868] rounded-[10px] overflow-hidden bg-white mt-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#686868]" style={{ backgroundColor: '#F7F7F7' }}>
                      <th className="py-3 px-4 text-[12px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Name</th>
                      <th className="py-3 px-4 text-[12px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Mobile</th>
                      <th className="py-3 px-4 text-[12px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Assigned Gate</th>
                      <th className="py-3 px-4 text-[12px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Security Key</th>
                      <th className="py-3 px-4 text-[12px] font-medium text-[#686868] text-center" style={{ fontFamily: 'var(--font-anek-latin)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifiers.map((v, idx) => {
                      const isEditing = editingVerifierPhone === v.phone;
                      return (
                        <tr key={idx} className="border-b border-[#AEAEAE] last:border-0 hover:bg-[#F7F7F7]/50 transition-colors">
                          <td className="py-3.5 px-4 text-[14px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={editVerifierName}
                                onChange={(e) => setEditVerifierName(e.target.value)}
                                className="w-full h-8 px-2 border border-[#686868] rounded-[6px] outline-none text-[13px]"
                              />
                            ) : (
                              v.name || '—'
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[13px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            {isEditing ? (
                              <div className="flex items-center gap-1 border border-[#686868] rounded-[6px] overflow-hidden h-8">
                                <span className="bg-[#F7F7F7] px-2 border-r border-[#686868] h-full flex items-center">🇮🇳</span>
                                <input 
                                  type="tel" 
                                  value={editVerifierPhoneInput}
                                  onChange={(e) => setEditVerifierPhoneInput(e.target.value)}
                                  className="w-full px-2 outline-none text-[13px] text-black"
                                />
                              </div>
                            ) : (
                              <span className="flex items-center gap-1.5">🇮🇳 {v.phone}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {isEditing ? (
                              <select
                                value={editVerifierGate}
                                onChange={(e) => setEditVerifierGate(e.target.value)}
                                className="w-full h-8 px-2 border border-[#686868] rounded-[6px] outline-none text-[13px] text-black"
                              >
                                {gates.map((g) => (
                                  <option key={g.id} value={g.name}>{g.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 border border-[#686868] rounded-[6px] px-2.5 py-1 text-[12px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <DoorOpen size={12} className="text-[#5331EA]" />
                                {v.gate || 'Unassigned'}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[13px] font-semibold text-[#5331EA] tracking-widest">
                            {isEditing ? '—' : (v.password || '—')}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex justify-center gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={async () => {
                                      await handleUpdateVerifier(v.phone, editVerifierPhoneInput, editVerifierName, editVerifierGate);
                                      setEditingVerifierPhone(null);
                                    }}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-[6px] border border-emerald-200 transition-colors"
                                    title="Save"
                                  >
                                    <Check size={13} />
                                  </button>
                                  <button
                                    onClick={() => setEditingVerifierPhone(null)}
                                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-[6px] border border-slate-200 transition-colors"
                                    title="Cancel"
                                  >
                                    <X size={13} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingVerifierPhone(v.phone);
                                      setEditVerifierName(v.name || '');
                                      setEditVerifierPhoneInput(v.phone.replace('+91', '').trim() || v.phone);
                                      setEditVerifierGate(v.gate || '');
                                    }}
                                    className="p-1.5 text-[#5331EA] hover:bg-indigo-50 rounded-[6px] border border-[#5331EA]/30 transition-colors"
                                    title="Edit Verifier"
                                  >
                                    <Edit size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVerifier(v.phone)}
                                    className="p-1.5 text-[#AEAEAE] hover:text-red-600 hover:bg-red-50 rounded-[6px] border border-[#AEAEAE] transition-colors"
                                    title="Delete Verifier"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
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
        </div>
      </div>

      {/* Manual Check-in Modal Overlay */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="text-sm font-black flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>Admin Override: Manual Check-in</span>
              </h3>
              <button onClick={() => setIsVerifyModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Manually verify a user who cannot scan their QR code. This action is logged permanently under Admin records.
              </p>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Booking ID / Ticket Reference</label>
                <input
                  type="text"
                  value={verifyBookingId}
                  onChange={(e) => setVerifyBookingId(e.target.value)}
                  placeholder="e.g. BK-7bed979a"
                  className="w-full h-10 px-3 bg-white border border-[#AEAEAE] rounded-lg outline-none focus:border-[#0AC655] text-xs font-bold uppercase"
                />
              </div>
              {verifyMessage && (
                <div className={`p-3 rounded-lg text-xs font-bold ${
                  verifyingStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {verifyMessage}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if(!verifyBookingId) return;
                    setVerifyingStatus('loading');
                    try {
                      // We will implement this endpoint in the backend next
                      const res = await fetch('/backend/api/organizer/overview/gatecontrol/manual-verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ eventId, bookingId: verifyBookingId })
                      });
                      const data = await res.json();
                      if(res.ok && data.success) {
                        setVerifyingStatus('success');
                        setVerifyMessage('Ticket verified successfully!');
                        fetchGateData();
                        setTimeout(() => { setIsVerifyModalOpen(false); setVerifyMessage(''); setVerifyBookingId(''); }, 1500);
                      } else {
                        setVerifyingStatus('error');
                        setVerifyMessage(data.error || 'Verification failed. Invalid or already verified.');
                      }
                    } catch (err) {
                      setVerifyingStatus('error');
                      setVerifyMessage('Network error occurred.');
                    }
                  }}
                  disabled={!verifyBookingId || verifyingStatus === 'loading'}
                  className="flex-1 h-10 bg-[#0AC655] hover:bg-[#08a647] disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {verifyingStatus === 'loading' ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                  <span>Force Verify</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Main Data Table */}
      <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE]">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4 pb-2 border-b border-[#AEAEAE]/40">
          <h2 className="text-[15.5px] font-black text-slate-900">Live Gate Entry Logs</h2>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
            {/* Load Limit Selectors */}
            <div className="flex items-center gap-1.5 font-sans">
              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Load Limit:</span>
              {[10, 50, 100].map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setBaseLimit(size);
                    setItemsPerPage(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded border ${
                    baseLimit === size
                      ? 'bg-[#5331EA] text-white border-[#5331EA]'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-[#AEAEAE]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Page-by-page Pagination Controls */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 font-sans">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="h-8 px-2.5 border border-[#AEAEAE] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Previous
              </button>
              <span className="px-1 text-slate-600 font-semibold">
                Page <strong className="text-slate-900">{safeCurrentPage}</strong> of <strong className="text-slate-900">{Math.max(1, Math.ceil(totalRecords / Math.max(itemsPerPage, 1)))}</strong> (<strong className="text-slate-900">{visibleLogs.length}</strong> shown, <strong className="text-slate-900">{totalRecords}</strong> total matches)
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.max(1, Math.ceil(totalRecords / Math.max(itemsPerPage, 1))))) }
                disabled={safeCurrentPage >= Math.max(1, Math.ceil(totalRecords / Math.max(itemsPerPage, 1)))}
                className="h-8 px-2.5 border border-[#AEAEAE] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-[#AEAEAE] text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-3 rounded-l-md">Entry Time</th>
                <th className="py-3 px-3">Booking ID / Name</th>
                <th className="py-3 px-3">Event Name</th>
                <th className="py-3 px-3">Gate Staff / Scanner ID</th>
                <th className="py-3 px-3">Gate Name</th>
                <th className="py-3 px-3">Check-In Time</th>
                <th className="py-3 px-3">Check-Out Time</th>
                <th className="py-3 px-3 text-center">Entry Status</th>
                <th className="py-3 px-3">Verification Detail</th>
                <th className="py-3 px-3 rounded-r-md text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#AEAEAE] text-slate-800">
              {visibleLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                    No gate entry logs match the search or status criteria.
                  </td>
                </tr>
              ) : (
                visibleLogs.map((row, idx) => {
                  let statusBg = 'text-slate-800 font-bold';
                  let displayStatus = row.status;
                  if (row.status === 'Verified') {
                    displayStatus = 'Checked In';
                    statusBg = 'bg-[#0AC655]/10 text-[#0AC655] border border-[#0AC655]/30 font-bold px-2 py-0.5 rounded-md';
                  } else if (row.status === 'Checked Out') {
                    displayStatus = 'Checked Out';
                    statusBg = 'bg-blue-100 text-blue-700 border border-blue-300 font-bold px-2 py-0.5 rounded-md';
                  } else if (row.status.startsWith('Blocked')) {
                    statusBg = 'bg-[#ED4D1B]/10 text-[#ED4D1B] border border-[#ED4D1B]/30 font-bold px-2 py-0.5 rounded-md';
                  } else if (row.status === 'Manual Verification') {
                    statusBg = 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30 font-bold px-2 py-0.5 rounded-md';
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{row.time}</div>
                        <div className="text-[9.5px] text-slate-400 font-semibold mt-0.5">{row.subtext}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${row.imageBg} text-white flex items-center justify-center font-bold text-xs shrink-0 border border-white/20`}>
                            {row.user.charAt(0)}
                          </div>
                          <div>
                            <div className="text-[12.5px] font-bold text-slate-900">{row.user}</div>
                            <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">ID: {row.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-[7px] text-white font-black shrink-0 border border-[#AEAEAE]">
                            TIC
                          </div>
                          <span className="text-[12px] font-bold text-slate-800">{row.event}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-semibold">{row.staff}</td>
                      <td className="py-3 px-3 font-bold text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#5331EA]"></span>
                          {row.gate}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {row.check_in_time_str || '—'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {row.check_out_time_str || '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block text-[9.5px] ${statusBg}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${row.detail === 'OK' ? 'text-slate-800' : 'text-amber-500'}`}>
                          {row.detail}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateLogGate(row.id, row.gate)}
                            className="h-7 px-2.5 border border-[#AEAEAE] bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg transition-colors"
                          >
                            Edit Gate
                          </button>
                          <button
                            onClick={() => deleteLog(row.id)}
                            className="h-7 px-2.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 text-[10px] font-bold rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Gate Flow Analysis & Issues (Full Width card, Map card completely removed) */}
      <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] w-full">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4 pb-2 border-b border-[#AEAEAE]/40">
          <h3 className="text-[13.5px] font-black text-slate-900">Gate Flow Analysis & Issues</h3>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
            {/* Load Limit Selectors */}
            <div className="flex items-center gap-1.5 font-sans">
              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Load Limit:</span>
              {[10, 50, 100].map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setFlowBaseLimit(size);
                    setFlowItemsPerPage(size);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded border ${
                    flowBaseLimit === size
                      ? 'bg-[#5331EA] text-white border-[#5331EA]'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-[#AEAEAE]'
                  }`}
                >
                  {size}
                </button>
              ))}

              {/* Load Next Chunks Button */}
              {flowRemainingMatchedCount > 0 && (
                <button
                  onClick={() => {
                    const amountToLoad = Math.min(flowBaseLimit, flowRemainingMatchedCount);
                    setFlowItemsPerPage(prev => prev + amountToLoad);
                  }}
                  className="px-2.5 py-1 text-[10px] font-black rounded border border-[#5331EA] bg-[#5331EA]/10 hover:bg-[#5331EA]/20 text-[#5331EA] transition-all flex items-center gap-1"
                  title={`Load Next ${Math.min(flowBaseLimit, flowRemainingMatchedCount)} matching issues`}
                >
                  <span>Load Next {Math.min(flowBaseLimit, flowRemainingMatchedCount)}</span>
                </button>
              )}
            </div>

            {/* Page-by-page Pagination Controls */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 font-sans">
              <button
                onClick={() => setFlowCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={safeFlowCurrentPage === 1}
                className="h-8 px-2.5 border border-[#AEAEAE] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Previous
              </button>
              <span className="px-1 text-slate-600 font-semibold">
                Page <strong className="text-slate-900">{safeFlowCurrentPage}</strong> of <strong className="text-slate-900">{flowTotalPages}</strong> (<strong className="text-slate-900">{localIssues.length === 0 ? 0 : flowStartIndex + 1}–{Math.min(flowStartIndex + FLOW_PAGE_SIZE, localIssues.length)}</strong> of <strong className="text-slate-900">{localIssues.length}</strong> loaded)
              </span>
              <button
                onClick={() => setFlowCurrentPage(prev => Math.min(prev + 1, flowTotalPages))}
                disabled={safeFlowCurrentPage === flowTotalPages}
                className="h-8 px-2.5 border border-[#AEAEAE] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-[#AEAEAE] text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Attendee Name</th>
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Assigned Verifier</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#AEAEAE] text-slate-800">
              {visibleIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    No gate flow issues detected.
                  </td>
                </tr>
              ) : (
                visibleIssues.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/40">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${row.imageBg} text-white flex items-center justify-center text-[10px] font-bold`}>
                          {row.user.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{row.user}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{row.event}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#ED4D1B]">{row.reason}</td>
                    <td className="py-2.5 px-3 text-slate-500">{row.assignedVerifier}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex justify-center">
                        <span
                          className={`h-7 px-3 inline-flex items-center border font-bold rounded-md text-[10px] ${
                            row.action === 'Recheck'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {row.action === 'Recheck' ? 'Needs re-scan' : 'Admin follow-up'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
