import prisma from '../prisma';
import { SubmitAssessmentInput, AssessmentResult } from '../types/userAssessment';
import { sendEmail } from '../utils/email';
import type { SkillAssessment, Question } from '@prisma/client';

export const submitUserAssessment = async (
  userId: string,
  userEmail: string,
  input: SubmitAssessmentInput
): Promise<AssessmentResult> => {
  // 1) Tell TS exactly what shape we expect back
  const assessment: (SkillAssessment & { questions: Question[] }) | null =
    await prisma.skillAssessment.findUnique({
      where: { id: input.assessmentId },
      include: { questions: true },
    });

  if (!assessment) throw new Error('Assessment not found');

  // 2) Now q is known to be a Question
  const correctCount = assessment.questions.filter((q: Question) =>
    input.answers.some(a => a.questionId === q.id && a.answer === q.correctAnswer)
  ).length;

  const score = Math.round((correctCount / assessment.questions.length) * 100);
  const passed = score >= assessment.passingScore;

  // 3) Record the attempt
  const ua = await prisma.userSkillAssessment.create({
    data: {
      userId,
      assessmentId: input.assessmentId,
      score,
      isPassed: passed,
      timeSpent: 0, // TODO: calculate elapsed time
    },
  });

  // 4) Issue certificate & email if passed
  let certificateUrl: string | null = null;
  if (passed) {
    const cert = await prisma.certificate.create({
      data: {
        userId,
        userAssessmentId: ua.id,
        title: 'Skill Certificate',
        certificateUrl: `https://your-domain.com/certs/${ua.id}`,
      },
    });
    certificateUrl = cert.certificateUrl;

    await sendEmail(
      userEmail,
      'Your Skill Certificate',
      `<p>Congrats! Download it <a href="${certificateUrl}">here</a>.</p>`
    );
  }

  return { score, passed, certificateUrl };
};
