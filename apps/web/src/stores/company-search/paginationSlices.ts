import type { StateCreator } from 'zustand';
import type { CompanyPaginationSlice, CompanySearchStoreState } from '@/types/zustandSearch';

export const createPaginationSlice: StateCreator<CompanySearchStoreState, [], [], CompanyPaginationSlice> = (set, get) => ({
  currentPage: 1,
  pageSize: 9,
  pagination: {
    total: 0,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
  setCurrentPage: (page) => {
    set({ currentPage: page });
    get().fetchCompanies();
  },
});