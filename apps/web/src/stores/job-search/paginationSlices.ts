import type { StateCreator } from 'zustand';
import type { JobPaginationSlice, JobSearchStoreState } from '@/types/zustandSearch';

const JOBS_PER_PAGE = 10; 
const HYBRID_PAGE_JOB_LIMIT = 50; 

export const createPaginationSlice: StateCreator<JobSearchStoreState, [], [], JobPaginationSlice> = (set, get) => ({
  currentPage: 1,
  pageSize: JOBS_PER_PAGE,
  take: HYBRID_PAGE_JOB_LIMIT, 
  skip: 0,
  displayedJobsCount: JOBS_PER_PAGE,
  isLoadingMore: false,

  loadMoreJobs: () => {
    set({ isLoadingMore: true });
    setTimeout(() => {
      set(state => ({
        displayedJobsCount: state.displayedJobsCount + state.pageSize,
        isLoadingMore: false,
      }));
    }, 300);
  },

  setCurrentPage: (page) => {
    const pageSize = get().pageSize;
    const isSwitchingToHybrid = page === 1;

    set({
      currentPage: page,
      take: isSwitchingToHybrid ? HYBRID_PAGE_JOB_LIMIT : pageSize,
      skip: isSwitchingToHybrid ? 0 : HYBRID_PAGE_JOB_LIMIT + (page - 2) * pageSize,
      displayedJobsCount: pageSize,
    });
    get().fetchJobs();
  },

  setPageSize: (size) => {
    set({
      pageSize: size,
      take: HYBRID_PAGE_JOB_LIMIT, // Reset to fetch a full hybrid page
      currentPage: 1,
      skip: 0,
      displayedJobsCount: size,
    });
    get().fetchJobs();
  },
});