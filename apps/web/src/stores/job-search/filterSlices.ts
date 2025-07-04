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

  // --- Single-value setters (Unchanged) ---
  setSearchTermInput: (term: string) => set({ searchTermInput: term }),
  setLocationSearchInput: (location: string) => set({ locationSearchInput: location }),
  setCompanySearchInput: (company: string) => set({ companySearchInput: company }),
  setCompanyLocationInput: (location: string) => {
    set({ companyLocationInput: location, currentPage: 1, skip: 0 });
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

  // --- Robust array updaters (FIXED) ---
  updateCategory: (category: JobCategory, isChecked: boolean) => {
    const currentCategories = get().categories || [];
    const newCategories = isChecked
      ? [...currentCategories, category]
      : currentCategories.filter((c) => c !== category);
    
    set({ categories: newCategories, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },

  updateEmploymentType: (type: EmploymentType, isChecked: boolean) => {
    const currentTypes = get().employmentTypes || [];
    const newTypes = isChecked
      ? [...currentTypes, type]
      : currentTypes.filter((t) => t !== type);
    
    set({ employmentTypes: newTypes, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },

  updateExperienceLevel: (level: ExperienceLevel, isChecked: boolean) => {
    const currentLevels = get().experienceLevels || [];
    const newLevels = isChecked
      ? [...currentLevels, level]
      : currentLevels.filter((l) => l !== level);
    
    set({ experienceLevels: newLevels, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },
  
  updateCompanySize: (size: CompanySize, isChecked: boolean) => {
    const currentSizes = get().companySizes || [];
    const newSizes = isChecked
      ? [...currentSizes, size]
      : currentSizes.filter((s) => s !== size);
      
    set({ companySizes: newSizes, currentPage: 1, skip: 0 });
    get().fetchJobs();
  },
  
  // --- Reset function (Unchanged) ---
  resetFilters: () => {
    set({ ...initialFilterState, jobs: get().jobs, totalJobs: get().totalJobs, error: null });
    get().fetchJobs();
  },
});