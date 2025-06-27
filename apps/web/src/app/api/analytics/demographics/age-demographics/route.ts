import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { differenceInYears } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const allUsers = await prisma.user.findMany({
      where: {
        role: 'USER',
        dateOfBirth: { not: null },
      },
      select: {
        dateOfBirth: true,
      },
    });

    const currentYear = new Date();

    const ageGroups = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0,
    };

    allUsers.forEach((user) => {
      const age = differenceInYears(currentYear, new Date(user.dateOfBirth!));

      if (age >= 18 && age <= 24) ageGroups['18-24']++;
      else if (age >= 25 && age <= 34) ageGroups['25-34']++;
      else if (age >= 35 && age <= 44) ageGroups['35-44']++;
      else if (age >= 45 && age <= 54) ageGroups['45-54']++;
      else if (age >= 55) ageGroups['55+']++;
    });

    // Format data sesuai dengan interface AgeDemographicData
    const result = Object.entries(ageGroups).map(([ageRange, count]) => ({
      ageRange,
      count,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching age demographics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch age demographics' },
      { status: 500 }
    );
  }
}