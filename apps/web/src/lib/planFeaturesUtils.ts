// Define the structured features interface
export interface PlanFeatures {
  cvGenerator: boolean;
  skillAssessmentLimit: number | 'unlimited';
  priorityReview: boolean;
}

export interface PlanFormData {
  name: string;
  price: number;
  duration: number;
  description: string;
  features: PlanFeatures;
}

// Helper function to convert legacy string array features to structured features
export const convertLegacyFeatures = (features: unknown): PlanFeatures => {
  if (Array.isArray(features)) {
    return {
      cvGenerator: features.includes('CV Generator') || features.includes('cvGenerator'),
      skillAssessmentLimit: features.includes('Unlimited Skill Assessments') ? 'unlimited' : 
                           features.includes('Limited Skill Assessments') ? 5 : 0,
      priorityReview: features.includes('Priority CV Review') || features.includes('priorityReview'),
    };
  } else if (typeof features === 'object' && features !== null) {
    const f = features as Partial<PlanFeatures>;
    return {
      cvGenerator: f.cvGenerator || false,
      skillAssessmentLimit: f.skillAssessmentLimit || 0,
      priorityReview: f.priorityReview || false,
    };
  }
  
  // Default features
  return {
    cvGenerator: false,
    skillAssessmentLimit: 0,
    priorityReview: false,
  };
};

// Helper function to handle both old and new feature formats and return displayable strings
export const getDisplayableFeatures = (features: unknown): string[] => {
  // Case 1: It's the legacy string array. Just return it.
  if (Array.isArray(features)) {
    return features as string[];
  }

  // Case 2: It's the new structured object. Convert it to a string array.
  if (typeof features === 'object' && features !== null) {
    const f = features as PlanFeatures; // Cast to our new type
    const list: string[] = [];
    
    if (f.cvGenerator) list.push('AI CV Generator');
    if (f.skillAssessmentLimit === 'unlimited') {
      list.push('Unlimited Skill Assessments');
    } else if (f.skillAssessmentLimit > 0) {
      list.push(`${f.skillAssessmentLimit} Skill Assessment(s)`);
    }
    if (f.priorityReview) list.push('Priority CV Review');
    
    return list;
  }
  
  // Fallback for any other unexpected type
  return [];
};

// Shorter version for table/compact displays
export const getShortDisplayableFeatures = (features: unknown): string[] => {
  // Case 1: It's the legacy string array. Just return it.
  if (Array.isArray(features)) {
    return features as string[];
  }

  // Case 2: It's the new structured object. Convert it to a string array.
  if (typeof features === 'object' && features !== null) {
    const f = features as PlanFeatures; // Cast to our new type
    const list: string[] = [];
    
    if (f.cvGenerator) list.push('CV Generator');
    if (f.skillAssessmentLimit === 'unlimited') {
      list.push('Unlimited Assessments');
    } else if (f.skillAssessmentLimit > 0) {
      list.push(`${f.skillAssessmentLimit} Assessments`);
    }
    if (f.priorityReview) list.push('Priority Review');
    
    return list;
  }
  
  // Fallback for any other unexpected type
  return [];
};

export const getFeatureSummary = (features: PlanFeatures): string => {
  const summary = [];
  
  if (features.cvGenerator) summary.push('CV Generator');
  if (features.skillAssessmentLimit === 'unlimited') {
    summary.push('Unlimited Skill Assessments');
  } else if (features.skillAssessmentLimit > 0) {
    summary.push(`${features.skillAssessmentLimit} Skill Assessments`);
  }
  if (features.priorityReview) summary.push('Priority CV Review');
  
  return summary.length > 0 ? summary.join(', ') : 'No features enabled';
};