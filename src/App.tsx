import React, { Component, ErrorInfo, ReactNode } from 'react';
import WarRoomDashboard from './components/WarRoomDashboard';
import { db } from './firebase';
import { collection, getDocs, setDoc, doc, query, limit } from 'firebase/firestore';

// Error Boundary for Firestore and App errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, errorInfo: string | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message || String(error) };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-xl font-bold text-red-500 uppercase tracking-widest">System Failure</h2>
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs font-mono text-red-400 overflow-auto max-h-64">
              {this.state.errorInfo}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
            >
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Mock Data Initialization
async function initializeMockData() {
  const q = query(collection(db, 'incidents'), limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("Initializing mock intelligence data...");
    const mockIncidents = [
      {
        title: "Sudden Troop Movement Near Border",
        description: "Satellite imagery detects significant armored vehicle deployment in the northern sector.",
        summary: "AI Analysis: High probability of localized escalation. Multiple divisions observed moving toward strategic positions. Recommend immediate monitoring of communication channels.",
        location: { lat: 48.3794, lng: 31.1656 },
        severity: 85,
        type: 'Military',
        source: 'OSINT_SATELLITE',
        timestamp: new Date().toISOString(),
        escalationRisk: 'High'
      },
      {
        title: "Massive Protests in Capital Square",
        description: "Thousands gather to protest economic instability and government policy.",
        summary: "AI Analysis: Civil unrest index spiking. Sentiment analysis indicates high frustration. Potential for clashes with security forces in the next 12-24 hours.",
        location: { lat: 52.5200, lng: 13.4050 },
        severity: 65,
        type: 'Protest',
        source: 'SOCIAL_MONITOR',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        escalationRisk: 'Medium'
      },
      {
        title: "Cyber Attack on Power Grid",
        description: "Multiple regional power stations reporting unauthorized access attempts.",
        summary: "AI Analysis: Sophisticated state-sponsored actor suspected. Objective appears to be infrastructure disruption. Severity high due to potential cascading effects.",
        location: { lat: 40.7128, lng: -74.0060 },
        severity: 92,
        type: 'Conflict',
        source: 'CYBER_SIGINT',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        escalationRisk: 'High'
      }
    ];

    for (const incident of mockIncidents) {
      await setDoc(doc(collection(db, 'incidents')), incident);
    }
  }
}

initializeMockData().catch(console.error);

export default function App() {
  return (
    <ErrorBoundary>
      <WarRoomDashboard />
    </ErrorBoundary>
  );
}
