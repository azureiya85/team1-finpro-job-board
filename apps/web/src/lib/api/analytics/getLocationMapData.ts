import { AnalyticsFilters } from '@/types/analyticsTypes';

export async function getLocationMapData(filters: AnalyticsFilters) {
  const params = new URLSearchParams();

  if (filters.dateRange?.start) {
    params.append('start', filters.dateRange.start.toISOString());
  }
  if (filters.dateRange?.end) {
    params.append('end', filters.dateRange.end.toISOString());
  }

  // ✅ Pastikan location adalah objek sebelum akses id
  if (typeof filters.location === 'object' && filters.location !== null) {
    params.append('cityId', filters.location.id);
  }

  const res = await fetch(`/api/analytics/location-map?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch location data');

  return res.json();
}
