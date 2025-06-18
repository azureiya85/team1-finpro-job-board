import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole } from '@prisma/client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: userId } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.id !== userId && session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const applications = await prisma.jobApplication.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        rejectionReason: true,
        adminNotes: true,
        testResult: {
          select: {
            score: true,
            passed: true
          }
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            isRemote: true,
            preSelectionTestId: true,
            preSelectionTest: {
              select: {
                id: true,
                title: true,
                passingScore: true,
                timeLimit: true
              }
            },
            province: {
              select: {
                name: true,
              },
            },
            city: {
              select: {
                name: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
        interviewSchedules: {
          select: {
            id: true,
            scheduledAt: true,
            duration: true,
            location: true,
            interviewType: true,
            notes: true,
            status: true,
          },
          orderBy: {
            scheduledAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error(`Error fetching applications for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}