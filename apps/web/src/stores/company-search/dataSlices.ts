import type { StateCreator } from 'zustand';
import axios from 'axios';
import type { CompanyDataSlice, CompanySearchStoreState, CompanyWithDetails, PaginationState, CompanySortByType } from '@/types/zustandSearch';

type ApiParams = { name?: string; provinceId?: string; cityId?: string; sortBy?: CompanySortByType; take: number; skip: number; };

async function fetchCompaniesFromApi(params: ApiParams): Promise<{ companies: CompanyWithDetails[], pagination: PaginationState }> {
  try {
    const response = await axios.get('/api/companies', { params });
    if (!response.data?.companies || !response.data?.pagination) {
      throw new Error('Invalid response structure from API');
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || `HTTP error! Status: ${error.response?.status}`;
      throw new Error(`Failed to fetch companies: ${errorMessage}`);
    }
    throw new Error("An unknown error occurred while fetching companies.");
  }
}

export const createDataSlice: StateCreator<CompanySearchStoreState, [], [], CompanyDataSlice> = (set, get) => ({
  companies: [],
  isLoading: true,
  error: null,
  fetchCompanies: async () => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      const apiParams: ApiParams = {
        name: state.searchInput || undefined,
        provinceId: state.selectedProvinceId || undefined,
        cityId: state.selectedCityId || undefined,
        sortBy: state.sortBy,
        take: state.pageSize,
        skip: (state.currentPage - 1) * state.pageSize,
      };

      const { companies, pagination } = await fetchCompaniesFromApi(apiParams);
      set({ companies, pagination, isLoading: false });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ error: errorMessage, isLoading: false, companies: [] });
    }
  },
});