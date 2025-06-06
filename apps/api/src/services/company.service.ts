import { PrismaClient } from '@prisma/client';
import { 
  CompanyWithStats, 
  UpdateCompanyData, 
  CompanyAuthResult, 
  AuthUser 
} from '@/types/company';

const prisma = new PrismaClient();

export class CompanyService {
  static async getCompanyById(id: string): Promise<CompanyWithStats | null> {
    try {
      const company = await prisma.company.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          banner: true, 
          website: true,
          logo: true,
          industry: true,
          size: true,
          foundedYear: true,
          email: true,
          phone: true,
          address: true,
          latitude: true,
          longitude: true,
          provinceId: true,
          cityId: true,
          country: true,
          linkedinUrl: true,
          facebookUrl: true,
          twitterUrl: true,
          instagramUrl: true,
          adminId: true,
          createdAt: true,
          updatedAt: true,
          // Relations
          province: { 
            select: { id: true, name: true, code: true } 
          },
          city: { 
            select: { id: true, name: true, type: true } 
          },
          admin: { 
            select: { id: true, name: true, email: true, profileImage: true } 
          },
          _count: {
            select: {
              jobPostings: { where: { isActive: true } },
              companyReviews: true,
            }
          }
        },
      });

      if (!company) {
        return null;
      }

      // Get review statistics
      const reviewStats = await prisma.companyReview.aggregate({
        where: { companyId: id },
        _avg: {
          rating: true,
          cultureRating: true,
          workLifeBalance: true,
          facilitiesRating: true,
          careerRating: true,
        },
      });

      // Combine company data with stats
      const companyWithStats: CompanyWithStats = {
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
          }
        }
      };

      return companyWithStats;
    } catch (error) {
      console.error('Error in getCompanyById:', error);
      throw error;
    }
  }

  static async updateCompany(
    id: string, 
    updateData: UpdateCompanyData, 
    userId: string
  ): Promise<Omit<CompanyWithStats, 'stats'>> {
    try {
      // Check if company exists and user is authorized
      const existingCompany = await prisma.company.findUnique({
        where: { id },
        select: { id: true, adminId: true }
      });

      if (!existingCompany) {
        throw new Error('Company not found');
      }

      if (existingCompany.adminId !== userId) {
        throw new Error('Unauthorized. You can only update your own company.');
      }

      // Process data - convert empty strings to null
      const processedData: Record<string, string | number | null> = {};
      
      for (const [key, value] of Object.entries(updateData)) {
        processedData[key] = value === '' ? null : value;
      }

      // Update the company
      const updatedCompany = await prisma.company.update({
        where: { id },
        data: {
          ...processedData,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          description: true,
          banner: true,
          website: true,
          logo: true,
          industry: true,
          size: true,
          foundedYear: true,
          email: true,
          phone: true,
          address: true,
          latitude: true,
          longitude: true,
          provinceId: true,
          cityId: true,
          country: true,
          linkedinUrl: true,
          facebookUrl: true,
          twitterUrl: true,
          instagramUrl: true,
          adminId: true,
          createdAt: true,
          updatedAt: true,
          province: { 
            select: { id: true, name: true, code: true } 
          },
          city: { 
            select: { id: true, name: true, type: true } 
          },
          admin: { 
            select: { id: true, name: true, email: true, profileImage: true } 
          },
        },
      });

      return updatedCompany;
    } catch (error) {
      console.error('Error in updateCompany:', error);
      throw error;
    }
  }

  static async validateCompanyAccess(
    companyId: string, 
    user: AuthUser | undefined
  ): Promise<CompanyAuthResult> {
    try {
      if (!user) {
        return {
          isAuthenticated: false,
          isCompanyAdmin: false,
          isOwner: false,
          user: null,
          error: 'Not authenticated'
        };
      }

      // Check if the company exists
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          adminId: true,
          admin: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      });

      if (!company) {
        return {
          isAuthenticated: true,
          isCompanyAdmin: false,
          isOwner: false,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          error: 'Company not found'
        };
      }

      // Check if the current user is the company admin (owner)
      const isOwner = company.adminId === user.id;
      const isCompanyAdmin = user.role === 'COMPANY_ADMIN' && isOwner;

      return {
        isAuthenticated: true,
        isCompanyAdmin,
        isOwner,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error validating company access:', error);
      return {
        isAuthenticated: false,
        isCompanyAdmin: false,
        isOwner: false,
        user: null,
        error: 'Server error during validation'
      };
    }
  }
}