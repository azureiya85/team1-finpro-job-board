import { create } from 'zustand';
import { JobPostingFeatured } from '@/types';
import { getCurrentDeviceLocation } from '@/lib/locationService';

export type Tab = 'latest' | 'nearest';

interface FeaturedJobsState {
  // Active tab state
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  
  // Nearest jobs state
  nearestJobs: JobPostingFeatured[];
  isLoadingNearest: boolean;
  locationError: string | null;
  userCoordinates: { latitude: number; longitude: number } | null;
  
  // Actions
  setNearestJobs: (jobs: JobPostingFeatured[]) => void;
  setIsLoadingNearest: (loading: boolean) => void;
  setLocationError: (error: string | null) => void;
  setUserCoordinates: (coords: { latitude: number; longitude: number } | null) => void;
  
  // Async actions
  fetchNearestJobs: () => Promise<void>;
  
  // Reset functions
  resetNearestJobsState: () => void;
}

export const useFeaturedJobsStore = create<FeaturedJobsState>((set, get) => ({
  // Initial state
  activeTab: 'latest',
  nearestJobs: [],
  isLoadingNearest: false,
  locationError: null,
  userCoordinates: null,
  
  // Synchronous actions
  setActiveTab: (tab: Tab) => set({ activeTab: tab }),
  setNearestJobs: (jobs: JobPostingFeatured[]) => set({ nearestJobs: jobs }),
  setIsLoadingNearest: (loading: boolean) => set({ isLoadingNearest: loading }),
  setLocationError: (error: string | null) => set({ locationError: error }),
  setUserCoordinates: (coords: { latitude: number; longitude: number } | null) => 
    set({ userCoordinates: coords }),
  
  // Async action for fetching nearest jobs
  fetchNearestJobs: async () => {
    const { setIsLoadingNearest, setLocationError, setNearestJobs, setUserCoordinates } = get();
    
    setIsLoadingNearest(true);
    setLocationError(null);
    setNearestJobs([]);

    const deviceLocation = await getCurrentDeviceLocation();
    if (!deviceLocation) {
      setLocationError("Could not get your location. Please enable location services or try again.");
      setIsLoadingNearest(false);
      return;
    }
    setUserCoordinates(deviceLocation);

    try {
      const params = new URLSearchParams({
        userLatitude: deviceLocation.latitude.toString(),
        userLongitude: deviceLocation.longitude.toString(),
        radiusKm: '50',
        take: '15',
      });
      
      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch nearest jobs (Status: ${response.status})`);
      }
      
      const jobsData: JobPostingFeatured[] = await response.json();

      if (jobsData && jobsData.length > 0) {
        const jobsToSet = jobsData.slice(0, 5);
        setNearestJobs(jobsToSet);
      } else {
        setNearestJobs([]);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setLocationError(errorMessage);
    } finally {
      setIsLoadingNearest(false);
    }
  },
  
  // Reset function
  resetNearestJobsState: () => set({
    nearestJobs: [],
    isLoadingNearest: false,
    locationError: null,
    userCoordinates: null,
  }),
}));