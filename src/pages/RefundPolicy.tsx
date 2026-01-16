import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RefreshCcw, Calendar, AlertCircle, Shield } from "lucide-react";

const RefundPolicy = () => {
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
              <RefreshCcw className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6">
              Refund & Cancellation Policy
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
                <h3 className="font-bold text-amber-900 text-base md:text-lg mb-2">Important Notice</h3>
                <p className="text-amber-800 text-sm md:text-base leading-relaxed">
                  By using the Platform and making any booking, you agree to this Policy in addition to Ticpin's Terms & Conditions 
                  and Privacy Policy. Refund and cancellation terms are determined by the Organizer and are displayed at the time of booking.
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
                "Role of Ticpin",
                "General Refund Principles",
                "Cancellation by Customer",
                "Cancellation by Organizer",
                "Force Majeure Events",
                "Failed Transactions",
                "Refund Timeline",
                "Partial Refunds",
                "Non-Refundable",
                "Refund Abuse",
                "Disputes",
                "Contact Support"
              ].map((item, index) => (
                <a
                  key={index}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                  className="text-sm md:text-base hover:text-white hover:bg-gradient-to-r from-purple-600 to-indigo-600 text-gray-700 px-3 md:px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Policy Content */}
          <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">

            {/* Section 1 */}
            <section id="role-of-ticpin" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                1. Role of Ticpin
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  Ticpin acts solely as a technology intermediary that facilitates ticket bookings and reservations 
                  between customers and third-party organizers, merchants, venues, or service providers ("Organizers").
                </p>
                <p className="font-semibold text-gray-900">
                  Ticpin does not own, organize, control, or manage events, venues, or experiences listed on the 
                  Platform. All events and services are the sole responsibility of the respective Organizers.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="general-refund-principles" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                2. General Refund Principles
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Refund and cancellation terms are determined by the Organizer and are displayed at the time of booking.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>By proceeding with a booking, you agree to the Organizer's specific cancellation and refund terms.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Ticpin does not guarantee refunds unless explicitly stated.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Platform fees, convenience fees, or payment gateway charges are non-refundable, unless otherwise mentioned.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="cancellation-by-customer" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                3. Cancellation by Customer
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">3.1 Events, Tickets & Experiences</h3>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Customer-initiated cancellations are subject to the Organizer's cancellation policy.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Some tickets may be non-cancellable and non-refundable.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Where cancellations are allowed, refunds (if any) will be processed after deduction of applicable charges.</span>
                  </li>
                </ul>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-8 mb-3">3.2 Dining, Turf & Activity Bookings</h3>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Cancellation timelines and refund eligibility vary by venue or merchant.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Late cancellations or no-shows may result in partial or zero refunds.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="cancellation-by-organizer" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                4. Cancellation or Changes by Organizer
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>If an event is cancelled, postponed, or materially changed by the Organizer, refund or rescheduling options (if any) will be communicated by the Organizer.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Ticpin shall facilitate communication and refund processing but does not control refund decisions.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Refund timelines depend on the Organizer and payment gateway.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="force-majeure-events" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                5. Force Majeure Events
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  No refunds shall be guaranteed for cancellations or disruptions caused by events beyond reasonable 
                  control, including but not limited to natural disasters, government orders, pandemics, strikes, 
                  technical failures, or public safety concerns, unless the Organizer explicitly offers a refund.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="failed-transactions" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                6. Failed, Duplicate, or Incorrect Transactions
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>In case of a failed payment where the amount is debited but the booking is not confirmed, the amount will be reversed as per banking timelines.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>For duplicate payments, eligible refunds will be processed after verification.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Ticpin is not responsible for delays caused by banks or payment gateways.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section id="refund-timeline" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                7. Refund Processing Timeline
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Approved refunds are generally processed within 7–14 business days.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>The refunded amount will be credited to the original payment method.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Ticpin does not control bank or card issuer processing timelines.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section id="partial-refunds" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                8. Partial Refunds
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>Partial refunds may be issued in situations such as:</p>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Partial event cancellation</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Seat or service downgrade</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Organizer-approved adjustments</span>
                  </li>
                </ul>
                <p className="mt-4">
                  The refunded amount shall be determined solely by the Organizer.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="non-refundable" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                9. Non-Refundable Situations
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>Refunds shall not be provided for:</p>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Missed events or late arrivals</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Incorrect bookings made by the customer</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>No-shows at venues or events</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Tickets lost, stolen, or unused</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Violation of venue or event rules</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 10 */}
            <section id="refund-abuse" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                10. Refund Abuse & Fraud
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>Ticpin reserves the right to:</p>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Deny refunds in cases of suspected fraud or abuse</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Suspend or terminate user accounts involved in misuse of refund policies</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 11 */}
            <section id="disputes" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                11. Disputes
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  All disputes related to refunds or cancellations shall be resolved between the Customer and the 
                  Organizer. Ticpin may assist in communication but is not liable for the final outcome.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="policy-updates" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                12. Policy Updates
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  Ticpin reserves the right to modify this Policy at any time without prior notice. Updated versions 
                  will be published on the Platform and shall be effective immediately.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact-support" className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 md:p-8 mt-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#5331ea' }}>
                13. Contact Support
              </h2>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                For refund-related queries or support, please contact us through the customer support channels 
                available on the Platform or visit our{" "}
                <a href="/contact" className="font-semibold hover:underline" style={{ color: '#5331ea' }}>
                  Contact Page
                </a>.
              </p>
            </section>

            {/* Final Notice */}
            <section className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6 rounded-r-lg mt-8">
              <p className="text-blue-800 text-sm md:text-base leading-relaxed">
                By making a booking on Ticpin, you acknowledge that you have read, understood, and agreed to this 
                Refund & Cancellation Policy.
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

export default RefundPolicy;
