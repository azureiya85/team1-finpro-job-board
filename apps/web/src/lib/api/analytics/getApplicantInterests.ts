interface ApplicantInterestParams {
    location: string;
    start?: string;
    end?: string;
  }
  
  export async function getApplicantInterests(params: ApplicantInterestParams) {
    const query = new URLSearchParams();
  
    if (params.location && params.location !== 'all') {
      query.append('location', params.location);
    }
  
    if (params.start) query.append('start', params.start);
    if (params.end) query.append('end', params.end);
  
    const res = await fetch(`/api/analytics/applicant-interests?${query.toString()}`);
  
    if (!res.ok) {
      throw new Error('Failed to fetch applicant interests');
    }
  
    const raw = await res.json();
  
    return {
      labels: raw.map((item: any) => item.category),
      values: raw.map((item: any) => item.count),
    };
  }
  