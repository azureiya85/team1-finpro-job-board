import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Auth
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse payload
  type Answer = { questionId: string; selectedAnswer: string }
  const { answers, timeSpent = 0 }: { 
    answers: Answer[] 
    timeSpent?: number 
  } = await req.json()

  // 3. Load the assessment
  const assessment = await prisma.skillAssessment.findUnique({
    where: { id: params.id },
    include: { questions: true },
  })
  if (!assessment || !assessment.isActive) {
    return NextResponse.json({ error: 'Assessment not found or inactive' }, { status: 404 })
  }

  // 4. Score computation
  let score = 0
  for (const q of assessment.questions) {
    const sub = answers.find(a => a.questionId === q.id)
    if (sub && sub.selectedAnswer === q.correctAnswer) {
      score += Math.floor(100 / assessment.questions.length)
    }
  }

  // 5. Pass / fail
  const isPassed = score >= assessment.passingScore

  // 6. Persist user attempt
  const userSkillAssessment = await prisma.userSkillAssessment.create({
    data: {
      userId:       session.user.id,
      assessmentId: assessment.id,
      score,
      isPassed,
      timeSpent,
      badgeEarned:   isPassed,
      badgeIssuedAt: isPassed ? new Date() : null,
    },
  })

  return NextResponse.json({
    message: 'Assessment submitted',
    score,
    isPassed,
    resultId: userSkillAssessment.id,
  })
}
