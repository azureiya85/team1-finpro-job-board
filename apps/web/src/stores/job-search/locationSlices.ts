import type { StateCreator } from 'zustand';
import axios from 'axios';
import type { JobLocationSlice, JobSearchStoreState, ProvinceWithCities } from '@/types/zustandSearch';

const EXPRESS_API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001/api';

export const createLocationSlice: StateCreator<JobSearchStoreState, [], [], JobLocationSlice> = (set) => ({
  allLocations: [],
  isLocationsLoading: false,
  fetchLocations: async () => {
    set({ isLocationsLoading: true });
    try {
      const response = await axios.get<ProvinceWithCities[]>(`${EXPRESS_API_BASE_URL}/locations`);
      set({ allLocations: response.data, isLocationsLoading: false });
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      set({ isLocationsLoading: false, allLocations: [] });
    }
  },
});