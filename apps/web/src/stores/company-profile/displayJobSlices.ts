import type { StateCreator } from 'zustand';
import type { DisplayJobsSlice, CompanyProfileState } from '@/types/zustandProfile';

const initialState = {
  displayJobs: [],
  isLoadingDisplayJobs: false,
  displayJobsPage: 1,
  hasMoreDisplayJobs: true,
};

export const createDisplayJobsSlice: StateCreator<
  CompanyProfileState,
  [],
  [],
  DisplayJobsSlice
> = (set) => ({
  ...initialState,
  setDisplayJobs: (jobs) => set({ displayJobs: jobs }),
  addDisplayJobs: (newJobs) =>
    set((state) => ({ displayJobs: [...state.displayJobs, ...newJobs] })),
  setLoadingDisplayJobs: (loading) => set({ isLoadingDisplayJobs: loading }),
  setDisplayJobsPagination: (page, hasMore) =>
    set({ displayJobsPage: page, hasMoreDisplayJobs: hasMore }),
  resetDisplayJobs: () => set(initialState),
});