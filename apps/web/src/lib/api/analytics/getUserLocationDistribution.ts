import prisma from '@/lib/prisma';
import { AnalyticsFilters } from '@/types/analyticsTypes';

export async function getUserLocationDistribution(filters?: AnalyticsFilters) {
  const where: any = {
    jobApplications: {
      some: {},
    },
  };

  if (filters?.startDate && filters?.endDate) {
    where.jobApplications.some.createdAt = {
      gte: filters.startDate,
      lte: filters.endDate,
    };
  }

  const result = await prisma.city.findMany({
    where: {
      users: {
        some: where,
      },
    },
    select: {
      name: true,
      latitude: true,
      longitude: true,
      users: {
        where: where,
        select: {
          id: true,
        },
      },
    },
  });

  return result.map((city) => ({
    city: city.name,
    lat: city.latitude || 0,
    lng: city.longitude || 0,
    count: city.users.length,
  }));
}
