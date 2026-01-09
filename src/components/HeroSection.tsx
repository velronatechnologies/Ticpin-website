import { Button } from "@/components/ui/button";
import { Ticket, Search } from "lucide-react";

interface HeroSectionProps {
  heroImage: string;
}

const HeroSection = ({ heroImage }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-pattern-overlay">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-glow-hero pointer-events-none" />

      {/* Diagonal accent decoration */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-6 lg:space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] animate-fade-up">
              Book dining, events
              <br />
              & turfs with <span className="text-primary">ease</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground max-w-lg animate-fade-up"
              style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
              Reserve tables at top restaurants, book tickets for exciting events, and secure turf slots for your games—all in one place with instant confirmation.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 animate-fade-up"
              style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 transition-all duration-300 rounded-full px-6 lg:px-8 h-12 lg:h-14 text-sm lg:text-base gap-2 shadow-lg w-full sm:w-auto"
              >
                <Ticket className="w-4 h-4 lg:w-5 lg:h-5" />
                Start Booking
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-secondary rounded-full px-6 lg:px-8 h-12 lg:h-14 text-sm lg:text-base gap-2 w-full sm:w-auto"
              >
                <Search className="w-4 h-4 lg:w-5 lg:h-5" />
                Explore Now
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="relative">
              <img
                src={heroImage}
                alt="Dining, events, and sports experiences"
                className="w-full h-auto object-contain max-h-[600px] lg:max-h-[700px] drop-shadow-2xl"
              />
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
