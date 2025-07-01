import type { StateCreator } from 'zustand';
import type { CoreSlice, ProfileEditState, UserProfile } from '@/types/zustandProfile';

export const createCoreSlice: StateCreator<ProfileEditState, [], [], CoreSlice> = (set, get) => ({
  user: null,
  initialLoading: true,
  message: null,
  activeTab: 'personal',

  fetchUserData: async (userId: string) => {
    set({ initialLoading: true, message: null });
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const userData: UserProfile = await response.json();

      set({ user: userData, initialLoading: false });

      // After setting the user, populate the forms in other slices
      get().setProfileForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phoneNumber: userData.phoneNumber || '',
        dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
        gender: userData.gender || '',
        lastEducation: userData.lastEducation || '',
        currentAddress: userData.currentAddress || '',
        country: userData.country || 'Indonesia',
      });
      get().setEmailForm({ newEmail: userData.email || '' });

    } catch (error) {
      console.error('Error fetching user data:', error);
      set({ message: { type: 'error', text: 'Failed to load profile data' }, user: null, initialLoading: false });
    }
  },

  setMessage: (message) => set({ message }),
  setActiveTab: (tab) => set({ activeTab: tab, message: null }), // Clear message on tab change
});