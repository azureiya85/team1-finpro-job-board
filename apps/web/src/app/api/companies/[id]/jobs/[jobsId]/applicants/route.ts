import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { buildFilterQuery, calculateAge } from '@/lib/applicants/applicationStatsHelper';
import { searchParamsToFilters, validateFilters } from '@/lib/applicants/filterValidationHelper';
import type {
  RouteAndPaginationFilters,
  JobApplicationDetails,
  SubscriptionPlanFeatures, 
} from '@/types/applicants';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: { id: string, jobsId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await context.params;
    const { id: companyIdFromPath, jobsId: jobIdFromPath } = resolvedParams;
    const { searchParams } = new URL(request.url);

    const baseClientFilters = searchParamsToFilters(searchParams);

    const routeFilters: Omit<RouteAndPaginationFilters, 'jobPostingId'> & { page?: number; limit?: number } = {
      ...baseClientFilters,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
    };

    const { isValid, errors: validationErrors } = validateFilters(routeFilters);
    if (!isValid) {
      return NextResponse.json({
        message: "Invalid filter parameters",
        errors: validationErrors
      }, { status: 400 });
    }

    const company = await prisma.company.findFirst({
      where: { id: companyIdFromPath, adminId: session.user.id },
    });
    if (!company) {
      return NextResponse.json({ error: 'Company not found or unauthorized for this company' }, { status: 404 });
    }

    const jobPosting = await prisma.jobPosting.findUnique({
        where: { id: jobIdFromPath },
        select: { companyId: true }
    });
   if (!jobPosting || jobPosting.companyId !== companyIdFromPath) {
        return NextResponse.json({ error: 'Job posting not found or does not belong to this company.' }, { status: 404 });
    }

    const { where: dynamicWhereFromHelper, orderBy: orderByFromHelper } = buildFilterQuery(routeFilters);

    const finalWhereClause: Prisma.JobApplicationWhereInput = {
      jobPostingId: jobIdFromPath,
      ...dynamicWhereFromHelper,
    };

    const skip = (routeFilters.page! - 1) * routeFilters.limit!;
    const take = routeFilters.limit!;

    const applications = await prisma.jobApplication.findMany({
      where: finalWhereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
            dateOfBirth: true,
            lastEducation: true,
            phoneNumber: true,
            currentAddress: true,
            province: { select: { name: true } },
            city: { select: { name: true } },
            subscriptions: {
              where: {
                status: 'ACTIVE',
                endDate: { gt: new Date() }
              },
              include: {
                plan: {
                  select: {
                    name: true,
                    features: true
                  }
                }
              }
            }
          },
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            salaryMin: true,
            salaryMax: true,
            preSelectionTest: {
              select: { id: true }
            }
          },
        },
        testResult: {
          select: {
            score: true,
            passed: true
          }
        },
        interviewSchedules: {
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            interviewType: true,
            duration: true,
            location: true,
            notes: true,
          },
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
      },
      orderBy: orderByFromHelper,
      skip,
      take,
    });

    const totalCount = await prisma.jobApplication.count({
      where: finalWhereClause,
    });

    const transformedApplications: (JobApplicationDetails & { isPriority: boolean })[] = applications.map((app) => {
      const user = app.user;
      const age = user.dateOfBirth ? calculateAge(new Date(user.dateOfBirth)) : null;
      const location = [user.city?.name, user.province?.name].filter(Boolean).join(', ');

      const hasPriority = user.subscriptions.some(sub => {
        const features = sub.plan.features as SubscriptionPlanFeatures;
        return sub.plan.name === 'PROFESSIONAL' && features?.priorityCvReview === true;
      });

      return {
        id: app.id,
        status: app.status,
        expectedSalary: app.expectedSalary,
        coverLetter: app.coverLetter,
        cvUrl: app.cvUrl,
        rejectionReason: app.rejectionReason,
        adminNotes: app.adminNotes,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        reviewedAt: app.reviewedAt,
        jobPosting: app.jobPosting,
        latestInterview: app.interviewSchedules.length > 0 ? app.interviewSchedules[0] : null,
        testResult: app.testResult ? {
          score: Math.round(app.testResult.score),
          passed: app.testResult.passed
        } : null,
        applicant: {
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage,
          age,
          education: user.lastEducation,
          phoneNumber: user.phoneNumber,
          location,
          currentAddress: user.currentAddress,
        },
        isPriority: hasPriority,
      };
    });

    const sortedApplications = transformedApplications.sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return 0;
    });

    const response = {
      applications: sortedApplications,
      pagination: {
        page: routeFilters.page,
        limit: routeFilters.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / routeFilters.limit!),
        hasNext: routeFilters.page! * routeFilters.limit! < totalCount,
        hasPrev: routeFilters.page! > 1,
      },
      appliedFilters: routeFilters,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching applicants for job:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}