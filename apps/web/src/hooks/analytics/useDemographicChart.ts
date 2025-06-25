// hooks/analytics/useDemographicChart.ts
import useSWR from 'swr';
import { getDemographics } from '@/lib/api/analytics/getDemographics';

export function useDemographicChart({ location, dateRange }: {
  location: string;
  dateRange: { start: Date; end: Date } | null;
}) {
  const params = {
    location,
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
