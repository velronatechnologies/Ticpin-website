import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, Calendar, Shield, AlertCircle } from "lucide-react";

const TermsAndConditions = () => {
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
              <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6">
              Terms & Conditions
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
                  Thank you for using Ticpin. Please read these Terms carefully. By accessing or using the Platform,
                  you agree to be bound by these Terms and enter into a legally binding agreement with Ticpin Technologies Private Limited.
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
                "Acceptance of Terms",
                "Definitions",
                "Services Overview",
                "Eligibility",
                "Account Registration",
                "Use of Services",
                "Content",
                "Intellectual Property",
                "Payments & Refunds",
                "Limitation of Liability",
                "Indemnification",
                "Governing Law"
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

          {/* Terms Content */}
          <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">

            {/* Section 1 */}
            <section id="acceptance-of-terms" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                1. Acceptance of Terms
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  These Terms and Conditions (the "Terms") are intended to inform you of your legal rights and
                  responsibilities with respect to your access to and use of the Ticpin website, mobile
                  application, and any other associated software applications (collectively, the "Platform").
                </p>
                <p>
                  Please read these Terms carefully. By accessing or using the Platform, you agree to be bound
                  by these Terms and enter into a legally binding agreement with Ticpin Technologies Private
                  Limited ("Ticpin" / "We" / "Us" / "Our"). If you do not agree to these Terms or are not capable
                  of being legally bound by them, you must not use the Platform or its Services.
                </p>
                <p>
                  By visiting the Platform and/or purchasing or booking tickets or services through it, you
                  engage with our Services and agree to be bound by these Terms, including any additional
                  terms, conditions, policies, or guidelines referenced herein or made available via hyperlinks on
                  the Platform. These Terms apply to all users, including browsers, customers, organizers, event
                  managers, vendors, merchants, and content contributors.
                </p>
                <p>
                  Your access to and use of the Platform is also governed by our Privacy Policy, which forms an
                  integral part of these Terms.
                </p>
                <p className="font-semibold text-gray-900">
                  We reserve the right to modify or update these Terms at any time without prior notice.
                  Continued use of the Platform after such changes constitutes your acceptance of the revised
                  Terms. In case of any conflict between these Terms and any other terms displayed on the
                  Platform, these Terms shall prevail.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="definitions" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                2. Definitions
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <ul className="space-y-3 md:space-y-4">
                  <li className="pl-4 border-l-4 border-purple-200 py-2">
                    <strong className="text-gray-900">"Customer", "You", or "Your"</strong> refers to any individual accessing or using the Platform to
                    browse events, purchase or reserve tickets, submit content, or otherwise engage with
                    the Services.
                  </li>
                  <li className="pl-4 border-l-4 border-purple-200 py-2">
                    <strong className="text-gray-900">"Organizer" or "Merchant"</strong> refers to any third-party individual or entity (including event
                    organizers, venue managers, or service providers) who list, manage, or promote events
                    or services on the Platform.
                  </li>
                  <li className="pl-4 border-l-4 border-purple-200 py-2">
                    <strong className="text-gray-900">"Services"</strong> refers to discovery, listing, booking, and purchase of tickets or reservations
                    for events, entertainment, activities, and related experiences through the Platform.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="services-overview" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                3. Services Overview
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  Ticpin is a digital technology platform that facilitates discovery, booking, and purchase of
                  tickets and reservations for various events and experiences, including but not limited to
                  concerts, festivals, conferences, exhibitions, workshops, sports events, and other
                  entertainment activities ("Services").
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6 my-4 md:my-6">
                  <p className="font-semibold text-blue-900 mb-2">Important:</p>
                  <p className="text-blue-800">
                    All events and services are offered, managed, and fulfilled solely by the respective Organizers
                    or Merchants. Ticpin does not organize, own, control, or operate any event or venue listed on
                    the Platform.
                  </p>
                </div>
                <p>
                  Services are currently available only in selected locations within India and may be expanded or
                  restricted at our discretion.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="eligibility" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                4. Eligibility
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  You must be legally capable of entering into a binding contract under the Indian Contract Act,
                  1872 to use the Platform. Persons who are incompetent to contract, including minors, are not
                  eligible to independently use the Platform.
                </p>
                <p>
                  If you are under 18 years of age, you may use the Platform only under the supervision of a
                  parent or legal guardian who agrees to be bound by these Terms on your behalf.
                </p>
                <p>
                  If you are accessing the Platform on behalf of a company, organization, or other legal entity,
                  you represent and warrant that you have the authority to bind such entity to these Terms.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="account-registration" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                5. Account Registration and Obligations
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  To access certain features or make bookings, you must create and maintain an active account.
                  You agree to provide accurate, current, and complete information during registration and to
                  promptly update such information as required.
                </p>
                <p>
                  You are responsible for maintaining the confidentiality of your login credentials and for all
                  activities conducted through your account. Ticpin shall not be liable for any loss arising from
                  unauthorized use of your account.
                </p>
                <p>
                  By registering, you consent to receive communications from Ticpin via email, SMS, push
                  notifications, or other digital means, including transactional, service-related, and promotional
                  messages. You may manage communication preferences through available opt-out
                  mechanisms.
                </p>
                <p>
                  During your use of the Platform, we may collect personal and usage data such as your name,
                  contact details, location, device information, preferences, and booking behavior, in accordance
                  with our Privacy Policy.
                </p>
                <p>
                  By providing your mobile number, you expressly consent to receive calls and messages from
                  Ticpin or its authorized service providers for purposes including customer support, service
                  updates, and confirmations.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="use-of-services" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                6. Use of Services
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>You agree to use the Platform and Services:</p>
                <ul className="space-y-2 md:space-y-3 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Only for lawful purposes;</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>In compliance with these Terms and applicable laws;</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Without infringing the rights of any third party;</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Without interfering with the security, functionality, or integrity of the Platform.</span>
                  </li>
                </ul>
                <p className="font-semibold text-gray-900">
                  Any misuse of the Platform may result in suspension or termination of your access.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="content" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                7. Content
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">Definition of Content</h3>
                <p>
                  "Content" includes, without limitation, text, images, photographs, videos, audio clips, reviews,
                  ratings, messages, listings, data, and other information displayed or transmitted on the
                  Platform.
                </p>
                <ul className="space-y-3 md:space-y-4 ml-4 md:ml-6">
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span><strong>"Your Content" or "Customer Content"</strong> refers to any content you upload, submit, share,
                      or display on the Platform.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span><strong>"Our Content"</strong> refers to all content created or owned by Ticpin, including software,
                      design, interfaces, logos, trademarks, analytics, and platform features.</span>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span><strong>"Third Party Content"</strong> refers to content provided by Organizers, Merchants, advertisers,
                      or other third parties.</span>
                  </li>
                </ul>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-8 mb-3">Content Moderation</h3>
                <p>
                  Ticpin reserves the right, but not the obligation, to review, remove, disable, or restrict access
                  to any content that violates these Terms or is deemed unlawful, misleading, offensive, or
                  inappropriate.
                </p>
                <p>
                  We are not responsible for the accuracy, legality, or reliability of Customer Content or Third
                  Party Content.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="intellectual-property" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                8. Intellectual Property Rights
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  All rights, title, and interest in the Platform and Our Content, including all intellectual property
                  rights worldwide, are exclusively owned by Ticpin or its licensors.
                </p>
                <p>
                  You agree not to copy, reproduce, distribute, modify, display, sell, or create derivative works
                  from Our Content or trademarks without prior written authorization.
                </p>
                <p>
                  Ticpin grants you a limited, non-exclusive, non-transferable, revocable license to access and
                  use the Platform solely for personal, non-commercial use in accordance with these Terms.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 md:p-6 my-4 md:my-6">
                  <h4 className="font-semibold text-purple-900 mb-2">License to Your Content</h4>
                  <p className="text-purple-800">
                    By submitting Customer Content, you grant Ticpin a perpetual, irrevocable, worldwide, royalty-free,
                    sublicensable license to use, host, store, reproduce, modify, publish, display, distribute,
                    and promote such content in connection with the Platform and its Services.
                  </p>
                </div>
                <p>
                  You represent and warrant that you own or have the necessary rights to submit such content
                  and that it does not violate any law or third-party rights.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="payments-and-refunds" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                9. Payments, Cancellations, and Refunds
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  All payments are processed through third-party payment gateways. Ticpin is not responsible
                  for payment failures or delays caused by such providers.
                </p>
                <p>
                  Cancellation, refund, and rescheduling policies are determined solely by the respective
                  Organizer or Merchant and will be disclosed at the time of booking. Platform or convenience
                  fees may be non-refundable.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="limitation-of-liability" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                10. Limitation of Liability
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  To the maximum extent permitted by law, Ticpin shall not be liable for any indirect, incidental,
                  special, consequential, or punitive damages arising from your use of the Platform or Services.
                </p>
                <p className="font-semibold text-gray-900">
                  Ticpin is not responsible for the conduct, quality, safety, or legality of events or services
                  provided by Organizers.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section id="indemnification" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                11. Indemnification
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  You agree to indemnify and hold harmless Ticpin, its directors, employees, and affiliates from
                  any claims, losses, damages, liabilities, or expenses arising out of your use of the Platform,
                  violation of these Terms, or infringement of third-party rights.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="governing-law" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                12. Suspension and Termination
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  We reserve the right to suspend or terminate your account or access to the Platform at our
                  sole discretion, without prior notice, for any violation of these Terms or applicable laws.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section id="governing-law" className="mb-8 md:mb-12 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{ color: '#5331ea' }}>
                13. Governing Law and Jurisdiction
              </h2>
              <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India. Courts
                  located in Coimbatore, Tamil Nadu, shall have exclusive jurisdiction.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 md:p-8 mt-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#5331ea' }}>
                Contact Information
              </h2>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                For any questions or grievances regarding these Terms or the Platform, please contact us
                through the support channels available on the Platform or visit our{" "}
                <a href="/contact" className="font-semibold hover:underline" style={{ color: '#5331ea' }}>
                  Contact Page
                </a>.
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

export default TermsAndConditions;
