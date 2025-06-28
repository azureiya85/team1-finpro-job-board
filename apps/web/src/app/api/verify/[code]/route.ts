import { NextResponse } from 'next/server'
import prisma           from '@/lib/prisma'

export async function GET(
  _: Request,
  { params }: { params: { code: string } }
) {
  const cert = await prisma.certificate.findUnique({
    where: { certificateCode: params.code },
    include: {
      user: {
        select: { name: true, email: true }
      },
      userAssessment: {
        select: { score: true, badgeEarned: true, assessment: { select: { title: true } } }
      }
    }
  })

  if (!cert || !cert.isValid) {
    return NextResponse.json(
      { valid: false, error: 'Certificate not found or revoked' },
      { status: 404 }
    )
  }

  // bump verification counter
  await prisma.certificate.update({
    where: { id: cert.id },
    data:  { verificationCount: { increment: 1 } }
  })

  return NextResponse.json({
    valid:             true,
    name:              cert.user.name,
    email:             cert.user.email,
    title:             cert.title,
    issuedAt:          cert.issueDate,
    score:             cert.userAssessment.score,
    badgeEarned:       cert.userAssessment.badgeEarned,
    verificationCount: cert.verificationCount + 1,
  })
}
