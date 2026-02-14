'use client';

import { Mail, MapPin, Phone, Send, Globe, MessageSquare } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import BottomBanner from '@/components/layout/BottomBanner';
import { useState } from 'react';

export default function ContactPage() {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted:', formState);
        alert('Thank you for reaching out! We will get back to you soon.');
    };

    return (
        <div className="min-h-screen bg-[#f8f4ff] font-sans transition-all duration-500">
            <main className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16 py-12 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Left Side: Contact Information */}
                    <div className="space-y-12">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-900 mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                GET IN <span className="text-[#5331EA]">TOUCH</span>
                            </h1>
                            <p className="text-zinc-600 text-lg max-w-md leading-relaxed">
                                Have questions about an event, or need help with a booking? Our team is here to help you 24/7.
                            </p>
                        </div>

                        <div className="grid gap-8">
                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#5331EA] group-hover:bg-[#5331EA] group-hover:text-white transition-all duration-300">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 text-lg mb-1">Email Us</h3>
                                    <p className="text-zinc-500">support@ticpin.com</p>
                                    <p className="text-zinc-500">info@ticpin.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#5331EA] group-hover:bg-[#5331EA] group-hover:text-white transition-all duration-300">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 text-lg mb-1">Visit Us</h3>
                                    <p className="text-zinc-500">Velrona Technologies Private Limited</p>
                                    <p className="text-zinc-500">Coimbatore, Tamil Nadu, India</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#5331EA] group-hover:bg-[#5331EA] group-hover:text-white transition-all duration-300">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 text-lg mb-1">Support</h3>
                                    <p className="text-zinc-500">Live chat available in-app</p>
                                    <p className="text-zinc-500">Mon - Sun, 9am - 9pm</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links Placeholder */}
                        <div className="pt-8">
                            <h4 className="font-bold text-zinc-900 mb-4 uppercase tracking-widest text-xs">Follow Our Journey</h4>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-zinc-200 hover:bg-[#5331EA] transition-colors cursor-pointer flex items-center justify-center">
                                        <Globe size={18} className="text-zinc-600 hover:text-white" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Contact Form */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-zinc-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#5331EA]/5 rounded-bl-full -mr-10 -mt-10"></div>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5331EA]/20 focus:border-[#5331EA] transition-all"
                                        value={formState.name}
                                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="john@example.com"
                                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5331EA]/20 focus:border-[#5331EA] transition-all"
                                        value={formState.email}
                                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="How can we help you?"
                                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5331EA]/20 focus:border-[#5331EA] transition-all"
                                    value={formState.subject}
                                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Your Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Tell us more about your query..."
                                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5331EA]/20 focus:border-[#5331EA] transition-all resize-none"
                                    value={formState.message}
                                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-[#5331EA] text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-[#5331EA]/20 hover:bg-[#4326c7] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                Send Message
                                <Send size={18} />
                            </button>
                        </form>
                    </div>

                </div>
            </main>
            {/* <BottomBanner /> */}
            <Footer />
        </div>
    );
}
