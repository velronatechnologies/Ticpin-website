'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Activity, 
  Ticket, 
  Layers, 
  IndianRupee, 
  TrendingUp, 
  RefreshCw, 
  PauseCircle, 
  PlayCircle,
  HelpCircle,
  ArrowRightLeft,
  Calendar,
  LayoutDashboard
} from 'lucide-react';

interface TicketTier {
  name: string;
  price: number;
  capacity: number;
  sold: number;
  remaining: number;
  salesProgress: number;
  status: 'Sold Out' | 'Low Stock' | 'Available';
}

interface OrganizedEvent {
  id: string;
  name: string;
  category: 'Tech Summit' | 'Play' | 'Dining';
  dateTime: string;
  year: string;
  status: 'Approved' | 'Sales Paused' | 'Completed';
  capacity: number;
  sold: number;
  remaining: number;
  tiersCount: number;
  revenue: number;
  imageColor: string;
  tiers: TicketTier[];
}

const mockEvents: OrganizedEvent[] = [
  {
    id: 'TechNova Summit 2026',
    name: 'TechNova Summit 2026',
    category: 'Tech Summit',
    dateTime: '11 May - 3:00 PM',
    year: '2026',
    status: 'Approved',
    capacity: 5000,
    sold: 1100,
    remaining: 3900,
    tiersCount: 3,
    revenue: 4200000,
    imageColor: 'from-[#7c5cf0] to-[#5b3fd4]',
    tiers: [
      { name: 'Early Bird', price: 3000, capacity: 1000, sold: 1000, remaining: 0, salesProgress: 100, status: 'Sold Out' },
      { name: 'General Admission', price: 4000, capacity: 3500, sold: 100, remaining: 3400, salesProgress: 3, status: 'Low Stock' },
      { name: 'VIP Pass', price: 6000, capacity: 500, sold: 0, remaining: 500, salesProgress: 0, status: 'Low Stock' }
    ]
  },
  {
    id: '13303718',
    name: 'Indoor Futsal League',
    category: 'Play',
    dateTime: '11 May - 3:30 PM',
    year: '2026',
    status: 'Approved',
    capacity: 1000,
    sold: 750,
    remaining: 250,
    tiersCount: 2,
    revenue: 420000,
    imageColor: 'from-[#16c995] to-[#0f9f75]',
    tiers: [
      { name: 'Regular Entry', price: 500, capacity: 800, sold: 700, remaining: 100, salesProgress: 87.5, status: 'Low Stock' },
      { name: 'Premium Seating', price: 1000, capacity: 200, sold: 50, remaining: 150, salesProgress: 25, status: 'Available' }
    ]
  },
  {
    id: '13303189',
    name: 'Restaurant Week Special',
    category: 'Play',
    dateTime: '20 May - 3:30 PM',
    year: '2026',
    status: 'Sales Paused',
    capacity: 200,
    sold: 65,
    remaining: 135,
    tiersCount: 1,
    revenue: 3155000,
    imageColor: 'from-[#f5821f] to-[#d46912]',
    tiers: [
      { name: 'Standard Reservation', price: 1500, capacity: 200, sold: 65, remaining: 135, salesProgress: 32.5, status: 'Available' }
    ]
  },
  {
    id: '13302239',
    name: 'Restaurant Week Special',
    category: 'Dining',
    dateTime: '12 May - 3:30 PM',
    year: '2026',
    status: 'Completed',
    capacity: 100,
    sold: 175,
    remaining: 250,
    tiersCount: 1,
    revenue: 350000,
    imageColor: 'from-[#22c1d6] to-[#1aa0b2]',
    tiers: [
      { name: 'Standard Reservation', price: 2000, capacity: 100, sold: 175, remaining: 250, salesProgress: 100, status: 'Sold Out' }
    ]
  }
];

