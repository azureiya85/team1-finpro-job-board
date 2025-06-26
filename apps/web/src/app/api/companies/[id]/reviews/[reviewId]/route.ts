import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { createReviewSchema } from '@/lib/validations/zodReviewValidation';
import { Prisma } from '@prisma/client'; 

interface RouteContext {
  params: Promise<{
    id: string; 
    reviewId: string;
  }>;
}

// PUT: Updates an existing review
export async function PUT(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reviewId } = await params;
  const userId = session.user.id;

  try {
    const body = await request.json();
    const validation = createReviewSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const updatedReview = await prisma.companyReview.update({
      where: {
        id: reviewId,
        userId: userId,
      },
      data: validation.data,
      select: {
        id: true,
      }
    });

    return NextResponse.json(updatedReview);

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Review not found or you do not have permission to edit it' }, { status: 404 });
      }
    }
    console.error(`Error updating review ${reviewId}:`, error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}


// DELETE: Deletes an existing review
export async function DELETE(request: Request, { params }: RouteContext) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId } = await params;
    const userId = session.user.id;

    try {
        await prisma.companyReview.delete({
            where: {
                id: reviewId,
                userId: userId,
            },
        });

        return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
    
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Review not found or you do not have permission to delete it' }, { status: 404 });
          }
        }
        console.error(`Error deleting review ${reviewId}:`, error);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}