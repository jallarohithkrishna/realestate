import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg glow-amber">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-slate-950" />
          </div>
          <span className="text-lg md:text-xl font-black tracking-tight text-white truncate max-w-[150px] xs:max-w-none">LuxeRealEstate</span>
        </Link>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/add-property')}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-bold hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg glow-amber text-xs md:text-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">List Property</span>
            <span className="xs:hidden">List</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
