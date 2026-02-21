'use client';

import React, { useState } from 'react';
import { ChevronDown, Loader2, ArrowLeft } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { commonApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        message: ''
    });

    const categories = ['Dining', 'Events', 'Play'];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await commonApi.submitContactForm({
                ...formData,
                category: selectedCategory
            });

            if (response.success) {
                addToast('Message sent successfully! We will get back to you soon.', 'success');
                setFormData({
                    fullName: '',
                    email: '',
                    mobile: '',
                    message: ''
                });
                setSelectedCategory('');
            } else {
                addToast(response.message || 'Failed to send message', 'error');
            }
        } catch (error) {
            addToast('An error occurred. Please try again later.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = selectedCategory && formData.fullName && formData.email && formData.mobile && formData.message;

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-anek-latin)] flex flex-col">
            {/* Header / Hero section */}
            <header className="relative w-full h-[70px] bg-white border-b border-[#D9D9D9] flex items-center justify-center shrink-0">
                <button
                    onClick={() => router.back()}
                    className="absolute left-6 md:left-12 lg:left-20 p-1 hover:bg-zinc-100 rounded-full transition-colors"
                    aria-label="Go back"
                >
                    <ArrowLeft size={20} />
                </button>
                <img src="/ticpin-logo-black.png" alt="TICPIN" className="h-6 w-auto" />
            </header>

            <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-12 lg:px-20 py-8">
                <h1 className="text-xl md:text-2xl font-bold text-center mb-8">How may we assist you?</h1>

                <div className="flex flex-col lg:flex-row gap-10 lg:gap-20">
                    {/* Form Column */}
                    <div className="flex-1 space-y-3.5 max-w-[420px]">
                        {/* Category Dropdown */}
                        <div className="relative">
                            <div
                                onClick={() => !isSubmitting && setIsCategoryOpen(!isCategoryOpen)}
                                className={`w-full h-12 px-4 border-[1.2px] border-[#AEAEAE] rounded-lg flex items-center justify-between cursor-pointer transition-colors ${selectedCategory ? 'text-black' : 'text-[#AEAEAE]'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="text-base font-medium">
                                    {selectedCategory || 'Dining / Events / Play'}
                                </span>
                                <ChevronDown size={18} className={`text-[#AEAEAE] transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isCategoryOpen && (
                                <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-[#D9D9D9] rounded-lg shadow-lg z-50 overflow-hidden">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setIsCategoryOpen(false);
                                            }}
                                            className="px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-50 cursor-pointer transition-colors"
                                        >
                                            {cat}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Full Name */}
                        <div className="w-full">
                            <input
                                type="text"
                                id="fullName"
                                disabled={isSubmitting}
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Full name *"
                                className="w-full h-12 px-4 border-[1.2px] border-[#AEAEAE] rounded-lg text-base font-medium placeholder:text-[#AEAEAE] focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                            />
                        </div>

                        {/* Email Address */}
                        <div className="w-full">
                            <input
                                type="email"
                                id="email"
                                disabled={isSubmitting}
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email address *"
                                className="w-full h-12 px-4 border-[1.2px] border-[#AEAEAE] rounded-lg text-base font-medium placeholder:text-[#AEAEAE] focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                            />
                        </div>

                        {/* Mobile Number */}
                        <div className="w-full">
                            <input
                                type="tel"
                                id="mobile"
                                disabled={isSubmitting}
                                value={formData.mobile}
                                onChange={handleInputChange}
                                placeholder="Mobile number *"
                                className="w-full h-12 px-4 border-[1.2px] border-[#AEAEAE] rounded-lg text-base font-medium placeholder:text-[#AEAEAE] focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                            />
                        </div>

                        {/* Message / Issue */}
                        <div className="w-full">
                            <textarea
                                id="message"
                                disabled={isSubmitting}
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Tell us about your issue *"
                                className="w-full h-24 px-4 py-2.5 border-[1.2px] border-[#AEAEAE] rounded-lg text-base font-medium placeholder:text-[#AEAEAE] focus:outline-none focus:border-black transition-colors resize-none disabled:opacity-50"
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center gap-4 pt-1">
                            {!isFormValid ? (
                                <button
                                    className="px-6 h-10 bg-[#D9D9D9] text-[#B4B4B4] text-base font-semibold rounded-lg cursor-not-allowed"
                                    disabled
                                >
                                    Submit
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-6 h-10 bg-black text-white text-base font-semibold rounded-lg hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2 min-w-[120px] justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        'Submit'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Info Column */}
                    <div className="flex-1 lg:pt-2">
                        <h2 className="text-lg font-bold text-black mb-2">Other options</h2>
                        <p className="text-base font-medium text-[#686868] leading-snug max-w-[450px]">
                            Open the Ticpin website &rarr; Go to your profile &rarr; Tap &ldquo;Chat with us&rdquo; under View all bookings to quickly get help from our support team.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
