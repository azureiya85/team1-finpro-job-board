import { create } from 'zustand';

type Tab = 'applied' | 'saved';

interface ApplicationListState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const useApplicationListStore = create<ApplicationListState>((set) => ({
  activeTab: 'applied',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));