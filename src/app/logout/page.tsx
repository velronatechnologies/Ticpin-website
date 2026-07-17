'use client';

import { useEffect } from 'react';
import { clearAllData } from '@/lib/auth/clearAll';

export default function LogoutPage() {
  useEffect(() => {
    const logout = async () => {
      try {
        await Promise.allSettled([
          fetch('/backend/api/auth/logout/user', { method: 'POST', credentials: 'include' }),
          fetch('/backend/api/auth/logout/organizer', { method: 'POST', credentials: 'include' }),
        ]);
      } catch (err) {
        console.error('Logout API calls failed:', err);
      } finally {
        clearAllData();
      }
    };

    void logout();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans" style={{ fontFamily: 'var(--font-anek-latin), sans-serif' }}>
      <div className="relative">
        <div className="w-16 h-16 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin mb-6" />
        <div className="absolute inset-x-0 bottom-0 h-4 bg-white/80 blur-lg rounded-full" />
      </div>
      <h2 className="text-[20px] font-bold text-zinc-900 mb-2">Signing out...</h2>
      <p className="text-zinc-500 text-[14px]">Please wait a moment.</p>
    </div>
  );
}
