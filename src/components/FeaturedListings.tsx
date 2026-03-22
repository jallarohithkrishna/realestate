import React, { useState, useEffect } from 'react';
import { Bed, Bath, Square, ArrowRight, MapPin, Search, User, Filter, X, Home, IndianRupee, Map as MapIcon, LayoutGrid } from 'lucide-react';
import PropertyMap from './PropertyMap';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, getDocs, limit, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

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
  location: string;
  price: string;
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
}

const POPULAR_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", 
  "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", 
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", 
  "Bhopal", "Visakhapatnam", "Vadodara", "Goa", "Chandigarh",
  "Dubai", "London", "New York", "Paris", "Singapore"
];

const DEMO_PROPERTIES = [
  {
    title: "The Royal Atlantis",
    price: "₹85,00,00,000",
    location: "Palm Jumeirah, Dubai",
    imageUrl: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512453979798-5eaad0ff3e01?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544526226-d4568090ffb8?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Experience unparalleled luxury at the Palm Jumeirah. This extraordinary residence offers panoramic Arabian Gulf views, a private infinity pool, and access to world-class Michelin-star dining. The pinnacle of international living.",
    bhk: "5 BHK",
    area: "9,200 sq ft",
    builderName: "Kerzner International",
    propertyType: "Penthouse",
    amenities: ["Private Beach", "Butler Service", "Infinity Pool", "Sky Garden", "Valet"],
    lat: 25.1376,
    lng: 55.1264
  },
  {
    title: "Villa Azure",
    price: "₹15,00,00,000",
    location: "Goa, India",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "A breathtaking Mediterranean estate perched on the cliffs of the French Riviera. This villa features expansive terraces, a private vineyard, and an infinity pool that merges with the horizon.",
    bhk: "6 BHK",
    area: "8,500 sq ft",
    builderName: "Azure Developers",
    propertyType: "Villa",
    amenities: ["Swimming Pool", "Private Gym", "Home Theater", "Wine Cellar", "Security"]
  },
  {
    title: "The Obsidian",
    price: "₹18,50,00,000",
    location: "Mumbai, India",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687940-4e2a09695d51?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "A dark, sleek architectural masterpiece. The Obsidian combines traditional minimalism with cutting-edge technology. Features include a private Zen garden and panoramic skyline views.",
    bhk: "4 BHK",
    area: "5,200 sq ft",
    builderName: "Metropolis Elite",
    propertyType: "Penthouse",
    amenities: ["Smart Home", "Private Lift", "Infinity Pool", "Zen Garden", "Concierge"]
  },
  {
    title: "Emerald Bay Estate",
    price: "₹12,00,00,000",
    location: "Udaipur, India",
    imageUrl: "https://images.unsplash.com/photo-1600607687940-4e2a09695d51?auto=format&fit=crop&w=1200&q=80",
    description: "A rustic yet refined mountain retreat on the shores of Lake Tahoe. This estate offers unparalleled access to nature with a private pier, a heated outdoor lounge, and floor-to-ceiling windows that capture the crystal-clear waters and snow-capped peaks.",
    bhk: "5 BHK",
    area: "7,200 sq ft",
    builderName: "Royal Heritage Homes",
    propertyType: "Villa"
  },
  {
    title: "Royal Penthouse",
    price: "₹25,00,00,000",
    location: "Bangalore, India",
    imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
    description: "The crown jewel of Dubai's skyline. This penthouse occupies the top two floors of a landmark tower, featuring a private helipad, a 24-carat gold-leaf ceiling, and a personal wellness center. Live like royalty in the most extravagant city in the world.",
    bhk: "7 BHK",
    area: "12,000 sq ft",
    builderName: "Skyline Legends",
    propertyType: "Penthouse"
  },
  {
    title: "The Glass House",
    price: "₹10,00,00,000",
    location: "Alibaug, India",
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    description: "A stunning contemporary villa in Malibu with floor-to-ceiling glass walls offering 360-degree ocean views. This property features a state-of-the-art home theater, a professional-grade gym, and direct access to a secluded beach.",
    bhk: "4 BHK",
    area: "4,800 sq ft",
    builderName: "Prism Architects",
    propertyType: "Villa"
  },
  {
    title: "Alpine Sanctuary",
    price: "₹8,00,00,000",
    location: "Manali, India",
    imageUrl: "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=1200&q=80",
    description: "A cozy yet luxurious ski-in/ski-out lodge in the heart of Aspen. Built with reclaimed wood and local stone, this sanctuary features a massive stone fireplace, a private spa, and a heated outdoor deck perfect for après-ski gatherings.",
    bhk: "3 BHK",
    area: "3,500 sq ft",
    builderName: "Zenith Retreats",
    propertyType: "Resort"
  },
  {
    title: "Skyline Studio",
    price: "₹45,00,000",
    location: "Pune, India",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    description: "A modern, efficient studio apartment in the burgeoning tech hub of Pune. Perfect for young professionals, featuring smart home automation and a central location.",
    bhk: "1 BHK",
    area: "650 sq ft",
    builderName: "Urban Logic",
    propertyType: "Apartment"
  },
  {
    title: "Heritage Garden Flat",
    price: "₹85,00,000",
    location: "Chandigarh, India",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    description: "A charming ground-floor apartment with a private garden in the well-planned city of Chandigarh. Features high ceilings and traditional architectural touches.",
    bhk: "2 BHK",
    area: "1,200 sq ft",
    builderName: "Classic Estates",
    propertyType: "Apartment"
  },
  {
    title: "The Urban Loft",
    price: "₹1,50,00,000",
    location: "Hyderabad, India",
    imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    description: "A spacious industrial-style loft in Jubilee Hills. Features double-height ceilings, exposed brickwork, and a private mezzanine office.",
    bhk: "3 BHK",
    area: "2,200 sq ft",
    builderName: "Vanguard Realty",
    propertyType: "Apartment"
  },
  {
    title: "Coastal Retreat Villa",
    price: "₹3,50,00,000",
    location: "Kochi, India",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    description: "A beautiful seaside villa in Kochi offering serene views of the backwaters. Features traditional Kerala architecture with modern luxury amenities.",
    bhk: "4 BHK",
    area: "3,800 sq ft",
    builderName: "Harmony Builders",
    propertyType: "Villa"
  },
  {
    title: "Premium HMDA Plot",
    price: "₹1,20,00,000",
    location: "Shadnagar, Hyderabad",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=1200&q=80",
    description: "East-facing premium plot in a gated community. HMDA approved, clear title, and ready for immediate construction with all amenities provided.",
    bhk: "N/A",
    area: "2,400 sq ft",
    builderName: "Elite Ventures",
    propertyType: "Plot"
  },
  {
    title: "Luxury Independent House",
    price: "₹4,50,00,000",
    location: "Manikonda, Hyderabad",
    imageUrl: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80",
    description: "Beautiful G+2 independent house with a private terrace garden and automated parking. Located in the quiet lanes of Manikonda.",
    bhk: "5 BHK",
    area: "4,200 sq ft",
    builderName: "Elite Construction",
    propertyType: "Independent House"
  },
  {
    title: "Eco-Conscious Micro Home",
    price: "₹8,50,000",
    location: "Auroville, India",
    imageUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
    description: "A sustainable and compact micro-home designed for minimal environmental impact in the forests of Auroville.",
    bhk: "1 BHK",
    area: "350 sq ft",
    builderName: "Green Earth Systems",
    propertyType: "Resort"
  },
  {
    title: "Starter City Apartment",
    price: "₹28,00,000",
    location: "Ahmedabad, India",
    imageUrl: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
    description: "An ideal starter home in a quiet neighborhood of Ahmedabad. Well-connected to public transport and local markets.",
    bhk: "1 BHK",
    area: "550 sq ft",
    builderName: "Unity Group",
    propertyType: "Apartment"
  },
  {
    title: "Suburban Comfort Suite",
    price: "₹38,00,000",
    location: "Lucknow, India",
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    description: "A spacious and comfortable suite in the suburbs of Lucknow, offering a perfect blend of modern living and traditional charm.",
    bhk: "2 BHK",
    area: "950 sq ft",
    builderName: "Oudh Developers",
    propertyType: "Apartment"
  }
];


