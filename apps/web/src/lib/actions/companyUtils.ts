import 'server-only';
import prisma from '@/lib/prisma';
import type { CompanyDetailed } from '@/types';

export async function getCompanyDetails(id: string): Promise<CompanyDetailed | null> {
  if (!id) {
    return null;
  }

  try {
    const [company, reviewStats] = await prisma.$transaction([
      prisma.company.findUnique({
        where: { id },
        select: {
          id: true, name: true, description: true, banner: true, website: true,
          logo: true, industry: true, size: true, foundedYear: true, email: true,
          phone: true, address: true, latitude: true, longitude: true, provinceId: true,
          cityId: true, country: true, linkedinUrl: true, facebookUrl: true,
          twitterUrl: true, instagramUrl: true, adminId: true, createdAt: true, updatedAt: true,
          
          province: { 
            select: { 
              id: true, 
              name: true, 
              code: true, 
              latitude: true, 
              longitude: true, 
              createdAt: true, 
              updatedAt: true 
            } 
          },
          city: { 
            select: { 
              id: true, 
              name: true, 
              type: true,
              provinceId: true, 
              latitude: true,
              longitude: true,
              createdAt: true,
              updatedAt: true,
            } 
          },

          admin: { select: { id: true, name: true, email: true, profileImage: true } },
          _count: {
            select: {
              jobPostings: { where: { isActive: true } },
              companyReviews: true,
            },
          },
        },
      }),
      prisma.companyReview.aggregate({
        where: { companyId: id },
        _avg: {
          rating: true, cultureRating: true, workLifeBalance: true,
          facilitiesRating: true, careerRating: true,
        },
      }),
    ]);

    if (!company) {
      return null;
    }

    const companyWithStats = {
      ...company,
      stats: {
        activeJobs: company._count.jobPostings,
        totalReviews: company._count.companyReviews,
        averageRating: reviewStats._avg.rating || 0,
        ratings: {
          culture: reviewStats._avg.cultureRating || 0,
          workLifeBalance: reviewStats._avg.workLifeBalance || 0,
          facilities: reviewStats._avg.facilitiesRating || 0,
          career: reviewStats._avg.careerRating || 0,
        },
      },
    };

    return companyWithStats as CompanyDetailed;

  } catch (error) {
    console.error(`[ACTION_GET_COMPANY_DETAILS] Failed to fetch company ${id}:`, error);
    throw new Error('Database query for company details failed.');
  }
}