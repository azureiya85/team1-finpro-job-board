import { Education } from '@prisma/client';

export const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  REMOTE: 'Remote Work',
};

export const experienceLevelLabels: Record<string, string> = {
  ENTRY_LEVEL: 'Entry Level',
  MID_LEVEL: 'Mid Level',
  SENIOR_LEVEL: 'Senior Level',
  EXECUTIVE: 'Executive',
};

export const companySizeLabels: Record<string, string> = {
  STARTUP: 'Startup (1-10)',
  SMALL: 'Small (11-50)',
  MEDIUM: 'Medium (51-200)',
  LARGE: 'Large (201-1000)',
  ENTERPRISE: 'Enterprise (1000+)',
};

export const categoryLabels: Record<string, string> = {
  TECHNOLOGY: 'Technology',
  MARKETING: 'Marketing',
  SALES: 'Sales',
  FINANCE: 'Finance',
  HUMAN_RESOURCES: 'Human Resources',
  OPERATIONS: 'Operations',
  DESIGN: 'Design',
  CUSTOMER_SERVICE: 'Customer Service',
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education',
  CONSTRUCTION: 'Construction',
  MANUFACTURING: 'Manufacturing',
  RETAIL: 'Retail',
  HOSPITALITY: 'Hospitality',
  TRANSPORTATION: 'Transportation',
  LEGAL: 'Legal',
  CONSULTING: 'Consulting',
  MEDIA: 'Media & Communications',
  NON_PROFIT: 'Non-Profit & NGOs',
  GOVERNMENT: 'Government & Public Sector',
  ENGINEERING: 'Engineering',
  SCIENCE_RESEARCH: 'Science & Research',
  ARTS_ENTERTAINMENT: 'Arts & Entertainment',
  WRITING_EDITING: 'Writing & Editing',
  AGRICULTURE: 'Agriculture & Farming',
  REAL_ESTATE: 'Real Estate',
  AUTOMOTIVE: 'Automotive',
  AEROSPACE_DEFENSE: 'Aerospace & Defense',
  ENERGY_UTILITIES: 'Energy & Utilities',
  TELECOMMUNICATIONS: 'Telecommunications',
  LOGISTICS_SUPPLY_CHAIN: 'Logistics & Supply Chain',
  ARCHITECTURE_PLANNING: 'Architecture & Planning',
  SPORTS_FITNESS: 'Sports & Fitness',
  ENVIRONMENTAL_SERVICES: 'Environmental Services',
  SECURITY_PROTECTIVE_SERVICES: 'Security & Protective Services',
  OTHER: 'Other',
};

export const workTypeLabels: Record<string, string> = {
  ON_SITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
};

export const educationLabels: Record<Education, string> = {
  HIGH_SCHOOL: "High School",
  DIPLOMA: "Diploma",
  BACHELOR: "Bachelor's",
  MASTER: "Master's",
  DOCTORATE: "Doctorate",
  OTHER: "Other"
};

// Helper to format education level from the enum
export const formatEducationLevelDisplay = (education: Education | null | undefined): string => {
  if (!education) return 'N/A';
  return educationLabels[education] || education;
};