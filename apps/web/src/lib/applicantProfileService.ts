import prisma from '@/lib/prisma';
import { UserRole, JobApplication, JobPosting, Company, EmploymentStatus, Education } from '@prisma/client';

type JobApplicationWithRelations = JobApplication & {
  jobPosting: JobPosting & {
    company: Company;
  };
};

export interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  profileImage: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  currentAddress: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  lastEducation: Education | null;
  province: { name: string } | null;
  city: { name: string } | null;
  createdAt: Date;
  workExperiences: Array<{
    id: string;
    jobTitle: string;
    companyName: string;
    startDate: Date;
    endDate: Date | null;
    description: string | null;
    isCurrentJob: boolean;
  }>;
  certificates: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate: Date | null;
    credentialId: string | null;
  }>;
  skillAssessments: Array<{
    id: string;
    score: number;
    assessment: {
      title: string;
    };
  }>;
  jobApplications?: Array<{
    id: string;
    createdAt: Date;
    status: string;
    jobPosting: {
      title: string;
      company: {
        name: string;
      };
    };
  }>;
}

export interface ApplicantProfileResult {
  user: ProfileUser;
  viewerRole: UserRole;
}

export async function getApplicantProfile(
  adminId: string, 
  applicantId: string
): Promise<ApplicantProfileResult> {
  try {
    // Get company for the current admin
    const company = await prisma.company.findUnique({
      where: { adminId },
      select: { id: true },
    });

    if (!company) {
      throw new Error('Forbidden - No company found for admin');
    }

    // Fetch the applicant's profile
    const profileUserFromDb = await prisma.user.findUnique({
      where: { id: applicantId },
      include: {
        workExperiences: {
          include: {
            company: {
              select: { name: true }
            }
          },
          orderBy: { startDate: 'desc' },
        },
        certificates: {
          include: {
            userAssessment: {
              include: {
                assessment: {
                  select: { title: true }
                }
              }
            }
          },
          orderBy: { issueDate: 'desc' },
        },
        skillAssessments: {
          include: {
            assessment: {
              select: {
                title: true,
              },
            },
          },
        },
        province: true,
        city: true,
        jobApplications: {
          include: {
            jobPosting: {
              include: {
                company: true,
              },
            },
          },
          where: {
            jobPosting: {
              companyId: company.id
            }
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profileUserFromDb) {
      throw new Error('Not Found - Applicant profile not found');
    }

    // Check if the applicant has applied to this company
    const jobApplications = profileUserFromDb.jobApplications as JobApplicationWithRelations[];
    
    if (!jobApplications || jobApplications.length === 0) {
      throw new Error('Forbidden - Applicant has not applied to your company');
    }

    // Transform the user object to match the ProfileUser type expected by the component
    const profileUserForView: ProfileUser = {
      ...profileUserFromDb,
      workExperiences: profileUserFromDb.workExperiences.map(exp => ({
        id: exp.id,
        jobTitle: exp.jobTitle,
        companyName: exp.company.name,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrentJob: exp.employmentStatus === EmploymentStatus.CURRENT_EMPLOYEE || !exp.endDate,
        description: null, 
      })),
      certificates: profileUserFromDb.certificates.map(cert => ({
        id: cert.id,
        name: cert.title,
        issuer: cert.userAssessment.assessment.title,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        credentialId: cert.certificateCode,
      })),
      jobApplications: jobApplications.map(app => ({
        id: app.id,
        createdAt: app.createdAt,
        status: app.status,
        jobPosting: {
          title: app.jobPosting.title,
          company: {
            name: app.jobPosting.company.name,
          },
        },
      })),
    };

    return {
      user: profileUserForView,
      viewerRole: UserRole.COMPANY_ADMIN
    };

  } catch (error) {
    console.error('Error in getApplicantProfile:', error);
    
    // Re-throw the error to be handled by the calling code
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Internal Server Error - Failed to fetch applicant profile');
  }
}