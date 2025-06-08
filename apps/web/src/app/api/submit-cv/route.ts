import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';
import { submitCVSchema } from '@/lib/validations/zodApplicationValidation';

// Define the user update type 
interface UserUpdateData {
  phoneNumber?: string;
  currentAddress?: string;  
  name?: string;
  fullName?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to apply for jobs.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request data using the shared schema
    const validationResult = submitCVSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid data provided',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { 
      jobPostingId, 
      cvUrl, 
      expectedSalary, 
      coverLetter, 
      fullName,
      phoneNumber,
      currentLocation,  
    } = validationResult.data;

    // Check if job posting exists and is active
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            adminId: true, 
          }
        }
      }
    });

    if (!jobPosting) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    if (!jobPosting.isActive) {
      return NextResponse.json(
        { error: 'This job posting is no longer active' },
        { status: 400 }
      );
    }

    // Check application deadline
    if (jobPosting.applicationDeadline && new Date() > jobPosting.applicationDeadline) {
      return NextResponse.json(
        { error: 'Application deadline has passed' },
        { status: 400 }
      );
    }

    // Check if user has already applied for this job
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        userId_jobPostingId: {
          userId: session.user.id,
          jobPostingId: jobPostingId
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this position' },
        { status: 400 }
      );
    }

    // Update user profile with application info
    const userUpdateData: UserUpdateData = {};
    
    if (phoneNumber) {
      userUpdateData.phoneNumber = phoneNumber;
    }
    
    if (currentLocation) {
      userUpdateData.currentAddress = currentLocation;
    }
    
    // Update name if not set
    if ((!session.user.name || session.user.name.trim() === '') && fullName) {
      userUpdateData.name = fullName;
    }

    // Only update if there's data to update
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdateData
      });
    }

    // Create job application
    const jobApplication = await prisma.jobApplication.create({
      data: {
        userId: session.user.id,
        jobPostingId: jobPostingId,
        cvUrl: cvUrl,
        expectedSalary: expectedSalary,
        coverLetter: coverLetter,
        status: ApplicationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            currentAddress: true,
          }
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    // Create notification for company admin
    try {
      await prisma.notification.create({
        data: {
          userId: jobPosting.company.adminId,
          type: 'NEW_APPLICATION_RECEIVED',
          message: `New application received for ${jobPosting.title} from ${fullName}`,
          link: `/company/applications/${jobApplication.id}`,
        }
      });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    // Create notification for user
    try {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'APPLICATION_STATUS_UPDATE',
          message: `Your application for ${jobPosting.title} at ${jobPosting.company.name} has been submitted successfully`,
          link: `/applications/${jobApplication.id}`,
        }
      });
    } catch (notificationError) {
      console.error('Failed to create user notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: jobApplication.id,
        status: jobApplication.status,
        submittedAt: jobApplication.createdAt,
        jobTitle: jobApplication.jobPosting.title,
        companyName: jobApplication.jobPosting.company.name,
      }
    });

  } catch (error) {
    console.error('CV submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobPostingId = searchParams.get('jobPostingId');

    if (!jobPostingId) {
      return NextResponse.json(
        { error: 'Job posting ID is required' },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.findUnique({
      where: {
        userId_jobPostingId: {
          userId: session.user.id,
          jobPostingId: jobPostingId
        }
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      hasApplied: !!application,
      application: application || null
    });

  } catch (error) {
    console.error('Check application error:', error);
    return NextResponse.json(
      { error: 'Failed to check application status' },
      { status: 500 }
    );
  }
}