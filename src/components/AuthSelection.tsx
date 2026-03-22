import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthSelection() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  useEffect(() => {
    // After logo animation plays, start fade out
    const fadeTimer = setTimeout(() => setSplashFading(true), 1800);
    // Then remove splash entirely
    const removeTimer = setTimeout(() => setShowSplash(false), 2400);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* === INTRO SPLASH === */}
      {showSplash && (
        <div className={`fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center transition-opacity duration-600 ${splashFading ? 'opacity-0' : 'opacity-100'}`}>
          {/* Radial glow behind logo */}
          <div className="absolute w-[500px] h-[500px] bg-amber-400/[0.06] rounded-full blur-[150px] animate-pulse"></div>

          <div className="relative flex flex-col items-center">
            {/* Logo icon — scales in and rotates */}
            <div 
              className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6"
              style={{
                animation: 'splash-logo 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              <Sparkles className="w-10 h-10 text-slate-950" />
            </div>

            {/* Brand name — fades up after logo */}
            <h1 
              className="text-3xl md:text-4xl font-black tracking-tight text-white opacity-0"
              style={{
                animation: 'splash-text 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards',
              }}
            >
              LuxeRealEstate
            </h1>

            {/* Tagline — fades up after name */}
            <p 
              className="text-gray-500 text-sm font-medium mt-2 opacity-0"
              style={{
                animation: 'splash-text 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards',
              }}
            >
              Premium Luxury Living
            </p>

            {/* Shimmer line under tagline */}
            <div className="mt-6 h-0.5 w-0 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full"
              style={{
                animation: 'splash-line 1s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards',
              }}
            ></div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-400/[0.04] rounded-full blur-[120px] animate-glow-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"></div>
      </div>

      {/* Logo */}
      <div className={`relative z-10 mb-12 flex flex-col items-center transition-all duration-700 ${!showSplash ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg glow-amber">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">LuxeRealEstate</span>
        </div>
        <p className="text-sm text-gray-500 font-medium">Premium Luxury Living</p>
      </div>

      <div className={`max-w-4xl w-full grid md:grid-cols-2 gap-6 relative z-10 transition-all duration-700 ${!showSplash ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
        {/* Viewer Portal */}
        <div 
          onClick={() => navigate('/viewer')}
          className="group cursor-pointer glass-card rounded-3xl p-8 glass-card-hover transition-all duration-500 hover:scale-[1.02]"
        >
          <div className="w-16 h-16 bg-amber-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-400/20 transition-all duration-500 group-hover:glow-amber">
            <User className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Enter as Viewer/Buyer</h2>
          <p className="text-gray-400 mb-8 text-lg leading-relaxed">
            Browse premium luxury properties, explore neighborhoods, and find your dream home.
          </p>
          <div className="flex items-center text-amber-400 font-bold text-lg group-hover:gap-3 transition-all">
            Explore Properties <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Seller Portal */}
        <div 
          onClick={() => navigate('/seller/login')}
          className="group cursor-pointer glass-card rounded-3xl p-8 glass-card-hover transition-all duration-500 hover:scale-[1.02] border-l-2 border-l-amber-400/40"
        >
          <div className="w-16 h-16 bg-amber-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-400/20 transition-all duration-500 group-hover:glow-amber">
            <Building2 className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Seller Portal</h2>
          <p className="text-gray-400 mb-8 text-lg leading-relaxed">
            List your luxury properties, manage your portfolio, and handle viewer appointments.
          </p>
          <div className="flex items-center text-amber-400 font-bold text-lg group-hover:gap-3 transition-all">
            Access Portal <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <div className={`mt-12 flex items-center gap-2 text-gray-600 relative z-10 transition-all duration-700 ${!showSplash ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
        <ShieldCheck className="w-5 h-5 text-amber-400/50" />
        <span className="text-sm">Secure and Verified Luxury Real Estate Platform</span>
      </div>

      {/* Inline splash keyframes */}
      <style>{`
        @keyframes splash-logo {
          0% { opacity: 0; transform: scale(0.3) rotate(-20deg); }
          60% { opacity: 1; transform: scale(1.1) rotate(5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes splash-text {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-line {
          from { width: 0; }
          to { width: 120px; }
        }
      `}</style>
    </div>
  );
}
