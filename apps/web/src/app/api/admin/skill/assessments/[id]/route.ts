import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { SkillAssessmentUpdateSchema } from '@/lib/validations/zodAssessmentValidation';
import {
  SkillAssessmentWithRelations,
  SkillAssessment,
  SkillAssessmentUpdateData,
  AuthSession,
  isPrismaError,
  isRecordNotFoundError
} from '@/types/assessments';

interface AssessmentRouteParams {
  params: Promise<{ id: string }>;
}

// Get Single Skill Assessment include questions
export async function GET(request: Request, { params }: AssessmentRouteParams) {
  const session = await auth() as AuthSession | null;
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const assessmentResult = await prisma.skillAssessment.findUnique({
      where: { id },
      include: {
        category: true,
        questions: { orderBy: { createdAt: 'asc' } }, // Developers see questions
      },
    });
    
    if (!assessmentResult) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    
    // Transform the result to match our type definitions
    const assessment: SkillAssessmentWithRelations = {
      ...assessmentResult,
      questions: assessmentResult.questions.map(q => ({
        ...q,
        correctAnswer: q.correctAnswer as "A" | "B" | "C" | "D"
      }))
    };
    
    return NextResponse.json(assessment);
  } catch (error: unknown) {
    console.error("Error fetching skill assessment:", error);
    return NextResponse.json({ error: 'Failed to fetch skill assessment' }, { status: 500 });
  }
}

// Update Skill Assessment
export async function PUT(request: Request, { params }: AssessmentRouteParams) {
  const session = await auth() as AuthSession | null;
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = SkillAssessmentUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }
    
    const updateData: SkillAssessmentUpdateData = validation.data;
    
    if (updateData.categoryId) {
      const categoryExists = await prisma.skillCategory.findUnique({ 
        where: { id: updateData.categoryId } 
      });
      if (!categoryExists) {
        return NextResponse.json({ error: 'Category not found' }, { status: 400 });
      }
    }

    const updatedAssessmentResult = await prisma.skillAssessment.update({
      where: { id },
      data: updateData,
    });
    
    const updatedAssessment: SkillAssessment = updatedAssessmentResult;
    
    return NextResponse.json(updatedAssessment);
  } catch (error: unknown) {
    console.error("Error updating skill assessment:", error);
    
    if (isPrismaError(error) && isRecordNotFoundError(error)) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to update skill assessment' }, { status: 500 });
  }
}

// Delete Skill Assessment
export async function DELETE(request: Request, { params }: AssessmentRouteParams) {
  const session = await auth() as AuthSession | null;
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    // Check if users have taken this assessment.
    const userAssessmentsCount = await prisma.userSkillAssessment.count({
      where: { assessmentId: id }
    });
    
    if (userAssessmentsCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete assessment taken by users. Consider deactivating it.' 
      }, { status: 409 });
    }

    await prisma.skillAssessment.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Assessment deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting skill assessment:", error);
    
    if (isPrismaError(error) && isRecordNotFoundError(error)) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to delete skill assessment' }, { status: 500 });
  }
}