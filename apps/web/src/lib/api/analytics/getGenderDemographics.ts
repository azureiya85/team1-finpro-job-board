interface DemographicsParams {
  location: string;
  start?: string;
  end?: string;
}

export async function getDemographics(params: DemographicsParams) {
  const query = new URLSearchParams();

  if (params.location && params.location !== 'all') {
    query.append('location', params.location);
  }

  if (params.start) query.append('start', params.start);
  if (params.end) query.append('end', params.end);

  // Mengubah endpoint ke path yang benar
  const res = await fetch(`/api/analytics/demographics/gender-demographics?${query.toString()}`);

  if (!res.ok) {
    throw new Error('Failed to fetch demographic data');
  }

  const raw = await res.json();

  return {
    labels: raw.map((item: any) => item.label),
    values: raw.map((item: any) => item.count),
  };
}