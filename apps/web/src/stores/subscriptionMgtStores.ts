import { create } from 'zustand';
import type { SubscriptionManagementState } from '@/types/zustandAdmin';

import { createCoreSlice } from './subscription-mgt/coreSlice';
import { createListSlice } from './subscription-mgt/listSlice';
import { createPaymentSlice } from './subscription-mgt/paymentSlice';
import { createPlanSlice } from './subscription-mgt/planSlice';

export const useSubscriptionManagementStore = create<SubscriptionManagementState>()((set, get, api) => ({
  ...createCoreSlice(set, get, api),
  ...createListSlice(set, get, api),
  ...createPaymentSlice(set, get, api),
  ...createPlanSlice(set, get, api),
}));