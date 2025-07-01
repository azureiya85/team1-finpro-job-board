import { NextRequest, NextResponse } from 'next/server';
import { getJobs } from '@/lib/jobsUtils';
import { GetJobsParams } from '@/types/jobs';
import { jobSearchParamsSchema } from '@/lib/validations/zodCompanyValidation';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const paramsForZod: Record<string, string | string[]> = {};

  const arrayKeys = ['categories', 'employmentTypes', 'experienceLevels', 'companySizes'];

  for (const [key, value] of searchParams.entries()) {
    if (arrayKeys.includes(key)) {
      const existingValue = paramsForZod[key];
      if (existingValue) {
        if (Array.isArray(existingValue)) {
          existingValue.push(value);
        } else {
          paramsForZod[key] = [existingValue as string, value];
        }
      } else {
        paramsForZod[key] = value;
      }
    } else {
      paramsForZod[key] = value;
    }
  }

  const validationResult = jobSearchParamsSchema.safeParse(paramsForZod);

  if (!validationResult.success) {
    console.error("Zod Validation Errors:", validationResult.error.format());
    return NextResponse.json({
      error: "Invalid query parameters",
      details: validationResult.error.format()
    }, { status: 400 });
  }

  const {
    take, skip, jobTitle, locationQuery, isRemote, companyId,
    categories,
    employmentTypes,
    experienceLevels,
    companySizes,
    userLatitude,
    userLongitude,
    radiusKm,
  } = validationResult.data;

  let orderBy: Prisma.JobPostingOrderByWithRelationInput[] = [
    { publishedAt: 'desc' },
    { createdAt: 'desc' }
  ];

  if (userLatitude !== undefined && userLongitude !== undefined) {
    orderBy = [
      { isPriority: 'desc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' }
    ];
  }

  const paramsForDb: GetJobsParams = {
    take,
    skip,
    jobTitle,
    locationQuery,
    categories,
    employmentTypes,
    experienceLevels,
    companySizes,
    isRemote,
    companyId,
    userLatitude,
    userLongitude,
    radiusKm,
    orderBy, 
    includePagination: searchParams.has('includePagination') ? searchParams.get('includePagination') === 'true' : false,
  };

  try {
    const jobs = await getJobs(paramsForDb);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('[API_JOBS_GET] Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}