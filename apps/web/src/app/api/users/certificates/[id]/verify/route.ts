import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  params: { certificateCode: string };
}

// Verify Certificate
export async function GET(request: Request, { params }: Params) {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: params.certificateCode },
      include: {
        user: { select: { name: true, email: true } }, 
        userAssessment: {
          select: {
            assessment: { select: { title: true } },
            score: true,
            completedAt: true,
          },
        },
      },
    });

    if (!certificate || !certificate.isValid) {
      return NextResponse.json({ error: 'Certificate not found or invalid.' }, { status: 404 });
    }

    // Increment verification count
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: { verificationCount: { increment: 1 } },
    });

    return NextResponse.json({
      isValid: true,
      certificateHolder: certificate.user.name || certificate.user.email,
      assessmentTitle: certificate.userAssessment.assessment.title,
      score: certificate.userAssessment.score,
      issueDate: certificate.issueDate,
      completedAt: certificate.userAssessment.completedAt,
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json({ error: 'Failed to verify certificate' }, { status: 500 });
  }
}