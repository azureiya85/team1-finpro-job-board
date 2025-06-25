import prisma from '@/lib/prisma';
import {
  JobPostingFeatured, 
} from '@/types'; 
import { Prisma, JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@prisma/client';

// Define the structure for search and filter parameters
export interface GetJobsParams {
  take?: number;
  skip?: number;
  orderBy?: Prisma.JobPostingOrderByWithRelationInput | Prisma.JobPostingOrderByWithRelationInput[];
  
  // Search Parameters
  jobTitle?: string; 
  
  // Location Parameters (choose one strategy)
  locationQuery?: string; // Text search for city/province name
  userLatitude?: number;  // User's current latitude
  userLongitude?: number; // User's current longitude
  radiusKm?: number;      // Search radius in km
  cityId?: string;        // Specific city ID
  provinceId?: string;    // Specific province ID

  // Filter Parameters
  categories?: JobCategory[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  companySizes?: CompanySize[]; 
  isRemote?: boolean;
  companyId?: string; // Filter by specific company
  
  // Response options
  includePagination?: boolean; 
}

// Return type for paginated results
export interface GetJobsResult {
  jobs: JobPostingFeatured[]; 
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Helper to convert degrees to radians
const toRadians = (degrees: number): number => degrees * Math.PI / 180;

// Helper to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper to calculate bounding box (more generous bounds)
const getBoundingBox = (latitude: number, longitude: number, radiusKm: number) => {
  const R = 6371; 

  // Add some padding to the bounding box to ensure we don't miss edge cases
  const paddedRadius = radiusKm * 1.2; // 20% padding

  // Latitude
  const latDelta = paddedRadius / R * (180 / Math.PI);
  const minLat = latitude - latDelta;
  const maxLat = latitude + latDelta;

  // Longitude
  const lonDelta = paddedRadius / (R * Math.cos(toRadians(latitude))) * (180 / Math.PI);
  const minLon = longitude - lonDelta;
  const maxLon = longitude + lonDelta;
  
  return { minLat, maxLat, minLon, maxLon };
};

// Helper function to build the where clause
const buildWhereClause = (params: GetJobsParams): Prisma.JobPostingWhereInput => {
  const {
    jobTitle,
    // Location params
    locationQuery,
    userLatitude,
    userLongitude,
    radiusKm = 25, 
    cityId,
    provinceId,
    // Filters
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

  const andConditions: Prisma.JobPostingWhereInput[] = [];

  // --- Location Logic ---
  // Priority: 1. Coordinates, 2. City/Province ID, 3. Text Query
  if (userLatitude !== undefined && userLongitude !== undefined) {
    // Use bounding box for initial filtering (more efficient)
    const { minLat, maxLat, minLon, maxLon } = getBoundingBox(userLatitude, userLongitude, radiusKm);
    andConditions.push({
      AND: [
        { latitude: { gte: minLat, lte: maxLat } },
        { longitude: { gte: minLon, lte: maxLon } },
        { latitude: { not: null } },
        { longitude: { not: null } }
      ]
    });
  } else if (cityId) {
    andConditions.push({ cityId: cityId });
  } else if (provinceId) {
    andConditions.push({ provinceId: provinceId });
  } else if (locationQuery) {
    andConditions.push({
      OR: [
        { city: { is: { name: { contains: locationQuery, mode: 'insensitive' } } } },
        { province: { is: { name: { contains: locationQuery, mode: 'insensitive' } } } },
      ],
    });
  }
  
  // --- Search Logic for Job Title (always ANDed if present) ---
  if (jobTitle) {
    andConditions.push({
      OR: [
        { title: { contains: jobTitle, mode: 'insensitive' } },
        { description: { contains: jobTitle, mode: 'insensitive' } },
        { tags: { has: jobTitle } }
      ],
    });
  }

  // --- Filter Logic (all ANDed) ---
  if (categories && categories.length > 0) {
    andConditions.push({ category: { in: categories } });
  }

  if (employmentTypes && employmentTypes.length > 0) {
    andConditions.push({ employmentType: { in: employmentTypes } });
  }

  if (experienceLevels && experienceLevels.length > 0) {
    andConditions.push({ experienceLevel: { in: experienceLevels } });
  }
  
  if (typeof isRemote === 'boolean') {
    andConditions.push({ isRemote: isRemote });
  }

  if (companySizes && companySizes.length > 0) {
    andConditions.push({
      company: {
        is: {
          size: { in: companySizes },
        },
      },
    });
  }

  if (companyId) {
    andConditions.push({ companyId: companyId });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
};

export async function getJobs(params: GetJobsParams = {}): Promise<JobPostingFeatured[] | GetJobsResult> {
  const {
    take = 10,
    skip = 0,
    orderBy,
    includePagination = false,
    userLatitude,
    userLongitude,
    radiusKm = 25,
  } = params;

  const effectiveOrderBy = orderBy || [{ isPriority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];

  const where = buildWhereClause(params);

  // Common select fields
  const selectFields = {
    id: true,
    title: true,
    description: true,      
    employmentType: true,
    experienceLevel: true,   
    category: true,          
    isRemote: true,
    latitude: true,
    longitude: true,
    createdAt: true,
    publishedAt: true,
    salaryMin: true,
    salaryMax: true,
    salaryCurrency: true,
    isPriority: true,
    tags: true,              
    company: {
      select: {
        id: true,
        name: true,
        logo: true,
        size: true,
        industry: true,
      },
    },
    city: {
      select: {
        id: true,
        name: true,
      },
    },
    province: {
      select: {
        id: true,
        name: true,
      },
    },
    requirements: true, 
    benefits: true,
    _count: { 
      select: {
        applications: true,
      },
    },
  };

  try {
    if (includePagination) {
      const [jobs, totalCount] = await Promise.all([
        prisma.jobPosting.findMany({
          where,
          orderBy: effectiveOrderBy,
          take: userLatitude !== undefined && userLongitude !== undefined ? take * 3 : take, // Get more jobs for distance filtering
          skip,
          select: selectFields,
        }),
        prisma.jobPosting.count({ where }),
      ]);

      let filteredJobs = jobs;

      // Apply distance filtering if coordinates are provided
      if (userLatitude !== undefined && userLongitude !== undefined) {
        filteredJobs = jobs
          .filter(job => job.latitude !== null && job.longitude !== null)
          .map(job => ({
            ...job,
            distance: calculateDistance(userLatitude, userLongitude, job.latitude!, job.longitude!)
          }))
          .filter(job => job.distance <= radiusKm)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, take);

        console.log(`Found ${jobs.length} jobs in bounding box, ${filteredJobs.length} within ${radiusKm}km radius`);
      }

      return {
        jobs: filteredJobs as unknown as JobPostingFeatured[],
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
        take: userLatitude !== undefined && userLongitude !== undefined ? take * 3 : take, // Get more jobs for distance filtering
        skip,
        select: selectFields,
      });

      let filteredJobs = jobs;

      // Apply distance filtering if coordinates are provided
      if (userLatitude !== undefined && userLongitude !== undefined) {
        filteredJobs = jobs
          .filter(job => job.latitude !== null && job.longitude !== null)
          .map(job => ({
            ...job,
            distance: calculateDistance(userLatitude, userLongitude, job.latitude!, job.longitude!)
          }))
          .filter(job => job.distance <= radiusKm)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, take);

        console.log(`Found ${jobs.length} jobs in bounding box, ${filteredJobs.length} within ${radiusKm}km radius`);
        console.log('User coordinates:', { userLatitude, userLongitude });
        console.log('Sample job coordinates:', jobs.slice(0, 3).map(job => ({ 
          id: job.id, 
          title: job.title,
          lat: job.latitude, 
          lon: job.longitude,
          distance: job.latitude && job.longitude ? calculateDistance(userLatitude, userLongitude, job.latitude, job.longitude) : null
        })));
      }

      return filteredJobs as unknown as JobPostingFeatured[];
    }
  } catch (error) {
    console.error("Failed to fetch jobs with filters:", error);
    if (includePagination) {
      return {
        jobs: [],
        pagination: {
          total: 0,
          page: 1,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
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