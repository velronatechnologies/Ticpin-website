import { Construction, HardHat, Mail, Wrench } from "lucide-react";

const UnderConstruction = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ticpin Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/ticpin-logo-black.png" 
            alt="Ticpin Logo" 
            className="h-9 md:h-15 w-auto"
          />
        </div>

        {/* Animated Icons */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <Construction className="w-16 h-16 text-[#5331ea] animate-bounce" style={{ color: '#5331ea' }} />
          <HardHat className="w-20 h-20 text-[#5331ea] animate-pulse" style={{ color: '#5331ea' }} />
          <Wrench className="w-16 h-16 text-[#5331ea] animate-bounce delay-100" style={{ color: '#5331ea' }} />
        </div>

        {/* Main Heading */}
        <h3 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4 tracking-tight">
          WEBSITE
        </h3>
        
        {/* Under Construction Badge */}
        <div className="inline-block mb-8">
          <div className="bg-[#5331ea] text-white px-6 py-2 rounded-full font-bold text-lg md:text-xl" style={{ backgroundColor: '#5331ea' }}>
            UNDER <span className="text-purple-200">CONSTRUCTION</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-lg md:text-xl mb-4 max-w-lg mx-auto">
          We're working hard to bring you an amazing new experience. 
          Our website is currently being redesigned and will be back soon!
        </p>

        {/* Developer Message */}
        <p className="text-[#5331ea] font-semibold text-base md:text-lg mb-8" style={{ color: '#5331ea' }}>
          — Message from Ticpin Developers
        </p>

        {/* Progress Indicator */}
        <div className="max-w-md mx-auto mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#5331ea] w-3/4 animate-pulse" style={{ backgroundColor: '#5331ea' }}></div>
          </div>
          <p className="text-gray-500 text-sm mt-2">Progress: Building something awesome...</p>
        </div>

        {/* Contact Button */}
        <a
          href="mailto:contact@ticpin.com"
          className="inline-flex items-center gap-2 bg-[#5331ea] hover:bg-[#4225d0] text-white font-bold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
          style={{ backgroundColor: '#5331ea' }}
        >
          <Mail className="w-5 h-5" />
          CONTACT TICPIN TEAM
        </a>

        {/* Additional Info */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Ticpin. All rights reserved.</p>
          <p className="mt-2">Expected launch: Coming Soon</p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-[#5331ea] rotate-12" style={{ borderColor: '#5331ea' }}></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 border-4 border-[#5331ea] -rotate-12" style={{ borderColor: '#5331ea' }}></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border-4 border-[#5331ea] rotate-45" style={{ borderColor: '#5331ea' }}></div>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
