import { DemographicItem } from '@/types/analyticsTypes';

export async function getDemographics() {
  const query = new URLSearchParams();

  const res = await fetch(`/api/analytics/demographics/gender-demographics?${query.toString()}`);

  if (!res.ok) {
    throw new Error('Failed to fetch demographic data');
  }

  const raw = await res.json();

  return {
    labels: raw.map((item: DemographicItem) => item.label),
    values: raw.map((item: DemographicItem) => item.count),
  };
}