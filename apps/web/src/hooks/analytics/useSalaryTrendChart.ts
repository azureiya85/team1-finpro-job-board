import useSWR from 'swr';
import { getSalaryTrends } from '@/lib/api/analytics/getSalaryTrends';
import { SalaryTrendChartData } from '@/types/analyticsTypes';

interface Params {
  location: { id: string; name: string } | 'all';
  start?: Date;
  end?: Date;
}

export function useSalaryTrendChart({ location, start, end }: Params) {
  const locationId = typeof location === 'object' ? location.id : 'all';

  const startStr = start?.toISOString().split('T')[0];
  const endStr = end?.toISOString().split('T')[0];

  const { data, error, isLoading } = useSWR<SalaryTrendChartData>(
    ['salary-trends', locationId, startStr, endStr],
    () => getSalaryTrends({ location: locationId, start: startStr, end: endStr })
  );

  return {
    chartData: data,
    isLoading,
    isError: !!error,
  };
}
