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
  
    const raw = await res.json();
  
    return {
      labels: raw.map((item: any) => item.month),     
      values: raw.map((item: any) => item.avgSalary), 
    };
  }
  