import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  try {
    const where: any = {};

    if (location && location !== 'all') {
      where.city = { name: location };
    }

    if (start && end) {
      where.createdAt = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const result = await prisma.user.groupBy({
      by: ['gender'],
      _count: true,
      where,
    });

    const formatted = result.map((item) => ({
      label: item.gender || 'Unknown',
      count: item._count,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('GET /api/analytics/demographics error:', error);
    return NextResponse.json({ error: 'Failed to load demographics' }, { status: 500 });
  }
}
