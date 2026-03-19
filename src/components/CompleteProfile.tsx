import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Phone, MapPin, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export default function CompleteProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate('/seller/login');
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [navigate]);

  const [formData, setFormData] = useState({
    mobile: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      if (!/^\d{10}$/.test(formData.mobile)) {
        throw new Error('Please enter a valid 10-digit mobile number.');
      }
      if (!formData.address) {
        throw new Error('Address is required.');
      }

      // Store additional info in Firestore
      await setDoc(doc(db, 'sellers', user.uid), {
        uid: user.uid,
        email: user.email,
        mobile: formData.mobile,
        address: formData.address,
        displayName: user.displayName,
        role: 'seller',
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/seller/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving your profile.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-bounce" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Completed!</h1>
          <p className="text-gray-500">Welcome to the family. Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-500">We just need a few more details to set up your seller account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({...formData, mobile: val});
              }}
              className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none"
              required
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <textarea
              placeholder="Business Address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none min-h-[120px]"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Save & Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
