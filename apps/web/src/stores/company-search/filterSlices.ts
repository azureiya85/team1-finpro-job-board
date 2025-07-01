import type { StateCreator } from 'zustand';
import type { CompanyFilterSlice, CompanySearchStoreState, CompanySortByType } from '@/types/zustandSearch';

const initialFilterState = {
  searchInput: '',
  selectedProvinceId: '',
  selectedCityId: '',
  sortBy: 'newest' as CompanySortByType,
};

export const createFilterSlice: StateCreator<CompanySearchStoreState, [], [], CompanyFilterSlice> = (set, get) => ({
  ...initialFilterState,
  setSearchInput: (term) => set({ searchInput: term }),
  setSelectedProvinceId: (provinceId) => {
    set({ selectedProvinceId: provinceId, selectedCityId: '', currentPage: 1 });
    get().fetchCompanies();
  },
  setSelectedCityId: (cityId) => {
    set({ selectedCityId: cityId, currentPage: 1 });
    get().fetchCompanies();
  },
  setSortBy: (sortBy) => {
    set({ sortBy, currentPage: 1 });
    get().fetchCompanies();
  },
  resetFilters: () => {
    set({ ...initialFilterState, currentPage: 1 });
    get().fetchCompanies();
  },
});