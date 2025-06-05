import { JobPosting, Company, City, Province, EmploymentType, ExperienceLevel, JobCategory, CompanySize, Prisma } from '@prisma/client';

// ============================================================================
// JOB POSTING TYPES
// ============================================================================

export type JobPostingFeatured = Pick<
  JobPosting,
  | 'id'
  | 'title'
  | 'description'       
  | 'employmentType'
  | 'experienceLevel'   
  | 'category'          
  | 'isRemote'
  | 'createdAt'
  | 'publishedAt'
  | 'salaryMin'
  | 'salaryMax'
  | 'salaryCurrency'
  | 'isPriority'
  | 'tags'  
  | 'benefits' 
  | 'requirements' 
  | 'applicationDeadline'
  | 'requiresCoverLetter'              
> & {
  company: Pick<Company, 'id' | 'name' | 'logo' | 'size'> | null;
  city: Pick<City, 'name'> | null;
  province: Pick<Province, 'name'> | null;
};


export type JobCompanyInfoForStore = Pick<Company, 'id' | 'name' | 'logo' | 'size'>;

export type JobPostingDetailed = JobPosting & {
  company: Company | null;
  city: City | null;
  province: Province | null;
};

// Company info for job postings
export interface JobCompanyInfo {
  id: string;
  name: string;
  logo?: string | null;
  adminId: string;
}

// Extended JobPosting interface for stores - used across different stores
export interface JobPostingInStore {
  id: string;
  title: string;
  description: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  category: JobCategory;
  isRemote: boolean;
  createdAt: Date;
  publishedAt: Date | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  isPriority: boolean;
  tags: string[];
  requirements: string[];
  benefits: string[];
  applicationDeadline: Date | null;
  requiresCoverLetter: boolean;
  banner: string | null;
  isActive: boolean;
  updatedAt: Date;
  latitude: number | null;      
  longitude: number | null;    
  country: string;              

  // Foreign keys
  companyId: string;
  cityId: string | null;
  provinceId: string | null;
  preSelectionTestId: string | null;

  // Custom/Derived fields
  workType: string;
  location?: string;

  // Aligned relational data 
  company: JobCompanyInfoForStore | null;
  city: Pick<City, 'id' | 'name' | 'type'> | null;
  province: Pick<Province, 'id' | 'name' | 'code'> | null;

  _count?: {
    applications: number;
  };
}



// Alias for JobManagementStore compatibility
export type JobPostingWithApplicantCount = JobPostingInStore;

// ============================================================================
// SEARCH AND FILTER TYPES
// ============================================================================

export interface JobPostingSearchAndFilterParams {
  take?: number;
  skip?: number;
  orderBy?: Prisma.JobPostingOrderByWithRelationInput ; 
  
  jobTitle?: string;
  locationQuery?: string;

  categories?: JobCategory[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  companySizes?: CompanySize[];
  isRemote?: boolean;  
  companyId?: string;
}

export interface GetJobsParams { 
  take?: number;
  skip?: number;
  orderBy?: Prisma.JobPostingOrderByWithRelationInput | Prisma.JobPostingOrderByWithRelationInput[]; 
  
  jobTitle?: string;
  locationQuery?: string;

  categories?: JobCategory[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  companySizes?: CompanySize[];
  isRemote?: boolean;  
  companyId?: string;
}

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

// ============================================================================
// COMPANY TYPES
// ============================================================================

export type CompanyWithLocation = Company & {
  province: Province | null;
  city: City | null;
  _count: {
    jobPostings: number;
  };
};

export type CompanyDetailed = Company & {
  province: Province | null;
  city: City | null;
  admin: {
    id: string;
    name: string | null;
    email: string;
    profileImage: string | null;
  };
  stats: {
    activeJobs: number;
    totalReviews: number;
    averageRating: number;
    ratings: {
      culture: number;
      workLifeBalance: number;
      facilities: number;
      career: number;
    };
  };
};

export interface GetCompaniesParams {
  take?: number;
  skip?: number;
  search?: string;
  industry?: string;
  size?: CompanySize;
  provinceId?: string;
  cityId?: string;
}

export interface CompanyJobsParams {
  companyId: string;
  take?: number;
  skip?: number;
  category?: JobCategory;
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  search?: string;
}

// ============================================================================
// COMPANY PROFILE STORE TYPES
// ============================================================================

// Extended tab types for company profile
export type BaseTabId = 'overview' | 'jobs';
export type AdminTabId = 'profile-management' | 'job-management';
export type CompanyProfileTabId = BaseTabId | AdminTabId;

// ============================================================================
// APPLICANT TYPES
// ============================================================================

export type {
  ApplicantProfile, 
  JobApplicationDetails,
  ApplicationFilters,
} from './applicants';
// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// JOB UPDATE TYPES
// ============================================================================

export interface JobUpdateData {
  title?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  category?: JobCategory;
  employmentType?: EmploymentType;
  workType?: string;
  experienceLevel?: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  location?: string;
  provinceId?: string | null;
  cityId?: string | null;
  applicationDeadline?: Date;
  isPriority?: boolean;
  isActive?: boolean;
  isRemote?: boolean;
  latitude?: number;
  longitude?: number;
  country?: string;
  publishedAt?: Date | null;
  preSelectionTestId?: string | null;
  banner?: string;
  updatedAt?: Date;
}

export type ProcessedJobUpdateData = JobUpdateData;