import prisma from '@/lib/prisma';
import { JobPostingForRelatedSearch, JobPostingFeatured } from '@/types';
import type { GetJobsParams, GetJobsResult } from '@/types/jobs';
import { buildWhereClause, calculateDistance } from './JobQueryHelpers';

export async function getJobById(id: string): Promise<JobPostingForRelatedSearch | null> {
  if (!id) return null;

  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id: id },
      include: { // Include is perfect here as it gets all fields
        company: {
          select: { id: true } 
        },
      },
    });
    return job as JobPostingForRelatedSearch | null;
  } catch (error) {
    console.error(`[UTIL_GET_JOB_BY_ID] Failed to fetch job ${id}:`, error);
    return null; // Return null on error
  }
}

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

export async function getRelatedJobs(
  currentJob: JobPostingForRelatedSearch,
  count: number = 5
): Promise<JobPostingFeatured[]> {
  if (!currentJob) {
    return [];
  }

  // Destructure properties from the full job object
  const { id: excludeId, category, company, cityId, provinceId } = currentJob;

  try {
    const relatedJobs = await prisma.jobPosting.findMany({
      where: {
        id: { not: excludeId },
        isActive: true,
        publishedAt: { not: null },
        OR: [
          { category: { equals: category } },
          { cityId: { equals: cityId, not: null } },
          { provinceId: { equals: provinceId, not: null } },
          { companyId: { equals: company?.id } }, 
        ],
      },
      orderBy: [
        { isPriority: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: count,
      select: {
        id: true,
        title: true,
        company: {
          select: { id: true, name: true, logo: true, size: true },
        },
        city: {
          select: { id: true, name: true },
        },
        province: {
          select: { id: true, name: true },
        },
        description: true,
        employmentType: true,
        experienceLevel: true,
        isRemote: true,
        createdAt: true,
        publishedAt: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        isPriority: true,
        tags: true,
        benefits: true,
        requirements: true,
        applicationDeadline: true,
        requiresCoverLetter: true,
        preSelectionTestId: true,
        latitude: true,
        longitude: true,
      },
    });

    return relatedJobs as JobPostingFeatured[];
  } catch (error) {
    console.error(`[UTIL_GET_RELATED_JOBS] Failed to fetch related jobs for ${excludeId}:`, error);
    return [];
  }
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