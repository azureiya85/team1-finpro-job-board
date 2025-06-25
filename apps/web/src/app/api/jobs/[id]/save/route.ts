import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth'; 
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string; 
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth(); 

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: jobId } = await params;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const jobExists = await prisma.jobPosting.findUnique({
      where: { id: jobId },
    });

    if (!jobExists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const existingSavedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobPostingId: {
          userId: userId,
          jobPostingId: jobId,
        },
      },
    });

    if (existingSavedJob) {
      // Unsave the job
      await prisma.savedJob.delete({
        where: {
          id: existingSavedJob.id,
        },
      });
      return NextResponse.json({ message: 'Job removed from saved list.', saved: false }, { status: 200 });
    } else {
      // Save the job
      await prisma.savedJob.create({
        data: {
          userId: userId,
          jobPostingId: jobId,
        },
      });
      return NextResponse.json({ message: 'Job saved successfully.', saved: true }, { status: 201 });
    }
  } catch (error) {
    console.error('Error in /api/jobs/[id]/save:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}