import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateInterviewTime } from '@/lib/dateTimeUtils';
import { interviewEmailService } from '@/services/emails/interview-email';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { interviewId: string } }
) {
  const { interviewId } = params;

  try {
    const interview = await prisma.interviewSchedule.findUnique({
      where: { id: interviewId },
      include: {
        jobApplication: {
          include: {
            jobPosting: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview schedule not found' }, { status: 404 });
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error fetching interview schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch interview schedule' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { interviewId: string; applicantsId: string } }
) {
  const { interviewId, applicantsId } = params;

  try {
    const data = await req.json();
    const { scheduledAt, duration, location, interviewType, notes } = data;

    // Validasi field
    if (!scheduledAt || !duration || !interviewType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Cek apakah interview ada
    const existingInterview = await prisma.interviewSchedule.findUnique({
      where: { id: interviewId },
      include: {
        jobApplication: {
          include: {
            user: true,
            jobPosting: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });

    if (!existingInterview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    if (existingInterview.jobApplication.id !== applicantsId) {
      return NextResponse.json({ error: 'Invalid interview access' }, { status: 403 });
    }

    const timeValidation = validateInterviewTime(new Date(scheduledAt));
    if (!timeValidation.isValid) {
      return NextResponse.json({ error: timeValidation.error }, { status: 400 });
    }

    const updated = await prisma.interviewSchedule.update({
      where: { id: interviewId },
      data: {
        scheduledAt: new Date(scheduledAt),
        duration,
        location,
        interviewType,
        notes,
        updatedAt: new Date(),
      },
    });

    // Kirim email notifikasi reschedule
    await interviewEmailService.sendInterviewScheduled(
      existingInterview.jobApplication.user.email,
      existingInterview.jobApplication.user.firstName || existingInterview.jobApplication.user.name || 'Candidate',
      existingInterview.jobApplication.jobPosting.title,
      existingInterview.jobApplication.jobPosting.company.name,
      new Date(scheduledAt),
      location,
      interviewType
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating interview schedule:', error);
    return NextResponse.json({ error: 'Failed to update interview schedule' }, { status: 500 });
  }
}

// DELETE Interview
export async function DELETE(
  req: Request,
  { params }: { params: { interviewId: string; applicantsId: string } }
) {
  const { interviewId, applicantsId } = params;

  try {
    // Delete interview
    await prisma.interviewSchedule.delete({
      where: { id: interviewId },
    });

    // Update status aplikasi jadi TEST_COMPLETED
    await prisma.jobApplication.update({
      where: { id: applicantsId },
      data: { status: 'TEST_COMPLETED' },
    });

    return NextResponse.json({ message: 'Interview deleted and status reverted.' });
  } catch (error) {
    console.error('Error deleting interview schedule:', error);
    return NextResponse.json({ error: 'Failed to delete interview schedule' }, { status: 500 });
  }
}
