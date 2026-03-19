import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        {/* Viewer Portal Option */}
        <div 
          onClick={() => navigate('/viewer')}
          className="group cursor-pointer bg-white p-8 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <User className="w-8 h-8 text-blue-600 group-hover:text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Enter as Viewer</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Browse premium luxury properties, explore neighborhoods, and find your dream home.
          </p>
          <div className="flex items-center text-blue-600 font-bold text-lg">
            Explore Properties <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </div>

        {/* Buyer/Seller Portal Option */}
        <div 
          onClick={() => navigate('/seller/login')}
          className="group cursor-pointer bg-white p-8 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-blue-600"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <Building2 className="w-8 h-8 text-blue-600 group-hover:text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Buyer/Seller Portal</h2>
          <p className="text-gray-600 mb-8 text-lg">
            List your luxury properties, manage your portfolio, and handle viewer appointments.
          </p>
          <div className="flex items-center text-blue-600 font-bold text-lg">
            Access Portal <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-2 text-gray-400">
        <ShieldCheck className="w-5 h-5" />
        <span className="text-sm">Secure and Verified Luxury Real Estate Platform</span>
      </div>
    </div>
  );
}
