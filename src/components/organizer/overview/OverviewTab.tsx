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
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Ticket, 
  BarChart2, 
  Eye, 
  Gem,
  RefreshCw
} from 'lucide-react';
import { OverviewData } from './types';

interface OverviewTabProps {
  stats: OverviewData;
  fetchBookings: () => void;
  listingName?: string;
}

// Chart Colors defined in target design
const COLORS = {
  navy: '#1c1525',
  purple: '#7c5cf0',
  purpleDark: '#5b3fd4',
  orange: '#f5821f',
  orangeLight: '#fdecd9',
  green: '#16c995',
  greenLight: '#e3f9f1',
  teal: '#22c1d6',
  bg: '#f4f5fa',
  card: '#ffffff',
  text: '#1c1525',
  muted: '#8a8a9a',
  border: '#edeef4'
};

// 1. Exact Line Chart data matching HTML (Ticket Sales and Revenue)
const lineChartData = [
  { date: '09 Jan', sales: 120, revenue: 100 },
  { date: '12 Jan', sales: 160, revenue: 140 },
  { date: '14 Jan', sales: 180, revenue: 160 },
  { date: '18 Jan', sales: 150, revenue: 130 },
  { date: '21 Jan', sales: 200, revenue: 180 },
  { date: '19 Oct', sales: 260, revenue: 230 },
  { date: '21 Oct', sales: 520, revenue: 470 },
  { date: '23 Oct', sales: 480, revenue: 430 },
  { date: '16 Dec', sales: 300, revenue: 270 },
  { date: '16 Dec', sales: 260, revenue: 230 },
  { date: '17 Dec', sales: 240, revenue: 210 },
  { date: '22 Dec', sales: 300, revenue: 270 },
  { date: '26 Dec', sales: 260, revenue: 230 },
  { date: '27 Dec', sales: 180, revenue: 160 },
  { date: '29 Dec', sales: 160, revenue: 140 }
];

// 2. Booking Source Distribution Pie Data
const pieData = [
  { name: 'Direct Site', value: 40, color: COLORS.purpleDark },
  { name: 'Partner Sites', value: 28, color: COLORS.orange },
  { name: 'Social Media', value: 22, color: COLORS.green },
  { name: 'Manual', value: 10, color: '#d8d6e8' }
];

// 3. Top Booking Locations horizontal bar chart
const locationData = [
  { city: 'Balmoria', count: 240, color: COLORS.orange },
  { city: 'Hanchester City', count: 150, color: COLORS.orange },
  { city: 'Palsand', count: 90, color: COLORS.orange },
  { city: 'Michbarra', count: 60, color: COLORS.orange }
];

// 4. Sales Velocity Rank List
const salesVelocityList = [
  { rank: 1, tier: 'VIP Pass', sub: '- High Demand', rate: '45 Tickets/Day' },
  { rank: 2, tier: 'VIP Pass', sub: '- High Demand', rate: '40 Tickets/Day' },
  { rank: 3, tier: 'VIP Pass', sub: '- High Demand', rate: '22 Tickets/Day' },
  { rank: 4, tier: 'Special Access', sub: '- High Demand', rate: '15 Tickets/Day' },
  { rank: 5, tier: 'Staff Tier', sub: '- High Demand', rate: '10 Tickets/Day' },
  { rank: 6, tier: 'Staff Tier', sub: '- High Demand', rate: '8 Tickets/Day' },
  { rank: 7, tier: 'Partner Tier', sub: '- High Demand', rate: '7 Tickets/Day' },
  { rank: 8, tier: 'Partner Tier', sub: '- High Demand', rate: '6 Tickets/Day' }
];

// 5. Hourly Booking Sales Frequency vertical bar chart
const hourlyData = [
  { name: 'Morning', A: 90, B: 70 },
  { name: 'Afternoon', A: 150, B: 170 },
  { name: 'Evening', A: 230, B: 210 },
  { name: 'Night', A: 140, B: 90 }
];

