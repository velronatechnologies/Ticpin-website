'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  QrCode, 
  IndianRupee, 
  ArrowLeft, 
  RefreshCw,
  Settings,
  Megaphone,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  LogOut
} from 'lucide-react';
import { eventsApi } from '@/lib/api/events';
import { playApi } from '@/lib/api/play';
import { diningApi } from '@/lib/api/dining';
import { BookingData, Verifier, Gate } from './types';
import OverviewTab from './OverviewTab';
import EventDetailsTab from './EventDetailsTab';
import AttendeesTab from './AttendeesTab';
import GateControlTab from './GateControlTab';
import FinancialsTab from './FinancialsTab';

export default function OrganizerOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const vertical = (searchParams.get('vertical') || 'events') as 'events' | 'play' | 'dining';

  const tabParam = searchParams.get('tab') || 'overview';
  const activeSection = (tabParam === 'my-events' ? 'manage' : (tabParam === 'gate-control' ? 'gate' : tabParam)) as 'overview' | 'manage' | 'attendees' | 'gate' | 'financials';

  const setActiveSection = useCallback((secId: 'overview' | 'manage' | 'attendees' | 'gate' | 'financials') => {
    let urlTab = secId as string;
    if (secId === 'manage') urlTab = 'my-events';
    if (secId === 'gate') urlTab = 'gate-control';
    router.push(`/organizer/overview?id=${id || ''}&vertical=${vertical}&tab=${urlTab}`);
  }, [id, vertical, router]);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for sub-features
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Payout states
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [payoutMessage, setPayoutMessage] = useState('');
  const [triggeringPayout, setTriggeringPayout] = useState(false);

  // Gate states
  const [gates, setGates] = useState<Gate[]>([]);
  const [newGateName, setNewGateName] = useState('');
  const [loadingGates, setLoadingGates] = useState(false);

  // Verifier states
  const [verifiers, setVerifiers] = useState<Verifier[]>([]);
  const [newVerifierName, setNewVerifierName] = useState('');
  const [newVerifierPhone, setNewVerifierPhone] = useState('');
  const [newVerifierGate, setNewVerifierGate] = useState('');
  const [verifierError, setVerifierError] = useState('');
  const [verifierSuccess, setVerifierSuccess] = useState('');
  const [loadingVerifiers, setLoadingVerifiers] = useState(false);

  // Live stats
  const [liveStats, setLiveStats] = useState({ totalBooked: 0, totalCheckedIn: 0, cancelledTickets: 0 });

  // Event form edits
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [updatingListing, setUpdatingListing] = useState(false);

  const getTheme = () => {
    switch (vertical) {
      case 'play':
        return {
          bg: 'rgba(255, 241, 168, 0.08)',
          accent: '#E7C200',
          accentLight: 'rgba(231, 194, 0, 0.15)',
          buttonColor: 'bg-black text-white hover:bg-zinc-900',
        };
      case 'dining':
      case 'events':
      default:
        return {
          bg: 'rgba(211, 203, 245, 0.08)',
          accent: '#5331EA',
          accentLight: 'rgba(83, 49, 234, 0.15)',
          buttonColor: 'bg-[#5331EA] text-white hover:bg-[#4223ca]',
        };
    }
  };

  const theme = getTheme();

  const fetchListingDetails = useCallback(async () => {
    if (!id) {
      setError('No listing ID provided.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      let data: any = null;
      if (vertical === 'events') {
        data = await eventsApi.getById(id);
      } else if (vertical === 'play') {
        data = await playApi.getByID(id);
      } else if (vertical === 'dining') {
        data = await diningApi.getById(id);
      }

      if (data) {
        setListing(data);
        setEditName(data.name || '');
        setEditCity(data.city || '');
        setEditStatus(data.status || 'pending');
      } else {
        setListing(null);
        setError('Listing details not found.');
      }
    } catch (err: any) {
      console.warn('Listing API failed:', err);
      setListing(null);
      setError(err.message || 'Listing details not found.');
    } finally {
      setLoading(false);
    }
  }, [id, vertical]);

  const fetchBookings = useCallback(async () => {
    if (!id) return;
    setLoadingBookings(true);
    try {
      const res = await fetch(`/backend/api/organizer/payouts?item_id=${id}&category=${vertical === 'events' ? 'event' : vertical}&limit=200`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [id, vertical]);

  const fetchVerifiers = useCallback(async () => {
    setLoadingVerifiers(true);
    try {
      const res = await fetch('/backend/api/scanner/verifiers', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setVerifiers(data);
        }
      }
    } catch (err) {
      console.error('Failed to load verifiers:', err);
    } finally {
      setLoadingVerifiers(false);
    }
  }, []);

  const fetchGates = useCallback(async () => {
    setLoadingGates(true);
    try {
      const res = await fetch('/backend/api/scanner/gates', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setGates(data);
        }
      }
    } catch (err) {
      console.error('Failed to load gates:', err);
    } finally {
      setLoadingGates(false);
    }
  }, []);

  const fetchLiveStats = useCallback(async () => {
    try {
      const res = await fetch('/backend/api/scanner/active-event', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setLiveStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load live stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchListingDetails();
  }, [fetchListingDetails]);

  useEffect(() => {
    if (activeSection === 'financials') {
      fetchBookings();
    }
  }, [activeSection, fetchBookings]);

  useEffect(() => {
    if (activeSection === 'gate') {
      fetchVerifiers();
      fetchGates();
      fetchLiveStats();
    }
  }, [activeSection, fetchVerifiers, fetchGates, fetchLiveStats]);

  const handleUpdateStatus = async (status: string) => {
    if (!id || !listing) return;
    setUpdatingListing(true);
    try {
      const payload = { ...listing, status };
      if (vertical === 'events') {
        await eventsApi.update(id, payload);
      } else if (vertical === 'play') {
        await playApi.update(id, payload);
      } else if (vertical === 'dining') {
        await diningApi.update(id, payload);
      }
      setListing(payload);
      setEditStatus(status);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingListing(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !listing) return;
    setUpdatingListing(true);
    try {
      const payload = { 
        ...listing, 
        name: editName, 
        city: editCity 
      };
      if (vertical === 'events') {
        await eventsApi.update(id, payload);
      } else if (vertical === 'play') {
        await playApi.update(id, payload);
      } else if (vertical === 'dining') {
        await diningApi.update(id, payload);
      }
      setListing(payload);
      alert('Listing updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save listing');
    } finally {
      setUpdatingListing(false);
    }
  };

  const handleAddVerifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifierError('');
    setVerifierSuccess('');
    if (!newVerifierName) {
      setVerifierError('Name is required');
      return;
    }
    if (!newVerifierPhone) {
      setVerifierError('Phone number is required');
      return;
    }

    try {
      const res = await fetch('/backend/api/scanner/verifiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVerifierName, phone: newVerifierPhone, gate: newVerifierGate || 'Main Gate' }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifierError(data.error || 'Failed to register verifier');
      } else {
        setVerifierSuccess(`Verifier registered! Temp Key: ${data.password || 'Generated Key'}`);
        setNewVerifierName('');
        setNewVerifierPhone('');
        setNewVerifierGate('');
        fetchVerifiers();
      }
    } catch (err) {
      setVerifierError('Network error registering verifier');
    }
  };

  const handleDeleteVerifier = async (phone: string) => {
    if (!confirm('Are you sure you want to delete this gate verifier?')) return;
    try {
      const res = await fetch(`/backend/api/scanner/verifiers/${encodeURIComponent(phone)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setVerifiers(prev => prev.filter(v => v.phone !== phone));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete verifier');
      }
    } catch (err) {
      alert('Network error deleting verifier');
    }
  };

  const handleUpdateVerifier = async (originalPhone: string, newPhone: string, name: string, gate: string) => {
    try {
      const res = await fetch(`/backend/api/scanner/verifiers/${encodeURIComponent(originalPhone)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone, name, gate }),
        credentials: 'include'
      });
      if (res.ok) {
        fetchVerifiers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update verifier');
      }
    } catch (err) {
      alert('Network error updating verifier');
    }
  };

  const handleCreateGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGateName) return;
    
    try {
      const res = await fetch('/backend/api/scanner/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGateName }),
        credentials: 'include'
      });
      if (res.ok) {
        setNewGateName('');
        fetchGates();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create gate');
      }
    } catch (err) {
      alert('Network error creating gate');
    }
  };

  const handleDeleteGate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gate?')) return;
    try {
      const res = await fetch(`/backend/api/scanner/gates/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchGates();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete gate');
      }
    } catch (err) {
      alert('Network error deleting gate');
    }
  };

  const handleTriggerPayout = async () => {
    setTriggeringPayout(true);
    setPayoutMessage('');
    try {
      const res = await fetch('/backend/api/organizer/payouts/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: id, category: vertical === 'events' ? 'event' : vertical }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        setPayoutMessage(data.error || 'Failed to trigger payout request');
      } else {
        setPayoutMessage('Instant settlement enabled! Bookings are queued for payout.');
        fetchBookings(); // Refresh bookings to update payout_status to 'pending_approval'
      }
    } catch (err) {
      setPayoutMessage('Network error submitting payout request');
    } finally {
      setTriggeringPayout(false);
    }
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = ['Booking ID', 'Customer Name', 'Email', 'Phone', 'Amount paid', 'Discount', 'Status', 'Date'];
    const rows = bookings.map(b => [
      b.booking_id,
      b.user_name,
      b.user_email,
      b.user_phone,
      b.grand_total,
      b.discount_amount,
      b.status,
      new Date(b.booked_at).toLocaleString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${listing?.name || 'guest_list'}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    router.push('/list-your-dining/Login');
  };

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white font-sans">
        <RefreshCw className="animate-spin text-zinc-400 mb-4" size={40} />
        <p className="text-zinc-600 font-medium">Loading Overview Dashboard...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center bg-[#f8f9fb] font-sans">
        <RefreshCw className="text-red-500" size={50} />
        <h2 className="text-2xl font-semibold text-black">Dashboard Load Failed</h2>
        <p className="text-zinc-500 max-w-md">{error || 'Event listing details not found.'}</p>
        <button
          onClick={() => router.push('/organizer/dashboard')}
          className="px-6 py-2.5 bg-black text-white rounded-xl font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb] text-[#1c1525] font-sans select-none">
      
      {/* Top Navbar */}
      <header className="h-[60px] bg-white border-b border-[#edeef4] px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/organizer/dashboard')}>
          <div className="bg-[#5331EA] text-white p-1.5 rounded-lg font-bold text-lg tracking-tight">
            Ticpin
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">Organizer</span>
        </div>

        <div className="flex items-center gap-4 relative">
          <button 
            onClick={handleLogout}
            className="text-zinc-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-9 h-9 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center overflow-hidden hover:ring-2 ring-[#5331EA] transition-all"
          >
            <Users size={20} className="text-zinc-600" />
          </button>

          {/* User Menu Sidebar/Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#edeef4] rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-[#edeef4] mb-1">
                <p className="text-xs text-zinc-500">Signed in as</p>
                <p className="text-sm font-semibold truncate">Organizer Admin</p>
              </div>
              <button 
                onClick={() => router.push('/organizer/profile')}
                className="w-full text-left px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                My Profile
              </button>
              <button 
                onClick={() => router.push('/organizer/settings')}
                className="w-full text-left px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Account Settings
              </button>
              <div className="border-t border-[#edeef4] mt-1 pt-1">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 flex-row min-h-[calc(100vh-60px)] overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className="w-[200px] bg-white border-r border-[#edeef4] py-[12px] px-[10px] flex flex-col shrink-0">
          <nav className="flex-1 space-y-[6px]">
            {/* ANALYTICS & INSIGHTS */}
            <div>
              <div className="text-[10px] font-bold text-[#b3b2c2] tracking-[.6px] mt-[10px] mb-[4px] mx-[6px] uppercase">
                Analytics & Insights
              </div>
              {[
                { id: 'overview', label: 'Dashboard Home', icon: LayoutDashboard },
                { id: 'manage', label: 'My Events', icon: Calendar },
                { id: 'attendees', label: 'Attendees', icon: Users },
                { id: 'gate', label: 'Gate Control', icon: QrCode },
              ].map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id as any)}
                    className={`w-full flex items-center gap-[8px] px-[10px] py-[7px] rounded-[6px] text-[12.5px] font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#5331EA] text-white font-semibold' 
                        : 'text-[#5b596e] hover:bg-[#f6f5fb]'
                    }`}
                  >
                    <Icon size={13} className={isActive ? 'text-white' : 'text-[#5b596e]'} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>

            {/* PAYOUTS */}
            <div>
              <div className="mt-8 mb-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Payouts
              </div>
              {[
                { id: 'financials', label: 'Payouts', icon: IndianRupee },
                { id: 'marketing', label: 'Marketing', icon: Megaphone, disabled: true },
              ].map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      if (!sec.disabled) setActiveSection(sec.id as any);
                    }}
                    className={`w-full flex items-center gap-[8px] px-[10px] py-[7px] rounded-[6px] text-[12.5px] font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#5331EA] text-white font-semibold' 
                        : sec.disabled
                        ? 'text-[#b3b2c2] font-semibold cursor-not-allowed'
                        : 'text-[#5b596e] hover:bg-[#f6f5fb]'
                    }`}
                    disabled={sec.disabled}
                  >
                    <Icon size={13} className={isActive ? 'text-white' : sec.disabled ? 'text-[#edeef4]' : 'text-[#5b596e]'} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SETTINGS */}
            <div>
              <div className="text-[10px] font-bold text-[#b3b2c2] tracking-[.6px] mt-[10px] mb-[4px] mx-[6px] uppercase">
                Settings
              </div>
              {[
                { id: 'settings', label: 'Settings', icon: Settings, disabled: true },
              ].map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    disabled
                    className="w-full flex items-center gap-[8px] px-[10px] py-[7px] rounded-[6px] text-[12.5px] font-medium text-zinc-300 cursor-not-allowed"
                  >
                    <Icon size={13} className="text-zinc-300" />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content Layout */}
        <main className="flex-1 p-[14px_18px_6px] overflow-y-auto w-full flex flex-col justify-between">
          <div className="w-full">
            {/* SECTION 1: OVERVIEW & ANALYTICS */}
            {activeSection === 'overview' && (
              <OverviewTab eventId={id || ''} listingName={listing?.name} />
            )}

            {/* SECTION 2: EVENT DETAILS & CONTROL */}
            {activeSection === 'manage' && (
              <EventDetailsTab />
            )}

            {/* SECTION 3: ATTENDEES & BOOKINGS */}
            {activeSection === 'attendees' && (
              <AttendeesTab
                bookings={bookings}
                loadingBookings={loadingBookings}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleExportCSV={handleExportCSV}
                listingName={listing?.name}
              />
            )}

            {/* SECTION 4: GATE & CHECK-IN CONTROL */}
            {activeSection === 'gate' && (
              <GateControlTab
                bookings={bookings}
                liveStats={liveStats}
                newVerifierName={newVerifierName}
                setNewVerifierName={setNewVerifierName}
                newVerifierPhone={newVerifierPhone}
                setNewVerifierPhone={setNewVerifierPhone}
                newVerifierGate={newVerifierGate}
                setNewVerifierGate={setNewVerifierGate}
                verifierError={verifierError}
                verifierSuccess={verifierSuccess}
                handleAddVerifier={handleAddVerifier}
                loadingVerifiers={loadingVerifiers}
                verifiers={verifiers}
                handleDeleteVerifier={handleDeleteVerifier}
                handleUpdateVerifier={handleUpdateVerifier}
                gates={gates}
                newGateName={newGateName}
                setNewGateName={setNewGateName}
                handleCreateGate={handleCreateGate}
                handleDeleteGate={handleDeleteGate}
                loadingGates={loadingGates}
              />
            )}

            {/* SECTION 5: FINANCIALS & PAYOUTS */}
            {activeSection === 'financials' && (
              <FinancialsTab
                bookings={bookings}
                selectedBookings={selectedBookings}
                setSelectedBookings={setSelectedBookings}
                triggeringPayout={triggeringPayout}
                payoutMessage={payoutMessage}
                handleTriggerPayout={handleTriggerPayout}
              />
            )}
          </div>

          {/* Footer */}
          <footer className="text-center text-[#8a8a9a] text-[11px] py-[8px] mt-4 border-t border-[#edeef4] shrink-0">
            © 2026 Ticpin Inc. All rights reserved.
          </footer>
        </main>

      </div>
    </div>
  );
}
