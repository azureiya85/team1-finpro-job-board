import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// Get User's Certificates
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: session.user.id, isValid: true },
      orderBy: { issueDate: 'desc' },
      include: {
        userAssessment: {
            select: {
                assessment: {
                    select: { title: true }
                }
            }
        }
      }
    });
    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Error fetching user certificates:", error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}