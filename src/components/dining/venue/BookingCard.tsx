'use client';

import { ChevronDown } from 'lucide-react';

export default function BookingCard() {
    return (
        <div className="bg-white border border-[#686868]/30 rounded-[20px] overflow-hidden shadow-sm p-8 space-y-6">
            <h3 className="text-2xl font-semibold text-black">Book a table</h3>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Date</label>
                    <div className="relative">
                        <select className="w-full px-4 py-3 bg-white rounded-xl border border-[#686868]/30 text-base text-zinc-900 font-medium appearance-none cursor-pointer focus:outline-none">
                            <option>Today, {'{'}  DATE {'}'}</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Guests</label>
                    <div className="relative">
                        <select className="w-full px-4 py-3 bg-white rounded-xl border border-[#686868]/30 text-base text-zinc-900 font-medium appearance-none cursor-pointer focus:outline-none">
                            <option>{'{'} COUNT {'}'} guests</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-[#686868]/20">
                <button
                    style={{
                        width: '100%',
                        height: '48px',
                        letterSpacing: '0',
                        fontFamily: 'var(--font-anek-tamil)',
                        fontWeight: 500,
                        fontSize: '24px',
                        lineHeight: '200%'
                    }}
                    className="bg-black text-white uppercase rounded-[9px] hover:bg-zinc-800 transition-all flex items-center justify-center"
                >
                    BOOK TABLE
                </button>
            </div>
        </div>
    );
}
