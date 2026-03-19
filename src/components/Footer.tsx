import React from 'react';
import { LayoutGrid, Instagram, Twitter, Linkedin, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-16">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutGrid className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">LuxeRealEstate</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
              The world's premier destination for luxury residential real estate, connecting elite properties with global buyers.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-[10px] tracking-widest">Navigation</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Buy Properties</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Find an Agent</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Luxury Markets</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-[10px] tracking-widest">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Our Team</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-[10px] tracking-widest">Stay Informed</h4>
            <p className="text-gray-500 text-sm mb-4">Subscribe to receive exclusive market updates and new listings.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-xs">© 2026 LuxeRealEstate. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <a href="#" className="text-gray-400 hover:text-gray-600 text-[10px] uppercase font-bold tracking-widest transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 text-[10px] uppercase font-bold tracking-widest transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 text-[10px] uppercase font-bold tracking-widest transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
