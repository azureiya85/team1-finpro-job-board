import type { StateCreator } from 'zustand';
import type { JobFilterSlice, JobSearchStoreState, DatePostedType } from '@/types/zustandSearch';
import type { SortByType, JobCategory, EmploymentType, ExperienceLevel, CompanySize } from '@/types';

const initialFilterState = {
  searchTermInput: '',
  locationSearchInput: '',
  companySearchInput: '',
  companyLocationInput: '',
  categories: [],
  employmentTypes: [],
  experienceLevels: [],
  companySizes: [],
  isRemote: undefined,
  sortBy: 'newest' as SortByType,
  datePosted: 'all' as DatePostedType,
  startDate: undefined,
  endDate: undefined,
};

export const createFilterSlice: StateCreator<JobSearchStoreState, [], [], JobFilterSlice> = (set, get) => ({
  ...initialFilterState,

  setSearchTermInput: (term: string) => set({ searchTermInput: term }),
  setLocationSearchInput: (location: string) => set({ locationSearchInput: location }),
  setCompanySearchInput: (company: string) => set({ companySearchInput: company }),
  setCompanyLocationInput: (location: string) => {
    set({ companyLocationInput: location, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },
  setCategories: (categories: JobCategory[]) => {
    set({ categories, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },
  setEmploymentTypes: (types: EmploymentType[]) => {
    set({ employmentTypes: types, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },
  setExperienceLevels: (levels: ExperienceLevel[]) => {
    set({ experienceLevels: levels, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },
  setCompanySizes: (sizes: CompanySize[]) => {
    set({ companySizes: sizes, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },
  setIsRemote: (isRemote?: boolean) => {
    set({ isRemote, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },
  setSortBy: (sortBy: SortByType) => { 
    set({ sortBy, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },
  setDatePosted: (datePosted: DatePostedType) => {
    set({ datePosted, startDate: undefined, endDate: undefined, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },
  setDateRange: (start?: Date, end?: Date) => {
    set({ startDate: start, endDate: end, datePosted: 'custom', currentPage: 1, skip: 0 });
    get().fetchJobs();
  },
  resetFilters: () => {
    set({ ...initialFilterState, jobs: [], error: null });
    get().fetchJobs();
  },
});