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
        },
        jobPostings: {
          select: {
            id: true
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
      // Ubah format jawaban menjadi huruf saja (A, B, C, D)
      const userAnswer = answers[question.id]?.replace('option', '');
      const correctAnswer = question.correctAnswer?.replace('option', '');
      
      if (userAnswer === correctAnswer) {
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

    // Update status aplikasi berdasarkan hasil test
    const jobId = test.jobPostings[0]?.id;
    if (jobId) {
      const application = await prisma.jobApplication.findFirst({
        where: {
          userId: session.user.id,
          jobPostingId: jobId,
          status: 'TEST_REQUIRED'
        }
      });

      if (application) {
        await prisma.jobApplication.update({
          where: { id: application.id },
          data: {
            status: passed ? 'TEST_COMPLETED' : 'REJECTED',
            testResultId: testResult.id 
          }
        });
      }
    }

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