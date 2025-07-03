import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  try {
    const where: Record<string, unknown> = {
      salaryEstimate: { not: null },
    };

    if (location && location !== 'all') {
      where.company = {
        cityId: location
      };
    }

    if (start && end) {
      where.createdAt = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const reviews = await prisma.companyReview.findMany({
      where,
      select: {
        salaryEstimate: true,
        jobPosition: true,
        createdAt: true,
        company: {
          select: {
            cityId: true
          }
        }
      },
    });

    const monthGroups: Record<string, number[]> = {};

    for (const review of reviews) {
      if (review.salaryEstimate) {
        const key = format(new Date(review.createdAt), 'MMM yyyy');
        if (!monthGroups[key]) {
          monthGroups[key] = [];
        }
        monthGroups[key].push(review.salaryEstimate);
      }
    }

    const result = Object.entries(monthGroups).map(([month, salaries]) => ({
      month,
      avgSalary: Math.round(salaries.reduce((sum, val) => sum + val, 0) / salaries.length)
    }));

    // Sort by date
    result.sort(
      (a, b) =>
        new Date(a.month + ' 01').getTime() - new Date(b.month + ' 01').getTime()
    );

    return NextResponse.json({
      labels: result.map(r => r.month),
      values: result.map(r => r.avgSalary)
    });
  } catch (err) {
    console.error('GET /api/analytics/salary-trends error:', err);
    return NextResponse.json({ error: 'Failed to load salary trends' }, { status: 500 });
  }
}