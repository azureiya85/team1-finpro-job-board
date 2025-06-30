import useSWR from 'swr';
import { getLocationMapData } from '@/lib/api/analytics/getLocationMapData';
import { LocationFilter } from '@/types/analyticsTypes';
import { MapData } from '@/types/analyticsTypes';

export function useLocationMapData(filters: LocationFilter) {
    const { data, error, isLoading } = useSWR<MapData[]>(['location-map', filters], () =>
      getLocationMapData(filters)
    );
  
    return {
      data,
      error,
      isLoading,
    };
  }
