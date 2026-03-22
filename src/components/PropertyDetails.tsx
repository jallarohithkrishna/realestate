import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { db, auth } from '../firebase';
import { ArrowLeft, MapPin, IndianRupee, Info, Navigation, ExternalLink, Layers, Plus, Minus, Bed, Square, User, Home, Check, Calendar, Mail, Phone, Shield, Zap, Car, Tv, Waves, Dumbbell, Sparkles, Heart, Users, AlignLeft, Lock } from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }

  // Create a more human-readable error message for common Firebase errors
  let userMessage = errorMessage;
  if (errorMessage.includes('auth/unauthorized-domain')) {
    userMessage = "Domain not authorized. Please add 'localhost' to your authorized domains in the Firebase Console (Authentication -> Settings -> Authorized domains).";
  } else if (errorMessage.includes('permission-denied')) {
    userMessage = "Permission denied. Please check your Firestore rules or ensure you are logged in correctly.";
  }

  console.error(`Firestore ${operationType} Error on ${path}:`, userMessage, errInfo);
  throw new Error(userMessage);
}

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  imageUrl: string;
  images?: string[];
  description: string;
  bhk?: string;
  area?: string;
  builderName?: string;
  propertyType?: string;
  amenities?: string[];
  lat?: number;
  lng?: number;
  sellerUid?: string;
}

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const [activeImage, setActiveImage] = useState(0);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    async function fetchProperty() {
      if (!id) return;
        try {
          const docRef = doc(db, 'properties', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            let price = data.price || '';

            // Migration: Display rupee symbol instead of dollar if present
            if (typeof price === 'string' && price.startsWith('$')) {
              price = price.replace('$', '₹');
            }

            const fetchedProperty = { 
              id: docSnap.id, 
              ...data, 
              price,
              lat: data.lat ? parseFloat(String(data.lat)) : undefined,
              lng: data.lng ? parseFloat(String(data.lng)) : undefined
            } as Property;
            setProperty(fetchedProperty);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `properties/${id}`);
        } finally {
          setLoading(false);
        }
    }
    fetchProperty();

    return () => unsubscribe();
  }, [id]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      alert("Login failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center mb-6">
          <Info className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Property Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-xs">The listing you're looking for might have been removed or is no longer available.</p>
        <button 
          onClick={() => navigate('/viewer')}
          className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-8 py-3 rounded-xl font-bold hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg glow-amber flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    );
  }

  const allImages = [property.imageUrl, ...(property.images || [])];

  const getAmenityIcon = (name: string) => {
    const amenitiesMap: Record<string, any> = {
      "Swimming Pool": Waves,
      "Private Gym": Dumbbell,
      "Home Theater": Tv,
      "Smart Home": Zap,
      "24/7 Security": Shield,
      "Power Backup": Zap,
      "EV Charging": Zap,
      "Club House": Users,
      "Parking": Car,
      "Zen Garden": Sparkles,
      "Private Lift": Navigation,
      "Servant Quarters": User
    };
    const Icon = amenitiesMap[name] || Check;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/viewer')}
            className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-all font-bold group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Listings</span>
          </button>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Listing ID: {property.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Media */}
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-slate-900 group border border-white/[0.06]">
              <img 
                src={allImages[activeImage]} 
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  {property.propertyType || 'Luxe Listing'}
                </span>
              </div>
              <div className="absolute bottom-6 right-6">
                <div className="bg-slate-950/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/10">
                  {activeImage + 1} / {allImages.length}
                </div>
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-amber-400 ring-4 ring-amber-400/10' : 'border-white/[0.06] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info & Contact */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold text-white leading-tight">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-400 font-bold">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center gap-4 text-3xl font-black text-gradient-gold">
                <IndianRupee className="w-8 h-8 text-amber-400" />
                <span>{property.price}</span>
              </div>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-3 gap-4 border-y border-white/[0.06] py-6">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Configuration</p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold">
                  <Bed className="w-4 h-4 text-amber-400" />
                  <span>{property.bhk || 'N/A'}</span>
                </div>
              </div>
              <div className="text-center md:text-left border-x border-white/[0.06]">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Carpet Area</p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold">
                  <Square className="w-4 h-4 text-amber-400" />
                  <span>{property.area || 'N/A'}</span>
                </div>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Developer</p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold truncate">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>{property.builderName || 'Exclusive'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-lg font-black text-white uppercase tracking-[0.2em]">Description</h3>
               <p className="text-gray-400 leading-relaxed font-medium whitespace-pre-line">
                 {property.description}
               </p>
            </div>

            {/* Appointment Section - Only visible if user is not the owner */}
            {(!user || user.uid !== property.sellerUid) && (
              <div className="glass-card rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border-amber-400/10">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 opacity-10 blur-3xl -mr-16 -mt-16"></div>
                 <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                   <Calendar className="w-6 h-6 text-amber-400" />
                   Schedule a Private Visit
                 </h3>
                 
                 {user ? (
                   <form 
                     onSubmit={async (e) => {
                       e.preventDefault();
                       const form = e.currentTarget;
                       const formData = new FormData(form);
                       const viewerContact = formData.get('viewerContact') as string;

                       if (!/^\d{10}$/.test(viewerContact)) {
                         alert("Please enter a valid 10-digit mobile number.");
                         return;
                       }

                       const appointmentData = {
                         propertyId: property.id,
                         propertyName: property.title,
                         sellerUid: property.sellerUid,
                         viewerUid: user.uid,
                         viewerName: formData.get('viewerName') as string,
                         viewerContact: viewerContact,
                         date: formData.get('viewingDate') as string,
                         time: formData.get('viewingTime') as string,
                         status: 'pending',
                         createdAt: serverTimestamp()
                       };

                       try {
                         await addDoc(collection(db, 'appointments'), appointmentData);
                         alert("Appointment requested successfully! The seller will contact you to confirm.");
                         form.reset();
                       } catch (error: any) {
                         console.error("DEBUG - Appointment error:", error);
                         alert(`Error: ${error.message || 'Permission denied'}. Please check your connection and try again.`);
                       }
                     }}
                     className="space-y-4 mt-8"
                   >
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input 
                         required
                         name="viewerName"
                         type="text" 
                         defaultValue={user.displayName || ''}
                         placeholder="Your Name" 
                         className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400/30 transition-all font-bold"
                       />
                       <input 
                         required
                         name="viewerContact"
                         type="tel" 
                         pattern="[0-9]{10}"
                         maxLength={10}
                         onInput={(e) => {
                           const target = e.target as HTMLInputElement;
                           target.value = target.value.replace(/[^0-9]/g, '');
                         }}
                         placeholder="10-Digit Mobile Number" 
                         className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400/30 transition-all font-bold"
                       />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                         <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Preferred Date</label>
                         <input 
                           required
                           name="viewingDate"
                           type="date" 
                           className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400/30 transition-all font-bold"
                         />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Preferred Time</label>
                         <input 
                           required
                           name="viewingTime"
                           type="time" 
                           className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400/30 transition-all font-bold"
                         />
                       </div>
                     </div>
                     <button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all active:scale-95">
                       Request Private Viewing
                     </button>
                   </form>
                 ) : (
                   <div className="mt-8 text-center space-y-6">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 backdrop-blur-sm">
                         <Lock className="w-8 h-8 text-blue-400 opacity-50" />
                      </div>
                      <p className="text-gray-400 font-bold text-sm max-w-xs mx-auto">
                        Access Restricted. Please sign in to request a private viewing of this estate.
                      </p>
                      <button 
                        onClick={handleLogin}
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                      >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 rounded-sm" />
                        Sign in with Google
                      </button>
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* Estate Features Section */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mt-16 border-t border-white/[0.06] pt-16">
            <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
              <Sparkles className="w-7 h-7 text-amber-400" />
              Property Amenities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-4 p-5 rounded-2xl glass-card glass-card-hover transition-all">
                  <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-400">
                    {getAmenityIcon(amenity)}
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Section */}
        <div className="mt-16 border-t border-white/[0.06] pt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-4">
              <MapPin className="w-7 h-7 text-amber-400" />
              Location Details
            </h2>
            <button
               onClick={() => setMapStyle(mapStyle === 'street' ? 'satellite' : 'street')}
               className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-4 py-2 rounded-full hover:bg-amber-400/20 transition-colors"
            >
               {mapStyle === 'street' ? 'Satellite View' : 'Street View'}
            </button>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg border border-white/[0.06] border-b-0 h-[480px] bg-slate-900">
            <iframe
              title="Property Location"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(0.1) contrast(1.1)' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${property.lat && property.lng ? `${property.lat},${property.lng}` : encodeURIComponent(property.location)}&t=${mapStyle === 'street' ? '' : 'k'}&z=16&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full"
            ></iframe>
          </div>
          <div className="glass-card p-6 rounded-b-3xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             Physically Verified Property Location
          </div>
        </div>
      </div>
    </div>
  );
}
