import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { createReviewSchema } from '@/lib/validations/zodReviewValidation'; // Import the separated schema

interface RouteContext {
  params: {
    id: string; 
  };
}

// GET: Fetches all public, anonymous reviews for a specific company.
export async function GET(request: Request, { params }: RouteContext) {
  const { id: companyId } = params; 

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    const [reviews, totalReviews] = await prisma.$transaction([
      prisma.companyReview.findMany({
        where: {
          companyId: companyId,
          isVerified: true,
        },
        select: {
          id: true,
          title: true,
          review: true,
          rating: true,
          cultureRating: true,
          workLifeBalance: true,
          facilitiesRating: true,
          careerRating: true,
          jobPosition: true,
          employmentStatus: true,
          workDuration: true,
          salaryEstimate: true,
          createdAt: true,
          userId: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.companyReview.count({
        where: {
          companyId: companyId,
          isVerified: true,
        },
      }),
    ]);
    
    return NextResponse.json({
      data: reviews,
      pagination: {
        total: totalReviews,
        page,
        limit,
        totalPages: Math.ceil(totalReviews / limit),
      },
    });
  } catch (error) {
    console.error(`Error fetching reviews for company ${companyId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch company reviews' }, { status: 500 });
  }
}

//POST: Creates a new company review.
// Enforces that the user must have a verified work experience at the company.
export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized: You must be logged in to post a review.' }, { status: 401 });
  }

  const { id: companyId } = params;
  const userId = session.user.id;

  try {
    const workExperience = await prisma.workExperience.findFirst({
      where: {
        userId: userId,
        companyId: companyId,
        isVerified: true,
      },
    });

    if (!workExperience) {
      return NextResponse.json(
        { error: "Forbidden: You must have a verified work experience at this company to post a review." },
        { status: 403 }
      );
    }
    
    const existingReview = await prisma.companyReview.findUnique({
      where: { workExperienceId: workExperience.id },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Conflict: You have already submitted a review for this work experience." },
        { status: 409 }
      );
    }

    const body = await request.json();
    const validation = createReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }
    
    const newReview = await prisma.companyReview.create({
      data: {
        ...validation.data,
        jobPosition: workExperience.jobTitle,
        employmentStatus: workExperience.employmentStatus,
        isAnonymous: true,
        isVerified: true,
        user: { connect: { id: userId } },
        company: { connect: { id: companyId } },
        workExperience: { connect: { id: workExperience.id } },
      },
      select: {
          id: true,
          createdAt: true,
      }
    });

    return NextResponse.json({ message: 'Review submitted successfully', review: newReview }, { status: 201 });
  } catch (error) {
    console.error(`Error creating review for company ${companyId}:`, error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create company review' }, { status: 500 });
  }
}