import useSWR from 'swr';
import { InterestChartData } from '@/types/analyticsTypes';

interface Filters {
  start?: Date;
  end?: Date;
  location?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useApplicantInterestChart(
  companyId?: string,
  filters?: Filters
) {
  const params = new URLSearchParams();

  if (filters?.start) params.append('start', filters.start.toISOString());
  if (filters?.end) params.append('end', filters.end.toISOString());
  if (filters?.location) params.append('location', filters.location);

  const queryString = params.toString();
  const url = companyId
    ? `/api/analytics/${companyId}/applicant-interests${queryString ? `?${queryString}` : ''}`
    : null;

  const { data, error, isLoading } = useSWR<InterestChartData[]>(url, fetcher);

  return {
    data,
    error,
    isLoading,
  };
}
