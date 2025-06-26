import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const cityId = searchParams.get('cityId');

  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  // Ambil semua kota, tidak hanya yang punya applicant
  const cities = await prisma.city.findMany({
    where: cityId && cityId !== 'all' ? { id: cityId } : {},
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      users: {
        where: {
          role: 'USER',
        },
        select: {
          id: true,
          jobApplications: {
            select: {
              createdAt: true,
            },
          },
        },
      },
    },
  });

  const result = cities.map((city) => {
    const applicants = city.users.filter((user) => {
      return user.jobApplications.some((app) => {
        if (startDate && endDate) {
          return app.createdAt >= startDate && app.createdAt <= endDate;
        }
        return true; // Tidak filter tanggal
      });
    });

    return {
      cityId: city.id,
      city: city.name,
      latitude: city.latitude ?? 0,
      longitude: city.longitude ?? 0,
      count: applicants.length,
    };
  });

  return NextResponse.json(result);
}