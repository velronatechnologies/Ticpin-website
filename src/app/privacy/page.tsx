'use client';

import Footer from '@/components/layout/Footer';
import BottomBanner from '@/components/layout/BottomBanner';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#f8f4ff] font-sans transition-all duration-500">
            <main className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16 py-12 md:py-20">
                <div className="max-w-4xl mx-auto bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 shadow-xl border border-zinc-100">
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 mb-4" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            PRIVACY POLICY
                        </h1>
                        <p className="text-[#686868] font-bold uppercase text-xs tracking-widest">
                            Last Updated: July 31, 2025
                        </p>
                    </div>

                    <div className="space-y-12 text-zinc-800 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4 uppercase tracking-tight" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Your Privacy Matters
                            </h2>
                            <p className="text-[16px]">
                                Velrona Technologies Private Limited, the owner and operator of the Ticpin platform, respects your privacy and is committed to protecting your personal data. By accessing or using the Platform, you consent to the practices described in this Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">1</span>
                                Scope of This Privacy Policy
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    This Privacy Policy applies to all users of the Platform, including customers, organizers, merchants, vendors, and visitors. This Policy should be read together with the Ticpin Terms & Conditions.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">2</span>
                                Information We Collect
                            </h2>
                            <div className="space-y-6 text-[16px]">
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-3">2.1 Personal Information</h3>
                                    <p className="mb-2">We may collect the following personal information:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Name</li>
                                        <li>Mobile number</li>
                                        <li>Email address</li>
                                        <li>Date of birth (where required)</li>
                                        <li>Account login details</li>
                                        <li>Preferences and profile information</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-3">2.2 Payment Information</h3>
                                    <p>
                                        All payments are processed through authorized third-party payment gateways. Ticpin does not store your complete debit card, credit card, or UPI details.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-3">2.3 Usage & Technical Data</h3>
                                    <p className="mb-2">We may collect:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Device and browser information</li>
                                        <li>IP address and log data</li>
                                        <li>Location data (approximate or precise, subject to permission)</li>
                                        <li>App usage behavior, searches, clicks, and booking history</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-3">2.4 User-Generated Content</h3>
                                    <p className="mb-2">We may collect:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Reviews, ratings, comments</li>
                                        <li>Photos, videos, and messages shared on the Platform</li>
                                        <li>Communications with customer support</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-3">2.5 Information from Third Parties</h3>
                                    <p>
                                        We may receive information from event organizers, merchants, payment providers, analytics partners, or marketing partners.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">3</span>
                                How We Use Your Information
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>We use collected information to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Create and manage user accounts</li>
                                    <li>Enable ticket bookings and reservations</li>
                                    <li>Process payments and confirmations</li>
                                    <li>Provide customer support</li>
                                    <li>Send transactional, service, and promotional communications</li>
                                    <li>Personalize content and recommendations</li>
                                    <li>Improve platform features and performance</li>
                                    <li>Detect and prevent fraud, misuse, and security incidents</li>
                                    <li>Comply with legal and regulatory obligations</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">4</span>
                                Legal Basis for Processing
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>We process personal data based on:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Your consent</li>
                                    <li>Performance of a contract</li>
                                    <li>Compliance with legal obligations</li>
                                    <li>Legitimate business interests</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">5</span>
                                Cookies and Tracking Technologies
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    We use cookies, SDKs, and similar technologies to enhance user experience, analyze usage, and improve Services. You may control cookies through your device or browser settings, but disabling them may affect Platform functionality.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">6</span>
                                Sharing of Information
                            </h2>
                            <div className="space-y-6 text-[16px]">
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-2 text-[16px]">6.1 Organizers & Merchants</h3>
                                    <p>To fulfill bookings, manage entries, and provide event-related services.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-2 text-[16px]">6.2 Service Providers</h3>
                                    <p>Including cloud hosting, analytics, communication, and customer support providers.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-2 text-[16px]">6.3 Payment Partners</h3>
                                    <p>For secure processing of transactions.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-2 text-[16px]">6.4 Legal Authorities</h3>
                                    <p>When required by law, court order, or governmental request.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-2 text-[16px]">6.5 Business Transfers</h3>
                                    <p>In the event of a merger, acquisition, or sale of assets.</p>
                                </div>
                                <p className="font-bold text-zinc-900 pt-2 italic">
                                    We do not sell your personal data to third parties.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">7</span>
                                Data Retention
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    We retain personal data only as long as necessary to provide Services, comply with legal obligations, resolve disputes, and enforce agreements.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">8</span>
                                Data Security
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    We implement reasonable administrative, technical, and physical safeguards to protect your data. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">9</span>
                                Your Rights and Choices
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>Subject to applicable law, you may:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Access or update your personal information</li>
                                    <li>Withdraw consent for marketing communications</li>
                                    <li>Request account deletion</li>
                                    <li>Request correction or deletion of data</li>
                                </ul>
                                <p>
                                    Requests can be made through the Platform or via official support channels.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">10</span>
                                Children's Privacy
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    The Platform is not intended for independent use by individuals under 18 years of age. Minors may use the Platform only under parental or legal guardian supervision.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5331EA] text-white text-sm font-black">11</span>
                                Changes to This Privacy Policy
                            </h2>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    We may update this Privacy Policy from time to time. Continued use of the Platform after changes constitutes acceptance of the revised Policy.
                                </p>
                            </div>
                        </section>

                        <hr className="border-zinc-100" />

                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 mb-4" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Grievance Redressal & Contact
                            </h2>
                            <p className="text-[16px]">
                                For questions, concerns, or grievances related to this Privacy Policy or your data, please contact us through the support channels available on the Platform.
                            </p>
                            <p className="mt-6 font-bold text-zinc-900 text-[16px]">
                                By using Ticpin, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
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