// 6. Attendee Demographics Trend area stacked chart
const demographicsData = [
  { date: '18 Jul', '18-24': 60, '25-34': 40, '35-44': 30, '45+': 20 },
  { date: '5 Jan', '18-24': 90, '25-34': 70, '35-44': 50, '45+': 30 },
  { date: '18 Dec', '18-24': 140, '25-34': 110, '35-44': 80, '45+': 40 },
  { date: '15 Dec', '18-24': 160, '25-34': 150, '35-44': 100, '45+': 60 },
  { date: '22 Dec', '18-24': 120, '25-34': 180, '35-44': 130, '45+': 80 },
  { date: '29 Dec', '18-24': 90, '25-34': 140, '35-44': 160, '45+': 100 },
  { date: '45+', '18-24': 70, '25-34': 100, '35-44': 150, '45+': 120 }
];

export default function OverviewTab({ stats, fetchBookings, listingName }: OverviewTabProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[250px]">
        <RefreshCw className="animate-spin text-zinc-400 mb-2" size={28} />
        <p className="text-zinc-600 font-semibold text-xs">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-[12px] animate-fadeIn text-[#1c1525] font-sans pb-2">
      
      {/* Header Info */}
      <div className="relative">
        <h1 className="text-[18px] font-bold text-[#1c1525] text-center">Overview</h1>
        <p className="text-center text-[#8a8a9a] text-[12px] mt-[1px] mb-[12px]">
          {listingName || 'TechNova Summit 2026'}
        </p>
        <button 
          onClick={fetchBookings}
          className="absolute right-0 top-0 p-1 border border-zinc-200 bg-white rounded-md hover:bg-zinc-50 transition-colors shadow-sm"
          title="Refresh statistics"
        >
          <RefreshCw size={12} className="text-[#8a8a9a]" />
        </button>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px]">
        {/* Card 1: Total Tickets Sold */}
        <div className="bg-white rounded-[12px] p-[12px_14px] flex items-center gap-[10px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60">
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#eae6fd] text-[#7c5cf0] flex items-center justify-center text-[16px] shrink-0">
            <Ticket size={16} />
          </div>
          <div>
            <div className="text-[11px] text-[#8a8a9a] mb-[1px]">Total Tickets Sold</div>
            <div className="text-[17px] font-bold text-[#1c1525] leading-none">4,285</div>
          </div>
        </div>

        {/* Card 2: Overall Capacity */}
        <div className="bg-white rounded-[12px] p-[12px_14px] flex items-center gap-[10px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60">
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#fdecd9] text-[#f5821f] flex items-center justify-center text-[16px] shrink-0">
            <BarChart2 size={16} />
          </div>
          <div>
            <div className="text-[11px] text-[#8a8a9a] mb-[1px]">Overall Capacity</div>
            <div className="text-[17px] font-bold text-[#f5821f] leading-none">85.7%</div>
          </div>
        </div>

        {/* Card 3: Page Views */}
        <div className="bg-white rounded-[12px] p-[12px_14px] flex items-center gap-[10px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60">
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#ece6fb] text-[#8a4fe0] flex items-center justify-center text-[16px] shrink-0">
            <Eye size={16} />
          </div>
          <div>
            <div className="text-[11px] text-[#8a8a9a] mb-[1px]">Page Views</div>
            <div className="text-[17px] font-bold text-[#1c1525] leading-none">14,997</div>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-white rounded-[12px] p-[12px_14px] flex items-center gap-[10px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60">
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#e3f9f1] text-[#16c995] flex items-center justify-center text-[16px] shrink-0">
            <Gem size={16} />
          </div>
          <div>
            <div className="text-[11px] text-[#8a8a9a] mb-[1px]">Total Revenue</div>
            <div className="text-[17px] font-bold text-[#1c1525] leading-none">₹8,54,000</div>
          </div>
        </div>
      </div>

      {/* Row 2: line chart + revenue table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
        {/* Daily Ticket Sales Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-[12px] p-[14px_16px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60 flex flex-col justify-between">
          <div className="text-[13px] font-bold mb-[10px] flex items-center justify-between">
            <span>Daily ticket sales and revenue — last 30 days</span>
            <div className="flex gap-[12px] text-[10px] text-[#8a8a9a] font-medium">
              <span className="flex items-center">
                <span className="inline-block w-[7px] h-[7px] rounded-full mr-[4px]" style={{ background: '#7c5cf0' }}></span>
                Ticket Sales
              </span>
              <span className="flex items-center">
                <span className="inline-block w-[7px] h-[7px] rounded-full mr-[4px]" style={{ background: '#16c995' }}></span>
                Revenue
              </span>
            </div>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f0effa" />
                <XAxis dataKey="date" stroke="#8a8a9a" fontSize={10} tickLine={false} />
                <YAxis stroke="#8a8a9a" fontSize={10} tickLine={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#7c5cf0" 
                  strokeWidth={2} 
                  dot={false}
                  fill="rgba(124,92,240,0.08)"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#16c995" 
                  strokeWidth={2} 
                  dot={false}
                  fill="rgba(22,201,149,0.06)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown by Tier */}
        <div className="bg-white rounded-[12px] p-[14px_16px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60 flex flex-col justify-between">
          <div className="text-[13px] font-bold mb-[10px]">Revenue Breakdown by Tier</div>
          <div className="flex-1">
            <table className="w-full text-[11.5px] border-collapse">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#edeef4] text-[#8a8a9a] font-semibold text-[10px]">
                  <th className="py-[6px] px-[8px] text-left rounded-l-[4px]">Category</th>
                  <th className="py-[6px] px-[8px] text-left">Price</th>
                  <th className="py-[6px] px-[8px] text-left">Sold</th>
                  <th className="py-[6px] px-[8px] text-left">Contribution</th>
                  <th className="py-[6px] px-[8px] text-right rounded-r-[4px]">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edeef4] text-[#1c1525]">
                <tr>
                  <td className="py-[8px] px-[8px]">General Admission</td>
                  <td className="py-[8px] px-[8px]">₹150</td>
                  <td className="py-[8px] px-[8px]">2,800</td>
                  <td className="py-[8px] px-[8px]">
                    <span className="w-[50px] h-[5px] rounded-[3px] bg-[#f0effa] inline-block overflow-hidden mr-[4px] align-middle">
                      <i className="block h-full rounded-[3px]" style={{ width: '28%', background: '#7c5cf0' }}></i>
                    </span>
                    28%
                  </td>
                  <td className="py-[8px] px-[8px] text-right">₹4,20,000</td>
                </tr>
                <tr>
                  <td className="py-[8px] px-[8px]">Early Bird</td>
                  <td className="py-[8px] px-[8px]">₹100</td>
                  <td className="py-[8px] px-[8px]">1,000</td>
                  <td className="py-[8px] px-[8px]">
                    <span className="w-[50px] h-[5px] rounded-[3px] bg-[#f0effa] inline-block overflow-hidden mr-[4px] align-middle">
                      <i className="block h-full rounded-[3px]" style={{ width: '10%', background: '#7c5cf0' }}></i>
                    </span>
                    10%
                  </td>
                  <td className="py-[8px] px-[8px] text-right">₹3,15,000</td>
                </tr>
                <tr className="font-bold bg-[#f8f9fb] border-t border-[#edeef4]">
                  <td className="py-[8px] px-[8px] rounded-l-[4px]">Total</td>
                  <td className="py-[8px] px-[8px]"></td>
                  <td className="py-[8px] px-[8px]">4,250</td>
                  <td className="py-[8px] px-[8px]"></td>
                  <td className="py-[8px] px-[8px] text-right rounded-r-[4px]">₹8,35,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: donut + bar + sales velocity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px]">
        {/* Booking Source Distribution */}
        <div className="bg-white rounded-[12px] p-[14px_16px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60 flex flex-col justify-between">
          <div className="text-[13px] font-bold mb-[10px]">Booking Source Distribution</div>
          <div className="h-[140px] w-full flex items-center justify-center shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-row justify-between gap-[4px] mt-[10px] text-[11px] text-[#8a8a9a] px-2">
            {pieData.map((src, i) => (
              <span key={i} className="flex items-center shrink-0">
                <span className="inline-block w-[7px] h-[7px] rounded-full mr-[4px]" style={{ background: src.color }}></span>
                {src.name}
              </span>
            ))}
          </div>
        </div>

        {/* Top Booking Locations */}
        <div className="bg-white rounded-[12px] p-[14px_16px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60 flex flex-col justify-between">
          <div className="text-[13px] font-bold mb-[10px]">Top Booking Locations</div>
          <div className="h-[175px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={locationData}
                layout="vertical"
                margin={{ left: -25, right: 10, top: 0, bottom: 0 }}
              >
                <XAxis type="number" stroke="#8a8a9a" fontSize={10} tickLine={false} />
                <YAxis dataKey="city" type="category" stroke="#8a8a9a" fontSize={10} tickLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.orange} radius={4} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Velocity */}
        <div className="bg-white rounded-[12px] p-[14px_16px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60 flex flex-col">
          <div className="text-[13px] font-bold mb-[10px]">Sales Velocity</div>
          <div className="flex justify-between items-center py-[6px] px-[8px] bg-[#f8f9fb] text-[10px] text-[#8a8a9a] font-bold uppercase tracking-wider rounded-t-[4px] border-b border-[#edeef4]">
            <span># Ticket Tier</span>
            <span>Current Sales Rate</span>
          </div>
          <div className="divide-y divide-[#edeef4] max-h-[140px] overflow-y-auto pr-1">
            {salesVelocityList.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-[6px] px-[8px] text-[11.5px] border-b border-[#edeef4] last:border-b-0">
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-[16px] h-[16px] rounded-full bg-[#eee9fc] text-[#7c5cf0] font-bold text-[9.5px] mr-[6px]">
                    {item.rank}
                  </span>
                  <span className="font-semibold text-[#1c1525]">{item.tier}</span>
                  <span className="text-[#8a8a9a] text-[10px] ml-[3px]">{item.sub}</span>
                </div>
                <div className="font-bold text-[#1c1525] text-right">{item.rate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: hourly bar + area chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[12px]">
        {/* Hourly Booking Sales Frequency */}
        <div className="bg-white rounded-[12px] p-[14px_16px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60">
          <div className="text-[13px] font-bold mb-[10px]">Hourly Booking Sales Frequency</div>
          <div className="h-[170px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f0effa" />
                <XAxis dataKey="name" stroke="#8a8a9a" fontSize={10} tickLine={false} />
                <YAxis stroke="#8a8a9a" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="A" fill="#7c5cf0" radius={3} barSize={22} />
                <Bar dataKey="B" fill="#16c995" radius={3} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics stacked area chart */}
        <div className="bg-white rounded-[12px] p-[14px_16px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60">
          <div className="text-[13px] font-bold mb-[10px]">Attendee Demographics Trend (Area Stacked)</div>
          <div className="h-[170px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demographicsData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f0effa" />
                <XAxis dataKey="date" stroke="#8a8a9a" fontSize={10} tickLine={false} />
                <YAxis stroke="#8a8a9a" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="18-24" stackId="1" stroke="#7c5cf0" fill="rgba(124,92,240,0.35)" />
                <Area type="monotone" dataKey="25-34" stackId="1" stroke="#f5821f" fill="rgba(245,130,31,0.3)" />
                <Area type="monotone" dataKey="35-44" stackId="1" stroke="#16c995" fill="rgba(22,201,149,0.3)" />
                <Area type="monotone" dataKey="45+" stackId="1" stroke="#22c1d6" fill="rgba(34,193,214,0.25)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
