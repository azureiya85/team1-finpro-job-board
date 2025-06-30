export async function getSalaryTrends() {
  const query = new URLSearchParams();

  const res = await fetch(`/api/analytics/salary-trends?${query.toString()}`);

  if (!res.ok) {
    throw new Error('Failed to fetch salary trends');
  }

  const data = await res.json();
  return data;
}