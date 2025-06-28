import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getUserSubscriptionDetails } from '@/lib/subscription';

// Get All Active Skill Assessments for Subscribed Users
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user's subscription details INSTEAD of just checking for one
    const subscriptionDetails = await getUserSubscriptionDetails(session.user.id);

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

    return NextResponse.json({
      assessments: transformedAssessments,
      subscription: subscriptionDetails,
    });

  } catch (error) {
    console.error("Error fetching available skill assessments:", error);
    return NextResponse.json({ error: 'Failed to fetch skill assessments' }, { status: 500 });
  }
}