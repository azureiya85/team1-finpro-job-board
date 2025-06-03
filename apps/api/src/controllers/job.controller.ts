import { Request, Response, NextFunction } from 'express';
import * as jobService from 'src/services/job.service';
import { GetJobsParams } from 'src/types';

export async function getAllJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const queryParams = req.query as any; 

    const includePagination = req.query.includePagination === 'true' || true; 

    const paramsForService: GetJobsParams = {
      ...queryParams,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], 
      includePagination,
    };

    const jobsResult = await jobService.fetchJobs(paramsForService);
    res.json(jobsResult);

  } catch (error) {
    console.error('[CONTROLLER_JOBS_GET_ALL] Error fetching jobs:', error);
    next(error); // Let global error handler deal with it
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

    // Validation already done by middleware
    const queryParams = req.query as any;

    const jobsResult = await jobService.fetchCompanyJobs(companyId, queryParams);
    res.json(jobsResult);
    
  } catch (error) {
    console.error(`[CONTROLLER_COMPANY_JOBS] Error fetching jobs for company ${req.params.companyId}:`, error);
    next(error);
  }
}