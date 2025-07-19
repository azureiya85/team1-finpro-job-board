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

  // --- Input setters that do not trigger a fetch ---
  setSearchTermInput: (term: string) => set({ searchTermInput: term }),
  setLocationSearchInput: (location: string) => set({ locationSearchInput: location }),
  setCompanySearchInput: (company: string) => set({ companySearchInput: company }),

  // --- Actions that do trigger a fetch by resetting to page 1 ---
  setCompanyLocationInput: (location: string) => {
    set({ companyLocationInput: location });
    get().setCurrentPage(1); 
  },
  setIsRemote: (isRemote?: boolean) => {
    set({ isRemote });
    get().setCurrentPage(1); 
  },
  setSortBy: (sortBy: SortByType) => { 
    set({ sortBy });
    get().setCurrentPage(1); 
  },

    applyDebouncedSearch: () => {
    get().setCurrentPage(1);
  },
  
  setDatePosted: (datePosted: DatePostedType) => {
    set({ datePosted, startDate: undefined, endDate: undefined });
    get().setCurrentPage(1); 
  },
  setDateRange: (start?: Date, end?: Date) => {
    set({ startDate: start, endDate: end, datePosted: 'custom' });
    get().setCurrentPage(1); 
  },

  // --- Array updaters that do trigger a fetch by resetting to page 1 ---
  updateCategory: (category: JobCategory, isChecked: boolean) => {
    const currentCategories = get().categories || [];
    const newCategories = isChecked
      ? [...currentCategories, category]
      : currentCategories.filter((c) => c !== category);
    
    set({ categories: newCategories });
    get().setCurrentPage(1); 
  },

  updateEmploymentType: (type: EmploymentType, isChecked: boolean) => {
    const currentTypes = get().employmentTypes || [];
    const newTypes = isChecked
      ? [...currentTypes, type]
      : currentTypes.filter((t) => t !== type);
    
    set({ employmentTypes: newTypes });
    get().setCurrentPage(1); 
  },

  updateExperienceLevel: (level: ExperienceLevel, isChecked: boolean) => {
    const currentLevels = get().experienceLevels || [];
    const newLevels = isChecked
      ? [...currentLevels, level]
      : currentLevels.filter((l) => l !== level);
    
    set({ experienceLevels: newLevels });
    get().setCurrentPage(1);
  },
  
  updateCompanySize: (size: CompanySize, isChecked: boolean) => {
    const currentSizes = get().companySizes || [];
    const newSizes = isChecked
      ? [...currentSizes, size]
      : currentSizes.filter((s) => s !== size);
      
    set({ companySizes: newSizes });
    get().setCurrentPage(1); 
  },
  
  // --- Reset function that triggers a fetch by resetting to page 1 ---
  resetFilters: () => {
    set({ ...initialFilterState });
    get().setCurrentPage(1); 
  },
});