export default function EventDetailsTab() {
  const [events, setEvents] = useState<OrganizedEvent[]>(mockEvents);
  const [selectedEventId, setSelectedEventId] = useState<string>('TechNova Summit 2026');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  const handleToggleStatus = (eventId: string, tierIndex: number) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id !== eventId) return evt;
      const updatedTiers = [...evt.tiers];
      const tier = updatedTiers[tierIndex];
      tier.status = tier.status === 'Sold Out' ? 'Available' : 'Sold Out';
      return { ...evt, tiers: updatedTiers };
    }));
  };

  const filteredEvents = events.filter(evt => {
    const matchesCategory = selectedCategory === 'all' || evt.category === selectedCategory;
    const matchesSearch = evt.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-[12px] animate-fadeIn text-[#1c1525] font-sans pb-2">
      
      {/* 1. Organized Events List Card */}
      <div className="bg-white rounded-[12px] p-[14px_16px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60">
        
        {/* List Header controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
          <div className="flex items-center gap-6">
            <h2 className="text-[15px] font-bold text-[#1c1525]">Organized Events List</h2>
            
            {/* Filter by Category Selector */}
            <div className="flex items-center gap-1 text-[11.5px] text-[#8a8a9a] font-semibold">
              <span className="mr-1">Filter by Category:</span>
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`px-[8px] py-[3px] rounded-[4px] border ${selectedCategory === 'all' ? 'bg-[#5b3fd4] border-[#5b3fd4] text-white' : 'bg-[#f8f9fb] border-[#edeef4] text-[#1c1525]'} transition-all`}
              >
                All
              </button>
              <button 
                onClick={() => setSelectedCategory('Tech Summit')}
                className={`px-[8px] py-[3px] rounded-[4px] border ${selectedCategory === 'Tech Summit' ? 'bg-[#5b3fd4] border-[#5b3fd4] text-white' : 'bg-[#f8f9fb] border-[#edeef4] text-[#1c1525]'} transition-all`}
              >
                Tech Summit
              </button>
              <button 
                onClick={() => setSelectedCategory('Play')}
                className={`px-[8px] py-[3px] rounded-[4px] border ${selectedCategory === 'Play' ? 'bg-[#5b3fd4] border-[#5b3fd4] text-white' : 'bg-[#f8f9fb] border-[#edeef4] text-[#1c1525]'} transition-all`}
              >
                Play
              </button>
              <button 
                onClick={() => setSelectedCategory('Dining')}
                className={`px-[8px] py-[3px] rounded-[4px] border ${selectedCategory === 'Dining' ? 'bg-[#5b3fd4] border-[#5b3fd4] text-white' : 'bg-[#f8f9fb] border-[#edeef4] text-[#1c1525]'} transition-all`}
              >
                Dining
              </button>
            </div>
          </div>

          <div className="flex items-center gap-[10px] w-full md:w-auto">
            {/* Search inputs */}
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder="Search events by name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[240px] h-[34px] pl-8 pr-3 text-[12px] bg-white border border-[#edeef4] rounded-[8px] focus:outline-none focus:border-[#5b3fd4] text-[#1c1525]"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-[#8a8a9a]" />
            </div>

            {/* Create button */}
            <button className="h-[34px] px-3.5 bg-[#5b3fd4] hover:bg-[#4d32b5] text-white text-[12px] font-semibold rounded-[8px] flex items-center gap-1.5 transition-colors">
              <Plus size={14} />
              <span>Create New Event</span>
            </button>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px] border-collapse">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-[#edeef4] text-[#8a8a9a] font-semibold text-[10.5px]">
                <th className="py-[6px] px-[8px] text-left rounded-l-[4px]">Event Name</th>
                <th className="py-[6px] px-[8px] text-left">Category</th>
                <th className="py-[6px] px-[8px] text-left">Date & Time</th>
                <th className="py-[6px] px-[8px] text-center">Status</th>
                <th className="py-[6px] px-[8px] text-center">Overall Capacity</th>
                <th className="py-[6px] px-[8px] text-center">Overall Sold</th>
                <th className="py-[6px] px-[8px] text-center">Remaining Tickets</th>
                <th className="py-[6px] px-[8px] text-center">TicketCategories</th>
                <th className="py-[6px] px-[8px] text-right">Revenue (₹)</th>
                <th className="py-[6px] px-[8px] text-center rounded-r-[4px] w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edeef4] text-[#1c1525]">
              {filteredEvents.map((evt) => {
                const isSelected = evt.id === selectedEventId;
                
                // Solid pill colors from design mockup
                let statusBg = 'bg-[#7c5cf0]';
                let statusText = 'Approved-Purple';
                if (evt.status === 'Sales Paused') {
                  statusBg = 'bg-[#f5821f]';
                  statusText = 'Sales Paused Orange';
                } else if (evt.status === 'Completed') {
                  statusBg = 'bg-[#16c995]';
                  statusText = 'Completed Green';
                }

                // Category pill color
                let catBg = 'bg-[#ece6fb] text-[#7c5cf0]';
                if (evt.category === 'Play') catBg = 'bg-[#e3f9f1] text-[#16c995]';
                if (evt.category === 'Dining') catBg = 'bg-[#fdecd9] text-[#f5821f]';

                return (
                  <tr 
                    key={evt.id} 
                    className={`hover:bg-zinc-50/60 transition-colors cursor-pointer ${isSelected ? 'bg-zinc-50' : ''}`}
                    onClick={() => setSelectedEventId(evt.id)}
                  >
                    <td className="py-[7px] px-[8px] font-semibold text-[#1c1525]">
                      <div className="flex items-center gap-2">
                        <div className={`w-[28px] h-[28px] rounded-[6px] bg-gradient-to-tr ${evt.imageColor} shrink-0 flex items-center justify-center text-white text-[10px] font-bold`}>
                          TIC
                        </div>
                        <div>
                          <div className="line-clamp-1">{evt.name}</div>
                          <div className="text-[9.5px] text-[#8a8a9a] font-normal mt-[1px]">ID: {evt.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-[7px] px-[8px]">
                      <span className={`inline-block px-[6px] py-[2.5px] rounded-[4px] text-[10px] font-semibold ${catBg}`}>
                        {evt.category}
                      </span>
                    </td>
                    <td className="py-[7px] px-[8px] text-[#5b596e]">
                      <div>{evt.dateTime}</div>
                      <div className="text-[10px] text-[#8a8a9a]">Date - {evt.year}</div>
                    </td>
                    <td className="py-[7px] px-[8px] text-center">
                      <span className={`inline-block px-[6px] py-[2.5px] rounded-[4px] text-[9.5px] font-bold text-white ${statusBg}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="py-[7px] px-[8px] text-center font-medium">{evt.capacity}</td>
                    <td className="py-[7px] px-[8px] text-center font-medium">{evt.sold}</td>
                    <td className="py-[7px] px-[8px] text-center font-medium">{evt.remaining}</td>
                    <td className="py-[7px] px-[8px] text-center font-medium">{evt.tiersCount}</td>
                    <td className="py-[7px] px-[8px] text-right font-bold">₹{evt.revenue.toLocaleString()}</td>
                    <td className="py-[7px] px-[8px]" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button className="p-1 text-zinc-500 hover:text-blue-500 hover:bg-zinc-100 rounded-md border border-[#edeef4] transition-colors" title="Edit Event">
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={() => setSelectedEventId(evt.id)}
                          className={`p-1 rounded-md border border-[#edeef4] transition-colors ${isSelected ? 'text-[#5b3fd4] bg-zinc-100' : 'text-zinc-500 hover:text-[#5b3fd4] hover:bg-zinc-100'}`}
                          title="View Details"
                        >
                          <Eye size={12} />
                        </button>
                        <button className="p-1 text-zinc-500 hover:text-red-500 hover:bg-zinc-100 rounded-md border border-[#edeef4] transition-colors" title="Delete Event">
                          <Trash2 size={12} />
                        </button>
                        <button 
                          onClick={() => setSelectedEventId(evt.id)}
                          className="h-[22px] px-1.5 bg-[#f8f9fb] border border-[#edeef4] text-[10px] text-zinc-600 font-semibold hover:bg-zinc-100 hover:text-black rounded-md flex items-center gap-1 transition-all"
                        >
                          <ArrowRightLeft size={10} />
                          <span>Details View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center gap-1.5 mt-3 pt-2 border-t border-[#edeef4] text-[11px] text-[#8a8a9a]">
          <button className="px-2.5 py-1 hover:bg-zinc-100 rounded-[4px] border border-[#edeef4] font-semibold text-[#1c1525]">Previous</button>
          <button className="w-[22px] h-[22px] bg-[#5b3fd4] text-white rounded-[4px] font-bold flex items-center justify-center">1</button>
          <button className="w-[22px] h-[22px] hover:bg-zinc-100 text-[#1c1525] rounded-[4px] border border-[#edeef4] flex items-center justify-center">2</button>
          <button className="w-[22px] h-[22px] hover:bg-zinc-100 text-[#1c1525] rounded-[4px] border border-[#edeef4] flex items-center justify-center">3</button>
          <span className="px-1 text-[#8a8a9a]">...</span>
          <button className="px-2.5 py-1 hover:bg-zinc-100 rounded-[4px] border border-[#edeef4] font-semibold text-[#1c1525]">Next</button>
        </div>

      </div>

      {/* 2. Detailed Ticket Tier Breakdown Card */}
      <div>
        <h3 className="text-[13px] font-bold text-[#8a8a9a] mb-2 uppercase tracking-wide">
          Detailed Ticket Tier Breakdown & Logistics: {selectedEvent.name}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
          {/* Left card: Overall Metrics for Event */}
          <div className="bg-white rounded-[12px] p-[14px_16px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60 flex flex-col justify-between">
            <h4 className="text-[13px] font-bold text-[#1c1525] mb-2.5">Overall Metrics for {selectedEvent.name.split(' ')[0]}</h4>
            
            <div className="space-y-[10px] flex-1">
              {/* Metric 1 */}
              <div className="flex items-center justify-between py-[4px] border-b border-[#edeef4] last:border-b-0">
                <div className="flex items-center gap-2">
                  <div className="w-[26px] h-[26px] bg-[#eae6fd] text-[#7c5cf0] rounded-[6px] flex items-center justify-center">
                    <Layers size={13} />
                  </div>
                  <span className="text-[11.5px] text-[#8a8a9a]">Total Capacity</span>
                </div>
                <span className="text-[13px] font-bold text-[#1c1525]">{selectedEvent.capacity}</span>
              </div>

              {/* Metric 2 */}
              <div className="flex items-center justify-between py-[4px] border-b border-[#edeef4] last:border-b-0">
                <div className="flex items-center gap-2">
                  <div className="w-[26px] h-[26px] bg-[#ece6fb] text-[#8a4fe0] rounded-[6px] flex items-center justify-center">
                    <Ticket size={13} />
                  </div>
                  <span className="text-[11.5px] text-[#8a8a9a]">Overall Sold</span>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-bold text-[#1c1525] block">{selectedEvent.sold}</span>
                  <span className="text-[9.5px] text-[#8a8a9a]">({Math.round((selectedEvent.sold / selectedEvent.capacity) * 100)}% of capacity)</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex items-center justify-between py-[4px] border-b border-[#edeef4] last:border-b-0">
                <div className="flex items-center gap-2">
                  <div className="w-[26px] h-[26px] bg-[#fdecd9] text-[#f5821f] rounded-[6px] flex items-center justify-center">
                    <TrendingUp size={13} />
                  </div>
                  <span className="text-[11.5px] text-[#8a8a9a]">Overall Remaining</span>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-bold text-[#1c1525] block">{selectedEvent.remaining}</span>
                  <span className="text-[9.5px] text-[#8a8a9a]">({Math.round((selectedEvent.remaining / selectedEvent.capacity) * 100)}% remaining)</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="flex items-center justify-between py-[4px] border-b border-[#edeef4] last:border-b-0">
                <div className="flex items-center gap-2">
                  <div className="w-[26px] h-[26px] bg-[#e3f9f1] text-[#16c995] rounded-[6px] flex items-center justify-center">
                    <Layers size={13} />
                  </div>
                  <span className="text-[11.5px] text-[#8a8a9a]">Available Tiers</span>
                </div>
                <span className="text-[13px] font-bold text-[#1c1525]">{selectedEvent.tiersCount}</span>
              </div>

              {/* Metric 5 */}
              <div className="flex items-center justify-between py-[4px] border-b border-[#edeef4] last:border-b-0">
                <div className="flex items-center gap-2">
                  <div className="w-[26px] h-[26px] bg-zinc-100 text-zinc-700 rounded-[6px] flex items-center justify-center">
                    <IndianRupee size={13} />
                  </div>
                  <span className="text-[11.5px] text-[#8a8a9a]">Average Ticket Price (Overall)</span>
                </div>
                <span className="text-[13px] font-bold text-[#1c1525]">
                  ₹{Math.round(selectedEvent.revenue / (selectedEvent.sold || 1)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Sales Pace Progress bar */}
            <div className="mt-3 pt-2 border-t border-[#edeef4]">
              <div className="flex justify-between text-[10.5px] text-[#8a8a9a] mb-1 font-semibold">
                <span>Overall Sales Pace</span>
                <span>{Math.round((selectedEvent.sold / selectedEvent.capacity) * 100)}%</span>
              </div>
              <div className="w-full h-[6px] bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#7c5cf0] rounded-full transition-all duration-300"
                  style={{ width: `${(selectedEvent.sold / selectedEvent.capacity) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right card: Ticket Tiers Detailed Breakdown Table */}
          <div className="lg:col-span-2 bg-white rounded-[12px] p-[14px_16px] shadow-[0_1px_5px_rgba(20,20,50,0.03)] border border-gray-100/60 flex flex-col justify-between">
            <h4 className="text-[13px] font-bold text-[#1c1525] mb-2.5">Event Ticket Tiers Detailed Breakdown</h4>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-[11.5px] border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fb] border-b border-[#edeef4] text-[#8a8a9a] font-semibold text-[10px]">
                    <th className="py-[6px] px-[8px] text-left rounded-l-[4px]">Tier Name</th>
                    <th className="py-[6px] px-[8px] text-left">Price (₹)</th>
                    <th className="py-[6px] px-[8px] text-center">Capacity</th>
                    <th className="py-[6px] px-[8px] text-center">Sold</th>
                    <th className="py-[6px] px-[8px] text-center">Remaining</th>
                    <th className="py-[6px] px-[8px] text-left">Sales Progress</th>
                    <th className="py-[6px] px-[8px] text-center">Status</th>
                    <th className="py-[6px] px-[8px] text-center rounded-r-[4px] w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edeef4] text-[#1c1525]">
                  {selectedEvent.tiers.map((tier, idx) => {
                    let statusColor = 'bg-[#fdecd9] text-[#f5821f]'; // Low Stock
                    if (tier.status === 'Sold Out') statusColor = 'bg-red-50 text-red-500 border border-red-200';
                    else if (tier.status === 'Available') statusColor = 'bg-[#e3f9f1] text-[#16c995]';

                    return (
                      <tr key={idx} className="hover:bg-zinc-50/40 transition-colors">
                        <td className="py-[8px] px-[8px] font-semibold">{tier.name}</td>
                        <td className="py-[8px] px-[8px] font-semibold">₹{tier.price.toLocaleString()}</td>
                        <td className="py-[8px] px-[8px] text-center font-medium">{tier.capacity}</td>
                        <td className="py-[8px] px-[8px] text-center font-medium">{tier.sold}</td>
                        <td className="py-[8px] px-[8px] text-center font-medium">{tier.remaining}</td>
                        <td className="py-[8px] px-[8px]">
                          <div className="flex items-center gap-1.5 w-[110px]">
                            <div className="w-[60px] h-[5px] bg-[#f0effa] rounded-full overflow-hidden shrink-0">
                              <div 
                                className="h-full bg-[#7c5cf0] rounded-full" 
                                style={{ width: `${tier.salesProgress}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-semibold">{tier.salesProgress}%</span>
                          </div>
                        </td>
                        <td className="py-[8px] px-[8px] text-center">
                          <span className={`inline-block px-[6px] py-[2px] rounded-[4px] text-[9.5px] font-bold ${statusColor}`}>
                            {tier.status}
                          </span>
                        </td>
                        <td className="py-[8px] px-[8px]">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => handleToggleStatus(selectedEvent.id, idx)}
                              className="p-1 text-zinc-500 hover:text-blue-500 hover:bg-zinc-100 rounded border border-[#edeef4] transition-colors"
                              title="Toggle Status"
                            >
                              <ArrowRightLeft size={10} />
                            </button>
                            <button 
                              className="p-1 text-zinc-500 hover:text-amber-500 hover:bg-zinc-100 rounded border border-[#edeef4] transition-colors"
                              title={tier.status === 'Sold Out' ? 'Resume Sales' : 'Pause Sales'}
                            >
                              {tier.status === 'Sold Out' ? <PlayCircle size={10} /> : <PauseCircle size={10} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
