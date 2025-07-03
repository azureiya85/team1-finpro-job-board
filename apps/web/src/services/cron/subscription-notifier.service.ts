import prisma from '@/lib/prisma';

export type NotificationType = 'SUBSCRIPTION_ENDED' | 'SUBSCRIPTION_EXPIRING';


// Create in-app notification for subscription events
export const createSubscriptionNotification = async (
  userId: string,
  type: NotificationType,
  message: string,
  link: string = '/dashboard/subscription'
): Promise<void> => {
  await prisma.notification.create({
    data: {
      userId,
      type,
      message,
      link,
    },
  });
};


// Create notification for expired subscription
export const createExpiredSubscriptionNotification = async (
  userId: string,
  planName: string
): Promise<void> => {
  await createSubscriptionNotification(
    userId,
    'SUBSCRIPTION_ENDED',
    `Your ${planName} subscription has expired. Renew now to continue accessing premium features.`
  );
};


// Create notification for expiring subscription
export const createExpiringSubscriptionNotification = async (
  userId: string,
  planName: string,
  daysUntilExpiry: number
): Promise<void> => {
  let message: string;
  
  switch (daysUntilExpiry) {
    case 1:
      message = `Your ${planName} subscription expires tomorrow. Renew now to avoid service interruption.`;
      break;
    case 3:
      message = `Your ${planName} subscription expires in 3 days. Renew now to ensure uninterrupted service.`;
      break;
    case 7:
      message = `Your ${planName} subscription expires in 7 days. Renew now to continue enjoying premium features.`;
      break;
    default:
      message = `Your ${planName} subscription expires in ${daysUntilExpiry} days. Renew now to continue enjoying premium features.`;
  }
  
  await createSubscriptionNotification(
    userId,
    'SUBSCRIPTION_EXPIRING',
    message
  );
};