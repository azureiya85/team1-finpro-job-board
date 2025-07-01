import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { JobSearchStoreState } from '@/types/zustandSearch';

import { createFilterSlice } from './job-search/filterSlices';
import { createDataSlice } from './job-search/dataSlices';
import { createLocationSlice } from './job-search/locationSlices';
import { createPaginationSlice } from './job-search/paginationSlices';

export const useJobSearchStore = create<JobSearchStoreState>()(
  devtools((set, get, api) => ({
    ...createFilterSlice(set, get, api),
    ...createDataSlice(set, get, api),
    ...createLocationSlice(set, get, api),
    ...createPaginationSlice(set, get, api),
  }))
);