import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import { Company, Province, City } from '@prisma/client';

// --- Type Definitions ---
export type CompanyWithDetails = Pick<Company, 'id' | 'name' | 'description' | 'logo'> & {
  province: Pick<Province, 'id' | 'name'> | null;
  city: Pick<City, 'id' | 'name'> | null;
  _count: {
    jobPostings: number;
    companyReviews: number; 
  };
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

export type SortByType = 'newest' | 'oldest' | 'name_asc' | 'name_desc';

// --- Store State & Actions ---
export interface CompanySearchState {
  // UI Input States
  searchInput: string;
  locationInput: string;
  sortBy: SortByType;

  // Data States
  companies: CompanyWithDetails[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination States
  pagination: PaginationState;
  currentPage: number;
  pageSize: number;
}

export interface CompanySearchActions {
  setSearchInput: (term: string) => void;
  setLocationInput: (location: string) => void;
  setSortBy: (sortBy: SortByType) => void;
  setCurrentPage: (page: number) => void;
  fetchCompanies: () => Promise<void>;
  resetFilters: () => void;
}

// --- Initial State ---
const initialFilterState = {
  searchInput: '',
  locationInput: '',
  sortBy: 'newest' as SortByType,
  currentPage: 1,
  pageSize: 9,
};

const initialState: CompanySearchState = {
  ...initialFilterState,
  companies: [],
  isLoading: true,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

// --- API Fetching Logic ---
async function fetchCompaniesFromApi(params: {
  name?: string;
  locationQuery?: string;
  sortBy?: SortByType;
  take: number;
  skip: number;
}): Promise<{ companies: CompanyWithDetails[], pagination: PaginationState }> {
  try {
    const queryParams = new URLSearchParams();

    if (params.name) queryParams.set('name', params.name);
    if (params.locationQuery) queryParams.set('locationQuery', params.locationQuery);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    queryParams.set('take', String(params.take));
    queryParams.set('skip', String(params.skip));
    
    const response = await axios.get(`/api/companies?${queryParams.toString()}`);
    return response.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || `HTTP error! status: ${error.response?.status}`;
      console.error("Axios error fetching companies:", errorMessage, error.response?.data);
      throw new Error(`Failed to fetch companies: ${errorMessage}`);
    } else {
      console.error("Unknown error fetching companies:", error);
      throw new Error("An unknown error occurred while fetching companies.");
    }
  }
}

// --- Create the Store ---
export const useCompanySearchStore = create<CompanySearchState & CompanySearchActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSearchInput: (term) => set({ searchInput: term, currentPage: 1 }),
      setLocationInput: (location) => set({ locationInput: location, currentPage: 1 }),
      setSortBy: (sortBy) => {
        set({ sortBy, currentPage: 1 });
        get().fetchCompanies(); // Fetch immediately on sort change
      },
      setCurrentPage: (page) => {
        set({ currentPage: page });
        get().fetchCompanies();
      },

       fetchCompanies: async () => {
        const { searchInput, locationInput, sortBy, currentPage, pageSize } = get();
        set({ isLoading: true, error: null });

        try {
          const apiParams = {
            name: searchInput,
            locationQuery: locationInput,
            sortBy,
            take: pageSize,
            skip: (currentPage - 1) * pageSize,
          };
          
          const { companies, pagination } = await fetchCompaniesFromApi(apiParams);
          set({ companies, pagination, isLoading: false });

        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          console.error("Error in fetchCompanies:", errorMessage);
          set({ error: errorMessage, isLoading: false, companies: [] });
        }
      },

      resetFilters: () => {
        set({ ...initialFilterState });
        get().fetchCompanies();
      },
    }),
  )
);