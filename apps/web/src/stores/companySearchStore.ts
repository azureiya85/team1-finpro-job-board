import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CompanySearchStoreState } from '@/types/zustandSearch';

import { createFilterSlice } from './company-search/filterSlices';
import { createDataSlice } from './company-search/dataSlices';
import { createPaginationSlice } from './company-search/paginationSlices';

export const useCompanySearchStore = create<CompanySearchStoreState>()(
  devtools((set, get, api) => ({
    ...createFilterSlice(set, get, api),
    ...createDataSlice(set, get, api),
    ...createPaginationSlice(set, get, api),
  }))
);