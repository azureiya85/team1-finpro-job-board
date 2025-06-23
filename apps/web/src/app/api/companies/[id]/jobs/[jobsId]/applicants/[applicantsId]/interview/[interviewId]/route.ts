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

  export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
      const data = await req.json();
      const { scheduledAt, duration, location, interviewType, notes, jobApplicationId, jobPostingId, candidateId } = data;
  
      // Hanya validasi field yang benar-benar wajib
      if (!scheduledAt || !duration || !interviewType) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
  
      const timeValidation = validateInterviewTime(new Date(scheduledAt));
      if (!timeValidation.isValid) {
        return NextResponse.json({ error: timeValidation.error }, { status: 400 });
      }
  
      const interview = await prisma.interviewSchedule.update({
        where: { id: params.id },
        data: {
          scheduledAt: new Date(scheduledAt),
          duration,
          location,
          interviewType,
          notes,
          updatedAt: new Date()
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
  
      // Kirim email notifikasi reschedule
      await interviewEmailService.sendInterviewScheduled(
        interview.jobApplication.user.email,
        interview.jobApplication.user.firstName || interview.jobApplication.user.name || 'Candidate',
        interview.jobApplication.jobPosting.title,
        interview.jobApplication.jobPosting.company.name,
        new Date(scheduledAt),
        location,
        interviewType
      );
  
      return NextResponse.json(interview);
    } catch (error) {
      console.error('Error updating interview schedule:', error);
      return NextResponse.json({ error: 'Failed to update interview schedule' }, { status: 500 });
    }
  }
  
  export async function DELETE(req: Request, { params }: { params: { id: string; applicantsId: string } }) {
    try {
      const interview = await prisma.interviewSchedule.delete({
        where: { id: params.id }
      });
  
      // Update status aplikasi kembali ke TEST_COMPLETED
      await prisma.jobApplication.update({
        where: { id: params.applicantsId },
        data: { status: 'TEST_COMPLETED' }
      });
  
      return NextResponse.json(interview);
    } catch (error) {
      console.error('Error deleting interview schedule:', error);
      return NextResponse.json({ error: 'Failed to delete interview schedule' }, { status: 500 });
    }
  }