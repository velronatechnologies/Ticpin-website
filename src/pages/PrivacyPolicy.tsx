import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Calendar, AlertCircle, Eye } from "lucide-react";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#5331ea' }}>
        <div className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-12 md:pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm mx-auto">
              <Eye className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6">
              Privacy Policy
            </h1>
            <div className="flex items-center justify-center gap-2 text-white/90 text-sm md:text-base">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              <span>Last Updated: July 31, 2025</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">

          {/* Important Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 md:p-6 rounded-r-lg mb-8 md:mb-12">
            <div className="flex gap-3 md:gap-4">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 text-base md:text-lg mb-2">Your Privacy Matters</h3>
                <p className="text-amber-800 text-sm md:text-base leading-relaxed">
                  Velrona Technologies Private Limited, the owner and operator of the Ticpin platform, respects your privacy 
                  and is committed to protecting your personal data. By accessing or using the Platform, you consent to the 
                  practices described in this Privacy Policy.
                </p>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-gray-50 rounded-xl p-6 md:p-8 mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 md:w-7 md:h-7" style={{ color: '#5331ea' }} />
              Quick Navigation
            </h2>
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              {[
                "Scope of Policy",
                "Information We Collect",
                "How We Use Information",
                "Legal Basis",
                "Cookies & Tracking",
                "Sharing Information",
                "Data Retention",
                "Data Security",
                "Your Rights",
                "Children's Privacy",
                "Policy Changes",
                "Contact Us"
              ].map((item, index) => (
                <a
                  key={index}
                  href={`#${item.toLowerCase().replace(/['\s]+/g, '-').replace(/&/g, 'and')}`}
                  className="text-sm md:text-base hover:text-white hover:bg-gradient-to-r from-purple-600 to-indigo-600 text-gray-700 px-3 md:px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Privacy Policy Content */}
          <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">

            {/* Section 1 */}
            <section id="scope-of-policy" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                1. Scope of This Privacy Policy
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  This Privacy Policy applies to all users of the Platform, including customers, organizers, merchants, 
                  vendors, and visitors. This Policy should be read together with the Ticpin Terms & Conditions.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="information-we-collect" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                2. Information We Collect
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">2.1 Personal Information</h3>
                <p>We may collect the following personal information:</p>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Name</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Mobile number</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Email address</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Date of birth (where required)</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Account login details</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Preferences and profile information</span>
                  </li>
                </ul>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-8 mb-3">2.2 Payment Information</h3>
                <p>
                  All payments are processed through authorized third-party payment gateways. Ticpin does not store 
                  your complete debit card, credit card, or UPI details.
                </p>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-8 mb-3">2.3 Usage & Technical Data</h3>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Device and browser information</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>IP address and log data</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Location data (approximate or precise, subject to permission)</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>App usage behavior, searches, clicks, and booking history</span>
                  </li>
                </ul>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-8 mb-3">2.4 User-Generated Content</h3>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Reviews, ratings, comments</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Photos, videos, and messages shared on the Platform</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Communications with customer support</span>
                  </li>
                </ul>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-8 mb-3">2.5 Information from Third Parties</h3>
                <p>
                  We may receive information from event organizers, merchants, payment providers, analytics partners, 
                  or marketing partners.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="how-we-use-information" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                3. How We Use Your Information
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>We use collected information to:</p>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Create and manage user accounts</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Enable ticket bookings and reservations</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Process payments and confirmations</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Provide customer support</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Send transactional, service, and promotional communications</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Personalize content and recommendations</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Improve platform features and performance</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Detect and prevent fraud, misuse, and security incidents</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Comply with legal and regulatory obligations</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="legal-basis" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                4. Legal Basis for Processing
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>We process personal data based on:</p>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Your consent</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Performance of a contract</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Compliance with legal obligations</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Legitimate business interests</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="cookies-and-tracking" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                5. Cookies and Tracking Technologies
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  We use cookies, SDKs, and similar technologies to enhance user experience, analyze usage, and improve 
                  Services. You may control cookies through your device or browser settings, but disabling them may affect 
                  Platform functionality.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="sharing-information" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                6. Sharing of Information
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>We may share your information with:</p>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">6.1 Organizers & Merchants</h3>
                <p>To fulfill bookings, manage entries, and provide event-related services.</p>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">6.2 Service Providers</h3>
                <p>Including cloud hosting, analytics, communication, and customer support providers.</p>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">6.3 Payment Partners</h3>
                <p>For secure processing of transactions.</p>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">6.4 Legal Authorities</h3>
                <p>When required by law, court order, or governmental request.</p>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">6.5 Business Transfers</h3>
                <p>In the event of a merger, acquisition, or sale of assets.</p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6 my-4 md:my-6">
                  <p className="font-semibold text-blue-900">
                    We do not sell your personal data to third parties.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="data-retention" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                7. Data Retention
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  We retain personal data only as long as necessary to provide Services, comply with legal obligations, 
                  resolve disputes, and enforce agreements.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="data-security" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                8. Data Security
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  We implement reasonable administrative, technical, and physical safeguards to protect your data. However, 
                  no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="your-rights" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                9. Your Rights and Choices
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>Subject to applicable law, you may:</p>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Access or update your personal information</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Withdraw consent for marketing communications</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Request account deletion</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Request correction or deletion of data</span>
                  </li>
                </ul>
                <p className="mt-4">
                  Requests can be made through the Platform or via official support channels.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="children's-privacy" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                10. Children's Privacy
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  The Platform is not intended for independent use by individuals under 18 years of age. Minors may use 
                  the Platform only under parental or legal guardian supervision.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section id="policy-changes" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                11. Changes to This Privacy Policy
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  We may update this Privacy Policy from time to time. Continued use of the Platform after changes 
                  constitutes acceptance of the revised Policy.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="contact-us" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                12. Grievance Redressal & Contact
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  For questions, concerns, or grievances related to this Privacy Policy or your data, please contact us 
                  through the support channels available on the Platform.
                </p>
              </div>
            </section>

            {/* Final Notice */}
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 md:p-8 mt-12">
              <p className="text-gray-700 text-sm md:text-base leading-relaxed text-center">
                By using Ticpin, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
              </p>
            </section>
          </div>

          {/* Back to Top Button */}
          <div className="text-center mt-8 md:mt-12">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition-all duration-200 text-sm md:text-base"
              style={{ backgroundColor: '#5331ea' }}
            >
              Back to Top
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
