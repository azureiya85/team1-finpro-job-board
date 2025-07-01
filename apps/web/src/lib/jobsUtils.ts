import prisma from '@/lib/prisma';
import { JobPostingFeatured } from '@/types'; 
import type { GetJobsParams, GetJobsResult } from '@/types/jobs';
import { buildWhereClause, calculateDistance } from './JobQueryHelpers';

// The main data fetching function
export async function getJobs(params: GetJobsParams = {}): Promise<JobPostingFeatured[] | GetJobsResult> {
  const {
    take = 10, skip = 0, orderBy, includePagination = false,
    userLatitude, userLongitude, radiusKm = 25,
  } = params;

  const effectiveOrderBy = orderBy || [{ isPriority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
  const where = buildWhereClause(params);

  const selectFields = {
    id: true, title: true, description: true, employmentType: true, experienceLevel: true, category: true, isRemote: true,
    latitude: true, longitude: true, createdAt: true, publishedAt: true, salaryMin: true, salaryMax: true, salaryCurrency: true,
    isPriority: true, tags: true, requirements: true, benefits: true,
    company: { select: { id: true, name: true, logo: true, size: true, industry: true } },
    city: { select: { id: true, name: true } },
    province: { select: { id: true, name: true } },
    _count: { select: { applications: true } },
  };

  try {
    const needsDistanceFilter = userLatitude !== undefined && userLongitude !== undefined;
    const effectiveTake = needsDistanceFilter ? take * 3 : take;

    if (includePagination) {
      const [jobs, totalCount] = await Promise.all([
        prisma.jobPosting.findMany({ where, orderBy: effectiveOrderBy, take: effectiveTake, skip, select: selectFields }),
        prisma.jobPosting.count({ where }),
      ]);

      const filteredJobs = needsDistanceFilter
        ? jobs
            .filter(j => j.latitude != null && j.longitude != null)
            .map(j => ({ ...j, distance: calculateDistance(userLatitude, userLongitude, j.latitude!, j.longitude!) }))
            .filter(j => j.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, take)
        : jobs;

      return {
        jobs: filteredJobs as unknown as JobPostingFeatured[],
        pagination: { total: totalCount, page: Math.floor(skip / take) + 1, totalPages: Math.ceil(totalCount / take), hasNext: skip + take < totalCount, hasPrev: skip > 0 },
      };
    } else {
      const jobs = await prisma.jobPosting.findMany({ where, orderBy: effectiveOrderBy, take: effectiveTake, skip, select: selectFields });

      const filteredJobs = needsDistanceFilter
        ? jobs
            .filter(j => j.latitude != null && j.longitude != null)
            .map(j => ({ ...j, distance: calculateDistance(userLatitude, userLongitude, j.latitude!, j.longitude!) }))
            .filter(j => j.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, take)
        : jobs;

      return filteredJobs as unknown as JobPostingFeatured[];
    }
  } catch (error) {
    console.error("Failed to fetch jobs with filters:", error);
    if (includePagination) {
      return { jobs: [], pagination: { total: 0, page: 1, totalPages: 0, hasNext: false, hasPrev: false } };
    }
    return [];
  }
}

// Specific function for latest featured jobs 
export async function getLatestFeaturedJobs(count: number = 5): Promise<JobPostingFeatured[]> {
  const result = await getJobs({
    take: count,
    orderBy: [{ isPriority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    includePagination: false,
  });
  return result as JobPostingFeatured[];
}

// Utility function specifically for company job listings with pagination
export async function getCompanyJobs(
  companyId: string, 
  params: Omit<GetJobsParams, 'companyId' | 'userLatitude' | 'userLongitude' | 'radiusKm' | 'locationQuery' | 'cityId' | 'provinceId'> = {}
): Promise<GetJobsResult> {
  const result = await getJobs({
    ...params,
    companyId,
    includePagination: true,
  });
  return result as GetJobsResult;
}