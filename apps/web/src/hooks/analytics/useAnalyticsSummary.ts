import useSWR from 'swr';
import { WebsiteAnalytics } from '@prisma/client';
import { getAnalyticsSummary } from '@/lib/api/analytics/getAnalyticsSummary';

export function useAnalyticsSummary() {
  const { data, error, isLoading } = useSWR(
    'analytics-summary',
    () => getAnalyticsSummary()
  );

  return {
    current: data?.current as WebsiteAnalytics,
    previous: data?.previous as WebsiteAnalytics,
    isLoading,
    error,
  };
}
