import { NextRequest, NextResponse } from 'next/server';
import { getJobs } from '@/lib/jobsUtils';
import { GetJobsParams } from '@/types';
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
        paramsForZod[key] = [value];
      }
    } else {
      paramsForZod[key] = value;
    }
  }

  for (const key in paramsForZod) {
    if (Array.isArray(paramsForZod[key]) && !arrayKeys.includes(key)) {
      paramsForZod[key] = paramsForZod[key][0];
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
    sortBy, 
    startDate,
    endDate,
  } = validationResult.data;

  // Build the orderBy array based on the sortBy parameter
  const orderBy: Prisma.JobPostingOrderByWithRelationInput[] = [];

  switch (sortBy) {
    case 'oldest':
      orderBy.push({ publishedAt: 'asc' });
      break;
    case 'company_asc':
      orderBy.push({ company: { name: 'asc' } });
      break;
    case 'company_desc':
      orderBy.push({ company: { name: 'desc' } });
      break;
    case 'newest':
    default:
      orderBy.push({ publishedAt: 'desc' });
      break;
  }
  
  // Add secondary sort criteria for consistency
  orderBy.push({ createdAt: 'desc' });

  // If location is provided, prioritize featured and then apply the selected sort
  if (userLatitude !== undefined && userLongitude !== undefined) {
    orderBy.unshift({ isPriority: 'desc' });
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
    startDate, 
    endDate, 
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