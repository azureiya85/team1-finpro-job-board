import prisma from '@/lib/prisma';
import { AnalyticsFilters } from '@/types/analyticsTypes';

export async function getLocationMapData(filters?: AnalyticsFilters) {
  const where: any = {
    jobApplications: {
      some: {},
    },
  };

  if (filters?.dateRange?.start && filters?.dateRange?.end) {
    where.jobApplications.some.createdAt = {
      gte: filters.dateRange.start,
      lte: filters.dateRange.end,
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
