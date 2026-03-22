import React from 'react';
import { Search } from 'lucide-react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function Hero({ searchTerm, setSearchTerm }: HeroProps) {
  return (
    <section className="relative min-h-[500px] md:h-[650px] flex items-center justify-center overflow-hidden py-12 md:py-0">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80"
          alt="Luxury Pool"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Rich dark gradient overlay with warmth */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 via-transparent to-amber-900/10"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-1/4 w-2 h-2 bg-amber-400/40 rounded-full animate-float"></div>
      <div className="absolute top-40 right-1/3 w-1.5 h-1.5 bg-amber-300/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-amber-400/50 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl px-4 md:px-6">
        <div className="text-center mb-6 md:mb-10 lg:mb-12">
          {/* Shimmer accent line */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/60"></div>
            <span className="text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Premium Luxury Living</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400/60"></div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-4 drop-shadow-2xl leading-[1.1]">
            Find Your <span className="text-gradient-gold">Dream</span> Home
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 font-medium drop-shadow-lg max-w-2xl mx-auto px-4">
            Experience the pinnacle of luxury living in India's most exclusive locations
          </p>
        </div>
 
        <div className="glass-card p-1.5 md:p-2.5 rounded-2xl flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 transition-colors group-focus-within:text-amber-300" />
            <input
              type="text"
              placeholder="Search by title, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 md:py-5 bg-transparent rounded-xl focus:outline-none transition-all text-white font-medium placeholder:text-gray-500 text-sm md:text-base"
            />
          </div>
 
          <button 
            onClick={() => document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full md:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-8 md:px-10 py-3.5 md:py-4.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg glow-amber active:scale-95 text-sm md:text-base"
          >
            <Search className="w-5 h-5" />
            <span>Find Homes</span>
          </button>
        </div>
      </div>
    </section>
  );
}
