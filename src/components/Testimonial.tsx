import React from 'react';
import { Quote, Sparkles } from 'lucide-react';

export default function Testimonial() {
  return (
    <section className="py-20 md:py-24 px-4 relative overflow-hidden">
      {/* Background Villa Image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80"
          alt="Luxury Villa Background"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 shadow-2xl">
          {/* App Logo at Top */}
          <div className="flex flex-col items-center mb-10 md:mb-12">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg glow-amber">
                <Sparkles className="text-slate-950 w-6 h-6 md:w-7 md:h-7" />
              </div>
              <span className="text-xl md:text-3xl font-bold tracking-tight text-white">LuxeRealEstate</span>
            </div>
            <div className="h-1 w-10 md:w-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"></div>
          </div>

          <div className="flex justify-center mb-6 md:mb-8">
            <Quote className="w-10 h-10 md:w-16 md:h-16 text-amber-400/20 fill-amber-400/10" />
          </div>

          <blockquote className="text-xl md:text-4xl lg:text-5xl font-serif italic text-white leading-tight mb-10 md:mb-12 text-center px-2">
            "The level of service and attention to detail provided by LuxeRealEstate was beyond anything we've experienced in our property portfolio expansion. They didn't just find us a house; they found us a lifestyle."
          </blockquote>
          
          <div className="flex flex-col items-center">
            <h4 className="text-lg md:text-2xl font-bold text-white mb-1">Jonathan Sterling</h4>
            <p className="text-amber-400 text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] font-extrabold">Sterling Holdings</p>
          </div>
        </div>
      </div>
    </section>
  );
}
