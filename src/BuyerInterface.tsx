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
    <main className="relative">
      {/* Top Right Header */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[100] flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => navigate('/selection')}
          className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all font-sans"
        >
          Change Portal
        </button>

        {user && (
          <div className="hidden md:flex flex-col items-end bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-100 shadow-sm font-sans">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Welcome back</span>
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-blue-600" />
              <span className="text-sm font-bold text-gray-900">{user.displayName || 'Luxury Partner'}</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => navigate('/add-property')}
          className="bg-blue-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl flex items-center gap-2 text-sm md:text-base font-sans"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden xs:inline">Add Property</span>
          <span className="xs:hidden">Add</span>
        </button>

        {user && (
          <button 
            onClick={() => auth.signOut()}
            className="md:hidden bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-gray-100 shadow-xl text-red-600"
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
