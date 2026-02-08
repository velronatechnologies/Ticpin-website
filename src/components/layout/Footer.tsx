'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#282828] text-white pt-10 md:pt-16 pb-6 md:pb-8">
            <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 mb-10 md:mb-16">
                    {/* Main Links */}
                    <div className="flex flex-col gap-6 md:gap-8 md:flex-row md:items-center">
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 md:gap-x-8 gap-y-3">
                            {['Terms & Conditions', 'Privacy Policy', 'Contact Us', 'List your events'].map((link) => (
                                <Link
                                    key={link}
                                    href="#"
                                    className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
                                >
                                    {link}
                                </Link>
                            ))}
                        </div>

                        {/* Added Tags */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {['TOP EVENTS', 'CITY MUSIC', 'SPORTS HUB'].map((tag) => (
                                <span key={tag} className="px-2.5 py-1 border border-zinc-700 rounded-full text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:border-primary hover:text-primary transition-all cursor-default">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* QR Box */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-[#d9d9d9] rounded-2xl flex items-center justify-center">
                            <span className="text-xs md:text-sm font-black text-[#282828] tracking-tighter">QR</span>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-6 md:pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 overflow-hidden">
                    <p className="text-[10px] font-medium text-zinc-500 max-w-2xl leading-relaxed text-center md:text-left">
                        By accessing this page, you confirm that you have read, understood, and agreed to our Terms of Service, Cookie Policy, Privacy Policy, and Content Guidelines. All rights reserved.
                    </p>
                    <button className="px-10 py-2.5 bg-[#d9d9d9] text-[#282828] text-[10px] font-black uppercase tracking-widest rounded transition-all hover:bg-white active:scale-95">
                        Socials
                    </button>
                </div>
            </div>
        </footer>
    );
}
