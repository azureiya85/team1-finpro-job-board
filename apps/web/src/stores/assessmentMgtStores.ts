import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AssessmentMgtStoreState } from '@/types/zustandAdmin';

import { createCategorySlice } from './assessment-mgt/categorySlice';
import { createAssessmentSlice } from './assessment-mgt/assessmentSlice';
import { createQuestionSlice } from './assessment-mgt/questionSlice';

export const useAssessmentMgtStore = create<AssessmentMgtStoreState>()(
  devtools((set, get, api) => ({
    ...createCategorySlice(set, get, api),
    ...createAssessmentSlice(set, get, api),
    ...createQuestionSlice(set, get, api),
  }))
);