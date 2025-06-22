import { NextResponse } from 'next/server';
import { PrismaClient, InterviewStatus } from '@prisma/client';
import { validateInterviewTime } from '@/lib/dateTimeUtils';

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

    // Dapatkan data job application untuk mendapatkan candidateId
    const jobApplication = await prisma.jobApplication.findUnique({
      where: { id: params.applicantsId },
      select: {
        userId: true
      }
    });

    if (!jobApplication) {
      return NextResponse.json(
        { error: 'Job application not found' },
        { status: 404 }
      );
    }

    const interview = await prisma.interviewSchedule.create({
      data: {
        scheduledAt: new Date(scheduledAt),
        duration,
        location,
        interviewType,
        notes,
        jobApplicationId: params.applicantsId,
        jobPostingId: params.jobsId,
        candidateId: jobApplication.userId,
        status: InterviewStatus.SCHEDULED
      }
    });

    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error creating interview schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create interview schedule' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const { scheduledAt, duration, location, interviewType, notes, status } = data;

    // Validasi waktu interview jika ada perubahan jadwal
    if (scheduledAt) {
      const timeValidation = validateInterviewTime(new Date(scheduledAt));
      if (!timeValidation.isValid) {
        return NextResponse.json({ error: timeValidation.error }, { status: 400 });
      }
    }

    const interview = await prisma.interviewSchedule.update({
      where: { id: params.id },
      data: {
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        duration,
        location,
        interviewType,
        notes,
        status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error updating interview schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update interview schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const interview = await prisma.interviewSchedule.update({
      where: { id: params.id },
      data: {
        status: InterviewStatus.CANCELLED,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error cancelling interview schedule:', error);
    return NextResponse.json(
      { error: 'Failed to cancel interview schedule' },
      { status: 500 }
    );
  }
}