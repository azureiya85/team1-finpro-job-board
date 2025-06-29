interface SalaryTrendParams {
  location: string;
  start?: string;
  end?: string;
}

export async function getSalaryTrends(params: SalaryTrendParams) {
  const query = new URLSearchParams();

  if (params.location && params.location !== 'all') {
    query.append('location', params.location);
  }

  if (params.start) query.append('start', params.start);
  if (params.end) query.append('end', params.end);

  const res = await fetch(`/api/analytics/salary-trends?${query.toString()}`);

  if (!res.ok) {
    throw new Error('Failed to fetch salary trends');
  }

  const data = await res.json();
  return data; // API sudah mengembalikan format yang sesuai {labels, values}
}