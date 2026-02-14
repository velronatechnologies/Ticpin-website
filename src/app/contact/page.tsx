'use client';

import { Mail, MessageSquare } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#f8f4ff] font-sans transition-all duration-500">
            <main className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16 py-20 md:py-32 flex flex-col items-center justify-center text-center">

                {/* Header Section */}
                <div className="max-w-3xl space-y-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            GET IN <span className="text-[#5331EA]">TOUCH</span>
                        </h1>
                        <p className="text-zinc-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            Have questions about an event, or need help with a booking? Our team is here to help you 24/7.
                        </p>
                    </div>

                    {/* Contact Options centered */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 pt-12">
                        {/* Email Card */}
                        <div className="flex flex-col items-center space-y-4 group">
                            <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-[#5331EA] group-hover:bg-[#5331EA] group-hover:text-white transition-all duration-500 hover:-translate-y-2">
                                <Mail size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 text-xl mb-1">Email Us</h3>
                                <p className="text-zinc-500 text-lg font-medium">partnership@ticpin.in</p>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="flex flex-col items-center space-y-4 group">
                            <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-[#5331EA] group-hover:bg-[#5331EA] group-hover:text-white transition-all duration-500 hover:-translate-y-2">
                                <MessageSquare size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 text-xl mb-1">Support</h3>
                                <p className="text-zinc-500 text-lg font-medium">Live chat available in-app</p>
                                <p className="text-zinc-400 text-sm">Mon - Sun, 9am - 9pm</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
