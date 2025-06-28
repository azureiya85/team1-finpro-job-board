import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const citiesQuerySchema = z.object({
  provinceId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const paramsObject = Object.fromEntries(searchParams.entries());
    
    const validationResult = citiesQuerySchema.safeParse(paramsObject);
    
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    const { provinceId } = validationResult.data;

    const cities = await prisma.city.findMany({
      where: provinceId ? { provinceId } : undefined,
      select: {
        id: true,
        name: true,
        type: true,
        provinceId: true,
      },
      orderBy: [
        { type: 'asc' }, // Cities first, then regencies
        { name: 'asc' },
      ],
    });

    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}