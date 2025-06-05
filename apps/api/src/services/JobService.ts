import prisma from '../lib/prisma';
import { GetJobsParams, GetJobsResult, JobPostingFeatured } from 'src/types';
import { Prisma } from '@prisma/client';

class JobService {
  private buildWhereClause(params: GetJobsParams): Prisma.JobPostingWhereInput {
    const {
      jobTitle,
      locationQuery,
      categories,
      employmentTypes,
      experienceLevels,
      companySizes,
      isRemote,
      companyId,
    } = params;

    const where: Prisma.JobPostingWhereInput = {
      isActive: true,
    };

    // Search Logic
    if (jobTitle) {
      where.OR = [
        { title: { contains: jobTitle, mode: 'insensitive' } },
        { description: { contains: jobTitle, mode: 'insensitive' } },
      ];
    }

    if (locationQuery) {
      const locationConditions: Prisma.JobPostingWhereInput[] = [
        { 
          city: { 
            is: { 
              name: { contains: locationQuery, mode: 'insensitive' } 
            } 
          } 
        },
        { 
          province: { 
            is: { 
              name: { contains: locationQuery, mode: 'insensitive' } 
            } 
          } 
        },
      ];

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: locationConditions },
        ];
        delete where.OR;
      } else {
        where.OR = locationConditions;
      }
    }

    // Filter Logic
    if (categories && categories.length > 0) {
      where.category = { in: categories };
    }

    if (employmentTypes && employmentTypes.length > 0) {
      where.employmentType = { in: employmentTypes };
    }

    if (experienceLevels && experienceLevels.length > 0) {
      where.experienceLevel = { in: experienceLevels };
    }
    
    if (typeof isRemote === 'boolean') {
      where.isRemote = isRemote;
    }

    if (companySizes && companySizes.length > 0) {
      where.company = {
        is: {
          size: { in: companySizes },
        },
      };
    }

    if (companyId) {
      where.companyId = companyId;
    }

    return where;
  }

  async getJobs(params: GetJobsParams = {}): Promise<JobPostingFeatured[] | GetJobsResult> {
    const {
      take = 3000,
      skip = 0,
      orderBy,
      includePagination = false,
    } = params;

    const effectiveOrderBy = orderBy || [{ isPriority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
    const where = this.buildWhereClause(params);

    const selectFields = {
      id: true,
      title: true,
      description: true,      
      employmentType: true,
      experienceLevel: true,   
      category: true,          
      isRemote: true,
      createdAt: true,
      publishedAt: true,
      salaryMin: true,
      salaryMax: true,
      salaryCurrency: true,
      isPriority: true,
      tags: true,              
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
          size: true,
          industry: true,
        },
      },
      city: {
        select: {
          id: true,
          name: true,
        },
      },
      province: {
        select: {
          id: true,
          name: true,
        },
      },
      requirements: true, 
      benefits: true,
      _count: {
        select: {
          applications: true,
        },
      },
    };

    try {
      if (includePagination) {
        const [jobs, totalCount] = await Promise.all([
          prisma.jobPosting.findMany({
            where,
            orderBy: effectiveOrderBy,
            take,
            skip,
            select: selectFields,
          }),
          prisma.jobPosting.count({ where }),
        ]);

        return {
          jobs: jobs as unknown as JobPostingFeatured[],
          pagination: {
            total: totalCount,
            page: Math.floor(skip / take) + 1,
            totalPages: Math.ceil(totalCount / take),
            hasNext: skip + take < totalCount,
            hasPrev: skip > 0,
          },
        };
      } else {
        const jobs = await prisma.jobPosting.findMany({
          where,
          orderBy: effectiveOrderBy,
          take,
          skip,
          select: selectFields,
        });

        return jobs as unknown as JobPostingFeatured[];
      }
    } catch (error) {
      console.error("Failed to fetch jobs with filters:", error);
      if (includePagination) {
        return {
          jobs: [],
          pagination: {
            total: 0,
            page: 1,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }
      return [];
    }
  }

  async getJobById(id: string): Promise<JobPostingFeatured | null> {
    try {
      const job = await prisma.jobPosting.findUnique({
        where: {
          id: id,
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          employmentType: true,
          experienceLevel: true,
          category: true,
          isRemote: true,
          createdAt: true,
          publishedAt: true,
          salaryMin: true,
          salaryMax: true,
          salaryCurrency: true,
          isPriority: true,
          tags: true,
          requirements: true,
          benefits: true,
          applicationDeadline: true,
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              size: true,
              description: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
            },
          },
          province: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return job as unknown as JobPostingFeatured;
    } catch (error) {
      console.error('Failed to fetch job by ID:', error);
      return null;
    }
  }

  async getLatestFeaturedJobs(count: number = 5): Promise<JobPostingFeatured[]> {
    const result = await this.getJobs({
      take: count,
      orderBy: [{ isPriority: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      includePagination: false,
    });
    
    return result as JobPostingFeatured[];
  }

  async getCompanyJobs(
    companyId: string, 
    params: Omit<GetJobsParams, 'companyId'> = {}
  ): Promise<GetJobsResult> {
    const result = await this.getJobs({
      ...params,
      companyId,
      includePagination: true,
    });
    
    return result as GetJobsResult;
  }

  async createJob(data: Prisma.JobPostingCreateInput): Promise<JobPostingFeatured | null> {
    try {
      const job = await prisma.jobPosting.create({
        data,
        select: {
          id: true,
          title: true,
          description: true,
          employmentType: true,
          experienceLevel: true,
          category: true,
          isRemote: true,
          createdAt: true,
          publishedAt: true,
          salaryMin: true,
          salaryMax: true,
          salaryCurrency: true,
          isPriority: true,
          tags: true,
          requirements: true,
          benefits: true,
          applicationDeadline: true,
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              size: true,
              description: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
            },
          },
          province: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return job as unknown as JobPostingFeatured;
    } catch (error) {
      console.error('Failed to create job:', error);
      return null;
    }
  }

  async updateJob(id: string, data: Prisma.JobPostingUpdateInput): Promise<JobPostingFeatured | null> {
    try {
      const job = await prisma.jobPosting.update({
        where: { id },
        data,
        select: {
          id: true,
          title: true,
          description: true,
          employmentType: true,
          experienceLevel: true,
          category: true,
          isRemote: true,
          createdAt: true,
          publishedAt: true,
          salaryMin: true,
          salaryMax: true,
          salaryCurrency: true,
          isPriority: true,
          tags: true,
          requirements: true,
          benefits: true,
          applicationDeadline: true,
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              size: true,
              description: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
            },
          },
          province: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return job as unknown as JobPostingFeatured;
    } catch (error) {
      console.error('Failed to update job:', error);
      return null;
    }
  }

  async deleteJob(id: string): Promise<boolean> {
    try {
      await prisma.jobPosting.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Failed to delete job:', error);
      return false;
    }
  }
}

export const jobService = new JobService();