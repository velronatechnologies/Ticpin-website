'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Ticket, BarChart2, Eye, Gem, RefreshCw, AlertCircle } from 'lucide-react';

interface OverviewTabProps {
  eventId: string;
  listingName?: string;
}

// Chart Colors defined in target design
const COLORS = {
  navy: '#1c1525',
  purple: '#5331EA',
  purpleDark: '#4223ca',
  orange: '#D97706',
  orangeLight: 'rgba(217,119,6,0.15)',
  green: '#0AC655',
  greenLight: 'rgba(10,198,85,0.15)',
  teal: '#22c1d6',
  bg: '#f4f5fa',
  card: '#ffffff',
  text: '#1c1525',
  muted: '#8a8a9a',
  border: '#AEAEAE'
};

interface DashboardData {
  eventName: string;
  stats: {
    totalTicketsSold: number;
    overallCapacity: number;
    pageViews: number;
    totalRevenue: number;
  };
  dailySales: Array<{ date: string; sales: number; revenue: number }>;
  details: {
    duration: string;
    location: string;
    approvalStatus: string;
    verifierStaff: number;
    platformFeeRate: string;
    payoutAction: string;
  };
  demographics: Array<{ category: string; booked: number; checkedIn: number }>;
  conversion: {
    bookedTickets: number;
    onlyViewed: number;
  };
  locations: Array<{ city: string; count: number }>;
  earnings: Array<{
    category: string;
    price: number;
    basePrice: number;
    ticketGst: number;
    qty: number;
    gross: number;
    platformFee: number;
    platformGst: number;
    orgRevenue: number;
  }>;
}

