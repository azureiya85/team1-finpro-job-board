import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { SkillAssessmentQuestionCreateSchema } from '@/lib/validations/zodAssessmentValidation';

interface Params {
  params: { assessmentId: string };
}
const MAX_QUESTIONS = 25; 

// Create Skill Assessment Question
export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const assessment = await prisma.skillAssessment.findUnique({
        where: { id: params.assessmentId },
        include: { _count: { select: { questions: true } } }
    });
    if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    if (assessment._count.questions >= MAX_QUESTIONS) {
        return NextResponse.json({ error: `Cannot add more than ${MAX_QUESTIONS} questions.` }, { status: 400 });
    }

    const body = await request.json();
    const validation = SkillAssessmentQuestionCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    const newQuestion = await prisma.skillAssessmentQuestion.create({
      data: {
        ...validation.data,
        assessmentId: params.assessmentId,
      },
    });
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment question:", error);
    return NextResponse.json({ error: 'Failed to create assessment question' }, { status: 500 });
  }
}

// Get All Questions for an Assessment
export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const questions = await prisma.skillAssessmentQuestion.findMany({
      where: { assessmentId: params.assessmentId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching assessment questions:", error);
    return NextResponse.json({ error: 'Failed to fetch assessment questions' }, { status: 500 });
  }
}