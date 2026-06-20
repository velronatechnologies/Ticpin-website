'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Activity, Building, ShieldCheck, FileText, ShieldAlert,
  Users, Ticket, Heart, Calendar, Play, Coffee, Shield, Grid, DollarSign,
  FileCheck, HeartHandshake, Tag, Percent, Bell, MessageSquare, ShieldAlert as Guard,
  Image as ImageIcon, Database, Cpu, UserCheck, BarChart3, Lock, LogOut
} from 'lucide-react';

import { clearOrganizerSession } from '@/lib/auth/organizer';

// Import all sub panels
import OverviewPanel from './panels/Overview';
import StatusPanel from './panels/Status';
import OrganizerDirectoryPanel from './panels/OrganizerDirectory';
import KYCApprovalsPanel from './panels/KYCApprovals';
import AgreementsPanel from './panels/Agreements';
import CredentialLogsPanel from './panels/CredentialLogs';
import UserDirectoryPanel from './panels/UserDirectory';
import TicpassManagementPanel from './panels/TicpassManagement';
import UserPreferencesPanel from './panels/UserPreferences';
import EventsPanel from './panels/Events';
import PlayPanel from './panels/Play';
import DiningPanel from './panels/Dining';
import GateScannersPanel from './panels/GateScanners';
import BookingsMasterPanel from './panels/BookingsMaster';
import PayoutSettlementsPanel from './panels/PayoutSettlements';
import OfflineReceiptsPanel from './panels/OfflineReceipts';
import DonationsRefundsPanel from './panels/DonationsRefunds';
import DiscountCouponsPanel from './panels/DiscountCoupons';
import DynamicOffersPanel from './panels/DynamicOffers';
import PushNotificationsPanel from './panels/PushNotifications';
import SupportTicketsPanel from './panels/SupportTickets';
import SecurityLogsPanel from './panels/SecurityLogs';
import AssetManagerPanel from './panels/AssetManager';
import DatabaseEditorPanel from './panels/DatabaseEditor';
import CacheManagementPanel from './panels/CacheManagement';
import AdminDirectoryPanel from './panels/AdminDirectory';
import SalesVelocityPanel from './panels/SalesVelocity';
import RateLimitsPanel from './panels/RateLimits';

// List of all 28 navigation items divided by categories
const navCategories = [
  {
    title: 'OVERVIEW & METRICS',
    items: [
      { id: 'overview', name: 'Dashboard Overview', icon: LayoutDashboard },
      { id: 'status', name: 'Live Platform Status', icon: Activity },
      { id: 'sales', name: 'Sales Velocity', icon: BarChart3 }
    ]
  },
  {
    title: 'ORGANIZERS & VENDORS',
    items: [
      { id: 'orgs', name: 'Organizer Directory', icon: Building },
      { id: 'kyc', name: 'KYC & Approvals', icon: ShieldCheck },
      { id: 'agreements', name: 'Agreements & Contracts', icon: FileText },
      { id: 'credlogs', name: 'Credential Logs', icon: ShieldAlert }
    ]
  },
  {
    title: 'USERS & CUSTOMERS',
    items: [
      { id: 'users', name: 'User Directory', icon: Users },
      { id: 'ticpass', name: 'Ticpass Management', icon: Ticket },
      { id: 'preferences', name: 'User Preferences', icon: Heart }
    ]
  },
  {
    title: 'INVENTORY & LISTINGS',
    items: [
      { id: 'events', name: 'Events Inventory', icon: Calendar },
      { id: 'play', name: 'Play (Turfs)', icon: Play },
      { id: 'dining', name: 'Dining Partners', icon: Coffee },
      { id: 'scanners', name: 'Gate Scanners', icon: Shield }
    ]
  },
  {
    title: 'FINANCIALS & PAYOUTS',
    items: [
      { id: 'bookings', name: 'All Bookings Master', icon: Grid },
      { id: 'payouts', name: 'Payout Settlements', icon: DollarSign },
      { id: 'receipts', name: 'Offline Receipts', icon: FileCheck },
      { id: 'refunds', name: 'Donations & Refunds', icon: HeartHandshake }
    ]
  },
  {
    title: 'MARKETING & ENGAGEMENT',
    items: [
      { id: 'coupons', name: 'Discount Coupons', icon: Tag },
      { id: 'offers', name: 'Dynamic Offers', icon: Percent },
      { id: 'notifications', name: 'Push Notifications', icon: Bell }
    ]
  },
  {
    title: 'SUPPORT & SECURITY',
    items: [
      { id: 'support', name: 'Support Tickets', icon: MessageSquare },
      { id: 'seclogs', name: 'Security Audit Logs', icon: Guard },
      { id: 'assets', name: 'Asset Manager', icon: ImageIcon },
      { id: 'ratelimits', name: 'API Rate Limits', icon: Lock }
    ]
  },
  {
    title: 'SYSTEM (SUPER ADMIN)',
    items: [
      { id: 'database', name: 'Database Editor (CRUD)', icon: Database },
      { id: 'cache', name: 'Cache Management', icon: Cpu },
      { id: 'admins', name: 'Admin Directory', icon: UserCheck }
    ]
  }
];

export default function NewAdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewPanel />;
      case 'status': return <StatusPanel />;
      case 'sales': return <SalesVelocityPanel />;
      case 'orgs': return <OrganizerDirectoryPanel />;
      case 'kyc': return <KYCApprovalsPanel />;
      case 'agreements': return <AgreementsPanel />;
      case 'credlogs': return <CredentialLogsPanel />;
      case 'users': return <UserDirectoryPanel />;
      case 'ticpass': return <TicpassManagementPanel />;
      case 'preferences': return <UserPreferencesPanel />;
      case 'events': return <EventsPanel />;
      case 'play': return <PlayPanel />;
      case 'dining': return <DiningPanel />;
      case 'scanners': return <GateScannersPanel />;
      case 'bookings': return <BookingsMasterPanel />;
      case 'payouts': return <PayoutSettlementsPanel />;
      case 'receipts': return <OfflineReceiptsPanel />;
      case 'refunds': return <DonationsRefundsPanel />;
      case 'coupons': return <DiscountCouponsPanel />;
      case 'offers': return <DynamicOffersPanel />;
      case 'notifications': return <PushNotificationsPanel />;
      case 'support': return <SupportTicketsPanel />;
      case 'seclogs': return <SecurityLogsPanel />;
      case 'assets': return <AssetManagerPanel />;
      case 'ratelimits': return <RateLimitsPanel />;
      case 'database': return <DatabaseEditorPanel />;
      case 'cache': return <CacheManagementPanel />;
      case 'admins': return <AdminDirectoryPanel />;
      default: return <OverviewPanel />;
    }
  };

  const handleLogout = () => {
    clearOrganizerSession();
    router.replace('/admin/login');
  };

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col h-full z-20">
        <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center font-bold text-white text-base">T</div>
          <div>
            <h1 className="font-bold text-zinc-900 leading-none">Ticpin Admin</h1>
            <span className="text-[10px] text-zinc-405 font-semibold">CO-MGMT PANEL</span>
          </div>
        </div>

        {/* Scrollable Navigation Categories */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {navCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="text-[10px] font-bold text-zinc-400 tracking-wider px-2 uppercase">{cat.title}</h3>
              <div className="space-y-0.5">
                {cat.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
                        isActive 
                          ? 'bg-zinc-950 text-white shadow-sm' 
                          : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User profile actions */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-xl text-xs font-bold text-red-650 bg-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Account
          </button>
        </div>
      </aside>

      {/* Main Panel Content Box */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-6xl mx-auto h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