interface FeaturedListingsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function FeaturedListings({ searchTerm, setSearchTerm }: FeaturedListingsProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Filters State
  const [selectedCity, setSelectedCity] = useState('Any');
  const [selectedType, setSelectedType] = useState('Any');
  const [budgetRange, setBudgetRange] = useState('Any');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const propertiesCol = collection(db, 'properties');
    const q = query(propertiesCol, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        console.log("Database empty, seeding demo properties...");
        try {
          for (const prop of DEMO_PROPERTIES) {
            await addDoc(propertiesCol, {
              ...prop,
              createdAt: serverTimestamp(),
              authorUid: 'system'
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'properties');
        }
        setLoading(false);
      } else {
        const propertyData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          let price = data.price || '';
          
          // Migration: Display rupee symbol instead of dollar if present
          if (typeof price === 'string' && price.startsWith('$')) {
            price = price.replace('$', '₹');
          }

          return {
            id: docSnap.id,
            ...data,
            price
          } as Property;
        });
        setProperties(propertyData);
        setFilteredProperties(propertyData);
        setLoading(false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'properties');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = properties.filter(prop => {
      // 1. Search Term (Title or Location)
      const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prop.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. City Filter
      const matchesCity = selectedCity === 'Any' || prop.location.toLowerCase().includes(selectedCity.toLowerCase());
      
      // 3. Property Type Filter
      const matchesType = selectedType === 'Any' || prop.propertyType === selectedType;
      
      // 4. Budget Filter
      let matchesBudget = true;
      if (budgetRange !== 'Any') {
        const numericPrice = parseInt(prop.price.replace(/[^\d]/g, ''), 10);
        if (budgetRange === 'Under 10L') matchesBudget = numericPrice < 1000000;
        else if (budgetRange === '10L - 20L') matchesBudget = numericPrice >= 1000000 && numericPrice <= 2000000;
        else if (budgetRange === '20L - 30L') matchesBudget = numericPrice >= 2000000 && numericPrice <= 3000000;
        else if (budgetRange === '30L - 40L') matchesBudget = numericPrice >= 3000000 && numericPrice <= 4000000;
        else if (budgetRange === '40L - 50L') matchesBudget = numericPrice >= 4000000 && numericPrice <= 5000000;
        else if (budgetRange === '50L - 1Cr') matchesBudget = numericPrice >= 5000000 && numericPrice <= 10000000;
        else if (budgetRange === '1Cr - 2Cr') matchesBudget = numericPrice >= 10000000 && numericPrice <= 20000000;
        else if (budgetRange === '2Cr - 5Cr') matchesBudget = numericPrice >= 20000000 && numericPrice <= 50000000;
        else if (budgetRange === '5Cr - 10Cr') matchesBudget = numericPrice >= 50000000 && numericPrice <= 100000000;
        else if (budgetRange === '10Cr - 15Cr') matchesBudget = numericPrice >= 100000000 && numericPrice <= 150000000;
        else if (budgetRange === '15Cr - 25Cr') matchesBudget = numericPrice >= 150000000 && numericPrice <= 250000000;
        else if (budgetRange === '25Cr - 50Cr') matchesBudget = numericPrice >= 250000000 && numericPrice <= 500000000;
        else if (budgetRange === '50Cr - 75Cr') matchesBudget = numericPrice >= 500000000 && numericPrice <= 750000000;
        else if (budgetRange === '75Cr - 100Cr') matchesBudget = numericPrice >= 750000000 && numericPrice <= 1000000000;
        else if (budgetRange === 'Over 100Cr') matchesBudget = numericPrice > 1000000000;
      }

      return matchesSearch && matchesCity && matchesType && matchesBudget;
    });
    setFilteredProperties(filtered);
  }, [searchTerm, properties, selectedCity, selectedType, budgetRange]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto" id="listings">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <span className="text-amber-400 font-bold tracking-[0.2em] text-xs uppercase mb-2 block">Premium Selection</span>
          <h2 className="text-4xl font-bold text-white">Featured Listings</h2>
        </div>
        
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="w-full md:w-96 relative">
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-card rounded-xl focus:outline-none focus:border-amber-400/30 transition-all text-sm text-white placeholder:text-gray-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all font-bold text-sm ${showFilters ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg glow-amber' : 'glass-card text-gray-400 hover:text-white hover:border-amber-400/20'}`}
          >
            {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>

          <div className="flex glass-card p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-400/20 text-amber-400 shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-amber-400/20 text-amber-400 shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              title="Map View"
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="glass-card p-6 rounded-[2rem] mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Popular Cities</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-amber-400/30 transition-all text-sm font-bold text-gray-300 appearance-none cursor-pointer"
              >
                <option value="Any">Any Location</option>
                {POPULAR_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Budget</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <select 
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
              >
                <option value="Any">Any Budget</option>
                <option value="Under 10L">Under ₹10 L</option>
                <option value="10L - 20L">₹10 L - ₹20 L</option>
                <option value="20L - 30L">₹20 L - ₹30 L</option>
                <option value="30L - 40L">₹30 L - ₹40 L</option>
                <option value="40L - 50L">₹40 L - ₹50 L</option>
                <option value="50L - 1Cr">₹50 L - ₹1 Cr</option>
                <option value="1Cr - 2Cr">₹1 Cr - ₹2 Cr</option>
                <option value="2Cr - 5Cr">₹2 Cr - ₹5 Cr</option>
                <option value="5Cr - 10Cr">₹5 Cr - ₹10 Cr</option>
                <option value="10Cr - 15Cr">₹10 Cr - ₹15 Cr</option>
                <option value="15Cr - 25Cr">₹15 Cr - ₹25 Cr</option>
                <option value="25Cr - 50Cr">₹25 Cr - ₹50 Cr</option>
                <option value="50Cr - 75Cr">₹50 Cr - ₹75 Cr</option>
                <option value="75Cr - 100Cr">₹75 Cr - ₹100 Cr</option>
                <option value="Over 100Cr">Over ₹100 Cr</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Property Type</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
              >
                <option value="Any">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Independent House">Independent House</option>
                <option value="Plot">Plot</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => {
                setSelectedCity('Any');
                setSelectedType('Any');
                setBudgetRange('Any');
                setSearchTerm('');
              }}
              className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-400 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {viewMode === 'map' ? (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <PropertyMap properties={filteredProperties} />
        </div>
      ) : (
        <>
          {filteredProperties.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-[2.5rem] border-2 border-dashed border-white/[0.06]">
              <p className="text-gray-400 text-lg">No properties found matching your search.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('Any');
                  setSelectedType('Any');
                  setBudgetRange('Any');
                }}
                className="mt-6 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-8 py-3 rounded-xl font-bold hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg glow-amber text-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <div 
                  key={property.id} 
                  className="group glass-card rounded-3xl overflow-hidden glass-card-hover transition-all duration-500 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4 bg-amber-400/90 backdrop-blur-md text-slate-950 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">
                      FEATURED
                    </div>
                    <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-2xl font-bold text-amber-400 shadow-xl border border-white/[0.06]">
                      {property.price}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{property.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      {property.location}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {property.bhk && (
                        <div className="flex items-center gap-2 bg-white/[0.04] p-2 rounded-xl border border-white/[0.06]">
                          <Bed className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-gray-300">{property.bhk}</span>
                        </div>
                      )}
                      {property.area && (
                        <div className="flex items-center gap-2 bg-white/[0.04] p-2 rounded-xl border border-white/[0.06]">
                          <Square className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-gray-300">{property.area}</span>
                        </div>
                      )}
                      {property.builderName && (
                        <div className="col-span-2 flex items-center gap-2 bg-white/[0.04] p-2 rounded-xl border border-white/[0.06]">
                          <div className="w-4 h-4 rounded-full bg-amber-400/20 flex items-center justify-center">
                            <User className="w-2.5 h-2.5 text-amber-400" />
                          </div>
                          <span className="text-xs font-medium text-gray-500 truncate">By <span className="text-white font-bold">{property.builderName}</span></span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto">
                      <button 
                        onClick={() => navigate(`/property/${property.id}`)}
                        className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-2xl font-bold hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg glow-amber active:scale-[0.98]"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
