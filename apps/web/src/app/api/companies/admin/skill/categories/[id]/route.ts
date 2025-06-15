import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { SkillCategoryUpdateSchema } from '@/lib/validations/zodAssessmentValidation';
import {
  CategoryRouteParams,
  SkillCategory,
  SkillCategoryUpdateData,
  AuthSession,
  isPrismaError,
  isRecordNotFoundError
} from '@/types/assessments';

// Get Single Skill Category
export async function GET(request: Request, { params }: CategoryRouteParams) {
  const session = await auth() as AuthSession | null;
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const category: SkillCategory | null = await prisma.skillCategory.findUnique({
      where: { id: params.categoryId },
    });
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error("Error fetching skill category:", error);
    return NextResponse.json({ error: 'Failed to fetch skill category' }, { status: 500 });
  }
}

// Update Skill Category
export async function PUT(request: Request, { params }: CategoryRouteParams) {
  const session = await auth() as AuthSession | null;
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = SkillCategoryUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const updateData: SkillCategoryUpdateData = validation.data;
    
    const updatedCategory: SkillCategory = await prisma.skillCategory.update({
      where: { id: params.categoryId },
      data: updateData,
    });
    
    return NextResponse.json(updatedCategory);
  } catch (error: unknown) {
    console.error("Error updating skill category:", error);
    
    if (isPrismaError(error) && isRecordNotFoundError(error)) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to update skill category' }, { status: 500 });
  }
}

// Delete Skill Category
export async function DELETE(request: Request, { params }: CategoryRouteParams) {
  const session = await auth() as AuthSession | null;
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if any assessments are using this category
    const assessmentsCount = await prisma.skillAssessment.count({
      where: { categoryId: params.categoryId }
    });
    
    if (assessmentsCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category with active assessments. Please reassign or delete assessments first.' 
      }, { status: 409 }); // Conflict
    }

    await prisma.skillCategory.delete({
      where: { id: params.categoryId },
    });
    
    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting skill category:", error);
    
    if (isPrismaError(error) && isRecordNotFoundError(error)) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to delete skill category' }, { status: 500 });
  }
}