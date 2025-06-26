import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: Promise<{
    id: string; 
  }>;
}

// GET: Checks if the currently authenticated user is eligible to review a company.
export async function GET(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { canReview: false, reason: 'NOT_LOGGED_IN', message: "You must be logged in to review a company." }, 
      { status: 401 }
    );
  }

  const { id: companyId } = await params; 
  const userId = session.user.id;

  try {
    const workExperience = await prisma.workExperience.findFirst({
      where: {
        userId: userId,
        companyId: companyId,
      },
      include: {
        review: {
          select: { id: true }
        }
      },
    });
    
    if (!workExperience) {
      return NextResponse.json({ 
        canReview: false, 
        reason: 'NO_WORK_EXPERIENCE', 
        message: "We couldn't find a work experience record for you at this company." 
      });
    }

    if (!workExperience.isVerified) {
      return NextResponse.json({ 
        canReview: false, 
        reason: 'EXPERIENCE_NOT_VERIFIED', 
        message: "Your work experience at this company has not been verified yet." 
      });
    }
    
    if (workExperience.review) {
      return NextResponse.json({ 
        canReview: false, 
        reason: 'ALREADY_REVIEWED', 
        message: "You have already submitted a review for this work experience." 
      });
    }
    
    return NextResponse.json({
      canReview: true,
      reason: 'ELIGIBLE',
      message: "You are eligible to review this company.",
      workExperience: { 
        id: workExperience.id,
        jobTitle: workExperience.jobTitle,
        employmentStatus: workExperience.employmentStatus,
      }
    });

  } catch (error) {
    console.error(`Error checking review eligibility for company ${companyId}:`, error);
    return NextResponse.json({ error: 'Failed to check review eligibility' }, { status: 500 });
  }
}