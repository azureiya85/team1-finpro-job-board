import useSWR from 'swr';
import { getSalaryTrends } from '@/lib/api/analytics/getSalaryTrends';
import { SalaryTrendChartData } from '@/types/analyticsTypes';


export function useSalaryTrendChart() {
  const { data, error, isLoading } = useSWR<SalaryTrendChartData>(
    ['salary-trends'],
    () => getSalaryTrends()
  );

  return {
    chartData: data,
    isLoading,
    isError: !!error,
  };
}
