import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import { JobPostingFeatured, GetJobsParams, GetJobsResult } from '@/types'; 
import { JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@prisma/client';

// Express API base URL
const EXPRESS_API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001/api';

// --- Types for the store ---
export interface JobSearchState { 
  // UI Input States
  searchTermInput: string;      
  locationSearchInput: string;  

  // Filter States 
  categories?: JobCategory[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  companySizes?: CompanySize[];
  isRemote?: boolean;

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
  setCategories: (categories: JobCategory[]) => void;
  setEmploymentTypes: (types: EmploymentType[]) => void;
  setExperienceLevels: (levels: ExperienceLevel[]) => void;
  setCompanySizes: (sizes: CompanySize[]) => void;
  setIsRemote: (isRemote?: boolean) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  fetchJobs: () => Promise<void>;
  resetFilters: () => void;
}

// --- Initial State for the UI and Filters ---
const initialUiAndFilterState = {
  searchTermInput: '',
  locationSearchInput: '',
  categories: [],
  employmentTypes: [],
  experienceLevels: [],
  companySizes: [],
  isRemote: undefined,
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
};

// --- API Fetching Logic using Axios and Express ---
async function fetchJobsFromExpressApi(params: GetJobsParams): Promise<{jobs: JobPostingFeatured[], totalCount: number}> {
  try {
    const queryParams: Record<string, string | string[]> = {};
    
    if (params.jobTitle) queryParams.jobTitle = params.jobTitle;
    if (params.locationQuery) queryParams.locationQuery = params.locationQuery;
    if (params.categories && params.categories.length > 0) queryParams.categories = params.categories;
    if (params.employmentTypes && params.employmentTypes.length > 0) queryParams.employmentTypes = params.employmentTypes;
    if (params.experienceLevels && params.experienceLevels.length > 0) queryParams.experienceLevels = params.experienceLevels;
    if (params.companySizes && params.companySizes.length > 0) queryParams.companySizes = params.companySizes;
    if (typeof params.isRemote === 'boolean') queryParams.isRemote = String(params.isRemote);
    if (params.take) queryParams.take = String(params.take);
    if (params.skip) queryParams.skip = String(params.skip);

    const response = await axios.get(`${EXPRESS_API_BASE_URL}/jobs`, {
      params: queryParams,
      paramsSerializer: (params) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(item => query.append(key, item));
          } else {
            query.set(key, value);
          }
        });
        return query.toString();
      }
    });

    const data: GetJobsResult | JobPostingFeatured[] = response.data;

    // Handle both possible response formats
    if ('jobs' in data && Array.isArray(data.jobs)) {
      const totalCount = data.pagination?.total || data.jobs.length;
      return { 
        jobs: data.jobs, 
        totalCount 
      };
    } else if (Array.isArray(data)) {
      // Direct array format (fallback)
      return { 
        jobs: data, 
        totalCount: data.length 
      };
    } else {
      console.warn("Received data from Express API is not in expected format:", data);
      return { jobs: [], totalCount: 0 };
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          `HTTP error! status: ${error.response?.status}` ||
                          error.message;
      console.error("Axios error fetching jobs from Express API:", error.response?.status, errorMessage);
      throw new Error(`Failed to fetch jobs from Express API: ${errorMessage}`);
    } else {
      console.error("Unknown error fetching jobs from Express API:", error);
      throw new Error("An unknown error occurred while fetching jobs from Express API");
    }
  }
}

// --- Create the Store ---
export const useJobSearchStore = create<JobSearchState & JobSearchActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Setters for UI inputs
      setSearchTermInput: (term) => set({ searchTermInput: term }),
      setLocationSearchInput: (location) => set({ locationSearchInput: location }),
      
      // Setters for direct filters
      setCategories: (categories) => set({ categories }),
      setEmploymentTypes: (types) => set({ employmentTypes: types }),
      setExperienceLevels: (levels) => set({ experienceLevels: levels }),
      setCompanySizes: (sizes) => set({ companySizes: sizes }),
      setIsRemote: (isRemote) => set({ isRemote }),
      
      setCurrentPage: (page) => {
        set((state) => ({ 
          currentPage: page,
          skip: (page - 1) * state.pageSize
        }));
      },
      setPageSize: (size) => {
        set(() => ({ 
          pageSize: size,
          take: size,
          currentPage: 1,
          skip: 0,
        }));
      },

      fetchJobs: async () => {
        const { 
          searchTermInput, locationSearchInput, categories, employmentTypes, 
          experienceLevels, companySizes, isRemote, take, skip
        } = get();

        set({ isLoading: true, error: null });
        
        try {
          const apiParams: GetJobsParams = {
            jobTitle: searchTermInput || undefined, 
            locationQuery: locationSearchInput || undefined, 
            categories: categories && categories.length > 0 ? categories : undefined,
            employmentTypes: employmentTypes && employmentTypes.length > 0 ? employmentTypes : undefined,
            experienceLevels: experienceLevels && experienceLevels.length > 0 ? experienceLevels : undefined,
            companySizes: companySizes && companySizes.length > 0 ? companySizes : undefined,
            isRemote,
            take,
            skip,
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
          ...initialUiAndFilterState, // Reset to the UI and filter initial state
          jobs: [],
          error: null,
        });
        get().fetchJobs(); // Fetch jobs with the initial state
      },
    }),
  )
);