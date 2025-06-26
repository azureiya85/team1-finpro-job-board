import { AnalyticsFilters } from '@/types/analyticsTypes';

export async function getLocationMapData(filters: AnalyticsFilters) {
  const params = new URLSearchParams();

  if (filters.dateRange?.start) {
    params.append('start', filters.dateRange.start.toISOString());
  }

  if (filters.dateRange?.end) {
    params.append('end', filters.dateRange.end.toISOString());
  }

  if (filters.location && filters.location !== 'all') {
    params.append('cityId', filters.location);
  }

  console.log('[getLocationMapData]', filters, params.toString());

  const res = await fetch(`/api/analytics/location-map?${params.toString()}`);

  // ✅ Tangani error status
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch location data: ${errorText}`);
  }

  // ✅ Aman melakukan parsing JSON
  const data = await res.json();
  return data;
}
