import type { StateCreator } from 'zustand';
import type { PersonalInfoSlice, ProfileEditState, ProfileFormValues } from '@/types/zustandProfile';

const initialProfileForm: ProfileFormValues = {
  firstName: '', lastName: '', phoneNumber: '', dateOfBirth: '', gender: '',
  lastEducation: '', currentAddress: '', country: 'Indonesia',
};

export const createPersonalInfoSlice: StateCreator<
  ProfileEditState, [], [], PersonalInfoSlice
> = (set, get) => ({
  profileForm: initialProfileForm,
  savingProfile: false,
  setProfileForm: (data) => set((state) => ({ profileForm: { ...state.profileForm, ...data } })),
  resetProfileForm: () => set({ profileForm: initialProfileForm }),
  submitProfileForm: async () => {
    set({ savingProfile: true, message: null });
    const { user, profileForm, fetchUserData } = get();
    if (!user) {
      set({ savingProfile: false, message: { type: 'error', text: 'User not found' } });
      return;
    }
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
      set({ message: { type: 'success', text: 'Profile updated successfully!' } });
      await fetchUserData(user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ message: { type: 'error', text: message } });
    } finally {
      set({ savingProfile: false });
    }
  },
});