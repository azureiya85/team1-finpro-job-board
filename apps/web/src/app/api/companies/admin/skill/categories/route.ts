import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma'; 
import { UserRole } from '@prisma/client';
import { SkillCategoryCreateSchema } from '@/lib/validations/zodAssessmentValidation';

// Create Skill Category
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = SkillCategoryCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    const newCategory = await prisma.skillCategory.create({
      data: validation.data,
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating skill category:", error);
    return NextResponse.json({ error: 'Failed to create skill category' }, { status: 500 });
  }
}

// Get All Skill Categories
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.Developer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching skill categories:", error);
    return NextResponse.json({ error: 'Failed to fetch skill categories' }, { status: 500 });
  }
}