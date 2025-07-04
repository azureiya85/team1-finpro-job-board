import type { 
  JobPostingFeatured, 
  JobCategory, 
  EmploymentType, 
  ExperienceLevel, 
  CompanySize,
  Company,
  Province, 
  City,
  SortByType, 
} from '@/types'; 

// --- Job Search Store Types ---

export type DatePostedType = 'all' | 'last7days' | 'lastmonth' | 'custom';

export interface ProvinceWithCities extends Province {
  cities: City[];
}

// --- Job Search Slices ---

export interface JobFilterSlice {
  // --- State Properties ---
  searchTermInput: string;
  locationSearchInput: string;
  companySearchInput: string;     
  companyLocationInput: string;  
  categories: JobCategory[];
  employmentTypes: EmploymentType[];
  experienceLevels: ExperienceLevel[];
  companySizes: CompanySize[];
  isRemote?: boolean;
  sortBy: SortByType;
  datePosted: DatePostedType;
  startDate?: Date;
  endDate?: Date;
  
  // --- State Setters / Actions ---

  setSearchTermInput: (term: string) => void;
  setLocationSearchInput: (location: string) => void;
  setCompanySearchInput: (company: string) => void;
  setCompanyLocationInput: (location: string) => void; 
  setIsRemote: (isRemote?: boolean) => void;
  setSortBy: (sortBy: SortByType) => void;
  setDatePosted: (datePosted: DatePostedType) => void;
  setDateRange: (start?: Date, end?: Date) => void;

  updateCategory: (category: JobCategory, isChecked: boolean) => void;
  updateEmploymentType: (type: EmploymentType, isChecked: boolean) => void;
  updateExperienceLevel: (level: ExperienceLevel, isChecked: boolean) => void;
  updateCompanySize: (size: CompanySize, isChecked: boolean) => void;
  
  resetFilters: () => void;
}

export interface JobDataSlice {
  jobs: JobPostingFeatured[];
  isLoading: boolean;
  error: string | null;
  totalJobs: number;
  fetchJobs: () => Promise<void>;
}

export interface JobLocationSlice {
  allLocations: ProvinceWithCities[];
  isLocationsLoading: boolean;
  fetchLocations: () => Promise<void>;
}

export interface JobPaginationSlice {
  currentPage: number;
  pageSize: number;
  skip?: number;
  take?: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

// Combined Job Search State
export type JobSearchStoreState = JobFilterSlice & JobDataSlice & JobLocationSlice & JobPaginationSlice;

// --- Company Search Store Types (Unchanged) ---

export type CompanyWithDetails = Pick<Company, 'id' | 'name' | 'description' | 'logo'> & {
  province: Pick<Province, 'id' | 'name'> | null;
  city: Pick<City, 'id' | 'name'> | null;
  _count: { jobPostings: number; companyReviews: number; };
  avgRating: number;
  lastJobPostedAt: string | null;
};

export type PaginationState = {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type CompanySortByType = 'newest' | 'oldest' | 'name_asc' | 'name_desc';

// --- Company Search Slices (Unchanged) ---

export interface CompanyFilterSlice {
  searchInput: string;
  selectedProvinceId: string;
  selectedCityId: string;
  sortBy: CompanySortByType;
  
  setSearchInput: (term: string) => void;
  setSelectedProvinceId: (provinceId: string) => void;
  setSelectedCityId: (cityId: string) => void;
  setSortBy: (sortBy: CompanySortByType) => void;
  resetFilters: () => void;
}

export interface CompanyDataSlice {
  companies: CompanyWithDetails[];
  isLoading: boolean;
  error: string | null;
  fetchCompanies: () => Promise<void>;
}

export interface CompanyPaginationSlice {
  pagination: PaginationState;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
}

// Combined Company Search State
export type CompanySearchStoreState = CompanyFilterSlice & CompanyDataSlice & CompanyPaginationSlice;