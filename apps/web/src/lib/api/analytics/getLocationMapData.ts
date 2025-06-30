import { LocationFilter } from '@/types/analyticsTypes';

export async function getLocationMapData(filters: LocationFilter) {
  const params = new URLSearchParams();


  if (typeof filters.location === 'object' && filters.location !== null) {
    params.append('cityId', filters.location.id);
  }

  const res = await fetch(`/api/analytics/location-map?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch location data');

  return res.json();
}
