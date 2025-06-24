import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string; 
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id: requestedUserId } = await params; 

    // A user can only request their own saved jobs
    if (!session?.user?.id || session.user.id !== requestedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: {
        userId: requestedUserId,
      },
      include: {
        jobPosting: {
          include: {
            company: {
              select: { id: true, name: true, logo: true },
            },
            city: {
              select: { name: true },
            },
            province: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(savedJobs, { status: 200 });

  } catch (error) {
    console.error('Error in /api/users/[id]/saved-jobs:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}