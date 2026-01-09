import { useState } from "react";
import { Menu, X, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Dining", href: "#dining" },
    { name: "Events", href: "#events" },
    { name: "Turfs", href: "#turfs" },
    { name: "About", href: "#about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 lg:gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Ticket className="w-5 h-5 lg:w-6 lg:h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              TicPin
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="#login"
              className="text-white/80 hover:text-white transition-colors duration-200 font-medium text-sm"
            >
              Login
            </a>
            <Button className="bg-primary hover:bg-primary/90 transition-all duration-200 rounded-full px-5 h-10 text-sm gap-2">
              <Ticket className="w-4 h-4" />
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-white hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        {isOpen && (
          <div className="lg:hidden fixed inset-0 top-16 bg-background/98 backdrop-blur-lg z-40 animate-fade-up">
            <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-white text-2xl font-semibold hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#login"
                className="text-white text-2xl font-semibold hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Login
              </a>
              <Button
                className="bg-primary hover:bg-primary/90 transition-all duration-200 rounded-full px-8 h-12 text-base gap-2 mt-4"
                onClick={() => setIsOpen(false)}
              >
                <Ticket className="w-5 h-5" />
                Book Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
