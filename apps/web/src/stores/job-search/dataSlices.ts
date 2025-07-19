import type { StateCreator } from 'zustand';
import { subDays, subMonths } from 'date-fns';
import type { JobDataSlice, JobSearchStoreState } from '@/types/zustandSearch';
import type { GetJobsParams, GetJobsResult, JobPostingFeatured } from '@/types';

async function fetchJobsFromNextApi(params: GetJobsParams): Promise<{ jobs: JobPostingFeatured[], totalCount: number }> {
  const searchParams = new URLSearchParams();

  const appendParam = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  };

  // Append simple key-value pairs
  appendParam('jobTitle', params.jobTitle);
  appendParam('locationQuery', params.locationQuery);
  appendParam('companyQuery', params.companyQuery);
  appendParam('companyLocationQuery', params.companyLocationQuery);
  appendParam('isRemote', params.isRemote);
  appendParam('take', params.take);
  appendParam('skip', params.skip);
  appendParam('sortBy', params.sortBy);
  appendParam('startDate', params.startDate);
  appendParam('endDate', params.endDate);
  appendParam('includePagination', true); 

  params.categories?.forEach(v => searchParams.append('categories', v));
  params.employmentTypes?.forEach(v => searchParams.append('employmentTypes', v));
  params.experienceLevels?.forEach(v => searchParams.append('experienceLevels', v));
  params.companySizes?.forEach(v => searchParams.append('companySizes', v));

  const url = `/api/jobs?${searchParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }
    
    const data: GetJobsResult = await response.json();
    const jobs = data.jobs || [];
    const totalCount = data.pagination?.total || jobs.length;
    
    return { jobs, totalCount };

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
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
        categories: state.categories?.length ? state.categories : undefined,
        employmentTypes: state.employmentTypes?.length ? state.employmentTypes : undefined,
        experienceLevels: state.experienceLevels?.length ? state.experienceLevels : undefined,
        companySizes: state.companySizes?.length ? state.companySizes : undefined,
        isRemote: state.isRemote,
        take: state.take,
        skip: state.skip,
        sortBy: state.sortBy,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };
      
      const { jobs, totalCount } = await fetchJobsFromNextApi(apiParams);
      set({ jobs, totalJobs: totalCount, isLoading: false });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ error: errorMessage, isLoading: false, jobs: [] });
    }
  },
});