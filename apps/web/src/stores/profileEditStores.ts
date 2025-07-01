import { create } from 'zustand';
import type { ProfileEditState } from '@/types/zustandProfile';

import { createCoreSlice } from './profile-edit/coreSlices';
import { createPersonalInfoSlice } from './profile-edit/personalInfoSlices';
import { createPasswordSlice } from './profile-edit/passwordSlices';
import { createEmailSlice } from './profile-edit/emailSlices';
import { createProfileImageSlice } from './profile-edit/profileImageSlices';

export const useProfileEditStore = create<ProfileEditState>()((set, get, api) => ({
  ...createCoreSlice(set, get, api),
  ...createPersonalInfoSlice(set, get, api),
  ...createPasswordSlice(set, get, api),
  ...createEmailSlice(set, get, api),
  ...createProfileImageSlice(set, get, api),
}));