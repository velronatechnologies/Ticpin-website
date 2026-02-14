'use client';

import Footer from '@/components/layout/Footer';
import BottomBanner from '@/components/layout/BottomBanner';

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-[#f8f4ff] font-sans transition-all duration-500">
            <main className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16 py-12 md:py-20">
                <div className="max-w-4xl mx-auto bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 shadow-xl border border-zinc-100">
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 mb-4" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            REFUND & CANCELLATION POLICY
                        </h1>
                        <p className="text-[#686868] font-bold uppercase text-xs tracking-widest">
                            Last Updated: July 31, 2025
                        </p>
                    </div>

                    <div className="space-y-12 text-zinc-800 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4 uppercase tracking-tight" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Important Notice
                            </h2>
                            <p className="text-[16px]">
                                By using the Platform and making any booking, you agree to this Policy in addition to Ticpin’s Terms & Conditions and Privacy Policy. Refund and cancellation terms are determined by the Organizer and are displayed at the time of booking.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">1</span>
                                Role of Ticpin
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    Ticpin acts solely as a technology intermediary that facilitates ticket bookings and reservations between customers and third-party organizers, merchants, venues, or service providers (“Organizers”).
                                </p>
                                <p>
                                    Ticpin does not own, organize, control, or manage events, venues, or experiences listed on the Platform. All events and services are the sole responsibility of the respective Organizers.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">2</span>
                                General Refund Principles
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Refund and cancellation terms are determined by the Organizer and are displayed at the time of booking.</li>
                                    <li>By proceeding with a booking, you agree to the Organizer’s specific cancellation and refund terms.</li>
                                    <li>Ticpin does not guarantee refunds unless explicitly stated.</li>
                                    <li>Platform fees, convenience fees, or payment gateway charges are non-refundable, unless otherwise mentioned.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">3</span>
                                Cancellation by Customer
                            </h2>
                            <div className="space-y-6 text-[16px]">
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-2">3.1 Events, Tickets & Experiences</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Customer-initiated cancellations are subject to the Organizer’s cancellation policy.</li>
                                        <li>Some tickets may be non-cancellable and non-refundable.</li>
                                        <li>Where cancellations are allowed, refunds (if any) will be processed after deduction of applicable charges.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-2">3.2 Dining, Turf & Activity Bookings</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Cancellation timelines and refund eligibility vary by venue or merchant.</li>
                                        <li>Late cancellations or no-shows may result in partial or zero refunds.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">4</span>
                                Cancellation or Changes by Organizer
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    If an event is cancelled, postponed, or materially changed by the Organizer, refund or rescheduling options (if any) will be communicated by the Organizer.
                                </p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Ticpin shall facilitate communication and refund processing but does not control refund decisions.</li>
                                    <li>Refund timelines depend on the Organizer and payment gateway.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">5</span>
                                Force Majeure Events
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    No refunds shall be guaranteed for cancellations or disruptions caused by events beyond reasonable control, including but not limited to natural disasters, government orders, pandemics, strikes, technical failures, or public safety concerns, unless the Organizer explicitly offers a refund.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">6</span>
                                Failed, Duplicate, or Incorrect Transactions
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>In case of a failed payment where the amount is debited but the booking is not confirmed, the amount will be reversed as per banking timelines.</li>
                                    <li>For duplicate payments, eligible refunds will be processed after verification.</li>
                                    <li>Ticpin is not responsible for delays caused by banks or payment gateways.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">7</span>
                                Refund Processing Timeline
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Approved refunds are generally processed within 7–14 business days.</li>
                                    <li>The refunded amount will be credited to the original payment method.</li>
                                    <li>Ticpin does not control bank or card issuer processing timelines.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">8</span>
                                Partial Refunds
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>Partial refunds may be issued in situations such as:</p>
                                <ul className="list-disc pl-6 space-y-1 font-medium">
                                    <li>• Partial event cancellation</li>
                                    <li>• Seat or service downgrade</li>
                                    <li>• Organizer-approved adjustments</li>
                                </ul>
                                <p className="mt-2 italic">The refunded amount shall be determined solely by the Organizer.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">9</span>
                                Non-Refundable Situations
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>Refunds shall not be provided for:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Missed events or late arrivals</li>
                                    <li>Incorrect bookings made by the customer</li>
                                    <li>No-shows at venues or events</li>
                                    <li>Tickets lost, stolen, or unused</li>
                                    <li>Violation of venue or event rules</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">10</span>
                                Refund Abuse & Fraud
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>Ticpin reserves the right to:</p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Deny refunds in cases of suspected fraud or abuse</li>
                                    <li>Suspend or terminate user accounts involved in misuse of refund policies</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">11</span>
                                Disputes
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    All disputes related to refunds or cancellations shall be resolved between the Customer and the Organizer. Ticpin may assist in communication but is not liable for the final outcome.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">12</span>
                                Policy Updates
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    Ticpin reserves the right to modify this Policy at any time without prior notice. Updated versions will be published on the Platform and shall be effective immediately.
                                </p>
                            </div>
                        </section>

                        <hr className="border-zinc-100" />

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Contact Support
                            </h2>
                            <p className="text-[16px]">
                                For refund-related queries or support, please contact us through the customer support channels available on the Platform or visit the Contact Page.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <BottomBanner />
            <Footer />
        </div>
    );
}
