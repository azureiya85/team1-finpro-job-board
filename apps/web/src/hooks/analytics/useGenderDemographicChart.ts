import useSWR from 'swr';
import { getDemographics } from '@/lib/api/analytics/getGenderDemographics';


export function useGenderDemographicChart() {

  const { data, error, isLoading } = useSWR(
    ['demographics'],
    () => getDemographics(),
  );

  return {
    data,
    error,
    isLoading,
  };
}
