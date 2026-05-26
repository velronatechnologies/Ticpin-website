'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronRight, Star, Smartphone, HelpCircle, FileText, ArrowLeft, Ticket, Utensils, PlayCircle } from 'lucide-react';

/**
 * TicpassPage - Full reconstruction with full-bleed background coverage.
 */
export default function TicpassPage() {
  const router = useRouter();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const parentWidth = window.innerWidth;
      const designWidth = 1440;
      const calculatedScale = parentWidth / designWidth;
      setScale(calculatedScale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#000000] overflow-x-hidden flex flex-col items-center selection:bg-white/20 relative">      
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* --- FULL WINDOW FULL-BLEED BACKGROUNDS --- */}
      <div className="absolute inset-0 w-full h-[1748px] pointer-events-none overflow-hidden z-0">
        {/* First Background */}
        <div
          className="absolute top-0 left-0 w-full h-[875px] bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage: 'url("/pass/TICPASS BG WEB 1.svg")'
          }}
        />

        {/* Second Background Rotated */}
        <div
          className="absolute left-0 top-[873px] w-full h-[876px] bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage: 'url("/pass/page.webp")',
            transform: 'rotate(180deg)',
            transformOrigin: 'center'
          }}
        />
      </div>

      {/* Scaling Container for Pixel-Perfect fidelity */}
      <div
        className="relative origin-top transition-transform duration-200 z-10"
        style={{
          width: '1440px',
          height: '1748px',
          transform: `scale(${Math.min(scale, window.innerHeight / 1748)})`,
          transformOrigin: 'top center'
        }}
      >
        {/* --- PAGE CONTENT OVERLAYS (Based on CSS coordinates) --- */}

        {/* PRICE: ₹799 (548, 281) */}
        <div className="absolute left-[548px] top-[281px] w-[204px] h-[106px] flex items-center justify-center font-[family-name:var(--font-anek-latin)] font-semibold text-[96px] text-white Faustina leading-[106px]">
          ₹799
        </div>

        {/* DURATION: FOR 3 MONTHS (768, 309) */}
        <div className="absolute left-[768px] top-[309px] w-[200px] h-[60px] flex items-end pb-3 font-[family-name:var(--font-anek-latin)] font-medium text-[28px] text-white/90 leading-none">
          FOR 3 MONTHS
        </div>

        {/* PASS BENEFITS label (619, 450) */}
        <div className="absolute left-0 right-0 top-[450px] flex items-center justify-center gap-6 z-10">
          <div className="w-[300px] h-[7px] opacity-30" style={{ background: 'linear-gradient(90deg, transparent, white)' }} />
          <Star className="text-white w-6 h-6 fill-white" />
          <span className="font-[family-name:var(--font-anek-latin)] font-medium text-[28px] uppercase tracking-[0.06em] text-white">
            PASS BENEFITS
          </span>
          <Star className="text-white w-6 h-6 fill-white" />
          <div className="w-[300px] h-[7px] opacity-30" style={{ background: 'linear-gradient(270deg, transparent, white)' }} />
        </div>

        {/* BENEFITS MAIN CARD (108, 512) */}
        <div className="absolute left-[108px] top-[512px] w-[1223px] h-[525px] bg-white/5 border-[0.5px] border-white/20 rounded-[38px] px-24 py-16 flex flex-col justify-between">

          {/* Item 1: 2 FREE TURF BOOKINGS */}
          <div className="flex items-center gap-12 group">
            <div className="w-32 h-32 rounded-3xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
              <PlayCircle className="w-16 h-16 text-white" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-[family-name:var(--font-anek-latin)] font-semibold text-[36px] text-white leading-tight uppercase">2 FREE TURF BOOKINGS</h3>
              <p className="font-[family-name:var(--font-anek-latin)] font-normal text-[20px] text-white/70 max-w-[700px]">Enjoy 2 free turf bookings. Book your next two games at no cost and make the most of your playtime</p>
            </div>
          </div>

          {/* Item 2: 2 DINING VOUCHERS */}
          <div className="flex items-center gap-12 group">
            <div className="w-32 h-32 rounded-3xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
              <Utensils className="w-16 h-16 text-white" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-[family-name:var(--font-anek-latin)] font-semibold text-[36px] text-white leading-tight uppercase">2 DINING VOUCHERS WORTH ₹250 EACH</h3>
              <p className="font-[family-name:var(--font-anek-latin)] font-normal text-[20px] text-white/70 max-w-[700px]">Enjoy 2 dining vouchers worth ₹250 each. Use on dining bills above ₹1000 and save on your next two meals</p>
            </div>
          </div>

          {/* Item 3: EARLY ACCESS */}
          <div className="flex items-center gap-12 group">
            <div className="w-32 h-32 rounded-3xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
              <Ticket className="w-16 h-16 text-white" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-[family-name:var(--font-anek-latin)] font-semibold text-[36px] text-white leading-tight uppercase">EARLY ACCESS + EXCLUSIVE DISCOUNTS ON EVENTS</h3>
              <p className="font-[family-name:var(--font-anek-latin)] font-normal text-[20px] text-white/70 max-w-[700px]">Enjoy early access to premium events plus exclusive discounts on tickets and experiences. Unlock access before anyone else and save more on every booking</p>
            </div>
          </div>
        </div>

        {/* T&C Small text (683, 1008) */}
        <div className="absolute left-0 right-0 top-[1008px] text-center font-[family-name:var(--font-anek-latin)] font-normal text-[15px] text-white/50">
          T&C applies
        </div>

        {/* Offer Handling Charge (534, 1057) */}
        <div className="absolute left-0 right-0 top-[1057px] text-center font-[family-name:var(--font-anek-latin)] font-normal text-[18px] text-white/60 italic">
          *Offer handling charge will be applied at checkout
        </div>

        {/* SUPPORT SECTION (285, 1137) */}
        <div className="absolute left-[285px] top-[1137px] w-[869px] h-[251px] bg-white/5 border-[0.5px] border-white/20 rounded-[38px] flex flex-col justify-around px-8">
          <Link href="/support" className="flex items-center justify-between group hover:bg-white/5 px-6 py-4 rounded-2xl transition-all">
            <div className="flex items-center gap-6">
              <Smartphone className="w-10 h-10 text-white" />
              <span className="font-[family-name:var(--font-anek-latin)] font-medium text-[34px] text-white">Chat with support</span>
            </div>
            <ChevronRight className="w-8 h-8 text-white/40 group-hover:text-white transition-all transform group-hover:translate-x-2" />
          </Link>
          <div className="h-[1px] bg-white/10 mx-6" />
          <Link href="/faq" className="flex items-center justify-between group hover:bg-white/5 px-6 py-4 rounded-2xl transition-all">
            <div className="flex items-center gap-6">
              <HelpCircle className="w-10 h-10 text-white" />
              <span className="font-[family-name:var(--font-anek-latin)] font-medium text-[34px] text-white">Frequently Asked Questions</span>
            </div>
            <ChevronRight className="w-8 h-8 text-white/40 group-hover:text-white transition-all transform group-hover:translate-x-2" />
          </Link>
          <div className="h-[1px] bg-white/10 mx-6" />
          <Link href="/terms" className="flex items-center justify-between group hover:bg-white/5 px-6 py-4 rounded-2xl transition-all">
            <div className="flex items-center gap-6">
              <FileText className="w-10 h-10 text-white" />
              <span className="font-[family-name:var(--font-anek-latin)] font-medium text-[34px] text-white">Terms & Conditions</span>
            </div>
            <ChevronRight className="w-8 h-8 text-white/40 group-hover:text-white transition-all transform group-hover:translate-x-2" />
          </Link>
        </div>

        {/* BUY BUTTON (108, 1448) */}
        <button
          onClick={() => console.log('Buy Flow')}
          className="absolute left-[108px] top-[1448px] w-[1223px] h-[111px] bg-white rounded-[63px] flex items-center justify-center transition-all hover:scale-[1.01] active:scale-[0.98] shadow-2xl shadow-blue-500/20"
        >
          <span className="font-[family-name:var(--font-anek-tamil-condensed)] font-bold text-[50px] text-black uppercase tracking-tight">
            BUY TICPIN PASS
          </span>
        </button>
      </div>
    </div>
  );
}