export async function getApplicationsPerJob() {
    const res = await fetch('/api/analytics/applications');
    if (!res.ok) throw new Error('Failed to fetch applications per job');
    return res.json();
  }
  