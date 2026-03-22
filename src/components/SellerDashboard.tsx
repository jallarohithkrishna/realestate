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
  Phone,
  Menu,
  X,
  Sparkles
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-white/[0.06]">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          Luxe Estate
        </h1>
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-600 mt-1">Partner Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'profile', label: 'Profile Info', icon: User },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as any);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all relative group/item ${
              activeTab === item.id 
                ? 'bg-amber-400/10 text-amber-400' 
                : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 w-1 h-6 bg-amber-400 rounded-r-full shadow-[0_0_12px_rgba(251,191,36,0.4)]" />
            )}
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'opacity-100' : 'opacity-60 group-hover/item:opacity-100'}`} />
            <span className="text-[13px] tracking-wide">{item.label}</span>
          </button>
        ))}
        <button 
          onClick={() => {
            navigate('/add-property');
            setIsMobileMenuOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-white/[0.04] hover:text-gray-300 rounded-xl font-medium transition-all group/add"
        >
          <Plus className="w-5 h-5 opacity-60 group-hover/add:opacity-100" />
          <span className="text-[13px] tracking-wide">Add Property</span>
        </button>
      </nav>

      <div className="p-4 border-t border-white/[0.06]">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-white/[0.06] hidden lg:flex flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <span className="text-white font-bold">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-400" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px] text-amber-400/60 font-black uppercase tracking-[0.2em] mb-1">
                <LayoutDashboard className="w-3 h-3" />
                <span>Portal / {activeTab}</span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white leading-none">
                {activeTab === 'dashboard' ? `Welcome, ${sellerData?.displayName?.split(' ')[0] || 'Partner'}` : 
                 activeTab === 'appointments' ? 'Appointment Ledger' : 'Professional Profile'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/add-property')}
              className="hidden sm:flex bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg glow-amber items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Property
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/[0.06]">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-white leading-tight">{sellerData?.displayName || 'Partner'}</p>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Verified Seller</p>
              </div>
              <div className="w-10 h-10 bg-amber-400/10 rounded-full flex items-center justify-center text-amber-400 font-bold border border-amber-400/20 glow-amber group pointer-events-none">
                {sellerData?.displayName?.charAt(0) || <User className="w-5 h-5" />}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          {activeTab === 'dashboard' ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-3xl group/stat hover:border-amber-400/20 transition-all duration-500">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-2xl flex items-center justify-center text-amber-400 mb-4 group-hover/stat:scale-110 transition-transform duration-500">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Portfolio Growth</p>
                  <div className="flex items-end gap-2 mt-1">
                    <h3 className="text-4xl font-black text-white">{properties.length}</h3>
                    <span className="text-xs text-amber-400/60 font-medium mb-1.5 uppercase tracking-widest">Estates</span>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-3xl group/stat hover:border-amber-400/20 transition-all duration-500">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-2xl flex items-center justify-center text-amber-400 mb-4 group-hover/stat:scale-110 transition-transform duration-500">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Client Meetings</p>
                  <div className="flex items-end gap-2 mt-1">
                    <h3 className="text-4xl font-black text-white">{appointments.length}</h3>
                    <span className="text-xs text-amber-400/60 font-medium mb-1.5 uppercase tracking-widest">Active</span>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-3xl group/stat hover:border-amber-400/20 transition-all duration-500">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-2xl flex items-center justify-center text-amber-400 mb-4 group-hover/stat:scale-110 transition-transform duration-500">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Partner Leads</p>
                  <div className="flex items-end gap-2 mt-1">
                    <h3 className="text-4xl font-black text-white">0</h3>
                    <span className="text-xs text-amber-400/60 font-medium mb-1.5 uppercase tracking-widest">Inquiries</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Recent Appointments */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Recent Appointments</h3>
                    <button 
                      onClick={() => setActiveTab('appointments')}
                      className="text-amber-400 text-sm font-bold hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="glass-card rounded-3xl overflow-hidden">
                    {appointments.length > 0 ? (
                      <div className="divide-y divide-white/[0.04]">
                        {appointments.slice(0, 5).map((app) => (
                          <div key={app.id} className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-400">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white tracking-wide">{app.viewerName}</h4>
                                <p className="text-[11px] text-gray-500 font-medium">Viewing: {app.propertyName}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Scheduled Date</span>
                                <div className="flex items-center gap-2 text-xs font-bold text-white">
                                  <Calendar className="w-3.5 h-3.5 text-amber-400/60" />
                                  {app.date}
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Time Slot</span>
                                <div className="flex items-center gap-2 text-xs font-bold text-white">
                                  <Clock className="w-3.5 h-3.5 text-amber-400/60" />
                                  {app.time}
                                </div>
                              </div>
                              <button className="hidden sm:flex p-2 border border-white/[0.06] rounded-xl hover:bg-amber-400/10 hover:text-amber-400 hover:border-amber-400/20 transition-all text-gray-500">
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/[0.04]">
                          <Calendar className="w-8 h-8 text-gray-800" />
                        </div>
                        <p className="text-gray-600 font-medium tracking-wide">No appointments currently scheduled</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* My Properties */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">My Properties</h3>
                    <button 
                      onClick={() => navigate('/add-property')}
                      className="text-amber-400 text-sm font-bold hover:underline"
                    >
                      Add New
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {properties.map((prop) => (
                      <div key={prop.id} className="glass-card p-4 rounded-2xl group glass-card-hover transition-all relative overflow-hidden">
                        <div className="absolute top-3 right-3 z-10">
                          <span className="px-2 py-1 bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg glow-amber">Active</span>
                        </div>
                        <div className="aspect-[16/10] bg-slate-900 rounded-xl mb-4 overflow-hidden relative">
                          {prop.imageUrl ? (
                            <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                              <Building2 className="w-8 h-8 opacity-20" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        <h4 className="font-bold text-white truncate text-sm tracking-wide">{prop.title}</h4>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="w-3 h-3 text-amber-400/60" /> {prop.location}
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.15em] mb-0.5">Market Value</span>
                            <span className="text-amber-400 font-black text-sm tracking-tight">₹{prop.price}</span>
                          </div>
                          <button 
                            onClick={() => navigate(`/property/${prop.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-amber-400 hover:border-amber-400/20 hover:bg-amber-400/10 transition-all"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    ))}
                    {properties.length === 0 && (
                      <div className="col-span-2 p-12 glass-card rounded-3xl border-2 border-dashed border-white/[0.06] text-center">
                        <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500">You haven't listed any properties yet.</p>
                        <button 
                          onClick={() => navigate('/add-property')}
                          className="mt-4 text-amber-400 font-bold hover:underline"
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
              <h3 className="text-2xl font-bold text-white mb-8">Partner Profile</h3>
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-white/[0.06]">
                    <div className="w-20 h-20 bg-amber-400/10 rounded-2xl flex items-center justify-center text-amber-400 text-3xl font-bold border border-amber-400/20">
                      {sellerData?.displayName?.charAt(0) || <User className="w-10 h-10" />}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{sellerData?.displayName || 'Partner'}</h4>
                      <p className="text-gray-500">Luxury Estate Partner</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Email Address</p>
                      <div className="flex items-center gap-3 text-white font-bold">
                        <Mail className="w-4 h-4 text-amber-400" />
                        {sellerData?.email}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Mobile Number</p>
                      <div className="flex items-center gap-3 text-white font-bold">
                        <Phone className="w-4 h-4 text-amber-400" />
                        {sellerData?.mobile}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-4">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Business Address</p>
                    <div className="flex items-start gap-3 text-white font-bold leading-relaxed">
                      <MapPin className="w-4 h-4 text-amber-400 mt-1" />
                      {sellerData?.address}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/[0.06] flex gap-4">
                    <button 
                      className="px-6 py-2.5 glass-card text-gray-400 rounded-xl font-bold text-sm hover:text-white hover:border-amber-400/20 transition-all"
                      onClick={() => alert('Profile editing is coming soon!')}
                    >
                      Edit Profile
                    </button>
                    <button 
                       onClick={handleLogout}
                       className="px-6 py-2.5 bg-red-500/10 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-black text-white tracking-tight">Active Appointments</h3>
                 <div className="flex items-center gap-2">
                   <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sort by:</div>
                   <select className="bg-slate-900 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400/40 transition-colors cursor-pointer appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20class%3D%22lucide-chevron-down%22%3E%3Cpath%20d%3D%22m6%209%206-6-6-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_10px_center] bg-no-repeat">
                     <option>Newest First</option>
                     <option>Price: High to Low</option>
                   </select>
                 </div>
               </div>
               <div className="glass-card rounded-3xl overflow-hidden">
                  {appointments.length > 0 ? (
                    <div className="divide-y divide-white/[0.04]">
                      {appointments.map((app) => (
                        <div key={app.id} className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-400/10 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-400/10 transition-transform group-hover:scale-105">
                              <User className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-base font-black text-white tracking-wide">{app.viewerName}</h4>
                              <p className="text-xs text-gray-500 font-medium">Estate Inquiry: <span className="text-amber-400/80 font-bold">{app.propertyName}</span></p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                                  <Phone className="w-3.5 h-3.5 text-amber-400/40" /> {app.viewerContact}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-8 lg:gap-14">
                            <div className="space-y-1.5">
                              <span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Appointment Slot</span>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-tighter">
                                  <Calendar className="w-3.5 h-3.5 text-amber-400/60" /> {app.date}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-tighter">
                                  <Clock className="w-3.5 h-3.5 text-amber-400/60" /> {app.time}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] block">Status</span>
                              <span className="inline-flex px-3 py-1 bg-amber-400/10 text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-400/10 glow-amber-sm">
                                {app.status || 'Verified'}
                              </span>
                            </div>
                            <button className="p-3 border border-white/[0.06] rounded-2xl hover:bg-amber-400/10 hover:text-amber-400 hover:border-amber-400/20 transition-all text-gray-500 group">
                               <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-20 text-center">
                      <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/[0.04]">
                        <Calendar className="w-10 h-10 text-gray-800" />
                      </div>
                      <p className="text-gray-600 font-bold text-lg tracking-wide">No appointments recorded in the ledger</p>
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
