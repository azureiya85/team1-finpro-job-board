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

  const res = await fetch(`/api/analytics/location-map?${params.toString()}`);
  return res.json();
}