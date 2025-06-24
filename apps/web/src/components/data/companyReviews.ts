import { EmploymentStatus } from '@prisma/client';

// Helper to generate CUID-like placeholders
const mockCuid = (prefix: string, index: number) => `${prefix}_${String(index).padStart(2, '0')}`;

export interface CompanyReviewMockData {
  id: string;
  title?: string;
  review: string;
  rating: number;
  cultureRating?: number;
  workLifeBalance?: number;
  facilitiesRating?: number;
  careerRating?: number;
  jobPosition: string;
  employmentStatus: EmploymentStatus;
  workDuration?: string;
  salaryEstimate?: number;
  isAnonymous: boolean;
  isVerified: boolean;
  userId: string;
  companyId: string;
  workExperienceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const companyReviews: CompanyReviewMockData[] = [
  /**
   * CASE 1: A user (Rian) reviews one company (Tech Solutions Inc.).
   * This review also contributes to CASE 3.
   */
  {
    id: mockCuid('review', 1),
    title: "Great engineering culture, but management can be slow",
    review: "The development team is fantastic and full of smart people. The projects are challenging and you learn a lot. However, decision-making from upper management can be bureaucratic and slow down progress. Overall, a positive experience for a software engineer.",
    rating: 4.0,
    cultureRating: 4.5,
    workLifeBalance: 3.5,
    facilitiesRating: 4.0,
    careerRating: 4.0,
    jobPosition: 'Senior Software Engineer',
    employmentStatus: EmploymentStatus.FORMER_EMPLOYEE,
    workDuration: "Almost 4 years",
    salaryEstimate: 25000000,
    isAnonymous: true,
    isVerified: true,
    userId: mockCuid('user_rev', 1),
    companyId: mockCuid('company', 1),
    workExperienceId: mockCuid('work_exp', 1),
    createdAt: new Date("2024-01-15T14:00:00Z"),
    updatedAt: new Date("2024-01-15T14:00:00Z"),
  },
  /**
   * CASE 2: A company (Creative Media House) is reviewed by two different users (Maya and Joko).
   * This is the first review for this case.
   */
  {
    id: mockCuid('review', 2),
    title: "Fast-paced and creative environment",
    review: "If you love marketing and being creative, this is the place for you. The workload is high but the team is very supportive. Lots of opportunities to handle big-name clients. Work-life balance can be a challenge during peak campaign seasons.",
    rating: 4.5,
    cultureRating: 5.0,
    workLifeBalance: 3.0,
    facilitiesRating: 4.0,
    careerRating: 4.5,
    jobPosition: 'Digital Marketing Specialist',
    employmentStatus: EmploymentStatus.CURRENT_EMPLOYEE,
    workDuration: "Over 2 years",
    salaryEstimate: 12000000,
    isAnonymous: true,
    isVerified: true,
    userId: mockCuid('user_rev', 2),
    companyId: mockCuid('company', 2),
    workExperienceId: mockCuid('work_exp', 2),
    createdAt: new Date("2024-02-20T09:30:00Z"),
    updatedAt: new Date("2024-02-20T09:30:00Z"),
  },
  /**
   * CASE 2: The second review for Creative Media House, by a different user (Joko).
   */
  {
    id: mockCuid('review', 3),
    title: "Good for junior designers, but salary could be better",
    review: "As a graphic designer, I got to work on a diverse range of projects which really helped build my portfolio. The creative direction is solid. The main downside is that the salary is a bit below the market average for the role and workload.",
    rating: 3.5,
    cultureRating: 4.0,
    workLifeBalance: 4.0,
    facilitiesRating: 3.5,
    careerRating: 3.0,
    jobPosition: 'Graphic Designer',
    employmentStatus: EmploymentStatus.FORMER_EMPLOYEE,
    workDuration: "About 2 years",
    salaryEstimate: 8500000,
    isAnonymous: true,
    isVerified: true,
    userId: mockCuid('user_rev', 3),
    companyId: mockCuid('company', 2),
    workExperienceId: mockCuid('work_exp', 3),
    createdAt: new Date("2024-03-05T11:00:00Z"),
    updatedAt: new Date("2024-03-05T11:00:00Z"),
  },
  /**
   * CASE 3: A user (Rian) who already reviewed one company now reviews a second one (FinanceFirst).
   */
  {
    id: mockCuid('review', 4),
    title: "Professional environment, very structured",
    review: "Coming from a different industry, the culture here is very corporate and professional. Everything is well-documented and structured, which is great for productivity. It's less 'fun' than a tech startup but the pay and benefits are excellent.",
    rating: 4.0,
    cultureRating: 3.5,
    workLifeBalance: 4.5,
    facilitiesRating: 5.0,
    careerRating: 4.0,
    jobPosition: 'Lead Backend Developer',
    employmentStatus: EmploymentStatus.CURRENT_EMPLOYEE,
    workDuration: "Less than a year",
    salaryEstimate: 35000000,
    isAnonymous: true,
    isVerified: true,
    userId: mockCuid('user_rev', 1),
    companyId: mockCuid('company', 4),
    workExperienceId: mockCuid('work_exp', 4),
    createdAt: new Date("2024-04-10T16:00:00Z"),
    updatedAt: new Date("2024-04-10T16:00:00Z"),
  },
];