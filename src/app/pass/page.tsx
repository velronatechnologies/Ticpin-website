'use client';

import { Star, Smartphone, HelpCircle, FileText, Ticket, Utensils, PlayCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TicpassPage() {
  return (
    <div className="min-h-screen w-full bg-[#000000] text-white p-4 md:p-8 flex flex-col items-center">
      
      {/* Main Content Container */}
      <div className="w-full max-w-4xl flex flex-col gap-6 md:gap-10">
        
        {/* Header Section */}
        <div className="text-center pt-10">
          <h1 className="text-6xl md:text-8xl font-bold">₹799</h1>
          <p className="text-xl md:text-2xl text-white/80">FOR 3 MONTHS</p>
        </div>

        {/* Benefits Header */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/30" />
          <Star className="w-5 h-5 fill-white" />
          <span className="text-lg md:text-2xl uppercase tracking-widest font-medium">Pass Benefits</span>
          <Star className="w-5 h-5 fill-white" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/30" />
        </div>

        {/* Benefits Card */}
        <div className="w-full bg-white/5 border border-white/20 rounded-3xl p-6 md:p-10 flex flex-col gap-8">
          {[
            { icon: PlayCircle, title: "2 FREE TURF BOOKINGS", desc: "Enjoy 2 free turf bookings. Book your next two games at no cost and make the most of your playtime" },
            { icon: Utensils, title: "2 DINING VOUCHERS WORTH ₹250 EACH", desc: "Enjoy 2 dining vouchers worth ₹250 each. Use on dining bills above ₹1000 and save on your next two meals" },
            { icon: Ticket, title: "EARLY ACCESS + EXCLUSIVE DISCOUNTS ON EVENTS", desc: "Enjoy early access to premium events plus exclusive discounts on tickets and experiences." }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <item.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-semibold uppercase">{item.title}</h3>
                <p className="text-sm md:text-lg text-white/60 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="w-full bg-white/5 border border-white/20 rounded-3xl p-4 flex flex-col">
          {[
            { icon: Smartphone, label: "Chat with support", href: "/support" },
            { icon: HelpCircle, label: "Frequently Asked Questions", href: "/faq" },
            { icon: FileText, label: "Terms & Conditions", href: "/terms" }
          ].map((link, idx) => (
            <Link key={idx} href={link.href} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <link.icon className="w-6 h-6" />
                <span className="text-lg font-medium">{link.label}</span>
              </div>
              <ChevronRight className="w-6 h-6 text-white/40" />
            </Link>
          ))}
        </div>

        {/* Buy Button */}
        <button className="w-full py-6 bg-white rounded-full text-black text-2xl md:text-3xl font-bold uppercase tracking-tight hover:scale-[1.01] transition-transform active:scale-[0.98]">
          Buy Ticpin Pass
        </button>
        
        <p className="text-center text-sm text-white/40 pb-10 italic">
          *Offer handling charge will be applied at checkout
        </p>
      </div>
    </div>
  );
}