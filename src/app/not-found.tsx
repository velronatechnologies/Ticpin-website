import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between items-center px-6 py-12 relative overflow-hidden font-[family-name:var(--font-anek-latin)] select-none">
      {/* Soft blurred ambient glows to match the design */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute w-[60vw] h-[60vw] rounded-full blur-[130px] opacity-40 translate-x-[-15%] translate-y-[-10%]"
          style={{
            background: 'radial-gradient(circle, rgba(253,218,210,1) 0%, rgba(253,218,210,0) 70%)',
            top: '0%',
            left: '0%',
          }}
        />
        <div
          className="absolute w-[70vw] h-[70vw] rounded-full blur-[140px] opacity-50 translate-y-[-20%]"
          style={{
            background: 'radial-gradient(circle, rgba(254,251,223,1) 0%, rgba(254,251,223,0) 70%)',
            top: '10%',
            left: '15%',
          }}
        />
        <div
          className="absolute w-[60vw] h-[60vw] rounded-full blur-[130px] opacity-40 translate-x-[15%] translate-y-[-10%]"
          style={{
            background: 'radial-gradient(circle, rgba(220,237,253,1) 0%, rgba(220,237,253,0) 70%)',
            top: '0%',
            right: '0%',
          }}
        />
      </div>

      {/* Header Branding */}
      <header className="w-full max-w-[800px] flex justify-center relative z-10 pt-4">
        <img
          src="/ticpin-logo-black.png"
          alt="Ticpin"
          className="h-10 sm:h-12 w-auto object-contain select-none"
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center max-w-[950px] w-full relative z-10 py-16">
        <h1 className="text-[32px] sm:text-[48px] font-bold text-black tracking-tight leading-tight mb-5">
          Oops! You came to some other page.
        </h1>

        <p className="text-[#555555] text-[15px] sm:text-[16px] max-w-[460px] leading-relaxed mb-8 font-normal">
          The page you are looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        <div>
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-8 py-3 bg-black text-white hover:bg-zinc-800 rounded-[14px] font-semibold text-[15px] transition-all select-none active:scale-[0.98] shadow-lg shadow-black/10"
          >
            Return to Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[800px] border-t border-black/5 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 text-[13px] text-zinc-500 font-medium">
        <div className="flex flex-nowrap items-center gap-x-4 sm:gap-x-8 justify-center sm:justify-start whitespace-nowrap text-[11px] sm:text-[13px]">
          <Link href="/events" className="hover:text-black transition-colors">EVENTS</Link>
          <Link href="/play" className="hover:text-black transition-colors">PLAY & SPORTS</Link>
          <Link href="/dining" className="hover:text-black transition-colors">DINING</Link>
        </div>
        <div className="text-zinc-400 select-none text-center sm:text-right">
          &copy; 2026 Ticpin. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
