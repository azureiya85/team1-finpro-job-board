import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const companyId = params.companyId;
  const { searchParams } = req.nextUrl;

  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const location = searchParams.get('location'); // e.g., cityId

  const where: any = {
    jobPosting: {
      companyId,
    },
  };

  if (start && end) {
    where.createdAt = {
      gte: new Date(start),
      lte: new Date(end),
    };
  }

  if (location && location !== 'all') {
    where.jobPosting = {
      ...where.jobPosting,
      cityId: location,
    };
  }

  const result = await prisma.jobPosting.groupBy({
    by: ['category'],
    where,
    _count: true,
  });

  const formatted = result.map((item) => ({
    label: item.category || 'Unknown',
    count: item._count,
  }));

  return NextResponse.json(formatted);
}
