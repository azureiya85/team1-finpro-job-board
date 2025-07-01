// apps/web/src/app/api/submit-cv/route.ts
import { NextRequest } from 'next/server';
import { JobApplicationService } from '@/services/jobApplication.service';
import { NotificationService } from '@/services/notification.service';
import { ApiResponse } from '@/lib/apiResponse';
import { AuthMiddleware } from '@/lib/auth.middleware';

export async function POST(request: NextRequest) {
  try {
    return await AuthMiddleware.withAuth(async (user) => {
      const body = await request.json();
      
      // Validate request data
      const validatedData = await JobApplicationService.validateApplicationData(body);
      
      const { 
        jobPostingId, 
        cvUrl, 
        expectedSalary, 
        coverLetter, 
        fullName,
        phoneNumber,
        currentLocation,  
      } = validatedData;

      // Find and validate job posting
      const jobPosting = await JobApplicationService.findJobPosting(jobPostingId);
      JobApplicationService.validateJobPosting(jobPosting);

      // Check for existing application
      await JobApplicationService.checkExistingApplication(user.id, jobPostingId);

      // Update user profile if needed
      const userUpdateData = JobApplicationService.buildUserUpdateData(
        user.name ?? null, 
        fullName, 
        phoneNumber, 
        currentLocation
      );
      
      await JobApplicationService.updateUserProfile(user.id, userUpdateData);

      // Create job application
      const jobApplication = await JobApplicationService.createApplication({
        userId: user.id,
        jobPostingId,
        cvUrl,
        expectedSalary,
        coverLetter,
        fullName,
        phoneNumber,
        currentLocation,
      });

      // Create notifications (non-blocking)
      const notificationPromises = [
        NotificationService.createCompanyNotification(
          jobPosting!.company.adminId,
          jobPosting!.title,
          fullName,
          jobApplication.id
        ),
        NotificationService.createUserNotification(
          user.id,
          jobPosting!.title,
          jobPosting!.company.name,
          jobApplication.id
        )
      ];

      // Don't await notifications to avoid blocking the response
      Promise.allSettled(notificationPromises);

      const response = {
        success: true,
        message: 'Application submitted successfully',
        application: JobApplicationService.formatApplicationResponse(jobApplication)
      };

      return ApiResponse.success(response);
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return ApiResponse.unauthorized('Please sign in to apply for jobs.');
    }
    return ApiResponse.handleError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    return await AuthMiddleware.withAuth(async (user) => {
      const { searchParams } = new URL(request.url);
      const jobPostingId = searchParams.get('jobPostingId');

      if (!jobPostingId) {
        return ApiResponse.badRequest('Job posting ID is required');
      }

      const application = await JobApplicationService.getApplicationStatus(
        user.id, 
        jobPostingId
      );

      return ApiResponse.success({
        hasApplied: !!application,
        application: application || null
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return ApiResponse.unauthorized();
    }
    return ApiResponse.handleError(error);
  }
}