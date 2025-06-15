import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
// import { SubscriptionStatus } from '@prisma/client';
import { AssessmentSubmissionSchema } from '@/lib/validations/zodAssessmentValidation';
import { isPrismaError } from '@/types/assessments';
import { generateCertificate } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// User submits assessment answers
export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // FIX: Await the params promise and get the 'id'
    const { id: assessmentId } = await params;

    // --- TEMPORARILY COMMENTED OUT FOR TESTING ---
    /*
    const activeSubscription = await prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE, endDate: { gt: new Date() } },
    });
    if (!activeSubscription) {
      return NextResponse.json({ error: 'Active subscription required.' }, { status: 403 });
    }
    */
    // --- END OF TEMPORARY COMMENT ---

    const body = await request.json();
    const validation = AssessmentSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    const { answers, timeSpent } = validation.data;

    const assessment = await prisma.skillAssessment.findUnique({
      where: { id: assessmentId, isActive: true },
      include: { questions: true },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found or not active.' }, { status: 404 });
    }

    // Server-side time check
    if (timeSpent > assessment.timeLimit) {
      // Handle late submission - e.g., auto-fail or mark as late
      console.warn(`User ${userId} exceeded time limit for assessment ${assessment.id}.`);
    }

    if (answers.length !== assessment.questions.length) {
        return NextResponse.json({ error: `Expected ${assessment.questions.length} answers, received ${answers.length}.`}, { status: 400 });
    }
    if (assessment.questions.length !== 25) {
        console.error(`Assessment ${assessment.id} does not have 25 questions.`);
        return NextResponse.json({ error: 'Assessment configuration error.' }, { status: 500 });
    }

    let correctAnswersCount = 0;
    for (const userAnswer of answers) {
      const question = assessment.questions.find(q => q.id === userAnswer.questionId);
      if (question && question.correctAnswer === userAnswer.selectedOption) {
        correctAnswersCount++;
      }
    }

    const score = Math.round((correctAnswersCount / assessment.questions.length) * 100);
    const isPassed = score >= assessment.passingScore;

    // Create or update UserSkillAssessment record
    const userAssessment = await prisma.userSkillAssessment.upsert({
      where: { userId_assessmentId: { userId, assessmentId: assessment.id } },
      update: {
        score,
        isPassed,
        completedAt: new Date(),
        timeSpent, // in minutes
        badgeEarned: isPassed,
        badgeIssuedAt: isPassed ? new Date() : null,
      },
      create: {
        userId,
        assessmentId: assessment.id,
        score,
        isPassed,
        completedAt: new Date(),
        timeSpent,
        badgeEarned: isPassed,
        badgeIssuedAt: isPassed ? new Date() : null,
      },
    });

    let certificateData = null;
    if (isPassed) {
      const existingCertificate = await prisma.certificate.findFirst({
        where: { userAssessmentId: userAssessment.id }
      });
      if (!existingCertificate) {
        certificateData = await generateCertificate(userId, userAssessment.id, assessment.title);
      } else {
        certificateData = existingCertificate;
      }
    }

    return NextResponse.json({
      score,
      isPassed,
      passingScore: assessment.passingScore,
      userAssessmentId: userAssessment.id,
      certificate: certificateData,
      badgeEarned: userAssessment.badgeEarned,
    });

  } catch (error) {
    console.error("Error submitting skill assessment:", error);
    if (isPrismaError(error)) {
      if (error.code === 'P2002' && error.meta?.target?.includes('userId_assessmentId')) {
          return NextResponse.json({ error: 'Assessment already submitted. Contact support if this is an error.' }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Failed to submit skill assessment' }, { status: 500 });
  }
}