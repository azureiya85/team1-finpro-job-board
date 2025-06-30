import { AgeDemographicData } from '@/types/analyticsTypes';

export async function getAgeDemographics(): Promise<AgeDemographicData[]> {
  const query = new URLSearchParams();

  const res = await fetch(`/api/analytics/demographics/age-demographics?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch age demographics');
  return res.json();
}