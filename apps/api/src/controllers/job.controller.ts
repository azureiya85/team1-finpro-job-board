import { Request, Response, NextFunction } from 'express';
import * as jobService from 'src/services/job.service';
import { GetJobsParams, SortByType } from 'src/types';

export async function getAllJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const queryParams = req.query;
    console.log('Raw query params from frontend:', queryParams);

    const isRemote = queryParams.isRemote === 'true' ? true : 
                     queryParams.isRemote === 'false' ? false : 
                     undefined;

    const paramsForService: GetJobsParams = {
      // Pagination
      take: queryParams.take ? parseInt(queryParams.take as string, 10) : undefined,
      skip: queryParams.skip ? parseInt(queryParams.skip as string, 10) : undefined,
      
      // Sorting & Date Filters
      sortBy: queryParams.sortBy as SortByType,
      startDate: queryParams.startDate as string,
      endDate: queryParams.endDate as string,
      
      // Search
      jobTitle: queryParams.jobTitle as string,
      locationQuery: queryParams.locationQuery as string,
      companyQuery: queryParams.companyQuery as string, 
      companyLocationQuery: queryParams.companyLocationQuery as string,
      
      // Filters 
      categories: queryParams.categories as string[],
      employmentTypes: queryParams.employmentTypes as string[],
      experienceLevels: queryParams.experienceLevels as string[],
      companySizes: queryParams.companySizes as string[],
      isRemote: isRemote, 
    };

    console.log('Processed params being sent to service:', paramsForService);

    const jobsResult = await jobService.fetchJobs(paramsForService);
    res.json(jobsResult);

  } catch (error) {
    console.error('[CONTROLLER_JOBS_GET_ALL] Error fetching jobs:', error);
    next(error);
  }
}

export async function getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) { 
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }

    const job = await jobService.fetchJobById(id);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(job);

  } catch (error) {
    console.error(`[CONTROLLER_JOB_GET_BY_ID] Error fetching job ${req.params.id}:`, error);
    next(error);
  }
}

export async function getLatestFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = req.query.count ? parseInt(req.query.count as string, 10) : 5;
    if (isNaN(count) || count <= 0) {
      res.status(400).json({ error: 'Invalid count parameter' });
      return;
    }
    const jobs = await jobService.fetchLatestFeaturedJobs(count);
    res.json(jobs);
  } catch (error) {
    console.error('[CONTROLLER_LATEST_FEATURED] Error fetching latest featured jobs:', error);
    next(error);
  }
}

export async function getJobsByCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      res.status(400).json({ error: 'Company ID is required' });
      return;
    }

    const queryParams = req.query as any;
    
    // Convert string boolean parameters
    const isRemote = queryParams.isRemote === 'true' ? true : 
                    queryParams.isRemote === 'false' ? false : 
                    undefined;

    const cleanParams = {
      jobTitle: queryParams.jobTitle,
      locationQuery: queryParams.locationQuery,
      companyQuery: queryParams.companyQuery,  
      categories: queryParams.categories,
      employmentTypes: queryParams.employmentTypes,
      experienceLevels: queryParams.experienceLevels,
      companySizes: queryParams.companySizes,
      isRemote,
      take: queryParams.take ? parseInt(queryParams.take as string, 10) : undefined,
      skip: queryParams.skip ? parseInt(queryParams.skip as string, 10) : undefined,
    };

    const jobsResult = await jobService.fetchCompanyJobs(companyId, cleanParams);
    res.json(jobsResult);
    
  } catch (error) {
    console.error(`[CONTROLLER_COMPANY_JOBS] Error fetching jobs for company ${req.params.companyId}:`, error);
    next(error);
  }
}