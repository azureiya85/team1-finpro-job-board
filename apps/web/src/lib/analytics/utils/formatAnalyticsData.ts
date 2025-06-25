import { WebsiteAnalytics } from '@prisma/client';
import { calculateMetric } from './calculateMetrics';
import { StatCardItem } from '@/types/analyticsTypes';

export function formatStatCards(current: WebsiteAnalytics, previous?: WebsiteAnalytics): StatCardItem[] {
  return [
    {
      title: 'Total Users',
      ...calculateMetric({
        current: current.totalUsers,
        previous: previous?.totalUsers || 0,
      }),
    },
    {
      title: 'New Users',
      ...calculateMetric({
        current: current.newUsers,
        previous: previous?.newUsers || 0,
      }),
    },
    {
      title: 'Active Users',
      ...calculateMetric({
        current: current.activeUsers,
        previous: previous?.activeUsers || 0,
      }),
    },
    {
      title: 'Applications',
      ...calculateMetric({
        current: current.totalApplications,
        previous: previous?.totalApplications || 0,
      }),
    },
    {
      title: 'Subscription Revenue',
      ...calculateMetric({
        current: Math.round(current.subscriptionRevenue),
        previous: Math.round(previous?.subscriptionRevenue || 0),
      }),
    },
  ];
}
