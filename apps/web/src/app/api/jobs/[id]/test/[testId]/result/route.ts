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

    const formattedResult = {
      id: testResult.id,
      testId: testResult.testId,
      userId: testResult.userId,
      score: testResult.score,
      totalQuestions: testResult.test.questions.length,
      correctAnswers: testResult.test.questions.filter(
        (q: QuestionResult) => 
        (testResult.answers as Record<string, string>)[q.id] === q.correctAnswer
      ).length,
      timeTaken: testResult.timeSpent,
      passingScore: testResult.test.passingScore,
      isPassed: testResult.passed,
      answers: Object.entries(testResult.answers as Record<string, string>).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      })),
      createdAt: testResult.createdAt,
      test: {
        title: testResult.test.title,
        questions: testResult.test.questions
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