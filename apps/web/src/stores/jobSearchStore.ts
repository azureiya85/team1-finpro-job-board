import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import { JobPostingFeatured, GetJobsParams, GetJobsResult } from '@/types'; 
import { JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@prisma/client';
import { subDays, subMonths } from 'date-fns';
import { Province, City } from '@prisma/client';

// Express API base URL
const EXPRESS_API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001/api';

// Types for the store
export type SortByType = 'newest' | 'oldest' | 'company_asc' | 'company_desc';
export type DatePostedType = 'all' | 'last7days' | 'lastmonth' | 'custom';

export interface JobSearchState { 
  // UI Input States
  searchTermInput: string;      
  locationSearchInput: string;
  companySearchInput: string;  
  companyLocationInput: string; 
  allLocations: ProvinceWithCities[];
  isLocationsLoading: boolean;

  // Filter States 
  categories?: JobCategory[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  companySizes?: CompanySize[];
  isRemote?: boolean;
  sortBy: SortByType;
  datePosted: DatePostedType;
  startDate?: Date;
  endDate?: Date;

  // Data states
  jobs: JobPostingFeatured[];
  isLoading: boolean;
  error: string | null;
  totalJobs: number;

  // Pagination states
  currentPage: number;
  pageSize: number;
  skip?: number; 
  take?: number;
  hybridMode: 'loadmore' | 'pagination';
  loadedJobsBuffer: JobPostingFeatured[];
}

export interface JobSearchActions {
  setSearchTermInput: (term: string) => void;
  setLocationSearchInput: (location: string) => void;
  setCompanySearchInput: (company: string) => void;
  setCategories: (categories: JobCategory[]) => void;
  setEmploymentTypes: (types: EmploymentType[]) => void;
  setExperienceLevels: (levels: ExperienceLevel[]) => void;
  setCompanySizes: (sizes: CompanySize[]) => void;
  setIsRemote: (isRemote?: boolean) => void;
  setSortBy: (sortBy: SortByType) => void;
  setDatePosted: (datePosted: DatePostedType) => void;
  setStartDate: (date?: Date) => void;
  setEndDate: (date?: Date) => void;
  setDateRange: (start?: Date, end?: Date) => void;
  setCompanyLocationInput: (location: string) => void; 
  fetchLocations: () => Promise<void>;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  fetchJobs: () => Promise<void>;
  resetFilters: () => void;
}

export interface ProvinceWithCities extends Province {
  cities: City[];
}

// --- Initial State for the UI and Filters ---
const initialUiAndFilterState = {
  searchTermInput: '',
  locationSearchInput: '',
  companySearchInput: '',
  companyLocationInput: '',
  categories: [],
  employmentTypes: [],
  experienceLevels: [],
  companySizes: [],
  isRemote: undefined,
  sortBy: 'newest' as SortByType,
  datePosted: 'all' as DatePostedType,
  startDate: undefined,
  endDate: undefined,

  currentPage: 1,
  pageSize: 10,
  take: 30, 
  skip: 0,  
};

const initialState: JobSearchState = {
  ...initialUiAndFilterState,
  jobs: [],
  isLoading: false,
  error: null,
  totalJobs: 0,
  hybridMode: 'loadmore',
  loadedJobsBuffer: [],
  allLocations: [],
  isLocationsLoading: false,
};

// --- API Fetching Logic ---
async function fetchJobsFromExpressApi(params: GetJobsParams): Promise<{jobs: JobPostingFeatured[], totalCount: number}> {
  try {
    const queryParams: Record<string, string | string[] | boolean> = {}; 
    
    if (params.jobTitle) queryParams.jobTitle = params.jobTitle;
    if (params.locationQuery) queryParams.locationQuery = params.locationQuery;
    if (params.companyQuery) queryParams.companyQuery = params.companyQuery;
    if (params.categories && params.categories.length > 0) queryParams.categories = params.categories;
    if (params.employmentTypes && params.employmentTypes.length > 0) queryParams.employmentTypes = params.employmentTypes;
    if (params.experienceLevels && params.experienceLevels.length > 0) queryParams.experienceLevels = params.experienceLevels;
    if (params.companySizes && params.companySizes.length > 0) queryParams.companySizes = params.companySizes;
    if (params.companyLocationQuery) queryParams.companyLocationQuery = params.companyLocationQuery;
    if (typeof params.isRemote === 'boolean') queryParams.isRemote = params.isRemote; 
    if (params.take) queryParams.take = String(params.take);
    if (params.skip) queryParams.skip = String(params.skip);
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    

    const response = await axios.get(`${EXPRESS_API_BASE_URL}/jobs`, {
      params: queryParams,
      paramsSerializer: (params) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(item => query.append(key, item));
          } else if (value !== undefined && value !== null) {
            query.set(key, String(value));
          }
        });
        return query.toString();
      }
    });

    const data: GetJobsResult | JobPostingFeatured[] = response.data;
    if ('jobs' in data && Array.isArray(data.jobs)) {
      return { jobs: data.jobs, totalCount: data.pagination?.total || data.jobs.length };
    } else if (Array.isArray(data)) {
      return { jobs: data, totalCount: data.length };
    } else {
      console.warn("Received data from Express API is not in expected format:", data);
      return { jobs: [], totalCount: 0 };
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || `HTTP error! status: ${error.response?.status}`;
        console.error("Axios error fetching jobs:", errorMessage, error.response?.data);
        throw new Error(`Failed to fetch jobs: ${errorMessage}`);
    } else {
        console.error("Unknown error fetching jobs:", error);
        throw new Error("An unknown error occurred while fetching jobs.");
    }
  }
}

