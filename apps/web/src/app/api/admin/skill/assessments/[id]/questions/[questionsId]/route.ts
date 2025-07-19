import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { SkillAssessmentQuestionUpdateSchema } from '@/lib/validations/zodAssessmentValidation';
import {
  SkillAssessmentQuestion,
  SkillAssessmentQuestionUpdateData,
  AuthSession,
  isPrismaError,
  isRecordNotFoundError
} from '@/types/assessments';

// Get Single Question
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string; questionsId: string } }
): Promise<NextResponse> {
  const session = await auth() as AuthSession | null;
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const questionResult = await prisma.skillAssessmentQuestion.findUnique({
      where: {
        id: params.questionsId,
        assessmentId: params.id
      }
    });

    if (!questionResult) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const question: SkillAssessmentQuestion = {
      ...questionResult,
      correctAnswer: questionResult.correctAnswer as "A" | "B" | "C" | "D"
    };

    return NextResponse.json(question);
  } catch (error: unknown) {
    console.error("Error fetching question:", error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

// Update Skill Assessment Question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; questionsId: string } }
): Promise<NextResponse> {
  const session = await auth() as AuthSession | null;
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = SkillAssessmentQuestionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid input',
        details: validation.error.format()
      }, { status: 400 });
    }

    const updateData: SkillAssessmentQuestionUpdateData = validation.data;

    const updatedQuestionResult = await prisma.skillAssessmentQuestion.update({
      where: {
        id: params.questionsId,
        assessmentId: params.id
      },
      data: updateData,
    });

    const updatedQuestion: SkillAssessmentQuestion = {
      ...updatedQuestionResult,
      correctAnswer: updatedQuestionResult.correctAnswer as "A" | "B" | "C" | "D"
    };

    return NextResponse.json(updatedQuestion);
  } catch (error: unknown) {
    console.error("Error updating assessment question:", error);

    if (isPrismaError(error) && isRecordNotFoundError(error)) {
      return NextResponse.json({
        error: 'Question not found or does not belong to this assessment'
      }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to update assessment question' }, { status: 500 });
  }
}

// Delete Skill Assessment Question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  const session = await auth() as AuthSession | null;
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.skillAssessmentQuestion.delete({
      where: {
        id: params.questionId,
        assessmentId: params.id
      },
    });

    return NextResponse.json({ message: 'Question deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting assessment question:", error);

    if (isPrismaError(error) && isRecordNotFoundError(error)) {
      return NextResponse.json({
        error: 'Question not found or does not belong to this assessment'
      }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to delete assessment question' }, { status: 500 });
  }
}