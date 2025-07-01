import type { StateCreator } from 'zustand';
import type { CompanySlice, CompanyProfileState } from '@/types/zustandProfile';

export const createCompanySlice: StateCreator<
  CompanyProfileState,
  [],
  [],
  CompanySlice
> = (set) => ({
  company: null,
  activeTab: 'overview',
  isLoadingCompany: false,
  totalJobs: null,
  setCompany: (company) => set({ company }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoadingCompany: (loading) => set({ isLoadingCompany: loading }),
  setTotalJobs: (total) => set({ totalJobs: total }),
  incrementTotalJobs: () =>
    set((state) => ({
      totalJobs: typeof state.totalJobs === 'number' ? state.totalJobs + 1 : 1,
    })),
  decrementTotalJobs: () =>
    set((state) => ({
      totalJobs:
        typeof state.totalJobs === 'number' ? Math.max(0, state.totalJobs - 1) : 0,
    })),
});