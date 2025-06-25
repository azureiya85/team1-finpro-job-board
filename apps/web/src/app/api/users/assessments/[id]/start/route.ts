import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getUserSubscriptionDetails } from '@/lib/subscription';

interface Params {
  params: Promise<{ id: string }>; 
}

// Fetch questions, no answer
export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
       const { id: assessmentId } = await params;
       const subscriptionDetails = await getUserSubscriptionDetails(userId);

    if (!subscriptionDetails.isActive) {
      return NextResponse.json({ error: 'An active subscription is required to start an assessment.' }, { status: 403 });
    }

    if (subscriptionDetails.limit !== 'unlimited' && subscriptionDetails.assessmentsTaken >= subscriptionDetails.limit) {
      return NextResponse.json({ error: `You have reached your assessment limit of ${subscriptionDetails.limit} for this period. Please upgrade your plan to continue.` }, { status: 403 });
    }

    const assessment = await prisma.skillAssessment.findUnique({
      where: { id: assessmentId, isActive: true }, 
      include: {
        questions: {
          select: { 
            id: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found or not active.' }, { status: 404 });
    }
    
    if (assessment.questions.length !== 25) {
        console.warn(`Assessment ${assessment.id} does not have exactly 25 questions. It has ${assessment.questions.length}.`);
        return NextResponse.json({ error: 'Assessment configuration error: not 25 questions.' }, { status: 500 });
    }

    // Start the timer
    return NextResponse.json({
        assessmentId: assessment.id,
        title: assessment.title,
        timeLimit: assessment.timeLimit,
        questions: assessment.questions,
    });

  } catch (error) {
    console.error("Error starting skill assessment:", error);
    return NextResponse.json({ error: 'Failed to start skill assessment' }, { status: 500 });
  }
}