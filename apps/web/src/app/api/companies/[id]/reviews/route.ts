import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const ReviewSchema = z.object({
  title: z.string().optional(),
  review: z.string().min(10),
  rating: z.number().min(1).max(5),
  cultureRating: z.number().min(1).max(5).optional(),
  workLifeBalance: z.number().min(1).max(5).optional(),
  facilitiesRating: z.number().min(1).max(5).optional(),
  careerRating: z.number().min(1).max(5).optional(),
  jobPosition: z.string().min(2),
  employmentStatus: z.enum(['CURRENT_EMPLOYEE','FORMER_EMPLOYEE','CONTRACTOR','INTERN']),
  workDuration: z.string().optional(),
  salaryEstimate: z.number().int().optional(),
  isAnonymous: z.boolean().default(true),
});

export async function POST(request: Request, { params }: { params: { companyId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // TODO: verify session.user.id actually works at companyId. Then:
  const userIsEmployed = true; // implement your check
  if (!userIsEmployed) {
    return NextResponse.json({ error: 'Only verified employees can submit a review' }, { status: 403 });
  }

  const parse = ReviewSchema.safeParse(await request.json());
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input', details: parse.error.format() }, { status: 400 });
  }
  const data = parse.data;

  const review = await prisma.companyReview.create({
    data: {
      ...data,
      userId: session.user.id,
      companyId: params.companyId,
      isVerified: true,
    },
  });

  return NextResponse.json({ message: 'Review submitted', review }, { status: 201 });
}
