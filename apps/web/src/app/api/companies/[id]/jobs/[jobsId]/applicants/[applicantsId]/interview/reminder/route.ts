import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { interviewEmailService } from '@/services/emails/interview-email';

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { id: string; jobsId: string; applicantsId: string } }
) {
  try {
    // Ambil data interview
    const interview = await prisma.interviewSchedule.findFirst({
      where: {
        jobApplicationId: params.applicantsId,
        jobPostingId: params.jobsId
      },
      include: {
        jobApplication: {
          include: {
            jobPosting: {
              include: {
                company: true
              }
            },
            user: true
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

    if (!interview.jobApplication) {
      return NextResponse.json(
        { error: 'Job application not found' },
        { status: 404 }
      );
    }

    const { jobApplication } = interview;
    const { jobPosting } = jobApplication;
    const { company } = jobPosting;
    const { user } = jobApplication;

    // Hitung waktu tersisa dalam menit
    const currentTime = new Date();
    const interviewTime = new Date(interview.scheduledAt);
    const minutesUntilInterview = Math.floor(
      (interviewTime.getTime() - currentTime.getTime()) / (1000 * 60)
    );

    // Kirim email reminder
    await interviewEmailService.sendInterviewReminder(
      user.email,
      user.firstName || user.name || 'Candidate',
      jobPosting.title,
      company.name,
      interview.scheduledAt,
      interview.location || '',
      interview.interviewType,
      minutesUntilInterview
    );

    // Update status reminder
    await prisma.interviewSchedule.update({
      where: { id: interview.id },
      data: { reminderSent: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending interview reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send interview reminder' },
      { status: 500 }
    );
  }
}