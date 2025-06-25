import useSWR from 'swr';
import { getSalaryTrends } from '@/lib/api/analytics/getSalaryTrends';
import { SalaryTrendChartData } from '@/types/analyticsTypes';

interface Params {
  location: string;
  start?: Date;
  end?: Date;
}

export function useSalaryTrendChart({ location, start, end }: Params) {
  const startStr = start?.toISOString().split('T')[0]; // format yyyy-mm-dd
  const endStr = end?.toISOString().split('T')[0];

  const { data, error, isLoading } = useSWR<SalaryTrendChartData>(
    ['salary-trends', location, startStr, endStr],
    () => getSalaryTrends({ location, start: startStr, end: endStr })
  );

  return {
    chartData: data,
    isLoading,
    isError: !!error,
  };
}
