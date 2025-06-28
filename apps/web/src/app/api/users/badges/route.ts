import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export interface UserBadge {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentIcon?: string | null;
  earnedAt: Date;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userAssessments = await prisma.userSkillAssessment.findMany({
      where: {
        userId: session.user.id,
        isPassed: true,
        badgeEarned: true,
      },
      select: {
        id: true,
        assessmentId: true,
        completedAt: true,
        assessment: {
          select: {
            title: true,
            category: {
              select: {
                icon: true,
              }
            }
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    const badges: UserBadge[] = userAssessments.map(ua => ({
      id: ua.id,
      assessmentId: ua.assessmentId,
      assessmentTitle: ua.assessment.title,
      assessmentIcon: ua.assessment.category?.icon ?? null,
      earnedAt: ua.completedAt!, 
    }));

    return NextResponse.json(badges);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
  }
}