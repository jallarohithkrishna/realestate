import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Plus, User, LogOut } from 'lucide-react';
import { auth } from './firebase';
import Hero from './components/Hero';
import FeaturedListings from './components/FeaturedListings';
import LuxuryExperience from './components/LuxuryExperience';
import Testimonial from './components/Testimonial';
import CTA from './components/CTA';

import PropertyDetails from './components/PropertyDetails';

function BuyerHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="relative bg-slate-950">
      {/* Top Right Header */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[100] flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => navigate('/selection')}
          className="glass-card px-4 py-2 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all font-sans"
        >
          Change Portal
        </button>

        {user && (
          <div className="hidden md:flex flex-col items-end glass-card px-4 py-2 rounded-xl font-sans">
            <span className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest leading-none mb-1">Welcome back</span>
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-amber-400" />
              <span className="text-sm font-bold text-white">{user.displayName || 'Luxury Partner'}</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => navigate('/add-property')}
          className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold hover:from-amber-300 hover:to-amber-400 transition-all shadow-xl glow-amber flex items-center gap-2 text-sm md:text-base font-sans active:scale-95"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden xs:inline">Add Property</span>
          <span className="xs:hidden">Add</span>
        </button>

        {user && (
          <button 
            onClick={() => auth.signOut()}
            className="md:hidden glass-card p-2 rounded-xl text-red-400"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <FeaturedListings searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <CTA />
      <Testimonial />
      <LuxuryExperience />
    </main>
  );
}

export default function BuyerInterface() {
  return (
    <Routes>
      {/* Handled when prefix matches in parent */}
      <Route path="/" element={<BuyerHome />} />
      <Route path="/property/:id" element={<PropertyDetails />} />
      <Route path="/viewer" element={<BuyerHome />} />
      
      {/* Relatives for sub-routing from parent match */}
      <Route path=":id" element={<PropertyDetails />} />
      
      {/* Catch-all for other paths */}
      <Route path="*" element={<BuyerHome />} />
    </Routes>
  );
}
