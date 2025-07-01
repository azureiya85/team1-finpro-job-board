import { create } from 'zustand';
import type { CompanyProfileState, CompanyProfileTabId } from '@/types/zustandProfile';
import { createCompanySlice } from './company-profile/companySlices';
import { createDisplayJobsSlice } from './company-profile/displayJobSlices';
import { createManagementJobsSlice } from './company-profile/mgtJobSlices';
import { createApplicantManagementSlice } from './company-profile/applicantMgtSlices';

export const useCompanyProfileStore = create<CompanyProfileState>()((set, get, api) => ({
  ...createCompanySlice(set, get, api),
  ...createDisplayJobsSlice(set, get, api),
  ...createManagementJobsSlice(set, get, api),
  ...createApplicantManagementSlice(set, get, api),

  // Combined reset function
  resetStore: () => {
    get().resetDisplayJobs();
    get().resetJobManagement();
    get().resetApplicantManagement();
    set({
      company: null,
      activeTab: 'overview',
      isLoadingCompany: false,
      totalJobs: null,
    });
  },

  // Override removeJobFromManagement to also decrement totalJobs
  removeJobFromManagement: (jobId) => {
    get().decrementTotalJobs();
    set((state) => ({
      managementJobs: state.managementJobs.filter((job) => job.id !== jobId),
    }));
  },
}));

export type { CompanyProfileTabId };