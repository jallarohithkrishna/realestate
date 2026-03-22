import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Mail, Lock, Phone, MapPin, Loader2, ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';

export default function SellerLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobile: '',
    address: '',
    displayName: ''
  });

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up instead.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset it.';
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Login cancelled. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if seller profile exists
      const docRef = doc(db, 'sellers', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // New user or missing profile, redirect to complete profile
        navigate('/seller/complete-profile');
      } else {
        navigate('/seller/dashboard');
      }
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        navigate('/seller/dashboard');
      } else {
        // Signup
        if (!/^\d{10}$/.test(formData.mobile)) {
          throw new Error('Please enter a valid 10-digit mobile number.');
        }
        if (!formData.address) {
          throw new Error('Address is required.');
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        const user = userCredential.user;

        // Update Auth Profile
        await updateProfile(user, {
          displayName: formData.displayName
        });

        // Store additional info in Firestore
        await setDoc(doc(db, 'sellers', user.uid), {
          uid: user.uid,
          email: formData.email,
          mobile: formData.mobile,
          address: formData.address,
          displayName: formData.displayName,
          role: 'seller',
          createdAt: new Date().toISOString()
        });

        navigate('/seller/dashboard');
      }
    } catch (err: any) {
      setError(getErrorMessage(err.code) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-12 pr-5 py-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-amber-400/40 focus:bg-white/[0.06] transition-all outline-none text-white placeholder:text-gray-500 font-medium";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-amber-400/[0.04] rounded-full blur-[120px] animate-glow-pulse"></div>
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-amber-500/[0.03] rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="w-full max-w-md absolute top-0 left-1/2 -translate-x-1/2 p-4 md:p-8 z-10">
        <button 
          onClick={() => navigate('/selection')}
          className="flex items-center gap-2 text-gray-500 hover:text-amber-400 transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="max-w-md w-full mt-16 md:mt-0 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl glow-amber relative group">
              <Sparkles className="w-6 h-6 text-slate-950 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-x-0 -bottom-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-400/60">Partner Portal</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter">
            {isLogin ? 'Seller Login' : 'Partner Access'}
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-wide">
            {isLogin 
              ? 'Institutional-grade property management' 
              : 'Join as an exclusive real estate partner'}
          </p>
        </div>

        {isLogin && (
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full mb-6 py-4 glass-card rounded-2xl font-bold text-gray-300 hover:text-white hover:border-amber-400/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </>
            )}
          </button>
        )}

        {isLogin && (
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.04]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
              <span className="bg-slate-950 px-4 text-gray-700">Enterprise Protocol</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="w-full px-5 py-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-amber-400/40 focus:bg-white/[0.06] transition-all outline-none text-white placeholder:text-gray-500 font-medium"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={inputClass}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className={inputClass}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({...formData, mobile: val});
                  }}
                  className={inputClass}
                  required
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-5 w-5 h-5 text-gray-600" />
                <textarea
                  placeholder="Business Address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl focus:border-amber-400/40 focus:bg-white/[0.06] transition-all outline-none text-white placeholder:text-gray-500 font-medium min-h-[100px]"
                  required
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-sm border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:from-amber-300 hover:to-amber-400 transition-all shadow-xl glow-amber flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Authenticate' : 'Establish Account'}
                <ChevronRight className="w-4 h-4 opacity-70" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-amber-400 font-bold hover:underline"
          >
            {isLogin 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
