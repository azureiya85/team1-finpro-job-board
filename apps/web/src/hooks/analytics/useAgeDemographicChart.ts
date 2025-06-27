import useSWR from 'swr';
import { getAgeDemographics } from '@/lib/api/analytics/getAgeDemographics';
import { AgeDemographicData } from '@/types/analyticsTypes';

export function useAgeDemographicChart() {
  const { data, error, isLoading } = useSWR<AgeDemographicData[]>(
    'age-demographics',
    getAgeDemographics
  );

  return {
    data,
    error,
    isLoading,
  };
}
