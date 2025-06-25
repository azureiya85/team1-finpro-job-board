import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  try {
    const where: any = {
      salaryMin: { not: null },
      salaryMax: { not: null },
    };

    if (location && location !== 'all') {
      where.city = { name: location };
    }

    if (start && end) {
      where.createdAt = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const postings = await prisma.jobPosting.findMany({
      where,
      select: {
        salaryMin: true,
        salaryMax: true,
        createdAt: true,
      },
    });

    const monthGroups: Record<string, number[]> = {};

    for (const post of postings) {
        if (post.salaryMin !== null && post.salaryMax !== null) {
          const avg = (post.salaryMin + post.salaryMax) / 2;
          const key = format(new Date(post.createdAt), 'MMM yyyy');
          if (!monthGroups[key]) {
            monthGroups[key] = [];
          }
          monthGroups[key].push(avg);
        }
      }

    const result = Object.entries(monthGroups).map(([month, salaries]) => ({
      month,
      avgSalary:
        salaries.reduce((sum, val) => sum + val, 0) / salaries.length,
    }));

    // Sort by date
    result.sort(
      (a, b) =>
        new Date(a.month + ' 01').getTime() - new Date(b.month + ' 01').getTime()
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/analytics/salary-trends error:', err);
    return NextResponse.json({ error: 'Failed to load salary trends' }, { status: 500 });
  }
}
