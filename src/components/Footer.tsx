import { Instagram, Twitter, Linkedin, Facebook, Ticket, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  const companyLinks = [
    { name: "Careers", href: "#careers" },
    { name: "Blog", href: "#blog" },
    { name: "Support", href: "#support" },
  ];

  const featuresLinks = [
    { name: "Dining Reservations", href: "#dining" },
    { name: "Event Tickets", href: "#events" },
    { name: "Turf Booking", href: "#turfs" },
    { name: "My Bookings", href: "#bookings" },
  ];

  const legalLinks = [
    { name: "Terms and conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund & Cancellation", href: "/refund" },
  ];

  return (
    <footer className="py-6 md:py-8" style={{ backgroundColor: '#5331ea', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div className="container mx-auto px-4 md:px-6">
        {/* List Your Events First */}
        <div className="mb-6 md:mb-8 text-center">
          <Link to="/list-events">
            <h3 className="text-white text-lg md:text-xl font-semibold hover:text-white/80 transition-colors cursor-pointer">
              List your events first
            </h3>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-3">
              <img
                src="/ticpin-logo-text.png"
                alt="TicPin Logo"
                className="h-5 w-auto"
              />
            </a>

            <p className="text-white/80 mb-3 max-w-xs text-xs md:text-sm">
              Book dining, events, and turfs—all in one place.
            </p>

            {/* Download App CTA */}
            <Button
              className="transition-all duration-200 rounded-lg px-3 py-2 h-auto justify-start gap-2 text-left w-full sm:w-auto hidden md:flex"
              style={{ backgroundColor: '#ffffff', color: '#5331ea' }}
            >
              <Smartphone className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold" style={{ color: '#5331ea' }}>Download App</p>
              </div>
            </Button>
          </div>

          {/* Features Links */}
          <div>
            <h4 className="text-white font-semibold mb-2 md:mb-3 text-xs uppercase tracking-wider">Services</h4>
            <ul className="space-y-1.5 md:space-y-2">
              {featuresLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors duration-200 text-xs md:text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-2 md:mb-3 text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-1.5 md:space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors duration-200 text-xs md:text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-2 md:mb-3 text-xs uppercase tracking-wider">Legal</h4>
            <ul className="space-y-1.5 md:space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors duration-200 text-xs md:text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social and Copyright */}
        <div className="mt-6 pt-4 md:pt-5 flex flex-col md:flex-row justify-between items-center gap-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <p className="text-white/80 text-xs md:text-sm text-center md:text-left">
            © {new Date().getFullYear()} TicPin. All rights reserved.
          </p>

          <div className="flex items-center gap-3 md:gap-4">
            <a href="#instagram" className="text-white/80 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a href="#twitter" className="text-white/80 hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a href="#linkedin" className="text-white/80 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a href="#facebook" className="text-white/80 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
