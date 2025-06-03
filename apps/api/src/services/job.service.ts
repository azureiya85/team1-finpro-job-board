import prisma from '@/lib/prisma';
import {
  JobPostingFeatured,
  GetJobsParams,
  GetJobsResult,
} from 'src/types';
import { Prisma,  } from '@prisma/client';

// Helper function to build the where clause 
const buildWhereClause = (params: GetJobsParams): Prisma.JobPostingWhereInput => {
  const {
    jobTitle,
    locationQuery,
    categories,
    employmentTypes,
    experienceLevels,
    companySizes,
    isRemote,
    companyId,
  } = params;

  const where: Prisma.JobPostingWhereInput = {
    isActive: true, // Always filter for active jobs
  };

  // --- Search Logic ---
  if (jobTitle) {
    where.OR = [
      { title: { contains: jobTitle, mode: 'insensitive' } },
      { description: { contains: jobTitle, mode: 'insensitive' } },
    ];
  }

  if (locationQuery) {
    const locationConditions: Prisma.JobPostingWhereInput[] = [
      {
        city: {
          is: {
            name: { contains: locationQuery, mode: 'insensitive' },
          },
        },
      },
      {
        province: {
          is: {
            name: { contains: locationQuery, mode: 'insensitive' },
          },
        },
      },
    ];

    if (where.OR) {
      where.AND = [
        { OR: where.OR },
        { OR: locationConditions },
      ];
      delete where.OR; 
    } else {
      where.OR = locationConditions;
    }
  }

  // --- Filter Logic ---
  if (categories && categories.length > 0) {
    where.category = { in: categories };
  }

  if (employmentTypes && employmentTypes.length > 0) {
    where.employmentType = { in: employmentTypes };
  }

  if (experienceLevels && experienceLevels.length > 0) {
    where.experienceLevel = { in: experienceLevels };
  }

  if (typeof isRemote === 'boolean') {
    where.isRemote = isRemote;
  }

  if (companySizes && companySizes.length > 0) {
    where.company = {
      is: {
        size: { in: companySizes },
      },
    };
  }

  if (companyId) {
    where.companyId = companyId;
  }

  return where;
};


export async function fetchJobs(params: GetJobsParams = {}): Promise<JobPostingFeatured[] | GetJobsResult> {
  const {
    take = 3000, 
    skip = 0,
    orderBy,
    includePagination = false, 
  } = params;

  const effectiveOrderBy = orderBy || [{ isPriority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
  const where = buildWhereClause(params);

  try {
    if (includePagination) {
      const [jobs, totalCount] = await prisma.$transaction([
        prisma.jobPosting.findMany({
          where,
          orderBy: effectiveOrderBy,
          take,
          skip,
          select: {
            id: true, title: true, description: true, employmentType: true,
            experienceLevel: true, category: true, isRemote: true, createdAt: true,
            publishedAt: true, salaryMin: true, salaryMax: true, salaryCurrency: true,
            isPriority: true, tags: true, requirements: true, benefits: true,
            applicationDeadline: true, // Added from single job fetch
            company: {
              select: { id: true, name: true, logo: true, size: true, industry: true },
            },
            city: { select: { id: true, name: true } },
            province: { select: { id: true, name: true } },
            _count: { select: { applications: true } },
          },
        }),
        prisma.jobPosting.count({ where }),
      ]);

      return {
        jobs: jobs as JobPostingFeatured[], 
        pagination: {
          total: totalCount,
          page: Math.floor(skip / take) + 1,
          totalPages: Math.ceil(totalCount / take),
          hasNext: skip + take < totalCount,
          hasPrev: skip > 0,
        },
      };
    } else {
      const jobs = await prisma.jobPosting.findMany({
        where,
        orderBy: effectiveOrderBy,
        take,
        skip,
        select: { 
            id: true, title: true, description: true, employmentType: true,
            experienceLevel: true, category: true, isRemote: true, createdAt: true,
            publishedAt: true, salaryMin: true, salaryMax: true, salaryCurrency: true,
            isPriority: true, tags: true, requirements: true, benefits: true,
            applicationDeadline: true,
            company: {
              select: { id: true, name: true, logo: true, size: true, industry: true },
            },
            city: { select: { id: true, name: true } },
            province: { select: { id: true, name: true } },
        },
      });
      return jobs as JobPostingFeatured[];
    }
  } catch (error) {
    console.error("Service: Failed to fetch jobs with filters:", error);
    throw new Error("Failed to fetch jobs from database.");
  }
}

export async function fetchJobById(id: string): Promise<JobPostingFeatured | null> {
  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id, isActive: true },
      select: {
        id: true, title: true, description: true, employmentType: true,
        experienceLevel: true, category: true, isRemote: true, createdAt: true,
        publishedAt: true, salaryMin: true, salaryMax: true, salaryCurrency: true,
        isPriority: true, tags: true, requirements: true, benefits: true,
        applicationDeadline: true,
        company: {
          select: { id: true, name: true, logo: true, size: true, description: true }, 
        },
        city: { select: { id: true, name: true } },
        province: { select: { id: true, name: true } },
      },
    });
    return job as JobPostingFeatured | null; 
  } catch (error) {
    console.error(`Service: Failed to fetch job with ID ${id}:`, error);
    throw new Error("Failed to fetch job from database.");
  }
}


// Specific function for latest featured jobs
export async function fetchLatestFeaturedJobs(count: number = 5): Promise<JobPostingFeatured[]> {
  const result = await fetchJobs({
    take: count,
    orderBy: [{ isPriority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    includePagination: false,
  });
  return result as JobPostingFeatured[];
}

// Utility function specifically for company job listings with pagination
export async function fetchCompanyJobs(
  companyId: string,
  params: Omit<GetJobsParams, 'companyId' | 'includePagination'> = {} 
): Promise<GetJobsResult> {
  const result = await fetchJobs({
    ...params,
    companyId,
    includePagination: true, 
  });
  return result as GetJobsResult;
}