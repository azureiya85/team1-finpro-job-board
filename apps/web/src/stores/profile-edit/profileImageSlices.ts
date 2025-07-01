import type { StateCreator } from 'zustand';
import type { ProfileImageSlice, ProfileEditState } from '@/types/zustandProfile';

export const createProfileImageSlice: StateCreator<ProfileEditState, [], [], ProfileImageSlice> = (set, get) => ({
  profileImageFile: null,
  profileImagePreview: null,
  uploadingImage: false,
  setProfileImageFile: (file) => {
    if (!file) {
      set({ profileImageFile: null, profileImagePreview: null, message: null });
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      set({ message: { type: 'error', text: 'Invalid file type. Only JPG, PNG allowed.' } });
      return;
    }
    if (file.size > 1 * 1024 * 1024) { // 1MB
      set({ message: { type: 'error', text: 'File is too large. Maximum size is 1MB.' } });
      return;
    }
    set({ profileImageFile: file, message: null });
    const reader = new FileReader();
    reader.onload = (e) => set({ profileImagePreview: e.target?.result as string });
    reader.readAsDataURL(file);
  },
  clearProfileImagePreview: () => set({ profileImageFile: null, profileImagePreview: null }),
  uploadProfileImage: async () => {
    set({ uploadingImage: true, message: null });
    const { user, profileImageFile, fetchUserData, clearProfileImagePreview } = get();
    if (!user || !profileImageFile) {
      set({ uploadingImage: false, message: { type: 'error', text: 'User or image file not found' } });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('profileImage', profileImageFile);
      const response = await fetch(`/api/users/${user.id}/profile-image`, { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to upload image');
      set({ message: { type: 'success', text: result.message } });
      clearProfileImagePreview();
      await fetchUserData(user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ message: { type: 'error', text: message } });
    } finally {
      set({ uploadingImage: false });
    }
  },
  removeProfileImage: async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;
    set({ uploadingImage: true, message: null });
    const { user, fetchUserData } = get();
    if (!user) {
      set({ uploadingImage: false, message: { type: 'error', text: 'User not found' } });
      return;
    }
    try {
      const response = await fetch(`/api/users/${user.id}/profile-image`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove photo');
      set({ message: { type: 'success', text: 'Profile photo removed successfully!' } });
      await fetchUserData(user.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) { 
      set({ message: { type: 'error', text: 'Failed to remove profile photo' } });
    } finally {
      set({ uploadingImage: false });
    }
  },
});