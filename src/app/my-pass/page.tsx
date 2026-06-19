'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft, PlayCircle, Utensils, Compass } from 'lucide-react';

export default function MyPassComingSoon() {
  return (
    <div className="min-h-screen w-full bg-[#07021f] text-white flex flex-col justify-between selection:bg-white/20 relative font-sans">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7B2FF7] opacity-20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#3A1A8C] opacity-35 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[18px] font-black tracking-[0.25em] text-white uppercase italic">TICPIN</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-[500px] w-full text-center flex flex-col items-center">
          {/* Glassmorphic Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-sm">
            <Sparkles size={16} className="text-[#AC9BF7] animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-[#AC9BF7] uppercase">FEATURE UNDER CONSTRUCTION</span>
          </div>

          {/* Logo Heading */}
          <h1 className="text-[48px] md:text-[64px] font-black tracking-tighter leading-none mb-4 italic">
            TICPIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AC9BF7] to-[#7B2FF7]">PASS</span>
          </h1>

          <p className="text-zinc-400 text-sm md:text-base max-w-[420px] mb-12 leading-relaxed">
            We are working on an exclusive membership pass to unlock free turf bookings, dining vouchers, and premium event discounts. Stay tuned!
          </p>

          {/* Visual card representation */}
          <div 
            className="w-full aspect-[16/9] rounded-[24px] border border-white/10 p-6 relative overflow-hidden mb-12 shadow-[0_20px_50px_rgba(123,47,247,0.15)] flex flex-col justify-between text-left"
            style={{ background: 'linear-gradient(135deg, rgba(123,47,247,0.2) 0%, rgba(58,26,140,0.2) 100%)', backdropFilter: 'blur(20px)' }}
          >
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase leading-none block mb-1">TICPIN</span>
                <span className="text-[28px] font-black tracking-wider text-white italic leading-none">PASS</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[9px] font-extrabold uppercase tracking-widest text-white/90">
                COMING SOON
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <PlayCircle size={14} className="text-[#AC9BF7]" />
                <span>Play</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Utensils size={14} className="text-[#AC9BF7]" />
                <span>Dining</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Compass size={14} className="text-[#AC9BF7]" />
                <span>Events</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <ArrowLeft size={16} />
            <span>Go Back Home</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-zinc-600 text-xs relative z-10 border-t border-white/5 bg-black/20">
        &copy; {new Date().getFullYear()} Ticpin. All rights reserved.
      </footer>
    </div>
  );
}
