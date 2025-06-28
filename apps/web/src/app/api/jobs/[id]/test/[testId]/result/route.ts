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

    const { id: jobId, testId } = params;
    const userWithCompany = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        company: {
          include: {
            jobPostings: {
              where: { id: jobId },
              select: { id: true, companyId: true }
            }
          }
        }
      }
    });

    const isCompanyAdmin = Boolean(
      userWithCompany?.company?.jobPostings &&
      userWithCompany.company.jobPostings.length > 0 &&
      userWithCompany.company.jobPostings[0].companyId === userWithCompany.company.id
    );

    const whereClause = isCompanyAdmin
      ? { testId }
      : { testId, userId: session.user.id };

    const testResult = await prisma.testResult.findFirst({
      where: whereClause,
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

    const correctAnswers = testResult.test.questions.filter(
      (q: QuestionResult) => {
        const userAnswer = (testResult.answers as Record<string, string>)[q.id];
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