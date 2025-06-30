import useSWR from 'swr';
import { InterestChartData } from '@/types/analyticsTypes';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useApplicantInterestChart() {
  const params = new URLSearchParams();

  const queryString = params.toString();
  const url = `/api/analytics/applicant-interests${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading } = useSWR<InterestChartData[]>(url, fetcher);

  return {
    data,
    error,
    isLoading,
  };
}
