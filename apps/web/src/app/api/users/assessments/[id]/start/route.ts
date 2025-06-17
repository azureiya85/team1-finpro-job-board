import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
// import { SubscriptionStatus } from '@prisma/client';

interface Params {
  params: Promise<{ id: string }>; 
}

// Fetch questions, no answer
export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Await params to get the actual parameters
    const { id } = await params;

    // --- TEMPORARILY COMMENTED OUT FOR TESTING ---
    /*
    const activeSubscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: SubscriptionStatus.ACTIVE, endDate: { gt: new Date() } },
    });
    if (!activeSubscription) {
      return NextResponse.json({ error: 'Active subscription required.' }, { status: 403 });
    }
    */
    // --- END OF TEMPORARY COMMENT ---

    const assessment = await prisma.skillAssessment.findUnique({
      where: { id, isActive: true }, // Use the awaited id
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