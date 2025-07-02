import useSWR from 'swr';
import { getApplicationsPerJob } from '@/lib/api/analytics/getApplicationsPerJob';

export function useApplicationsPerJobChart() {
  const { data, error, isLoading } = useSWR(
    ['applications'],
    () => getApplicationsPerJob(),
  );

  return {
    data,
    error,
    isLoading,
  };
}
