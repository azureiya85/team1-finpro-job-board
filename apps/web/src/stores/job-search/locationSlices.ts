import type { StateCreator } from 'zustand';
import type { JobLocationSlice, JobSearchStoreState, ProvinceWithCities } from '@/types/zustandSearch';

export const createLocationSlice: StateCreator<JobSearchStoreState, [], [], JobLocationSlice> = (set) => ({
  allLocations: [],
  isLocationsLoading: false,
  fetchLocations: async () => {
    set({ isLocationsLoading: true });
    try {
      const response = await fetch('/api/locations');

      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.statusText}`);
      }

      const data: ProvinceWithCities[] = await response.json();
      
      set({ allLocations: data, isLocationsLoading: false });

    } catch (error) {
      console.error("Failed to fetch locations:", error);
      set({ isLocationsLoading: false, allLocations: [] });
    }
  },
});