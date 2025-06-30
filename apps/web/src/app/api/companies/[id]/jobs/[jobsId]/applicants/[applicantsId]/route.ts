import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ApplicationStatus, NotificationType, InterviewType } from '@prisma/client';
import { auth } from '@/auth';
import { updateApplicationStatus } from '@/lib/applicants/applicationStatusHelper';
import { calculateAge } from '@/lib/applicants/applicationStatsHelper';
import type { JobApplicationDetails, UpdateApplicationRequestBody, SubscriptionPlanFeatures } from '@/types/applicants';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: { id: string, jobsId: string, applicantsId: string } }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: companyId, jobsId: jobId, applicantsId: applicationId } = context.params;

    const company = await prisma.company.findFirst({
      where: { id: companyId, adminId: userId },
    });
    if (!company) return NextResponse.json({ error: 'Company not found or unauthorized' }, { status: 404 });

    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId, jobPostingId: jobId, jobPosting: { companyId } },
      include: {
        user: {
          select: {
            id: true, firstName: true, lastName: true, email: true, profileImage: true, dateOfBirth: true,
            lastEducation: true, phoneNumber: true, currentAddress: true,
            province: { select: { name: true } },
            city: { select: { name: true } },
            subscriptions: {
              where: { status: 'ACTIVE', endDate: { gt: new Date() } },
              include: { plan: { select: { name: true, features: true } } },
            }
          }
        },
        jobPosting: { select: { id: true, title: true, salaryMin: true, salaryMax: true } },
        interviewSchedules: {
          select: { id: true, scheduledAt: true, status: true, interviewType: true, duration: true, location: true, notes: true },
          orderBy: { scheduledAt: 'desc' },
        },
      }
    });

    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const user = application.user;
    const age = user.dateOfBirth ? calculateAge(new Date(user.dateOfBirth)) : null;
    const location = [user.city?.name, user.province?.name].filter(Boolean).join(', ');

    const hasPriority = user.subscriptions.some(sub => {
      const features = sub.plan.features as SubscriptionPlanFeatures;
      return sub.plan.name === 'PROFESSIONAL' && features?.priorityCvReview;
    });

    const result: JobApplicationDetails & { isPriority: boolean } = {
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
      latestInterview: application.interviewSchedules[0] ?? null,
      applicant: {
        id: user.id,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET applicant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest, context: { params: { id: string, jobsId: string, applicantsId: string } }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: companyId, jobsId: jobId, applicantsId: applicationId } = context.params;
    const body = (await req.json()) as UpdateApplicationRequestBody;
    const { status, rejectionReason, adminNotes, scheduleInterview } = body;

    if (!status || !Object.values(ApplicationStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid or missing application status' }, { status: 400 });
    }

    const company = await prisma.company.findFirst({ where: { id: companyId, adminId: userId } });
    if (!company) return NextResponse.json({ error: 'Company not found or unauthorized' }, { status: 404 });

    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId, jobPostingId: jobId, jobPosting: { companyId } },
      include: { user: true, jobPosting: true },
    });
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const updated = await updateApplicationStatus(applicationId, status, {
      rejectionReason: rejectionReason || undefined,
      adminNotes: adminNotes || undefined,
      reviewedBy: userId,
    });

    if (scheduleInterview && status === ApplicationStatus.INTERVIEW_SCHEDULED) {
      const { scheduledAt, duration = 60, location, interviewType = InterviewType.ONLINE, notes } = scheduleInterview;

      if (!scheduledAt) return NextResponse.json({ error: 'Interview date required' }, { status: 400 });
      if (!Object.values(InterviewType).includes(interviewType)) return NextResponse.json({ error: 'Invalid interview type' }, { status: 400 });

      await prisma.interviewSchedule.create({
        data: {
          scheduledAt: new Date(scheduledAt),
          duration,
          location: location || undefined,
          interviewType,
          notes: notes || undefined,
          jobApplicationId: applicationId,
          jobPostingId: jobId,
          candidateId: application.user.id,
        },
      });
    }

    await prisma.notification.create({
      data: {
        userId: application.user.id,
        type: NotificationType.APPLICATION_STATUS_UPDATE,
        message: `Your application for "${application.jobPosting.title}" has been ${status.replace('_', ' ').toLowerCase()}.`,
        link: `/applications/${applicationId}`,
      },
    });

    return NextResponse.json({ message: 'Application updated successfully', application: updated });
  } catch (error) {
    console.error('PUT applicant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
