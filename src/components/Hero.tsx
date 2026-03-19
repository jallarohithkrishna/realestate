import React from 'react';
import { Search } from 'lucide-react';

interface HeroProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function Hero({ searchTerm, setSearchTerm }: HeroProps) {
  return (
    <section className="relative min-h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden py-12 md:py-0">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80"
          alt="Luxury Pool"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/30 md:bg-black/20"></div>
      </div>

      {/* Search Bar Container */}
      <div className="relative z-10 w-full max-w-3xl px-4 md:px-6">
        <div className="text-center mb-6 md:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-4 drop-shadow-2xl leading-[1.1]">
            Find Your <span className="text-blue-400">Dream</span> Home
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/95 font-medium drop-shadow-lg max-w-2xl mx-auto px-4">
            Experience the pinnacle of luxury living in India's most exclusive locations
          </p>
        </div>
 
        <div className="bg-white/95 backdrop-blur-md p-1.5 md:p-2.5 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-white/20">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 transition-colors group-focus-within:text-blue-700" />
            <input
              type="text"
              placeholder="Search by title, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 md:py-5 bg-transparent rounded-xl focus:outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400 text-sm md:text-base"
            />
          </div>
 
          <button 
            onClick={() => document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 md:px-10 py-3.5 md:py-4.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-sm md:text-base"
          >
            <Search className="w-5 h-5" />
            <span>Find Homes</span>
          </button>
        </div>
      </div>
    </section>
  );
}
