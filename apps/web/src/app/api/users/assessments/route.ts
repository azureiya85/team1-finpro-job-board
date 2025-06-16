import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
// import { SubscriptionStatus } from '@prisma/client';

// Get All Active Skill Assessments for Subscribed Users
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check for active subscription
  // --- TEMPORARILY COMMENTED OUT FOR TESTING ---
    /*
    // Check for active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gt: new Date() },
      },
    });

    if (!activeSubscription) {
      return NextResponse.json({ error: 'Active subscription required to access skill assessments.' }, { status: 403 });
    }
    */
    // --- END OF TEMPORARY COMMENT ---

    const assessments = await prisma.skillAssessment.findMany({
      where: { 
        isActive: true
      },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
        category: { select: { name: true, icon: true } },
        _count: { select: { questions: true } },
        userAssessments: {
          where: { userId: session.user.id },
          select: {
            isPassed: true,
            score: true,
            completedAt: true,
            certificates: {
              select: {
                certificateUrl: true,
                certificateCode: true
              }
            }
          }
        }
      },
    });

    // Transform the data to include userAssessment info at the top level
    const transformedAssessments = assessments.map(assessment => ({
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      timeLimit: assessment.timeLimit,
      category: assessment.category,
      _count: assessment._count,
      userAssessment: assessment.userAssessments.length > 0 ? {
        ...assessment.userAssessments[0],
        certificate: assessment.userAssessments[0].certificates.length > 0 ? assessment.userAssessments[0].certificates[0] : null
      } : null
    }));

    return NextResponse.json(transformedAssessments);
  } catch (error) {
    console.error("Error fetching available skill assessments:", error);
    return NextResponse.json({ error: 'Failed to fetch skill assessments' }, { status: 500 });
  }
}