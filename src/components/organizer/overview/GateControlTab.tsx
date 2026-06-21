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
}

const generateGateLogs = (): GateLog[] => {
  const names = [
    'John Doe', 'Anthom David', 'Patier Martin', 'Kamela Verqulan', 'Suresh Kumar', 'Vijay Raghavan', 
    'Karthik Raja', 'Aravv G', 'Aniksha Senthil', 'Dharun Balaji', 'Ramji Balasubramaniyan', 'Dharun S'
  ];
  const staffMembers = [
    'Illustrative Arian ID / Illustrative Gate 1',
    'Illustrative Arian IDs / Illustrative Gate 2',
    'Illustrative Artan IDs / Illustrative Nem Person',
    'Illustrative Arian IDs / Illustrative Gates'
  ];
  const gates = ['Gate 1', 'Main Entrance', 'VIP Gate'];
  const statuses = ['Verified', 'Blocked: Duplicate', 'Blocked: Canceled', 'Manual Verification'];
  const details = ['OK', 'Flagged', 'Wrong Category', 'OK'];
  const imageBgs = ['bg-[#a78bfa]', 'bg-[#f472b6]', 'bg-[#fb7185]', 'bg-[#60a5fa]'];

  const logs: GateLog[] = [
    { id: '1', time: '08:03:31 PM', subtext: 'Jun 21, 2026', user: 'John Doe', userId: 'ATN7456', event: 'TechNova', staff: 'Illustrative Arian ID / Illustrative Gate 1', gate: 'Gate 1', status: 'Verified', detail: 'OK', imageBg: 'bg-[#a78bfa]' },
    { id: '2', time: '08:05:39 PM', subtext: 'Jun 21, 2026', user: 'Anthom David', userId: 'email@unsysdigital.com', event: 'TechNova', staff: 'Illustrative Arian IDs / Illustrative Gate 2', gate: 'Main Entrance', status: 'Blocked: Duplicate', detail: 'Flagged', imageBg: 'bg-[#f472b6]' },
    { id: '3', time: '08:08:12 PM', subtext: 'Jun 21, 2026', user: 'Patier Martin', userId: 'ATN7583', event: 'TechNova', staff: 'Illustrative Artan IDs / Illustrative Nem Person', gate: 'Gate 1', status: 'Blocked: Canceled', detail: 'Wrong Category', imageBg: 'bg-[#fb7185]' },
    { id: '4', time: '08:11:45 PM', subtext: 'Jun 21, 2026', user: 'Kamela Verqulan', userId: 'ATN7479', event: 'TechNova', staff: 'Illustrative Arian IDs / Illustrative Gates', gate: 'VIP Gate', status: 'Manual Verification', detail: 'OK', imageBg: 'bg-[#60a5fa]' }
  ];

  for (let i = 5; i <= 124; i++) {
    const name = names[i % names.length] + ' ' + String.fromCharCode(65 + (i % 26));
    const staff = staffMembers[i % staffMembers.length];
    const gate = gates[i % gates.length];
    const status = statuses[i % statuses.length];
    const detail = details[i % details.length];
    const imageBg = imageBgs[i % imageBgs.length];

    let hour = 8 + Math.floor(i / 60) % 12;
    let min = i % 60;
    let sec = (i * 17) % 60;
    const timeStr = `${String(hour === 0 ? 12 : hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')} PM`;

    logs.push({
      id: String(i),
      time: timeStr,
      subtext: 'Jun 21, 2026',
      user: name,
      userId: `ATN${7400 + i}`,
      event: 'TechNova',
      staff: staff,
      gate: gate,
      status: status,
      detail: detail,
      imageBg: imageBg
    });
  }

  return logs;
};

const initialGateLogs = generateGateLogs();

interface FlowIssue {
  id: string;
  user: string;
  event: string;
  reason: string;
  assignedVerifier: string;
  action: 'Recheck' | 'Admin';
  imageBg: string;
}

