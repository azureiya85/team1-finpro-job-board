import useSWR from 'swr';
import { getDemographics } from '@/lib/api/analytics/getGenderDemographics';

interface LocationParam {
  location: { id: string; name: string } | 'all';
  dateRange: { start: Date; end: Date } | null;
}

export function useGenderDemographicChart({ location, dateRange }: LocationParam) {
  const locationId = typeof location === 'object' ? location.id : 'all';

  const params = {
    location: locationId,
    start: dateRange?.start.toISOString(),
    end: dateRange?.end.toISOString(),
  };

  const { data, error, isLoading } = useSWR(
    ['demographics', params],
    () => getDemographics(params),
  );

  return {
    data,
    error,
    isLoading,
  };
}
