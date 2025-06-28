import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { CompanySize } from '@prisma/client';

const prisma = new PrismaClient();

const companiesSearchSchema = z.object({
  take: z.coerce.number().int().positive().max(50).optional().default(10),
  skip: z.coerce.number().int().nonnegative().optional().default(0),
  name: z.string().optional(), 
  locationQuery: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'name_asc', 'name_desc']).optional().default('newest'),
  industry: z.string().optional(),
  size: z.nativeEnum(CompanySize).optional(),
  provinceId: z.string().optional(),
  cityId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const paramsObject = Object.fromEntries(searchParams.entries());
    
    const validationResult = companiesSearchSchema.safeParse(paramsObject);
    
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    // Destructure validated parameters
    const { take, skip, name, locationQuery, sortBy, industry, size, provinceId, cityId } = validationResult.data;

    // Build the where clause
    const where = {
      // Search by company name
      ...(name && { 
        name: { contains: name, mode: 'insensitive' as const } 
      }),
      // Search by text in related province or city names
      ...(locationQuery && {
        OR: [
          { province: { name: { contains: locationQuery, mode: 'insensitive' as const } } },
          { city: { name: { contains: locationQuery, mode: 'insensitive' as const } } },
        ],
      }),
      ...(industry && { industry: { contains: industry, mode: 'insensitive' as const } }),
      ...(size && { size }),
      ...(provinceId && { provinceId }),
      ...(cityId && { cityId }),
    };

    let orderBy = {};
    switch (sortBy) {
        case 'oldest':
            orderBy = { createdAt: 'asc' as const };
            break;
        case 'name_asc':
            orderBy = { name: 'asc' as const };
            break;
        case 'name_desc':
            orderBy = { name: 'desc' as const };
            break;
        case 'newest':
        default:
            orderBy = { createdAt: 'desc' as const };
            break;
    }

    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
          province: { select: { id: true, name: true } },
          city: { select: { id: true, name: true } },
          _count: {
            select: {
              jobPostings: { where: { isActive: true } },
              companyReviews: { where: { isVerified: true } },
            },
          },
        },
        orderBy,
        take,
        skip,
      }),
      prisma.company.count({ where }),
    ]);

    const companyIds = companies.map((c) => c.id);

    const [averageRatings, latestJobPostings] = await Promise.all([
      // Query for average ratings 
      prisma.companyReview.groupBy({
        by: ['companyId'],
        where: { companyId: { in: companyIds }, isVerified: true },
        _avg: { rating: true },
      }),
      // Query for the latest job posting date for each company 
      prisma.jobPosting.groupBy({
        by: ['companyId'],
        where: { companyId: { in: companyIds }, isActive: true },
        _max: {
          createdAt: true,
        },
      }),
    ]);

    const ratingMap = averageRatings.reduce((acc, curr) => {
      acc[curr.companyId] = curr._avg.rating;
      return acc;
    }, {} as Record<string, number | null>);

    const lastJobDateMap = latestJobPostings.reduce((acc, curr) => {
      acc[curr.companyId] = curr._max.createdAt;
      return acc;
    }, {} as Record<string, Date | null>);

    const companiesWithDetails = companies.map((company) => ({
      ...company,
      avgRating: ratingMap[company.id] || 0,
      lastJobPostedAt: lastJobDateMap[company.id] || null, 
    }));

    return NextResponse.json({
      companies: companiesWithDetails,
      pagination: {
        total: totalCount,
        page: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(totalCount / take),
        hasNext: skip + take < totalCount,
        hasPrev: skip > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}