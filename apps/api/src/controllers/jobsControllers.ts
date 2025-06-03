import { Request, Response } from 'express';
import { GetJobsParams, GetJobsResult, JobPostingFeatured, ApiResponse } from 'src/types';
import { jobService } from '../services/JobService';

export const getJobs = async (req: Request, res: Response) => {
  try {
    const params: GetJobsParams = {
      take: req.query.take ? parseInt(req.query.take as string) : undefined,
      skip: req.query.skip ? parseInt(req.query.skip as string) : undefined,
      jobTitle: req.query.jobTitle as string,
      locationQuery: req.query.locationQuery as string,
      categories: req.query.categories as any,
      employmentTypes: req.query.employmentTypes as any,
      experienceLevels: req.query.experienceLevels as any,
      companySizes: req.query.companySizes as any,
      isRemote: req.query.isRemote === 'true',
      companyId: req.query.companyId as string,
      includePagination: req.query.includePagination === 'true',
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
    };

    const result = await jobService.getJobs(params);
    
    const response: ApiResponse<GetJobsResult | JobPostingFeatured[]> = {
      data: result
    };
    
    res.json(response);
  } catch (error) {
    console.error('[API_JOBS_GET] Error fetching jobs:', error);
    const response: ApiResponse<never> = {
      error: 'Failed to fetch jobs'
    };
    res.status(500).json(response);
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      const response: ApiResponse<never> = {
        error: 'Job ID is required'
      };
      return res.status(400).json(response);
    }

    const job = await jobService.getJobById(id);
    
    if (!job) {
      const response: ApiResponse<never> = {
        error: 'Job not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<JobPostingFeatured> = {
      data: job
    };
    
    res.json(response);
  } catch (error) {
    console.error('API: Failed to fetch job:', error);
    const response: ApiResponse<never> = {
      error: 'Internal Server Error'
    };
    res.status(500).json(response);
  }
};