const generateFlowIssues = (): FlowIssue[] => {
  const names = [
    'John Doe', 'Farior Parton', 'Patier Martin', 'Kamela Verqulan', 'Suresh Kumar', 'Vijay Raghavan', 
    'Karthik Raja', 'Aravv G', 'Aniksha Senthil', 'Dharun Balaji', 'Ramji Balasubramaniyan', 'Dharun S'
  ];
  const reasons = ['ID Mismatch', 'Duplicate Ticket', 'Canceled Ticket', 'Wrong Gate'];
  const verifiers = ['Illustrative VIR', 'Verifier 1', 'Verifier 2', 'Admin Staff'];
  const imageBgs = ['bg-[#a78bfa]', 'bg-[#f472b6]', 'bg-[#fb7185]', 'bg-[#60a5fa]'];

  const issues: FlowIssue[] = [
    { id: '1', user: 'John Doe', event: 'TechNova', reason: 'ID Mismatch', assignedVerifier: 'Illustrative VIR', action: 'Recheck', imageBg: 'bg-[#a78bfa]' },
    { id: '2', user: 'Farior Parton', event: 'TechNova', reason: 'Duplicate Ticket', assignedVerifier: 'Illustrative VIR', action: 'Admin', imageBg: 'bg-[#f472b6]' }
  ];

  for (let i = 3; i <= 124; i++) {
    const name = names[i % names.length] + ' ' + String.fromCharCode(65 + (i % 26));
    const reason = reasons[i % reasons.length];
    const verifier = verifiers[i % verifiers.length];
    const action = i % 2 === 0 ? 'Recheck' : 'Admin';
    const imageBg = imageBgs[i % imageBgs.length];

    issues.push({
      id: String(i),
      user: name,
      event: 'TechNova',
      reason: reason,
      assignedVerifier: verifier,
      action: action,
      imageBg: imageBg
    });
  }

  return issues;
};

