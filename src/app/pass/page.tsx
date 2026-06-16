'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, Star } from 'lucide-react';

/**
 * TicpassPage - Full reconstruction with full-bleed background coverage.
 */
export default function TicpassPage() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const designWidth = 1440;
      const designHeight = 1748;
      const widthScale = window.innerWidth / designWidth;
      const heightScale = window.innerHeight / designHeight;
      setScale(Math.min(widthScale, heightScale));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#07021f] overflow-x-hidden flex flex-col items-center selection:bg-white/20 relative">
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="absolute inset-0 w-full h-[1748px] pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-0 left-0 w-full h-full bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage: 'url("/pass/main.png")'
          }}
        />
      </div>

      <div
        className="relative origin-top transition-transform duration-200 z-10"
        style={{
          width: '1440px',
          height: '1748px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }}
      >
        <div className="absolute left-[548px] top-[281px] w-[204px] h-[106px] flex items-center justify-center font-[family-name:var(--font-anek-latin)] font-semibold text-[96px] text-white leading-[106px]">
          ₹799
        </div>

        <div className="absolute left-[768px] top-[309px] w-[180px] h-[66px] flex items-end pb-[10px] font-[family-name:var(--font-anek-latin)] font-medium text-[28px] text-white/90 leading-[34px]">
          <span>
            FOR<br />3 MONTHS
          </span>
        </div>

        <div className="absolute left-0 right-0 top-[454px] flex items-center justify-center gap-6 z-10">
          <div className="w-[145px] h-[1px] opacity-60" style={{ background: 'linear-gradient(90deg, transparent, white)' }} />
          <Star className="text-white w-6 h-6 fill-white" />
          <span className="font-[family-name:var(--font-anek-latin)] font-medium text-[28px] uppercase tracking-[0.06em] text-white">
            PASS BENEFITS
          </span>
          <Star className="text-white w-6 h-6 fill-white" />
          <div className="w-[145px] h-[1px] opacity-60" style={{ background: 'linear-gradient(270deg, transparent, white)' }} />
        </div>

        <div className="absolute left-[108px] top-[512px] w-[1223px] h-[525px] bg-white/[0.035] border border-white/25 rounded-[38px] px-[100px] py-[56px] flex flex-col justify-between shadow-[inset_0_0_80px_rgba(255,255,255,0.035)]">
          <div className="flex items-center gap-[58px]">
            <div className="w-[142px] h-[128px] flex items-center justify-center">
              <Image src="/pass/Play icon 1.svg" alt="" width={127} height={117} className="h-auto w-[127px]" priority />
            </div>
            <div className="flex flex-col gap-[5px]">
              <h3 className="font-[family-name:var(--font-anek-latin)] font-semibold text-[34px] text-white leading-[38px] uppercase">2 FREE TURF BOOKINGS</h3>
              <p className="font-[family-name:var(--font-anek-latin)] font-normal text-[19px] text-white/80 leading-[25px] max-w-[720px]">Enjoy 2 free turf bookings. Book your next two games at no cost and make the most of your playtime</p>
            </div>
          </div>

          <div className="flex items-center gap-[58px]">
            <div className="w-[142px] h-[128px] flex items-center justify-center">
              <Image src="/pass/Play icon 2.svg" alt="" width={127} height={117} className="h-auto w-[127px]" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <h3 className="font-[family-name:var(--font-anek-latin)] font-semibold text-[34px] text-white leading-[38px] uppercase">2 Dining VOUCHERS WORTH ₹250 EACH</h3>
              <p className="font-[family-name:var(--font-anek-latin)] font-normal text-[19px] text-white/80 leading-[25px] max-w-[760px]">Enjoy 2 dining vouchers worth ₹250 each. Use on dining bills above ₹1000 and save on your next two meals</p>
            </div>
          </div>

          <div className="flex items-center gap-[58px]">
            <div className="w-[142px] h-[128px] flex items-center justify-center">
              <Image src="/pass/Play icon 3.svg" alt="" width={134} height={125} className="h-auto w-[134px]" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <h3 className="font-[family-name:var(--font-anek-latin)] font-semibold text-[34px] text-white leading-[38px] uppercase">EARLY ACCESS + EXCLUSIVE DISCOUNTS ON EVENTS</h3>
              <p className="font-[family-name:var(--font-anek-latin)] font-normal text-[19px] text-white/80 leading-[25px] max-w-[850px]">Enjoy early access to premium events plus exclusive discounts on tickets and experiences. Unlock access before anyone else and save more on every booking</p>
            </div>
          </div>
        </div>

        <div className="absolute left-0 right-0 top-[1008px] text-center font-[family-name:var(--font-anek-latin)] font-normal text-[15px] text-white/50">
          T&C applies
        </div>

        <div className="absolute left-0 right-0 top-[1057px] text-center font-[family-name:var(--font-anek-latin)] font-normal text-[18px] text-white/60 italic">
          *Offer handling charge will be applied at checkout
        </div>

        <div className="absolute left-[285px] top-[1137px] w-[869px] h-[251px] bg-white/[0.035] border border-white/25 rounded-[38px] flex flex-col justify-around px-8 shadow-[inset_0_0_60px_rgba(255,255,255,0.035)]">
          <Link href="/chat-support" className="flex items-center justify-between group hover:bg-white/5 px-6 py-4 rounded-2xl transition-all">
            <div className="flex items-center gap-6">
              <Image src="/pass/support.svg" alt="" width={35} height={35} className="h-[35px] w-[35px]" />
              <span className="font-[family-name:var(--font-anek-latin)] font-medium text-[34px] text-white">Chat with support</span>
            </div>
            <ChevronRight className="w-8 h-8 text-white/40 group-hover:text-white transition-all transform group-hover:translate-x-2" />
          </Link>
          <div className="h-[1px] bg-white/30 mx-6" />
          <Link href="/contact" className="flex items-center justify-between group hover:bg-white/5 px-6 py-4 rounded-2xl transition-all">
            <div className="flex items-center gap-6">
              <Image src="/pass/chat-info.svg" alt="" width={33} height={33} className="h-[33px] w-[33px]" />
              <span className="font-[family-name:var(--font-anek-latin)] font-medium text-[34px] text-white">Frequently Asked Questions</span>
            </div>
            <ChevronRight className="w-8 h-8 text-white/40 group-hover:text-white transition-all transform group-hover:translate-x-2" />
          </Link>
          <div className="h-[1px] bg-white/30 mx-6" />
          <Link href="/terms" className="flex items-center justify-between group hover:bg-white/5 px-6 py-4 rounded-2xl transition-all">
            <div className="flex items-center gap-6">
              <Image src="/pass/docs.svg" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
              <span className="font-[family-name:var(--font-anek-latin)] font-medium text-[34px] text-white">Terms & Conditions</span>
            </div>
            <ChevronRight className="w-8 h-8 text-white/40 group-hover:text-white transition-all transform group-hover:translate-x-2" />
          </Link>
        </div>

        <Link
          href="/pass/buy"
          className="absolute left-[108px] top-[1448px] w-[1223px] h-[111px] bg-white rounded-[63px] flex items-center justify-center transition-all hover:scale-[1.01] active:scale-[0.98] shadow-2xl shadow-blue-500/20"
        >
          <span className="font-[family-name:var(--font-anek-tamil-condensed)] font-bold text-[50px] text-black uppercase tracking-tight">
            BUY TICPIN PASS
          </span>
        </Link>
      </div>
    </main>
  );
}
