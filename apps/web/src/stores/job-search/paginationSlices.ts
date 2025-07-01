import type { StateCreator } from 'zustand';
import type { JobPaginationSlice, JobSearchStoreState } from '@/types/zustandSearch';

export const createPaginationSlice: StateCreator<JobSearchStoreState, [], [], JobPaginationSlice> = (set, get) => ({
  currentPage: 1,
  pageSize: 10,
  take: 10, // Default take value
  skip: 0,
  setCurrentPage: (page) => {
    set((state) => ({
      currentPage: page,
      skip: (page - 1) * state.pageSize,
    }));
    get().fetchJobs();
  },
  setPageSize: (size) => {
    set({
      pageSize: size,
      take: size,
      currentPage: 1,
      skip: 0,
    });
    get().fetchJobs();
  },
});