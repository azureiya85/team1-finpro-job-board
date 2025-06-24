import { EmploymentStatus, VerificationMethod } from '@prisma/client';

// Helper to generate CUID-like placeholders
const mockCuid = (prefix: string, index: number) => `${prefix}_${String(index).padStart(2, '0')}`;

export interface WorkExperienceMockData {
  id: string;
  userId: string;
  companyId: string;
  jobTitle: string;    
  employmentStatus: EmploymentStatus; 
  startDate: Date;
  endDate?: Date;
  isVerified: boolean; 
  verificationMethod: VerificationMethod; 
  verifiedAt: Date; 
  createdAt: Date;
  updatedAt: Date;
}

export const workExperiences: WorkExperienceMockData[] = [
    // Rian Dewanto's experience at Tech Solutions Inc.
    {
      id: mockCuid('work_exp', 1),
      userId: mockCuid('user_rev', 1),
      companyId: mockCuid('company', 1), // Tech Solutions Inc.
      jobTitle: 'Senior Software Engineer',
      employmentStatus: EmploymentStatus.FORMER_EMPLOYEE,
      startDate: new Date('2020-01-15'),
      endDate: new Date('2023-12-20'),
      isVerified: true,
      verificationMethod: VerificationMethod.ADMIN_MANUAL,
      verifiedAt: new Date('2024-01-10'),
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
    // Maya Lestari's experience at Creative Media House
    {
      id: mockCuid('work_exp', 2),
      userId: mockCuid('user_rev', 2),
      companyId: mockCuid('company', 2), // Creative Media House
      jobTitle: 'Digital Marketing Specialist',
      employmentStatus: EmploymentStatus.CURRENT_EMPLOYEE,
      startDate: new Date('2022-03-01'),
      isVerified: true,
      verificationMethod: VerificationMethod.ADMIN_MANUAL,
      verifiedAt: new Date('2024-02-15'),
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
    },
    // Joko Susilo's experience at Creative Media House
    {
      id: mockCuid('work_exp', 3),
      userId: mockCuid('user_rev', 3),
      companyId: mockCuid('company', 2), // Creative Media House
      jobTitle: 'Graphic Designer',
      employmentStatus: EmploymentStatus.FORMER_EMPLOYEE,
      startDate: new Date('2021-06-10'),
      endDate: new Date('2023-08-15'),
      isVerified: true,
      verificationMethod: VerificationMethod.ADMIN_MANUAL,
      verifiedAt: new Date('2024-03-01'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01'),
    },
    // Rian Dewanto's second experience at FinanceFirst Consulting
    {
      id: mockCuid('work_exp', 4),
      userId: mockCuid('user_rev', 1),
      companyId: mockCuid('company', 4), // FinanceFirst Consulting
      jobTitle: 'Lead Backend Developer',
      employmentStatus: EmploymentStatus.CURRENT_EMPLOYEE,
      startDate: new Date('2024-01-02'),
      isVerified: true,
      verificationMethod: VerificationMethod.ADMIN_MANUAL,
      verifiedAt: new Date('2024-04-01'),
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-04-01'),
    },
];