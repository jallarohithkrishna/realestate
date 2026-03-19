import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto bg-blue-600 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-20 text-center text-white relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl md:blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl md:blur-3xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl md:text-6xl font-bold mb-6 leading-tight">Ready to find your dream home?</h2>
          <p className="text-blue-100 text-base md:text-xl mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the world's most exclusive marketplace for high-end residential estates and connect with qualified agents globally.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/add-property')}
              className="w-full sm:w-auto bg-gray-900 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-bold hover:bg-black transition-all shadow-xl text-sm md:text-base active:scale-95"
            >
              List Your Property
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
