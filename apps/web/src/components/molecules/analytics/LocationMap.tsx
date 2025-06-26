'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { LocationData } from '@/types/analyticsTypes';

const icon = L.icon({
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  
  L.Marker.prototype.options.icon = icon;

interface LocationMapProps {
    data: LocationData[];
}

export default function LocationMap({ data }: LocationMapProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet');
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Applicant Location Map</h2>
      <MapContainer center={[-2.5, 117]} zoom={4.5} scrollWheelZoom={false} style={{ height: 400 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((loc, index) => (
          <Marker key={index} position={[loc.latitude, loc.longitude]}>
            <Popup>
              <strong>{loc.city}</strong><br />
              {loc.count} applicant{loc.count > 1 ? 's' : ''}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
