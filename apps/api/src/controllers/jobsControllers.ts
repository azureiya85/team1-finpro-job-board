import { Request, Response } from 'express';
import { GetJobsParams, GetJobsResult, JobPostingFeatured, ApiResponse } from 'src/types';
import { jobService } from '../services/JobService';
import { Prisma } from '@prisma/client';

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

export const createJob = async (req: Request, res: Response) => {
  try {
    const data: Prisma.JobPostingCreateInput = req.body;

    const job = await jobService.createJob(data);

    if (!job) {
      const response: ApiResponse<never> = {
        error: 'Failed to create job'
      };
      return res.status(500).json(response);
    }

    const response: ApiResponse<JobPostingFeatured> = {
      data: job
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('[API_JOBS_CREATE] Error creating job:', error);
    const response: ApiResponse<never> = {
      error: 'Internal Server Error'
    };
    res.status(500).json(response);
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: Prisma.JobPostingUpdateInput = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const updatedJob = await jobService.updateJob(id, data);

    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found or update failed' });
    }

    const response: ApiResponse<JobPostingFeatured> = {
      data: updatedJob
    };

    res.json(response);
  } catch (error) {
    console.error('[API_JOBS_UPDATE] Error updating job:', error);
    const response: ApiResponse<never> = {
      error: 'Internal Server Error'
    };
    res.status(500).json(response);
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const success = await jobService.deleteJob(id);

    if (!success) {
      return res.status(404).json({ error: 'Job not found or delete failed' });
    }

    const response: ApiResponse<{ success: boolean }> = {
      data: { success: true }
    };

    res.json(response);
  } catch (error) {
    console.error('[API_JOBS_DELETE] Error deleting job:', error);
    const response: ApiResponse<never> = {
      error: 'Internal Server Error'
    };
    res.status(500).json(response);
  }
};