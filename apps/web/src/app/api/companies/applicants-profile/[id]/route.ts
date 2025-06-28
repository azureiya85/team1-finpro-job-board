import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole, JobApplication, JobPosting, Company, EmploymentStatus } from '@prisma/client';

type JobApplicationWithRelations = JobApplication & {
  jobPosting: JobPosting & {
    company: Company;
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' }, 
        { status: 401 }
      );
    }

    // Check if user is company admin
    if (session.user.role !== UserRole.COMPANY_ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden - Company admin access required' }, 
        { status: 403 }
      );
    }

    // Get applicant ID from query parameters
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('id');

    if (!applicantId) {
      return NextResponse.json(
        { error: 'Bad Request - Applicant ID is required' }, 
        { status: 400 }
      );
    }

    // Get company for the current admin
    const company = await prisma.company.findUnique({
      where: { adminId: session.user.id },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Forbidden - No company found for admin' }, 
        { status: 403 }
      );
    }

    // Fetch the applicant's profile
    const profileUserFromDb = await prisma.user.findUnique({
      where: { id: applicantId },
      include: {
        workExperiences: {
          include: {
            company: {
              select: { name: true }
            }
          },
          orderBy: { startDate: 'desc' },
        },
        certificates: {
          include: {
            userAssessment: {
              include: {
                assessment: {
                  select: { title: true }
                }
              }
            }
          },
          orderBy: { issueDate: 'desc' },
        },
        skillAssessments: {
          include: {
            assessment: {
              select: {
                title: true,
              },
            },
          },
        },
        province: true,
        city: true,
        jobApplications: {
          include: {
            jobPosting: {
              include: {
                company: true,
              },
            },
          },
          where: {
            jobPosting: {
              companyId: company.id
            }
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profileUserFromDb) {
      return NextResponse.json(
        { error: 'Not Found - Applicant profile not found' }, 
        { status: 404 }
      );
    }

    // Check if the applicant has applied to this company
    const jobApplications = profileUserFromDb.jobApplications as JobApplicationWithRelations[];
    
    if (!jobApplications || jobApplications.length === 0) {
      return NextResponse.json(
        { error: 'Forbidden - Applicant has not applied to your company' }, 
        { status: 403 }
      );
    }

    // Transform the user object to match the ProfileUser type expected by the component
    const profileUserForView = {
      ...profileUserFromDb,
      workExperiences: profileUserFromDb.workExperiences.map(exp => ({
        id: exp.id,
        jobTitle: exp.jobTitle,
        companyName: exp.company.name,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrentJob: exp.employmentStatus === EmploymentStatus.CURRENT_EMPLOYEE || !exp.endDate,
        description: null, 
      })),
      certificates: profileUserFromDb.certificates.map(cert => ({
        id: cert.id,
        name: cert.title,
        issuer: cert.userAssessment.assessment.title,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        credentialId: cert.certificateCode,
      })),
      jobApplications: jobApplications.map(app => ({
        id: app.id,
        createdAt: app.createdAt,
        status: app.status,
        jobPosting: {
          title: app.jobPosting.title,
          company: {
            name: app.jobPosting.company.name,
          },
        },
      })),
    };

    return NextResponse.json({
      success: true,
      data: {
        user: profileUserForView,
        viewerRole: session.user.role
      }
    });

  } catch (error) {
    console.error('Error fetching applicant profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error - Failed to fetch applicant profile' }, 
      { status: 500 }
    );
  }
}