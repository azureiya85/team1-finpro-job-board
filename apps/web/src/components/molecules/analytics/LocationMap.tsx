'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { LocationData, AnalyticsFilters } from '@/types/analyticsTypes';
import 'leaflet/dist/leaflet.css';

const icon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

L.Marker.prototype.options.icon = icon;

interface LocationMapProps {
  data: LocationData[];
  filters: AnalyticsFilters;
}

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
