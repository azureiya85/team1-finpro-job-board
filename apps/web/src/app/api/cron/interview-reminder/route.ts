import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { interviewEmailService } from '@/services/emails/interview-email';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingInterviews = await prisma.interviewSchedule.findMany({
      where: {
        scheduledAt: {
          gt: now,
          lt: tomorrow
        },
        reminderSent: false
      },
      include: {
        jobApplication: {
          include: {
            user: true,
            jobPosting: {
              include: {
                company: true
              }
            }
          }
        }
      }
    });

    for (const interview of upcomingInterviews) {
      const { jobApplication } = interview;
      const { user, jobPosting } = jobApplication;
      
      const userName = user.name || '';
      const interviewLocation = interview.location || '';
      const interviewNotes = interview.notes || '';

      await interviewEmailService.sendInterviewReminder(
        user.email,
        userName,
        jobPosting.title,
        jobPosting.company.name,
        interview.scheduledAt,
        interviewLocation,
        interview.interviewType,
        interview.duration,
        interviewNotes
      );

      await prisma.interviewSchedule.update({
        where: { id: interview.id },
        data: { reminderSent: true }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Interview Reminder ${upcomingInterviews.length} successfully sent`
    });

  } catch (error) {
    console.error('Error sending interview reminders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed sending interview reminders' },
      { status: 500 }
    );
  }
}