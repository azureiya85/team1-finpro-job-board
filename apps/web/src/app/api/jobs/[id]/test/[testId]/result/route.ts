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

    const testResult = await prisma.testResult.findFirst({
      where: {
        testId: params.testId,
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
      testTitle: testResult.test.title,
      score: testResult.score,
      timeSpent: testResult.timeSpent,
      passed: testResult.passed,
      passingScore: testResult.test.passingScore,
      questions: testResult.test.questions.map((question: QuestionResult) => ({
        ...question,
        selectedAnswer: (testResult.answers as Record<string, string>)[question.id] || null,
        isCorrect: (testResult.answers as Record<string, string>)[question.id] === question.correctAnswer
      }))
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