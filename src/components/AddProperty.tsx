import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, setDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth, storage } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { ArrowLeft, Plus, Minus, Image as ImageIcon, MapPin, IndianRupee, Type, AlignLeft, LogOut, User, Navigation, Search, Maximize2, Minimize2, Layers, RotateCcw, Check, ChevronLeft, Bed, Square, Home } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon issue
import 'leaflet/dist/leaflet.css';
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const RedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map Sub-components moved outside for stability
// Module-level map reference — reliable even outside React render cycle
let mapInstance: L.Map | null = null;

function MapResizer({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
    map.invalidateSize();
    const timers = [10, 50, 100, 200, 500, 1000, 2000].map(ms => 
      setTimeout(() => map.invalidateSize(), ms)
    );
    return () => timers.forEach(t => clearTimeout(t));
  }, [map, isFullscreen]);
  return null;
}

function ViewControl({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  const prevCenter = React.useRef<string>('');

  useEffect(() => {
    const newKey = `${center[0].toFixed(4)},${center[1].toFixed(4)}`;
    // Only move if coords actually changed and are valid (not the India default center)
    if (center[0] && center[1] && newKey !== prevCenter.current) {
      prevCenter.current = newKey;
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
      setTimeout(() => map.invalidateSize(), 200);
    }
  }, [center, zoom, map]);
  return null;
}

// Captures the map instance into module-level variable for access outside MapContainer
function FlyController() {
  const map = useMap();
  useEffect(() => {
    mapInstance = map;
    return () => { mapInstance = null; };
  }, [map]);
  return null;
}

// Zoom buttons — rendered inside MapContainer but isolated from Leaflet events
function ZoomControls() {
  const map = useMap();
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Stop all mouse events from reaching Leaflet so it can't interfere
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  const zoom = (dir: 'in' | 'out') => {
    dir === 'in' ? map.zoomIn() : map.zoomOut();
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, display: 'flex', gap: 6, pointerEvents: 'all' }}
    >
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); zoom('in'); }}
        style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.97)', border: '1.5px solid #dbeafe', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#2563eb', boxShadow: '0 2px 10px rgba(37,99,235,0.15)' }}
      >+</button>
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); zoom('out'); }}
        style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.97)', border: '1.5px solid #dbeafe', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#2563eb', boxShadow: '0 2px 10px rgba(37,99,235,0.15)' }}
      >−</button>
    </div>
  );
}

interface LocationMarkerProps {
  lat: number | null;
  lng: number | null;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  setLocationPinned: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
}

function LocationMarker({ lat, lng, setFormData, setLocationPinned, setShowSuggestions }: LocationMarkerProps) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      console.log("Map marking active at:", e.latlng);
      const { lat: newLat, lng: newLng } = e.latlng;
      setFormData((prev: any) => ({ ...prev, lat: newLat, lng: newLng }));
      setLocationPinned(true);
      setShowSuggestions(false); // Close suggestions on map click
      
      map.panTo(e.latlng);
      
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setFormData((prev: any) => ({ ...prev, location: data.display_name }));
          }
        })
        .catch(err => console.error("Geocoding failed", err));
    },
    mousedown() {
      setShowSuggestions(false); // Close suggestions on any map interaction
    }
  });

  return lat !== null && lng !== null ? (
    <Marker 
      position={[lat, lng]} 
      icon={RedIcon}
      draggable={true}
      eventHandlers={{
        dragstart: () => setShowSuggestions(false),
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setFormData((prev: any) => ({ ...prev, lat: pos.lat, lng: pos.lng }));
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.display_name) {
                setFormData((prev: any) => ({ ...prev, location: data.display_name }));
              }
            });
        }
      }}
    />
  ) : null;
}

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

