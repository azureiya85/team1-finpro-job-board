'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { LocationData, AnalyticsFilters } from '@/types/analyticsTypes';
import 'leaflet/dist/leaflet.css';

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
  filters: AnalyticsFilters;
}

// Helper untuk ambil cityId dari filters.location
function getLocationId(location: AnalyticsFilters['location']): string | null {
  return typeof location !== 'string' ? location.id : null;
}

export default function LocationMap({ data, filters }: LocationMapProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet');
    }
  }, []);

  const locationId = getLocationId(filters.location);

  const filteredData = locationId
    ? data.filter((loc) => loc.cityId === locationId)
    : data;

  const mapCenter =
    filteredData.length === 1
      ? [filteredData[0].latitude, filteredData[0].longitude]
      : [-2.5, 117];

  const zoomLevel = filteredData.length === 1 ? 8 : 4.5;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 h-[500px]">
      <h2 className="text-lg font-semibold mb-4">Applicant Location Map</h2>
      <MapContainer
        center={mapCenter as [number, number]}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        style={{ height: 'calc(100% - 40px)', width: '100%' }}
        className="rounded-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredData.map((loc, index) => (
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
