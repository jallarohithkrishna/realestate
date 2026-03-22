import React from 'react';
import { Shield, Globe, Sparkles } from 'lucide-react';

export default function LuxuryExperience() {
  return (
    <section className="py-16 md:py-24 bg-slate-900/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gradient-to-r from-amber-400/60 to-transparent"></div>
            <span className="text-amber-400 font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">The Luxe Advantage</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-8">
            Elevating Every Aspect of <span className="text-gradient-gold">Luxury</span> Real Estate
          </h2>
          <p className="text-gray-400 text-base md:text-lg mb-10 md:mb-12 leading-relaxed">
            Our specialized approach combines global reach with hyper-local expertise to deliver results that exceed the expectations of the world's most discerning clientele.
          </p>

          <div className="space-y-6 md:space-y-8">
            <div className="flex gap-4 md:gap-6 group">
              <div className="w-12 h-12 md:w-14 md:h-14 glass-card rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:border-amber-400/30 transition-all">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-2">Unrivaled Exclusivity</h4>
                <p className="text-sm md:text-base text-gray-500">Access to off-market listings and private estate collections before they reach the public market.</p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-6 group">
              <div className="w-12 h-12 md:w-14 md:h-14 glass-card rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:border-amber-400/30 transition-all">
                <Globe className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-2">Global Connectivity</h4>
                <p className="text-sm md:text-base text-gray-500">A vast network of international partners connecting high-net-worth buyers from Mumbai to Dubai.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mt-12 md:mt-16 glass-card p-7 md:p-8 rounded-[2rem]">
            <div>
              <div className="text-2xl md:text-4xl font-bold text-gradient-gold mb-1">₹1,00,000 Cr+</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Market Volume</div>
            </div>
            <div className="pt-6 sm:pt-0 sm:pl-8 sm:border-l border-white/[0.06]">
              <div className="text-2xl md:text-4xl font-bold text-gradient-gold mb-1">150+</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Global Markets</div>
            </div>
          </div>
        </div>

        <div className="relative order-first lg:order-last">
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/3] sm:aspect-video lg:aspect-auto border border-white/[0.06]">
            <img
              src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80"
              alt="Luxury Interior"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Decorative glow */}
          <div className="hidden sm:block absolute -bottom-6 -left-6 w-32 h-32 md:-bottom-8 md:-left-8 md:w-48 md:h-48 bg-amber-400/10 rounded-3xl -z-10 blur-xl"></div>
        </div>
      </div>
    </section>
  );
}
