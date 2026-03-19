import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Home } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-blue-600/20">
            <Home className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <span className="text-lg md:text-xl font-black tracking-tight text-gray-900 truncate max-w-[150px] xs:max-w-none">LuxeRealEstate</span>
        </Link>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/add-property')}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-black/10 text-xs md:text-sm"
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
