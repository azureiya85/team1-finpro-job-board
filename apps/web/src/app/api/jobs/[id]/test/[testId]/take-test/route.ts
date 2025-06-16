import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Endpoint untuk mengambil soal test
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; testId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cek apakah user sudah pernah mengambil test ini
    const existingResult = await prisma.testResult.findFirst({
      where: {
        testId: params.testId,
        userId: session.user.id
      }
    });

    if (existingResult) {
      return NextResponse.json(
        { error: 'You have already taken this test' },
        { status: 400 }
      );
    }

    const test = await prisma.preSelectionTest.findUnique({
      where: {
        id: params.testId
      },
      select: {
        id: true,
        title: true,
        timeLimit: true,
        questions: {
          select: {
            id: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true
          }
        }
      }
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch test' },
      { status: 500 }
    );
  }
}

// Endpoint untuk submit jawaban test
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; testId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answers, timeSpent } = await request.json();

    // Ambil test dan jawaban yang benar
    const test = await prisma.preSelectionTest.findUnique({
      where: {
        id: params.testId
      },
      include: {
        questions: {
          select: {
            id: true,
            correctAnswer: true
          }
        }
      }
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Hitung score
    let correctAnswers = 0;
    const totalQuestions = test.questions.length;

    test.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;
    const passed = score >= test.passingScore;

    // Simpan hasil test
    const testResult = await prisma.testResult.create({
        data: {
          testId: params.testId,
          userId: session.user.id,
          score,
          timeSpent,
          passed,
          answers: answers
        }
      });

    return NextResponse.json({
      id: testResult.id,
      score,
      passed,
      timeSpent
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    );
  }
}