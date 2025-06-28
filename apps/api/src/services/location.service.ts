import prisma from '@/lib/prisma';
import { Province, City } from '@prisma/client';

export interface ProvinceWithCities extends Province {
  cities: City[];
}

export async function fetchAllLocations(): Promise<ProvinceWithCities[]> {
  try {
    const locations = await prisma.province.findMany({
      include: {
        cities: {
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return locations;
  } catch (error) {
    console.error("Service: Failed to fetch locations:", error);
    throw new Error("Failed to fetch locations from the database.");
  }
}