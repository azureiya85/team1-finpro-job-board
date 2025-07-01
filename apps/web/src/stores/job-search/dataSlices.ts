import type { StateCreator } from 'zustand';
import axios from 'axios';
import { subDays, subMonths } from 'date-fns';
import type { JobDataSlice, JobSearchStoreState } from '@/types/zustandSearch';
import type { GetJobsParams, GetJobsResult, JobPostingFeatured } from '@/types';

const EXPRESS_API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001/api';

async function fetchJobsFromApi(params: GetJobsParams): Promise<{ jobs: JobPostingFeatured[], totalCount: number }> {
  try {
    const response = await axios.get(`${EXPRESS_API_BASE_URL}/jobs`, { params });
    const data: GetJobsResult = response.data;
    const jobs = data.jobs || [];
    const totalCount = data.pagination?.total || jobs.length;
    return { jobs, totalCount };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || `HTTP error! status: ${error.response?.status}`;
      throw new Error(`Failed to fetch jobs: ${errorMessage}`);
    }
    throw new Error("An unknown error occurred while fetching jobs.");
  }
}

export const createDataSlice: StateCreator<JobSearchStoreState, [], [], JobDataSlice> = (set, get) => ({
  jobs: [],
  isLoading: false,
  error: null,
  totalJobs: 0,
  fetchJobs: async () => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      let startDate = state.startDate;
      let endDate = state.endDate;

      if (state.datePosted === 'last7days') startDate = subDays(new Date(), 7);
      if (state.datePosted === 'lastmonth') startDate = subMonths(new Date(), 1);
      if (['last7days', 'lastmonth'].includes(state.datePosted)) endDate = new Date();

      const apiParams: GetJobsParams = {
        jobTitle: state.searchTermInput || undefined,
        locationQuery: state.locationSearchInput || undefined,
        companyQuery: state.companySearchInput || undefined,
        companyLocationQuery: state.companyLocationInput || undefined,
        categories: state.categories?.length ? state.categories.join(',') : undefined,
        employmentTypes: state.employmentTypes?.length ? state.employmentTypes.join(',') : undefined,
        experienceLevels: state.experienceLevels?.length ? state.experienceLevels.join(',') : undefined,
        companySizes: state.companySizes?.length ? state.companySizes.join(',') : undefined,
        isRemote: state.isRemote,
        take: state.take,
        skip: state.skip,
        sortBy: state.sortBy,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };

      const { jobs, totalCount } = await fetchJobsFromApi(apiParams);
      set({ jobs, totalJobs: totalCount, isLoading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ error: errorMessage, isLoading: false, jobs: [] });
    }
  },
});