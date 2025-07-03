import { emailService } from '@/services/email.service';


// Helper function to safely send emails without breaking the main flow
export const sendEmailSafely = async (
  emailPromise: Promise<{ success: boolean; messageId: string; }>, 
  errorContext: string,
  userEmail: string
): Promise<void> => {
  try {
    const result = await emailPromise;
    console.log(`${errorContext} sent successfully to ${userEmail}:`, result.messageId);
  } catch (error) {
    console.error(`Failed to send ${errorContext} to ${userEmail}:`, error);
  }
};


// Send subscription expired email and create notification
export const sendSubscriptionExpiredNotification = async (
  user: { id: string; email: string; name: string | null; firstName: string | null },
  planName: string,
  endDate: Date
): Promise<void> => {
  const firstName = user.firstName || user.name || 'User';
  
  await sendEmailSafely(
    emailService.sendSubscriptionExpiredEmail(
      user.email,
      firstName,
      planName,
      endDate
    ),
    'subscription expired email',
    user.email
  );
};


// Send subscription expiring email and create notification
export const sendSubscriptionExpiringNotification = async (
  user: { id: string; email: string; name: string | null; firstName: string | null },
  planName: string,
  endDate: Date,
  notificationType: 'H-1' | 'H-3' | 'H-7'
): Promise<void> => {
  const firstName = user.firstName || user.name || 'User';
  
  await sendEmailSafely(
    emailService.sendSubscriptionExpiring(
      user.email,
      firstName,
      planName,
      endDate
    ),
    `${notificationType} expiry reminder email`,
    user.email
  );
};