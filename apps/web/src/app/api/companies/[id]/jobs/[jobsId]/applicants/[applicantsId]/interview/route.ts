import { NextResponse } from 'next/server';
import { PrismaClient, InterviewStatus } from '@prisma/client';
import { validateInterviewTime } from '@/lib/dateTimeUtils';
import { interviewEmailService } from '@/services/emails/interview-email';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const interview = await prisma.interviewSchedule.findUnique({
      where: { id: params.id },
      include: {
        jobApplication: {
          include: {
            jobPosting: {
              include: {
                company: true
              }
            }
          }
        }
      }
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error fetching interview schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview schedule' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string; jobsId: string; applicantsId: string } }
) {
  try {
    const data = await req.json();
    const { scheduledAt, duration, location, interviewType, notes } = data;

    // Validasi waktu interview
    const timeValidation = validateInterviewTime(new Date(scheduledAt));
    if (!timeValidation.isValid) {
      return NextResponse.json({ error: timeValidation.error }, { status: 400 });
    }

    // Dapatkan data job application dengan informasi user dan job posting
    const jobApplication = await prisma.jobApplication.findUnique({
      where: { id: params.applicantsId },
      include: {
        user: true,
        jobPosting: {
          include: {
            company: true
          }
        }
      }
    });

    if (!jobApplication) {
      return NextResponse.json(
        { error: 'Job application not found' },
        { status: 404 }
      );
    }

    // Buat jadwal interview
    const interview = await prisma.interviewSchedule.create({
      data: {
        scheduledAt: new Date(scheduledAt),
        duration,
        location,
        interviewType,
        notes,
        jobApplicationId: params.applicantsId,
        jobPostingId: params.jobsId,
        candidateId: jobApplication.user.id,
        status: InterviewStatus.SCHEDULED
      }
    });

    await prisma.jobApplication.update({
      where: { id: params.applicantsId },
      data: { status: 'INTERVIEW_SCHEDULED' }
    });

    await interviewEmailService.sendInterviewScheduled(
      jobApplication.user.email,
      jobApplication.user.firstName || jobApplication.user.name || 'Candidate',
      jobApplication.jobPosting.title,
      jobApplication.jobPosting.company.name,
      new Date(scheduledAt),
      location,
      interviewType
    );

    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error creating interview schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create interview schedule' },
      { status: 500 }
    );
  }
}
