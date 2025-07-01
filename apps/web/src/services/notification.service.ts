import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { NotificationCreateData } from '@/types/apiTypes';

export class NotificationService {
  static async createNotification(data: NotificationCreateData): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          message: data.message,
          link: data.link,
        }
      });
    } catch (error) {
      console.error(`Failed to create ${data.type} notification:`, error);
      // Don't throw error as notifications are not critical
    }
  }

  static async createCompanyNotification(
    adminId: string, 
    jobTitle: string, 
    applicantName: string, 
    applicationId: string
  ): Promise<void> {
    await this.createNotification({
      userId: adminId,
      type: NotificationType.NEW_APPLICATION_RECEIVED,
      message: `New application received for ${jobTitle} from ${applicantName}`,
      link: `/company/applications/${applicationId}`,
    });
  }

  static async createUserNotification(
    userId: string, 
    jobTitle: string, 
    companyName: string, 
    applicationId: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.APPLICATION_STATUS_UPDATE,
      message: `Your application for ${jobTitle} at ${companyName} has been submitted successfully`,
      link: `/applications/${applicationId}`,
    });
  }

  static async createBatchNotifications(notifications: NotificationCreateData[]): Promise<void> {
    const promises = notifications.map(notification => 
      this.createNotification(notification)
    );
    
    await Promise.allSettled(promises);
  }
}