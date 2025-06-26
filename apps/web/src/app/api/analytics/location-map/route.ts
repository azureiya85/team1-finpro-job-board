import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const whereClause = {
      ...(cityId && { cityId }),
      ...(start && end && {
        createdAt: {
          gte: new Date(start),
          lte: new Date(end)
        }
      })
    };

    // Dapatkan data pengguna yang dikelompokkan berdasarkan cityId
    const usersByLocation = await prisma.user.groupBy({
      by: ['cityId'],
      where: whereClause,
      _count: {
        _all: true
      }
    });

    // Filter cityId yang tidak null dan dapatkan data kota
    const validCityIds = usersByLocation
      .map(loc => loc.cityId)
      .filter((id): id is string => id !== null);

    const cities = await prisma.city.findMany({
      where: {
        id: {
          in: validCityIds
        }
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true
      }
    });

    // Gabungkan data
    const locationData = usersByLocation.map(location => {
      const cityData = cities.find(city => city.id === location.cityId);
      return {
        cityId: location.cityId,
        cityName: cityData?.name,
        latitude: cityData?.latitude,
        longitude: cityData?.longitude,
        userCount: location._count._all
      };
    });

    return NextResponse.json(locationData);
  } catch (error) {
    console.error('[LOCATION_MAP_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}