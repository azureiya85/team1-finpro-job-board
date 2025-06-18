import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type QuestionResult = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; testId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId } = await params;

    const testResult = await prisma.testResult.findFirst({
      where: {
        testId: testId,
        userId: session.user.id
      },
      include: {
        test: {
          select: {
            title: true,
            passingScore: true,
            questions: {
              select: {
                id: true,
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
        }
      }
    });

    if (!testResult) {
      return NextResponse.json(
        { error: 'Test result not found' },
        { status: 404 }
      );
    }

    // Hitung jumlah jawaban yang benar
    const correctAnswers = testResult.test.questions.filter(
      (q: QuestionResult) => {
        const userAnswer = (testResult.answers as Record<string, string>)[q.id];
        // Pastikan format jawaban sama (dengan 'option')
        const correctAnswer = `option${q.correctAnswer}`;
        return userAnswer === correctAnswer;
      }
    ).length;

    const formattedResult = {
      id: testResult.id,
      testTitle: testResult.test.title,
      score: correctAnswers / testResult.test.questions.length * 100,
      correctAnswers: correctAnswers, 
      totalQuestions: testResult.test.questions.length,
      timeTaken: testResult.timeSpent,
      passingScore: testResult.test.passingScore,
      passed: correctAnswers >= (testResult.test.passingScore / 100 * testResult.test.questions.length),
      answers: Object.entries(testResult.answers as Record<string, string>).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      })),
      test: {
        title: testResult.test.title,
        questions: testResult.test.questions.map(q => ({
          ...q,
          userAnswer: (testResult.answers as Record<string, string>)[q.id],
          // Pastikan format jawaban sama saat membandingkan
          correctAnswer: `option${q.correctAnswer}`,
          isCorrect: (testResult.answers as Record<string, string>)[q.id] === `option${q.correctAnswer}`
        }))
      }
    };

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error('Error fetching test result:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test result' },
      { status: 500 }
    );
  }
}