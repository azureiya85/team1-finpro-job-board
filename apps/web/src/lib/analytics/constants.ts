// Default range waktu analytics (misalnya 30 hari terakhir)
export const DEFAULT_ANALYTICS_RANGE_DAYS = 30;

// Label untuk kategori demographic (bisa digunakan di chart atau filter)
export const GENDER_LABELS = ['Male', 'Female', 'Other', 'Prefer not to say'];
export const AGE_GROUPS = ['18-24', '25-34', '35-44', '45-54', '55+'];

// Job interest categories (bisa disesuaikan dengan data real-mu)
export const JOB_CATEGORIES = [
    'Technology',
    'Marketing',
    'Sales',
    'Finance',
    'Human Resources',
    'Operations',
    'Design',
    'Customer Service',
    'Healthcare',
    'Education',
    'Construction',
    'Manufacturing',
    'Retail',
    'Hospitality',
    'Transportation',
    'Legal',
    'Consulting',
    'Media',
    'Non-profit',
    'Government',
    'Engineering',
    'Science & Research',
    'Arts & Entertainment',
    'Writing & Editing',
    'Agriculture',
    'Real Estate',
    'Automotive',
    'Aerospace & Defense',
    'Energy & Utilities',
    'Telecommunications',
    'Logistics & Supply Chain',
    'Architecture & Planning',
    'Sports & Fitness',
    'Environmental Services',
    'Security & Protective Services',
    'Other',
  ];

// Warna standar untuk grafik analytics
export const ANALYTICS_COLORS = {
  primary: '#3b82f6', // Tailwind blue-500
  secondary: '#10b981', // Tailwind green-500
  danger: '#ef4444', // Tailwind red-500
  neutral: '#9ca3af', // Tailwind gray-400
};

// Default map center (Indonesia)
export const DEFAULT_MAP_CENTER: [number, number] = [-2.5, 117];

// Zoom level
export const DEFAULT_MAP_ZOOM = 4.5;

// Metrics label untuk StatCard
export const METRIC_LABELS = {
  totalApplicants: 'Total Applicants',
  newApplicants: 'New Applicants',
  conversionRate: 'Conversion Rate',
  avgSalary: 'Average Salary',
};
