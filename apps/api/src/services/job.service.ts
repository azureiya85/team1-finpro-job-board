import prisma from '@/lib/prisma';
import {
  JobPostingFeatured,
  GetJobsParams,
  GetJobsResult,
  SortByType,
} from 'src/types';
import { Prisma } from '@prisma/client';

// Helper function to ensure array format for enum fields
const ensureArray = (value: string | string[] | undefined): string[] | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.filter(v => v.trim().length > 0);
  return undefined;
};

// Helper function to build the where clause 
const buildWhereClause = (params: GetJobsParams): Prisma.JobPostingWhereInput => {
  const {
    jobTitle,
    locationQuery,
    companyQuery,
    companyLocationQuery, 
    categories,
    employmentTypes,
    experienceLevels,
    companySizes,
    isRemote,
    companyId,
    startDate,
    endDate,
  } = params;

  const where: Prisma.JobPostingWhereInput = {
    isActive: true, // Always filter for active jobs
    publishedAt: { not: null },
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
      { city: { is: { name: { contains: locationQuery, mode: 'insensitive' } } } },
      { province: { is: { name: { contains: locationQuery, mode: 'insensitive' } } } },
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

   let companyFilter: Prisma.CompanyWhereInput = {};
  
  if (companyQuery) {
    where.company = {
      is: {
        ...where.company?.is, 
        name: { contains: companyQuery, mode: 'insensitive' },
      },
    };
  }

   if (companyLocationQuery) {
    companyFilter.OR = [
      { city: { name: { contains: companyLocationQuery, mode: 'insensitive' } } },
      { province: { name: { contains: companyLocationQuery, mode: 'insensitive' } } },
    ];
  }

  // --- Filter Logic with proper array handling ---
  const categoriesArray = ensureArray(categories);
  if (categoriesArray && categoriesArray.length > 0) {
    where.category = { in: categoriesArray as any }; // Cast to satisfy Prisma types
  }

  const employmentTypesArray = ensureArray(employmentTypes);
  if (employmentTypesArray && employmentTypesArray.length > 0) {
    where.employmentType = { in: employmentTypesArray as any };
  }

  const experienceLevelsArray = ensureArray(experienceLevels);
  if (experienceLevelsArray && experienceLevelsArray.length > 0) {
    where.experienceLevel = { in: experienceLevelsArray as any };
  }

  if (typeof isRemote === 'boolean') {
    where.isRemote = isRemote;
  }

  const companySizesArray = ensureArray(companySizes);
  if (companySizesArray && companySizesArray.length > 0) {
    where.company = {
      is: {
        ...where.company?.is,
        size: { in: companySizesArray as any },
      },
    };
  }

    if (Object.keys(companyFilter).length > 0) {
    where.company = {
      is: companyFilter
    };
  }

  if (startDate || endDate) {
    where.publishedAt = {};
    if (startDate) {
      where.publishedAt.gte = new Date(startDate);
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.publishedAt.lte = endOfDay;
    }
  }

  if (companyId) {
    where.companyId = companyId;
  }

  return where;
};

const buildOrderByClause = (sortBy?: SortByType): Prisma.JobPostingOrderByWithRelationInput[] => {
  const defaultSort: Prisma.JobPostingOrderByWithRelationInput[] = [
    { isPriority: 'desc' },
    { publishedAt: 'desc' },
    { createdAt: 'desc' },
  ];
  
  switch (sortBy) {
    case 'oldest':
      return [
        { isPriority: 'desc' },
        { publishedAt: 'asc' },
        { createdAt: 'asc' },
      ];
    case 'company_asc':
      return [
        { company: { name: 'asc' } },
        { isPriority: 'desc' },
        { publishedAt: 'desc' },
      ];
    case 'company_desc':
      return [
        { company: { name: 'desc' } },
        { isPriority: 'desc' },
        { publishedAt: 'desc' },
      ];
    case 'newest':
    default:
      return defaultSort;
  }
};

export async function fetchJobs(params: GetJobsParams = {}): Promise<JobPostingFeatured[] | GetJobsResult> {
  const takeParam = params.take !== undefined ? parseInt(String(params.take), 10) : 3000;
  const skipParam = params.skip !== undefined ? parseInt(String(params.skip), 10) : 0;

   let includePaginationParam: boolean;
  if (typeof params.includePagination === 'string') {
    includePaginationParam = params.includePagination.toLowerCase() === 'true';
  } else if (typeof params.includePagination === 'boolean') {
    includePaginationParam = params.includePagination;
  } else {
    includePaginationParam = true;
  }

  const orderBy = buildOrderByClause(params.sortBy);
  const where = buildWhereClause(params);

  try {
    if (includePaginationParam) {
      const [jobs, totalCount] = await prisma.$transaction([
        prisma.jobPosting.findMany({
          where,
          orderBy: orderBy, 
          take: takeParam, 
          skip: skipParam, 
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
            _count: { select: { applications: true } },
          },
        }),
        prisma.jobPosting.count({ where }),
      ]);

      return {
        jobs: jobs as JobPostingFeatured[],
        pagination: {
          total: totalCount,
          page: takeParam > 0 ? Math.floor(skipParam / takeParam) + 1 : 1,
          totalPages: takeParam > 0 ? Math.ceil(totalCount / takeParam) : (totalCount > 0 ? 1: 0) ,
          hasNext: skipParam + takeParam < totalCount,
          hasPrev: skipParam > 0,
        },
      };
    } else {
      const jobs = await prisma.jobPosting.findMany({
        where,
        orderBy: orderBy,
        take: takeParam, 
        skip: skipParam,
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
            // _count : Maybe?
        },
      });
      return jobs as JobPostingFeatured[];
    }
  } catch (error) {
    console.error("Service: Failed to fetch jobs with filters:", error);
    if (error instanceof Error) {
        throw new Error(`Database error while fetching jobs: ${error.message}`);
    }
    throw new Error("Failed to fetch jobs from database due to an unknown error.");
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
          select: { id: true, name: true, logo: true, size: true, description: true, industry: true }, 
        },
        city: { select: { id: true, name: true } },
        province: { select: { id: true, name: true } },
        _count: { select: { applications: true } }, 
      },
    });
    return job as JobPostingFeatured | null;
  } catch (error) {
    console.error(`Service: Failed to fetch job with ID ${id}:`, error);
    if (error instanceof Error) {
        throw new Error(`Database error while fetching job ${id}: ${error.message}`);
    }
    throw new Error(`Failed to fetch job ${id} from database.`);
  }
}

// Specific function for latest featured jobs
export async function fetchLatestFeaturedJobs(count: number = 5): Promise<JobPostingFeatured[]> {
  const result = await fetchJobs({
    take: count,
    sortBy: 'newest',
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