import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ApplicationStatus, NotificationType, InterviewType } from '@prisma/client';
import { auth } from '@/auth';
import { updateApplicationStatus } from '@/lib/applicants/applicationStatusHelper';
import { calculateAge } from '@/lib/applicants/applicationStatsHelper';
import type {
  JobApplicationDetails,
  UpdateApplicationRequestBody,
  SubscriptionPlanFeatures, 
} from '@/types/applicants';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: { id: string, jobsId: string, applicantsId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: companyIdFromPath, jobsId: jobIdFromPath, applicantsId: applicationIdFromPath } = context.params;

    const company = await prisma.company.findFirst({
      where: { id: companyIdFromPath, adminId: session.user.id },
    });
    if (!company) {
      return NextResponse.json({ error: 'Company not found or unauthorized' }, { status: 404 });
    }

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationIdFromPath,
        jobPostingId: jobIdFromPath,
        jobPosting: {
          companyId: companyIdFromPath,
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
            dateOfBirth: true,
            lastEducation: true,
            phoneNumber: true,
            currentAddress: true,
            province: { select: { name: true } },
            city: { select: { name: true } },
            subscriptions: {
              where: {
                status: 'ACTIVE',
                endDate: { gt: new Date() }
              },
              include: {
                plan: {
                  select: {
                    name: true,
                    features: true
                  }
                }
              }
            }
          },
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            salaryMin: true,
            salaryMax: true,
          },
        },
        interviewSchedules: {
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            interviewType: true,
            duration: true,
            location: true,
            notes: true
          },
          orderBy: { scheduledAt: 'desc' },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found, or does not belong to this job/company' }, { status: 404 });
    }

    const user = application.user;
    const age = user.dateOfBirth ? calculateAge(new Date(user.dateOfBirth)) : null;
    const location = [user.city?.name, user.province?.name].filter(Boolean).join(', ');

    const hasPriority = user.subscriptions.some(sub => {
      const features = sub.plan.features as SubscriptionPlanFeatures;
      return sub.plan.name === 'PROFESSIONAL' && features?.priorityCvReview === true;
    });

    const transformedApplication: JobApplicationDetails & { isPriority: boolean } = {
      id: application.id,
      status: application.status,
      expectedSalary: application.expectedSalary,
      coverLetter: application.coverLetter,
      cvUrl: application.cvUrl,
      rejectionReason: application.rejectionReason,
      adminNotes: application.adminNotes,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      reviewedAt: application.reviewedAt,
      jobPosting: application.jobPosting,
      latestInterview: application.interviewSchedules.length > 0 ? application.interviewSchedules[0] : null,
      applicant: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        age,
        education: user.lastEducation,
        phoneNumber: user.phoneNumber,
        location,
        currentAddress: user.currentAddress,
      },
      isPriority: hasPriority,
    };

    return NextResponse.json(transformedApplication);

  } catch (error) {
    console.error('Error fetching applicant details:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: Update status of a specific applicant for a specific job
export async function PUT(
  request: NextRequest,
 context: { params: { id: string, jobsId: string, applicantsId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: companyIdFromPath, jobsId: jobIdFromPath, applicantsId: applicationIdFromPath } = context.params;
    const body = (await request.json()) as UpdateApplicationRequestBody;

    const {
      status,
      rejectionReason,
      adminNotes,
      scheduleInterview,
    } = body;

    if (!status) {
      return NextResponse.json({
        error: 'Status is required'
      }, { status: 400 });
    }

    if (!Object.values(ApplicationStatus).includes(status)) {
      return NextResponse.json({
        error: 'Invalid application status value'
      }, { status: 400 });
    }

    const company = await prisma.company.findFirst({
      where: { id: companyIdFromPath, adminId: session.user.id },
    });
    if (!company) {
      return NextResponse.json({
        error: 'Company not found or unauthorized'
      }, { status: 404 });
    }

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationIdFromPath,
        jobPostingId: jobIdFromPath,
        jobPosting: { companyId: companyIdFromPath },
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        jobPosting: { select: { id: true, title: true } },
      },
    });

      if (!application) {
      return NextResponse.json({
        error: 'Application not found or does not belong to this job/company'
      }, { status: 404 });
    }

    const updatedApplication = await updateApplicationStatus(
      applicationIdFromPath,
      status,
      {
        rejectionReason: rejectionReason || undefined,
        adminNotes: adminNotes || undefined,
        reviewedBy: session.user.id,
      }
    );

    if (scheduleInterview && status === ApplicationStatus.INTERVIEW_SCHEDULED) {
      const {
        scheduledAt,
        duration = 60,
        location,
        interviewType = InterviewType.ONLINE,
        notes,
      } = scheduleInterview;

      if (!scheduledAt) {
        return NextResponse.json({
          error: 'Interview scheduled date is required'
        }, { status: 400 });
      }

      if (interviewType && !Object.values(InterviewType).includes(interviewType)) {
        return NextResponse.json({
          error: 'Invalid interview type value'
        }, { status: 400 });
      }

      await prisma.interviewSchedule.create({
        data: {
          scheduledAt: new Date(scheduledAt),
          duration,
          location: location || undefined,
          interviewType,
          notes: notes || undefined,
           jobApplicationId: applicationIdFromPath,
          jobPostingId: jobIdFromPath,
          candidateId: application.user.id,
        },
      });
    }

    await prisma.notification.create({
      data: {
        userId: application.user.id,
        type: NotificationType.APPLICATION_STATUS_UPDATE,
        message: `Your application for "${application.jobPosting.title}" has been ${status.toLowerCase().replace('_', ' ')}.`,
       link: `/applications/${applicationIdFromPath}`,
      },
    });

    return NextResponse.json({
      message: 'Application status updated successfully',
      application: updatedApplication,
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}