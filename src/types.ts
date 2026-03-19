export interface Incident {
  id: string;
  title: string;
  description: string;
  summary?: string;
  location: {
    lat: number;
    lng: number;
  };
  severity: number;
  type: 'Conflict' | 'Military' | 'Protest' | 'Disaster';
  source: string;
  timestamp: string;
  media?: string[];
  escalationRisk?: 'Low' | 'Medium' | 'High';
}

export interface UserAlert {
  id: string;
  uid: string;
  country: string;
  topic: string;
  minSeverity: number;
}

export interface AIAnalysis {
  what: string;
  why: string;
  risk: 'Low' | 'Medium' | 'High';
  severity: number;
  location: string;
  category: string;
}
