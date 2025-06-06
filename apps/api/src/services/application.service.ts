import prisma from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

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

export interface ApplicationResult {
  id: string;
  status: ApplicationStatus;
  submittedAt: Date;
  jobTitle: string;
  companyName: string;
}

export class ApplicationService {
  static async checkJobPosting(jobPostingId: string) {
    const jobPosting = await prisma.jobPosting.findUnique({
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

    if (!jobPosting) {
      throw new Error('Job posting not found');
    }

    if (!jobPosting.isActive) {
      throw new Error('This job posting is no longer active');
    }

    if (jobPosting.applicationDeadline && new Date() > jobPosting.applicationDeadline) {
      throw new Error('Application deadline has passed');
    }

    return jobPosting;
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

  static async updateUserProfile(userId: string, data: CreateApplicationData, currentUserName?: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber: data.phoneNumber,
        currentAddress: data.currentLocation,
        ...((!currentUserName || currentUserName.trim() === '') && {
          name: data.fullName
        }),
      }
    });
  }

  static async createApplication(data: CreateApplicationData): Promise<ApplicationResult> {
    const jobApplication = await prisma.jobApplication.create({
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

    return {
      id: jobApplication.id,
      status: jobApplication.status,
      submittedAt: jobApplication.createdAt,
      jobTitle: jobApplication.jobPosting.title,
      companyName: jobApplication.jobPosting.company.name,
    };
  }

  static async createNotifications(
    companyAdminId: string, 
    userId: string, 
    jobTitle: string, 
    companyName: string, 
    applicantName: string, 
    applicationId: string
  ) {
    try {
      // Company notification
      await prisma.notification.create({
        data: {
          userId: companyAdminId,
          type: 'NEW_APPLICATION_RECEIVED',
          message: `New application received for ${jobTitle} from ${applicantName}`,
          link: `/company/applications/${applicationId}`,
        }
      });

      // User notification
      await prisma.notification.create({
        data: {
          userId: userId,
          type: 'APPLICATION_STATUS_UPDATE',
          message: `Your application for ${jobTitle} at ${companyName} has been submitted successfully`,
          link: `/applications/${applicationId}`,
        }
      });
    } catch (error) {
      console.error('Failed to create notifications:', error);
      // Don't throw error as notifications are not critical
    }
  }

  static async getApplicationStatus(userId: string, jobPostingId: string) {
    const application = await prisma.jobApplication.findUnique({
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

    return {
      hasApplied: !!application,
      application: application || null
    };
  }
}
