import { Button } from "@/components/ui/button";
import { Ticket, Search } from "lucide-react";
import RotatingText from "./RotatingText";
import { SparklesText } from "@/registry/magicui/sparkles-text";

interface HeroSectionProps {
  heroImage: string;
}

const HeroSection = ({ heroImage }: HeroSectionProps) => {
  return (
    <section className="relative flex items-center pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.15] animate-fade-up text-gray-900">
              <SparklesText 
                colors={{ first: "#5331ea", second: "#5331ea" }}
                sparklesCount={8}
              >
                Book Your
              </SparklesText>{" "}
              <RotatingText
                texts={['dining', 'events', 'turfs']}
                className="text-primary"
                rotationInterval={3000}
              />
              <br />
              {/* with <span className="text-primary">ease</span> */}
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-lg leading-relaxed animate-fade-up"
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
            <div className="relative rounded-2xl overflow-hidden">
              {/* Subtle purple overlay for extra theme blending */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/10 to-transparent mix-blend-multiply z-10" />

              <img
                src="/hero-community.jpg"
                alt="Community hub with dining, events, and sports turfs"
                className="w-full h-auto object-cover max-h-[600px] lg:max-h-[700px] drop-shadow-2xl"
                style={{ filter: 'saturate(1.15) brightness(0.98)' }}
              />

              {/* Glow behind image */}
              <div className="absolute inset-0 bg-primary/25 blur-[100px] -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
