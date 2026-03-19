import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Incident } from '../types';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface MapComponentProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onIncidentSelect: (incident: Incident) => void;
}

function MapController({ selectedIncident }: { selectedIncident: Incident | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && selectedIncident) {
      map.panTo(selectedIncident.location);
      map.setZoom(8);
    }
  }, [map, selectedIncident]);
  return null;
}

export default function MapComponent({ incidents, selectedIncident, onIncidentSelect }: MapComponentProps) {
  if (!hasValidKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#050505] text-center p-8">
        <div className="max-w-md space-y-4">
          <h2 className="text-xl font-bold text-white">Google Maps API Key Required</h2>
          <p className="text-zinc-400 text-sm">To view the global intelligence map, please configure your Google Maps API key in the AI Studio Secrets panel.</p>
          <div className="bg-[#111] border border-white/10 p-4 rounded-xl text-left text-xs font-mono text-zinc-500 space-y-2">
            <p>1. Open Settings (gear icon)</p>
            <p>2. Go to Secrets</p>
            <p>3. Add GOOGLE_MAPS_PLATFORM_KEY</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <Map
        defaultCenter={{ lat: 20, lng: 0 }}
        defaultZoom={3}
        mapId="WAR_ROOM_MAP"
        style={{ width: '100%', height: '100%' }}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        styles={[
          {
            "elementType": "geometry",
            "stylers": [{ "color": "#212121" }]
          },
          {
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#757575" }]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#212121" }]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [{ "color": "#757575" }]
          },
          {
            "featureType": "administrative.country",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9e9e9e" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#000000" }]
          }
        ]}
      >
        <MapController selectedIncident={selectedIncident} />
        {incidents.map(incident => (
          <AdvancedMarker
            key={incident.id}
            position={incident.location}
            onClick={() => onIncidentSelect(incident)}
          >
            <Pin 
              background={
                incident.type === 'Conflict' ? '#ef4444' : 
                incident.type === 'Military' ? '#3b82f6' : 
                incident.type === 'Protest' ? '#f97316' : 
                '#10b981'
              } 
              glyphColor="#fff" 
              borderColor="rgba(255,255,255,0.2)"
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
