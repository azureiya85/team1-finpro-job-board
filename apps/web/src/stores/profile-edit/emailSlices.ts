import type { StateCreator } from 'zustand';
import type { EmailSlice, ProfileEditState, EmailFormValues } from '@/types/zustandProfile';

const initialEmailForm: EmailFormValues = { newEmail: '' };

export const createEmailSlice: StateCreator<ProfileEditState, [], [], EmailSlice> = (set, get) => ({
  emailForm: initialEmailForm,
  savingEmail: false,
  resendingVerification: false,
  setEmailForm: (data) => set((state) => ({ emailForm: { ...state.emailForm, ...data } })),
  resetEmailForm: () => set({ emailForm: initialEmailForm }),
  submitEmailForm: async () => {
    set({ savingEmail: true, message: null });
    const { user, emailForm, fetchUserData } = get();
    if (!user) {
      set({ savingEmail: false, message: { type: 'error', text: 'User not found' } });
      return;
    }
    try {
      const response = await fetch('/api/auth/verify-email', { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: emailForm.newEmail, userId: user.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update email');
      set({ message: { type: 'success', text: result.message } });
      await fetchUserData(user.id); 
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ message: { type: 'error', text: message } });
    } finally {
      set({ savingEmail: false });
    }
  },
  resendVerificationEmail: async () => {
    set({ resendingVerification: true, message: null });
    const { user } = get();
    if (!user) {
        set({ resendingVerification: false, message: { type: 'error', text: 'User not found' } });
        return;
    }
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }), 
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to resend verification email');
      set({ message: { type: 'success', text: result.message } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ message: { type: 'error', text: message } });
    } finally {
      set({ resendingVerification: false });
    }
  },
});