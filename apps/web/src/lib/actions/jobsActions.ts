'use server';

import { getJobById } from '@/lib/jobsUtils';
import { getJobs } from '@/lib/jobsUtils';
import { JobPostingFeatured, GetJobsParams } from '@/types';

export async function fetchRelatedJobsAction(
  currentJobId: string,
  requiredCount: number = 3,
  limit: number = 5,
): Promise<JobPostingFeatured[]> {
  if (!currentJobId) {
    console.error('[ACTION_FETCH_RELATED] currentJobId is required.');
    return [];
  }

  const currentJob = await getJobById(currentJobId);
  if (!currentJob) {
    console.error(`[ACTION_FETCH_RELATED] Could not find current job with ID: ${currentJobId}`);
    return [];
  }

  const searchStrategies: GetJobsParams[] = [
    // Attempt 1: Highly relevant
    { 
      categories: [currentJob.category], 
      experienceLevels: currentJob.experienceLevel ? [currentJob.experienceLevel] : undefined,
      employmentTypes: currentJob.employmentType ? [currentJob.employmentType] : undefined,
    },
    // Attempt 2: Medium relevance
    {
      categories: [currentJob.category],
      experienceLevels: currentJob.experienceLevel ? [currentJob.experienceLevel] : undefined,
    },
    // Attempt 3: Broad relevance
    {
      categories: [currentJob.category],
    },
    // Attempt 4: Location-based
    {
      cityId: currentJob.cityId ?? undefined,
      provinceId: currentJob.provinceId ?? undefined,
    }
  ];

  for (const strategy of searchStrategies) {
    try {
      const jobsResult = await getJobs({
        ...strategy,
        take: limit + 1,
        includePagination: false,
      });

      const jobs = (Array.isArray(jobsResult) ? jobsResult : jobsResult.jobs) as JobPostingFeatured[];
      
      const filteredJobs = jobs
        .filter(job => job.id !== currentJobId)
        .slice(0, limit);

      if (filteredJobs.length >= requiredCount) {
        return filteredJobs;
      }
    } catch (error) {
        console.error(`[ACTION_FETCH_RELATED] Error during search strategy:`, strategy, error);
    }
  }

  console.warn(`[ACTION_FETCH_RELATED] Could not find suitably related jobs for ${currentJobId} after all attempts.`);
  return [];
}