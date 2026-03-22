import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto relative">
        {/* Gradient border wrapper */}
        <div className="rounded-[2rem] md:rounded-[2.5rem] p-[1px] bg-gradient-to-r from-amber-400/30 via-amber-500/10 to-amber-400/30">
          <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-20 text-center relative overflow-hidden">
            {/* Decorative glows */}
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-amber-400/[0.06] rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-amber-500/[0.04] rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Ready to find your <span className="text-gradient-gold">dream home</span>?
              </h2>
              <p className="text-gray-400 text-base md:text-xl mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
                Join the world's most exclusive marketplace for high-end residential estates and connect with qualified agents globally.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => navigate('/add-property')}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-bold hover:from-amber-300 hover:to-amber-400 transition-all shadow-xl glow-amber text-sm md:text-base active:scale-95 flex items-center justify-center gap-2"
                >
                  List Your Property
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
