import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const applications = await prisma.jobApplication.groupBy({
      by: ['jobPostingId'],
      _count: { _all: true },
    });

    const jobIds = applications.map((item) => item.jobPostingId);

    const jobPostings = await prisma.jobPosting.findMany({
      where: {
        id: { in: jobIds },
      },
      select: {
        id: true,
        title: true,
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    const jobMap = jobPostings.reduce((acc, job) => {
      acc[job.id] = {
        title: job.title,
        company: job.company.name,
      };
      return acc;
    }, {} as Record<string, { title: string; company: string }>);

    const formatted = applications
      .map((item) => {
        const job = jobMap[item.jobPostingId];
        if (!job) return null;
        return {
          label: job.title,
          subLabel: job.company,
          count: item._count._all,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.count - a!.count);

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching application per job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application per job' },
      { status: 500 }
    );
  }
}
