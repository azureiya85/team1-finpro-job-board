import type { StateCreator } from 'zustand';
import type { ManagementJobsSlice, CompanyProfileState } from '@/types/zustandProfile';

const initialState = {
  managementJobs: [],
  isLoadingManagementJobs: false,
  managementJobsError: null,
  managementJobFilters: {},
  managementJobPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

export const createManagementJobsSlice: StateCreator<
  CompanyProfileState,
  [],
  [],
  ManagementJobsSlice
> = (set) => ({
  ...initialState,
  setManagementJobs: (jobs) => set({ managementJobs: jobs }),
  setLoadingManagementJobs: (loading) => set({ isLoadingManagementJobs: loading }),
  setManagementJobsError: (error) => set({ managementJobsError: error }),
  setManagementJobPagination: (pagination) =>
    set((state) => ({
      managementJobPagination: { ...state.managementJobPagination, ...pagination },
    })),
  removeJobFromManagement: (jobId) =>
    set((state) => ({
      managementJobs: state.managementJobs.filter((job) => job.id !== jobId),
    })),
  updateJobInManagement: (updatedJob) =>
    set((state) => ({
      managementJobs: state.managementJobs.map((job) =>
        job.id === updatedJob.id ? { ...job, ...updatedJob } : job
      ),
    })),
  resetJobManagement: () => set(initialState),
});