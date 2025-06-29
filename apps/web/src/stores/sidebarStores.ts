import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface SidebarState {
  isMobileMenuOpen: boolean;
  activeTab: string;
  isMobile: boolean;
  isCollapsed: boolean;
}

interface SidebarActions {
  setMobileMenuOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setIsMobile: (mobile: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  toggleCollapsed: () => void;
}

type SidebarStore = SidebarState & SidebarActions;

export const useSidebarStore = create<SidebarStore>()(
  devtools(
    (set) => ({
      // Initial state
      isMobileMenuOpen: false,
      activeTab: '',
      isMobile: false,
      isCollapsed: false,

      // Actions
      setMobileMenuOpen: (open) =>
        set({ isMobileMenuOpen: open }, false, 'setMobileMenuOpen'),

      setActiveTab: (tab) =>
        set({ activeTab: tab }, false, 'setActiveTab'),

      setIsMobile: (mobile) =>
        set({ isMobile: mobile }, false, 'setIsMobile'),

      setCollapsed: (collapsed) =>
        set({ isCollapsed: collapsed }, false, 'setCollapsed'),

      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }), false, 'toggleMobileMenu'),

      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed }), false, 'toggleCollapsed'),
    }),
    {
      name: 'sidebar-store',
    }
  )
);