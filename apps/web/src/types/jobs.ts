import { Prisma, JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@prisma/client';
import { JobPostingFeatured } from '@/types'; // Assuming this is another type definition file

// Define the structure for search and filter parameters
export interface GetJobsParams {
  take?: number;
  skip?: number;
  orderBy?: Prisma.JobPostingOrderByWithRelationInput | Prisma.JobPostingOrderByWithRelationInput[];
  
  // Search Parameters
  jobTitle?: string; 
  
  // Location Parameters
  locationQuery?: string;
  userLatitude?: number;
  userLongitude?: number;
  radiusKm?: number;
  cityId?: string;
  provinceId?: string;

  // Filter Parameters
  categories?: JobCategory[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  companySizes?: CompanySize[]; 
  isRemote?: boolean;
  companyId?: string;
  
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