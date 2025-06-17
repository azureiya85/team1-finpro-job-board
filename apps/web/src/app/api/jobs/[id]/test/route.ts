import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;
    const { title, description, questions, passingScore, timeLimit } = await request.json();

    if (!title || !description || !questions || questions.length === 0 || !passingScore) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: { companyId: true }
    });

    if (!jobPosting) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }

    const test = await prisma.preSelectionTest.create({
      data: {
        title,
        passingScore,
        timeLimit,
        companyId: jobPosting.companyId,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          }))
        },
        jobPostings: {
          connect: { id: jobId }
        }
      },
      include: {
        questions: true
      }
    });

    return NextResponse.json(test);
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}