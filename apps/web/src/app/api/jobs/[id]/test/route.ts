import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Question, Test } from '@/types/testTypes';
import { validateQuestion, prepareTestData } from '@/lib/actions/testActions';
import { PreSelectionTest, PreSelectionQuestion } from '@prisma/client';

type TestWithQuestions = PreSelectionTest & {
  questions: PreSelectionQuestion[]
};

type QuestionInput = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Pastikan untuk selalu include id dalam query
    const tests = await prisma.preSelectionTest.findMany({
      where: {
        jobPostings: {
          some: {
            id: params.id
          }
        }
      },
      select: {
        id: true,        // Pastikan id selalu diambil
        title: true,
        description: true,
        timeLimit: true,
        passingScore: true,
        isActive: true,
        questions: {
          select: {
            id: true,    // Pastikan id question juga diambil
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            correctAnswer: true,
            explanation: true
          }
        }
      }
    });
    
    if (!tests || tests.length === 0) {
      return NextResponse.json({ error: 'No tests found for this job' }, { status: 404 });
    }

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error in GET /api/jobs/[id]/test:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithCompany = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        company: true,
      },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const data = await request.json();
    
    if (!data.title || !data.timeLimit || !data.passingScore || !Array.isArray(data.questions)) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, timeLimit, passingScore, or questions' 
      }, { status: 400 });
    }

    const testInput: Omit<PreSelectionTest, 'id' | 'createdAt' | 'updatedAt'> = {
      title: data.title,
      description: data.description || '',
      timeLimit: data.timeLimit,
      passingScore: data.passingScore,
      isActive: true,
      companyId: userWithCompany.company.id
    };

    const questions = data.questions.map((q: QuestionInput): Question => ({
      id: '',
      question: q.question || '',
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      testId: '',
      isValid: true,
      errors: {}
    }));

    const errors: Record<string, Record<string, string>> = {};
    
    questions.forEach((question: Question, index: number) => {
      const questionErrors = validateQuestion(question);
      if (Object.keys(questionErrors).length > 0) {
        errors[`question_${index}`] = questionErrors;
      }
    });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const questionsForPrisma = questions.map((q: Question) => ({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation
    }));

    const test = await prisma.preSelectionTest.create({
      data: {
        ...testInput,
        questions: {
          create: questionsForPrisma
        },
        jobPostings: {
          connect: [{ id: params.id }]
        }
      },
      include: {
        questions: true
      }
    });

    // Ubah hasil Prisma menjadi Test yang valid
    const formattedTest: Test = {
      ...test,
      questions: test.questions.map((q: PreSelectionQuestion): Question => ({
        ...q,
        explanation: q.explanation || '', // memastikan tidak null
        isValid: true,
        errors: {}
      })),
      isEditing: false,
      isDraft: false
    };

    return NextResponse.json(formattedTest);
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
}