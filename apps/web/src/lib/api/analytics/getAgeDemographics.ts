import { AgeDemographicData } from '@/types/analyticsTypes';

interface DemographicsParams {
  location: string;
  start?: string;
  end?: string;
}

export async function getAgeDemographics(params: DemographicsParams): Promise<AgeDemographicData[]> {
  const query = new URLSearchParams();

  if (params.location && params.location !== 'all') {
    query.append('location', params.location);
  }

  if (params.start) query.append('start', params.start);
  if (params.end) query.append('end', params.end);

  const res = await fetch(`/api/analytics/demographics/age-demographics?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch age demographics');
  return res.json();
}