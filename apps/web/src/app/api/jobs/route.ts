import { NextRequest, NextResponse } from 'next/server';
import { getJobs, GetJobsParams } from '@/lib/jobsUtils';
import { jobSearchParamsSchema } from '@/lib/validations/zodCompanyValidation'; 

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const paramsForZod: Record<string, string | string[]> = {};

  // Define which keys are treated as arrays by Zod's preprocess logic.
  const arrayKeys = ['categories', 'employmentTypes', 'experienceLevels', 'companySizes'];

  for (const [key, value] of searchParams.entries()) { 
    if (arrayKeys.includes(key)) {
      const existingValue = paramsForZod[key];
      if (existingValue) {
        if (Array.isArray(existingValue)) {
          existingValue.push(value); // Add to the existing array
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
  } = validationResult.data; 

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
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  };

  try {
    const jobs = await getJobs(paramsForDb);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('[API_JOBS_GET] Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}