const initialFlowIssues = generateFlowIssues();

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
  const [isGateDropdownOpen, setIsGateDropdownOpen] = useState(false);
  const [selectedGate, setSelectedGate] = useState('All Gates');
  
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  
  const [searchVal, setSearchVal] = useState('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Items load limits & page states
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [baseLimit, setBaseLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddVerifier(e);
  };

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchVal, selectedGate, selectedStatus, itemsPerPage]);

  const [localLogs, setLocalLogs] = useState<GateLog[]>(initialGateLogs);

  const filteredLogs = localLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchVal.toLowerCase()) ||
                          log.userId.toLowerCase().includes(searchVal.toLowerCase()) ||
                          log.gate.toLowerCase().includes(searchVal.toLowerCase());
    const matchesGate = selectedGate === 'All Gates' ? true : log.gate === selectedGate;
    const matchesStatus = selectedStatus === 'All Statuses' ? true : log.status === selectedStatus;
    
    return matchesSearch && matchesGate && matchesStatus;
  });

  // Cap by loaded limit, then page by 10 rows
  const loadedLogs = filteredLogs.slice(0, itemsPerPage);
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(loadedLogs.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleLogs = loadedLogs.slice(startIndex, startIndex + PAGE_SIZE);

  const remainingMatchedCount = filteredLogs.length - loadedLogs.length;

  // Flow Issues states & calculations
  const [localIssues, setLocalIssues] = useState<FlowIssue[]>(initialFlowIssues);
  const [flowItemsPerPage, setFlowItemsPerPage] = useState(10);
  const [flowBaseLimit, setFlowBaseLimit] = useState(10);
  const [flowCurrentPage, setFlowCurrentPage] = useState(1);

  React.useEffect(() => {
    setFlowCurrentPage(1);
  }, [flowItemsPerPage]);

  const cappedIssues = localIssues.slice(0, flowItemsPerPage);
  const FLOW_PAGE_SIZE = 10;
  const flowTotalPages = Math.ceil(cappedIssues.length / FLOW_PAGE_SIZE) || 1;
  const flowStartIndex = (flowCurrentPage - 1) * FLOW_PAGE_SIZE;
  const visibleIssues = cappedIssues.slice(flowStartIndex, flowStartIndex + FLOW_PAGE_SIZE);

  const flowRemainingMatchedCount = localIssues.length - cappedIssues.length;

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
                  {['All Gates', 'Gate 1', 'Main Entrance', 'VIP Gate'].map((g, idx) => (
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
                  {['All Statuses', 'Verified', 'Blocked: Duplicate', 'Blocked: Canceled', 'Manual Verification'].map((s, idx) => (
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

          {/* Action Button: Create Gate Verifier */}
          <div className="w-full lg:w-auto flex shrink-0 justify-end">
            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="h-10 px-5 bg-[#5331EA] hover:bg-[#4223ca] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm w-full sm:w-auto"
            >
              <Plus size={14} />
              <span>Create Gate Verifier</span>
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
            <span className="text-xl font-black text-slate-900 font-sans">6</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#0AC655]/10 text-[#0AC655] flex items-center justify-center shrink-0 border border-[#0AC655]/30">
            <Users size={18} />
          </div>
          <div>
            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Active Staff</span>
            <span className="text-xl font-black text-[#0AC655]">20</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#D97706]/10 text-[#D97706] flex items-center justify-center shrink-0 border border-[#D97706]/30">
            <Gauge size={18} />
          </div>
          <div>
            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Peak Velocity</span>
            <span className="text-xl font-black text-[#D97706]">400/hr</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#5331EA]/10 text-[#5331EA] flex items-center justify-center shrink-0 border border-[#5331EA]/30">
            <ClipboardList size={18} />
          </div>
          <div>
            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Total Entries</span>
            <span className="text-xl font-black text-slate-900">2,500</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-[15px] p-5 border border-[#AEAEAE] flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#ED4D1B]/10 text-[#ED4D1B] flex items-center justify-center shrink-0 border border-[#ED4D1B]/30">
            <ShieldAlert size={18} />
          </div>
          <div>
            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Issues</span>
            <span className="text-xl font-black text-[#ED4D1B]">45</span>
          </div>
        </div>
      </div>

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

              {/* Load Next Chunks Button */}
              {remainingMatchedCount > 0 && (
                <button
                  onClick={() => {
                    const amountToLoad = Math.min(baseLimit, remainingMatchedCount);
                    setItemsPerPage(prev => prev + amountToLoad);
                  }}
                  className="px-2.5 py-1 text-[10px] font-black rounded border border-[#5331EA] bg-[#5331EA]/10 hover:bg-[#5331EA]/20 text-[#5331EA] transition-all flex items-center gap-1"
                  title={`Load Next ${Math.min(baseLimit, remainingMatchedCount)} matching logs`}
                >
                  <span>Load Next {Math.min(baseLimit, remainingMatchedCount)}</span>
                </button>
              )}
            </div>

            {/* Page-by-page Pagination Controls */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 font-sans">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 border border-[#AEAEAE] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Previous
              </button>
              <span className="px-1 text-slate-600 font-semibold">
                Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong> (<strong className="text-slate-900">{loadedLogs.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, loadedLogs.length)}</strong> of <strong className="text-slate-900">{loadedLogs.length}</strong> loaded)
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
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
                <th className="py-3 px-3 text-center">Entry Status</th>
                <th className="py-3 px-3">Verification Detail</th>
                <th className="py-3 px-3 text-center rounded-r-md w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#AEAEAE] text-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No gate entry logs match the search or status criteria.
                  </td>
                </tr>
              ) : (
                visibleLogs.map((row, idx) => {
                  let statusBg = 'text-slate-800 font-bold';
                  if (row.status === 'Verified') {
                    statusBg = 'bg-[#0AC655]/10 text-[#0AC655] border border-[#0AC655]/30 font-bold px-2 py-0.5 rounded-md';
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
                      <td className="py-3 px-3 text-slate-500 font-medium">{row.staff}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{row.gate}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block text-[9.5px] ${statusBg}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${row.detail === 'OK' ? 'text-slate-800' : 'text-amber-500'}`}>
                          {row.detail}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              const newGate = prompt(`Edit Assigned Gate for ${row.user}:`, row.gate);
                              if (newGate !== null) {
                                setLocalLogs(prev => prev.map(log => log.id === row.id ? { ...log, gate: newGate } : log));
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded border border-[#AEAEAE]"
                            title="Edit Log"
                          >
                            <Edit size={11.5} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete log for ${row.user}?`)) {
                                setLocalLogs(prev => prev.filter(log => log.id !== row.id));
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-[#ED4D1B] hover:bg-red-50 rounded border border-[#AEAEAE]"
                            title="Delete Log"
                          >
                            <Trash2 size={11.5} />
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
                disabled={flowCurrentPage === 1}
                className="h-8 px-2.5 border border-[#AEAEAE] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Previous
              </button>
              <span className="px-1 text-slate-600 font-semibold">
                Page <strong className="text-slate-900">{flowCurrentPage}</strong> of <strong className="text-slate-900">{flowTotalPages}</strong> (<strong className="text-slate-900">{cappedIssues.length === 0 ? 0 : flowStartIndex + 1}–{Math.min(flowStartIndex + FLOW_PAGE_SIZE, cappedIssues.length)}</strong> of <strong className="text-slate-900">{cappedIssues.length}</strong> loaded)
              </span>
              <button
                onClick={() => setFlowCurrentPage(prev => Math.min(prev + 1, flowTotalPages))}
                disabled={flowCurrentPage === flowTotalPages}
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
                        {row.action === 'Recheck' ? (
                          <button
                            onClick={() => {
                              alert(`Triggering Recheck flow for attendee: ${row.user}`);
                            }}
                            className="h-7 px-3 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 font-bold rounded-md flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <span>Recheck</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              alert(`Opening Admin intervention dashboard for attendee: ${row.user}`);
                            }}
                            className="h-7 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-md flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <span>Admin</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Management Slide-out Modal Overlay */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center shrink-0">
              <h3 className="text-sm font-black flex items-center gap-2">
                <UserPlus size={16} />
                <span>Active Gate Verifier Management</span>
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="bg-slate-50 rounded-xl p-5 border border-[#AEAEAE] space-y-4">
                <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Register Gate Verifier</h4>
                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Verifier Mobile</label>
                    <input
                      type="tel"
                      value={newVerifierPhone}
                      onChange={(e) => setNewVerifierPhone(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full h-10 px-3 bg-white border border-[#AEAEAE] rounded-lg outline-none focus:border-[#5331EA] text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Gate Assignment Point</label>
                    <input
                      type="text"
                      value={newVerifierGate}
                      onChange={(e) => setNewVerifierGate(e.target.value)}
                      placeholder="e.g. Gate 1, VIP Entry"
                      className="w-full h-10 px-3 bg-white border border-[#AEAEAE] rounded-lg outline-none focus:border-[#5331EA] text-xs font-semibold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    {verifierError && (
                      <p className="text-xs font-bold text-[#ED4D1B] bg-red-50 border border-red-200 p-2.5 rounded-lg flex items-center gap-1.5">
                        <AlertTriangle size={13} />
                        {verifierError}
                      </p>
                    )}
                    {verifierSuccess && (
                      <p className="text-xs font-bold text-[#0AC655] bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center gap-1.5">
                        <Check size={13} />
                        {verifierSuccess}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loadingVerifiers}
                      className="h-10 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      {loadingVerifiers ? <RefreshCw className="animate-spin" size={12} /> : null}
                      <span>Generate Verifier Key</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Registered Active Verifiers Register</h4>
                {verifiers.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium italic text-center py-6">No gate verifiers currently registered.</p>
                ) : (
                  <div className="border border-[#AEAEAE] rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-[#AEAEAE] text-slate-500 font-bold">
                          <th className="py-2.5 px-3">Mobile</th>
                          <th className="py-2.5 px-3">Assigned Gate</th>
                          <th className="py-2.5 px-3">Security Key</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {verifiers.map((v, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-950">{v.phone}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-700">{v.gate || 'Unassigned'}</td>
                            <td className="py-2.5 px-3 font-mono text-xs font-semibold text-slate-500">{v.password || '-'}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => handleDeleteVerifier(v.phone)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded border border-[#AEAEAE] transition-colors"
                                  title="Delete Verifier"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-[#AEAEAE] flex justify-end shrink-0">
              <button onClick={() => setIsStaffModalOpen(false)} className="h-9 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
