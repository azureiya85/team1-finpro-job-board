import prisma from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';
import { submitCVSchema } from '@/lib/validations/zodApplicationValidation';
import { z } from 'zod';
import { 
  JobPostingWithCompany, 
  JobApplicationWithDetails 
} from '@/types/apiTypes';

export interface CreateApplicationData {
  userId: string;
  jobPostingId: string;
  cvUrl: string;
  expectedSalary?: number;
  coverLetter?: string;
  fullName: string;
  phoneNumber?: string;
  currentLocation?: string;
}

export interface UserUpdateData {
  phoneNumber?: string;
  currentAddress?: string;  
  name?: string;
}

export interface JobApplicationResponse {
  id: string;
  status: string;
  submittedAt: Date;
  jobTitle: string;
  companyName: string;
}

export class JobApplicationService {
  static async validateApplicationData(body: unknown) {
    const validationResult = submitCVSchema.safeParse(body);
    if (!validationResult.success) {
      throw new z.ZodError(validationResult.error.issues);
    }
    return validationResult.data;
  }

  static async findJobPosting(jobPostingId: string): Promise<JobPostingWithCompany | null> {
    return prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            adminId: true,
          }
        }
      }
    });
  }

  static validateJobPosting(jobPosting: JobPostingWithCompany | null): asserts jobPosting is JobPostingWithCompany {
    if (!jobPosting) {
      throw new Error('Job posting not found');
    }

    if (!jobPosting.isActive) {
      throw new Error('This job posting is no longer active');
    }

    if (jobPosting.applicationDeadline && new Date() > jobPosting.applicationDeadline) {
      throw new Error('Application deadline has passed');
    }
  }

  static async checkExistingApplication(userId: string, jobPostingId: string) {
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        userId_jobPostingId: {
          userId,
          jobPostingId
        }
      }
    });

    if (existingApplication) {
      throw new Error('You have already applied for this position');
    }
  }

  static buildUserUpdateData(
    currentUserName: string | null, 
    fullName: string, 
    phoneNumber?: string, 
    currentLocation?: string
  ): UserUpdateData {
    const userUpdateData: UserUpdateData = {};
    
    if (phoneNumber) {
      userUpdateData.phoneNumber = phoneNumber;
    }
    
    if (currentLocation) {
      userUpdateData.currentAddress = currentLocation;
    }
    
    // Update name if not set or empty
    if ((!currentUserName || currentUserName.trim() === '') && fullName) {
      userUpdateData.name = fullName;
    }

    return userUpdateData;
  }

  static async updateUserProfile(userId: string, updateData: UserUpdateData) {
    if (Object.keys(updateData).length === 0) {
      return null;
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  static async createApplication(data: CreateApplicationData): Promise<JobApplicationWithDetails> {
    return prisma.jobApplication.create({
      data: {
        userId: data.userId,
        jobPostingId: data.jobPostingId,
        cvUrl: data.cvUrl,
        expectedSalary: data.expectedSalary,
        coverLetter: data.coverLetter,
        status: ApplicationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            currentAddress: true,
          }
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });
  }

  static async getApplicationStatus(userId: string, jobPostingId: string) {
    return prisma.jobApplication.findUnique({
      where: {
        userId_jobPostingId: {
          userId,
          jobPostingId
        }
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      }
    });
  }

  static formatApplicationResponse(application: JobApplicationWithDetails): JobApplicationResponse {
    return {
      id: application.id,
      status: application.status,
      submittedAt: application.createdAt,
      jobTitle: application.jobPosting.title,
      companyName: application.jobPosting.company.name,
    };
  }
}