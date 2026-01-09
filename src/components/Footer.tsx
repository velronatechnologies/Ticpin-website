import { Instagram, Twitter, Linkedin, Facebook, Ticket, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const companyLinks = [
    { name: "About Us", href: "#about" },
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
    { name: "Terms of Service", href: "#terms" },
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Refund Policy", href: "#refund" },
    { name: "Cancellation Policy", href: "#cancellation" },
  ];

  return (
    <footer className="bg-secondary/50 border-t border-border/30 py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="/" className="flex items-center gap-2 lg:gap-3 mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Ticket className="w-5 h-5 lg:w-6 lg:h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl lg:text-3xl font-black tracking-tight text-white">
                TicPin
              </span>
            </a>

            <p className="text-muted-foreground mb-6 max-w-md text-sm lg:text-base">
              Book dining tables, event tickets, and turf slots—all in one place. Quick, easy, and secure bookings with instant confirmation.
            </p>

            {/* Download App CTA */}
            <div className="flex flex-col gap-3">
              <Button
                className="bg-primary hover:bg-primary/90 transition-all duration-200 rounded-lg px-4 py-3 h-auto justify-start gap-3 text-left w-full sm:w-auto"
              >
                <Smartphone className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/80">Download the</p>
                  <p className="text-sm font-semibold">TicPin App</p>
                </div>
              </Button>
            </div>
          </div>

          {/* Features Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {featuresLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social and Copyright */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm text-center md:text-left">
            © {new Date().getFullYear()} TicPin. All rights reserved. Made with ❤️ in India
          </p>

          <div className="flex items-center gap-4">
            <a href="#instagram" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#twitter" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#linkedin" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#facebook" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
