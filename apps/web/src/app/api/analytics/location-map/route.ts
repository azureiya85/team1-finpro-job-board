// app/api/analytics/location-map/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const cityId = searchParams.get('cityId');

  const where: any = {
    jobApplications: {
      some: {},
    },
  };

  if (start && end) {
    where.jobApplications.some.createdAt = {
      gte: new Date(start),
      lte: new Date(end),
    };
  }

  if (cityId && cityId !== 'all') {
    where.id = cityId;
  }

  const result = await prisma.city.findMany({
    where: where,
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      users: {
        where: where.jobApplications ? where : {},
        select: {
          id: true,
        },
      },
    },
  });

  const formatted = result.map((city) => ({
    city: city.name,
    lat: city.latitude || 0,
    lng: city.longitude || 0,
    count: city.users.length,
  }));

  return NextResponse.json(formatted);
}
