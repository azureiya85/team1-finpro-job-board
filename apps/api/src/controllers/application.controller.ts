import { Request, Response } from 'express';
import { ApplicationService } from '@/services/application.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
}

export class ApplicationController {
  static async submitApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userName = req.user?.name;
      
      if (!userId) {
        res.status(401).json({ 
          error: 'Unauthorized. Please sign in to apply for jobs.' 
        });
        return;
      }

      console.log('Application submission from user:', req.user);

      const { 
        jobPostingId, 
        cvUrl, 
        expectedSalary, 
        coverLetter, 
        fullName,
        phoneNumber,
        currentLocation,
        availableStartDate,
        portfolioUrl,
        linkedinUrl
      } = req.body;

      // Check job posting validity
      const jobPosting = await ApplicationService.checkJobPosting(jobPostingId);

      // Check for existing application
      await ApplicationService.checkExistingApplication(userId, jobPostingId);

      // Update user profile
      await ApplicationService.updateUserProfile(userId, {
        userId,
        jobPostingId,
        cvUrl,
        expectedSalary,
        coverLetter,
        fullName,
        phoneNumber,
        currentLocation
      }, userName);

      // Create application
      const application = await ApplicationService.createApplication({
        userId,
        jobPostingId,
        cvUrl,
        expectedSalary,
        coverLetter,
        fullName,
        phoneNumber,
        currentLocation
      });

      // Create notifications
      await ApplicationService.createNotifications(
        jobPosting.company.adminId,
        userId,
        jobPosting.title,
        jobPosting.company.name,
        fullName,
        application.id
      );

      res.json({
        success: true,
        message: 'Application submitted successfully',
        application
      });
    } catch (error: any) {
      console.error('Application submission error:', error);
      
      // Handle known business logic errors
      if (error.message.includes('not found') || 
          error.message.includes('no longer active') ||
          error.message.includes('deadline has passed') ||
          error.message.includes('already applied')) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: 'Failed to submit application. Please try again.'
      });
    }
  }

  static async getApplicationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { jobPostingId } = req.query;

      if (!jobPostingId || typeof jobPostingId !== 'string') {
        res.status(400).json({ error: 'Job posting ID is required' });
        return;
      }

      const result = await ApplicationService.getApplicationStatus(userId, jobPostingId);
      res.json(result);
    } catch (error) {
      console.error('Check application error:', error);
      res.status(500).json({
        error: 'Failed to check application status'
      });
    }
  }
}