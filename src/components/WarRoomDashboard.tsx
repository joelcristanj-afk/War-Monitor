import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Globe, 
  Rss, 
  Bell, 
  Search,
  Filter,
  ChevronRight,
  Map as MapIcon,
  Layers,
  Zap,
  LogOut,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { Incident } from '../types';
import MapComponent from './MapComponent';
import IncidentCard from './IncidentCard';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function WarRoomDashboard() {
  const [user, setUser] = useState(auth.currentUser);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab] = useState<'map' | 'feed'>('map');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'incidents'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
      setIncidents(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = () => signOut(auth);

  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         i.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || i.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#111] border border-white/10 p-8 rounded-2xl text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <Shield className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">AI War Monitor</h1>
            <p className="text-zinc-400 text-sm">Access restricted. Please authenticate to enter the intelligence dashboard.</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            Authenticate with Google
          </button>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">For Authorized Personnel Only</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] text-zinc-100 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Sidebar - Intelligence Feed */}
      <AnimatePresence mode="wait">
        {(isSidebarOpen || activeTab === 'feed') && (
          <motion.aside 
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className={cn(
              "fixed inset-0 md:relative md:inset-auto w-full md:w-80 border-r border-white/5 bg-[#0a0a0a] flex flex-col z-40 md:z-20 transition-all",
              activeTab === 'feed' ? "flex" : "hidden md:flex"
            )}
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span className="font-bold tracking-tight text-sm uppercase">Live Intel Feed</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Live</span>
                </div>
                <button onClick={() => setActiveTab('map')} className="md:hidden p-2">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['All', 'Conflict', 'Military', 'Protest', 'Disaster'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all",
                      filterType === type 
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                        : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Rss className="w-8 h-8 text-zinc-800 mx-auto" />
                  <p className="text-xs text-zinc-600">No signals detected in this sector.</p>
                </div>
              ) : (
                filteredIncidents.map(incident => (
                  <IncidentCard 
                    key={incident.id} 
                    incident={incident} 
                    isSelected={selectedIncident?.id === incident.id}
                    onClick={() => {
                      setSelectedIncident(incident);
                      if (window.innerWidth <= 768) setActiveTab('map');
                    }}
                  />
                ))
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content - Map & Dashboard */}
      <main className="flex-1 relative flex flex-col h-full">
        {/* Top Header */}
        <header className="h-14 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-30">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setActiveTab(activeTab === 'feed' ? 'map' : 'feed');
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Layers className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <h2 className="text-sm md:text-lg font-bold tracking-tighter text-white">AI WAR MONITOR</h2>
              <div className="hidden md:block h-4 w-[1px] bg-white/10" />
              <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  GLOBAL_STATUS: <span className="text-emerald-500">NOMINAL</span>
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  ACTIVE_SIGNALS: <span className="text-white">{incidents.length}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 hover:bg-white/5 rounded-full relative transition-colors">
              <Bell className="w-5 h-5 text-zinc-400" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#0a0a0a]" />
            </button>
            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-white leading-none">{user.displayName}</p>
                <p className="text-[8px] text-zinc-500 uppercase tracking-widest mt-1">Intelligence Officer</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/10 rounded-lg group transition-colors"
              >
                <LogOut className="w-5 h-5 text-zinc-500 group-hover:text-red-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Map Container */}
        <div className="flex-1 relative bg-[#050505]">
          <MapComponent 
            incidents={incidents} 
            selectedIncident={selectedIncident}
            onIncidentSelect={setSelectedIncident}
          />
          
          {/* Overlay Stats - Simplified for mobile */}
          <div className="absolute bottom-6 left-4 right-4 md:left-6 md:right-6 flex flex-col md:flex-row justify-between items-center md:items-end pointer-events-none gap-4">
            <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 p-3 md:p-4 rounded-xl pointer-events-auto w-full md:max-w-xs space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500">Instability Index</span>
                <span className="text-[8px] md:text-[10px] font-mono text-emerald-500">GLOBAL_AVG: 24.2</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '24.2%' }}
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </div>
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                {[
                  { label: 'Conflict', val: '12', color: 'text-red-500' },
                  { label: 'Protest', val: '45', color: 'text-orange-500' },
                  { label: 'Military', val: '08', color: 'text-blue-500' }
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <p className={cn("text-[10px] md:text-xs font-bold", stat.color)}>{stat.val}</p>
                    <p className="text-[6px] md:text-[8px] text-zinc-600 uppercase font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 p-2 rounded-lg pointer-events-auto flex items-center gap-3 md:gap-4 px-3 md:px-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase text-zinc-400">Conflict</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase text-zinc-400">Military</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase text-zinc-400">Protest</span>
              </div>
            </div>
          </div>
        </div>

        {/* Incident Detail Panel - Bottom Sheet on Mobile, Sidebar on Desktop */}
        <AnimatePresence>
          {selectedIncident && (
            <motion.div 
              initial={window.innerWidth <= 768 ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={window.innerWidth <= 768 ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "fixed md:absolute z-50 md:z-20 bg-[#0a0a0a]/95 backdrop-blur-xl border-t md:border border-white/10 shadow-2xl overflow-hidden",
                "inset-x-0 bottom-0 md:inset-auto md:top-20 md:right-6 md:w-96 md:rounded-2xl h-[70vh] md:h-auto"
              )}
            >
              <div className="h-1 w-12 bg-white/20 rounded-full mx-auto my-3 md:hidden" />
              
              <div className="h-40 md:h-48 bg-zinc-900 relative">
                {selectedIncident.media?.[0] ? (
                  <img 
                    src={selectedIncident.media[0]} 
                    alt={selectedIncident.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-500/5">
                    <MapIcon className="w-10 md:w-12 h-10 md:h-12 text-emerald-500/20" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                    selectedIncident.severity > 70 ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                  )}>
                    Severity: {selectedIncident.severity}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedIncident(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-white rotate-90" />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-4 overflow-y-auto max-h-[calc(70vh-10rem)] md:max-h-none no-scrollbar">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-widest">
                    <Zap className="w-3 h-3" />
                    {selectedIncident.type} // {selectedIncident.source}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white leading-tight">{selectedIncident.title}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">{new Date(selectedIncident.timestamp).toLocaleString()}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    AI Intelligence Brief
                  </h4>
                  <div className="text-xs text-zinc-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                    {selectedIncident.summary || selectedIncident.description}
                  </div>
                </div>

                {selectedIncident.escalationRisk && (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Escalation Risk</span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                      selectedIncident.escalationRisk === 'High' ? "text-red-400 bg-red-400/10" :
                      selectedIncident.escalationRisk === 'Medium' ? "text-orange-400 bg-orange-400/10" :
                      "text-emerald-400 bg-emerald-400/10"
                    )}>
                      {selectedIncident.escalationRisk}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pb-6 md:pb-0">
                  <button className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all">
                    Full Analysis
                  </button>
                  <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all">
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden h-16 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-around px-12 z-30">
          <button 
            onClick={() => setActiveTab('map')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === 'map' ? "text-emerald-500" : "text-zinc-500"
            )}
          >
            <MapIcon className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase">Map</span>
          </button>
          <button 
            onClick={() => setActiveTab('feed')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === 'feed' ? "text-emerald-500" : "text-zinc-500"
            )}
          >
            <Rss className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase">Feed</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