export default function OverviewTab({ eventId, listingName }: OverviewTabProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (bypassCache = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/backend/api/organizer/overview/dashboard?eventId=${encodeURIComponent(eventId)}${bypassCache ? '&bypassCache=true' : ''}`;
      const res = await fetch(url, {
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard statistics from server');
      }
      const json = await res.json();
      if (json && json.success) {
        setData(json.data);
      } else {
        throw new Error(json?.error || 'Failed to retrieve overview statistics');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong while connecting to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchDashboardData();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-zinc-400 mb-2" size={28} />
        <p className="text-zinc-600 font-semibold text-xs animate-pulse">Loading Live Event Metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-red-200 rounded-[15px] bg-red-50/20 p-6 text-center">
        <AlertCircle className="text-red-500 mb-2" size={32} />
        <h3 className="font-bold text-sm text-red-800">Connection Failed</h3>
        <p className="text-red-600/80 text-xs max-w-sm mt-1 mb-4">{error || 'Unable to fetch dynamic event stats'}</p>
        <button
          onClick={() => fetchDashboardData(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw size={12} />
          Retry Connection
        </button>
      </div>
    );
  }

  const { stats, details, conversion } = data;
  const earnings = data.earnings || [];
  const demographics = data.demographics || [];
  const locations = data.locations || [];
  const dailySales = data.dailySales || [];

  // Calculate dynamic totals for the earnings table
  const totalGross = earnings.reduce((sum, item) => sum + item.gross, 0);
  const totalPlatformFee = earnings.reduce((sum, item) => sum + item.platformFee, 0);
  const totalPlatformGst = earnings.reduce((sum, item) => sum + item.platformGst, 0);
  const totalOrgRevenue = earnings.reduce((sum, item) => sum + item.orgRevenue, 0);
  const totalQtySold = earnings.reduce((sum, item) => sum + item.qty, 0);

  // Conversion chart format
  const conversionPieData = [
    { name: 'Booked Tickets', value: conversion.bookedTickets, color: '#5331EA' },
    { name: 'Only Viewed', value: conversion.onlyViewed, color: '#D3CBF5' }
  ];

  const totalInteractions = conversion.bookedTickets + conversion.onlyViewed;
  const bookedPercent = totalInteractions > 0 ? ((conversion.bookedTickets / totalInteractions) * 100).toFixed(1) : '0.0';
  const onlyViewedPercent = totalInteractions > 0 ? ((conversion.onlyViewed / totalInteractions) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-[12px] animate-fadeIn text-[#1c1525] font-sans pb-2">
      {/* Header Info */}
      <div className="relative">
        <h1 className="text-[18px] font-bold text-[#1c1525] text-center">Overview</h1>
        <p className="text-center text-[#8a8a9a] text-[12px] mt-[1px] mb-[12px]">
          {data.eventName || listingName || 'Active Listing'}
        </p>
        <button
          onClick={() => fetchDashboardData(true)}
          className="absolute right-0 top-0 p-1 border border-[#AEAEAE] bg-white rounded-md hover:bg-zinc-50 transition-colors"
          title="Refresh statistics"
        >
          <RefreshCw size={12} className="text-[#8a8a9a]" />
        </button>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px]">
        {/* Card 1: Total Tickets Sold */}
        <div className="bg-white rounded-[15px] p-[12px_14px] flex items-center gap-[10px] border border-[#AEAEAE]/60">
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#D3CBF5]/30 text-[#5331EA] flex items-center justify-center text-[16px] shrink-0">
            <Ticket size={16} />
          </div>
          <div>
            <div className="text-[11px] text-[#8a8a9a] mb-[1px]">Total Tickets Sold</div>
            <div className="text-[17px] font-bold text-[#1c1525] leading-none">{stats.totalTicketsSold.toLocaleString()}</div>
          </div>
        </div>

        {/* Card 2: Overall Capacity */}
        <div className="bg-white rounded-[15px] p-[12px_14px] flex items-center gap-[10px] border border-[#AEAEAE]/60">
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#D97706]/10 text-[#D97706] flex items-center justify-center text-[16px] shrink-0">
            <BarChart2 size={16} />
          </div>
          <div>
            <div className="text-[11px] text-[#8a8a9a] mb-[1px]">Overall Capacity</div>
            <div className="text-[17px] font-bold text-[#D97706] leading-none">{stats.overallCapacity}%</div>
          </div>
        </div>

        {/* Card 3: Page Views */}
        <div className="bg-white rounded-[15px] p-[12px_14px] flex items-center gap-[10px] border border-[#AEAEAE]/60">
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#D3CBF5]/30 text-[#5331EA] flex items-center justify-center text-[16px] shrink-0">
            <Eye size={16} />
          </div>
          <div>
            <div className="text-[11px] text-[#8a8a9a] mb-[1px]">Page Views</div>
            <div className="text-[17px] font-bold text-[#1c1525] leading-none">{stats.pageViews.toLocaleString()}</div>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-white rounded-[15px] p-[12px_14px] flex items-center gap-[10px] border border-[#AEAEAE]/60">
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#0AC655]/10 text-[#0AC655] flex items-center justify-center text-[16px] shrink-0">
            <Gem size={16} />
          </div>
          <div>
            <div className="text-[11px] text-[#8a8a9a] mb-[1px]">Total Revenue</div>
            <div className="text-[17px] font-bold text-[#1c1525] leading-none">₹{stats.totalRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Row 2: Daily ticket sales (LineChart) + Event Summary Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
        {/* Daily Ticket Sales Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-[15px] p-[14px_16px] border border-[#AEAEAE]/60 flex flex-col justify-between">
          <div className="text-[13px] font-bold mb-[10px] flex items-center justify-between">
            <span>Daily ticket sales and revenue — last 30 days</span>
            <div className="flex gap-[12px] text-[10px] text-[#8a8a9a] font-medium">
              <span className="flex items-center">
                <span className="inline-block w-[7px] h-[7px] rounded-full mr-[4px]" style={{ background: '#5331EA' }}></span>
                Ticket Sales
              </span>
              <span className="flex items-center">
                <span className="inline-block w-[7px] h-[7px] rounded-full mr-[4px]" style={{ background: '#0AC655' }}></span>
                Revenue
              </span>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySales} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f0effa" />
                <XAxis dataKey="date" stroke="#8a8a9a" fontSize={10} tickLine={false} />
                <YAxis stroke="#8a8a9a" fontSize={10} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#5331EA" strokeWidth={2} dot={false} fill="rgba(83,49,234,0.08)" />
                <Line type="monotone" dataKey="revenue" stroke="#0AC655" strokeWidth={2} dot={false} fill="rgba(10,198,85,0.06)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Key Information / Other Details */}
        <div className="bg-white rounded-[15px] p-[14px_16px] border border-[#AEAEAE]/60 flex flex-col justify-between">
          <div>
            <div className="text-[13px] font-bold mb-[12px]">Event Details & Settings</div>
            <div className="space-y-3.5 text-xs text-slate-800">
              <div className="flex justify-between items-center pb-2 border-b border-[#AEAEAE]/20">
                <span className="text-[#8a8a9a]">Event Duration</span>
                <span className="font-semibold">{details.duration}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#AEAEAE]/20">
                <span className="text-[#8a8a9a]">Location</span>
                <span className="font-semibold truncate max-w-[140px] text-right">{details.location}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#AEAEAE]/20">
                <span className="text-[#8a8a9a]">Approval Status</span>
                <span className="inline-block px-2 py-0.5 rounded-[5px] bg-[#0AC655]/10 text-[#0AC655] font-bold text-[10px]">
                  {details.approvalStatus}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#AEAEAE]/20">
                <span className="text-[#8a8a9a]">Verifier Staff</span>
                <span className="font-semibold">{details.verifierStaff} Scanners Active</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#AEAEAE]/20">
                <span className="text-[#8a8a9a]">Platform Fee Rate</span>
                <span className="font-semibold text-[#5331EA]">{details.platformFeeRate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8a8a9a]">Payout Action</span>
                <span className="inline-block px-2 py-0.5 rounded-[5px] bg-[#5331EA]/10 text-[#5331EA] font-bold text-[10px]">
                  {details.payoutAction}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Demographics Table + Donut Chart + Top Booking Locations Column Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
        {/* Attendees Demographics Table View */}
        <div className="bg-white rounded-[15px] p-[14px_16px] border border-[#AEAEAE]/60 flex flex-col justify-between">
          <div>
            <div className="text-[13px] font-bold mb-[12px]">Attendees Demographic Breakdown</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fb] border-b border-[#AEAEAE] text-slate-500 font-semibold text-[10px] uppercase">
                    <th className="py-2.5 px-3 rounded-l-md">Category</th>
                    <th className="py-2.5 px-2 text-center">Booked</th>
                    <th className="py-2.5 px-2 text-center">Attended</th>
                    <th className="py-2.5 px-2 text-center">Remaining</th>
                    <th className="py-2.5 px-3 text-right rounded-r-md">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#AEAEAE] text-slate-800">
                  {demographics.map((row, idx) => {
                    const remaining = row.booked - row.checkedIn;
                    const rate = row.booked > 0 ? ((row.checkedIn / row.booked) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold">{row.category}</td>
                        <td className="py-2.5 px-2 text-center">{row.booked.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-center">{row.checkedIn.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-[#ED4D1B]">{remaining.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#0AC655]/10 text-[#0AC655] font-bold text-[10px]">
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Total Viewers Conversion Analysis (PieChart) */}
        <div className="bg-white rounded-[15px] p-[14px_16px] border border-[#AEAEAE]/60 flex flex-col justify-between">
          <div className="text-[13px] font-bold mb-[10px]">Visitor Conversion Analysis</div>
          <div className="h-[140px] w-full flex items-center justify-center shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conversionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {conversionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 mt-2 text-[11px] text-slate-800 px-2 font-medium">
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="inline-block w-[8px] h-[8px] rounded-full mr-[6px]" style={{ background: '#5331EA' }}></span>
                Booked Tickets
              </span>
              <span className="font-bold text-[#5331EA]">{conversion.bookedTickets.toLocaleString()} ({bookedPercent}%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="inline-block w-[8px] h-[8px] rounded-full mr-[6px]" style={{ background: '#D3CBF5' }}></span>
                Only Viewed
              </span>
              <span className="font-bold text-slate-500">{conversion.onlyViewed.toLocaleString()} ({onlyViewedPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Top Booking Locations (Vertical Columns BarChart) */}
        <div className="bg-white rounded-[15px] p-[14px_16px] border border-[#AEAEAE]/60 flex flex-col justify-between">
          <div className="text-[13px] font-bold mb-[10px]">Top Booking Locations</div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locations} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f0effa" />
                <XAxis dataKey="city" stroke="#8a8a9a" fontSize={10} tickLine={false} />
                <YAxis stroke="#8a8a9a" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.purple} radius={4} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Ticket Category Earnings & Organizer net share */}
      <div className="bg-white rounded-[15px] p-[14px_16px] border border-[#AEAEAE]/60 flex flex-col">
        <div className="text-[13px] font-bold mb-[12px]">Ticket Earnings Breakdown & Net Organizer Revenue</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-[#AEAEAE] text-slate-500 font-semibold text-[10px] uppercase">
                <th className="py-3 px-3 rounded-l-md">Category</th>
                <th className="py-3 px-2 text-right">Price (₹)</th>
                <th className="py-3 px-2 text-right">Base Price (₹)</th>
                <th className="py-3 px-2 text-right">Ticket GST (18%)</th>
                <th className="py-3 px-2 text-center">Qty Sold</th>
                <th className="py-3 px-2 text-right">Gross Revenue (₹)</th>
                <th className="py-3 px-2 text-right">Platform Fee (6%)</th>
                <th className="py-3 px-2 text-right">Platform GST (18%)</th>
                <th className="py-3 px-3 text-right rounded-r-md">Org. Net Share (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#AEAEAE] text-slate-800">
              {earnings.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 font-semibold">{row.category}</td>
                  <td className="py-3 px-2 text-right">₹{row.price.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right">₹{row.basePrice.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-slate-500">₹{row.ticketGst.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center font-medium">{row.qty.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right font-semibold text-slate-900">₹{row.gross.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right text-slate-500">₹{row.platformFee.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-slate-500">₹{row.platformGst.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#5331EA]">
                    ₹{row.orgRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-[#f8f9fb] border-t border-[#AEAEAE]">
                <td className="py-3 px-3 rounded-l-md" colSpan={4}>Total Earnings Summary</td>
                <td className="py-3 px-2 text-center">{totalQtySold.toLocaleString()}</td>
                <td className="py-3 px-2 text-right text-slate-900">₹{totalGross.toLocaleString()}</td>
                <td className="py-3 px-2 text-right text-slate-700">₹{totalPlatformFee.toFixed(2)}</td>
                <td className="py-3 px-2 text-right text-slate-700">₹{totalPlatformGst.toFixed(2)}</td>
                <td className="py-3 px-3 text-right text-[#5331EA] rounded-r-md text-sm font-extrabold">
                  ₹{totalOrgRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