export default function AddProperty() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    imageUrl: '',
    description: '',
    bhk: '',
    area: '',
    builderName: '',
    propertyType: '',
    images: [] as string[],
    amenities: [] as string[],
    lat: null as number | null,
    lng: null as number | null
  });
  const [locationPinned, setLocationPinned] = useState(false);
  const [locating, setLocating] = useState(false);
  
  // File Upload State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const mapRef = React.useRef<L.Map | null>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAdditionalFiles(prev => [...prev, ...files]);
      const urls = files.map(file => URL.createObjectURL(file));
      setAdditionalPreviews(prev => [...prev, ...urls]);
    }
  };


  // Search function to be reused
  const performSearch = async (query: string) => {
    if (query.length < 3) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6`);
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  // Address Autocomplete (Search)
  useEffect(() => {
    if (formData.location.length < 3 || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(formData.location);
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.location]);


  // Location Detection — two-stage GPS: quick first fix, then refines accuracy
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    let bestAccuracy = Infinity;
    let watchId: number | null = null;
    let resolved = false;

    const applyLocation = (lat: number, lng: number, accuracy: number) => {
      if (resolved) return;
      resolved = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);

      const zoom = accuracy > 3000 ? 11 : accuracy > 500 ? 14 : accuracy > 100 ? 17 : 19;

      if (mapInstance) {
        mapInstance.flyTo([lat, lng], zoom, { animate: true, duration: 2 });
      }
      setFormData(prev => ({ ...prev, lat, lng }));

      setTimeout(() => {
        if (mapInstance) mapInstance.setView([lat, lng], zoom);
        const t = document.getElementById('map-status-text');
        const s = document.getElementById('map-status-sub');
        if (t) {
          t.textContent = accuracy > 1000
            ? 'APPROXIMATE AREA — search nearby street to zoom in closer'
            : 'AREA FOUND — click your exact house to pin it.';
          (t as HTMLElement).style.color = accuracy > 1000 ? '#f59e0b' : '#2563eb';
        }
        if (s) s.textContent = `GPS accuracy: ±${Math.round(accuracy)}m — click rooftop to pin.`;
      }, 500);

      setLocating(false);
    };

    // Use watchPosition to keep trying for better accuracy up to 20 seconds
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        console.log(`GPS fix: ±${Math.round(accuracy)}m`);

        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;
        }

        // Accept immediately if accuracy < 500m (good enough)
        if (accuracy < 500) {
          applyLocation(latitude, longitude, accuracy);
          return;
        }

        // Otherwise store best and wait for better fix (up to 20s)
        if (!resolved) {
          // Update map position as it improves (but don't resolve yet)
          if (mapInstance) {
            mapInstance.setView([latitude, longitude], accuracy > 3000 ? 11 : 13);
          }
        }
      },
      (err) => {
        if (!resolved) {
          setLocating(false);
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          if (err.code === 1) {
            alert('Location permission denied. Please allow location access in your browser settings, then try again.');
          } else {
            alert('Could not get GPS location. Please type your area name in the Search box and click Search.');
          }
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );

    // After 20 seconds, take whatever best fix we have or give up
    setTimeout(() => {
      if (!resolved) {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        navigator.geolocation.getCurrentPosition(
          (pos) => applyLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
          () => {
            setLocating(false);
            alert('GPS timed out. Please type your area name in the Search box and click Search.');
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
        );
      }
    }, 20000);
  };



  const handleSuggestionSelect = (s: any) => {
    const sLat = parseFloat(s.lat);
    const sLng = parseFloat(s.lon);
    
    setFormData(prev => ({ 
      ...prev, 
      location: s.display_name,
      lat: sLat,
      lng: sLng
    }));
    setLocationPinned(true);
    
    // Use module-level mapInstance for reliable flyTo
    if (mapInstance) {
      mapInstance.flyTo([sLat, sLng], 18, { animate: true, duration: 2 });
    }
    
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    // Listen for authentication state changes to update the UI instantly
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const [authError, setAuthError] = useState('');


  const handleGoogleLogin = async () => {
    // Redundant for Seller Portal, but keeping for compatibility if ever used as standalone
    const provider = new GoogleAuthProvider();
    setAuthError('');
    setLoggingIn(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit triggered. Auth user:", user?.uid);

    if (!user) {
      alert("Please log in to add a property.");
      return;
    }

    const errors: string[] = [];
    if (!formData.title) errors.push("Property Title is required.");
    if (!formData.price) errors.push("Price is required.");
    if (!formData.location) errors.push("Location is required.");
    if (!formData.propertyType) errors.push("Property Type is required.");
    if (!formData.description) errors.push("Description is required.");
    if (!coverFile) errors.push("Main Property Image is required.");
    if (formData.propertyType === 'Apartment' && !formData.bhk) errors.push("BHK Configuration is required for apartments.");
    if (!formData.area) errors.push("Carpet Area is required.");

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setUploadStatus('Compressing images...');
    
    // Aggressive Image Compression & Base64 Converter
    const compressImageToBase64 = async (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024; // Aggressive for Firestore limits
            const MAX_HEIGHT = 768;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Convert to lightweight JPEG string
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality to save space
            resolve(dataUrl);
          };
        };
      });
    };

    try {
      let finalLat = formData.lat;
      let finalLng = formData.lng;

      if (!locationPinned || !finalLat || !finalLng) {
        setUploadStatus('Verifying location...');
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          finalLat = parseFloat(data[0].lat);
          finalLng = parseFloat(data[0].lon);
        }
      }

      setUploadStatus('Processing photos...');
      setUploadProgress(20);

      // NO CLOUD STORAGE UPLOADS - STORAGE IS DIRECTLY IN FIREBASE DOCS (Solves CORS)
      let finalImageUrl = '';
      if (coverFile) {
        finalImageUrl = await compressImageToBase64(coverFile);
        setUploadProgress(50);
      }

      const galleryUrls: string[] = [];
      if (additionalFiles.length > 0) {
        for (let i = 0; i < additionalFiles.length; i++) {
          setUploadStatus(`Processing gallery photo ${i + 1}/${additionalFiles.length}...`);
          const b64 = await compressImageToBase64(additionalFiles[i]);
          galleryUrls.push(b64);
          setUploadProgress(50 + (40 * (i + 1) / additionalFiles.length));
        }
      }

      setUploadStatus('Saving listing data...');
      setUploadProgress(95);

      const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(Number(formData.price));

      const docData = {
        title: formData.title.trim(),
        price: formattedPrice,
        location: formData.location.trim(),
        imageUrl: finalImageUrl,
        description: formData.description.trim(),
        bhk: formData.bhk ? (formData.bhk.includes('BHK') ? formData.bhk : `${formData.bhk} BHK`) : '',
        area: formData.area.includes('sq ft') ? formData.area : `${formData.area} sq ft`,
        builderName: formData.builderName.trim(),
        propertyType: formData.propertyType,
        images: galleryUrls,
        amenities: formData.amenities,
        lat: finalLat,
        lng: finalLng,
        sellerUid: user.uid,
        createdAt: serverTimestamp(),
        status: 'active'
      };

      await addDoc(collection(db, 'properties'), docData);
      setUploadProgress(100);
      alert("Success! Your luxury property has been listed.");
      navigate('/seller/dashboard');
    } catch (error: any) {
      console.error("DEBUG - Submission Aborted:", error);
      alert(`Database Error: ${error.message}. TIP: Try uploading fewer photos if they are very large.`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/seller/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden xs:inline">Back to Dashboard</span>
          </button>
          <h1 className="font-extrabold text-gray-900 text-sm md:text-base uppercase tracking-widest">List Property</h1>
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Authenticated as</span>
                <span className="text-sm font-bold text-gray-900">{user.displayName || 'Luxury Broker'}</span>
              </div>
              <button 
                onClick={() => auth.signOut()}
                className="flex items-center gap-2 text-red-600 hover:text-white hover:bg-red-600 transition-all font-bold bg-red-50 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-xl border border-red-100 text-[10px] md:text-xs"
              >
                <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="w-10"></div> 
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-12">
        {!user ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl border border-gray-100 mb-8">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Luxury Access</h2>
              <p className="text-gray-500 mb-10 text-sm leading-relaxed">
                Unlock the ability to list your premier properties by authenticating with your Google account.
              </p>
              
              <button 
                disabled={loggingIn}
                onClick={handleGoogleLogin}
                className="w-full bg-blue-600 text-white px-6 py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 brightness-0 invert" alt="Google" />
                {loggingIn ? 'Connecting to Google...' : 'Sign in with Google'}
              </button>

              {authError && (
                <p className="text-red-500 text-xs mt-6 bg-red-50 p-4 rounded-xl border border-red-100">{authError}</p>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {formErrors.length > 0 && (
              <div id="form-errors" className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-top-4">
                <h3 className="text-red-800 font-bold text-lg mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">!</div>
                  Please fix the following errors before submitting:
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-red-600 font-medium">
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">Property Title</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="text"
                    placeholder="e.g. 5-Bedroom Sea-Facing Penthouse at Worli"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 ml-1 uppercase font-bold tracking-tight">Use a descriptive title that highlights the property's main luxury feature.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">Price (INR)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                    <input
                      type="number"
                      placeholder="e.g. 45000000"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                </div>

                {formData.propertyType === 'Apartment' && (
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">Configuration (BHK)</label>
                    <div className="relative">
                      <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                      <input
                        type="text"
                        placeholder="e.g. 4 BHK"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        value={formData.bhk}
                        onChange={(e) => setFormData({...formData, bhk: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">Carpet Area</label>
                  <div className="relative">
                    <Square className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                    <input
                      type="text"
                      placeholder="e.g. 3500 sq ft"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">Builder / Developer Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                    <input
                      type="text"
                      placeholder="e.g. Lodha Group"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      value={formData.builderName}
                      onChange={(e) => setFormData({...formData, builderName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">Property Type</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                    <select
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium appearance-none"
                      value={formData.propertyType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setFormData(prev => ({
                          ...prev, 
                          propertyType: newType,
                          bhk: newType === 'Apartment' ? prev.bhk : ''
                        }));
                      }}
                    >
                      <option value="" disabled>Select Type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Independent House">Independent House</option>
                      <option value="Plot">Plot</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronLeft className="w-4 h-4 text-gray-400 rotate-270" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 ml-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Exact Property Location
                  </label>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Interactive Picker</span>
                </div>

                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-3">
                  <span className="text-amber-500 text-sm shrink-0 mt-0.5">⚠️</span>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    <strong>For best accuracy:</strong> Type your city/area name in the search box and press <strong>Find Area</strong>. Then switch to <strong>Satellite</strong> view, zoom in, and click the exact rooftop. GPS alone may be off by 1–5&nbsp;km.
                  </p>
                </div>

                <div className="relative">
                  <div className="relative z-20">
                      <div className="relative flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                          <input
                            type="text"
                            placeholder="Search area or address..."
                            className="w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 bg-white border border-gray-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium shadow-sm text-sm md:text-base"
                            value={formData.location}
                            onChange={(e) => {
                              setFormData({...formData, location: e.target.value});
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                          />
                          {formData.location && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({...formData, location: ''});
                                setSuggestions([]);
                                setShowSuggestions(false);
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400"
                            >
                              <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.location.length < 3) {
                              detectCurrentLocation();
                            } else {
                              performSearch(formData.location);
                            }
                          }}
                          className="bg-blue-600 text-white px-6 py-3 md:py-0 md:px-8 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <Search className="w-4 h-4" />
                          {formData.location.length < 3 ? 'Locate Me' : 'Search Area'}
                        </button>
                      </div>
                  </div>

                  {/* Suggestions Popover */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-h-[350px] overflow-y-auto scrollbar-hide">
                      <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Best Matches</span>
                        <button onClick={() => setShowSuggestions(false)} className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter hover:underline">Close</button>
                      </div>
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSuggestionSelect(s)}
                          className="w-full text-left px-6 py-4 hover:bg-blue-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-0"
                        >
                          <MapPin className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                          <span className="text-sm text-gray-700 leading-tight font-medium">{s.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`${isMapFullscreen ? 'fixed inset-0 z-[100] bg-white p-2 sm:p-4 md:p-8 animate-in zoom-in-95 duration-300' : 'h-[300px] sm:h-[450px] md:h-[550px] w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl z-0 relative'}`}>
                  {isMapFullscreen && (
                    <div className="absolute top-8 left-8 right-8 z-[10001] flex flex-col items-end gap-3 pointer-events-none">
                      <button 
                        type="button" 
                        onClick={() => setIsMapFullscreen(false)}
                        className="bg-gray-900 text-white px-6 py-4 rounded-3xl shadow-2xl hover:scale-105 transition-all pointer-events-auto flex items-center gap-3 active:scale-95 border border-white/20"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Back to Form</span>
                      </button>

                      <div className="flex bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl border border-white pointer-events-auto">
                        <button
                          type="button"
                          onClick={() => setMapStyle('street')}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mapStyle === 'street' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapStyle('satellite')}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          Satellite
                        </button>
                      </div>
                    </div>
                  )}

                  <div className={isMapFullscreen ? 'fixed inset-0 z-[9999]' : 'h-full w-full relative z-[1] overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-white shadow-2xl bg-stone-100'}>
                    <MapContainer 
                      key={`map-inst-${isMapFullscreen}`}
                      center={[formData.lat || 20.5937, formData.lng || 78.9629]} 
                      zoom={formData.lat ? (isMapFullscreen ? 20 : 18) : 5}
                      scrollWheelZoom={false}
                      dragging={true}
                      doubleClickZoom={false}
                      style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
                      zoomControl={false}
                      maxZoom={22}
                      whenReady={() => {
                        window.dispatchEvent(new Event('resize'));
                      }}
                    >
                      <FlyController />
                      <ZoomControls />
                      <TileLayer
                        key={mapStyle}
                        url={mapStyle === 'street' 
                          ? "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                          : "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                        }
                        attribution="&copy; Google Maps"
                        maxZoom={22}
                      />
                      <LocationMarker 
                        lat={formData.lat} 
                        lng={formData.lng} 
                        setFormData={setFormData}
                        setLocationPinned={setLocationPinned}
                        setShowSuggestions={setShowSuggestions}
                      />
                      <MapResizer isFullscreen={isMapFullscreen} />
                      <ViewControl 
                         center={[formData.lat || 19.0760, formData.lng || 72.8777]} 
                         zoom={formData.lat ? 18 : (isMapFullscreen ? 18 : 13)} 
                      />
                    </MapContainer>
                  </div>
                  
                  {/* Map Controls — top-right so never hidden by status bar */}
                  <div className={`absolute ${isMapFullscreen ? 'top-12 right-12' : 'top-4 right-4'} z-[10001] flex flex-col gap-2`}>
                    {!isMapFullscreen && (
                      <button
                        type="button"
                        onClick={() => setMapStyle(mapStyle === 'street' ? 'satellite' : 'street')}
                        className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-white/50 hover:bg-white transition-all flex items-center gap-2"
                        title="Toggle Style"
                      >
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-black uppercase text-gray-600">
                          {mapStyle === 'street' ? 'Satellite' : 'Street'}
                        </span>
                      </button>
                    )}
                   </div>

                   {/* Locate Me button at bottom-left of map */}
                   <div className={`absolute ${isMapFullscreen ? 'bottom-36 left-4 md:left-12' : 'bottom-20 md:bottom-[7.5rem] left-4 md:left-6'} z-10`}>
                     <button
                       type="button"
                       onClick={detectCurrentLocation}
                       disabled={locating}
                       className="bg-white/90 backdrop-blur-md px-3 py-2.5 md:px-4 md:py-3 rounded-xl md:rounded-2xl shadow-xl border border-white/50 hover:bg-white transition-all flex items-center gap-2 md:gap-3 disabled:opacity-70"
                       title="Locate Me"
                     >
                       <Navigation className={`w-4 h-4 md:w-5 md:h-5 text-blue-600 ${locating ? 'animate-spin' : ''}`} />
                       <div className="text-left">
                         <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-800 leading-none">
                           {locating ? 'GPS...' : 'My Location'}
                         </p>
                       </div>
                     </button>
                   </div>

                  {/* Status & Bottom Controls Overlay */}
                  <div className={`absolute ${isMapFullscreen ? 'bottom-12 md:bottom-16 left-4 md:left-12 right-4 md:right-12' : 'bottom-4 md:bottom-12 left-3 md:left-6 right-3 md:right-6'} z-10 pointer-events-none`}>
                    <div className={`${locationPinned ? 'bg-green-600/95' : 'bg-white/95'} backdrop-blur-xl p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl flex items-center justify-between pointer-events-auto`}>
                      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                        <div className={`${locationPinned ? 'bg-white' : 'bg-blue-600'} p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg transition-colors shrink-0`}>
                          {locationPinned ? <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600" /> : <Navigation className="w-4 h-4 md:w-5 md:h-5 text-white animate-pulse" />}
                        </div>
                        <div className="min-w-0">
                          <p id="map-status-text" className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] leading-none mb-1 truncate ${locationPinned ? 'text-white' : 'text-gray-900'}`}>
                            {locationPinned ? 'Pinned' : 'Click to pin'}
                          </p>
                          <p id="map-status-sub" className={`text-[7px] md:text-[9px] font-bold uppercase tracking-widest leading-none truncate ${locationPinned ? 'text-white/70' : 'text-gray-500'}`}>
                            {locationPinned ? 'Accurate location set' : 'Zoom in & click rooftop'}
                          </p>
                        </div>
                      </div>
                      
                      {locationPinned && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, lat: null, lng: null, location: '' }));
                            setLocationPinned(false);
                            setSuggestions([]);
                          }}
                          className="bg-white/10 text-white px-3 py-2 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20 shrink-0"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:block">Reset</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                  {/* Map Tools Footer */}
                  <div className="flex flex-row gap-3 items-center justify-between bg-white border border-gray-100 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-sm">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-600 animate-ping"></div>
                      <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precision active</span>
                    </div>
                    {!isMapFullscreen && (
                      <button
                        type="button"
                        onClick={() => setIsMapFullscreen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all shadow-lg"
                      >
                        <Maximize2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Expand
                      </button>
                    )}
                  </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 ml-1 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Property Media (Images)
                  </label>
                </div>

                {/* Main Cover Image Uploader */}
                <div className="relative">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">Main Cover Image (Required)</label>
                  <div className={`relative group overflow-hidden rounded-[2rem] border-2 border-dashed transition-all duration-500 ${coverPreview ? 'border-blue-200 bg-white' : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30'}`}>
                    {coverPreview ? (
                      <div className="relative aspect-video w-full">
                        <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest cursor-pointer hover:scale-105 active:scale-95 transition-all">
                            Change Photo
                            <input type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-16 cursor-pointer group/label">
                        <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-4 group-hover/label:scale-110 group-hover/label:text-blue-600 transition-all text-gray-400">
                          <Plus className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-bold text-gray-900 mb-1">Upload Cover Photo</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Click to browse or drag and drop</p>
                        <input type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                      </label>
                    )}
                  </div>
                </div>
                
                {/* Additional Images Uploader */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">Additional Gallery Images</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {additionalPreviews.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
                            setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2 text-gray-400 group-hover:scale-110 group-hover:text-blue-600 transition-all">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Add more</span>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleAdditionalImagesChange} />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-4 ml-1 flex items-center gap-2">
                   <Check className="w-4 h-4 text-blue-600" />
                   Amenities & Features
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["Swimming Pool", "Private Gym", "Home Theater", "Smart Home", "Wine Cellar", "Zen Garden", "Private Lift", "Servant Quarters", "24/7 Security", "Power Backup", "EV Charging", "Club House"].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => {
                        const current = formData.amenities;
                        const next = current.includes(amenity) 
                          ? current.filter(a => a !== amenity)
                          : [...current, amenity];
                        setFormData({...formData, amenities: next});
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                        formData.amenities.includes(amenity)
                          ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        formData.amenities.includes(amenity) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                      }`}>
                        {formData.amenities.includes(amenity) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-tight">{amenity}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">Description</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-6 w-5 h-5 text-blue-600" />
                  <textarea
                    rows={6}
                    placeholder="Describe the luxury features, amenities, and lifestyle..."
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none ${
                      formData.description.length > 0 && formData.description.length < 50 
                        ? 'border-orange-300 focus:ring-orange-500/20' 
                        : 'border-gray-100'
                    }`}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="flex justify-between mt-2 px-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {formData.description.length < 50 
                      ? `Minimum 50 characters required (${50 - formData.description.length} more)`
                      : 'Description length accepted'}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${
                    formData.description.length < 50 ? 'text-gray-400' : 'text-green-500'
                  }`}>
                    {formData.description.length} characters
                  </p>
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white py-6 rounded-3xl font-bold text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {loading && (
                <div 
                  className="absolute inset-0 bg-blue-500 transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{uploadStatus} ({Math.round(uploadProgress)}%)</span>
                  </>
                ) : (
                  'Submit Property Listing'
                )}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
