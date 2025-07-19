import { NextRequest, NextResponse } from 'next/server';
import { fetchRelatedJobsAction } from '@/lib/actions/jobsActions';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId query parameter' }, { status: 400 });
  }

  try {
    const relatedJobs = await fetchRelatedJobsAction(jobId);

    return NextResponse.json(relatedJobs);

  } catch (error) {
    console.error(`[API_RELATED_JOBS] Failed to fetch related jobs for ID ${jobId}:`, error);
    return NextResponse.json({ error: 'An internal error occurred while fetching related jobs.' }, { status: 500 });
  }
}