// --- Create the Store ---
export const useJobSearchStore = create<JobSearchState & JobSearchActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSearchTermInput: (term) => set({ searchTermInput: term }),
      setLocationSearchInput: (location) => set({ locationSearchInput: location }),
      setCompanySearchInput: (company) => set({ companySearchInput: company }),

      fetchLocations: async () => {
        set({ isLocationsLoading: true });
        try {
          const response = await axios.get<ProvinceWithCities[]>(`${EXPRESS_API_BASE_URL}/locations`);
          set({ allLocations: response.data, isLocationsLoading: false });
        } catch (error) {
          console.error("Failed to fetch locations:", error);
          set({ isLocationsLoading: false, allLocations: [] }); // Reset on error
        }
      },

       setCompanyLocationInput: (location) => {
        set({ companyLocationInput: location, currentPage: 1, skip: 0 });
        get().fetchJobs();
      },
      
      setCategories: (categories) => {
        set({ categories, currentPage: 1, skip: 0 }); 
        get().fetchJobs();
      },
      setEmploymentTypes: (types) => {
        set({ employmentTypes: types, currentPage: 1, skip: 0 }); 
        get().fetchJobs();
      },
      setExperienceLevels: (levels) => {
        set({ experienceLevels: levels, currentPage: 1, skip: 0 }); 
        get().fetchJobs();
      },
      setCompanySizes: (sizes) => {
        set({ companySizes: sizes, currentPage: 1, skip: 0 }); 
        get().fetchJobs();
      },
      setIsRemote: (isRemote) => {
        set({ isRemote, currentPage: 1, skip: 0 }); 
        get().fetchJobs();
      },
      setSortBy: (sortBy) => {
        set({ sortBy, currentPage: 1, skip: 0 }); 
        get().fetchJobs();
      },
      setDatePosted: (datePosted) => {
        set({ datePosted, startDate: undefined, endDate: undefined, currentPage: 1, skip: 0 });
        get().fetchJobs();
      },
      setDateRange: (start, end) => {
        set({ startDate: start, endDate: end, datePosted: 'custom', currentPage: 1, skip: 0 });
        get().fetchJobs();
      },
      
      setCurrentPage: (page) => {
        set((state) => ({ 
          currentPage: page,
          skip: (page - 1) * state.pageSize
        }));
        get().fetchJobs();
      },
      
      setPageSize: (size) => {
        set(() => ({ 
          pageSize: size,
          take: size,
          currentPage: 1,
          skip: 0,
        }));
        get().fetchJobs();
      },

      fetchJobs: async () => {
        const { 
          searchTermInput, locationSearchInput, companySearchInput, companyLocationInput,categories, employmentTypes, 
          experienceLevels, companySizes, isRemote, take, skip,
          sortBy, datePosted, startDate: customStartDate, endDate: customEndDate
        } = get();

        set({ isLoading: true, error: null });
        
        try {
          let startDate: Date | undefined = customStartDate;
          let endDate: Date | undefined = customEndDate;
          
          if (datePosted === 'last7days') {
            startDate = subDays(new Date(), 7);
            endDate = new Date();
          } else if (datePosted === 'lastmonth') {
            startDate = subMonths(new Date(), 1);
            endDate = new Date();
          }

          const apiParams: GetJobsParams = {
            jobTitle: searchTermInput || undefined, 
            locationQuery: locationSearchInput || undefined,
            companyQuery: companySearchInput || undefined, 
            categories: categories && categories.length > 0 ? categories : undefined,
            employmentTypes: employmentTypes && employmentTypes.length > 0 ? employmentTypes : undefined,
            experienceLevels: experienceLevels && experienceLevels.length > 0 ? experienceLevels : undefined,
            companySizes: companySizes && companySizes.length > 0 ? companySizes : undefined,
            companyLocationQuery: companyLocationInput || undefined,
            isRemote,
            take,
            skip,
            sortBy: sortBy,
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
          };

          const { jobs, totalCount } = await fetchJobsFromExpressApi(apiParams);
          set({ jobs, totalJobs: totalCount, isLoading: false });
          
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          console.error("Error in fetchJobs:", errorMessage);
          set({ error: errorMessage, isLoading: false, jobs: [] });
        }
      },

      resetFilters: () => {
        set({ 
          ...initialUiAndFilterState, // Reset includes new filters
          jobs: [],
          error: null,
        });
        get().fetchJobs(); // Fetch jobs with the initial state
      },
    }),
  )
);