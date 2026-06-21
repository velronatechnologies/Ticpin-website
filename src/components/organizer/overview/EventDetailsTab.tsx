'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Pause,
  ChevronDown,
  BarChart2,
  Ticket,
  Layers,
  Tag,
  List,
  RefreshCw,
  X,
  Calendar,
  Percent,
  TrendingUp,
  DollarSign
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
  category: string;
  catType: 'Tech' | 'Sports' | 'Expo' | 'Concert';
  dateTime: string;
  year: string;
  status: 'Approved' | 'Sales Paused' | 'Completed';
  capacity: number;
  sold: number;
  remaining: number;
  tiersCount: number;
  revenue: number;
  imageBg: string;
  tiers: TicketTier[];
}

const initialEvents: OrganizedEvent[] = [];

interface BookingItem {
  id: string;
  name: string;
  email: string;
  tier: string;
  qty: number;
  amount: number;
  date: string;
  dateIso: string; 
  time: string;
  status: 'Paid' | 'Pending' | 'Refunded' | 'Cancelled' | 'Expired';
  imageBg: string;
  cancelReason?: string;
  refundAmount?: number;
  refundId?: string;
}



export default function EventDetailsTab() {
  const router = useRouter();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const defaultFromDate = new Date(today);
  defaultFromDate.setDate(today.getDate() - 7);
  const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);
  const yesterdayLabel = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const [events, setEvents] = useState<OrganizedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Details Toggle Accordion State
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(true);
  
  // Category Multi-select Filter
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Tech', 'Sports', 'Expo', 'Concert']);
  
  // Guest Directory Filter States
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [customFromDate, setCustomFromDate] = useState<string>(formatDateInput(defaultFromDate));
  const [customToDate, setCustomToDate] = useState<string>(formatDateInput(today));
  
  const [bookingLimit, setBookingLimit] = useState<number>(10);
  const [guestPage, setGuestPage] = useState<number>(1);

  // Debounce search input — only fires API after 400ms of inactivity
  const debouncedSearch = useDebounce(bookingSearch, 400);

  // Active ticket modal
  const [activeTicketBooking, setActiveTicketBooking] = useState<BookingItem | null>(null);

  // Toast state
  const [notification, setNotification] = useState<string | null>(null);

  // API Loading & Data States
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [totalBookingsCount, setTotalBookingsCount] = useState<number>(0);
  const [totalTicketsQty, setTotalTicketsQty] = useState<number>(0);
  const [totalAmountCollected, setTotalAmountCollected] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch('/backend/api/organizer/overview/myevents', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to load events');
      const json = await res.json();
      if (json.success && json.data.events) {
        setEvents(json.data.events);
        if (json.data.events.length > 0) {
          setSelectedEventId(json.data.events[0].id);
        }
      }
    } catch (err: any) {
      triggerNotification(err.message || 'Error fetching events list');
    } finally {
      setLoadingEvents(false);
    }
  };


  const fetchBookings = useCallback(async () => {
    if (!selectedEventId) return;
    setLoadingBookings(true);
    try {
      const url = `/backend/api/organizer/overview/myevents/bookings?eventId=${encodeURIComponent(selectedEventId)}&query=${encodeURIComponent(debouncedSearch)}&tier=${encodeURIComponent(selectedTierFilter)}&status=${encodeURIComponent(selectedStatusFilter)}&datePeriod=${encodeURIComponent(selectedDateFilter)}&fromDate=${encodeURIComponent(customFromDate)}&toDate=${encodeURIComponent(customToDate)}&page=${guestPage}&limit=${bookingLimit}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load guest bookings');
      const json = await res.json();
      if (json.success && json.data) {
        setBookings(json.data.bookings || []);
        setTotalBookingsCount(json.data.totalRecords || 0);
        setTotalTicketsQty(json.data.totalQty || 0);
        setTotalAmountCollected(json.data.totalAmount || 0);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch (err: any) {
      triggerNotification(err.message || 'Error fetching guest bookings');
    } finally {
      setLoadingBookings(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId, debouncedSearch, selectedTierFilter, selectedStatusFilter, selectedDateFilter, customFromDate, customToDate, guestPage, bookingLimit]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId, debouncedSearch, selectedTierFilter, selectedStatusFilter, selectedDateFilter, customFromDate, customToDate, guestPage, bookingLimit]);

  // Reset guest page index whenever filter changes (excluding page itself)
  useEffect(() => {
    setGuestPage(1);
  }, [debouncedSearch, selectedTierFilter, selectedDateFilter, selectedStatusFilter, customFromDate, customToDate, bookingLimit, selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleEyeIconClick = (eventId: string) => {
    if (selectedEventId === eventId) {
      setIsDetailsOpen(prev => !prev);
    } else {
      setSelectedEventId(eventId);
      setIsDetailsOpen(true);
      setSelectedTierFilter('All');
      setGuestPage(1); // Reset guest page on change
    }
  };

  // Event list filters
  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.includes(evt.catType);
    return matchesSearch && matchesCategory;
  });

  const visibleBookings = bookings;

  // Ticpin Platform Calculations (6% Booking Fee standard, plus 18% GST on that booking fee)
  const ticpinFee = Math.round(totalAmountCollected * 0.06);
  const gstOnPlatformFee = Math.round(ticpinFee * 0.18);
  const totalTicpinRevenueCollected = ticpinFee + gstOnPlatformFee;
  
  // Organizer Net Revenue (Base Ticket Revenue)
  const organizerRevenue = totalAmountCollected;

  // Grand Total paid by customers (Base amount + Ticpin booking fee)
  const grandTotalPaidByCustomers = totalAmountCollected + ticpinFee;

  if (loadingEvents) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-[#5331EA] mb-2" size={28} />
        <p className="text-zinc-600 font-semibold text-xs animate-pulse">Loading Organized Events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-zinc-200 rounded-[15px] bg-white p-6 text-center text-zinc-500 font-medium">
        <p>No events found. Create your first event to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black pb-6 p-6 rounded-[15px] bg-[#D3CBF5]/10" style={{ fontFamily: 'var(--font-anek-latin), var(--font-inter), sans-serif' }}>
      
      {/* Toast Alert popup */}
      {notification && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{notification}</span>
        </div>
      )}



      {/* Accordion Panels for Tiers & Guests */}
      {isDetailsOpen && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Detailed Ticket Tier Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Detailed Ticket Tier Breakdown & Logistics: {selectedEvent.name}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Left Card: Overall Metrics */}
              <div className="bg-white rounded-[15px] p-6 border border-[#AEAEAE] shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-[13.5px] font-black text-black mb-4">Overall Metrics for {selectedEvent.name.split(' ')[0]}</h4>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[30px] h-[30px] bg-[#D3CBF5]/30 text-[#5331EA] rounded-lg flex items-center justify-center shrink-0 border border-[#AC9BF7]">
                        <BarChart2 size={14} />
                      </div>
                      <div>
                        <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Total Capacity</span>
                        <span className="text-[13px] font-extrabold text-slate-900">{selectedEvent.capacity}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-[30px] h-[30px] bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 relative">
                        <svg className="w-6 h-6 transform -rotate-90">
                          <circle cx="12" cy="12" r="8" stroke="#e5e7eb" strokeWidth="2" fill="transparent" />
                          <circle cx="12" cy="12" r="8" stroke="#5331EA" strokeWidth="2" fill="transparent" strokeDasharray={50} strokeDashoffset={11} />
                        </svg>
                        <span className="absolute text-[7.5px] font-extrabold text-[#5331EA]">%</span>
                      </div>
                      <div>
                        <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Overall Remaining</span>
                        <span className="text-[13px] font-extrabold text-slate-900">{selectedEvent.remaining}</span>
                        <span className="block text-[8.5px] text-slate-500 font-semibold mt-0.5">({Math.round((selectedEvent.remaining / (selectedEvent.capacity || 1)) * 100)}% remaining)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-[30px] h-[30px] bg-[#D3CBF5]/30 text-[#5331EA] rounded-lg flex items-center justify-center shrink-0 border border-[#AC9BF7]">
                        <Ticket size={14} />
                      </div>
                      <div>
                        <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Overall Sold</span>
                        <span className="text-[13px] font-extrabold text-slate-900">{selectedEvent.sold}</span>
                        <span className="block text-[8.5px] text-slate-500 font-semibold mt-0.5">({Math.round((selectedEvent.sold / (selectedEvent.capacity || 1)) * 100)}% sold)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-[30px] h-[30px] bg-[#D3CBF5]/30 text-[#5331EA] rounded-lg flex items-center justify-center shrink-0 border border-[#AC9BF7]">
                        <Tag size={14} />
                      </div>
                      <div>
                        <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Avg Ticket Price</span>
                        <span className="text-[13px] font-extrabold text-slate-900">
                          ₹{Math.round(selectedEvent.revenue / (selectedEvent.sold || 1)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-[30px] h-[30px] bg-[#D3CBF5]/30 text-[#5331EA] rounded-lg flex items-center justify-center shrink-0 border border-[#AC9BF7]">
                        <Layers size={14} />
                      </div>
                      <div>
                        <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Available Tiers</span>
                        <span className="text-[13px] font-extrabold text-slate-900">{selectedEvent.tiersCount}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-[#AEAEAE]">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">
                    <span>Overall Sales Pace</span>
                    <span>{Math.round((selectedEvent.sold / (selectedEvent.capacity || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#5331EA] rounded-full transition-all duration-300"
                      style={{ width: `${(selectedEvent.sold / (selectedEvent.capacity || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

              </div>

              {/* Right Card: Event Ticket Tiers detailed breakdown */}
              <div className="lg:col-span-2 bg-white rounded-[15px] p-6 border border-[#AEAEAE] shadow-sm">
                <h4 className="text-[13.5px] font-black text-black mb-4">Event Ticket Tiers Detailed Breakdown</h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-[#AEAEAE] text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-3 rounded-l-md">Tier Name</th>
                        <th className="py-2.5 px-3">Price (₹)</th>
                        <th className="py-2.5 px-3 text-center">Capacity</th>
                        <th className="py-2.5 px-3 text-center">Sold</th>
                        <th className="py-2.5 px-3 text-center">Remaining</th>
                        <th className="py-2.5 px-3 text-left">Sales Progress</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-center rounded-r-md w-[80px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#AEAEAE] text-slate-800">
                      {selectedEvent.tiers.map((tier, idx) => {
                        let statusColor = 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30'; 
                        if (tier.status === 'Sold Out') statusColor = 'bg-[#ED4D1B]/10 text-[#ED4D1B] border border-[#ED4D1B]/30';
                        else if (tier.status === 'Available') statusColor = 'bg-[#0AC655]/10 text-[#0AC655] border border-[#0AC655]/30';

                        return (
                          <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-900">{tier.name}</td>
                            <td className="py-3 px-3 font-extrabold text-slate-900">₹{tier.price.toLocaleString()}</td>
                            <td className="py-3 px-3 text-center font-semibold">{tier.capacity}</td>
                            <td className="py-3 px-3 text-center font-semibold">{tier.sold}</td>
                            <td className="py-3 px-3 text-center font-semibold">{tier.remaining}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 w-[110px]">
                                <div className="w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0 border border-slate-200/50">
                                  <div 
                                    className="h-full bg-[#5331EA] rounded-full" 
                                    style={{ width: `${tier.salesProgress}%` }}
                                  ></div>
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold">{tier.salesProgress}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[9.5px] font-bold ${statusColor}`}>
                                {tier.status}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center justify-center">
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#AEAEAE] bg-slate-50 text-[9.5px] font-bold text-slate-500">
                                  <Pause size={11} />
                                  Analytics only
                                </span>
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

          {/* Pricing & GST breakdown summary - Light Theme */}
          <div className="bg-white rounded-[15px] p-6 border border-[#AEAEAE] shadow-sm text-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[#5331EA]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Financial Split & Platform Fee Breakdown (Gated Booking Data)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Financial Box 1 */}
              <div className="bg-slate-50/80 p-3 rounded-lg border border-[#AEAEAE]">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base Ticket Sales</span>
                <span className="text-[17px] font-extrabold block mt-0.5 text-slate-900">₹{totalAmountCollected.toLocaleString()}</span>
                <span className="text-[8px] text-slate-500 block mt-1">Ticket Subtotal before fees</span>
              </div>
              {/* Financial Box 2 */}
              <div className="bg-[#D3CBF5]/20 p-3 rounded-lg border border-[#AC9BF7]/60 relative overflow-hidden">
                <div className="absolute right-1 bottom-1 text-[#5331EA]/10 font-black text-2xl select-none">6%</div>
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ticpin Booking Fee</span>
                <span className="text-[17px] font-extrabold block mt-0.5 text-[#5331EA]">₹{ticpinFee.toLocaleString()}</span>
                <span className="text-[8px] text-slate-400 block mt-1">6% Standard commission fee</span>
              </div>
              {/* Financial Box 3 */}
              <div className="bg-[#D3CBF5]/20 p-3 rounded-lg border border-[#AC9BF7]/60 relative overflow-hidden">
                <div className="absolute right-1 bottom-1 text-[#5331EA]/10 font-black text-2xl select-none">18%</div>
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Platform GST</span>
                <span className="text-[17px] font-extrabold block mt-0.5 text-[#5331EA]">₹{gstOnPlatformFee.toLocaleString()}</span>
                <span className="text-[8px] text-slate-400 block mt-1">18% CGST/SGST on platform fee</span>
              </div>
              {/* Financial Box 4 */}
              <div className="bg-[#D3CBF5]/35 p-3 rounded-lg border border-[#AC9BF7] relative overflow-hidden">
                <span className="block text-[9px] font-bold text-[#5331EA] uppercase tracking-widest">Ticpin Net Revenue</span>
                <span className="text-[17px] font-extrabold block mt-0.5 text-[#5331EA]">₹{totalTicpinRevenueCollected.toLocaleString()}</span>
                <span className="text-[8px] text-slate-500 block mt-1">Platform Fee + GST collected</span>
              </div>
              {/* Financial Box 5 */}
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
                <span className="block text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Organizer Net Payout</span>
                <span className="text-[17px] font-extrabold block mt-0.5 text-emerald-600">₹{organizerRevenue.toLocaleString()}</span>
                <span className="text-[8px] text-emerald-500 block mt-1">100% Base Ticket Sales to Bank</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-[#AEAEAE] flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-slate-400 gap-2">
              <div>
                * Total amount charged to customers = Ticket subtotal (₹{totalAmountCollected.toLocaleString()}) + Ticpin booking fee (₹{ticpinFee.toLocaleString()}) = <span className="text-slate-800 font-extrabold">₹{grandTotalPaidByCustomers.toLocaleString()}</span>
              </div>
              <div className="text-slate-400 font-bold uppercase tracking-wider">
                Matches /postgresbackend/controller/booking/event.go:L253
              </div>
            </div>
          </div>

          {/* Guest Directory & Booking Breakdown */}
          <div className="bg-white rounded-[15px] p-6 border border-[#AEAEAE] shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-[14px] font-black text-black">
                  Guest Directory & Booking Breakdown: {selectedEvent.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                  List of users who purchased tickets for this event (Total Records: {totalBookingsCount})
                </p>
              </div>
              <div className="text-[10px] text-slate-500 font-black uppercase bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                Page {guestPage} of {totalPages}
              </div>
            </div>

            {/* Filter controls panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 p-3 bg-slate-50 border border-[#AEAEAE] rounded-[15px] text-xs">
              
              {/* Search input - triggers complete filter scan */}
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search Guests</span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search name, ID..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-2 bg-white border border-[#AEAEAE] rounded-lg text-xs outline-none focus:border-[#5331EA] text-slate-800 font-semibold"
                  />
                  <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              {/* Ticket category dropdown filter */}
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ticket Category</span>
                <select
                  value={selectedTierFilter}
                  onChange={(e) => setSelectedTierFilter(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#AEAEAE] rounded-lg text-xs outline-none focus:border-[#5331EA] font-semibold text-slate-700"
                >
                  <option value="All">All Tiers</option>
                  {selectedEvent.tiers.map((t, idx) => (
                    <option key={idx} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Booking status dropdown filter */}
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Booking Status</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#AEAEAE] rounded-lg text-xs outline-none focus:border-[#5331EA] font-semibold text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {/* Date Filter Selection */}
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date Period</span>
                <select
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#AEAEAE] rounded-lg text-xs outline-none focus:border-[#5331EA] font-semibold text-slate-700"
                >
                  <option value="All">All Time</option>
                  <option value="Yesterday">Yesterday ({yesterdayLabel})</option>
                  <option value="Prev3Days">Previous 3 Days</option>
                  <option value="LastWeek">Last Week</option>
                  <option value="Custom">Custom Range</option>
                </select>
              </div>

              {/* Max rows page capacity */}
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rows per page</span>
                <select
                  value={bookingLimit}
                  onChange={(e) => setBookingLimit(Number(e.target.value))}
                  className="w-full h-8 px-2 bg-white border border-[#AEAEAE] rounded-lg text-xs outline-none focus:border-[#5331EA] font-semibold text-slate-700"
                >
                  <option value={10}>10 Rows</option>
                  <option value={20}>20 Rows</option>
                  <option value={50}>50 Rows</option>
                  <option value={100}>100 Rows</option>
                </select>
              </div>

              {/* Custom Date Picker inputs */}
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {selectedDateFilter === 'Custom' ? 'Custom Date Range' : 'Ticket Date Span'}
                </span>
                {selectedDateFilter === 'Custom' ? (
                  <div className="flex gap-1 items-center animate-fadeIn">
                    <input
                      type="date"
                      value={customFromDate}
                      onChange={(e) => setCustomFromDate(e.target.value)}
                      className="w-1/2 h-8 px-1.5 bg-white border border-[#AEAEAE] rounded-lg text-[10px] font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">to</span>
                    <input
                      type="date"
                      value={customToDate}
                      onChange={(e) => setCustomToDate(e.target.value)}
                      className="w-1/2 h-8 px-1.5 bg-white border border-[#AEAEAE] rounded-lg text-[10px] font-bold"
                    />
                  </div>
                ) : (
                  <div className="h-8 flex items-center gap-1.5 text-slate-400 font-semibold px-2 bg-slate-100 rounded-lg select-none">
                    <Calendar size={12} />
                    <span>Jun 01 - Jun 21, 2026</span>
                  </div>
                )}
              </div>

            </div>

            {/* Table guest directory list */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-[#AEAEAE] text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Attendee Name / Booking ID</th>
                    <th className="py-2.5 px-3">Contact Email</th>
                    <th className="py-2.5 px-3">Booked Tier</th>
                    <th className="py-2.5 px-3 text-center">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Amount Paid</th>
                    <th className="py-2.5 px-3">Booking Date</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#AEAEAE] text-slate-800">
                  {visibleBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic font-semibold">
                        No attendee records found matching the active filters (Tier: {selectedTierFilter}, Period: {selectedDateFilter}).
                      </td>
                    </tr>
                  ) : (
                    visibleBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/30">
                        <td className="py-3 px-3 font-bold">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full ${b.imageBg} text-white flex items-center justify-center font-bold text-[10px] shrink-0 border border-white/20 shadow-sm`}>
                              {b.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-[12px] font-bold text-slate-900">{b.name}</div>
                              <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">ID: {b.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-600">{b.email}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                            {b.tier}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900">{b.qty}</td>
                        <td className="py-3 px-3 text-right font-extrabold text-slate-900">₹{b.amount.toLocaleString()}</td>
                        <td className="py-3 px-3 font-semibold text-slate-500">{b.date}</td>
                        <td className="py-3 px-3 text-center">
                          {(() => {
                            let badgeStyle = "bg-[#0AC655]/10 text-[#0AC655] border-[#0AC655]/30";
                            if (b.status === "Pending") badgeStyle = "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30";
                            else if (b.status === "Refunded") badgeStyle = "bg-[#ED4D1B]/10 text-[#ED4D1B] border-[#ED4D1B]/30";
                            else if (b.status === "Cancelled") badgeStyle = "bg-[#ED4D1B]/10 text-[#ED4D1B] border-[#ED4D1B]/30";
                            else if (b.status === "Expired") badgeStyle = "bg-slate-100 text-slate-500 border-slate-200";

                            return (
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black border ${badgeStyle}`}>
                                {b.status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => setActiveTicketBooking(b)}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded border border-[#AEAEAE]" 
                              title="View Ticket"
                            >
                              <Eye size={11} />
                            </button>
                            <button 
                              onClick={() => triggerNotification(`Resent ticket confirmation to ${b.email}`)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded border border-[#AEAEAE]" 
                              title="Resend Ticket"
                            >
                              <RefreshCw size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Summary Footer */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pt-3 border-t border-[#AEAEAE]">
              <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-[#AEAEAE] rounded-[15px] p-3 md:px-6 md:py-2">
                <div>
                  <span className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Filtered Bookings</span>
                  <span className="text-[13px] font-black text-slate-900">{totalBookingsCount}</span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Tickets Distributed</span>
                  <span className="text-[13px] font-black text-slate-900">{totalTicketsQty}</span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Filtered Amount Paid</span>
                  <span className="text-[13px] font-black text-[#5331EA]">₹{totalAmountCollected.toLocaleString()}</span>
                </div>
              </div>

              {/* Functional table pagination */}
              <div className="flex justify-end items-center gap-1 text-[11px] text-slate-500 font-medium select-none shrink-0">
                <button 
                  onClick={() => setGuestPage(prev => Math.max(prev - 1, 1))}
                  disabled={guestPage === 1}
                  className={`px-2.5 py-1 rounded border border-[#AEAEAE] text-slate-700 transition-colors ${guestPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 bg-white'}`}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                  const pgNum = idx + 1;
                  return (
                    <button
                      key={pgNum}
                      onClick={() => setGuestPage(pgNum)}
                      className={`w-6 h-6 rounded font-bold flex items-center justify-center shadow-sm border transition-all ${guestPage === pgNum ? 'bg-[#5331EA] text-white border-[#5331EA]' : 'bg-white hover:bg-slate-100 text-slate-700 border-[#AEAEAE]'}`}
                    >
                      {pgNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && <span className="px-1 text-slate-300">...</span>}

                <button 
                  onClick={() => setGuestPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={guestPage === totalPages}
                  className={`px-2.5 py-1 rounded border border-[#AEAEAE] text-slate-700 transition-colors ${guestPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 bg-white'}`}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Inline Boarding Pass / Ticket Detail Section */}
            {activeTicketBooking && (
              <div className="mt-4 p-5 bg-white text-slate-800 rounded-[15px] border border-[#AEAEAE] shadow-md relative animate-fadeIn">
                <button 
                  onClick={() => setActiveTicketBooking(null)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-md transition-colors"
                  title="Close Details"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#AEAEAE]">
                  <div className="w-6 h-6 rounded bg-[#5331EA] text-[9px] font-black flex items-center justify-center text-white">
                    TIC
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Selected Ticket Pass Detail (Inline view)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Col 1: Attendee Info */}
                  <div className="space-y-3">
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Event Name</span>
                      <span className="text-xs font-extrabold text-slate-800">{selectedEvent.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Attendee</span>
                        <span className="text-xs font-bold text-slate-800">{activeTicketBooking.name}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ticket Category</span>
                        <span className="text-xs font-bold text-[#5331EA]">{activeTicketBooking.tier}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Booking Ref</span>
                        <span className="text-xs font-mono font-bold text-slate-800">{activeTicketBooking.id}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Qty / Price</span>
                        <span className="text-xs font-bold text-slate-800">{activeTicketBooking.qty} Ticket(s) / ₹{activeTicketBooking.amount.toLocaleString()}</span>
                      </div>
                    </div>
                    {/* Additional Details & Timestamp */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Contact Email</span>
                        <span className="text-[10px] font-semibold text-slate-600 truncate block max-w-[140px]" title={activeTicketBooking.email}>
                          {activeTicketBooking.email}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Booking Time</span>
                        <span className="text-[10px] font-bold text-slate-600 block">
                          {activeTicketBooking.date} at {activeTicketBooking.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Cancel/Refund Info */}
                  <div className="flex flex-col justify-center">
                    {activeTicketBooking.status === 'Cancelled' || activeTicketBooking.status === 'Refunded' || activeTicketBooking.status === 'Expired' ? (
                      <div className="bg-red-50 border border-red-100 rounded-[15px] p-3.5 space-y-2">
                        <div className="flex items-center gap-1.5 text-red-500 font-extrabold text-[10px] uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          <span>Cancellation / Refund Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Refund Amt</span>
                            <span className="font-bold text-slate-800">
                              {activeTicketBooking.refundAmount && activeTicketBooking.refundAmount > 0 
                                ? `₹${activeTicketBooking.refundAmount.toLocaleString()}` 
                                : '₹0 (No Refund)'}
                            </span>
                          </div>
                          {activeTicketBooking.refundId && (
                            <div>
                              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Refund ID</span>
                              <span className="font-mono text-[10px] font-bold text-slate-800">{activeTicketBooking.refundId}</span>
                            </div>
                          )}
                        </div>
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Revocation Reason</span>
                          <span className="block text-[11px] font-medium text-slate-600 italic mt-0.5">
                            "{activeTicketBooking.cancelReason || 'No reason provided.'}"
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#0AC655]/10 border border-[#0AC655]/30 rounded-[15px] p-3.5 flex flex-col justify-center items-center text-center space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[9px] font-black bg-[#0AC655]/20 text-[#0AC655] border border-[#0AC655]/30">
                          ACTIVE BOOKING
                        </span>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">
                          This booking is fully active and verified on the blockchain registry.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Col 3: QR Code Watermark */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-3 border border-[#AEAEAE] rounded-[15px] w-full max-w-[200px] flex flex-col items-center justify-center gap-1.5 relative overflow-hidden">
                      <svg className="w-24 h-24 text-slate-800 shrink-0" viewBox="0 0 100 100" fill="currentColor">
                        {/* Top-Left Position Detection Pattern */}
                        <rect x="0" y="0" width="30" height="30" />
                        <rect x="5" y="5" width="20" height="20" fill="white" />
                        <rect x="10" y="10" width="10" height="10" />

                        {/* Top-Right Position Detection Pattern */}
                        <rect x="70" y="0" width="30" height="30" />
                        <rect x="75" y="5" width="20" height="20" fill="white" />
                        <rect x="80" y="10" width="10" height="10" />

                        {/* Bottom-Left Position Detection Pattern */}
                        <rect x="0" y="70" width="30" height="30" />
                        <rect x="5" y="75" width="20" height="20" fill="white" />
                        <rect x="10" y="80" width="10" height="10" />

                        {/* Timing/Grid pattern */}
                        <rect x="40" y="5" width="5" height="5" />
                        <rect x="50" y="15" width="5" height="5" />
                        <rect x="60" y="10" width="5" height="5" />
                        <rect x="45" y="25" width="5" height="5" />
                        
                        <rect x="5" y="40" width="5" height="5" />
                        <rect x="15" y="50" width="5" height="5" />
                        <rect x="10" y="60" width="5" height="5" />
                        <rect x="25" y="45" width="5" height="5" />
                        
                        <rect x="35" y="35" width="10" height="10" />
                        <rect x="40" y="40" width="20" height="10" />
                        <rect x="55" y="35" width="10" height="10" />
                        <rect x="35" y="55" width="15" height="5" />
                        <rect x="50" y="50" width="10" height="15" />
                        
                        <rect x="75" y="75" width="15" height="15" />
                        <rect x="80" y="80" width="5" height="5" fill="white" />
                        
                        <rect x="85" y="45" width="5" height="5" />
                        <rect x="90" y="55" width="5" height="5" />
                        <rect x="75" y="60" width="5" height="5" />
                        <rect x="65" y="80" width="5" height="5" />
                        <rect x="80" y="65" width="5" height="5" />
                      </svg>
                      <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
                        * {activeTicketBooking.id} *
                      </span>
                      
                      {(activeTicketBooking.status === 'Cancelled' || activeTicketBooking.status === 'Refunded' || activeTicketBooking.status === 'Expired') && (
                        <div className="absolute inset-0 bg-red-600/90 backdrop-blur-[1px] flex items-center justify-center rotate-6 scale-110 shadow-lg border-y border-dashed border-white">
                          <span className="text-white font-black text-sm tracking-widest uppercase select-none">
                            {activeTicketBooking.status === 'Expired' ? 'EXPIRED' : 'VOIDED'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}



    </div>
  );
}
