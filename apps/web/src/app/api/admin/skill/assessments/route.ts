import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { SkillAssessmentCreateSchema } from '@/lib/validations/zodAssessmentValidation';

// Create Skill Assessment
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = SkillAssessmentCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    // Check if category exists
    const categoryExists = await prisma.skillCategory.findUnique({ where: {id: validation.data.categoryId }});
    if (!categoryExists) {
        return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    const newAssessment = await prisma.skillAssessment.create({
      data: validation.data,
    });
    return NextResponse.json(newAssessment, { status: 201 });
  } catch (error) {
    console.error("Error creating skill assessment:", error);
    return NextResponse.json({ error: 'Failed to create skill assessment' }, { status: 500 });
  }
}

// Get All Skill Assessments
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const assessments = await prisma.skillAssessment.findMany({
      orderBy: { title: 'asc' },
      include: { 
        category: true,
        _count: { select: { questions: true }} 
      },
    });
    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching skill assessments:", error);
    return NextResponse.json({ error: 'Failed to fetch skill assessments' }, { status: 500 });
  }
}