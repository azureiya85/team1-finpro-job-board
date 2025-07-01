import type { StateCreator } from 'zustand';
import type { PasswordSlice, ProfileEditState, PasswordFormValues } from '@/types/zustandProfile';

const initialPasswordForm: PasswordFormValues = {
  currentPassword: '', newPassword: '', confirmPassword: '',
};

export const createPasswordSlice: StateCreator<ProfileEditState, [], [], PasswordSlice> = (set, get) => ({
  passwordForm: initialPasswordForm,
  showPasswords: { current: false, new: false, confirm: false },
  savingPassword: false,
  setPasswordForm: (data) => set((state) => ({ passwordForm: { ...state.passwordForm, ...data } })),
  resetPasswordForm: () => set({ passwordForm: initialPasswordForm }),
  toggleShowPassword: (field) =>
    set((state) => ({ showPasswords: { ...state.showPasswords, [field]: !state.showPasswords[field] } })),
  submitPasswordForm: async () => {
    set({ savingPassword: true, message: null });
    const { user, passwordForm } = get();
    if (!user) {
      set({ savingPassword: false, message: { type: 'error', text: 'User not found' } });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      set({ savingPassword: false, message: { type: 'error', text: 'New passwords do not match' } });
      return;
    }
    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update password');
      }
      set({ message: { type: 'success', text: 'Password updated successfully!' }, passwordForm: initialPasswordForm });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ message: { type: 'error', text: message } });
    } finally {
      set({ savingPassword: false });
    }
  },
});