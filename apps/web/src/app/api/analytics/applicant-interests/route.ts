import prisma from '@/lib/prisma';
import { JobCategory } from '@prisma/client';

export async function GET() {
  try {
    const applicantInterests = await prisma.jobApplication.groupBy({
      by: ['jobPostingId'],
      _count: {
        _all: true
      },
      where: {
        jobPosting: {
          isActive: true
        }
      }
    });

    const jobPostings = await prisma.jobPosting.findMany({
      where: {
        id: {
          in: applicantInterests.map(item => item.jobPostingId)
        }
      },
      select: {
        id: true,
        category: true
      }
    });

    const jobCategoryMap = jobPostings.reduce((acc, job) => {
      acc[job.id] = job.category;
      return acc;
    }, {} as Record<string, JobCategory>);
  
    const categoryCount = applicantInterests.reduce((acc, item) => {
      const category = jobCategoryMap[item.jobPostingId];
      if (category) {
        acc[category] = (acc[category] || 0) + item._count._all;
      }
      return acc;
    }, {} as Record<JobCategory, number>);

    // Format data untuk response
    const formattedData = Object.entries(categoryCount).map(([category, count]) => ({
      label: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      category
    }));

    return Response.json(formattedData);
  } catch (error) {
    console.error('Error fetching applicant interests:', error);
    return Response.json({ error: 'Failed to fetch applicant interests' }, { status: 500 });
  }
}
