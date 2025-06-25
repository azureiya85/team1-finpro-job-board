import useSWR from 'swr';
import { WebsiteAnalytics } from '@prisma/client';
import { getAnalyticsSummary } from '@/lib/api/analytics/getAnalyticsSummary';

export function useAnalyticsSummary(companyId: string) {
  const { data, error, isLoading } = useSWR(
    ['analytics-summary', companyId],
    () => getAnalyticsSummary(companyId)
  );

  return {
    current: data?.current as WebsiteAnalytics,
    previous: data?.previous as WebsiteAnalytics,
    isLoading,
    error,
  };
}
