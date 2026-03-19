import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { 
  Building2, 
  Calendar, 
  Plus, 
  LogOut, 
  LayoutDashboard, 
  MessageSquare,
  ChevronRight,
  MapPin,
  Clock,
  User,
  Mail,
  Phone
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
}

interface Appointment {
  id: string;
  propertyId: string;
  propertyName: string;
  viewerName: string;
  viewerContact: string;
  date: string;
  time: string;
  status: string;
}

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'appointments'>('dashboard');
  const [properties, setProperties] = useState<Property[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerData, setSellerData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/seller/login');
      return;
    }

    // Fetch Seller Data
    const fetchSellerData = async () => {
      const docRef = doc(db, 'sellers', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.mobile || !data.address || !/^\d{10}$/.test(data.mobile)) {
          navigate('/seller/complete-profile');
          return;
        }
        setSellerData(data);
      } else {
        // Doc doesn't exist at all, definitely need to complete profile
        navigate('/seller/complete-profile');
      }
    };
    fetchSellerData();

    // Listen for Properties
    const qProps = query(collection(db, 'properties'), where('sellerUid', '==', user.uid));
    const unsubscribeProps = onSnapshot(qProps, (snapshot) => {
      const propsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
      setProperties(propsData);
    });

    // Listen for Appointments
    const qApps = query(collection(db, 'appointments'), where('sellerUid', '==', user.uid));
    const unsubscribeApps = onSnapshot(qApps, (snapshot) => {
      const appsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appsData);
      setLoading(false);
    });

    return () => {
      unsubscribeProps();
      unsubscribeApps();
    };
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/selection');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-50">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Luxe Estate
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1">Partner Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/add-property')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Property
          </button>
          <button 
             onClick={() => setActiveTab('appointments')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
               activeTab === 'appointments' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
             }`}
          >
            <Calendar className="w-5 h-5" />
            Appointments
          </button>
          <button 
             onClick={() => setActiveTab('profile')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
               activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
             }`}
          >
            <User className="w-5 h-5" />
            Profile Info
          </button>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Welcome Back, {sellerData?.displayName || 'Partner'}</h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.1em]">Luxury Estate Partner</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/add-property')}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Property
            </button>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-100">
              {sellerData?.displayName?.charAt(0) || <User className="w-5 h-5" />}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {activeTab === 'dashboard' ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Total Properties</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{properties.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-4">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Active Appointments</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{appointments.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">New Inquiries</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">0</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Recent Appointments */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Recent Appointments</h3>
                    <button 
                      onClick={() => setActiveTab('appointments')}
                      className="text-blue-600 text-sm font-bold hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {appointments.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {appointments.slice(0, 5).map((app) => (
                          <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                <User className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">{app.viewerName}</h4>
                                <p className="text-sm text-gray-500">Interested in: {app.propertyName}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-blue-600 font-bold">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {app.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {app.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button className="p-2 border border-gray-100 rounded-lg hover:bg-white transition-all">
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400">No appointments booked yet.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* My Properties */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">My Properties</h3>
                    <button 
                      onClick={() => navigate('/add-property')}
                      className="text-blue-600 text-sm font-bold hover:underline"
                    >
                      Add New
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {properties.map((prop) => (
                      <div key={prop.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group">
                        <div className="aspect-video bg-gray-100 rounded-xl mb-4 overflow-hidden">
                          {prop.imageUrl ? (
                            <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Building2 className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 truncate">{prop.title}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {prop.location}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-blue-600 font-bold">₹{prop.price}</span>
                          <button 
                            onClick={() => navigate(`/property/${prop.id}`)}
                            className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                    {properties.length === 0 && (
                      <div className="col-span-2 p-12 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                        <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400">You haven't listed any properties yet.</p>
                        <button 
                          onClick={() => navigate('/add-property')}
                          className="mt-4 text-blue-600 font-bold hover:underline"
                        >
                          List your first property
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          ) : activeTab === 'profile' ? (
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Partner Profile</h3>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-gray-50">
                    <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-3xl font-bold border border-blue-100">
                      {sellerData?.displayName?.charAt(0) || <User className="w-10 h-10" />}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{sellerData?.displayName || 'Partner'}</h4>
                      <p className="text-gray-500">Luxury Estate Partner</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                      <div className="flex items-center gap-3 text-gray-900 font-bold">
                        <Mail className="w-4 h-4 text-blue-600" />
                        {sellerData?.email}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</p>
                      <div className="flex items-center gap-3 text-gray-900 font-bold">
                        <Phone className="w-4 h-4 text-blue-600" />
                        {sellerData?.mobile}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Address</p>
                    <div className="flex items-start gap-3 text-gray-900 font-bold leading-relaxed">
                      <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                      {sellerData?.address}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-50 flex gap-4">
                    <button 
                      className="px-6 py-2.5 bg-gray-50 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
                      onClick={() => alert('Profile editing is coming soon!')}
                    >
                      Edit Profile
                    </button>
                    <button 
                       onClick={handleLogout}
                       className="px-6 py-2.5 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
               <h3 className="text-xl font-bold text-gray-900">All Appointments</h3>
               <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  {appointments.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {appointments.map((app) => (
                        <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                              <User className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{app.viewerName}</h4>
                              <p className="text-sm text-gray-500">Interested in: {app.propertyName}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-blue-600 font-bold">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {app.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {app.time}
                                </span>
                                <span className="flex items-center gap-1 ml-4 text-gray-400">
                                  <Phone className="w-3 h-3" /> {app.viewerContact}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-[10px] font-black uppercase tracking-widest">{app.status}</span>
                             <button className="p-2 border border-gray-100 rounded-lg hover:bg-white transition-all">
                               <ChevronRight className="w-5 h-5 text-gray-400" />
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400">No appointments booked yet.</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
