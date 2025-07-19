import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function GET() {
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

    return NextResponse.json(locations);
  } catch (error) {
    console.error('[API_LOCATIONS_GET_ALL] Error fetching locations:', error);
    return NextResponse.json(
      { error: 'An internal error occurred while fetching locations.' },
      { status: 500 }
    );
  }
}