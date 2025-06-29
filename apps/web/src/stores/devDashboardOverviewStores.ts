import { create } from 'zustand';

export type TabValue = 'subscriptions' | 'plans' | 'assessments' | 'analytics';

interface DevDashboardOverviewState {
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
}

export const useDevDashboardOverviewStore = create<DevDashboardOverviewState>((set) => ({
  activeTab: 'subscriptions',
  setActiveTab: (tab: TabValue) => set({ activeTab: tab }),
}));