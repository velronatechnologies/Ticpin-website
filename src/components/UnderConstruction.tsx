import { Construction, HardHat, Mail, Wrench } from "lucide-react";

const UnderConstruction = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ticpin Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/ticpin-logo-text.png" 
            alt="Ticpin Logo" 
            className="h-20 md:h-15 w-auto"
          />
        </div>

        {/* Animated Icons */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <Construction className="w-16 h-16 text-yellow-500 animate-bounce" />
          <HardHat className="w-20 h-20 text-yellow-400 animate-pulse" />
          <Wrench className="w-16 h-16 text-yellow-500 animate-bounce delay-100" />
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          WEB SITE
        </h1>
        
        {/* Under Construction Badge */}
        <div className="inline-block mb-8">
          <div className="bg-yellow-500 text-slate-900 px-6 py-2 rounded-full font-bold text-lg md:text-xl">
            UNDER <span className="text-orange-600">CONSTRUCTION</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-lg md:text-xl mb-4 max-w-lg mx-auto">
          We're working hard to bring you an amazing new experience. 
          Our website is currently being redesigned and will be back soon!
        </p>

        {/* Developer Message */}
        <p className="text-yellow-500 font-semibold text-base md:text-lg mb-8">
          — Message from Ticpin Developers
        </p>

        {/* Progress Indicator */}
        <div className="max-w-md mx-auto mb-8">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 w-3/4 animate-pulse"></div>
          </div>
          <p className="text-slate-500 text-sm mt-2">Progress: Building something awesome...</p>
        </div>

        {/* Contact Button */}
        <a
          href="mailto:contact@ticpin.com"
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
        >
          <Mail className="w-5 h-5" />
          CONTACT TICPIN TEAM
        </a>

        {/* Additional Info */}
        <div className="mt-12 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Ticpin. All rights reserved.</p>
          <p className="mt-2">Expected launch: Coming Soon</p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-yellow-500 rotate-12"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 border-4 border-orange-500 -rotate-12"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border-4 border-yellow-400 rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
