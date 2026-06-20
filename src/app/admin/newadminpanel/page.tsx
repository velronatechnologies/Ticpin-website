'use client';

import React, { useState, useEffect } from 'react';
import NewAdminPanel from '@/components/newadminpanel/newadminpanel';
import { Lock, ShieldAlert, KeyRound, Mail, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/api/auth';

export default function NewAdminPanelPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if session is already stored locally
    const authStatus = sessionStorage.getItem('ticpin_newadmin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setChecking(false);
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.adminLogin(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to initiate admin login.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('OTP code is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyAdminOTP(email, otp);
      if (res.isAdmin) {
        sessionStorage.setItem('ticpin_newadmin_auth', 'true');
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Verification successful, but this account does not have administrative privileges.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-200" />
          <div className="h-4 w-32 bg-zinc-200 rounded" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <NewAdminPanel />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-zinc-950 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Ticpin God Mode</h1>
            <p className="text-xs text-zinc-500">Sign in to access all platform modules.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-750 text-xs rounded-xl flex items-center gap-2 border border-red-200">
            <ShieldAlert className="w-4 h-4 text-red-650 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-4 text-xs font-semibold text-zinc-500 font-sans">
            <div>
              <label className="block uppercase tracking-wider mb-1">Admin Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input 
                  type="email"
                  required
                  placeholder="admin@ticpin.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl bg-white text-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs font-semibold text-zinc-500 font-sans">
            <div>
              <label className="block uppercase tracking-wider mb-1">Verification OTP</label>
              <input 
                type="text"
                required
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-200 rounded-xl bg-white text-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-center font-bold tracking-widest" 
              />
              <p className="text-[10px] text-zinc-400 font-normal mt-1.5 text-center">
                An OTP has been sent to <span className="font-semibold text-zinc-650">{email}</span>.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Access Dashboard'}
              <KeyRound className="w-4 h-4" />
            </button>

            <button 
              type="button"
              onClick={() => setStep('email')}
              className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-650 rounded-xl font-bold transition-colors text-[10px]"
            >
              Back to Email Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
