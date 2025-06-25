import useSWR from 'swr';
import { getLocationMapData } from '@/lib/api/analytics/getLocationMapData';
import { AnalyticsFilters } from '@/types/analyticsTypes';
import { MapData } from '@/types/analyticsTypes';

export function useLocationMapData(filters: AnalyticsFilters) {
    const { data, error, isLoading } = useSWR<MapData[]>(['location-map', filters], () =>
      getLocationMapData(filters)
    );
  
    return {
      data,
      error,
      isLoading,
    };
  }
